<?php

namespace Tests\Feature\Auth;

use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class RegistrationTest extends TestCase
{
    use RefreshDatabase;

    /**
     * Scenario 1: A new user can open the registration page.
     */
    public function test_registration_screen_can_be_rendered(): void
    {
        $response = $this->get('/register');

        $response->assertStatus(200);
    }

    /**
     * Scenario 2 & 3 & 7 & 8: Registration with required phone number succeeds,
     * receives pending status, and redirects to registration-pending confirmation page.
     */
    public function test_new_users_can_register_with_phone_number_and_receive_pending_status(): void
    {
        $response = $this->post('/register', [
            'name' => 'Budi Santoso',
            'username' => 'budi_santoso',
            'email' => 'budi.santoso@swiss-belhotel.com',
            'phone_number' => '081234567890',
            'password' => 'SwissBel2026!',
            'password_confirmation' => 'SwissBel2026!',
            'terms' => true,
        ]);

        $response->assertSessionHasNoErrors();
        // Crucial security requirement: user is NOT auto-authenticated
        $this->assertGuest();
        $response->assertRedirect(route('registration.pending', absolute: false));

        $user = User::where('email', 'budi.santoso@swiss-belhotel.com')->first();
        $this->assertNotNull($user);
        $this->assertEquals('budi_santoso', $user->username);
        $this->assertEquals('pending', $user->status);
        $this->assertNotNull($user->phone_number);
        $this->assertTrue($user->hasRole('Staff / Employee'));
        $this->assertNotNull($user->employee);
        $this->assertEquals($user->phone_number, $user->employee->phone_number);
    }

    /**
     * Scenario 4: Missing or invalid phone numbers are rejected with appropriate validation messages.
     */
    public function test_missing_phone_number_is_rejected(): void
    {
        $response = $this->post('/register', [
            'name' => 'No Phone User',
            'username' => 'nophone',
            'email' => 'nophone@example.com',
            'phone_number' => '',
            'password' => 'password123',
            'password_confirmation' => 'password123',
            'terms' => true,
        ]);

        $response->assertSessionHasErrors(['phone_number']);
        $this->assertGuest();
    }

    public function test_invalid_phone_number_format_is_rejected(): void
    {
        $response = $this->post('/register', [
            'name' => 'Bad Phone User',
            'username' => 'badphone',
            'email' => 'badphone@example.com',
            'phone_number' => 'not-a-number',
            'password' => 'password123',
            'password_confirmation' => 'password123',
            'terms' => true,
        ]);

        $response->assertSessionHasErrors(['phone_number']);
        $this->assertGuest();
    }

    /**
     * Scenario 5: Valid Indonesian phone number formats are accepted (+62, 62, 08).
     */
    public function test_valid_indonesian_phone_number_formats_are_accepted(): void
    {
        $formats = [
            '081234567890',
            '+6281234567890',
            '6281234567890',
        ];

        foreach ($formats as $index => $phone) {
            $email = "test{$index}@swiss-belhotel.com";
            $username = "user_{$index}_test";

            $response = $this->post('/register', [
                'name' => "User {$index}",
                'username' => $username,
                'email' => $email,
                'phone_number' => $phone,
                'password' => 'SwissBel2026!',
                'password_confirmation' => 'SwissBel2026!',
                'terms' => true,
            ]);

            $response->assertSessionHasNoErrors();
            $response->assertRedirect(route('registration.pending', absolute: false));
            $this->assertDatabaseHas('users', ['email' => $email]);
        }
    }

    /**
     * Scenario 6: Phone numbers are stored correctly as strings and preserved.
     */
    public function test_phone_numbers_are_stored_correctly_as_strings(): void
    {
        $user = User::factory()->create([
            'phone_number' => '081234567890',
            'status' => 'pending',
        ]);

        $this->assertIsString($user->phone_number);
        $this->assertNotEmpty($user->phone_number);
    }

    /**
     * Scenario 8: Newly registered users can view the registration-pending confirmation page.
     */
    public function test_registration_pending_confirmation_page_can_be_rendered(): void
    {
        $response = $this->get('/registration-pending');

        $response->assertStatus(200);
    }

    /**
     * Scenario 21: Obsolete email verification routes return 404.
     */
    public function test_obsolete_email_verification_routes_do_not_exist(): void
    {
        $response = $this->get('/verify-email');
        $response->assertStatus(404);

        $responsePost = $this->post('/email/verification-notification');
        $responsePost->assertStatus(404);
    }
}
