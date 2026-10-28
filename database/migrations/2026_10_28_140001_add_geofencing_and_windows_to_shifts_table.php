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
        Schema::table('shifts', function (Blueprint $table) {
            if (!Schema::hasColumn('shifts', 'code')) {
                $table->string('code', 50)->nullable()->after('name');
            }
            if (!Schema::hasColumn('shifts', 'clock_in_window_start')) {
                $table->time('clock_in_window_start')->nullable()->after('end_time');
            }
            if (!Schema::hasColumn('shifts', 'clock_in_window_end')) {
                $table->time('clock_in_window_end')->nullable()->after('clock_in_window_start');
            }
            if (!Schema::hasColumn('shifts', 'clock_out_window_start')) {
                $table->time('clock_out_window_start')->nullable()->after('clock_in_window_end');
            }
            if (!Schema::hasColumn('shifts', 'clock_out_window_end')) {
                $table->time('clock_out_window_end')->nullable()->after('clock_out_window_start');
            }
            if (!Schema::hasColumn('shifts', 'is_overnight')) {
                $table->boolean('is_overnight')->default(false)->after('clock_out_window_end');
            }
            if (!Schema::hasColumn('shifts', 'late_tolerance_minutes')) {
                $table->unsignedInteger('late_tolerance_minutes')->default(0)->after('is_overnight');
            }
            if (!Schema::hasColumn('shifts', 'is_active')) {
                $table->boolean('is_active')->default(true)->after('late_tolerance_minutes');
            }
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('shifts', function (Blueprint $table) {
            $columnsToDrop = [];
            foreach ([
                'code',
                'clock_in_window_start',
                'clock_in_window_end',
                'clock_out_window_start',
                'clock_out_window_end',
                'is_overnight',
                'late_tolerance_minutes',
                'is_active',
            ] as $column) {
                if (Schema::hasColumn('shifts', $column)) {
                    $columnsToDrop[] = $column;
                }
            }
            if (!empty($columnsToDrop)) {
                $table->dropColumn($columnsToDrop);
            }
        });
    }
};
