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
            // HOD Housekeeping approval fields
            $table->foreignId('approved_by_user_id')->nullable()->after('requested_at')->constrained('users')->nullOnDelete();
            $table->string('approved_by_username')->nullable()->after('approved_by_user_id');
            $table->timestamp('approved_at')->nullable()->after('approved_by_username');
            $table->text('approval_notes')->nullable()->after('approved_at');
            $table->longText('hod_signature')->nullable()->after('approval_notes');

            // Department IT creation / update fields
            $table->longText('it_signature')->nullable()->after('done_notes');
        });

        // Migrate existing approver_signature to hod_signature / it_signature if any
        if (Schema::hasColumn('master_key_requests', 'approver_signature')) {
            DB::statement("UPDATE master_key_requests SET hod_signature = approver_signature WHERE approver_signature IS NOT NULL AND hod_signature IS NULL");
            DB::statement("UPDATE master_key_requests SET it_signature = approver_signature WHERE approver_signature IS NOT NULL AND it_signature IS NULL AND status = 'Done'");
        }
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('master_key_requests', function (Blueprint $table) {
            $table->dropForeign(['approved_by_user_id']);
            $table->dropColumn([
                'approved_by_user_id',
                'approved_by_username',
                'approved_at',
                'approval_notes',
                'hod_signature',
                'it_signature',
            ]);
        });
    }
};
