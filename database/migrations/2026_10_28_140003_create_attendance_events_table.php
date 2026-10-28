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
        if (!Schema::hasTable('attendance_events')) {
            Schema::create('attendance_events', function (Blueprint $table) {
                $table->id();
                $table->foreignId('attendance_id')->nullable()->constrained('attendances')->nullOnDelete();
                $table->foreignId('employee_id')->constrained('employees')->cascadeOnDelete();
                $table->foreignId('user_id')->nullable()->constrained('users')->nullOnDelete();
                $table->foreignId('shift_id')->nullable()->constrained('shifts')->nullOnDelete();
                $table->string('event_type'); // clock_in, clock_out, rejected_clock_in, rejected_clock_out, manual_correction
                $table->decimal('latitude', 11, 8)->nullable();
                $table->decimal('longitude', 11, 8)->nullable();
                $table->decimal('accuracy', 8, 2)->nullable();
                $table->decimal('distance', 8, 2)->nullable();
                $table->string('status'); // success, rejected
                $table->string('reason')->nullable(); // outside_radius, outside_window, low_accuracy, etc.
                $table->text('notes')->nullable();
                $table->string('ip_address', 45)->nullable();
                $table->text('user_agent')->nullable();
                $table->timestamp('created_at')->useCurrent();

                $table->index(['employee_id', 'created_at']);
                $table->index(['event_type', 'status']);
            });
        }
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('attendance_events');
    }
};
