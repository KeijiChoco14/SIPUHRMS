<?php

namespace App\Notifications;

use App\Models\Task;
use Illuminate\Bus\Queueable;
use Illuminate\Notifications\Notification;

class TaskStatusNotification extends Notification
{
    use Queueable;

    public Task $task;
    public string $message;
    public string $statusType; // 'submitted_for_approval', 'approved', 'returned_for_revision'

    public function __construct(Task $task, string $message, string $statusType)
    {
        $this->task = $task;
        $this->message = $message;
        $this->statusType = $statusType;
    }

    public function via(object $notifiable): array
    {
        return ['database'];
    }

    public function toArray(object $notifiable): array
    {
        return [
            'task_id' => $this->task->id,
            'title' => $this->task->title,
            'project_name' => $this->task->project->name ?? 'Standalone Task',
            'status' => $this->task->status instanceof \App\Enums\TaskStatus ? $this->task->status->value : (string) $this->task->status,
            'status_type' => $this->statusType,
            'message' => $this->message,
            'action_url' => $this->task->project_id 
                ? route('projects.show', ['project' => $this->task->project_id, 'task_id' => $this->task->id]) 
                : route('tasks.kanban', ['task_id' => $this->task->id]),
        ];
    }
}
