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
        Schema::table('master_key_requests', function (Blueprint $table) {
            if (!Schema::hasColumn('master_key_requests', 'requester_signature')) {
                $table->longText('requester_signature')->nullable();
            }
            if (!Schema::hasColumn('master_key_requests', 'approver_signature')) {
                $table->longText('approver_signature')->nullable();
            }
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('master_key_requests', function (Blueprint $table) {
            $drop = [];
            if (Schema::hasColumn('master_key_requests', 'requester_signature')) {
                $drop[] = 'requester_signature';
            }
            if (Schema::hasColumn('master_key_requests', 'approver_signature')) {
                $drop[] = 'approver_signature';
            }
            if (!empty($drop)) {
                $table->dropColumn($drop);
            }
        });
    }
};
