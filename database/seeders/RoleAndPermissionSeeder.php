<?php

namespace Database\Seeders;

use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;
use Spatie\Permission\Models\Permission;
use Spatie\Permission\Models\Role;
use Spatie\Permission\PermissionRegistrar;

class RoleAndPermissionSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // Reset cached roles and permissions
        app()[PermissionRegistrar::class]->forgetCachedPermissions();

        // create permissions
        $permissions = [
            'employee.view', 'employee.create', 'employee.update', 'employee.delete',
            'project.view', 'project.create', 'project.update', 'project.delete',
            'task.view', 'task.create', 'task.assign', 'task.update', 'task.delete', 'task.comment', 'task.review',
            'performance.view', 'performance.assess',
            'report.view',
            'system.manage',
        ];

        foreach ($permissions as $permission) {
            Permission::create(['name' => $permission]);
        }

        // create roles and assign created permissions
        $roleSuperAdmin = Role::create(['name' => 'Super Admin']);
        $roleSuperAdmin->givePermissionTo(Permission::all());

        $roleHRD = Role::create(['name' => 'HRD / Admin']);
        $roleHRD->givePermissionTo([
            'employee.view', 'employee.create', 'employee.update', 'employee.delete',
            'performance.view', 'performance.assess',
            'report.view',
        ]);

        $roleGM = Role::create(['name' => 'General Manager']);
        $roleGM->givePermissionTo([
            'project.view', 'task.view', 'performance.view', 'report.view',
        ]);

        $roleHoD = Role::create(['name' => 'Head of Department']);
        $roleHoD->givePermissionTo([
            'project.view', 'project.create', 'project.update',
            'task.view', 'task.create', 'task.assign', 'task.update', 'task.comment', 'task.review',
            'performance.view', 'performance.assess',
        ]);

        $roleSupervisor = Role::create(['name' => 'Supervisor']);
        $roleSupervisor->givePermissionTo([
            'task.view', 'task.create', 'task.assign', 'task.update', 'task.comment', 'task.review',
            'performance.view', 'performance.assess',
        ]);

        $roleStaff = Role::create(['name' => 'Staff / Employee']);
        $roleStaff->givePermissionTo([
            'task.view', 'task.update', 'task.comment',
            'performance.view',
        ]);

        // Create a default super admin user
        $admin = User::firstOrCreate([
            'email' => 'admin@swissbelhotel.com',
        ], [
            'name' => 'Super Administrator',
            'password' => Hash::make('password'),
        ]);

        $admin->assignRole($roleSuperAdmin);
    }
}
