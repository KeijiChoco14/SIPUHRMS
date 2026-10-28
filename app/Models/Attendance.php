<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Attendance extends Model
{
    use HasFactory;

    protected $fillable = [
        'employee_id',
        'shift_id',
        'work_schedule_id',
        'attendance_location_id',
        'date',
        'clock_in',
        'clock_out',
        'clock_in_at',
        'clock_out_at',
        'clock_in_latitude',
        'clock_in_longitude',
        'clock_in_accuracy',
        'clock_in_distance',
        'clock_out_latitude',
        'clock_out_longitude',
        'clock_out_accuracy',
        'clock_out_distance',
        'status',
        'is_late',
        'late_duration_minutes',
        'early_leave_minutes',
        'overtime_minutes',
        'source',
        'notes',
        'correction_reason',
        'corrected_by',
        'corrected_at',
    ];

    protected $casts = [
        'date' => 'date',
        'clock_in_at' => 'datetime',
        'clock_out_at' => 'datetime',
        'clock_in_latitude' => 'float',
        'clock_in_longitude' => 'float',
        'clock_in_accuracy' => 'float',
        'clock_in_distance' => 'float',
        'clock_out_latitude' => 'float',
        'clock_out_longitude' => 'float',
        'clock_out_accuracy' => 'float',
        'clock_out_distance' => 'float',
        'is_late' => 'boolean',
        'late_duration_minutes' => 'integer',
        'early_leave_minutes' => 'integer',
        'overtime_minutes' => 'integer',
        'corrected_at' => 'datetime',
    ];

    public function employee()
    {
        return $this->belongsTo(Employee::class);
    }

    public function shift()
    {
        return $this->belongsTo(Shift::class);
    }

    public function workSchedule()
    {
        return $this->belongsTo(WorkSchedule::class);
    }

    public function location()
    {
        return $this->belongsTo(AttendanceLocation::class, 'attendance_location_id');
    }

    public function correctedByUser()
    {
        return $this->belongsTo(User::class, 'corrected_by');
    }

    public function events()
    {
        return $this->hasMany(AttendanceEvent::class);
    }
}
