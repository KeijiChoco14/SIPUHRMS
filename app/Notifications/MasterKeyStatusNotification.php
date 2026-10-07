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
        $staffName = $this->masterKeyRequest->employee?->user?->name ?? 'Staff';

        if ($this->type === 'NEW_REQUEST') {
            $title = 'New Master Key Request';
            $message = "Key request for {$keyNum} ({$reqNum}) by {$staffName} requires your approval.";
        } elseif ($this->type === 'EXPIRING_SOON') {
            $days = $this->masterKeyRequest->days_remaining;
            $title = 'Notice: Master Key Expiring Soon';
            $message = "Key access for {$keyNum} ({$reqNum}) expires in {$days} days. Please proceed with the 3-month renewal.";
        } else {
            // STATUS_UPDATED
            $status = $this->masterKeyRequest->status;
            $statusText = match ($status) {
                'Approved' => 'has been approved for a 3-month period',
                'Rejected' => 'has been rejected',
                'Revoked' => 'has been revoked / returned',
                default => 'has been updated',
            };
            $title = "Master Key Access: {$status}";
            $message = $this->customMessage ?: "Key request for {$keyNum} ({$reqNum}) {$statusText}.";
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
