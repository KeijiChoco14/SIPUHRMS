<?php

namespace App\Models;

use Carbon\Carbon;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class MasterKeyRequest extends Model
{
    use HasFactory;

    protected $fillable = [
        'request_number',
        'request_type',
        'employee_id',
        'department_id',
        'key_number',
        'key_type',
        'room_range_access',
        'valid_from',
        'valid_until',
        'renewal_cycle_months',
        'remark',
        'purpose',
        'status',
        'requested_by_user_id',
        'requested_by_username',
        'requested_at',
        'done_by_user_id',
        'done_by_username',
        'done_at',
        'done_notes',
        'previous_request_id',
        'requester_signature',
        'approver_signature',
    ];

    protected $casts = [
        'valid_from' => 'date:Y-m-d',
        'valid_until' => 'date:Y-m-d',
        'requested_at' => 'datetime',
        'done_at' => 'datetime',
        'renewal_cycle_months' => 'integer',
    ];

    protected $appends = [
        'request_type_label',
        'is_expired',
        'is_expiring_soon',
        'days_remaining',
        'computed_status',
    ];

    public function employee(): BelongsTo
    {
        return $this->belongsTo(Employee::class);
    }

    public function department(): BelongsTo
    {
        return $this->belongsTo(Department::class);
    }

    public function requestedBy(): BelongsTo
    {
        return $this->belongsTo(User::class, 'requested_by_user_id');
    }

    public function doneBy(): BelongsTo
    {
        return $this->belongsTo(User::class, 'done_by_user_id');
    }

    public function previousRequest(): BelongsTo
    {
        return $this->belongsTo(MasterKeyRequest::class, 'previous_request_id');
    }

    public function renewals(): HasMany
    {
        return $this->hasMany(MasterKeyRequest::class, 'previous_request_id');
    }

    public function auditLogs(): HasMany
    {
        return $this->hasMany(AuditLog::class, 'model_id')
            ->where('model_type', self::class)
            ->latest();
    }

    public function getRequestTypeLabelAttribute(): string
    {
        return match ($this->request_type) {
            'extension' => 'Extension',
            'replacement' => 'Replacement',
            default => 'Create New',
        };
    }

    public function getIsExpiredAttribute(): bool
    {
        if ($this->status !== 'Done') {
            return false;
        }

        return Carbon::parse($this->valid_until)->endOfDay()->isPast();
    }

    public function getIsExpiringSoonAttribute(): bool
    {
        if ($this->status !== 'Done') {
            return false;
        }

        $until = Carbon::parse($this->valid_until)->endOfDay();
        $today = Carbon::today();

        if ($until->isPast()) {
            return false;
        }

        $days = (int) $today->diffInDays($until);

        return $days >= 0 && $days <= 14;
    }

    public function getDaysRemainingAttribute(): int
    {
        if ($this->status !== 'Done') {
            return 0;
        }

        $until = Carbon::parse($this->valid_until)->endOfDay();
        $today = Carbon::today();

        if ($until->isPast()) {
            return -(int) $until->diffInDays($today);
        }

        return (int) $today->diffInDays($until);
    }

    public function getComputedStatusAttribute(): string
    {
        if ($this->status === 'Done') {
            if ($this->is_expired) {
                return 'Expired';
            }
            if ($this->is_expiring_soon) {
                return 'Expiring Soon';
            }
            return 'Done';
        }

        return 'On Request';
    }

    /**
     * Generate sequential request tracking number.
     * Format: MKR-YYYYMM-XXXX
     */
    public static function generateRequestNumber(): string
    {
        $prefix = 'MKR-' . date('Ym') . '-';
        $latest = self::where('request_number', 'like', $prefix . '%')
            ->orderBy('id', 'desc')
            ->first();

        if ($latest) {
            $lastNumber = (int) substr($latest->request_number, -4);
            $nextNumber = str_pad($lastNumber + 1, 4, '0', STR_PAD_LEFT);
        } else {
            $nextNumber = '0001';
        }

        return $prefix . $nextNumber;
    }
}
