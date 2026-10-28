<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class AttendanceEvent extends Model
{
    use HasFactory;

    public $timestamps = false;

    protected $fillable = [
        'attendance_id',
        'employee_id',
        'user_id',
        'shift_id',
        'event_type',
        'latitude',
        'longitude',
        'accuracy',
        'distance',
        'status',
        'reason',
        'notes',
        'ip_address',
        'user_agent',
        'created_at',
    ];

    protected $casts = [
        'latitude' => 'float',
        'longitude' => 'float',
        'accuracy' => 'float',
        'distance' => 'float',
        'created_at' => 'datetime',
    ];

    public function attendance()
    {
        return $this->belongsTo(Attendance::class);
    }

    public function employee()
    {
        return $this->belongsTo(Employee::class);
    }

    public function user()
    {
        return $this->belongsTo(User::class);
    }

    public function shift()
    {
        return $this->belongsTo(Shift::class);
    }
}
