<?php

namespace App\Models;

use Carbon\Carbon;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class RoomBorrowingTransaction extends Model
{
    use HasFactory;

    public const STATUS_BORROWED = 'BORROWED';
    public const STATUS_PENDING_RETURN = 'PENDING_RETURN';
    public const STATUS_RETURNED = 'RETURNED';
    public const STATUS_CANCELLED = 'CANCELLED';

    protected $fillable = [
        'transaction_number',
        'room_id',
        'borrower_employee_id',
        'borrowed_at',
        'expected_duration_hours',
        'expected_return_at',
        'purpose',
        'status',
        'return_requested_at',
        'return_notes',
        'returned_at',
        'security_user_id',
        'security_notes',
    ];

    /**
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'borrowed_at' => 'datetime',
            'expected_duration_hours' => 'integer',
            'expected_return_at' => 'datetime',
            'return_requested_at' => 'datetime',
            'returned_at' => 'datetime',
        ];
    }

    public function room(): BelongsTo
    {
        return $this->belongsTo(Room::class);
    }

    public function borrower(): BelongsTo
    {
        return $this->belongsTo(Employee::class, 'borrower_employee_id');
    }

    public function securityUser(): BelongsTo
    {
        return $this->belongsTo(User::class, 'security_user_id');
    }

    /**
     * Generate an incremental transaction number: RBR-YYYYMMDD-0001
     */
    public static function generateTransactionNumber(): string
    {
        $dateStr = Carbon::now()->format('Ymd');
        $prefix = "RBR-{$dateStr}-";

        $latest = self::where('transaction_number', 'like', "{$prefix}%")
            ->orderBy('id', 'desc')
            ->first();

        if ($latest) {
            $lastNumber = (int) substr($latest->transaction_number, strlen($prefix));
            $nextNumber = str_pad((string) ($lastNumber + 1), 4, '0', STR_PAD_LEFT);
        } else {
            $nextNumber = '0001';
        }

        return $prefix . $nextNumber;
    }
}
