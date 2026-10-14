<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class ItAsset extends Model
{
    use HasFactory;

    protected $fillable = [
        'asset_code',
        'name',
        'category',
        'brand',
        'model',
        'serial_number',
        'specifications',
        'status',
        'assigned_to_employee_id',
        'location',
        'ip_address',
        'purchase_date',
        'warranty_expiry',
        'purchase_cost',
        'notes',
    ];

    protected $casts = [
        'purchase_date' => 'date',
        'warranty_expiry' => 'date',
        'purchase_cost' => 'decimal:2',
    ];

    public function assignedEmployee(): BelongsTo
    {
        return $this->belongsTo(Employee::class, 'assigned_to_employee_id');
    }

    public function tickets(): HasMany
    {
        return $this->hasMany(ItTicket::class, 'it_asset_id');
    }
}
