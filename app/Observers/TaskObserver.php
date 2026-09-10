<?php

namespace App\Observers;

use App\Models\Task;
use Illuminate\Support\Facades\Auth;

class TaskObserver
{
    public function created(Task $task): void
    {
        $this->logActivity($task, 'created', 'Task created');
    }

    public function updated(Task $task): void
    {
        if ($task->isDirty('status')) {
            $this->logActivity($task, 'status_changed', 'Task status changed', [
                'status' => $task->getOriginal('status'),
            ], [
                'status' => $task->status,
            ]);
        }

        if ($task->isDirty('priority')) {
            $this->logActivity($task, 'priority_changed', 'Task priority changed', [
                'priority' => $task->getOriginal('priority'),
            ], [
                'priority' => $task->priority,
            ]);
        }
    }

    private function logActivity(Task $task, string $action, string $description, ?array $old = null, ?array $new = null)
    {
        $task->activities()->create([
            'employee_id' => Auth::user()?->employee?->id,
            'action' => $action,
            'description' => $description,
            'old_value' => $old,
            'new_value' => $new,
        ]);
    }
}
