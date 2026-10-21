<?php

use Illuminate\Database\Migrations\Migration;
use Spatie\Permission\Models\Permission;
use Spatie\Permission\Models\Role;
use Spatie\Permission\PermissionRegistrar;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        // Reset cached roles and permissions
        app()[PermissionRegistrar::class]->forgetCachedPermissions();

        // 1. Create Room & Key Management Permissions
        $permissions = [
            'room.view',
            'room.borrow',
            'room.return.request',
            'room.return.approve',
            'room.manage',
        ];

        foreach ($permissions as $permName) {
            Permission::firstOrCreate(['name' => $permName]);
        }

        // 2. Create or Retrieve the Security Role
        $roleSecurity = Role::firstOrCreate(['name' => 'Security']);
        $roleSecurity->syncPermissions([
            'room.view',
            'room.borrow',
            'room.return.request',
            'room.return.approve',
            'room.manage',
        ]);

        // 3. Super Admin gets all permissions
        $roleSuperAdmin = Role::where('name', 'Super Admin')->first();
        if ($roleSuperAdmin) {
            $roleSuperAdmin->givePermissionTo($permissions);
        }

        // 4. HRD / Admin
        $roleHRD = Role::where('name', 'HRD / Admin')->first();
        if ($roleHRD) {
            $roleHRD->givePermissionTo($permissions);
        }

        // 5. General Manager
        $roleGM = Role::where('name', 'General Manager')->first();
        if ($roleGM) {
            $roleGM->givePermissionTo([
                'room.view',
                'room.borrow',
                'room.return.request',
                'room.return.approve',
            ]);
        }

        // 6. General Staff Roles (can view, borrow, submit return request)
        $staffRoles = ['Head of Department', 'Supervisor', 'Staff / Employee', 'OJT / Trainee'];
        foreach ($staffRoles as $roleName) {
            $role = Role::where('name', $roleName)->first();
            if ($role) {
                $role->givePermissionTo([
                    'room.view',
                    'room.borrow',
                    'room.return.request',
                ]);
            }
        }
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        app()[PermissionRegistrar::class]->forgetCachedPermissions();

        $permissions = [
            'room.view',
            'room.borrow',
            'room.return.request',
            'room.return.approve',
            'room.manage',
        ];

        Permission::whereIn('name', $permissions)->delete();

        $roleSecurity = Role::where('name', 'Security')->first();
        if ($roleSecurity) {
            $roleSecurity->delete();
        }
    }
};
