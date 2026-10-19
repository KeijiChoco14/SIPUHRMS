<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class PowerProRequest extends Model
{
    use HasFactory;

    protected $fillable = [
        'request_number',
        'request_type',
        'employee_id',
        'department_id',
        'employment_status',
        'system_type',
        'power_pro_modules',
        'access_level',
        'special_privileges',
        'proposed_username',
        'reason',
        'status',
        'requested_by_user_id',
        'requested_by_username',
        'requested_at',
        'requester_signature',
        'approved_by_user_id',
        'approved_by_username',
        'approved_at',
        'approver_signature',
        'approval_notes',
        'processed_by_user_id',
        'processed_by_username',
        'processed_at',
        'it_signature',
        'created_user_id',
        'it_notes',
        'rejection_reason',
    ];

    protected $casts = [
        'power_pro_modules' => 'array',
        'special_privileges' => 'array',
        'requested_at' => 'datetime',
        'approved_at' => 'datetime',
        'processed_at' => 'datetime',
    ];

    protected $appends = [
        'request_type_label',
        'status_color',
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

    public function approvedBy(): BelongsTo
    {
        return $this->belongsTo(User::class, 'approved_by_user_id');
    }

    public function processedBy(): BelongsTo
    {
        return $this->belongsTo(User::class, 'processed_by_user_id');
    }

    public function getRequestTypeLabelAttribute(): string
    {
        return match ($this->request_type) {
            'create_new' => 'Pembuatan User ID Baru',
            'modify_access' => 'Perubahan Hak Akses / Jabatan',
            'reset_password' => 'Reset Password',
            'deactivate' => 'Penonaktifan Akun (Resign / Selesai)',
            default => ucfirst(str_replace('_', ' ', $this->request_type ?? 'create_new')),
        };
    }

    public function getStatusColorAttribute(): string
    {
        return match ($this->status) {
            'Done' => 'bg-emerald-50 text-emerald-700 border-emerald-200',
            'Approved' => 'bg-blue-50 text-blue-700 border-blue-200',
            'On Request' => 'bg-amber-50 text-amber-700 border-amber-200',
            'Rejected' => 'bg-rose-50 text-rose-700 border-rose-200',
            default => 'bg-gray-50 text-gray-700 border-gray-200',
        };
    }
}
