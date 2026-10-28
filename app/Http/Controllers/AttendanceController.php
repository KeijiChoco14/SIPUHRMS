<?php

namespace App\Http\Controllers;

use App\Http\Requests\ClockInRequest;
use App\Http\Requests\ClockOutRequest;
use App\Http\Requests\CorrectAttendanceRequest;
use App\Http\Requests\UpdateAttendanceLocationRequest;
use App\Models\Attendance;
use App\Models\AttendanceEvent;
use App\Models\AttendanceLocation;
use App\Models\Department;
use App\Models\Employee;
use App\Models\Shift;
use App\Models\WorkSchedule;
use App\Services\AttendanceService;
use Carbon\Carbon;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Response;
use Inertia\Inertia;
use Symfony\Component\HttpFoundation\StreamedResponse;

class AttendanceController extends Controller
{
    public function __construct(
        protected AttendanceService $attendanceService
    ) {}

    /**
     * For Employee to view their own attendance, live geofencing widget, and clock in/out.
     */
    public function myAttendance(Request $request)
    {
        $user = Auth::user();
        $employee = $user->employee ?? $user->ensureEmployeeProfile();

        if (!$employee) {
            abort(403, 'Your account is not linked to an active employee record.');
        }

        $now = $this->attendanceService->now();
        $month = $request->query('month', $now->format('Y-m'));

        // Geofencing configuration
        $location = AttendanceLocation::getDefaultLocation();

        // Resolve current shift context (normal or overnight)
        $shiftContext = $this->attendanceService->resolveCurrentShiftContext($employee, $now);

        // Fetch today's attendance record (or unclosed overnight attendance)
        $todayAttendance = Attendance::with(['shift', 'location', 'events'])
            ->where('employee_id', $employee->id)
            ->where(function ($q) use ($shiftContext, $now) {
                $q->whereDate('date', $shiftContext['work_date'])
                  ->orWhereDate('date', $now->format('Y-m-d'));
            })
            ->latest('date')
            ->first();

        // Monthly Attendance History
        $attendances = Attendance::with(['shift', 'location'])
            ->where('employee_id', $employee->id)
            ->where('date', 'like', "{$month}%")
            ->orderBy('date', 'desc')
            ->get();

        return Inertia::render('Attendance/MyAttendance', [
            'attendances' => $attendances,
            'selectedMonth' => $month,
            'todayAttendance' => $todayAttendance,
            'serverTime' => $now->toIso8601String(),
            'serverTimeString' => $now->format('Y-m-d H:i:s'),
            'location' => [
                'name' => $location->name,
                'latitude' => (float) $location->latitude,
                'longitude' => (float) $location->longitude,
                'radius_meters' => (int) $location->radius_meters,
                'min_accuracy_meters' => (int) $location->min_accuracy_meters,
                'is_active' => (bool) $location->is_active,
            ],
            'shiftContext' => [
                'shift' => $shiftContext['shift'],
                'work_date' => $shiftContext['work_date'],
                'can_clock_in' => $shiftContext['can_clock_in'],
                'can_clock_out' => $shiftContext['can_clock_out'],
                'clock_in_window_start' => $shiftContext['clock_in_window_start']?->format('H:i'),
                'clock_in_window_end' => $shiftContext['clock_in_window_end']?->format('H:i'),
                'clock_out_window_start' => $shiftContext['clock_out_window_start']?->format('H:i'),
                'clock_out_window_end' => $shiftContext['clock_out_window_end']?->format('H:i'),
                'reason' => $shiftContext['reason'],
            ],
        ]);
    }

    /**
     * Handle Clock In action from employee with GPS location.
     */
    public function clockIn(ClockInRequest $request)
    {
        $user = Auth::user();
        $employee = $user->employee ?? $user->ensureEmployeeProfile();

        if (!$employee) {
            abort(403, 'Employee profile required for clock-in.');
        }

        try {
            $attendance = $this->attendanceService->clockIn(
                employee: $employee,
                user: $user,
                latitude: (float) $request->latitude,
                longitude: (float) $request->longitude,
                accuracy: $request->accuracy ? (float) $request->accuracy : null,
                notes: $request->notes,
                ipAddress: $request->ip(),
                userAgent: $request->userAgent()
            );

            $statusText = $attendance->is_late ? "Late ({$attendance->late_duration_minutes}m)" : "On-Time (Present)";
            return back()->with('success', "Clock in recorded successfully at {$attendance->clock_in} WIB. Punctuality status: {$statusText}.");
        } catch (\Throwable $e) {
            return back()->withErrors(['message' => $e->getMessage()]);
        }
    }

    /**
     * Handle Clock Out action from employee with GPS location.
     */
    public function clockOut(ClockOutRequest $request)
    {
        $user = Auth::user();
        $employee = $user->employee ?? $user->ensureEmployeeProfile();

        if (!$employee) {
            abort(403, 'Employee profile required for clock-out.');
        }

        try {
            $attendance = $this->attendanceService->clockOut(
                employee: $employee,
                user: $user,
                latitude: (float) $request->latitude,
                longitude: (float) $request->longitude,
                accuracy: $request->accuracy ? (float) $request->accuracy : null,
                notes: $request->notes,
                ipAddress: $request->ip(),
                userAgent: $request->userAgent()
            );

            return back()->with('success', "Clock out recorded successfully at {$attendance->clock_out} WIB.");
        } catch (\Throwable $e) {
            return back()->withErrors(['message' => $e->getMessage()]);
        }
    }

    /**
     * For HR/Admin to view all attendance logs, filter, and inspect audit records.
     */
    public function index(Request $request)
    {
        $startDate = $request->query('start_date', $request->query('date', date('Y-m-d')));
        $endDate = $request->query('end_date', $startDate);

        $query = Attendance::with([
            'employee.user',
            'employee.department',
            'shift',
            'location',
            'correctedByUser',
            'events' => fn($q) => $q->latest('created_at')->take(10),
        ])
        ->whereDate('date', '>=', $startDate)
        ->whereDate('date', '<=', $endDate);

        if ($deptId = $request->query('department_id')) {
            $query->whereHas('employee', fn($q) => $q->where('department_id', $deptId));
        }

        if ($empId = $request->query('employee_id')) {
            $query->where('employee_id', $empId);
        }

        if ($shiftId = $request->query('shift_id')) {
            $query->where('shift_id', $shiftId);
        }

        if ($status = $request->query('status')) {
            $query->where('status', $status);
        }

        if ($search = $request->query('search')) {
            $query->where(function ($sub) use ($search) {
                $sub->whereHas('employee.user', fn($q) => $q->where('name', 'like', "%{$search}%"))
                    ->orWhereHas('employee', fn($q) => $q->where('employee_number', 'like', "%{$search}%"));
            });
        }

        $attendances = $query->orderBy('date', 'desc')->orderBy('clock_in', 'desc')->get();

        // Aggregation metrics for the selected date range
        $totalScheduled = WorkSchedule::whereDate('date', '>=', $startDate)->whereDate('date', '<=', $endDate)->count();
        $totalClockedIn = Attendance::whereDate('date', '>=', $startDate)->whereDate('date', '<=', $endDate)->whereNotNull('clock_in')->count();
        $totalLate = Attendance::whereDate('date', '>=', $startDate)->whereDate('date', '<=', $endDate)->where('is_late', true)->count();
        $totalUnclosed = Attendance::whereDate('date', '>=', $startDate)->whereDate('date', '<=', $endDate)->whereNotNull('clock_in')->whereNull('clock_out')->count();

        $departments = Department::select('id', 'name')->orderBy('name')->get();
        $shifts = Shift::select('id', 'name', 'code', 'start_time', 'end_time', 'color')->get();
        $employees = Employee::with('user:id,name')->where('employment_status', 'Active')->get(['id', 'user_id', 'employee_number']);
        $location = AttendanceLocation::getDefaultLocation();

        return Inertia::render('Attendance/Index', [
            'attendances' => $attendances,
            'selectedDate' => $startDate,
            'startDate' => $startDate,
            'endDate' => $endDate,
            'filters' => [
                'department_id' => $request->query('department_id'),
                'employee_id' => $request->query('employee_id'),
                'shift_id' => $request->query('shift_id'),
                'status' => $request->query('status'),
                'search' => $request->query('search'),
            ],
            'summary' => [
                'total_scheduled' => $totalScheduled,
                'total_clocked_in' => $totalClockedIn,
                'total_late' => $totalLate,
                'total_unclosed' => $totalUnclosed,
            ],
            'departments' => $departments,
            'shifts' => $shifts,
            'employees' => $employees,
            'location' => $location,
        ]);
    }

    /**
     * Manual correction by HRD/Admin with mandatory audit reason.
     */
    public function correct(CorrectAttendanceRequest $request, Attendance $attendance)
    {
        $oldData = $attendance->only(['clock_in', 'clock_out', 'status', 'late_duration_minutes', 'overtime_minutes']);

        $attendance->update([
            'clock_in' => $request->clock_in ? "{$request->clock_in}:00" : null,
            'clock_out' => $request->clock_out ? "{$request->clock_out}:00" : null,
            'status' => $request->status,
            'late_duration_minutes' => $request->late_duration_minutes ?? 0,
            'is_late' => ($request->status === 'Late' || ($request->late_duration_minutes ?? 0) > 0),
            'overtime_minutes' => $request->overtime_minutes ?? 0,
            'correction_reason' => $request->correction_reason,
            'corrected_by' => Auth::id(),
            'corrected_at' => now(),
            'source' => 'Manual Correction HRD',
        ]);

        AttendanceEvent::create([
            'attendance_id' => $attendance->id,
            'employee_id' => $attendance->employee_id,
            'user_id' => Auth::id(),
            'shift_id' => $attendance->shift_id,
            'event_type' => 'manual_correction',
            'status' => 'success',
            'reason' => 'admin_correction',
            'notes' => "HR Correction by " . Auth::user()->name . ". Reason: " . $request->correction_reason . ". Old values: " . json_encode($oldData),
            'ip_address' => $request->ip(),
            'user_agent' => $request->userAgent(),
            'created_at' => now(),
        ]);

        return back()->with('success', 'Attendance record corrected and audited successfully.');
    }

    /**
     * Update hotel attendance location and geofencing radius.
     */
    public function updateLocation(UpdateAttendanceLocationRequest $request)
    {
        $location = AttendanceLocation::getDefaultLocation();

        $location->update([
            'name' => $request->name,
            'latitude' => $request->latitude,
            'longitude' => $request->longitude,
            'radius_meters' => $request->radius_meters,
            'min_accuracy_meters' => $request->min_accuracy_meters,
            'is_active' => $request->is_active,
            'updated_by' => Auth::id(),
        ]);

        return back()->with('success', 'Hotel geofencing configuration updated successfully.');
    }

    /**
     * Export filtered attendance records to CSV with formula injection sanitization.
     */
    public function export(Request $request): StreamedResponse
    {
        $this->authorizeAccess();

        $startDate = $request->query('start_date', date('Y-m-d'));
        $endDate = $request->query('end_date', $startDate);

        $query = Attendance::with(['employee.user', 'employee.department', 'shift', 'location'])
            ->whereDate('date', '>=', $startDate)
            ->whereDate('date', '<=', $endDate);

        if ($deptId = $request->query('department_id')) {
            $query->whereHas('employee', fn($q) => $q->where('department_id', $deptId));
        }

        if ($status = $request->query('status')) {
            $query->where('status', $status);
        }

        $records = $query->orderBy('date', 'desc')->get();

        $filename = "attendance_report_{$startDate}_to_{$endDate}.csv";

        return Response::stream(function () use ($records) {
            $handle = fopen('php://output', 'w');
            // Write BOM for Excel UTF-8
            fprintf($handle, chr(0xEF).chr(0xBB).chr(0xBF));

            fputcsv($handle, [
                'Date',
                'Employee Number',
                'Employee Name',
                'Department',
                'Shift',
                'Clock In',
                'Clock Out',
                'Status',
                'Late (Minutes)',
                'Distance to Hotel (Meters)',
                'Source',
                'Notes',
            ]);

            foreach ($records as $row) {
                fputcsv($handle, [
                    $row->date?->format('Y-m-d') ?? $row->date,
                    $this->sanitizeCsvValue($row->employee?->employee_number ?? '-'),
                    $this->sanitizeCsvValue($row->employee?->user?->name ?? '-'),
                    $this->sanitizeCsvValue($row->employee?->department?->name ?? '-'),
                    $this->sanitizeCsvValue($row->shift?->name ?? 'Default Shift'),
                    $row->clock_in ? substr($row->clock_in, 0, 5) : '-',
                    $row->clock_out ? substr($row->clock_out, 0, 5) : '-',
                    $row->status,
                    $row->late_duration_minutes ?? 0,
                    $row->clock_in_distance ? "{$row->clock_in_distance}m" : '-',
                    $row->source,
                    $this->sanitizeCsvValue($row->notes ?? '-'),
                ]);
            }

            fclose($handle);
        }, 200, [
            'Content-Type' => 'text/csv; charset=UTF-8',
            'Content-Disposition' => "attachment; filename=\"{$filename}\"",
        ]);
    }

    /**
     * For manual sync simulation API (existing backward compatibility).
     */
    public function sync(Request $request)
    {
        $syncKey = config('services.attendance.sync_key');
        $providedKey = $request->header('X-Attendance-Api-Key')
            ?? $request->bearerToken()
            ?? $request->input('api_key');

        $isAuthorizedKey = !empty($syncKey) && hash_equals((string) $syncKey, (string) $providedKey);
        $isAuthorizedUser = Auth::check() && Auth::user()->hasAnyRole(['Super Admin', 'HRD / Admin', 'General Manager']);

        if (!$isAuthorizedKey && !$isAuthorizedUser) {
            abort(401, 'Unauthorized: Invalid or missing attendance synchronization API credentials.');
        }

        $validated = $request->validate([
            'employee_id' => 'required|exists:employees,id',
            'date' => 'required|date',
            'clock_in' => 'nullable|date_format:H:i',
            'clock_out' => 'nullable|date_format:H:i',
            'status' => 'required|string|max:50',
            'late_duration_minutes' => 'nullable|integer|min:0|max:1440',
            'overtime_minutes' => 'nullable|integer|min:0|max:1440',
        ]);

        Attendance::updateOrCreate(
            ['employee_id' => $validated['employee_id'], 'date' => $validated['date']],
            [
                'clock_in' => $validated['clock_in'] ?? null,
                'clock_out' => $validated['clock_out'] ?? null,
                'status' => $validated['status'],
                'late_duration_minutes' => $validated['late_duration_minutes'] ?? 0,
                'overtime_minutes' => $validated['overtime_minutes'] ?? 0,
                'source' => 'API Sync',
            ]
        );

        return response()->json(['message' => 'Attendance synced successfully']);
    }

    /**
     * Prevent CSV Formula Injection vulnerability (=, +, -, @).
     */
    protected function sanitizeCsvValue(?string $value): string
    {
        if ($value === null || $value === '') {
            return '';
        }

        $firstChar = substr($value, 0, 1);
        if (in_array($firstChar, ['=', '+', '-', '@', "\t", "\r"])) {
            return "'" . $value;
        }

        return $value;
    }

    protected function authorizeAccess(): void
    {
        if (!Auth::check() || !Auth::user()->hasAnyRole(['Super Admin', 'HRD / Admin', 'General Manager'])) {
            abort(403, 'Unauthorized access to HR attendance management.');
        }
    }
}
