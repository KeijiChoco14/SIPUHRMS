<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class AuditLog extends Model
{
    protected $fillable = [
        'user_id',
        'action',
        'model_type',
        'model_id',
        'description',
        'old_values',
        'new_values',
        'ip_address',
    ];

    /**
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'old_values' => 'array',
            'new_values' => 'array',
        ];
    }

    public function user()
    {
        return $this->belongsTo(User::class);
    }

    /**
     * Helper to log an audit entry.
     *
     * @param  array{action: string, model_type: string, model_id?: int|null, description: string, old_values?: array|null, new_values?: array|null}  $data
     */
    public static function log(array $data): self
    {
        return self::create([
            'user_id' => auth()->id(),
            'action' => $data['action'],
            'model_type' => $data['model_type'],
            'model_id' => $data['model_id'] ?? null,
            'description' => $data['description'],
            'old_values' => $data['old_values'] ?? null,
            'new_values' => $data['new_values'] ?? null,
            'ip_address' => request()->ip(),
        ]);
    }
}
