<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        $role = \Spatie\Permission\Models\Role::firstOrCreate(['name' => 'OJT / Trainee']);
        $permissions = ['task.view', 'task.update', 'task.comment', 'performance.view'];
        foreach ($permissions as $permName) {
            \Spatie\Permission\Models\Permission::findOrCreate($permName);
        }
        $role->syncPermissions($permissions);
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        $role = \Spatie\Permission\Models\Role::where('name', 'OJT / Trainee')->first();
        if ($role) {
            $role->delete();
        }
    }
};
