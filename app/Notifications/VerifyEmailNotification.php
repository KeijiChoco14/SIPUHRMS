<?php

namespace App\Notifications;

use Illuminate\Auth\Notifications\VerifyEmail as BaseVerifyEmail;
use Illuminate\Bus\Queueable;
use Illuminate\Notifications\Messages\MailMessage;
use Illuminate\Support\Carbon;
use Illuminate\Support\Facades\Config;
use Illuminate\Support\Facades\URL;

class VerifyEmailNotification extends BaseVerifyEmail
{
    use Queueable;

    /**
     * Build the mail representation of the notification.
     *
     * @param  mixed  $notifiable
     * @return \Illuminate\Notifications\Messages\MailMessage
     */
    public function toMail($notifiable): MailMessage
    {
        $verificationUrl = $this->verificationUrl($notifiable);
        $expireMinutes = Config::get('auth.verification.expire', 60);
        $fromAddress = Config::get('mail.from.address', 'support@kreviadigitalid.my.id');
        $fromName = Config::get('mail.from.name', 'SIPU Management - Swiss-Belinn');

        return (new MailMessage)
            ->from($fromAddress, $fromName)
            ->subject('Verify Your SIPU Management Email Address')
            ->greeting('Hello ' . $notifiable->name . ',')
            ->line('Thank you for creating an account on SIPU Management (Swiss-Belinn SKA Pekanbaru).')
            ->line('Please verify your email address to confirm control of your inbox and enable secure access.')
            ->action('Verify Email Address', $verificationUrl)
            ->line("This verification link is time-limited and will expire in {$expireMinutes} minutes.")
            ->line('Please check your Inbox as well as your Spam or Junk folder if you do not see this email immediately.')
            ->line('Important: Email verification confirms your email ownership; hotel system module permissions remain subject to administrator approval.')
            ->line('If you did not register for an account on SIPU Management, please ignore this email or notify IT Security.');
    }

    /**
     * Get the verification URL for the given notifiable.
     *
     * @param  mixed  $notifiable
     * @return string
     */
    protected function verificationUrl($notifiable): string
    {
        return URL::temporarySignedRoute(
            'verification.verify',
            Carbon::now()->addMinutes(Config::get('auth.verification.expire', 60)),
            [
                'id' => $notifiable->getKey(),
                'hash' => sha1($notifiable->getEmailForVerification()),
            ]
        );
    }
}
