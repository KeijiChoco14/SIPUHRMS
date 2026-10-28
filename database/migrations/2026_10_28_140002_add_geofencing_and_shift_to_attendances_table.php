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
        Schema::table('attendances', function (Blueprint $table) {
            if (!Schema::hasColumn('attendances', 'shift_id')) {
                $table->foreignId('shift_id')->nullable()->after('employee_id')->constrained('shifts')->nullOnDelete();
            }
            if (!Schema::hasColumn('attendances', 'work_schedule_id')) {
                $table->foreignId('work_schedule_id')->nullable()->after('shift_id')->constrained('work_schedules')->nullOnDelete();
            }
            if (!Schema::hasColumn('attendances', 'attendance_location_id')) {
                $table->foreignId('attendance_location_id')->nullable()->after('work_schedule_id')->constrained('attendance_locations')->nullOnDelete();
            }
            if (!Schema::hasColumn('attendances', 'clock_in_at')) {
                $table->timestamp('clock_in_at')->nullable()->after('clock_out');
            }
            if (!Schema::hasColumn('attendances', 'clock_out_at')) {
                $table->timestamp('clock_out_at')->nullable()->after('clock_in_at');
            }
            if (!Schema::hasColumn('attendances', 'clock_in_latitude')) {
                $table->decimal('clock_in_latitude', 11, 8)->nullable()->after('clock_out_at');
            }
            if (!Schema::hasColumn('attendances', 'clock_in_longitude')) {
                $table->decimal('clock_in_longitude', 11, 8)->nullable()->after('clock_in_latitude');
            }
            if (!Schema::hasColumn('attendances', 'clock_in_accuracy')) {
                $table->decimal('clock_in_accuracy', 8, 2)->nullable()->after('clock_in_longitude');
            }
            if (!Schema::hasColumn('attendances', 'clock_in_distance')) {
                $table->decimal('clock_in_distance', 8, 2)->nullable()->after('clock_in_accuracy');
            }
            if (!Schema::hasColumn('attendances', 'clock_out_latitude')) {
                $table->decimal('clock_out_latitude', 11, 8)->nullable()->after('clock_in_distance');
            }
            if (!Schema::hasColumn('attendances', 'clock_out_longitude')) {
                $table->decimal('clock_out_longitude', 11, 8)->nullable()->after('clock_out_latitude');
            }
            if (!Schema::hasColumn('attendances', 'clock_out_accuracy')) {
                $table->decimal('clock_out_accuracy', 8, 2)->nullable()->after('clock_out_longitude');
            }
            if (!Schema::hasColumn('attendances', 'clock_out_distance')) {
                $table->decimal('clock_out_distance', 8, 2)->nullable()->after('clock_out_accuracy');
            }
            if (!Schema::hasColumn('attendances', 'is_late')) {
                $table->boolean('is_late')->default(false)->after('clock_out_distance');
            }
            if (!Schema::hasColumn('attendances', 'early_leave_minutes')) {
                $table->unsignedInteger('early_leave_minutes')->default(0)->after('is_late');
            }
            if (!Schema::hasColumn('attendances', 'correction_reason')) {
                $table->text('correction_reason')->nullable()->after('notes');
            }
            if (!Schema::hasColumn('attendances', 'corrected_by')) {
                $table->foreignId('corrected_by')->nullable()->after('correction_reason')->constrained('users')->nullOnDelete();
            }
            if (!Schema::hasColumn('attendances', 'corrected_at')) {
                $table->timestamp('corrected_at')->nullable()->after('corrected_by');
            }
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('attendances', function (Blueprint $table) {
            $columnsToDrop = [];
            foreach ([
                'shift_id',
                'work_schedule_id',
                'attendance_location_id',
                'clock_in_at',
                'clock_out_at',
                'clock_in_latitude',
                'clock_in_longitude',
                'clock_in_accuracy',
                'clock_in_distance',
                'clock_out_latitude',
                'clock_out_longitude',
                'clock_out_accuracy',
                'clock_out_distance',
                'is_late',
                'early_leave_minutes',
                'correction_reason',
                'corrected_by',
                'corrected_at',
            ] as $column) {
                if (Schema::hasColumn('attendances', $column)) {
                    $columnsToDrop[] = $column;
                }
            }
            if (!empty($columnsToDrop)) {
                $table->dropColumn($columnsToDrop);
            }
        });
    }
};
