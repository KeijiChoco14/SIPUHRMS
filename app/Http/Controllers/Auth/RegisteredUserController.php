<?php

namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use App\Models\Employee;
use App\Models\User;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
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
     * Display the registration-pending confirmation view.
     */
    public function pending(): Response
    {
        return Inertia::render('Auth/RegistrationPending');
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
        if ($request->has('phone_number')) {
            $request->merge(['phone_number' => trim((string) $request->phone_number)]);
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
            'phone_number' => [
                'required',
                'string',
                'max:20',
                'regex:/^(\+62|62|0)8[1-9][0-9]{6,11}$/',
            ],
            'password' => ['required', 'confirmed', Rules\Password::defaults()],
            'terms' => ['required', 'accepted'],
        ], [
            'username.regex' => 'Username may only contain letters, numbers, dots, and underscores.',
            'username.unique' => 'This username is already taken. Please choose another.',
            'email.unique' => 'This email address is already registered. Please log in instead.',
            'phone_number.required' => 'The phone number field is required.',
            'phone_number.regex' => 'Please provide a valid Indonesian phone number starting with 08, 62, or +62.',
            'phone_number.max' => 'The phone number may not be greater than 20 characters.',
            'terms.accepted' => 'You must accept the internal account-use policy to register.',
        ]);

        $normalizedUsername = Str::lower(trim($validated['username']));
        $normalizedEmail = Str::lower(trim($validated['email']));

        // Create the user record with pending approval status
        $user = User::create([
            'name' => $validated['name'],
            'username' => $normalizedUsername,
            'email' => $normalizedEmail,
            'phone_number' => $validated['phone_number'],
            'password' => Hash::make($validated['password']),
            'status' => 'pending',
            'terms_accepted_at' => now(),
        ]);

        // Strict security rule: ALWAYS assign the least-privileged default role
        // Never accept role parameters from untrusted user input
        $defaultRole = Role::firstOrCreate(['name' => 'Staff / Employee']);
        $user->assignRole($defaultRole);

        // Ensure an associated Employee profile exists so the user details are ready for IT review
        $user->ensureEmployeeProfile();

        // Redirect directly to the dedicated registration-pending confirmation page
        return redirect()->route('registration.pending');
    }
}
