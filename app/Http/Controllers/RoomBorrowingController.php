<?php

namespace App\Http\Controllers;

use App\Http\Requests\BorrowRoomRequest;
use App\Http\Requests\ConfirmReturnRequest;
use App\Http\Requests\RequestReturnRequest;
use App\Http\Requests\StoreRoomRequest;
use App\Http\Requests\UpdateRoomRequest;
use App\Models\AuditLog;
use App\Models\Room;
use App\Models\RoomBorrowingTransaction;
use App\Models\User;
use App\Notifications\RoomBorrowingNotification;
use Carbon\Carbon;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;

class RoomBorrowingController extends Controller
{
    /**
     * Display the Room Borrowing & Key Management interface.
     */
    public function index(Request $request)
    {
        $user = Auth::user();
        $employee = $user->employee;

        $canBorrow = $user->can('room.borrow') && $employee !== null;
        $canApproveReturn = $user->can('room.return.approve');
        $canManageRooms = $user->can('room.manage');
        $isSecurity = $user->hasRole('Security');

        $search = $request->input('search', '');
        $statusFilter = $request->input('status', 'ALL');
        $tab = $request->input('tab', 'catalog');

        // Query active rooms for catalog
        $roomsQuery = Room::query()
            ->with([
                'activeTransaction.borrower.user:id,name,email',
                'activeTransaction.borrower.department:id,name',
            ])
            ->where('is_active', true);

        if ($search) {
            $roomsQuery->where(function ($q) use ($search) {
                $q->where('name', 'like', "%{$search}%")
                    ->orWhere('room_number', 'like', "%{$search}%")
                    ->orWhere('location', 'like', "%{$search}%")
                    ->orWhere('key_code', 'like', "%{$search}%");
            });
        }

        if (in_array($statusFilter, [Room::STATUS_AVAILABLE, Room::STATUS_BORROWED, Room::STATUS_PENDING_RETURN])) {
            $roomsQuery->where('status', $statusFilter);
        }

        $rooms = $roomsQuery->orderBy('room_number', 'asc')->get();

        // Calculate actual overview statistics
        $stats = [
            'total' => Room::where('is_active', true)->count(),
            'available' => Room::where('is_active', true)->where('status', Room::STATUS_AVAILABLE)->count(),
            'borrowed' => Room::where('is_active', true)->where('status', Room::STATUS_BORROWED)->count(),
            'pending_return' => Room::where('is_active', true)->where('status', Room::STATUS_PENDING_RETURN)->count(),
        ];

        // My Active Borrowing Transactions
        $myActiveBorrowings = [];
        $myHistory = [];
        if ($employee) {
            $myActiveBorrowings = RoomBorrowingTransaction::with(['room'])
                ->where('borrower_employee_id', $employee->id)
                ->whereIn('status', [
                    RoomBorrowingTransaction::STATUS_BORROWED,
                    RoomBorrowingTransaction::STATUS_PENDING_RETURN,
                ])
                ->orderBy('borrowed_at', 'desc')
                ->get();

            $myHistory = RoomBorrowingTransaction::with([
                'room',
                'securityUser:id,name',
            ])
                ->where('borrower_employee_id', $employee->id)
                ->where('status', RoomBorrowingTransaction::STATUS_RETURNED)
                ->orderBy('returned_at', 'desc')
                ->limit(20)
                ->get();
        }

        // Pending Returns Queue (for Security and Administrators)
        $pendingReturns = [];
        $recentAuditTransactions = [];
        if ($canApproveReturn) {
            $pendingReturns = RoomBorrowingTransaction::with([
                'room',
                'borrower.user:id,name,email',
                'borrower.department:id,name',
                'borrower.position:id,name',
            ])
                ->where('status', RoomBorrowingTransaction::STATUS_PENDING_RETURN)
                ->orderBy('return_requested_at', 'asc')
                ->get();

            $recentAuditTransactions = RoomBorrowingTransaction::with([
                'room',
                'borrower.user:id,name',
                'borrower.department:id,name',
                'securityUser:id,name',
            ])
                ->where('status', RoomBorrowingTransaction::STATUS_RETURNED)
                ->orderBy('returned_at', 'desc')
                ->limit(15)
                ->get();
        }

        // All Rooms list for management tab (including inactive)
        $allRoomsForAdmin = [];
        if ($canManageRooms) {
            $allRoomsForAdmin = Room::withCount('transactions')
                ->orderBy('room_number', 'asc')
                ->get();
        }

        // Stable entry point URL for QR Code
        $qrUrl = url('/room-borrowing');

        return Inertia::render('RoomBorrowing/Index', [
            'rooms' => $rooms,
            'stats' => $stats,
            'myActiveBorrowings' => $myActiveBorrowings,
            'myHistory' => $myHistory,
            'pendingReturns' => $pendingReturns,
            'recentAuditTransactions' => $recentAuditTransactions,
            'allRoomsForAdmin' => $allRoomsForAdmin,
            'filters' => [
                'search' => $search,
                'status' => $statusFilter,
                'tab' => $tab,
            ],
            'permissions' => [
                'can_borrow' => $canBorrow,
                'can_approve_return' => $canApproveReturn,
                'can_manage_rooms' => $canManageRooms,
                'is_security' => $isSecurity,
            ],
            'qrUrl' => $qrUrl,
        ]);
    }

    /**
     * Borrow an available room key.
     */
    public function borrow(BorrowRoomRequest $request)
    {
        $user = Auth::user();
        $employee = $user->employee;

        if (!$employee) {
            return back()->withErrors(['message' => 'Employee profile not found for this account.']);
        }

        return DB::transaction(function () use ($request, $user, $employee) {
            // Pessimistic lock on the room to prevent concurrent collisions
            $room = Room::where('id', $request->validated('room_id'))
                ->lockForUpdate()
                ->firstOrFail();

            if (!$room->is_active) {
                return back()->withErrors(['message' => 'This room is currently deactivated by hotel management.']);
            }

            if ($room->status !== Room::STATUS_AVAILABLE) {
                return back()->withErrors([
                    'message' => "Room '{$room->name}' is currently unavailable for borrowing (Current status: {$room->status}).",
                ]);
            }

            // Verify no conflicting active transaction exists
            $existingActive = RoomBorrowingTransaction::where('room_id', $room->id)
                ->whereIn('status', [
                    RoomBorrowingTransaction::STATUS_BORROWED,
                    RoomBorrowingTransaction::STATUS_PENDING_RETURN,
                ])
                ->lockForUpdate()
                ->first();

            if ($existingActive) {
                return back()->withErrors([
                    'message' => "The key for room '{$room->name}' is currently borrowed by another staff member.",
                ]);
            }

            $durationHours = (int) $request->validated('expected_duration_hours');
            $now = Carbon::now();
            $expectedReturnAt = $now->copy()->addHours($durationHours);

            $txNumber = RoomBorrowingTransaction::generateTransactionNumber();
            $transaction = RoomBorrowingTransaction::create([
                'transaction_number' => $txNumber,
                'room_id' => $room->id,
                'borrower_employee_id' => $employee->id,
                'borrowed_at' => $now,
                'expected_duration_hours' => $durationHours,
                'expected_return_at' => $expectedReturnAt,
                'purpose' => $request->validated('purpose'),
                'status' => RoomBorrowingTransaction::STATUS_BORROWED,
            ]);

            $room->update(['status' => Room::STATUS_BORROWED]);

            // Audit Trail
            AuditLog::log([
                'action' => 'ROOM_KEY_BORROWED',
                'model_type' => RoomBorrowingTransaction::class,
                'model_id' => $transaction->id,
                'description' => "Key loan for {$room->name} ({$room->room_number}) for {$durationHours}h by {$user->name} [{$employee->employee_number}]. Ref: {$txNumber}.",
                'new_values' => [
                    'transaction_number' => $txNumber,
                    'room_id' => $room->id,
                    'borrower_employee_id' => $employee->id,
                    'borrowed_at' => $transaction->borrowed_at->toDateTimeString(),
                    'expected_duration_hours' => $durationHours,
                    'expected_return_at' => $expectedReturnAt->toDateTimeString(),
                    'status' => RoomBorrowingTransaction::STATUS_BORROWED,
                ],
            ]);

            // Notify Security team
            $securityUsers = User::role('Security')->get();
            foreach ($securityUsers as $sec) {
                $sec->notify(new RoomBorrowingNotification($transaction, 'KEY_BORROWED'));
            }

            $formattedReturnTime = $expectedReturnAt->format('H:i, d M Y');
            return redirect()->route('room-borrowing.index', ['tab' => 'my-borrowings'])
                ->with('success', "Key for {$room->name} ({$room->room_number}) borrowed for {$durationHours} hour(s) (Expected return: {$formattedReturnTime}). Please return the physical key to the Security post after use.");
        });
    }

    /**
     * Submit a return request for an active borrowing transaction.
     */
    public function requestReturn(RequestReturnRequest $request, RoomBorrowingTransaction $transaction)
    {
        $user = Auth::user();
        $employee = $user->employee;
        $isSuperAdmin = $user->hasRole('Super Admin');

        if (!$isSuperAdmin && (!$employee || $transaction->borrower_employee_id !== $employee->id)) {
            abort(403, 'Access denied: You can only submit a return request for keys you borrowed.');
        }

        return DB::transaction(function () use ($request, $transaction, $user) {
            $tx = RoomBorrowingTransaction::where('id', $transaction->id)
                ->lockForUpdate()
                ->firstOrFail();

            if ($tx->status !== RoomBorrowingTransaction::STATUS_BORROWED) {
                return back()->withErrors([
                    'message' => "Return request cannot be submitted because the transaction status is: {$tx->status}.",
                ]);
            }

            $room = Room::where('id', $tx->room_id)->lockForUpdate()->firstOrFail();

            $now = Carbon::now();
            $tx->update([
                'status' => RoomBorrowingTransaction::STATUS_PENDING_RETURN,
                'return_requested_at' => $now,
                'return_notes' => $request->validated('return_notes'),
            ]);

            $room->update(['status' => Room::STATUS_PENDING_RETURN]);

            AuditLog::log([
                'action' => 'ROOM_KEY_RETURN_REQUESTED',
                'model_type' => RoomBorrowingTransaction::class,
                'model_id' => $tx->id,
                'description' => "Return request for room key {$room->name} ({$room->room_number}) submitted by {$user->name}. Awaiting physical verification at Security post.",
                'old_values' => ['status' => RoomBorrowingTransaction::STATUS_BORROWED],
                'new_values' => [
                    'status' => RoomBorrowingTransaction::STATUS_PENDING_RETURN,
                    'return_requested_at' => $now->toDateTimeString(),
                ],
            ]);

            // Notify Security
            $securityUsers = User::role('Security')->get();
            foreach ($securityUsers as $sec) {
                $sec->notify(new RoomBorrowingNotification($tx, 'RETURN_REQUESTED'));
            }

            return redirect()->route('room-borrowing.index', ['tab' => 'my-borrowings'])
                ->with('success', "Return request for {$room->name} has been submitted. Please hand over the physical key to the Security post.");
        });
    }

    /**
     * Security confirms physical receipt of the returned room key.
     */
    public function confirmReturn(ConfirmReturnRequest $request, RoomBorrowingTransaction $transaction)
    {
        $user = Auth::user();

        if (!$user->can('room.return.approve')) {
            abort(403, 'Access denied: Only Security personnel or Administrators are authorized to confirm physical key returns.');
        }

        return DB::transaction(function () use ($request, $transaction, $user) {
            $tx = RoomBorrowingTransaction::where('id', $transaction->id)
                ->lockForUpdate()
                ->firstOrFail();

            if ($tx->status !== RoomBorrowingTransaction::STATUS_PENDING_RETURN) {
                return back()->withErrors([
                    'message' => "Confirmation failed: This transaction is already completed or not in the pending return queue (Status: {$tx->status}).",
                ]);
            }

            $room = Room::where('id', $tx->room_id)->lockForUpdate()->firstOrFail();

            $now = Carbon::now();
            $tx->update([
                'status' => RoomBorrowingTransaction::STATUS_RETURNED,
                'returned_at' => $now,
                'security_user_id' => $user->id,
                'security_notes' => $request->validated('security_notes'),
            ]);

            $room->update(['status' => Room::STATUS_AVAILABLE]);

            AuditLog::log([
                'action' => 'ROOM_KEY_RETURN_CONFIRMED',
                'model_type' => RoomBorrowingTransaction::class,
                'model_id' => $tx->id,
                'description' => "Physical return of key for {$room->name} ({$room->room_number}) verified and approved by Security officer {$user->name}. Room is now Available.",
                'old_values' => ['status' => RoomBorrowingTransaction::STATUS_PENDING_RETURN],
                'new_values' => [
                    'status' => RoomBorrowingTransaction::STATUS_RETURNED,
                    'security_user_id' => $user->id,
                    'returned_at' => $now->toDateTimeString(),
                    'security_notes' => $request->validated('security_notes'),
                ],
            ]);

            // Notify the borrower employee
            $borrowerUser = $tx->borrower?->user;
            if ($borrowerUser) {
                $borrowerUser->notify(new RoomBorrowingNotification($tx, 'RETURN_CONFIRMED'));
            }

            return redirect()->route('room-borrowing.index', ['tab' => 'pending-returns'])
                ->with('success', "Physical return of key for {$room->name} ({$room->room_number}) successfully confirmed. Room is now Available.");
        });
    }

    /**
     * Store a newly created room (Admin / Security privilege).
     */
    public function storeRoom(StoreRoomRequest $request)
    {
        $room = Room::create([
            'room_number' => $request->validated('room_number'),
            'name' => $request->validated('name'),
            'location' => $request->validated('location'),
            'capacity' => $request->validated('capacity'),
            'description' => $request->validated('description'),
            'key_code' => $request->validated('key_code'),
            'status' => Room::STATUS_AVAILABLE,
            'is_active' => true,
        ]);

        AuditLog::log([
            'action' => 'ROOM_CREATED',
            'model_type' => Room::class,
            'model_id' => $room->id,
            'description' => "New room created: {$room->name} ({$room->room_number}) by " . Auth::user()->name,
            'new_values' => $room->toArray(),
        ]);

        return redirect()->route('room-borrowing.index', ['tab' => 'manage-rooms'])
            ->with('success', "Room '{$room->name}' created successfully.");
    }

    /**
     * Update room details (Admin / Security privilege).
     */
    public function updateRoom(UpdateRoomRequest $request, Room $room)
    {
        $oldValues = $room->toArray();

        $room->update($request->validated());

        AuditLog::log([
            'action' => 'ROOM_UPDATED',
            'model_type' => Room::class,
            'model_id' => $room->id,
            'description' => "Room details updated for {$room->name} ({$room->room_number}) by " . Auth::user()->name,
            'old_values' => $oldValues,
            'new_values' => $room->toArray(),
        ]);

        return redirect()->route('room-borrowing.index', ['tab' => 'manage-rooms'])
            ->with('success', "Room '{$room->name}' updated successfully.");
    }

    /**
     * Toggle active status of a room.
     */
    public function toggleRoomStatus(Room $room)
    {
        $user = Auth::user();
        if (!$user->can('room.manage')) {
            abort(403, 'Access denied.');
        }

        if ($room->status !== Room::STATUS_AVAILABLE && $room->is_active) {
            return back()->withErrors([
                'message' => "Cannot deactivate room while it is borrowed or pending return confirmation.",
            ]);
        }

        $newActive = !$room->is_active;
        $room->update(['is_active' => $newActive]);

        AuditLog::log([
            'action' => $newActive ? 'ROOM_ACTIVATED' : 'ROOM_DEACTIVATED',
            'model_type' => Room::class,
            'model_id' => $room->id,
            'description' => "Room {$room->name} status changed to " . ($newActive ? 'Active' : 'Inactive') . " by " . $user->name,
        ]);

        $statusLabel = $newActive ? 'activated' : 'deactivated';
        return redirect()->route('room-borrowing.index', ['tab' => 'manage-rooms'])
            ->with('success', "Room '{$room->name}' successfully {$statusLabel}.");
    }
}
