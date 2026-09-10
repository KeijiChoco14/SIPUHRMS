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

        // Need at least one permission to create a role
        Permission::findOrCreate('test.permission');

        Role::findOrCreate('Staff / Employee');
        Role::findOrCreate('Supervisor');
        Role::findOrCreate('HRD / Admin');
        Role::findOrCreate('General Manager');
    }

    public function test_employee_sees_employee_dashboard_data(): void
    {
        $user = User::factory()->create();
        $user->assignRole('Staff / Employee');

        $response = $this->actingAs($user)->get('/dashboard');

        $response->assertStatus(200);
        $response->assertInertia(fn (AssertableInertia $page) => $page
            ->component('Dashboard')
            ->has('role')
            ->where('role', 'Staff / Employee')
            ->has('employeeData')
            ->missing('supervisorData')
        );
    }

    public function test_supervisor_sees_supervisor_dashboard_data(): void
    {
        $user = User::factory()->create();
        $user->assignRole('Supervisor');

        $response = $this->actingAs($user)->get('/dashboard');

        $response->assertStatus(200);
        $response->assertInertia(fn (AssertableInertia $page) => $page
            ->component('Dashboard')
            ->where('role', 'Supervisor')
            ->has('supervisorData')
            ->missing('employeeData')
        );
    }

    public function test_hr_sees_hr_dashboard_data(): void
    {
        $user = User::factory()->create();
        $user->assignRole('HRD / Admin');

        $response = $this->actingAs($user)->get('/dashboard');

        $response->assertStatus(200);
        $response->assertInertia(fn (AssertableInertia $page) => $page
            ->component('Dashboard')
            ->where('role', 'HRD / Admin')
            ->has('hrData')
            ->missing('employeeData')
        );
    }

    public function test_manager_sees_manager_dashboard_data(): void
    {
        $user = User::factory()->create();
        $user->assignRole('General Manager');

        $response = $this->actingAs($user)->get('/dashboard');

        $response->assertStatus(200);
        $response->assertInertia(fn (AssertableInertia $page) => $page
            ->component('Dashboard')
            ->where('role', 'General Manager')
            ->has('managerData')
            ->missing('employeeData')
        );
    }
}
