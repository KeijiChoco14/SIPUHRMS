<?php

namespace Database\Seeders;

use App\Models\Announcement;
use App\Models\Attendance;
use App\Models\Employee;
use App\Models\User;
use Carbon\Carbon;
use Illuminate\Database\Seeder;

class Phase5To7Seeder extends Seeder
{
    public function run(): void
    {
        $employees = Employee::where('employment_status', 'Active')->get();
        if ($employees->isEmpty()) {
            return;
        }

        // 1. Seed Attendance for this month
        $startOfMonth = Carbon::now()->startOfMonth();
        $today = Carbon::now();

        foreach ($employees as $employee) {
            for ($date = $startOfMonth->copy(); $date->lte($today); $date->addDay()) {
                if ($date->isWeekend()) {
                    Attendance::updateOrCreate(
                        ['employee_id' => $employee->id, 'date' => $date->format('Y-m-d')],
                        ['status' => 'Off', 'source' => 'System']
                    );
                } else {
                    $isLate = rand(1, 10) > 8; // 20% chance of being late
                    $lateMinutes = $isLate ? rand(10, 60) : 0;
                    $status = $isLate ? 'Late' : 'Present';

                    Attendance::updateOrCreate(
                        ['employee_id' => $employee->id, 'date' => $date->format('Y-m-d')],
                        [
                            'clock_in' => $isLate ? '09:'.str_pad($lateMinutes, 2, '0', STR_PAD_LEFT) : '08:50',
                            'clock_out' => '17:05',
                            'status' => $status,
                            'late_duration_minutes' => $lateMinutes,
                            'source' => 'Fingerprint',
                        ]
                    );
                }
            }
        }

        // 2. Seed Announcement
        $user = User::first();
        if ($user) {
            Announcement::updateOrCreate(
                ['title' => 'Welcome to Phase 5-7 Modules!'],
                [
                    'message' => 'The Attendance, Payroll, and Internal Management modules have been successfully implemented. Explore the sidebar to see the new features!',
                    'target_audience' => 'All',
                    'created_by' => $user->id,
                    'published_at' => Carbon::now(),
                ]
            );
        }
    }
}
