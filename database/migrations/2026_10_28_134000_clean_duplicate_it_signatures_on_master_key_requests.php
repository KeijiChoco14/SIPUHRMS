<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        if (Schema::hasTable('master_key_requests')) {
            // Clean up any it_signature that was duplicated from HOD signature
            DB::statement("UPDATE master_key_requests SET it_signature = NULL WHERE it_signature IS NOT NULL AND (it_signature = hod_signature OR it_signature = approver_signature)");

            // Ensure requests not yet created/updated by IT do not have an IT signature
            DB::statement("UPDATE master_key_requests SET it_signature = NULL WHERE status IN ('On Request', 'Approved', 'Rejected')");
        }
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
    }
};
