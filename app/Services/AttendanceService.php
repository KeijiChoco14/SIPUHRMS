<?php

namespace App\Services;

use App\Models\Attendance;
use App\Models\AttendanceEvent;
use App\Models\AttendanceLocation;
use App\Models\Employee;
use App\Models\Shift;
use App\Models\User;
use App\Models\WorkSchedule;
use Carbon\Carbon;
use Illuminate\Support\Facades\DB;
use InvalidArgumentException;
use RuntimeException;

class AttendanceService
{
    public function __construct(
        protected GeofencingService $geofencingService
    ) {}

    /**
     * Get the operational timezone.
     */
    public function getTimezone(): string
    {
        return 'Asia/Jakarta';
    }

    /**
     * Get the current time in the operational timezone.
     */
    public function now(): Carbon
    {
        return Carbon::now($this->getTimezone());
    }

    /**
     * Find the applicable shift and schedule for an employee at a given moment.
     * Handles normal shifts and overnight shifts crossing midnight.
     *
     * @param Employee $employee
     * @param Carbon|null $now
     * @return array{
     *     shift: Shift|null,
     *     schedule: WorkSchedule|null,
     *     work_date: string,
     *     can_clock_in: bool,
     *     can_clock_out: bool,
     *     clock_in_window_start: Carbon|null,
     *     clock_in_window_end: Carbon|null,
     *     clock_out_window_start: Carbon|null,
     *     clock_out_window_end: Carbon|null,
     *     reason: string|null
     * }
     */
    public function resolveCurrentShiftContext(Employee $employee, ?Carbon $now = null): array
    {
        $now = $now ? $now->copy()->setTimezone($this->getTimezone()) : $this->now();
        $todayStr = $now->format('Y-m-d');
        $yesterdayStr = $now->copy()->subDay()->format('Y-m-d');

        // 1. Check if there is an ongoing unclosed attendance for yesterday (e.g. overnight shift)
        $yesterdayAttendance = Attendance::with('shift')
            ->where('employee_id', $employee->id)
            ->whereDate('date', $yesterdayStr)
            ->whereNotNull('clock_in')
            ->whereNull('clock_out')
            ->first();

        if ($yesterdayAttendance && $yesterdayAttendance->shift) {
            $shift = $yesterdayAttendance->shift;
            $windows = $this->calculateShiftWindows($shift, Carbon::parse($yesterdayStr, $this->getTimezone()));

            // If we are currently inside or near the clock-out window for yesterday's overnight shift
            if ($now->between($windows['clock_out_window_start'], $windows['clock_out_window_end']) || $now->gte($windows['clock_out_window_start'])) {
                return [
                    'shift' => $shift,
                    'schedule' => $yesterdayAttendance->workSchedule,
                    'work_date' => $yesterdayStr,
                    'can_clock_in' => false,
                    'can_clock_out' => $now->between($windows['clock_out_window_start'], $windows['clock_out_window_end']),
                    'clock_in_window_start' => $windows['clock_in_window_start'],
                    'clock_in_window_end' => $windows['clock_in_window_end'],
                    'clock_out_window_start' => $windows['clock_out_window_start'],
                    'clock_out_window_end' => $windows['clock_out_window_end'],
                    'reason' => $now->between($windows['clock_out_window_start'], $windows['clock_out_window_end']) ? null : 'outside_clock_out_window',
                ];
            }
        }

        // 2. Check today's scheduled shift in work_schedules
        $todaySchedule = WorkSchedule::with('shift')
            ->where('employee_id', $employee->id)
            ->where('date', $todayStr)
            ->first();

        $shift = $todaySchedule?->shift;

        // Fallback: If no work_schedule row exists for today, find active default shift or any assigned shift
        if (!$shift) {
            $shift = Shift::where('is_active', true)->orderBy('id')->first();
        }

        if (!$shift) {
            return [
                'shift' => null,
                'schedule' => null,
                'work_date' => $todayStr,
                'can_clock_in' => false,
                'can_clock_out' => false,
                'clock_in_window_start' => null,
                'clock_in_window_end' => null,
                'clock_out_window_start' => null,
                'clock_out_window_end' => null,
                'reason' => 'no_shift_assigned',
            ];
        }

        $windows = $this->calculateShiftWindows($shift, Carbon::parse($todayStr, $this->getTimezone()));

        // Check if already clocked in for today
        $todayAttendance = Attendance::where('employee_id', $employee->id)
            ->whereDate('date', $todayStr)
            ->first();

        $canClockIn = false;
        $canClockOut = false;
        $reason = null;

        if (!$todayAttendance || !$todayAttendance->clock_in) {
            // Not clocked in yet
            if ($now->lt($windows['clock_in_window_start'])) {
                $reason = 'clock_in_too_early';
            } elseif ($now->gt($windows['clock_in_window_end'])) {
                $reason = 'clock_in_window_passed';
            } else {
                $canClockIn = true;
            }
        } elseif (!$todayAttendance->clock_out) {
            // Already clocked in, waiting for clock out
            if ($now->lt($windows['clock_out_window_start'])) {
                $reason = 'clock_out_too_early';
            } elseif ($now->gt($windows['clock_out_window_end'])) {
                $reason = 'clock_out_window_passed';
            } else {
                $canClockOut = true;
            }
        } else {
            $reason = 'already_completed';
        }

        return [
            'shift' => $shift,
            'schedule' => $todaySchedule,
            'work_date' => $todayStr,
            'can_clock_in' => $canClockIn,
            'can_clock_out' => $canClockOut,
            'clock_in_window_start' => $windows['clock_in_window_start'],
            'clock_in_window_end' => $windows['clock_in_window_end'],
            'clock_out_window_start' => $windows['clock_out_window_start'],
            'clock_out_window_end' => $windows['clock_out_window_end'],
            'reason' => $reason,
        ];
    }

    /**
     * Calculate absolute start and end timestamps for shift working hours and clock-in/out windows.
     *
     * @param Shift $shift
     * @param Carbon $workDate
     * @return array{
     *     shift_start: Carbon,
     *     shift_end: Carbon,
     *     clock_in_window_start: Carbon,
     *     clock_in_window_end: Carbon,
     *     clock_out_window_start: Carbon,
     *     clock_out_window_end: Carbon
     * }
     */
    public function calculateShiftWindows(Shift $shift, Carbon $workDate): array
    {
        $tz = $this->getTimezone();
        $dateStr = $workDate->format('Y-m-d');

        // Parse Shift Start & End
        $startTimeStr = $shift->start_time ?? '08:00:00';
        $endTimeStr = $shift->end_time ?? '17:00:00';

        $shiftStart = Carbon::parse("{$dateStr} {$startTimeStr}", $tz);
        $shiftEnd = Carbon::parse("{$dateStr} {$endTimeStr}", $tz);

        $isOvernight = $shift->isOvernightShift();

        if ($isOvernight && $shiftEnd->lte($shiftStart)) {
            $shiftEnd->addDay();
        }

        // Clock In Window
        if ($shift->clock_in_window_start) {
            $clockInStart = Carbon::parse("{$dateStr} {$shift->clock_in_window_start}", $tz);
            // If window start time > shift start, it might belong to previous day
            if ($clockInStart->gt($shiftStart)) {
                $clockInStart->subDay();
            }
        } else {
            // Default: 60 minutes before shift start
            $clockInStart = $shiftStart->copy()->subMinutes(60);
        }

        if ($shift->clock_in_window_end) {
            $clockInEnd = Carbon::parse("{$dateStr} {$shift->clock_in_window_end}", $tz);
            if ($isOvernight && $clockInEnd->lt($shiftStart)) {
                $clockInEnd->addDay();
            }
        } else {
            // Default: 120 minutes after shift start
            $clockInEnd = $shiftStart->copy()->addMinutes(120);
        }

        // Clock Out Window
        $endDateStr = $shiftEnd->format('Y-m-d');

        if ($shift->clock_out_window_start) {
            $clockOutStart = Carbon::parse("{$endDateStr} {$shift->clock_out_window_start}", $tz);
            if ($clockOutStart->gt($shiftEnd->copy()->addHours(6))) {
                $clockOutStart->subDay();
            }
        } else {
            // Default: 30 minutes before shift end
            $clockOutStart = $shiftEnd->copy()->subMinutes(30);
        }

        if ($shift->clock_out_window_end) {
            $clockOutEnd = Carbon::parse("{$endDateStr} {$shift->clock_out_window_end}", $tz);
            if ($clockOutEnd->lt($clockOutStart)) {
                $clockOutEnd->addDay();
            }
        } else {
            // Default: 180 minutes after shift end
            $clockOutEnd = $shiftEnd->copy()->addMinutes(180);
        }

        return [
            'shift_start' => $shiftStart,
            'shift_end' => $shiftEnd,
            'clock_in_window_start' => $clockInStart,
            'clock_in_window_end' => $clockInEnd,
            'clock_out_window_start' => $clockOutStart,
            'clock_out_window_end' => $clockOutEnd,
        ];
    }

    /**
     * Execute server-authoritative Clock-In.
     *
     * @param Employee $employee
     * @param User $user
     * @param float $latitude
     * @param float $longitude
     * @param float|null $accuracy
     * @param string|null $notes
     * @param string|null $ipAddress
     * @param string|null $userAgent
     * @return Attendance
     * @throws RuntimeException
     */
    public function clockIn(
        Employee $employee,
        User $user,
        float $latitude,
        float $longitude,
        ?float $accuracy = null,
        ?string $notes = null,
        ?string $ipAddress = null,
        ?string $userAgent = null
    ): Attendance {
        $now = $this->now();
        $location = AttendanceLocation::getDefaultLocation();

        // 1. Geofencing Validation
        $geoResult = $this->geofencingService->validateLocation($latitude, $longitude, $accuracy, $location);

        if (!$geoResult['valid']) {
            $this->logEvent([
                'employee_id' => $employee->id,
                'user_id' => $user->id,
                'event_type' => 'rejected_clock_in',
                'latitude' => $latitude,
                'longitude' => $longitude,
                'accuracy' => $accuracy,
                'distance' => $geoResult['distance'],
                'status' => 'rejected',
                'reason' => $geoResult['reason'],
                'notes' => $geoResult['message'],
                'ip_address' => $ipAddress,
                'user_agent' => $userAgent,
            ]);

            throw new RuntimeException($geoResult['message']);
        }

        // 2. Resolve Shift & Window
        $context = $this->resolveCurrentShiftContext($employee, $now);
        $shift = $context['shift'];

        if (!$shift) {
            $msg = 'No applicable work shift found for today. Please contact HR.';
            $this->logRejectedEvent($employee, $user, 'rejected_clock_in', $latitude, $longitude, $accuracy, $geoResult['distance'], 'no_shift', $msg, $ipAddress, $userAgent);
            throw new RuntimeException($msg);
        }

        if (!$context['can_clock_in']) {
            $windowStart = $context['clock_in_window_start']?->format('H:i');
            $windowEnd = $context['clock_in_window_end']?->format('H:i');
            $msg = "Clock in rejected: Outside permitted window ({$windowStart} - {$windowEnd} WIB).";

            $this->logRejectedEvent($employee, $user, 'rejected_clock_in', $latitude, $longitude, $accuracy, $geoResult['distance'], $context['reason'] ?? 'outside_window', $msg, $ipAddress, $userAgent, $shift->id);
            throw new RuntimeException($msg);
        }

        // 3. Database Transaction & Concurrency Lock
        return DB::transaction(function () use ($employee, $user, $shift, $context, $now, $latitude, $longitude, $accuracy, $geoResult, $location, $notes, $ipAddress, $userAgent) {
            $workDate = $context['work_date'];

            // Lock row if exists
            $existing = Attendance::where('employee_id', $employee->id)
                ->whereDate('date', $workDate)
                ->lockForUpdate()
                ->first();

            if ($existing && $existing->clock_in) {
                $msg = 'You have already clocked in for this work shift.';
                $this->logRejectedEvent($employee, $user, 'rejected_clock_in', $latitude, $longitude, $accuracy, $geoResult['distance'], 'duplicate_clock_in', $msg, $ipAddress, $userAgent, $shift->id);
                throw new RuntimeException($msg);
            }

            // Calculate Punctuality / Lateness
            $windows = $this->calculateShiftWindows($shift, Carbon::parse($workDate, $this->getTimezone()));
            $shiftStartWithGrace = $windows['shift_start']->copy()->addMinutes($shift->late_tolerance_minutes ?? 0);

            $isLate = false;
            $lateMinutes = 0;
            $status = 'Present';

            if ($now->gt($shiftStartWithGrace)) {
                $isLate = true;
                $status = 'Late';
                $lateMinutes = (int) ceil($windows['shift_start']->diffInMinutes($now));
            }

            $attendanceData = [
                'employee_id' => $employee->id,
                'shift_id' => $shift->id,
                'work_schedule_id' => $context['schedule']?->id,
                'attendance_location_id' => $location->id,
                'date' => $workDate,
                'clock_in' => $now->format('H:i:s'),
                'clock_in_at' => $now,
                'clock_in_latitude' => $latitude,
                'clock_in_longitude' => $longitude,
                'clock_in_accuracy' => $accuracy,
                'clock_in_distance' => $geoResult['distance'],
                'status' => $status,
                'is_late' => $isLate,
                'late_duration_minutes' => $lateMinutes,
                'source' => 'GPS Mobile Geofence',
                'notes' => $notes,
            ];

            if ($existing) {
                $existing->update($attendanceData);
                $attendance = $existing;
            } else {
                $attendance = Attendance::create($attendanceData);
            }

            // Audit Event
            $this->logEvent([
                'attendance_id' => $attendance->id,
                'employee_id' => $employee->id,
                'user_id' => $user->id,
                'shift_id' => $shift->id,
                'event_type' => 'clock_in',
                'latitude' => $latitude,
                'longitude' => $longitude,
                'accuracy' => $accuracy,
                'distance' => $geoResult['distance'],
                'status' => 'success',
                'reason' => null,
                'notes' => "Clock in successful ({$status}) - Distance: {$geoResult['distance']}m",
                'ip_address' => $ipAddress,
                'user_agent' => $userAgent,
            ]);

            return $attendance;
        });
    }

    /**
     * Execute server-authoritative Clock-Out.
     *
     * @param Employee $employee
     * @param User $user
     * @param float $latitude
     * @param float $longitude
     * @param float|null $accuracy
     * @param string|null $notes
     * @param string|null $ipAddress
     * @param string|null $userAgent
     * @return Attendance
     * @throws RuntimeException
     */
    public function clockOut(
        Employee $employee,
        User $user,
        float $latitude,
        float $longitude,
        ?float $accuracy = null,
        ?string $notes = null,
        ?string $ipAddress = null,
        ?string $userAgent = null
    ): Attendance {
        $now = $this->now();
        $location = AttendanceLocation::getDefaultLocation();

        // 1. Geofencing Validation
        $geoResult = $this->geofencingService->validateLocation($latitude, $longitude, $accuracy, $location);

        if (!$geoResult['valid']) {
            $this->logEvent([
                'employee_id' => $employee->id,
                'user_id' => $user->id,
                'event_type' => 'rejected_clock_out',
                'latitude' => $latitude,
                'longitude' => $longitude,
                'accuracy' => $accuracy,
                'distance' => $geoResult['distance'],
                'status' => 'rejected',
                'reason' => $geoResult['reason'],
                'notes' => $geoResult['message'],
                'ip_address' => $ipAddress,
                'user_agent' => $userAgent,
            ]);

            throw new RuntimeException($geoResult['message']);
        }

        // 2. Database Transaction & Find Open Attendance Record
        return DB::transaction(function () use ($employee, $user, $now, $latitude, $longitude, $accuracy, $geoResult, $notes, $ipAddress, $userAgent) {
            // Find open attendance (clock_in filled, clock_out null)
            $attendance = Attendance::with('shift')
                ->where('employee_id', $employee->id)
                ->whereNotNull('clock_in')
                ->whereNull('clock_out')
                ->orderBy('date', 'desc')
                ->lockForUpdate()
                ->first();

            if (!$attendance) {
                $msg = 'No active clock-in record found to clock out from.';
                $this->logRejectedEvent($employee, $user, 'rejected_clock_out', $latitude, $longitude, $accuracy, $geoResult['distance'], 'no_open_clock_in', $msg, $ipAddress, $userAgent);
                throw new RuntimeException($msg);
            }

            $shift = $attendance->shift ?? Shift::find($attendance->shift_id);

            // Check Clock Out Window if shift is available
            if ($shift) {
                $windows = $this->calculateShiftWindows($shift, Carbon::parse($attendance->date, $this->getTimezone()));

                if ($now->lt($windows['clock_out_window_start'])) {
                    $windowStart = $windows['clock_out_window_start']->format('H:i');
                    $msg = "Clock out rejected: Too early. Window opens at {$windowStart} WIB.";
                    $this->logRejectedEvent($employee, $user, 'rejected_clock_out', $latitude, $longitude, $accuracy, $geoResult['distance'], 'clock_out_too_early', $msg, $ipAddress, $userAgent, $shift->id);
                    throw new RuntimeException($msg);
                }

                if ($now->gt($windows['clock_out_window_end'])) {
                    $windowEnd = $windows['clock_out_window_end']->format('H:i');
                    $msg = "Clock out rejected: Window expired at {$windowEnd} WIB. Please request an HR manual correction.";
                    $this->logRejectedEvent($employee, $user, 'rejected_clock_out', $latitude, $longitude, $accuracy, $geoResult['distance'], 'clock_out_window_passed', $msg, $ipAddress, $userAgent, $shift->id);
                    throw new RuntimeException($msg);
                }
            }

            // Early Leave Calculation
            $earlyMinutes = 0;
            if ($shift) {
                $windows = $this->calculateShiftWindows($shift, Carbon::parse($attendance->date, $this->getTimezone()));
                if ($now->lt($windows['shift_end'])) {
                    $earlyMinutes = (int) ceil($now->diffInMinutes($windows['shift_end']));
                }
            }

            $attendance->update([
                'clock_out' => $now->format('H:i:s'),
                'clock_out_at' => $now,
                'clock_out_latitude' => $latitude,
                'clock_out_longitude' => $longitude,
                'clock_out_accuracy' => $accuracy,
                'clock_out_distance' => $geoResult['distance'],
                'early_leave_minutes' => $earlyMinutes,
                'notes' => $notes ? trim("{$attendance->notes}\nClock Out: {$notes}") : $attendance->notes,
            ]);

            // Audit Event
            $this->logEvent([
                'attendance_id' => $attendance->id,
                'employee_id' => $employee->id,
                'user_id' => $user->id,
                'shift_id' => $shift?->id,
                'event_type' => 'clock_out',
                'latitude' => $latitude,
                'longitude' => $longitude,
                'accuracy' => $accuracy,
                'distance' => $geoResult['distance'],
                'status' => 'success',
                'reason' => null,
                'notes' => "Clock out successful - Distance: {$geoResult['distance']}m",
                'ip_address' => $ipAddress,
                'user_agent' => $userAgent,
            ]);

            return $attendance;
        });
    }

    /**
     * Helper to log attendance events.
     */
    protected function logEvent(array $data): AttendanceEvent
    {
        return AttendanceEvent::create($data);
    }

    /**
     * Helper to log rejected events.
     */
    protected function logRejectedEvent(
        Employee $employee,
        User $user,
        string $eventType,
        float $lat,
        float $lon,
        ?float $acc,
        ?float $dist,
        string $reason,
        string $message,
        ?string $ip,
        ?string $ua,
        ?int $shiftId = null
    ): AttendanceEvent {
        return $this->logEvent([
            'employee_id' => $employee->id,
            'user_id' => $user->id,
            'shift_id' => $shiftId,
            'event_type' => $eventType,
            'latitude' => $lat,
            'longitude' => $lon,
            'accuracy' => $acc,
            'distance' => $dist,
            'status' => 'rejected',
            'reason' => $reason,
            'notes' => $message,
            'ip_address' => $ip,
            'user_agent' => $ua,
        ]);
    }
}
