<?php

namespace Tests\Feature;

use App\Models\Attendance;
use App\Models\AttendanceEvent;
use App\Models\AttendanceLocation;
use App\Models\Department;
use App\Models\Employee;
use App\Models\Shift;
use App\Models\User;
use App\Models\WorkSchedule;
use Carbon\Carbon;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Spatie\Permission\Models\Role;
use Tests\TestCase;

class AttendanceWorkflowTest extends TestCase
{
    use RefreshDatabase;

    protected User $staffUser;
    protected Employee $staffEmployee;
    protected User $hrUser;
    protected Shift $morningShift;
    protected AttendanceLocation $hotelLocation;

    protected function setUp(): void
    {
        parent::setUp();

        Role::firstOrCreate(['name' => 'HRD / Admin', 'guard_name' => 'web']);
        Role::firstOrCreate(['name' => 'Super Admin', 'guard_name' => 'web']);
        Role::firstOrCreate(['name' => 'Staff / Employee', 'guard_name' => 'web']);

        $department = Department::create(['name' => 'Front Office']);

        $this->staffUser = User::factory()->create([
            'name' => 'Budi Santoso',
            'status' => 'active',
            'approved_at' => now(),
        ]);
        $this->staffUser->assignRole('Staff / Employee');

        $this->staffEmployee = Employee::create([
            'user_id' => $this->staffUser->id,
            'department_id' => $department->id,
            'employee_number' => 'EMP-001',
            'employment_status' => 'Active',
            'join_date' => '2026-01-01',
        ]);

        $this->hrUser = User::factory()->create([
            'name' => 'Siti HRD',
            'status' => 'active',
            'approved_at' => now(),
        ]);
        $this->hrUser->assignRole('HRD / Admin');

        $this->hotelLocation = AttendanceLocation::create([
            'name' => 'Swiss-Belinn SKA Pekanbaru',
            'latitude' => 0.49909785,
            'longitude' => 101.41851615,
            'radius_meters' => 100,
            'min_accuracy_meters' => 150,
            'is_active' => true,
        ]);

        $this->morningShift = Shift::create([
            'name' => 'Morning Shift',
            'code' => 'MS',
            'start_time' => '08:00:00',
            'end_time' => '16:00:00',
            'clock_in_window_start' => '06:00:00',
            'clock_in_window_end' => '10:00:00',
            'clock_out_window_start' => '15:30:00',
            'clock_out_window_end' => '19:00:00',
            'late_tolerance_minutes' => 15,
            'is_active' => true,
            'color' => '#10b981',
        ]);
    }

    public function test_clock_in_succeeds_when_inside_geofence_and_within_window(): void
    {
        // Mock current time to 07:45 WIB (within clock-in window, before shift start)
        Carbon::setTestNow(Carbon::parse('2026-10-28 07:45:00', 'Asia/Jakarta'));

        // Assign shift for today
        WorkSchedule::create([
            'employee_id' => $this->staffEmployee->id,
            'shift_id' => $this->morningShift->id,
            'date' => '2026-10-28',
        ]);

        // Coordinates at hotel (~10m from center)
        $response = $this->actingAs($this->staffUser)->post(route('attendance.clockIn'), [
            'latitude' => 0.49911000,
            'longitude' => 101.41852000,
            'accuracy' => 10.0,
            'notes' => 'Arrived on time',
        ]);

        $response->assertSessionHasNoErrors();
        $response->assertRedirect();

        $attendance = Attendance::where('employee_id', $this->staffEmployee->id)
            ->whereDate('date', '2026-10-28')
            ->first();

        $this->assertNotNull($attendance);
        $this->assertEquals('Present', $attendance->status);
        $this->assertFalse($attendance->is_late);
        $this->assertEquals(0, $attendance->late_duration_minutes);
        $this->assertNotNull($attendance->clock_in);
        $this->assertLessThanOrEqual(100.0, $attendance->clock_in_distance);

        // Verify audit event
        $this->assertDatabaseHas('attendance_events', [
            'employee_id' => $this->staffEmployee->id,
            'event_type' => 'clock_in',
            'status' => 'success',
        ]);
    }

    public function test_clock_in_fails_when_outside_geofence_radius(): void
    {
        Carbon::setTestNow(Carbon::parse('2026-10-28 07:45:00', 'Asia/Jakarta'));

        WorkSchedule::create([
            'employee_id' => $this->staffEmployee->id,
            'shift_id' => $this->morningShift->id,
            'date' => '2026-10-28',
        ]);

        // Coordinates 500m away
        $response = $this->actingAs($this->staffUser)->post(route('attendance.clockIn'), [
            'latitude' => 0.50500000,
            'longitude' => 101.42000000,
            'accuracy' => 10.0,
        ]);

        $response->assertSessionHasErrors('message');

        // Attendance record should NOT exist
        $this->assertDatabaseMissing('attendances', [
            'employee_id' => $this->staffEmployee->id,
            'date' => '2026-10-28',
        ]);

        // Rejected audit event should be logged
        $this->assertDatabaseHas('attendance_events', [
            'employee_id' => $this->staffEmployee->id,
            'event_type' => 'rejected_clock_in',
            'status' => 'rejected',
            'reason' => 'outside_radius',
        ]);
    }

    public function test_clock_in_marked_late_when_arriving_after_grace_period(): void
    {
        // Shift starts at 08:00 with 15 mins grace. Arriving at 08:30 (15 mins late past grace)
        Carbon::setTestNow(Carbon::parse('2026-10-28 08:30:00', 'Asia/Jakarta'));

        WorkSchedule::create([
            'employee_id' => $this->staffEmployee->id,
            'shift_id' => $this->morningShift->id,
            'date' => '2026-10-28',
        ]);

        $response = $this->actingAs($this->staffUser)->post(route('attendance.clockIn'), [
            'latitude' => 0.49909785,
            'longitude' => 101.41851615,
            'accuracy' => 10.0,
        ]);

        $response->assertSessionHasNoErrors();

        $attendance = Attendance::where('employee_id', $this->staffEmployee->id)->first();
        $this->assertNotNull($attendance);
        $this->assertEquals('Late', $attendance->status);
        $this->assertTrue($attendance->is_late);
        $this->assertEquals(30, $attendance->late_duration_minutes);
    }

    public function test_clock_out_succeeds_for_active_attendance(): void
    {
        // 1. Clock in at 07:55
        Carbon::setTestNow(Carbon::parse('2026-10-28 07:55:00', 'Asia/Jakarta'));

        Attendance::create([
            'employee_id' => $this->staffEmployee->id,
            'shift_id' => $this->morningShift->id,
            'attendance_location_id' => $this->hotelLocation->id,
            'date' => '2026-10-28',
            'clock_in' => '07:55:00',
            'clock_in_at' => Carbon::now('Asia/Jakarta'),
            'status' => 'Present',
        ]);

        // 2. Clock out at 16:05 (shift ends at 16:00, within 15:30-19:00 window)
        Carbon::setTestNow(Carbon::parse('2026-10-28 16:05:00', 'Asia/Jakarta'));

        $response = $this->actingAs($this->staffUser)->post(route('attendance.clockOut'), [
            'latitude' => 0.49909785,
            'longitude' => 101.41851615,
            'accuracy' => 10.0,
            'notes' => 'Completed shift duties',
        ]);

        $response->assertSessionHasNoErrors();

        $attendance = Attendance::where('employee_id', $this->staffEmployee->id)->first();
        $this->assertNotNull($attendance->clock_out);
        $this->assertEquals('16:05:00', $attendance->clock_out);

        $this->assertDatabaseHas('attendance_events', [
            'employee_id' => $this->staffEmployee->id,
            'event_type' => 'clock_out',
            'status' => 'success',
        ]);
    }

    public function test_clock_out_rejected_if_no_clock_in_exists(): void
    {
        Carbon::setTestNow(Carbon::parse('2026-10-28 16:05:00', 'Asia/Jakarta'));

        $response = $this->actingAs($this->staffUser)->post(route('attendance.clockOut'), [
            'latitude' => 0.49909785,
            'longitude' => 101.41851615,
            'accuracy' => 10.0,
        ]);

        $response->assertSessionHasErrors('message');
    }

    public function test_hr_can_manually_correct_attendance_with_mandatory_reason(): void
    {
        $attendance = Attendance::create([
            'employee_id' => $this->staffEmployee->id,
            'date' => '2026-10-28',
            'status' => 'Absent',
        ]);

        $response = $this->actingAs($this->hrUser)->patch(route('attendance.correct', $attendance->id), [
            'clock_in' => '08:00',
            'clock_out' => '16:00',
            'status' => 'Present',
            'late_duration_minutes' => 0,
            'correction_reason' => 'Employee biometric fingerprint offline on morning shift. Verified by Duty Manager.',
        ]);

        $response->assertSessionHasNoErrors();
        $response->assertRedirect();

        $attendance->refresh();
        $this->assertEquals('08:00:00', $attendance->clock_in);
        $this->assertEquals('16:00:00', $attendance->clock_out);
        $this->assertEquals('Present', $attendance->status);
        $this->assertEquals($this->hrUser->id, $attendance->corrected_by);
        $this->assertNotNull($attendance->corrected_at);

        // Audit event logged
        $this->assertDatabaseHas('attendance_events', [
            'attendance_id' => $attendance->id,
            'event_type' => 'manual_correction',
            'status' => 'success',
        ]);
    }

    public function test_staff_cannot_access_hr_attendance_index_or_settings(): void
    {
        $response = $this->actingAs($this->staffUser)->get(route('attendance.index'));
        $response->assertForbidden();

        $patchResponse = $this->actingAs($this->staffUser)->patch(route('attendance.location.update'), [
            'name' => 'Hacked Hotel',
            'latitude' => 0.0,
            'longitude' => 0.0,
            'radius_meters' => 1000,
            'min_accuracy_meters' => 1000,
            'is_active' => true,
        ]);
        $patchResponse->assertForbidden();
    }

    public function test_clock_in_duplicate_rejected(): void
    {
        Carbon::setTestNow(Carbon::parse('2026-10-28 07:45:00', 'Asia/Jakarta'));

        Attendance::create([
            'employee_id' => $this->staffEmployee->id,
            'shift_id' => $this->morningShift->id,
            'date' => '2026-10-28',
            'clock_in' => '07:45:00',
            'status' => 'Present',
        ]);

        $response = $this->actingAs($this->staffUser)->post(route('attendance.clockIn'), [
            'latitude' => 0.49909785,
            'longitude' => 101.41851615,
            'accuracy' => 10.0,
        ]);

        $response->assertSessionHasErrors('message');
    }

    public function test_clock_in_rejected_when_outside_permitted_window(): void
    {
        // Window is 06:00 to 10:00. Mocking time to 05:30 (too early)
        Carbon::setTestNow(Carbon::parse('2026-10-28 05:30:00', 'Asia/Jakarta'));

        WorkSchedule::create([
            'employee_id' => $this->staffEmployee->id,
            'shift_id' => $this->morningShift->id,
            'date' => '2026-10-28',
        ]);

        $response = $this->actingAs($this->staffUser)->post(route('attendance.clockIn'), [
            'latitude' => 0.49909785,
            'longitude' => 101.41851615,
            'accuracy' => 10.0,
        ]);

        $response->assertSessionHasErrors('message');
    }

    public function test_clock_out_rejected_when_too_early(): void
    {
        Carbon::setTestNow(Carbon::parse('2026-10-28 07:55:00', 'Asia/Jakarta'));

        Attendance::create([
            'employee_id' => $this->staffEmployee->id,
            'shift_id' => $this->morningShift->id,
            'date' => '2026-10-28',
            'clock_in' => '07:55:00',
            'status' => 'Present',
        ]);

        // Shift clock_out_window_start is 15:30. Current time is 12:00 (too early)
        Carbon::setTestNow(Carbon::parse('2026-10-28 12:00:00', 'Asia/Jakarta'));

        $response = $this->actingAs($this->staffUser)->post(route('attendance.clockOut'), [
            'latitude' => 0.49909785,
            'longitude' => 101.41851615,
            'accuracy' => 10.0,
        ]);

        $response->assertSessionHasErrors('message');
    }

    public function test_overnight_shift_clock_in_and_next_day_clock_out(): void
    {
        $nightShift = Shift::create([
            'name' => 'Night Shift Duty',
            'code' => 'NSD',
            'start_time' => '23:00:00',
            'end_time' => '07:00:00',
            'clock_in_window_start' => '22:00:00',
            'clock_in_window_end' => '01:00:00',
            'clock_out_window_start' => '06:30:00',
            'clock_out_window_end' => '09:00:00',
            'is_overnight' => true,
            'is_active' => true,
            'color' => '#4338ca',
        ]);

        // 1. Clock in at 22:50 on 2026-10-28
        Carbon::setTestNow(Carbon::parse('2026-10-28 22:50:00', 'Asia/Jakarta'));

        WorkSchedule::create([
            'employee_id' => $this->staffEmployee->id,
            'shift_id' => $nightShift->id,
            'date' => '2026-10-28',
        ]);

        $inResponse = $this->actingAs($this->staffUser)->post(route('attendance.clockIn'), [
            'latitude' => 0.49909785,
            'longitude' => 101.41851615,
            'accuracy' => 10.0,
        ]);
        $inResponse->assertSessionHasNoErrors();

        // 2. Next morning at 07:05 on 2026-10-29
        Carbon::setTestNow(Carbon::parse('2026-10-29 07:05:00', 'Asia/Jakarta'));

        $outResponse = $this->actingAs($this->staffUser)->post(route('attendance.clockOut'), [
            'latitude' => 0.49909785,
            'longitude' => 101.41851615,
            'accuracy' => 10.0,
        ]);
        $outResponse->assertSessionHasNoErrors();

        $attendance = Attendance::where('employee_id', $this->staffEmployee->id)->first();
        $this->assertEquals('22:50:00', $attendance->clock_in);
        $this->assertEquals('07:05:00', $attendance->clock_out);
        $this->assertEquals('2026-10-28', $attendance->date->format('Y-m-d'));
    }

    public function test_hr_can_export_csv_with_formula_sanitization(): void
    {
        Attendance::create([
            'employee_id' => $this->staffEmployee->id,
            'shift_id' => $this->morningShift->id,
            'date' => '2026-10-28',
            'clock_in' => '08:00:00',
            'clock_out' => '16:00:00',
            'status' => 'Present',
            'notes' => '=SUM(A1:A10)', // Potential CSV formula injection attempt
        ]);

        $response = $this->actingAs($this->hrUser)->get(route('attendance.export', [
            'start_date' => '2026-10-28',
            'end_date' => '2026-10-28',
        ]));

        $response->assertOk();
        $response->assertHeader('content-type', 'text/csv; charset=UTF-8');

        // Capture streamed response content
        ob_start();
        $response->sendContent();
        $content = ob_get_clean();

        // Ensure formula prefix '=' is sanitized with a leading single quote "'"
        $this->assertStringContainsString("'=SUM(A1:A10)", $content);
    }

    public function test_hr_can_view_attendance_index_and_all_tabs(): void
    {
        $tabs = ['overview', 'data', 'reports', 'settings'];

        foreach ($tabs as $tab) {
            $response = $this->actingAs($this->hrUser)->get(route('attendance.index', ['tab' => $tab]));
            $response->assertOk();
            $response->assertInertia(fn ($page) => $page
                ->component('Attendance/Index')
                ->has('attendances')
                ->has('summary')
                ->has('departments')
                ->has('shifts')
                ->has('location')
                ->has('departmentStats')
                ->has('recentEvents')
            );
        }
    }
}
