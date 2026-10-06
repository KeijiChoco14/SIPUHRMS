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
            $table->longText('requester_signature')->nullable()->after('purpose');
            $table->longText('approver_signature')->nullable()->after('approval_notes');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('master_key_requests', function (Blueprint $table) {
            $table->dropColumn(['requester_signature', 'approver_signature']);
        });
    }
};
