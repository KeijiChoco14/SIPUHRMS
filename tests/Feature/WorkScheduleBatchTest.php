<?php

namespace Tests\Feature;

use App\Models\Department;
use App\Models\Employee;
use App\Models\Shift;
use App\Models\User;
use App\Models\WorkSchedule;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Carbon;
use Spatie\Permission\Models\Role;
use Tests\TestCase;

class WorkScheduleBatchTest extends TestCase
{
    use RefreshDatabase;

    protected User $hrUser;
    protected User $hodUser;
    protected Department $departmentA;
    protected Department $departmentB;
    protected Employee $employeeA1;
    protected Employee $employeeA2;
    protected Employee $employeeB1;
    protected Shift $morningShift;
    protected Shift $eveningShift;

    protected function setUp(): void
    {
        parent::setUp();

        // Roles
        Role::firstOrCreate(['name' => 'HRD / Admin', 'guard_name' => 'web']);
        Role::firstOrCreate(['name' => 'Head of Department', 'guard_name' => 'web']);
        Role::firstOrCreate(['name' => 'Supervisor', 'guard_name' => 'web']);

        // Departments
        $this->departmentA = Department::create(['name' => 'Housekeeping', 'code' => 'HK']);
        $this->departmentB = Department::create(['name' => 'Food & Beverage', 'code' => 'FB']);

        // HR User
        $this->hrUser = User::factory()->create([
            'status' => 'active',
            'approved_at' => now(),
        ]);
        $this->hrUser->assignRole('HRD / Admin');

        // HOD User for Dept A
        $posHOD = \App\Models\Position::create(['name' => 'Executive Housekeeper', 'department_id' => $this->departmentA->id]);
        $posA1 = \App\Models\Position::create(['name' => 'Room Attendant', 'department_id' => $this->departmentA->id]);
        $posA2 = \App\Models\Position::create(['name' => 'Public Area Attendant', 'department_id' => $this->departmentA->id]);
        $posB1 = \App\Models\Position::create(['name' => 'Waiter', 'department_id' => $this->departmentB->id]);

        $this->hodUser = User::factory()->create([
            'status' => 'active',
            'approved_at' => now(),
        ]);
        $this->hodUser->assignRole('Head of Department');
        $hodEmp = Employee::create([
            'user_id' => $this->hodUser->id,
            'department_id' => $this->departmentA->id,
            'position_id' => $posHOD->id,
            'employee_number' => 'EMP-HOD-HK',
            'employment_status' => 'Active',
            'join_date' => '2023-01-01',
        ]);

        // Employees
        $userA1 = User::factory()->create(['status' => 'active', 'approved_at' => now()]);
        $this->employeeA1 = Employee::create([
            'user_id' => $userA1->id,
            'department_id' => $this->departmentA->id,
            'position_id' => $posA1->id,
            'employee_number' => 'EMP-A1',
            'employment_status' => 'Active',
            'join_date' => '2023-01-01',
        ]);

        $userA2 = User::factory()->create(['status' => 'active', 'approved_at' => now()]);
        $this->employeeA2 = Employee::create([
            'user_id' => $userA2->id,
            'department_id' => $this->departmentA->id,
            'position_id' => $posA2->id,
            'employee_number' => 'EMP-A2',
            'employment_status' => 'Active',
            'join_date' => '2023-01-01',
        ]);

        $userB1 = User::factory()->create(['status' => 'active', 'approved_at' => now()]);
        $this->employeeB1 = Employee::create([
            'user_id' => $userB1->id,
            'department_id' => $this->departmentB->id,
            'position_id' => $posB1->id,
            'employee_number' => 'EMP-B1',
            'employment_status' => 'Active',
            'join_date' => '2023-01-01',
        ]);

        // Shifts
        $this->morningShift = Shift::create([
            'name' => 'Morning Shift',
            'code' => 'MS',
            'start_time' => '07:00:00',
            'end_time' => '15:00:00',
            'clock_in_window_start' => '06:00:00',
            'clock_in_window_end' => '08:00:00',
            'clock_out_window_start' => '14:30:00',
            'clock_out_window_end' => '16:30:00',
            'late_tolerance_minutes' => 15,
            'is_overnight' => false,
            'is_active' => true,
            'color' => '#10b981',
        ]);

        $this->eveningShift = Shift::create([
            'name' => 'Evening Shift',
            'code' => 'ES',
            'start_time' => '15:00:00',
            'end_time' => '23:00:00',
            'clock_in_window_start' => '14:00:00',
            'clock_in_window_end' => '16:00:00',
            'clock_out_window_start' => '22:30:00',
            'clock_out_window_end' => '23:59:00',
            'late_tolerance_minutes' => 15,
            'is_overnight' => false,
            'is_active' => true,
            'color' => '#f59e0b',
        ]);
    }

    public function test_hod_can_view_schedules_defaulted_to_their_department(): void
    {
        $response = $this->actingAs($this->hodUser)->get(route('schedules.index'));
        $response->assertOk();
        $response->assertInertia(fn ($page) => $page
            ->component('Schedule/Index')
            ->has('departments')
            ->has('shifts')
            ->where('selectedDepartmentId', $this->departmentA->id)
        );
    }

    public function test_bulk_schedule_assignment(): void
    {
        $dates = ['2026-10-26', '2026-10-27', '2026-10-28'];

        $response = $this->actingAs($this->hrUser)->post(route('schedules.bulk'), [
            'employee_ids' => [$this->employeeA1->id, $this->employeeA2->id],
            'shift_id' => $this->morningShift->id,
            'dates' => $dates,
            'overwrite' => true,
        ]);

        $response->assertRedirect();
        $response->assertSessionHas('success');

        // Total 2 employees * 3 dates = 6 records
        $this->assertDatabaseCount('work_schedules', 6);
        foreach ($dates as $date) {
            $this->assertDatabaseHas('work_schedules', [
                'employee_id' => $this->employeeA1->id,
                'shift_id' => $this->morningShift->id,
                'date' => $date,
            ]);
            $this->assertDatabaseHas('work_schedules', [
                'employee_id' => $this->employeeA2->id,
                'shift_id' => $this->morningShift->id,
                'date' => $date,
            ]);
        }
    }

    public function test_bulk_schedule_with_overwrite_false_preserves_existing(): void
    {
        // Pre-create an assignment with Evening Shift
        WorkSchedule::create([
            'employee_id' => $this->employeeA1->id,
            'shift_id' => $this->eveningShift->id,
            'date' => '2026-10-26',
        ]);

        // Bulk assign with Morning Shift and overwrite = false
        $response = $this->actingAs($this->hrUser)->post(route('schedules.bulk'), [
            'employee_ids' => [$this->employeeA1->id],
            'shift_id' => $this->morningShift->id,
            'dates' => ['2026-10-26', '2026-10-27'],
            'overwrite' => false,
        ]);

        $response->assertRedirect();

        // 2026-10-26 should STILL be eveningShift
        $this->assertDatabaseHas('work_schedules', [
            'employee_id' => $this->employeeA1->id,
            'shift_id' => $this->eveningShift->id,
            'date' => '2026-10-26',
        ]);

        // 2026-10-27 should be morningShift
        $this->assertDatabaseHas('work_schedules', [
            'employee_id' => $this->employeeA1->id,
            'shift_id' => $this->morningShift->id,
            'date' => '2026-10-27',
        ]);
    }

    public function test_copy_previous_week_schedules(): void
    {
        // Previous week dates: Monday 2026-10-19 to Wednesday 2026-10-21
        WorkSchedule::create([
            'employee_id' => $this->employeeA1->id,
            'shift_id' => $this->morningShift->id,
            'date' => '2026-10-19',
        ]);
        WorkSchedule::create([
            'employee_id' => $this->employeeA1->id,
            'shift_id' => $this->eveningShift->id,
            'date' => '2026-10-20',
        ]);

        // Copy into week of Monday 2026-10-26
        $response = $this->actingAs($this->hrUser)->post(route('schedules.copyPreviousWeek'), [
            'target_start_date' => '2026-10-26',
            'department_id' => $this->departmentA->id,
            'overwrite' => true,
        ]);

        $response->assertRedirect();
        $response->assertSessionHas('success');

        // Target dates: +7 days -> 2026-10-26 and 2026-10-27
        $this->assertDatabaseHas('work_schedules', [
            'employee_id' => $this->employeeA1->id,
            'shift_id' => $this->morningShift->id,
            'date' => '2026-10-26',
        ]);
        $this->assertDatabaseHas('work_schedules', [
            'employee_id' => $this->employeeA1->id,
            'shift_id' => $this->eveningShift->id,
            'date' => '2026-10-27',
        ]);
    }

    public function test_copy_previous_week_with_no_prior_schedules_returns_clean_error(): void
    {
        // No schedules in previous week
        $response = $this->actingAs($this->hrUser)->post(route('schedules.copyPreviousWeek'), [
            'target_start_date' => '2026-10-26',
            'department_id' => $this->departmentA->id,
        ]);

        $response->assertRedirect();
        $response->assertSessionHasErrors('message');
    }

    public function test_clear_week_schedules(): void
    {
        WorkSchedule::create([
            'employee_id' => $this->employeeA1->id,
            'shift_id' => $this->morningShift->id,
            'date' => '2026-10-26',
        ]);
        WorkSchedule::create([
            'employee_id' => $this->employeeA2->id,
            'shift_id' => $this->morningShift->id,
            'date' => '2026-10-26',
        ]);

        // Clear only employeeA1
        $response = $this->actingAs($this->hrUser)->post(route('schedules.clearWeek'), [
            'start_date' => '2026-10-26',
            'end_date' => '2026-11-01',
            'employee_id' => $this->employeeA1->id,
        ]);

        $response->assertRedirect();
        $this->assertDatabaseMissing('work_schedules', [
            'employee_id' => $this->employeeA1->id,
            'date' => '2026-10-26',
        ]);
        $this->assertDatabaseHas('work_schedules', [
            'employee_id' => $this->employeeA2->id,
            'date' => '2026-10-26',
        ]);
    }
}
