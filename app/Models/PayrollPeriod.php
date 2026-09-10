<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class PayrollPeriod extends Model
{
    protected $fillable = ['name', 'month', 'year', 'start_date', 'end_date', 'status'];

    public function payrolls()
    {
        return $this->hasMany(Payroll::class);
    }
}
