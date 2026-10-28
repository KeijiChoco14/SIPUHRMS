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
        if (!Schema::hasTable('attendance_locations')) {
            Schema::create('attendance_locations', function (Blueprint $table) {
                $table->id();
                $table->string('name')->default('Swiss-Belinn SKA Pekanbaru');
                $table->decimal('latitude', 11, 8)->default(0.49909785);
                $table->decimal('longitude', 11, 8)->default(101.41851615);
                $table->unsignedInteger('radius_meters')->default(100);
                $table->unsignedInteger('min_accuracy_meters')->default(150);
                $table->boolean('is_active')->default(true);
                $table->foreignId('created_by')->nullable()->constrained('users')->nullOnDelete();
                $table->foreignId('updated_by')->nullable()->constrained('users')->nullOnDelete();
                $table->timestamps();
            });
        }
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('attendance_locations');
    }
};
