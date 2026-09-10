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
        Schema::create('attendances', function (Blueprint $table) {
            $table->id();
            $table->foreignId('employee_id')->constrained('employees')->cascadeOnDelete();
            $table->date('date');
            $table->time('clock_in')->nullable();
            $table->time('clock_out')->nullable();
            $table->string('status'); // Present, Late, Absent, Leave, Off
            $table->integer('late_duration_minutes')->default(0);
            $table->integer('overtime_minutes')->default(0);
            $table->string('source')->default('Manual'); // e.g., Fingerprint, Manual, Mobile
            $table->text('notes')->nullable();
            $table->timestamps();

            // An employee can only have one attendance record per day
            $table->unique(['employee_id', 'date']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('attendances');
    }
};
