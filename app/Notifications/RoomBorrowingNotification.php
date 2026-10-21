<?php

namespace App\Notifications;

use App\Models\RoomBorrowingTransaction;
use Illuminate\Bus\Queueable;
use Illuminate\Notifications\Notification;

class RoomBorrowingNotification extends Notification
{
    use Queueable;

    public RoomBorrowingTransaction $transaction;
    public string $type;
    public ?string $customMessage;

    /**
     * @param RoomBorrowingTransaction $transaction
     * @param string $type KEY_BORROWED | RETURN_REQUESTED | RETURN_CONFIRMED
     * @param string|null $customMessage
     */
    public function __construct(RoomBorrowingTransaction $transaction, string $type = 'KEY_BORROWED', ?string $customMessage = null)
    {
        $this->transaction = $transaction;
        $this->type = $type;
        $this->customMessage = $customMessage;
    }

    /**
     * @return array<int, string>
     */
    public function via(object $notifiable): array
    {
        return ['database'];
    }

    /**
     * @return array<string, mixed>
     */
    public function toArray(object $notifiable): array
    {
        $roomName = $this->transaction->room?->name ?? 'Room';
        $roomNum = $this->transaction->room?->room_number ?? '';
        $borrowerName = $this->transaction->borrower?->user?->name ?? 'Staff Member';
        $securityName = $this->transaction->securityUser?->name ?? 'Security Officer';
        $txNum = $this->transaction->transaction_number;

        switch ($this->type) {
            case 'KEY_BORROWED':
                $title = 'Room Key Borrowed Successfully';
                $message = "Key for {$roomName} ({$roomNum}) has been borrowed by {$borrowerName}. Ref: {$txNum}.";
                break;

            case 'RETURN_REQUESTED':
                $title = 'Room Key Return Requested';
                $message = "{$borrowerName} requested to return key for {$roomName} ({$roomNum}). Please verify physical key at Security post.";
                break;

            case 'RETURN_CONFIRMED':
                $title = 'Room Key Return Confirmed by Security';
                $message = "Key return for {$roomName} ({$roomNum}) has been verified and confirmed by {$securityName}. Transaction completed.";
                break;

            default:
                $title = 'Room Key Borrowing Status Update';
                $message = $this->customMessage ?: "Borrowing status for {$roomName} key has been updated.";
                break;
        }

        return [
            'transaction_id' => $this->transaction->id,
            'transaction_number' => $txNum,
            'room_id' => $this->transaction->room_id,
            'room_name' => $roomName,
            'title' => $title,
            'message' => $message,
            'action_url' => route('room-borrowing.index'),
            'category' => 'room_borrowing',
            'type' => 'room_borrowing_status',
        ];
    }
}
