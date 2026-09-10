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
        Schema::create('supervisor_assessments', function (Blueprint $table) {
            $table->id();
            $table->foreignId('employee_id')->constrained('employees')->cascadeOnDelete();
            $table->foreignId('supervisor_id')->constrained('employees')->cascadeOnDelete();
            $table->foreignId('performance_period_id')->constrained('performance_periods')->cascadeOnDelete();

            // Assessment criteria (1-5 scale)
            $table->tinyInteger('work_quality');
            $table->tinyInteger('accuracy');
            $table->tinyInteger('responsibility');
            $table->tinyInteger('communication');

            $table->text('notes')->nullable();
            $table->timestamps();

            // An employee can only have one supervisor assessment per period
            $table->unique(['employee_id', 'performance_period_id']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('supervisor_assessments');
    }
};
