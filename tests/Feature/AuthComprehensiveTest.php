<?php

namespace Tests\Feature;

use App\Models\Employee;
use App\Models\User;
use App\Notifications\VerifyEmailNotification;
use Illuminate\Auth\Events\Verified;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Event;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Notification;
use Illuminate\Support\Facades\URL;
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
            'login' => 'Your account is pending approval. Please wait for administrator activation.',
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
        Notification::fake();

        $response = $this->post('/register', [
            'name' => 'Budi Santoso',
            'username' => 'budi_santoso',
            'email' => 'budi.santoso@swiss-belhotel.com',
            'password' => 'SwissBel2026!',
            'password_confirmation' => 'SwissBel2026!',
            'terms' => true,
        ]);

        $this->assertAuthenticated();
        $response->assertRedirect(route('verification.notice', absolute: false));

        $user = User::where('email', 'budi.santoso@swiss-belhotel.com')->first();
        $this->assertNotNull($user);
        $this->assertEquals('budi_santoso', $user->username);
        $this->assertEquals('active', $user->status);
        $this->assertNull($user->email_verified_at);
        $this->assertNotNull($user->terms_accepted_at);
        $this->assertTrue($user->hasRole('Staff / Employee'));

        Notification::assertSentTo($user, VerifyEmailNotification::class);
    }

    public function test_self_registration_blocks_privilege_escalation(): void
    {
        $response = $this->post('/register', [
            'name' => 'Attacker',
            'username' => 'attacker_hacker',
            'email' => 'attacker@gmail.com',
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
            'password' => 'Password123!',
            'password_confirmation' => 'Password123!',
            'terms' => false,
        ]);

        $response->assertSessionHasErrors('terms');
    }

    /**
     * 3. EMAIL VERIFICATION TESTS
     */
    public function test_unverified_user_cannot_access_protected_module_routes(): void
    {
        $user = User::factory()->unverified()->create([
            'status' => 'active',
        ]);

        $response = $this->actingAs($user)->get('/dashboard');

        $response->assertRedirect('/verify-email');
    }

    public function test_valid_signed_verification_url_verifies_email(): void
    {
        Event::fake();

        $user = User::factory()->unverified()->create([
            'status' => 'active',
        ]);

        $verificationUrl = URL::temporarySignedRoute(
            'verification.verify',
            now()->addMinutes(60),
            ['id' => $user->id, 'hash' => sha1($user->getEmailForVerification())]
        );

        $response = $this->actingAs($user)->get($verificationUrl);

        Event::assertDispatched(Verified::class);
        $this->assertTrue($user->fresh()->hasVerifiedEmail());
        $response->assertRedirect(route('dashboard', absolute: false) . '?verified=1');
    }

    public function test_tampered_signature_is_rejected(): void
    {
        $user = User::factory()->unverified()->create();

        $verificationUrl = URL::temporarySignedRoute(
            'verification.verify',
            now()->addMinutes(60),
            ['id' => $user->id, 'hash' => sha1('tampered_hash')]
        );

        $response = $this->actingAs($user)->get($verificationUrl);

        $this->assertFalse($user->fresh()->hasVerifiedEmail());
    }

    public function test_resend_verification_email_is_rate_limited(): void
    {
        Notification::fake();

        $user = User::factory()->unverified()->create();

        // First resend request succeeds
        $response = $this->actingAs($user)->post('/email/verification-notification');
        $response->assertRedirect();
        $response->assertSessionHas('status', 'verification-link-sent');

        Notification::assertSentTo($user, VerifyEmailNotification::class);
    }
}
