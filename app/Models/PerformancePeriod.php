<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class PerformancePeriod extends Model
{
    protected $fillable = ['name', 'start_date', 'end_date', 'type'];

    public function scores()
    {
        return $this->hasMany(PerformanceScore::class);
    }

    public function assessments()
    {
        return $this->hasMany(SupervisorAssessment::class);
    }
}
