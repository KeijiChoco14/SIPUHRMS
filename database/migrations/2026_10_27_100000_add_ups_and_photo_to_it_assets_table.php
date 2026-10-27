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
        Schema::table('it_assets', function (Blueprint $table) {
            $table->string('ups')->nullable()->after('ip_address');
            $table->string('photo')->nullable()->after('ups');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('it_assets', function (Blueprint $table) {
            $table->dropColumn(['ups', 'photo']);
        });
    }
};
