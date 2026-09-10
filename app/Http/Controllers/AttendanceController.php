<?php

namespace App\Http\Controllers;

use App\Models\Attendance;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;

class AttendanceController extends Controller
{
    // For HR/Admin to view all attendances
    public function index(Request $request)
    {
        $date = $request->query('date', date('Y-m-d'));
        $attendances = Attendance::with(['employee.user', 'employee.department'])
            ->whereDate('date', $date)
            ->get();

        return Inertia::render('Attendance/Index', [
            'attendances' => $attendances,
            'selectedDate' => $date,
        ]);
    }

    // For Employee to view their own attendance
    public function myAttendance(Request $request)
    {
        $user = Auth::user();
        if (! $user->employee) {
            abort(403, 'User is not an employee.');
        }

        $month = $request->query('month', date('Y-m'));

        $attendances = Attendance::where('employee_id', $user->employee->id)
            ->where('date', 'like', $month.'%')
            ->orderBy('date', 'desc')
            ->get();

        return Inertia::render('Attendance/MyAttendance', [
            'attendances' => $attendances,
            'selectedMonth' => $month,
        ]);
    }

    // For manual sync simulation API
    public function sync(Request $request)
    {
        $validated = $request->validate([
            'employee_id' => 'required|exists:employees,id',
            'date' => 'required|date',
            'clock_in' => 'nullable|date_format:H:i',
            'clock_out' => 'nullable|date_format:H:i',
            'status' => 'required|string',
            'late_duration_minutes' => 'integer',
            'overtime_minutes' => 'integer',
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
}
