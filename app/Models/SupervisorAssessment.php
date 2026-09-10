<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class SupervisorAssessment extends Model
{
    protected $fillable = [
        'employee_id',
        'supervisor_id',
        'performance_period_id',
        'work_quality',
        'accuracy',
        'responsibility',
        'communication',
        'notes',
    ];

    public function employee()
    {
        return $this->belongsTo(Employee::class, 'employee_id');
    }

    public function supervisor()
    {
        return $this->belongsTo(Employee::class, 'supervisor_id');
    }

    public function period()
    {
        return $this->belongsTo(PerformancePeriod::class, 'performance_period_id');
    }
}
