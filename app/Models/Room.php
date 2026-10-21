<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\HasOne;

class Room extends Model
{
    use HasFactory;

    public const STATUS_AVAILABLE = 'AVAILABLE';
    public const STATUS_BORROWED = 'BORROWED';
    public const STATUS_PENDING_RETURN = 'PENDING_RETURN';

    protected $fillable = [
        'room_number',
        'name',
        'location',
        'capacity',
        'description',
        'key_code',
        'status',
        'is_active',
    ];

    /**
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'capacity' => 'integer',
            'is_active' => 'boolean',
        ];
    }

    public function transactions(): HasMany
    {
        return $this->hasMany(RoomBorrowingTransaction::class);
    }

    /**
     * Get the active borrowing transaction (BORROWED or PENDING_RETURN).
     */
    public function activeTransaction(): HasOne
    {
        return $this->hasOne(RoomBorrowingTransaction::class)
            ->whereIn('status', [self::STATUS_BORROWED, self::STATUS_PENDING_RETURN])
            ->latestOfMany();
    }

    public function isAvailable(): bool
    {
        return $this->status === self::STATUS_AVAILABLE;
    }

    public function isBorrowed(): bool
    {
        return $this->status === self::STATUS_BORROWED;
    }

    public function isPendingReturn(): bool
    {
        return $this->status === self::STATUS_PENDING_RETURN;
    }

    public function scopeActive($query)
    {
        return $query->where('is_active', true);
    }

    public function scopeAvailable($query)
    {
        return $query->where('status', self::STATUS_AVAILABLE)->where('is_active', true);
    }
}
