<?php

namespace App\Models;

use Illuminate\Contracts\Auth\MustVerifyEmail;
use App\Notifications\VerifyEmailNotification;
use Database\Factories\UserFactory;
use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Attributes\Hidden;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Spatie\Permission\Traits\HasRoles;

use Illuminate\Database\Eloquent\Casts\Attribute;
use Illuminate\Support\Facades\Storage;

#[Fillable(['name', 'username', 'email', 'email_verified_at', 'password', 'phone_number', 'status', 'terms_accepted_at', 'profile_photo_path'])]
#[Hidden(['password', 'remember_token'])]
class User extends Authenticatable implements MustVerifyEmail
{
    /** @use HasFactory<UserFactory> */
    use HasFactory, HasRoles, Notifiable;

    protected $appends = [
        'profile_photo_url',
    ];

    /**
     * Get the attributes that should be cast.
     *
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'email_verified_at' => 'datetime',
            'terms_accepted_at' => 'datetime',
            'password' => 'hashed',
        ];
    }

    protected static function booted(): void
    {
        static::creating(function (User $user) {
            if (empty($user->username) && !empty($user->email)) {
                $base = \Illuminate\Support\Str::lower(preg_replace('/[^a-zA-Z0-9._]/', '_', explode('@', $user->email)[0] ?? ''));
                if (strlen($base) < 3) {
                    $base = 'usr_' . \Illuminate\Support\Str::lower(\Illuminate\Support\Str::random(4));
                }
                $candidate = $base;
                $counter = 1;
                while (static::where('username', $candidate)->exists()) {
                    $candidate = $base . '_' . $counter;
                    $counter++;
                }
                $user->username = $candidate;
            }
            if (empty($user->status)) {
                $user->status = 'active';
            }
        });
    }

    /**
     * Send the email verification notification using branded English template.
     */
    public function sendEmailVerificationNotification(): void
    {
        $this->notify(new VerifyEmailNotification);
    }

    public function isActive(): bool
    {
        return $this->status === 'active';
    }

    public function isPendingApproval(): bool
    {
        return $this->status === 'pending_approval';
    }

    public function isDisabled(): bool
    {
        return $this->status === 'disabled';
    }

    public function employee()
    {
        return $this->hasOne(Employee::class);
    }

    /**
     * Ensure the user has an associated Employee profile.
     * Automatically creates a default employee profile for any registered user if missing.
     */
    public function ensureEmployeeProfile(): Employee
    {
        if ($this->employee) {
            return $this->employee;
        }

        $departmentId = null;
        $employmentStatus = 'Active';

        if ($this->hasAnyRole(['Super Admin', 'HRD / Admin', 'General Manager'])) {
            $department = Department::firstOrCreate(
                ['name' => 'Management'],
                ['description' => 'Executive & Hotel Management']
            );
            $departmentId = $department->id;
            $employmentStatus = 'Permanent';
        }

        $employeeNumber = Employee::generateNextEmployeeNumber();

        $employee = Employee::firstOrCreate(
            ['user_id' => $this->id],
            [
                'employee_number' => $employeeNumber,
                'phone_number' => $this->phone_number ?? null,
                'department_id' => $departmentId,
                'position_id' => null,
                'employment_status' => $employmentStatus,
                'account_status' => 'Active',
                'join_date' => now()->toDateString(),
            ]
        );

        $this->setRelation('employee', $employee);
        return $employee;
    }

    protected function profilePhotoUrl(): Attribute
    {
        return Attribute::make(
            get: function () {
                return $this->profile_photo_path
                    ? Storage::url($this->profile_photo_path)
                    : $this->defaultProfilePhotoUrl();
            },
        );
    }

    protected function phoneNumber(): Attribute
    {
        return Attribute::make(
            set: function ($value) {
                if (!$value) return null;
                // Clean the phone number from non-numeric characters (except +)
                $cleaned = preg_replace('/[^0-9+]/', '', $value);
                
                // Replace leading 0 with +62
                if (str_starts_with($cleaned, '0')) {
                    return '+62' . substr($cleaned, 1);
                }
                
                // If it starts with 62 (without +), prepend +
                if (str_starts_with($cleaned, '62')) {
                    return '+' . $cleaned;
                }
                
                // If it already starts with +62 or something else, leave as is
                return $cleaned;
            }
        );
    }

    /**
     * Get the default profile photo URL if no profile photo has been uploaded.
     */
    protected function defaultProfilePhotoUrl(): string
    {
        $name = trim(collect(explode(' ', $this->name))->map(function ($segment) {
            return mb_substr($segment, 0, 1);
        })->join(' '));

        return 'https://ui-avatars.com/api/?name='.urlencode($name).'&color=7F9CF5&background=EBF4FF';
    }
}
