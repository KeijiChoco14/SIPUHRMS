<?php

namespace App\Models;

use App\Enums\ProjectStatus;
use App\Enums\TaskStatus;
use Illuminate\Database\Eloquent\Casts\Attribute;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Project extends Model
{
    protected $fillable = [
        'name',
        'description',
        'owner_id',
        'department_id',
        'start_date',
        'deadline',
        'status',
        'progress',
        'created_by',
    ];

    protected $casts = [
        'status' => ProjectStatus::class,
        'start_date' => 'date',
        'deadline' => 'date',
    ];

    protected static function booted(): void
    {
        static::deleting(function (Project $project) {
            foreach ($project->tasks as $task) {
                $task->delete();
            }
            $project->members()->detach();
        });
    }

    protected function progress(): Attribute
    {
        return Attribute::make(
            get: function ($value) {
                if ($this->relationLoaded('tasks')) {
                    $total = $this->tasks->count();
                    if ($total > 0) {
                        $completed = $this->tasks->filter(function ($t) {
                            $status = $t->status instanceof TaskStatus ? $t->status->value : $t->status;
                            return $status === TaskStatus::Done->value;
                        })->count();
                        return (int) round(($completed / $total) * 100);
                    }
                    return 0;
                }

                if (array_key_exists('total_tasks', $this->attributes)) {
                    $total = (int) $this->attributes['total_tasks'];
                    $completed = (int) ($this->attributes['completed_tasks'] ?? 0);
                    return $total > 0 ? (int) round(($completed / $total) * 100) : 0;
                }

                return (int) ($value ?? 0);
            }
        );
    }

    public function recalculateProgress(): int
    {
        $total = $this->tasks()->count();
        $completed = $this->tasks()->where('status', TaskStatus::Done->value)->count();
        $progress = $total > 0 ? (int) round(($completed / $total) * 100) : 0;

        $updates = ['progress' => $progress];

        $currentStatus = $this->status instanceof \BackedEnum ? $this->status->value : (string) $this->status;

        // If all tasks are completed, automatically mark project as Completed (if currently Active or Planning)
        if ($total > 0 && $completed === $total && in_array($currentStatus, [ProjectStatus::Active->value, ProjectStatus::Planning->value])) {
            $updates['status'] = ProjectStatus::Completed->value;
            $this->status = ProjectStatus::Completed;
        } elseif ($progress < 100 && $currentStatus === ProjectStatus::Completed->value) {
            // If tasks are reopened or incomplete, revert back to Active
            $updates['status'] = ProjectStatus::Active->value;
            $this->status = ProjectStatus::Active;
        }

        $this->updateQuietly($updates);

        return $progress;
    }

    public function owner(): BelongsTo
    {
        return $this->belongsTo(Employee::class, 'owner_id');
    }

    public function department(): BelongsTo
    {
        return $this->belongsTo(Department::class);
    }

    public function creator(): BelongsTo
    {
        return $this->belongsTo(User::class, 'created_by');
    }

    public function members(): BelongsToMany
    {
        return $this->belongsToMany(Employee::class, 'project_members', 'project_id', 'employee_id')
            ->withTimestamps();
    }

    public function tasks(): HasMany
    {
        return $this->hasMany(Task::class);
    }
}
