<?php

namespace Tests\Feature;

use App\Models\Attendance;
use App\Models\Employee;
use App\Models\Shift;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Spatie\Permission\Models\Role;
use Tests\TestCase;

class ShiftManagementTest extends TestCase
{
    use RefreshDatabase;

    protected User $hrUser;

    protected function setUp(): void
    {
        parent::setUp();

        Role::firstOrCreate(['name' => 'HRD / Admin', 'guard_name' => 'web']);
        Role::firstOrCreate(['name' => 'Super Admin', 'guard_name' => 'web']);

        $this->hrUser = User::factory()->create([
            'status' => 'active',
            'approved_at' => now(),
        ]);
        $this->hrUser->assignRole('HRD / Admin');
    }

    public function test_hr_can_create_shift_with_windows_and_tolerance(): void
    {
        $response = $this->actingAs($this->hrUser)->post(route('shifts.store'), [
            'name' => 'Morning Shift A',
            'code' => 'MSA',
            'start_time' => '07:00',
            'end_time' => '15:00',
            'clock_in_window_start' => '06:00',
            'clock_in_window_end' => '08:30',
            'clock_out_window_start' => '14:30',
            'clock_out_window_end' => '17:00',
            'late_tolerance_minutes' => 15,
            'is_overnight' => false,
            'is_active' => true,
            'color' => '#10b981',
        ]);

        $response->assertRedirect();
        $this->assertDatabaseHas('shifts', [
            'name' => 'Morning Shift A',
            'code' => 'MSA',
            'late_tolerance_minutes' => 15,
            'is_overnight' => false,
        ]);
    }

    public function test_overnight_shift_auto_detected_when_end_time_before_start(): void
    {
        $response = $this->actingAs($this->hrUser)->post(route('shifts.store'), [
            'name' => 'Night Audit Shift',
            'code' => 'NAS',
            'start_time' => '23:00',
            'end_time' => '07:00',
            'color' => '#6366f1',
        ]);

        $response->assertRedirect();

        $shift = Shift::where('code', 'NAS')->first();
        $this->assertNotNull($shift);
        $this->assertTrue($shift->is_overnight);
    }

    public function test_shift_deactivated_instead_of_deleted_when_referenced_by_attendance(): void
    {
        $shift = Shift::create([
            'name' => 'Operational Shift',
            'code' => 'OPS',
            'start_time' => '08:00',
            'end_time' => '16:00',
            'color' => '#3b82f6',
            'is_active' => true,
        ]);

        $user = User::factory()->create();
        $employee = Employee::create([
            'user_id' => $user->id,
            'employee_number' => 'EMP-TEST-99',
            'employment_status' => 'Active',
            'join_date' => '2026-01-01',
        ]);

        Attendance::create([
            'employee_id' => $employee->id,
            'shift_id' => $shift->id,
            'date' => '2026-10-28',
            'clock_in' => '08:00:00',
            'status' => 'Present',
        ]);

        $response = $this->actingAs($this->hrUser)->delete(route('shifts.destroy', $shift->id));

        $response->assertRedirect();
        // Shift should still exist in database, but marked inactive
        $this->assertDatabaseHas('shifts', [
            'id' => $shift->id,
            'is_active' => false,
        ]);
    }
}
