<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Symfony\Component\HttpFoundation\Response;

class EnsureAccountIsApproved
{
    /**
     * Handle an incoming request.
     *
     * Ensures that only approved or active user accounts can access protected resources.
     * Pending and rejected accounts are strictly blocked, logged out, and given clear feedback.
     *
     * @param  \Closure(\Illuminate\Http\Request): (\Symfony\Component\HttpFoundation\Response)  $next
     */
    public function handle(Request $request, Closure $next): Response
    {
        $user = $request->user();

        if ($user) {
            $status = $user->status;

            if (!in_array($status, ['active', 'approved'], true)) {
                Auth::guard('web')->logout();
                $request->session()->invalidate();
                $request->session()->regenerateToken();

                if ($status === 'pending' || $status === 'pending_approval') {
                    $message = 'Your registration is awaiting approval from the IT Department. Please contact the IT Department directly if you require assistance.';
                } elseif ($status === 'rejected') {
                    $message = 'Your registration has not been approved. Please contact the IT Department for further information.';
                } else {
                    $message = 'Your account is disabled. Please contact the administrator.';
                }

                if ($request->expectsJson() || $request->is('api/*')) {
                    return response()->json(['message' => $message], 403);
                }

                return redirect()->route('login')->withErrors([
                    'login' => $message,
                    'email' => $message,
                ]);
            }
        }

        return $next($request);
    }
}
