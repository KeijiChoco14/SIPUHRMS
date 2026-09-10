<?php

namespace App\Services;

use App\Models\Employee;
use App\Models\PerformancePeriod;
use App\Models\PerformanceScore;
use App\Models\SupervisorAssessment;
use App\Models\Task;

class PerformanceCalculationService
{
    public function calculateForEmployee(Employee $employee, PerformancePeriod $period)
    {
        // 1. Fetch Assigned Tasks in this period
        // For simplicity, we consider a task assigned in this period if it was created during the period.
        // Or we could consider tasks that were closed/due during this period.
        // Let's use tasks where the deadline falls within the period or they were completed within the period.
        $tasks = Task::whereHas('assignees', function ($q) use ($employee) {
            $q->where('employee_id', $employee->id);
        })
            ->where(function ($q) use ($period) {
                $q->whereBetween('deadline', [$period->start_date, $period->end_date])
                    ->orWhereBetween('updated_at', [$period->start_date, $period->end_date]);
            })
            ->get();

        $assignedTasks = $tasks->count();
        $completedTasks = $tasks->where('status', 'Done')->count();

        $completedOnTimeTasks = $tasks->filter(function ($task) {
            return $task->status === 'Done' && $task->updated_at <= $task->deadline;
        })->count();

        $overdueTasks = $tasks->filter(function ($task) {
            return $task->deadline < now() && $task->status !== 'Done';
        })->count();

        // 2. Calculate Rates
        $completionRate = $assignedTasks > 0 ? ($completedTasks / $assignedTasks) * 100 : 0;
        $onTimeRate = $completedTasks > 0 ? ($completedOnTimeTasks / $completedTasks) * 100 : 0;

        // 3. Calculate Task Weight Score (Low=1, Normal=2, High=3, Urgent=4)
        $weightMap = ['Low' => 1, 'Normal' => 2, 'High' => 3, 'Urgent' => 4];
        $totalWeight = 0;
        foreach ($tasks as $task) {
            $totalWeight += $weightMap[$task->priority] ?? 2;
        }
        $avgWeight = $assignedTasks > 0 ? $totalWeight / $assignedTasks : 0;
        // Normalize to 0-100 scale (max average is 4)
        $taskWeightScore = ($avgWeight / 4) * 100;

        // 4. Supervisor Assessment
        $assessment = SupervisorAssessment::where('employee_id', $employee->id)
            ->where('performance_period_id', $period->id)
            ->first();

        $supervisorScore = 0;
        if ($assessment) {
            // Max score is 20 (4 criteria * 5)
            $totalAssessment = $assessment->work_quality + $assessment->accuracy + $assessment->responsibility + $assessment->communication;
            $supervisorScore = ($totalAssessment / 20) * 100;
        }

        // 5. Final EPI Calculation
        // (Completion Rate × 30%) + (On-Time Rate × 25%) + (Task Weight Score × 15%) + (Supervisor Assessment × 30%)
        $finalEpi = ($completionRate * 0.30) + ($onTimeRate * 0.25) + ($taskWeightScore * 0.15) + ($supervisorScore * 0.30);

        // 6. Determine Category
        $category = 'Evaluation Required';
        if ($finalEpi >= 90) {
            $category = 'Excellent';
        } elseif ($finalEpi >= 80) {
            $category = 'Very Good';
        } elseif ($finalEpi >= 70) {
            $category = 'Good';
        } elseif ($finalEpi >= 60) {
            $category = 'Needs Improvement';
        }

        // 7. Save Score
        return PerformanceScore::updateOrCreate(
            ['employee_id' => $employee->id, 'performance_period_id' => $period->id],
            [
                'assigned_tasks' => $assignedTasks,
                'completed_tasks' => $completedTasks,
                'completed_on_time_tasks' => $completedOnTimeTasks,
                'overdue_tasks' => $overdueTasks,
                'completion_rate' => $completionRate,
                'on_time_rate' => $onTimeRate,
                'task_weight_score' => $taskWeightScore,
                'supervisor_score' => $supervisorScore,
                'final_epi' => $finalEpi,
                'category' => $category,
            ]
        );
    }
}
