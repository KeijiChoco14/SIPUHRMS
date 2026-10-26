<?php

namespace App\Http\Requests\Auth;

use App\Models\User;
use Illuminate\Auth\Events\Lockout;
use Illuminate\Contracts\Validation\ValidationRule;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\RateLimiter;
use Illuminate\Support\Str;
use Illuminate\Validation\ValidationException;

class LoginRequest extends FormRequest
{
    /**
     * Determine if the user is authorized to make this request.
     */
    public function authorize(): bool
    {
        return true;
    }

    /**
     * Get the validation rules that apply to the request.
     *
     * @return array<string, ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {
        return [
            'login' => ['required_without:email', 'string'],
            'email' => ['required_without:login', 'string'],
            'password' => ['required', 'string'],
            'remember' => ['nullable', 'boolean'],
        ];
    }

    /**
     * Get custom error messages for validator.
     */
    public function messages(): array
    {
        return [
            'login.required_without' => 'Please enter your email or username.',
            'email.required_without' => 'Please enter your email or username.',
            'password.required' => 'Please enter your password.',
        ];
    }

    /**
     * Attempt to authenticate the request's credentials via email or username.
     *
     * @throws ValidationException
     */
    public function authenticate(): void
    {
        $this->ensureIsNotRateLimited();

        $identifier = trim((string) ($this->input('login') ?? $this->input('email') ?? ''));
        $normalized = Str::lower($identifier);

        // Find user by normalized email or username
        $user = User::where(function ($q) use ($normalized) {
            $q->whereRaw('LOWER(email) = ?', [$normalized])
              ->orWhereRaw('LOWER(username) = ?', [$normalized]);
        })->first();

        // Generic error message if user not found or password incorrect (prevents account enumeration)
        if (! $user || ! Hash::check($this->input('password'), $user->password)) {
            RateLimiter::hit($this->throttleKey());

            throw ValidationException::withMessages([
                'login' => 'Invalid email or username or password.',
                'email' => 'Invalid email or username or password.',
            ]);
        }

        // Account status verification
        if ($user->isDisabled()) {
            RateLimiter::hit($this->throttleKey());

            throw ValidationException::withMessages([
                'login' => 'Your account is disabled. Please contact the administrator.',
                'email' => 'Your account is disabled. Please contact the administrator.',
            ]);
        }

        if ($user->isPending()) {
            RateLimiter::hit($this->throttleKey());

            throw ValidationException::withMessages([
                'login' => 'Your registration is awaiting approval from the IT Department. Please contact the IT Department directly if you require assistance.',
                'email' => 'Your registration is awaiting approval from the IT Department. Please contact the IT Department directly if you require assistance.',
            ]);
        }

        if ($user->isRejected()) {
            RateLimiter::hit($this->throttleKey());

            throw ValidationException::withMessages([
                'login' => 'Your registration has not been approved. Please contact the IT Department for further information.',
                'email' => 'Your registration has not been approved. Please contact the IT Department for further information.',
            ]);
        }

        if (! $user->isActive()) {
            RateLimiter::hit($this->throttleKey());

            throw ValidationException::withMessages([
                'login' => 'Your registration is awaiting approval from the IT Department. Please contact the IT Department directly if you require assistance.',
                'email' => 'Your registration is awaiting approval from the IT Department. Please contact the IT Department directly if you require assistance.',
            ]);
        }

        Auth::login($user, $this->boolean('remember'));

        RateLimiter::clear($this->throttleKey());
    }

    /**
     * Ensure the login request is not rate limited.
     *
     * @throws ValidationException
     */
    public function ensureIsNotRateLimited(): void
    {
        if (! RateLimiter::tooManyAttempts($this->throttleKey(), 5)) {
            return;
        }

        event(new Lockout($this));

        $seconds = RateLimiter::availableIn($this->throttleKey());

        throw ValidationException::withMessages([
            'login' => trans('auth.throttle', [
                'seconds' => $seconds,
                'minutes' => ceil($seconds / 60),
            ]),
            'email' => trans('auth.throttle', [
                'seconds' => $seconds,
                'minutes' => ceil($seconds / 60),
            ]),
        ]);
    }

    /**
     * Get the rate limiting throttle key for the request.
     */
    public function throttleKey(): string
    {
        $identifier = Str::lower(trim((string) ($this->input('login') ?? $this->input('email') ?? '')));
        return Str::transliterate($identifier . '|' . $this->ip());
    }
}
