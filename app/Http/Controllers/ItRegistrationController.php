<?php

namespace App\Http\Controllers;

use App\Models\AuditLog;
use App\Models\User;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;
use Inertia\Response;

class ItRegistrationController extends Controller
{
    /**
     * Authorize that the authenticated user is an authorized IT personnel or executive management.
     */
    protected function authorizeItPersonnel(): void
    {
        $user = Auth::user();

        if (!$user || !$user->canManageRegistrations()) {
            abort(403, 'Unauthorized. Only IT Department personnel and hotel management can manage registration approvals.');
        }
    }

    /**
     * Display a listing of user registrations for IT review.
     */
    public function index(Request $request): Response
    {
        $this->authorizeItPersonnel();

        $status = $request->query('status', 'pending');
        $search = trim((string) $request->query('search', ''));

        $query = User::with([
            'employee.department',
            'employee.position',
            'approver',
            'roles',
        ])->latest('id');

        // Apply Status Filter
        if ($status === 'pending') {
            $query->whereIn('status', ['pending', 'pending_approval']);
        } elseif ($status === 'approved') {
            $query->whereIn('status', ['approved', 'active']);
        } elseif ($status === 'rejected') {
            $query->where('status', 'rejected');
        } elseif ($status !== 'all') {
            $query->where('status', $status);
        }

        // Apply Search Filter
        if ($search !== '') {
            $query->where(function ($q) use ($search) {
                $q->where('name', 'like', "%{$search}%")
                  ->orWhere('username', 'like', "%{$search}%")
                  ->orWhere('email', 'like', "%{$search}%")
                  ->orWhere('phone_number', 'like', "%{$search}%");
            });
        }

        $registrations = $query->paginate(15)->withQueryString();

        // Calculate summary counts using single aggregation query
        $rawStats = User::selectRaw("
            COUNT(*) as total,
            COUNT(CASE WHEN status IN ('pending', 'pending_approval') THEN 1 END) as pending,
            COUNT(CASE WHEN status IN ('approved', 'active') THEN 1 END) as approved,
            COUNT(CASE WHEN status = 'rejected' THEN 1 END) as rejected
        ")->first();

        $stats = [
            'pending' => (int) ($rawStats?->pending ?? 0),
            'approved' => (int) ($rawStats?->approved ?? 0),
            'rejected' => (int) ($rawStats?->rejected ?? 0),
            'total' => (int) ($rawStats?->total ?? 0),
        ];

        return Inertia::render('IT/Registrations', [
            'registrations' => $registrations,
            'filters' => [
                'status' => $status,
                'search' => $search,
            ],
            'stats' => $stats,
        ]);
    }

    /**
     * Approve a pending user registration.
     */
    public function approve(Request $request, User $user): RedirectResponse
    {
        $this->authorizeItPersonnel();

        $oldStatus = $user->status;

        $user->update([
            'status' => 'approved',
            'approved_by' => Auth::id(),
            'approved_at' => now(),
            'rejection_reason' => null,
        ]);

        // Ensure Employee record is active and synchronized
        $employee = $user->ensureEmployeeProfile();
        $employee->account_status = 'Active';
        if (!empty($user->phone_number) && empty($employee->phone_number)) {
            $employee->phone_number = $user->phone_number;
        }
        $employee->save();

        AuditLog::log([
            'action' => 'APPROVE_REGISTRATION',
            'model_type' => User::class,
            'model_id' => $user->id,
            'description' => "Approved account registration for {$user->name} ({$user->email}, Phone: {$user->phone_number})",
            'old_values' => ['status' => $oldStatus],
            'new_values' => [
                'status' => 'approved',
                'approved_by' => Auth::id(),
                'approved_at' => now()->toIso8601String(),
            ],
        ]);

        return back()->with('success', "Registration for {$user->name} has been approved successfully.");
    }

    /**
     * Reject a user registration with an optional rejection reason.
     */
    public function reject(Request $request, User $user): RedirectResponse
    {
        $this->authorizeItPersonnel();

        $validated = $request->validate([
            'reason' => ['nullable', 'string', 'max:500'],
        ]);

        $oldStatus = $user->status;
        $reason = $validated['reason'] ?? null;

        $user->update([
            'status' => 'rejected',
            'approved_by' => Auth::id(),
            'approved_at' => now(),
            'rejection_reason' => $reason,
        ]);

        if ($user->employee) {
            $user->employee->update(['account_status' => 'Inactive']);
        }

        AuditLog::log([
            'action' => 'REJECT_REGISTRATION',
            'model_type' => User::class,
            'model_id' => $user->id,
            'description' => "Rejected account registration for {$user->name} ({$user->email}). Reason: " . ($reason ?: 'None provided'),
            'old_values' => ['status' => $oldStatus],
            'new_values' => [
                'status' => 'rejected',
                'approved_by' => Auth::id(),
                'approved_at' => now()->toIso8601String(),
                'rejection_reason' => $reason,
            ],
        ]);

        return back()->with('success', "Registration for {$user->name} has been rejected.");
    }
}
