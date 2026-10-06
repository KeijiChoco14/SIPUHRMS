<?php

namespace App\Notifications;

use App\Models\MasterKeyRequest;
use Illuminate\Bus\Queueable;
use Illuminate\Notifications\Notification;

class MasterKeyStatusNotification extends Notification
{
    use Queueable;

    public MasterKeyRequest $masterKeyRequest;
    public string $type;
    public ?string $customMessage;

    /**
     * Create a new notification instance.
     *
     * @param MasterKeyRequest $masterKeyRequest
     * @param string $type NEW_REQUEST | STATUS_UPDATED | EXPIRING_SOON
     * @param string|null $customMessage
     */
    public function __construct(MasterKeyRequest $masterKeyRequest, string $type = 'STATUS_UPDATED', ?string $customMessage = null)
    {
        $this->masterKeyRequest = $masterKeyRequest;
        $this->type = $type;
        $this->customMessage = $customMessage;
    }

    /**
     * Get the notification's delivery channels.
     *
     * @return array<int, string>
     */
    public function via(object $notifiable): array
    {
        return ['database'];
    }

    /**
     * Get the array representation of the notification.
     *
     * @return array<string, mixed>
     */
    public function toArray(object $notifiable): array
    {
        $keyNum = $this->masterKeyRequest->key_number;
        $reqNum = $this->masterKeyRequest->request_number;
        $staffName = $this->masterKeyRequest->employee?->user?->name ?? 'Staf';

        if ($this->type === 'NEW_REQUEST') {
            $title = 'Permohonan Master Key Baru';
            $message = "Permohonan akses {$keyNum} ({$reqNum}) oleh {$staffName} membutuhkan persetujuan Anda.";
        } elseif ($this->type === 'EXPIRING_SOON') {
            $days = $this->masterKeyRequest->days_remaining;
            $title = 'Peringatan: Master Key Segera Berakhir';
            $message = "Akses kunci {$keyNum} ({$reqNum}) akan kedaluwarsa dalam {$days} hari. Segera lakukan perpanjangan 3 bulan.";
        } else {
            // STATUS_UPDATED
            $status = $this->masterKeyRequest->status;
            $statusText = match ($status) {
                'Approved' => 'telah disetujui untuk masa aktif 3 bulan',
                'Rejected' => 'telah ditolak',
                'Revoked' => 'telah dicabut / dikembalikan',
                default => 'telah diperbarui',
            };
            $title = "Akses Master Key {$status}";
            $message = $this->customMessage ?: "Permohonan akses {$keyNum} ({$reqNum}) {$statusText}.";
        }

        return [
            'master_key_id' => $this->masterKeyRequest->id,
            'request_number' => $reqNum,
            'key_number' => $keyNum,
            'title' => $title,
            'message' => $message,
            'action_url' => route('master-keys.index', ['search' => $reqNum]),
            'category' => 'master_key',
        ];
    }
}
