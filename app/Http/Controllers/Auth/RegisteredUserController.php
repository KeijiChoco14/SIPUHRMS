<?php

namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use App\Models\Employee;
use App\Models\User;
use Illuminate\Auth\Events\Registered;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Str;
use Illuminate\Validation\Rules;
use Inertia\Inertia;
use Inertia\Response;
use Spatie\Permission\Models\Role;

class RegisteredUserController extends Controller
{
    /**
     * Display the registration view.
     */
    public function create(): Response
    {
        return Inertia::render('Auth/Register', [
            'corporateDomain' => config('services.hotel.corporate_domain', 'swissbelhotel.com'),
        ]);
    }

    /**
     * Handle an incoming registration request.
     */
    public function store(Request $request): RedirectResponse
    {
        if ($request->has('username')) {
            $request->merge(['username' => Str::lower(trim((string) $request->username))]);
        }
        if ($request->has('email')) {
            $request->merge(['email' => Str::lower(trim((string) $request->email))]);
        }

        $validated = $request->validate([
            'name' => ['required', 'string', 'max:255'],
            'username' => [
                'required',
                'string',
                'min:3',
                'max:30',
                'regex:/^[a-zA-Z0-9._]+$/',
                'unique:users,username',
            ],
            'email' => [
                'required',
                'string',
                'lowercase',
                'email',
                'max:255',
                'unique:users,email',
            ],
            'password' => ['required', 'confirmed', Rules\Password::defaults()],
            'terms' => ['required', 'accepted'],
        ], [
            'username.regex' => 'Username may only contain letters, numbers, dots, and underscores.',
            'username.unique' => 'This username is already taken. Please choose another.',
            'email.unique' => 'This email address is already registered. Please log in instead.',
            'terms.accepted' => 'You must accept the internal account-use policy to register.',
        ]);

        $normalizedUsername = Str::lower(trim($validated['username']));
        $normalizedEmail = Str::lower(trim($validated['email']));

        // Create the user record with least-privileged initial status
        $user = User::create([
            'name' => $validated['name'],
            'username' => $normalizedUsername,
            'email' => $normalizedEmail,
            'password' => Hash::make($validated['password']),
            'status' => 'active',
            'terms_accepted_at' => now(),
        ]);

        // Strict security rule: ALWAYS assign the least-privileged default role
        // Never accept role parameters from untrusted user input
        $defaultRole = Role::firstOrCreate(['name' => 'Staff / Employee']);
        $user->assignRole($defaultRole);

        // Ensure an associated Employee profile exists so the user immediately appears in Employees & Directory
        $user->ensureEmployeeProfile();

        // Fire registered event to dispatch VerifyEmailNotification
        event(new Registered($user));

        // Authenticate the user session
        Auth::login($user);

        // Redirect directly to verification notice page
        return redirect()->route('verification.notice');
    }
}
