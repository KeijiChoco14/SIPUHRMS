<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;
use Illuminate\Database\Eloquent\Relations\HasMany;

class ItTicket extends Model
{
    use HasFactory;

    protected $fillable = [
        'ticket_number',
        'title',
        'description',
        'category',
        'priority',
        'status',
        'reported_by_employee_id',
        'assigned_to_user_id',
        'it_asset_id',
        'location',
        'resolved_at',
        'resolution_notes',
    ];

    protected $casts = [
        'resolved_at' => 'datetime',
    ];

    public function reporter(): BelongsTo
    {
        return $this->belongsTo(Employee::class, 'reported_by_employee_id');
    }

    public function assignedUser(): BelongsTo
    {
        return $this->belongsTo(User::class, 'assigned_to_user_id');
    }

    public function assignedUsers(): BelongsToMany
    {
        return $this->belongsToMany(User::class, 'it_ticket_assignees', 'it_ticket_id', 'user_id')->withTimestamps();
    }

    public function asset(): BelongsTo
    {
        return $this->belongsTo(ItAsset::class, 'it_asset_id');
    }

    public function updates(): HasMany
    {
        return $this->hasMany(ItTicketUpdate::class, 'it_ticket_id')->oldest();
    }
}
