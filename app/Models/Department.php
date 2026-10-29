<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Department extends Model
{
    use HasFactory;

    protected $fillable = ['name', 'description'];

    public function positions()
    {
        return $this->hasMany(Position::class);
    }

    public function employees()
    {
        return $this->hasMany(Employee::class);
    }

    public static function getCachedList()
    {
        return \Illuminate\Support\Facades\Cache::remember('departments_cached_list', 3600, function () {
            return static::select('id', 'name')->orderBy('name')->get();
        });
    }

    public static function clearCache(): void
    {
        \Illuminate\Support\Facades\Cache::forget('departments_cached_list');
    }

    protected static function booted(): void
    {
        static::saved(fn () => static::clearCache());
        static::deleted(fn () => static::clearCache());
    }
}
