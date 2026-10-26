<?php

namespace Tests\Feature\Auth;

use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class RegistrationTest extends TestCase
{
    use RefreshDatabase;

    public function test_registration_screen_can_be_rendered(): void
    {
        $response = $this->get('/register');

        $response->assertStatus(200);
    }

    public function test_new_users_can_register(): void
    {
        \Illuminate\Support\Facades\Notification::fake();

        $response = $this->post('/register', [
            'name' => 'Test User',
            'username' => 'testuser',
            'email' => 'test@example.com',
            'password' => 'password123',
            'password_confirmation' => 'password123',
            'terms' => true,
        ]);

        $response->assertSessionHasNoErrors();
        $this->assertAuthenticated();
        $response->assertRedirect(route('verification.notice', absolute: false));

        $user = User::where('email', 'test@example.com')->first();
        $this->assertNotNull($user);
        $this->assertEquals('testuser', $user->username);
        $this->assertNull($user->email_verified_at);
        $this->assertEquals('active', $user->status);
        $this->assertNotNull($user->terms_accepted_at);
        $this->assertTrue($user->hasRole('Staff / Employee'));

        \Illuminate\Support\Facades\Notification::assertSentTo(
            $user,
            \App\Notifications\VerifyEmailNotification::class
        );
    }

    public function test_registration_cannot_self_assign_privileged_roles(): void
    {
        $this->post('/register', [
            'name' => 'Attacker User',
            'username' => 'attacker',
            'email' => 'attacker@example.com',
            'password' => 'password123',
            'password_confirmation' => 'password123',
            'terms' => true,
            'role' => 'Super Administrator',
            'roles' => ['Super Administrator', 'Human Resources Manager'],
        ]);

        $user = User::where('email', 'attacker@example.com')->first();
        $this->assertNotNull($user);
        $this->assertFalse($user->hasRole('Super Administrator'));
        $this->assertTrue($user->hasRole('Staff / Employee'));
    }
}
