<?php

namespace App\Console\Commands;

use App\Models\MasterKeyRequest;
use App\Models\User;
use App\Notifications\MasterKeyStatusNotification;
use Carbon\Carbon;
use Illuminate\Console\Command;
use Illuminate\Support\Facades\Notification;

class CheckExpiringMasterKeys extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'master-keys:check-expiring';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Periksa dan kirim notifikasi untuk akses master key yang mendekati kedaluwarsa (H-14)';

    /**
     * Execute the console command.
     */
    public function handle(): int
    {
        $today = Carbon::today()->toDateString();
        $fourteenDaysLater = Carbon::today()->addDays(14)->toDateString();

        $expiringRequests = MasterKeyRequest::with(['employee.user', 'employee.supervisor.user'])
            ->where('status', 'Approved')
            ->where('valid_until', '>=', $today)
            ->where('valid_until', '<=', $fourteenDaysLater)
            ->get();

        $this->info("Ditemukan {$expiringRequests->count()} master key yang mendekati masa kedaluwarsa.");

        foreach ($expiringRequests as $req) {
            $recipients = collect();

            if ($req->employee?->user) {
                $recipients->push($req->employee->user);
            }

            if ($req->employee?->supervisor?->user) {
                $recipients->push($req->employee->supervisor->user);
            }

            // Deduplicate recipients
            $recipients = $recipients->unique('id');

            foreach ($recipients as $recipient) {
                // Avoid notifying the same user for this key within the last 3 days
                $alreadyNotified = $recipient->notifications()
                    ->where('created_at', '>=', Carbon::now()->subDays(3))
                    ->whereJsonContains('data->master_key_id', $req->id)
                    ->whereJsonContains('data->title', 'Peringatan: Master Key Segera Berakhir')
                    ->exists();

                if (!$alreadyNotified) {
                    $recipient->notify(new MasterKeyStatusNotification($req, 'EXPIRING_SOON'));
                    $this->line("Notifikasi terkirim ke {$recipient->name} untuk kunci {$req->key_number}.");
                }
            }
        }

        $this->info('Pemeriksaan selesai.');
        return Command::SUCCESS;
    }
}
