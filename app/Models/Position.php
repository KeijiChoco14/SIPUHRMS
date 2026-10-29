<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Position extends Model
{
    use HasFactory;

    protected $fillable = ['name', 'department_id'];

    public function department()
    {
        return $this->belongsTo(Department::class);
    }

    public function employees()
    {
        return $this->hasMany(Employee::class);
    }

    public static function getCachedList()
    {
        return \Illuminate\Support\Facades\Cache::remember('positions_cached_list', 3600, function () {
            return static::select('id', 'name', 'department_id')->orderBy('name')->get();
        });
    }

    public static function clearCache(): void
    {
        \Illuminate\Support\Facades\Cache::forget('positions_cached_list');
    }

    protected static function booted(): void
    {
        static::saved(fn () => static::clearCache());
        static::deleted(fn () => static::clearCache());
    }
}
