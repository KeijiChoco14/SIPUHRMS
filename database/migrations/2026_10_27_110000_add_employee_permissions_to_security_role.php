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

        $employeePermissions = [
            'task.view',
            'task.update',
            'task.comment',
            'performance.view',
        ];

        foreach ($employeePermissions as $permName) {
            Permission::firstOrCreate(['name' => $permName]);
        }

        $securityRole = Role::where('name', 'Security')->first();
        if ($securityRole) {
            $securityRole->givePermissionTo($employeePermissions);
        }

        app()[PermissionRegistrar::class]->forgetCachedPermissions();
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        app()[PermissionRegistrar::class]->forgetCachedPermissions();

        $employeePermissions = [
            'task.view',
            'task.update',
            'task.comment',
            'performance.view',
        ];

        $securityRole = Role::where('name', 'Security')->first();
        if ($securityRole) {
            $securityRole->revokePermissionTo($employeePermissions);
        }

        app()[PermissionRegistrar::class]->forgetCachedPermissions();
    }
};
