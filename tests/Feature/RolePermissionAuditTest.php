<?php

namespace Tests\Feature;

use App\Models\Department;
use App\Models\Employee;
use App\Models\Payroll;
use App\Models\PayrollPeriod;
use App\Models\PerformancePeriod;
use App\Models\PowerProRequest;
use App\Models\Room;
use App\Models\RoomBorrowing;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Spatie\Permission\Models\Permission;
use Spatie\Permission\Models\Role;
use Tests\TestCase;

class RolePermissionAuditTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();

        // Seed core roles
        Role::findOrCreate('Super Admin');
        Role::findOrCreate('HRD / Admin');
        Role::findOrCreate('General Manager');
        Role::findOrCreate('Head of Department');
        Role::findOrCreate('Supervisor');
        Role::findOrCreate('Staff / Employee');
        Role::findOrCreate('OJT / Trainee');
        Role::findOrCreate('Security');

        // Seed room permissions
        Permission::findOrCreate('room.borrow');
        Permission::findOrCreate('room.return.approve');
        Permission::findOrCreate('room.manage');

        $securityRole = Role::findByName('Security');
        $securityRole->givePermissionTo(['room.borrow', 'room.return.approve', 'room.manage']);

        $staffRole = Role::findByName('Staff / Employee');
        $staffRole->givePermissionTo('room.borrow');
    }

    protected function createEmployeeUser(string $role = 'Staff / Employee', ?string $departmentName = 'Front Office'): array
    {
        $dept = Department::firstOrCreate(['name' => $departmentName], ['code' => strtoupper(substr($departmentName, 0, 3))]);
        $user = User::factory()->create();
        $user->assignRole($role);

        $employee = Employee::create([
            'user_id' => $user->id,
            'department_id' => $dept->id,
            'employee_number' => 'EMP-' . uniqid(),
            'first_name' => 'Test',
            'last_name' => 'User ' . $user->id,
            'email' => $user->email,
            'hire_date' => now(),
            'status' => 'active',
        ]);

        return [$user, $employee];
    }

    public function test_super_admin_can_access_system_settings_roles_and_audit_logs(): void
    {
        $admin = User::factory()->create();
        $admin->assignRole('Super Admin');

        $this->actingAs($admin)->get('/settings')->assertStatus(200);
        $this->actingAs($admin)->get('/roles')->assertStatus(200);
        $this->actingAs($admin)->get('/audit-logs')->assertStatus(200);
    }

    public function test_non_super_admin_is_forbidden_from_system_settings_roles_and_audit_logs(): void
    {
        [$staffUser] = $this->createEmployeeUser('Staff / Employee');
        [$hrUser] = $this->createEmployeeUser('HRD / Admin');
        [$gmUser] = $this->createEmployeeUser('General Manager');
        [$secUser] = $this->createEmployeeUser('Security');

        foreach ([$staffUser, $hrUser, $gmUser, $secUser] as $user) {
            $this->actingAs($user)->get('/settings')->assertStatus(403);
            $this->actingAs($user)->get('/roles')->assertStatus(403);
            $this->actingAs($user)->get('/audit-logs')->assertStatus(403);
        }
    }

    public function test_regular_employee_cannot_access_administrative_hr_pages(): void
    {
        [$staffUser] = $this->createEmployeeUser('Staff / Employee');

        $this->actingAs($staffUser)->get('/employees')->assertStatus(403);
        $this->actingAs($staffUser)->get('/departments')->assertStatus(403);
        $this->actingAs($staffUser)->get('/attendance')->assertStatus(403);
        $this->actingAs($staffUser)->get('/payroll')->assertStatus(403);
        $this->actingAs($staffUser)->get('/schedules')->assertStatus(403);
        $this->actingAs($staffUser)->get('/shifts')->assertStatus(403);
    }

    public function test_regular_employee_can_access_employee_self_service_pages(): void
    {
        [$staffUser] = $this->createEmployeeUser('Staff / Employee');

        $this->actingAs($staffUser)->get('/my-attendance')->assertStatus(200);
        $this->actingAs($staffUser)->get('/my-payslips')->assertStatus(200);
        $this->actingAs($staffUser)->get('/leave')->assertStatus(200);
        $this->actingAs($staffUser)->get('/overtime')->assertStatus(200);
        $this->actingAs($staffUser)->get('/directory')->assertStatus(200);
        $this->actingAs($staffUser)->get('/tasks')->assertStatus(200);
        $this->actingAs($staffUser)->get('/room-borrowing')->assertStatus(200);
    }

    public function test_employee_cannot_view_another_employees_payslip(): void
    {
        [$userA, $employeeA] = $this->createEmployeeUser('Staff / Employee');
        [$userB, $employeeB] = $this->createEmployeeUser('Staff / Employee');

        $period = PayrollPeriod::create([
            'name' => 'October 2026',
            'month' => 10,
            'year' => 2026,
            'start_date' => now()->startOfMonth(),
            'end_date' => now()->endOfMonth(),
            'status' => 'Draft',
        ]);

        $payrollB = Payroll::create([
            'employee_id' => $employeeB->id,
            'payroll_period_id' => $period->id,
            'basic_salary' => 5000000,
            'gross_salary' => 5000000,
            'net_salary' => 5000000,
            'payment_status' => 'paid',
        ]);

        // User A attempts to view User B's payslip
        $response = $this->actingAs($userA)->get("/payroll/{$payrollB->id}/payslip");
        $response->assertStatus(403);
    }

    public function test_non_admin_cannot_delete_another_users_power_pro_request(): void
    {
        [$userA, $employeeA] = $this->createEmployeeUser('Staff / Employee');
        [$userB, $employeeB] = $this->createEmployeeUser('Staff / Employee');

        $requestA = PowerProRequest::create([
            'request_number' => 'PPR-202610-0001',
            'requested_by_user_id' => $userA->id,
            'employee_id' => $employeeA->id,
            'department_id' => $employeeA->department_id,
            'access_level' => 'Entry',
            'status' => 'On Request',
        ]);

        // User B attempts to delete User A's pending PowerPro request
        $response = $this->actingAs($userB)->delete("/it/power-pro/{$requestA->id}");
        $response->assertStatus(403);

        $this->assertDatabaseHas('power_pro_requests', ['id' => $requestA->id]);
    }

    public function test_request_owner_can_delete_their_own_pending_power_pro_request(): void
    {
        [$userA, $employeeA] = $this->createEmployeeUser('Staff / Employee');

        $requestA = PowerProRequest::create([
            'request_number' => 'PPR-202610-0002',
            'requested_by_user_id' => $userA->id,
            'employee_id' => $employeeA->id,
            'department_id' => $employeeA->department_id,
            'access_level' => 'Entry',
            'status' => 'On Request',
        ]);

        // User A deletes their own pending request
        $response = $this->actingAs($userA)->delete("/it/power-pro/{$requestA->id}");
        $response->assertStatus(302);

        $this->assertDatabaseMissing('power_pro_requests', ['id' => $requestA->id]);
    }

    public function test_non_housekeeping_staff_cannot_access_master_key_requests(): void
    {
        [$itUser] = $this->createEmployeeUser('Staff / Employee', 'IT');
        $this->actingAs($itUser)->get('/master-keys')->assertStatus(403);

        [$foUser] = $this->createEmployeeUser('Staff / Employee', 'Front Office');
        $this->actingAs($foUser)->get('/master-keys')->assertStatus(403);
    }

    public function test_housekeeping_staff_can_access_master_key_requests(): void
    {
        [$hkUser] = $this->createEmployeeUser('Staff / Employee', 'Housekeeping');
        $this->actingAs($hkUser)->get('/master-keys')->assertStatus(200);
    }

    public function test_only_authorized_roles_can_manage_room_returns_and_catalog(): void
    {
        [$secUser] = $this->createEmployeeUser('Security', 'Security');
        [$staffUser, $staffEmp] = $this->createEmployeeUser('Staff / Employee', 'Accounting');

        $room = Room::create([
            'room_number' => '101',
            'name' => 'Meeting Room A',
            'capacity' => 10,
            'status' => 'BORROWED',
            'is_active' => true,
        ]);

        $borrowing = \App\Models\RoomBorrowingTransaction::create([
            'transaction_number' => 'RBT-202610-0001',
            'room_id' => $room->id,
            'borrower_employee_id' => $staffEmp->id,
            'borrowed_at' => now()->subHours(2),
            'expected_duration_hours' => 2,
            'expected_return_at' => now(),
            'purpose' => 'Team meeting',
            'status' => \App\Models\RoomBorrowingTransaction::STATUS_PENDING_RETURN,
            'return_requested_at' => now()->subMinutes(10),
        ]);

        // Regular staff cannot confirm room key return (requires room.return.approve)
        $this->actingAs($staffUser)->post("/room-borrowing/{$borrowing->id}/confirm-return")
            ->assertStatus(403);

        // Security role can confirm room key return
        $this->actingAs($secUser)->post("/room-borrowing/{$borrowing->id}/confirm-return")
            ->assertStatus(302);
    }

    public function test_super_admin_can_access_performance_assessment_even_if_not_supervisor(): void
    {
        $admin = User::factory()->create();
        $admin->assignRole('Super Admin');

        [$subordinateUser, $subordinateEmp] = $this->createEmployeeUser('Staff / Employee', 'Front Office');

        $period = PerformancePeriod::create([
            'name' => 'Q4 2026',
            'start_date' => now()->startOfQuarter(),
            'end_date' => now()->endOfQuarter(),
            'status' => 'active',
        ]);

        // Super Admin visits subordinate employee's assessment page
        $response = $this->actingAs($admin)->get("/performance/{$subordinateEmp->id}/{$period->id}");
        $response->assertStatus(200);
    }

    public function test_super_admin_can_view_and_request_leave(): void
    {
        $admin = User::factory()->create();
        $admin->assignRole('Super Admin');

        // Can access /leave with approvals and personal view
        $response = $this->actingAs($admin)->get('/leave');
        $response->assertStatus(200);
        $response->assertInertia(fn ($page) => $page
            ->component('Leave/Index')
            ->where('canApprove', true)
            ->has('myRequests')
            ->has('allRequests')
        );

        // Can submit a leave request
        $leaveResponse = $this->actingAs($admin)->post('/leave', [
            'type' => 'Annual',
            'start_date' => now()->addDays(5)->toDateString(),
            'end_date' => now()->addDays(7)->toDateString(),
            'reason' => 'Annual vacation time off',
        ]);
        $leaveResponse->assertRedirect();

        $this->assertDatabaseHas('leave_requests', [
            'reason' => 'Annual vacation time off',
            'status' => 'Pending',
        ]);
    }

    public function test_super_admin_can_view_and_request_overtime(): void
    {
        $admin = User::factory()->create();
        $admin->assignRole('Super Admin');

        // Can access /overtime with approvals and personal view
        $response = $this->actingAs($admin)->get('/overtime');
        $response->assertStatus(200);
        $response->assertInertia(fn ($page) => $page
            ->component('Overtime/Index')
            ->where('canApprove', true)
            ->has('myRequests')
            ->has('allRequests')
        );

        // Can submit an overtime request
        $otResponse = $this->actingAs($admin)->post('/overtime', [
            'date' => now()->toDateString(),
            'start_time' => '17:00',
            'end_time' => '20:00',
            'reason' => 'Quarterly server maintenance and backup audit',
        ]);
        $otResponse->assertRedirect();

        $this->assertDatabaseHas('overtime_requests', [
            'reason' => 'Quarterly server maintenance and backup audit',
            'status' => 'Pending',
        ]);
    }
}
