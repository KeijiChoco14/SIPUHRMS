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
        Schema::table('room_borrowing_transactions', function (Blueprint $table) {
            $table->unsignedSmallInteger('expected_duration_hours')->nullable()->after('borrowed_at');
            $table->timestamp('expected_return_at')->nullable()->after('expected_duration_hours');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('room_borrowing_transactions', function (Blueprint $table) {
            $table->dropColumn(['expected_duration_hours', 'expected_return_at']);
        });
    }
};
