<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class AttendanceLocation extends Model
{
    use HasFactory;

    protected $fillable = [
        'name',
        'latitude',
        'longitude',
        'radius_meters',
        'min_accuracy_meters',
        'is_active',
        'created_by',
        'updated_by',
    ];

    protected $casts = [
        'latitude' => 'float',
        'longitude' => 'float',
        'radius_meters' => 'integer',
        'min_accuracy_meters' => 'integer',
        'is_active' => 'boolean',
    ];

    public function creator()
    {
        return $this->belongsTo(User::class, 'created_by');
    }

    public function updater()
    {
        return $this->belongsTo(User::class, 'updated_by');
    }

    public function attendances()
    {
        return $this->hasMany(Attendance::class);
    }

    /**
     * Get or create the default Swiss-Belinn SKA Pekanbaru location.
     */
    public static function getDefaultLocation(): self
    {
        return static::firstOrCreate(
            ['name' => 'Swiss-Belinn SKA Pekanbaru'],
            [
                'latitude' => 0.49909785,
                'longitude' => 101.41851615,
                'radius_meters' => 100,
                'min_accuracy_meters' => 150,
                'is_active' => true,
            ]
        );
    }
}
