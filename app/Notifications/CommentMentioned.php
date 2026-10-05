<?php

namespace App\Notifications;

use App\Models\Task;
use App\Models\TaskComment;
use App\Models\User;
use Illuminate\Bus\Queueable;
use Illuminate\Notifications\Messages\MailMessage;
use Illuminate\Notifications\Notification;
use Illuminate\Support\Str;

class CommentMentioned extends Notification
{
    use Queueable;

    public $task;
    public $comment;
    public $commenter;

    /**
     * Create a new notification instance.
     */
    public function __construct(Task $task, TaskComment $comment, ?User $commenter = null)
    {
        $this->task = $task;
        $this->comment = $comment;
        $this->commenter = $commenter;
    }

    /**
     * Get the notification's delivery channels.
     *
     * @return array<int, string>
     */
    public function via(object $notifiable): array
    {
        return ['database', 'mail'];
    }

    /**
     * Get the mail representation of the notification.
     */
    public function toMail(object $notifiable): MailMessage
    {
        $url = $this->task->project_id 
            ? route('projects.show', ['project' => $this->task->project_id, 'task_id' => $this->task->id, 'tab' => 'comments']) 
            : route('tasks.index', ['task_id' => $this->task->id, 'tab' => 'comments']);

        $commenterName = $this->commenter->name ?? 'Rekan kerja';

        return (new MailMessage)
            ->subject('Anda ditandai dalam komentar: ' . $this->task->title)
            ->greeting('Halo ' . ($notifiable->name ?? 'Karyawan') . ',')
            ->line($commenterName . ' menandai Anda dalam sebuah komentar pada tugas:')
            ->line('**Judul Task:** ' . $this->task->title)
            ->line('**Project:** ' . ($this->task->project->name ?? 'Task Mandiri'))
            ->line('**Isi Komentar:** "' . Str::limit($this->comment->content, 200) . '"')
            ->action('Lihat Komentar & Buka Task', $url)
            ->line('Segera periksa tugas ini agar tidak tertinggal informasi terbaru!');
    }

    /**
     * Get the array representation of the notification.
     *
     * @return array<string, mixed>
     */
    public function toArray(object $notifiable): array
    {
        $commenterName = $this->commenter->name ?? 'Seseorang';
        $url = $this->task->project_id 
            ? route('projects.show', ['project' => $this->task->project_id, 'task_id' => $this->task->id, 'tab' => 'comments']) 
            : route('tasks.index', ['task_id' => $this->task->id, 'tab' => 'comments']);

        return [
            'type' => 'comment_mention',
            'task_id' => $this->task->id,
            'comment_id' => $this->comment->id,
            'title' => 'Ditandai dalam komentar: ' . $this->task->title,
            'project_name' => $this->task->project->name ?? 'No Project',
            'message' => $commenterName . ' menandai Anda dalam komentar: "' . Str::limit($this->comment->content, 60) . '"',
            'action_url' => $url,
            'comment_preview' => Str::limit($this->comment->content, 120),
        ];
    }
}
