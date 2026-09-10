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
        Schema::create('performance_scores', function (Blueprint $table) {
            $table->id();
            $table->foreignId('employee_id')->constrained('employees')->cascadeOnDelete();
            $table->foreignId('performance_period_id')->constrained('performance_periods')->cascadeOnDelete();

            // Raw stats
            $table->integer('assigned_tasks')->default(0);
            $table->integer('completed_tasks')->default(0);
            $table->integer('completed_on_time_tasks')->default(0);
            $table->integer('overdue_tasks')->default(0);

            // Calculated components
            $table->decimal('completion_rate', 5, 2)->default(0); // 0-100
            $table->decimal('on_time_rate', 5, 2)->default(0); // 0-100
            $table->decimal('task_weight_score', 5, 2)->default(0); // 0-100
            $table->decimal('supervisor_score', 5, 2)->default(0); // 0-100

            // Final EPI
            $table->decimal('final_epi', 5, 2)->default(0); // 0-100
            $table->string('category'); // Excellent, Very Good, Good, etc.

            $table->timestamps();

            $table->unique(['employee_id', 'performance_period_id']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('performance_scores');
    }
};
