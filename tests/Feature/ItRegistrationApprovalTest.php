<?php

namespace Tests\Feature;

use App\Models\Department;
use App\Models\Employee;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Hash;
use Spatie\Permission\Models\Role;
use Tests\TestCase;

class ItRegistrationApprovalTest extends TestCase
{
    use RefreshDatabase;

    protected User $superAdmin;
    protected User $itStaff;
    protected User $regularStaff;
    protected Department $itDepartment;
    protected Department $foDepartment;

    protected function setUp(): void
    {
        parent::setUp();

        // Create standard roles
        Role::firstOrCreate(['name' => 'Super Admin']);
        Role::firstOrCreate(['name' => 'General Manager']);
        Role::firstOrCreate(['name' => 'Staff / Employee']);

        // Create IT Department
        $this->itDepartment = Department::create([
            'name' => 'IT',
            'description' => 'Information Technology Department',
        ]);

        $this->foDepartment = Department::create([
            'name' => 'Front Office',
            'description' => 'Front Office Department',
        ]);

        // Create Super Admin user
        $this->superAdmin = User::factory()->create([
            'name' => 'Super Administrator',
            'email' => 'superadmin@swiss-belhotel.com',
            'status' => 'active',
        ]);
        $this->superAdmin->assignRole('Super Admin');

        // Create IT Staff user
        $this->itStaff = User::factory()->create([
            'name' => 'IT Support Officer',
            'email' => 'it.support@swiss-belhotel.com',
            'phone_number' => '+628111222333',
            'status' => 'approved',
        ]);
        $this->itStaff->assignRole('Staff / Employee');
        Employee::create([
            'user_id' => $this->itStaff->id,
            'employee_number' => 'SBH-088',
            'phone_number' => '+628111222333',
            'department_id' => $this->itDepartment->id,
            'employment_status' => 'Permanent',
            'account_status' => 'Active',
            'join_date' => now()->toDateString(),
        ]);

        // Create Regular Non-IT Staff user
        $this->regularStaff = User::factory()->create([
            'name' => 'FO Receptionist',
            'email' => 'receptionist@swiss-belhotel.com',
            'phone_number' => '+628222333444',
            'status' => 'approved',
        ]);
        $this->regularStaff->assignRole('Staff / Employee');
        Employee::create([
            'user_id' => $this->regularStaff->id,
            'employee_number' => 'SBH-089',
            'phone_number' => '+628222333444',
            'department_id' => $this->foDepartment->id,
            'employment_status' => 'Permanent',
            'account_status' => 'Active',
            'join_date' => now()->toDateString(),
        ]);
    }

    /**
     * Scenario 9: Pending accounts cannot log in to access protected application resources.
     * Expects exact English error message.
     */
    public function test_pending_accounts_cannot_log_in(): void
    {
        $pendingUser = User::factory()->pending()->create([
            'email' => 'pending@swiss-belhotel.com',
            'password' => Hash::make('password123'),
        ]);

        $response = $this->post('/login', [
            'login' => 'pending@swiss-belhotel.com',
            'password' => 'password123',
        ]);

        $this->assertGuest();
        $response->assertSessionHasErrors(['login']);
        $this->assertStringContainsString(
            'Your registration is awaiting approval from the IT Department. Please contact the IT Department directly if you require assistance.',
            session('errors')->first('login')
        );
    }

    /**
     * Scenario 10: Pending users cannot bypass approval through direct URLs or API requests.
     */
    public function test_pending_users_are_blocked_from_direct_urls_and_apis_by_middleware(): void
    {
        $pendingUser = User::factory()->pending()->create([
            'status' => 'pending',
        ]);

        // Web route test
        $response = $this->actingAs($pendingUser)->get('/dashboard');
        $this->assertGuest();
        $response->assertRedirect(route('login'));

        // API route / JSON test
        $apiResponse = $this->actingAs($pendingUser)->getJson('/dashboard');
        $apiResponse->assertStatus(403);
        $apiResponse->assertJsonFragment([
            'message' => 'Your registration is awaiting approval from the IT Department. Please contact the IT Department directly if you require assistance.',
        ]);
    }

    /**
     * Scenario 11 & 12: Authorized IT users can view pending registrations and phone numbers.
     */
    public function test_authorized_it_users_can_view_pending_registrations(): void
    {
        $candidate = User::factory()->pending()->create([
            'name' => 'Prospective Employee',
            'phone_number' => '+6281298765432',
        ]);

        $response = $this->actingAs($this->itStaff)->get('/it/registrations');

        $response->assertStatus(200);
        $response->assertSee('Prospective Employee');
        $response->assertSee('+6281298765432');
    }

    /**
     * Scenario 13 & 14: Authorized IT users can approve registrations, and approved users can log in.
     */
    public function test_authorized_it_users_can_approve_registrations_and_user_can_access(): void
    {
        $candidate = User::factory()->pending()->create([
            'email' => 'candidate@swiss-belhotel.com',
            'password' => Hash::make('SecretPass123!'),
            'phone_number' => '+6281234567890',
        ]);

        $response = $this->actingAs($this->itStaff)->post("/it/registrations/{$candidate->id}/approve");

        $response->assertSessionHas('success');
        $freshCandidate = $candidate->fresh();
        $this->assertEquals('approved', $freshCandidate->status);
        $this->assertEquals($this->itStaff->id, $freshCandidate->approved_by);
        $this->assertNotNull($freshCandidate->approved_at);
        $this->assertNull($freshCandidate->rejection_reason);

        // Log out IT staff before testing candidate login
        $this->post('/logout');

        // Now verify candidate can log in and access protected dashboard
        $loginResponse = $this->post('/login', [
            'login' => 'candidate@swiss-belhotel.com',
            'password' => 'SecretPass123!',
        ]);

        $loginResponse->assertSessionHasNoErrors();
        $this->assertAuthenticatedAs($freshCandidate);

        $dashResponse = $this->actingAs($freshCandidate)->get('/dashboard');
        $dashResponse->assertStatus(200);
    }

    /**
     * Scenario 15 & 16: Authorized IT users can reject registrations, and rejected accounts are blocked.
     */
    public function test_authorized_it_users_can_reject_registrations_and_user_is_blocked(): void
    {
        $candidate = User::factory()->pending()->create([
            'email' => 'rejected.candidate@swiss-belhotel.com',
            'password' => Hash::make('SecretPass123!'),
        ]);

        $response = $this->actingAs($this->itStaff)->post("/it/registrations/{$candidate->id}/reject", [
            'reason' => 'Candidate phone number could not be reached for HR verification.',
        ]);

        $response->assertSessionHas('success');
        $freshCandidate = $candidate->fresh();
        $this->assertEquals('rejected', $freshCandidate->status);
        $this->assertEquals($this->itStaff->id, $freshCandidate->approved_by);
        $this->assertNotNull($freshCandidate->approved_at);
        $this->assertEquals('Candidate phone number could not be reached for HR verification.', $freshCandidate->rejection_reason);

        // Log out IT staff before testing rejected login
        $this->post('/logout');

        // Attempting to log in as rejected user fails with exact copy
        $loginResponse = $this->post('/login', [
            'login' => 'rejected.candidate@swiss-belhotel.com',
            'password' => 'SecretPass123!',
        ]);

        $this->assertGuest();
        $loginResponse->assertSessionHasErrors(['login']);
        $this->assertStringContainsString(
            'Your registration has not been approved. Please contact the IT Department for further information.',
            session('errors')->first('login')
        );

        // Direct URL / API access is also blocked by middleware
        $apiResponse = $this->actingAs($freshCandidate)->getJson('/dashboard');
        $apiResponse->assertStatus(403);
        $apiResponse->assertJsonFragment([
            'message' => 'Your registration has not been approved. Please contact the IT Department for further information.',
        ]);
    }

    /**
     * Scenario 17: Unauthorized non-IT users cannot approve or reject registrations.
     */
    public function test_unauthorized_users_cannot_access_or_manage_registrations(): void
    {
        $candidate = User::factory()->pending()->create();

        // Regular Non-IT Staff attempt to view
        $viewResponse = $this->actingAs($this->regularStaff)->get('/it/registrations');
        $viewResponse->assertStatus(403);

        // Regular Non-IT Staff attempt to approve
        $approveResponse = $this->actingAs($this->regularStaff)->post("/it/registrations/{$candidate->id}/approve");
        $approveResponse->assertStatus(403);
        $this->assertEquals('pending', $candidate->fresh()->status);

        // Regular Non-IT Staff attempt to reject
        $rejectResponse = $this->actingAs($this->regularStaff)->post("/it/registrations/{$candidate->id}/reject");
        $rejectResponse->assertStatus(403);
        $this->assertEquals('pending', $candidate->fresh()->status);
    }

    /**
     * Scenario 18: Existing approved/active users retain their access seamlessly.
     */
    public function test_existing_active_and_approved_users_retain_full_access(): void
    {
        $existingActiveUser = User::factory()->create([
            'email' => 'active.staff@swiss-belhotel.com',
            'password' => Hash::make('ActivePass123!'),
            'status' => 'active',
        ]);

        $response = $this->post('/login', [
            'login' => 'active.staff@swiss-belhotel.com',
            'password' => 'ActivePass123!',
        ]);

        $response->assertSessionHasNoErrors();
        $this->assertAuthenticatedAs($existingActiveUser);

        $dashResponse = $this->actingAs($existingActiveUser)->get('/dashboard');
        $dashResponse->assertStatus(200);
    }

    /**
     * Scenario 20: Password reset functionality continues to work.
     */
    public function test_password_reset_screens_remain_operational(): void
    {
        $response = $this->get('/forgot-password');
        $response->assertStatus(200);
    }

    /**
     * Scenario 22: Account approval status is enforced consistently across protected routes and APIs.
     */
    public function test_approval_status_enforced_across_profile_and_operational_modules(): void
    {
        $pendingUser = User::factory()->pending()->create();

        $routes = [
            '/dashboard',
            '/profile',
            '/projects',
            '/tasks',
            '/it',
        ];

        foreach ($routes as $route) {
            $response = $this->actingAs($pendingUser)->get($route);
            $this->assertGuest();
            $response->assertRedirect(route('login'));
        }
    }
}
