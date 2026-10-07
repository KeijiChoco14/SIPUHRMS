<?php

namespace Tests\Feature;

use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Inertia\Testing\AssertableInertia;
use Spatie\Permission\Models\Permission;
use Spatie\Permission\Models\Role;
use Spatie\Permission\PermissionRegistrar;
use Tests\TestCase;

class DashboardTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();
        app()[PermissionRegistrar::class]->forgetCachedPermissions();

        Permission::findOrCreate('test.permission');

        Role::findOrCreate('Super Admin');
        Role::findOrCreate('HRD / Admin');
        Role::findOrCreate('General Manager');
        Role::findOrCreate('Supervisor');
        Role::findOrCreate('Staff / Employee');
        Role::findOrCreate('OJT / Trainee');
    }

    public function test_employee_can_access_launcher_dashboard(): void
    {
        $user = User::factory()->create();
        $user->assignRole('Staff / Employee');

        $response = $this->actingAs($user)->get('/dashboard');

        $response->assertStatus(200);
        $response->assertInertia(fn (AssertableInertia $page) => $page
            ->component('Dashboard')
            ->has('role')
            ->where('role', 'Staff / Employee')
        );
    }

    public function test_employee_cannot_access_hr_module_via_url(): void
    {
        $user = User::factory()->create();
        $user->assignRole('Staff / Employee');

        $response = $this->actingAs($user)->get('/dashboard?view=hr');

        $response->assertStatus(403);
        $response->assertInertia(fn (AssertableInertia $page) => $page
            ->component('Error')
            ->where('status', 403)
        );
    }

    public function test_hr_can_access_hr_module_via_url(): void
    {
        $hr = User::factory()->create();
        $hr->assignRole('HRD / Admin');

        $response = $this->actingAs($hr)->get('/dashboard?view=hr');

        $response->assertStatus(200);
        $response->assertInertia(fn (AssertableInertia $page) => $page
            ->component('Dashboard')
            ->where('role', 'HRD / Admin')
        );
    }

    public function test_employee_cannot_access_employees_via_url(): void
    {
        $user = User::factory()->create();
        $user->assignRole('Staff / Employee');

        $response = $this->actingAs($user)->get('/employees');

        $response->assertStatus(403);
        $response->assertInertia(fn (AssertableInertia $page) => $page
            ->component('Error')
            ->where('status', 403)
        );
    }

    public function test_employee_cannot_access_departments_via_url(): void
    {
        $user = User::factory()->create();
        $user->assignRole('Staff / Employee');

        $response = $this->actingAs($user)->get('/departments');

        $response->assertStatus(403);
        $response->assertInertia(fn (AssertableInertia $page) => $page
            ->component('Error')
            ->where('status', 403)
        );
    }

    public function test_employee_cannot_access_payroll_management_via_url(): void
    {
        $user = User::factory()->create();
        $user->assignRole('Staff / Employee');

        $response = $this->actingAs($user)->get('/payroll');

        $response->assertStatus(403);
        $response->assertInertia(fn (AssertableInertia $page) => $page
            ->component('Error')
            ->where('status', 403)
        );
    }

    public function test_employee_cannot_access_attendance_logs_via_url(): void
    {
        $user = User::factory()->create();
        $user->assignRole('Staff / Employee');

        $response = $this->actingAs($user)->get('/attendance');

        $response->assertStatus(403);
        $response->assertInertia(fn (AssertableInertia $page) => $page
            ->component('Error')
            ->where('status', 403)
        );
    }

    public function test_trainee_can_access_launcher_dashboard(): void
    {
        $user = User::factory()->create();
        $user->assignRole('OJT / Trainee');

        $response = $this->actingAs($user)->get('/dashboard');

        $response->assertStatus(200);
        $response->assertInertia(fn (AssertableInertia $page) => $page
            ->component('Dashboard')
            ->has('role')
            ->where('role', 'OJT / Trainee')
        );
    }

    public function test_trainee_cannot_access_hr_module_via_url(): void
    {
        $user = User::factory()->create();
        $user->assignRole('OJT / Trainee');

        $response = $this->actingAs($user)->get('/employees');

        $response->assertStatus(403);
        $response->assertInertia(fn (AssertableInertia $page) => $page
            ->component('Error')
            ->where('status', 403)
        );
    }
}
