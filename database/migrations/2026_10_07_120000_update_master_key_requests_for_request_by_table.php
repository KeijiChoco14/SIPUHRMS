<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::table('master_key_requests', function (Blueprint $table) {
            if (!Schema::hasColumn('master_key_requests', 'request_by')) {
                $table->string('request_by')->nullable()->after('request_type');
            }
            $table->foreignId('employee_id')->nullable()->change();
            $table->foreignId('department_id')->nullable()->change();
        });

        // Backfill existing records: set request_by from employee's user name or requested_by_username
        try {
            DB::statement("
                UPDATE master_key_requests m
                LEFT JOIN employees e ON m.employee_id = e.id
                LEFT JOIN users u ON e.user_id = u.id
                SET m.request_by = COALESCE(u.name, m.requested_by_username, 'Pemohon')
                WHERE m.request_by IS NULL OR m.request_by = ''
            ");
        } catch (\Throwable $e) {
            // Silently continue if update fails
        }
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('master_key_requests', function (Blueprint $table) {
            if (Schema::hasColumn('master_key_requests', 'request_by')) {
                $table->dropColumn('request_by');
            }
        });
    }
};
