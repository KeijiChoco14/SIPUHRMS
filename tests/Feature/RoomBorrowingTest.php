<?php

namespace Tests\Feature;

use App\Models\AuditLog;
use App\Models\Department;
use App\Models\Employee;
use App\Models\Position;
use App\Models\Room;
use App\Models\RoomBorrowingTransaction;
use App\Models\User;
use Carbon\Carbon;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Inertia\Testing\AssertableInertia;
use Spatie\Permission\Models\Permission;
use Spatie\Permission\Models\Role;
use Spatie\Permission\PermissionRegistrar;
use Tests\TestCase;

class RoomBorrowingTest extends TestCase
{
    use RefreshDatabase;

    private User $employeeUser;
    private Employee $employee;
    private User $securityUser;
    private Employee $securityEmployee;
    private User $adminUser;
    private Room $room;

    protected function setUp(): void
    {
        parent::setUp();
        app()[PermissionRegistrar::class]->forgetCachedPermissions();

        // 1. Permissions
        $permissions = [
            'room.view',
            'room.borrow',
            'room.return.request',
            'room.return.approve',
            'room.manage',
        ];
        foreach ($permissions as $p) {
            Permission::firstOrCreate(['name' => $p]);
        }

        // 2. Roles
        $roleStaff = Role::firstOrCreate(['name' => 'Staff / Employee']);
        $roleStaff->syncPermissions(['room.view', 'room.borrow', 'room.return.request']);

        $roleSecurity = Role::firstOrCreate(['name' => 'Security']);
        $roleSecurity->syncPermissions(['room.view', 'room.borrow', 'room.return.request', 'room.return.approve', 'room.manage']);

        $roleAdmin = Role::firstOrCreate(['name' => 'Super Admin']);
        $roleAdmin->syncPermissions($permissions);

        // 3. Departments & Positions
        $deptFO = Department::create(['name' => 'Front Office']);
        $posFO = Position::create(['name' => 'Receptionist', 'department_id' => $deptFO->id]);

        $deptSec = Department::create(['name' => 'Security & Safety']);
        $posSec = Position::create(['name' => 'Duty Security Officer', 'department_id' => $deptSec->id]);

        // 4. Users & Employees
        $this->employeeUser = User::factory()->create(['name' => 'Budi Staff']);
        $this->employeeUser->assignRole($roleStaff);
        $this->employee = Employee::create([
            'user_id' => $this->employeeUser->id,
            'employee_number' => 'SBH-101',
            'department_id' => $deptFO->id,
            'position_id' => $posFO->id,
            'join_date' => Carbon::now()->subMonths(6),
            'employment_status' => 'Active',
        ]);

        $this->securityUser = User::factory()->create(['name' => 'Rahmat Security']);
        $this->securityUser->assignRole($roleSecurity);
        $this->securityEmployee = Employee::create([
            'user_id' => $this->securityUser->id,
            'employee_number' => 'SBH-SEC-01',
            'department_id' => $deptSec->id,
            'position_id' => $posSec->id,
            'join_date' => Carbon::now()->subYears(1),
            'employment_status' => 'Active',
        ]);

        $this->adminUser = User::factory()->create(['name' => 'Admin User']);
        $this->adminUser->assignRole($roleAdmin);

        // 5. Test Room
        $this->room = Room::create([
            'room_number' => 'MTG-01',
            'name' => 'Meeting Room SKA 1',
            'location' => 'Lantai 2',
            'capacity' => 25,
            'description' => 'Ruang rapat kapasitas 25 orang.',
            'key_code' => 'KEY-MR01',
            'status' => Room::STATUS_AVAILABLE,
            'is_active' => true,
        ]);
    }

    public function test_guest_is_redirected_to_login_when_accessing_room_borrowing(): void
    {
        $response = $this->get('/room-borrowing');
        $response->assertRedirect('/login');
    }

    public function test_authenticated_employee_can_view_room_borrowing_page(): void
    {
        $response = $this->actingAs($this->employeeUser)->get('/room-borrowing');

        $response->assertStatus(200);
        $response->assertInertia(fn (AssertableInertia $page) => $page
            ->component('RoomBorrowing/Index')
            ->has('rooms')
            ->has('stats')
            ->where('stats.total', 1)
            ->where('stats.available', 1)
            ->where('stats.borrowed', 0)
            ->where('stats.pending_return', 0)
            ->has('permissions')
            ->where('permissions.can_borrow', true)
            ->where('permissions.can_approve_return', false)
            ->where('permissions.can_manage_rooms', false)
        );
    }

    public function test_security_user_has_approval_and_management_permissions(): void
    {
        $response = $this->actingAs($this->securityUser)->get('/room-borrowing');

        $response->assertStatus(200);
        $response->assertInertia(fn (AssertableInertia $page) => $page
            ->component('RoomBorrowing/Index')
            ->where('permissions.can_approve_return', true)
            ->where('permissions.can_manage_rooms', true)
            ->where('permissions.is_security', true)
        );
    }

    public function test_employee_can_borrow_an_available_room(): void
    {
        $response = $this->actingAs($this->employeeUser)->post('/room-borrowing/borrow', [
            'room_id' => $this->room->id,
            'expected_duration_hours' => 2,
            'purpose' => 'Front Office team coordination meeting',
        ]);

        $response->assertRedirect('/room-borrowing?tab=my-borrowings');
        $response->assertSessionHas('success');

        // Verify Database State
        $this->assertDatabaseHas('rooms', [
            'id' => $this->room->id,
            'status' => Room::STATUS_BORROWED,
        ]);

        $this->assertDatabaseHas('room_borrowing_transactions', [
            'room_id' => $this->room->id,
            'borrower_employee_id' => $this->employee->id,
            'expected_duration_hours' => 2,
            'status' => RoomBorrowingTransaction::STATUS_BORROWED,
            'purpose' => 'Front Office team coordination meeting',
        ]);

        // Verify Audit Log
        $this->assertDatabaseHas('audit_logs', [
            'user_id' => $this->employeeUser->id,
            'action' => 'ROOM_KEY_BORROWED',
            'model_type' => RoomBorrowingTransaction::class,
        ]);
    }

    public function test_employee_cannot_borrow_already_borrowed_room(): void
    {
        // First borrowing
        RoomBorrowingTransaction::create([
            'transaction_number' => 'RBR-20261021-0001',
            'room_id' => $this->room->id,
            'borrower_employee_id' => $this->employee->id,
            'borrowed_at' => Carbon::now(),
            'expected_duration_hours' => 2,
            'expected_return_at' => Carbon::now()->addHours(2),
            'status' => RoomBorrowingTransaction::STATUS_BORROWED,
        ]);
        $this->room->update(['status' => Room::STATUS_BORROWED]);

        // Second borrowing attempt
        $secondUser = User::factory()->create();
        $secondUser->assignRole('Staff / Employee');
        Employee::create([
            'user_id' => $secondUser->id,
            'employee_number' => 'SBH-102',
            'department_id' => $this->employee->department_id,
            'position_id' => $this->employee->position_id,
            'employment_status' => 'Active',
            'join_date' => Carbon::now(),
        ]);

        $response = $this->actingAs($secondUser)->post('/room-borrowing/borrow', [
            'room_id' => $this->room->id,
            'expected_duration_hours' => 2,
            'purpose' => 'Second meeting attempt',
        ]);

        $response->assertSessionHasErrors(['message']);
        $this->assertEquals(1, RoomBorrowingTransaction::where('room_id', $this->room->id)->count());
    }

    public function test_employee_can_submit_return_request_for_their_own_transaction(): void
    {
        $tx = RoomBorrowingTransaction::create([
            'transaction_number' => 'RBR-20261021-0001',
            'room_id' => $this->room->id,
            'borrower_employee_id' => $this->employee->id,
            'borrowed_at' => Carbon::now()->subHours(2),
            'expected_duration_hours' => 2,
            'expected_return_at' => Carbon::now(),
            'status' => RoomBorrowingTransaction::STATUS_BORROWED,
        ]);
        $this->room->update(['status' => Room::STATUS_BORROWED]);

        $response = $this->actingAs($this->employeeUser)->post("/room-borrowing/{$tx->id}/return-request", [
            'return_notes' => 'Key handed over at Security post, projector and AC powered off.',
        ]);

        $response->assertRedirect('/room-borrowing?tab=my-borrowings');
        $response->assertSessionHas('success');

        // Status transitions to PENDING_RETURN
        $this->assertDatabaseHas('room_borrowing_transactions', [
            'id' => $tx->id,
            'status' => RoomBorrowingTransaction::STATUS_PENDING_RETURN,
            'return_notes' => 'Key handed over at Security post, projector and AC powered off.',
        ]);

        $this->assertDatabaseHas('rooms', [
            'id' => $this->room->id,
            'status' => Room::STATUS_PENDING_RETURN,
        ]);

        // Audit log created
        $this->assertDatabaseHas('audit_logs', [
            'user_id' => $this->employeeUser->id,
            'action' => 'ROOM_KEY_RETURN_REQUESTED',
        ]);
    }

    public function test_employee_cannot_submit_return_request_for_another_employees_borrowing(): void
    {
        $tx = RoomBorrowingTransaction::create([
            'transaction_number' => 'RBR-20261021-0001',
            'room_id' => $this->room->id,
            'borrower_employee_id' => $this->employee->id,
            'borrowed_at' => Carbon::now()->subHours(2),
            'expected_duration_hours' => 2,
            'expected_return_at' => Carbon::now(),
            'status' => RoomBorrowingTransaction::STATUS_BORROWED,
        ]);

        $otherUser = User::factory()->create();
        $otherUser->assignRole('Staff / Employee');
        Employee::create([
            'user_id' => $otherUser->id,
            'employee_number' => 'SBH-999',
            'department_id' => $this->employee->department_id,
            'position_id' => $this->employee->position_id,
            'employment_status' => 'Active',
            'join_date' => Carbon::now(),
        ]);

        $response = $this->actingAs($otherUser)->post("/room-borrowing/{$tx->id}/return-request");
        $response->assertStatus(403);
    }

    public function test_regular_employee_cannot_approve_return(): void
    {
        $tx = RoomBorrowingTransaction::create([
            'transaction_number' => 'RBR-20261021-0001',
            'room_id' => $this->room->id,
            'borrower_employee_id' => $this->employee->id,
            'borrowed_at' => Carbon::now()->subHours(2),
            'expected_duration_hours' => 2,
            'expected_return_at' => Carbon::now(),
            'status' => RoomBorrowingTransaction::STATUS_PENDING_RETURN,
            'return_requested_at' => Carbon::now()->subMinutes(10),
        ]);

        // Employee attempting to approve return
        $response = $this->actingAs($this->employeeUser)->post("/room-borrowing/{$tx->id}/confirm-return", [
            'confirm_physical_receipt' => true,
        ]);

        $response->assertStatus(403);
    }

    public function test_security_user_can_confirm_return_and_room_becomes_available(): void
    {
        $tx = RoomBorrowingTransaction::create([
            'transaction_number' => 'RBR-20261021-0001',
            'room_id' => $this->room->id,
            'borrower_employee_id' => $this->employee->id,
            'borrowed_at' => Carbon::now()->subHours(2),
            'expected_duration_hours' => 2,
            'expected_return_at' => Carbon::now(),
            'status' => RoomBorrowingTransaction::STATUS_PENDING_RETURN,
            'return_requested_at' => Carbon::now()->subMinutes(15),
        ]);
        $this->room->update(['status' => Room::STATUS_PENDING_RETURN]);

        $response = $this->actingAs($this->securityUser)->post("/room-borrowing/{$tx->id}/confirm-return", [
            'confirm_physical_receipt' => true,
            'security_notes' => 'Physical room key and tag received in good condition at security desk.',
        ]);

        $response->assertRedirect('/room-borrowing?tab=pending-returns');
        $response->assertSessionHas('success');

        // Status transitions to RETURNED and room becomes AVAILABLE
        $this->assertDatabaseHas('room_borrowing_transactions', [
            'id' => $tx->id,
            'status' => RoomBorrowingTransaction::STATUS_RETURNED,
            'security_user_id' => $this->securityUser->id,
            'security_notes' => 'Physical room key and tag received in good condition at security desk.',
        ]);

        $this->assertDatabaseHas('rooms', [
            'id' => $this->room->id,
            'status' => Room::STATUS_AVAILABLE,
        ]);

        // Audit log created
        $this->assertDatabaseHas('audit_logs', [
            'user_id' => $this->securityUser->id,
            'action' => 'ROOM_KEY_RETURN_CONFIRMED',
        ]);
    }

    public function test_security_confirmation_requires_physical_receipt_checkbox(): void
    {
        $tx = RoomBorrowingTransaction::create([
            'transaction_number' => 'RBR-20261021-0001',
            'room_id' => $this->room->id,
            'borrower_employee_id' => $this->employee->id,
            'borrowed_at' => Carbon::now()->subHours(2),
            'expected_duration_hours' => 2,
            'expected_return_at' => Carbon::now(),
            'status' => RoomBorrowingTransaction::STATUS_PENDING_RETURN,
            'return_requested_at' => Carbon::now()->subMinutes(15),
        ]);

        // Attempt without checking confirm_physical_receipt
        $response = $this->actingAs($this->securityUser)->post("/room-borrowing/{$tx->id}/confirm-return", [
            'confirm_physical_receipt' => false,
        ]);

        $response->assertSessionHasErrors(['confirm_physical_receipt']);
    }

    public function test_completed_transaction_cannot_be_confirmed_again(): void
    {
        $tx = RoomBorrowingTransaction::create([
            'transaction_number' => 'RBR-20261021-0001',
            'room_id' => $this->room->id,
            'borrower_employee_id' => $this->employee->id,
            'borrowed_at' => Carbon::now()->subHours(3),
            'expected_duration_hours' => 2,
            'expected_return_at' => Carbon::now()->subHour(),
            'status' => RoomBorrowingTransaction::STATUS_RETURNED,
            'returned_at' => Carbon::now()->subHour(),
            'security_user_id' => $this->securityUser->id,
        ]);

        $response = $this->actingAs($this->securityUser)->post("/room-borrowing/{$tx->id}/confirm-return", [
            'confirm_physical_receipt' => true,
        ]);

        $response->assertSessionHasErrors(['message']);
    }

    public function test_admin_can_create_and_update_room(): void
    {
        // Create Room
        $response = $this->actingAs($this->adminUser)->post('/room-borrowing/rooms', [
            'room_number' => 'MTG-99',
            'name' => 'Meeting Room 99',
            'location' => '3rd Floor - North Wing',
            'capacity' => 10,
            'key_code' => 'KEY-MR99',
            'description' => 'Brand new conference room.',
        ]);

        $response->assertRedirect('/room-borrowing?tab=manage-rooms');
        $this->assertDatabaseHas('rooms', ['room_number' => 'MTG-99', 'name' => 'Meeting Room 99']);

        $newRoom = Room::where('room_number', 'MTG-99')->firstOrFail();

        // Update Room
        $updateResponse = $this->actingAs($this->adminUser)->put("/room-borrowing/rooms/{$newRoom->id}", [
            'room_number' => 'MTG-99',
            'name' => 'Meeting Room 99 Updated',
            'location' => '3rd Floor - West Wing',
            'capacity' => 15,
            'key_code' => 'KEY-MR99B',
            'description' => 'Updated room description.',
            'is_active' => true,
        ]);

        $updateResponse->assertRedirect('/room-borrowing?tab=manage-rooms');
        $this->assertDatabaseHas('rooms', [
            'id' => $newRoom->id,
            'name' => 'Meeting Room 99 Updated',
            'capacity' => 15,
        ]);
    }
}
