<?php

namespace App\Observers;

use App\Enums\TaskPriority;
use App\Enums\TaskStatus;
use App\Models\Employee;
use App\Models\Task;
use Carbon\CarbonInterface;
use Illuminate\Support\Facades\Auth;

class TaskObserver
{
    public function created(Task $task): void
    {
        $this->logActivity(
            $task,
            'created',
            "Task created with title '{$task->title}'"
        );
    }

    public function updated(Task $task): void
    {
        if ($task->isDirty('status')) {
            $oldStatus = $task->getOriginal('status');
            $oldStatusVal = $oldStatus instanceof TaskStatus ? $oldStatus->value : (string) $oldStatus;
            $newStatusVal = $task->status instanceof TaskStatus ? $task->status->value : (string) $task->status;

            if ($oldStatusVal !== $newStatusVal) {
                $this->logActivity(
                    $task,
                    'status_changed',
                    "Status changed from '{$oldStatusVal}' to '{$newStatusVal}'",
                    ['status' => $oldStatusVal],
                    ['status' => $newStatusVal]
                );
            }
        }

        if ($task->isDirty('priority')) {
            $oldPriority = $task->getOriginal('priority');
            $oldPriorityVal = $oldPriority instanceof TaskPriority ? $oldPriority->value : (string) $oldPriority;
            $newPriorityVal = $task->priority instanceof TaskPriority ? $task->priority->value : (string) $task->priority;

            if ($oldPriorityVal !== $newPriorityVal) {
                $this->logActivity(
                    $task,
                    'priority_changed',
                    "Priority changed from '{$oldPriorityVal}' to '{$newPriorityVal}'",
                    ['priority' => $oldPriorityVal],
                    ['priority' => $newPriorityVal]
                );
            }
        }

        if ($task->isDirty('title')) {
            $oldTitle = (string) $task->getOriginal('title');
            $newTitle = (string) $task->title;

            if ($oldTitle !== $newTitle) {
                $this->logActivity(
                    $task,
                    'title_changed',
                    "Task title changed from '{$oldTitle}' to '{$newTitle}'",
                    ['title' => $oldTitle],
                    ['title' => $newTitle]
                );
            }
        }

        if ($task->isDirty('deadline')) {
            $oldDeadline = $task->getOriginal('deadline');
            $oldDeadlineStr = $oldDeadline instanceof CarbonInterface ? $oldDeadline->format('Y-m-d') : ($oldDeadline ? (string) $oldDeadline : '-');
            $newDeadlineStr = $task->deadline instanceof CarbonInterface ? $task->deadline->format('Y-m-d') : ($task->deadline ? (string) $task->deadline : '-');

            if ($oldDeadlineStr !== $newDeadlineStr) {
                $this->logActivity(
                    $task,
                    'deadline_changed',
                    "Deadline changed to " . ($newDeadlineStr !== '-' ? $newDeadlineStr : 'No deadline'),
                    ['deadline' => $oldDeadlineStr],
                    ['deadline' => $newDeadlineStr]
                );
            }
        }

        if ($task->isDirty('description')) {
            $this->logActivity(
                $task,
                'description_changed',
                'Task description updated'
            );
        }
    }

    private function logActivity(Task $task, string $action, string $description, ?array $old = null, ?array $new = null): void
    {
        $employeeId = null;

        if (Auth::check()) {
            $employeeId = Auth::user()->employee?->id
                ?? Employee::where('user_id', Auth::id())->value('id');
        }

        if (! $employeeId && $task->creator) {
            $employeeId = $task->creator->employee?->id
                ?? Employee::where('user_id', $task->created_by)->value('id');
        }

        $task->activities()->create([
            'employee_id' => $employeeId,
            'action' => $action,
            'description' => $description,
            'old_value' => $old,
            'new_value' => $new,
        ]);
    }
}
