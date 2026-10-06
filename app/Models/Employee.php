<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Casts\Attribute;

class Employee extends Model
{
    use HasFactory;

    protected $fillable = [
        'user_id',
        'employee_number',
        'phone_number',
        'department_id',
        'position_id',
        'supervisor_id',
        'join_date',
        'employment_status',
        'account_status',
        'profile_photo',
    ];

    protected function phoneNumber(): Attribute
    {
        return Attribute::make(
            set: function ($value) {
                if (!$value) return null;
                $cleaned = preg_replace('/[^0-9+]/', '', $value);
                if (str_starts_with($cleaned, '0')) {
                    return '+62' . substr($cleaned, 1);
                }
                if (str_starts_with($cleaned, '62')) {
                    return '+' . $cleaned;
                }
                return $cleaned;
            }
        );
    }

    public function user()
    {
        return $this->belongsTo(User::class);
    }

    public function department()
    {
        return $this->belongsTo(Department::class);
    }

    public function position()
    {
        return $this->belongsTo(Position::class);
    }

    public function supervisor()
    {
        return $this->belongsTo(Employee::class, 'supervisor_id');
    }

    public function subordinates()
    {
        return $this->hasMany(Employee::class, 'supervisor_id');
    }

    public function projectsOwned(): HasMany
    {
        return $this->hasMany(Project::class, 'owner_id');
    }

    public function projects(): BelongsToMany
    {
        return $this->belongsToMany(Project::class, 'project_members', 'employee_id', 'project_id')
            ->withTimestamps();
    }

    public function tasks(): BelongsToMany
    {
        return $this->belongsToMany(Task::class, 'task_assignees', 'employee_id', 'task_id')
            ->withPivot('acknowledged_at')
            ->withTimestamps();
    }

    public function taskComments(): HasMany
    {
        return $this->hasMany(TaskComment::class);
    }

    public function taskAttachments(): HasMany
    {
        return $this->hasMany(TaskAttachment::class);
    }

    public function taskActivities(): HasMany
    {
        return $this->hasMany(TaskActivity::class);
    }

    public function masterKeyRequests(): HasMany
    {
        return $this->hasMany(MasterKeyRequest::class);
    }
}
