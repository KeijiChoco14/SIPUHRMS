<?php

namespace Tests\Feature;

use App\Models\Employee;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Event;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Notification;
use Spatie\Permission\Models\Role;
use Tests\TestCase;

class AuthComprehensiveTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();
        Role::firstOrCreate(['name' => 'Staff / Employee']);
        Role::firstOrCreate(['name' => 'Super Admin']);
        Role::firstOrCreate(['name' => 'HRD / Admin']);
    }

    /**
     * 1. LOGIN TESTS
     */
    public function test_user_can_login_with_valid_email_and_password(): void
    {
        $user = User::factory()->create([
            'email' => 'staff@swiss-belinn.com',
            'username' => 'staff_pku',
            'password' => Hash::make('Secret123!'),
            'status' => 'active',
            'email_verified_at' => now(),
        ]);

        $response = $this->post('/login', [
            'login' => 'staff@swiss-belinn.com',
            'password' => 'Secret123!',
        ]);

        $this->assertAuthenticatedAs($user);
        $response->assertRedirect(route('dashboard', absolute: false));
    }

    public function test_user_can_login_with_valid_username_and_password(): void
    {
        $user = User::factory()->create([
            'email' => 'fo_agent@swiss-belinn.com',
            'username' => 'fo_agent',
            'password' => Hash::make('Secret123!'),
            'status' => 'active',
            'email_verified_at' => now(),
        ]);

        $response = $this->post('/login', [
            'login' => 'fo_agent',
            'password' => 'Secret123!',
        ]);

        $this->assertAuthenticatedAs($user);
        $response->assertRedirect(route('dashboard', absolute: false));
    }

    public function test_user_can_login_with_case_insensitive_username(): void
    {
        $user = User::factory()->create([
            'email' => 'case_test@swiss-belinn.com',
            'username' => 'swiss_user',
            'password' => Hash::make('Secret123!'),
            'status' => 'active',
            'email_verified_at' => now(),
        ]);

        $response = $this->post('/login', [
            'login' => 'SWISS_USER',
            'password' => 'Secret123!',
        ]);

        $this->assertAuthenticatedAs($user);
    }

    public function test_login_rejects_incorrect_password_with_generic_message(): void
    {
        User::factory()->create([
            'email' => 'valid_user@swiss-belinn.com',
            'username' => 'valid_user',
            'password' => Hash::make('CorrectPassword1!'),
        ]);

        $response = $this->post('/login', [
            'login' => 'valid_user',
            'password' => 'WrongPassword',
        ]);

        $this->assertGuest();
        $response->assertSessionHasErrors([
            'login' => 'Invalid email or username or password.',
        ]);
    }

    public function test_login_rejects_unknown_identifier_with_generic_message(): void
    {
        $response = $this->post('/login', [
            'login' => 'completely_unknown_user_123',
            'password' => 'AnyPassword',
        ]);

        $this->assertGuest();
        $response->assertSessionHasErrors([
            'login' => 'Invalid email or username or password.',
        ]);
    }

    public function test_disabled_account_cannot_login(): void
    {
        User::factory()->create([
            'email' => 'disabled_staff@swiss-belinn.com',
            'username' => 'disabled_staff',
            'password' => Hash::make('Password123!'),
            'status' => 'disabled',
            'email_verified_at' => now(),
        ]);

        $response = $this->post('/login', [
            'login' => 'disabled_staff',
            'password' => 'Password123!',
        ]);

        $this->assertGuest();
        $response->assertSessionHasErrors([
            'login' => 'Your account is disabled. Please contact the administrator.',
        ]);
    }

    public function test_pending_approval_account_cannot_login(): void
    {
        User::factory()->create([
            'email' => 'pending_staff@swiss-belinn.com',
            'username' => 'pending_staff',
            'password' => Hash::make('Password123!'),
            'status' => 'pending_approval',
            'email_verified_at' => now(),
        ]);

        $response = $this->post('/login', [
            'login' => 'pending_staff',
            'password' => 'Password123!',
        ]);

        $this->assertGuest();
        $response->assertSessionHasErrors([
            'login' => 'Your registration is awaiting approval from the IT Department. Please contact the IT Department directly if you require assistance.',
        ]);
    }

    public function test_login_is_rate_limited_after_repeated_failures(): void
    {
        for ($i = 0; $i < 5; $i++) {
            $this->post('/login', [
                'login' => 'rate_test_user',
                'password' => 'wrong',
            ]);
        }

        $response = $this->post('/login', [
            'login' => 'rate_test_user',
            'password' => 'wrong',
        ]);

        $response->assertSessionHasErrors('login');
        $errorMessage = session('errors')->first('login');
        $this->assertStringContainsString('Too many login attempts', $errorMessage);
    }

    /**
     * 2. SELF-REGISTRATION TESTS
     */
    public function test_self_registration_creates_account_with_least_privileged_role(): void
    {
        $response = $this->post('/register', [
            'name' => 'Budi Santoso',
            'username' => 'budi_santoso',
            'email' => 'budi.santoso@swiss-belhotel.com',
            'phone_number' => '+6281234567890',
            'password' => 'SwissBel2026!',
            'password_confirmation' => 'SwissBel2026!',
            'terms' => true,
        ]);

        $this->assertGuest();
        $response->assertRedirect(route('registration.pending', absolute: false));

        $user = User::where('email', 'budi.santoso@swiss-belhotel.com')->first();
        $this->assertNotNull($user);
        $this->assertEquals('budi_santoso', $user->username);
        $this->assertEquals('pending', $user->status);
        $this->assertEquals('+6281234567890', $user->phone_number);
        $this->assertNotNull($user->terms_accepted_at);
        $this->assertTrue($user->hasRole('Staff / Employee'));
        $this->assertNotNull($user->employee);
        $this->assertNotEmpty($user->employee->employee_number);
        $this->assertEquals('Active', $user->employee->account_status);
    }

    public function test_self_registration_blocks_privilege_escalation(): void
    {
        $response = $this->post('/register', [
            'name' => 'Attacker',
            'username' => 'attacker_hacker',
            'email' => 'attacker@gmail.com',
            'phone_number' => '+6281299990000',
            'password' => 'HackerPass123!',
            'password_confirmation' => 'HackerPass123!',
            'terms' => true,
            'role' => 'Super Admin',
            'roles' => ['Super Admin', 'HRD / Admin'],
            'status' => 'active',
        ]);

        $user = User::where('email', 'attacker@gmail.com')->first();
        $this->assertNotNull($user);
        $this->assertFalse($user->hasRole('Super Admin'));
        $this->assertFalse($user->hasRole('HRD / Admin'));
        $this->assertTrue($user->hasRole('Staff / Employee'));
        $this->assertEquals('pending', $user->status);
    }

    public function test_self_registration_rejects_duplicate_username_case_insensitively(): void
    {
        User::factory()->create([
            'username' => 'existing_user',
            'email' => 'original@swiss-belhotel.com',
        ]);

        $response = $this->post('/register', [
            'name' => 'Duplicate Username Tester',
            'username' => 'EXISTING_USER',
            'email' => 'new_email@swiss-belhotel.com',
            'phone_number' => '+6281234567891',
            'password' => 'Password123!',
            'password_confirmation' => 'Password123!',
            'terms' => true,
        ]);

        $response->assertSessionHasErrors('username');
    }

    public function test_self_registration_rejects_duplicate_email(): void
    {
        User::factory()->create([
            'username' => 'user_one',
            'email' => 'duplicate@swiss-belhotel.com',
        ]);

        $response = $this->post('/register', [
            'name' => 'Duplicate Email Tester',
            'username' => 'user_two',
            'email' => 'DUPLICATE@swiss-belhotel.com',
            'phone_number' => '+6281234567892',
            'password' => 'Password123!',
            'password_confirmation' => 'Password123!',
            'terms' => true,
        ]);

        $response->assertSessionHasErrors('email');
    }

    public function test_self_registration_rejects_invalid_username_characters(): void
    {
        $response = $this->post('/register', [
            'name' => 'Invalid User',
            'username' => 'invalid username with spaces!',
            'email' => 'test_invalid@swiss-belhotel.com',
            'phone_number' => '+6281234567893',
            'password' => 'Password123!',
            'password_confirmation' => 'Password123!',
            'terms' => true,
        ]);

        $response->assertSessionHasErrors('username');
    }

    public function test_self_registration_rejects_unaccepted_terms(): void
    {
        $response = $this->post('/register', [
            'name' => 'No Terms User',
            'username' => 'no_terms_user',
            'email' => 'noterms@swiss-belhotel.com',
            'phone_number' => '+6281234567894',
            'password' => 'Password123!',
            'password_confirmation' => 'Password123!',
            'terms' => false,
        ]);

        $response->assertSessionHasErrors('terms');
    }

    /**
     * 3. IT APPROVAL ENFORCEMENT TESTS
     */
    public function test_pending_user_cannot_access_protected_module_routes(): void
    {
        $user = User::factory()->pending()->create([
            'status' => 'pending',
        ]);

        $response = $this->actingAs($user)->get('/dashboard');

        $this->assertGuest();
        $response->assertRedirect('/login');
    }

    public function test_rejected_user_cannot_access_protected_module_routes(): void
    {
        $user = User::factory()->rejected()->create([
            'status' => 'rejected',
        ]);

        $response = $this->actingAs($user)->get('/dashboard');

        $this->assertGuest();
        $response->assertRedirect('/login');
    }

    public function test_approved_user_can_access_protected_module_routes(): void
    {
        $user = User::factory()->approved()->create([
            'status' => 'approved',
        ]);

        $response = $this->actingAs($user)->get('/dashboard');

        $response->assertStatus(200);
    }
}
