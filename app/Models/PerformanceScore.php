<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class PerformanceScore extends Model
{
    protected $fillable = [
        'employee_id',
        'performance_period_id',
        'assigned_tasks',
        'completed_tasks',
        'completed_on_time_tasks',
        'overdue_tasks',
        'completion_rate',
        'on_time_rate',
        'task_weight_score',
        'supervisor_score',
        'final_epi',
        'category',
    ];

    public function employee()
    {
        return $this->belongsTo(Employee::class);
    }

    public function period()
    {
        return $this->belongsTo(PerformancePeriod::class, 'performance_period_id');
    }
}
