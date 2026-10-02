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
        // 1. Fetch Assigned Tasks in this period for this employee
        // Using $employee->tasks() ensures pivot data (including acknowledged_at) is loaded
        $tasks = $employee->tasks()
            ->select('tasks.*')
            ->where(function ($q) use ($period) {
                $q->whereBetween('tasks.deadline', [$period->start_date, $period->end_date])
                    ->orWhereBetween('tasks.updated_at', [$period->start_date, $period->end_date])
                    ->orWhereBetween('tasks.created_at', [$period->start_date, $period->end_date]);
            })
            ->get();

        $assignedTasks = $tasks->count();

        // A task is only considered completed for THIS employee if:
        // 1) The task status is 'Done'
        // 2) The employee acknowledged the task (acknowledged_at is not null)
        $completedTasks = $tasks->filter(function ($task) {
            $status = $task->status instanceof \App\Enums\TaskStatus ? $task->status->value : (string) $task->status;
            $isAcknowledged = ! empty($task->pivot?->acknowledged_at);

            return $status === 'Done' && $isAcknowledged;
        })->count();

        // Completed on-time requires: Done + Acknowledged + completed on or before deadline
        $completedOnTimeTasks = $tasks->filter(function ($task) {
            $status = $task->status instanceof \App\Enums\TaskStatus ? $task->status->value : (string) $task->status;
            $isAcknowledged = ! empty($task->pivot?->acknowledged_at);

            if ($status !== 'Done' || ! $isAcknowledged) {
                return false;
            }

            if (! $task->deadline) {
                return true;
            }

            return $task->updated_at <= $task->deadline;
        })->count();

        // Overdue tasks:
        // If deadline has passed and task is either not done or not acknowledged by this employee
        $overdueTasks = $tasks->filter(function ($task) {
            $status = $task->status instanceof \App\Enums\TaskStatus ? $task->status->value : (string) $task->status;
            $isAcknowledged = ! empty($task->pivot?->acknowledged_at);

            if ($status === 'Done' && $isAcknowledged) {
                return false;
            }

            return $task->deadline && $task->deadline < now();
        })->count();

        // 2. Calculate Rates
        $completionRate = $assignedTasks > 0 ? ($completedTasks / $assignedTasks) * 100 : 0;
        $onTimeRate = $completedTasks > 0 ? ($completedOnTimeTasks / $completedTasks) * 100 : 0;

        // 3. Calculate Task Weight Score (Low=1, Normal=2, High=3, Urgent=4)
        $weightMap = ['Low' => 1, 'Normal' => 2, 'High' => 3, 'Urgent' => 4];
        $totalWeight = 0;
        foreach ($tasks as $task) {
            $priority = $task->priority instanceof \App\Enums\TaskPriority ? $task->priority->value : (string) $task->priority;
            $totalWeight += $weightMap[$priority] ?? 2;
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
