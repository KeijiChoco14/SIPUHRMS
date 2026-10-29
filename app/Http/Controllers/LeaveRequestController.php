<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\LeaveRequest;
use Inertia\Inertia;
use Illuminate\Support\Facades\Auth;

class LeaveRequestController extends Controller
{
    public function index(Request $request)
    {
        $user = Auth::user();
        $isApprover = $user->hasAnyRole(['Super Admin', 'HRD / Admin', 'General Manager']);
        $employee = $user->employee ?? $user->ensureEmployeeProfile();

        $tab = $request->query('tab', $isApprover ? 'approvals' : 'my');

        // Personal leave requests of authenticated user
        $myRequests = $employee
            ? LeaveRequest::with(['approver:id,name'])
                ->where('employee_id', $employee->id)
                ->orderBy('created_at', 'desc')
                ->get()
            : collect([]);

        // All employee leave requests for authorized approvers
        $allRequests = $isApprover
            ? LeaveRequest::with([
                'employee.user:id,name,email',
                'employee.department:id,name',
                'approver:id,name',
            ])
                ->orderBy('created_at', 'desc')
                ->get()
            : collect([]);

        $pendingApprovalsCount = $isApprover
            ? LeaveRequest::where('status', 'Pending')->count()
            : 0;

        return Inertia::render('Leave/Index', [
            'leaveRequests' => ($isApprover && $tab === 'approvals') ? $allRequests : $myRequests,
            'myRequests' => $myRequests,
            'allRequests' => $allRequests,
            'canApprove' => $isApprover,
            'activeTab' => $tab,
            'pendingApprovalsCount' => $pendingApprovalsCount,
        ]);
    }

    public function store(Request $request)
    {
        $request->validate([
            'type' => 'required|in:Annual,Sick,Unpaid,Maternity,Other',
            'start_date' => 'required|date',
            'end_date' => 'required|date|after_or_equal:start_date',
            'reason' => 'required|string',
        ]);

        $user = Auth::user();
        $employee = $user->employee ?? $user->ensureEmployeeProfile();
        
        if (!$employee) {
            return back()->with('error', 'Only employees with active profiles can request leave.');
        }

        LeaveRequest::create([
            'employee_id' => $employee->id,
            'type' => $request->type,
            'start_date' => $request->start_date,
            'end_date' => $request->end_date,
            'reason' => $request->reason,
            'status' => 'Pending',
        ]);

        return back()->with('success', 'Leave request submitted successfully.');
    }

    public function updateStatus(Request $request, LeaveRequest $leaveRequest)
    {
        $request->validate([
            'status' => 'required|in:Approved,Rejected',
        ]);

        $leaveRequest->update([
            'status' => $request->status,
            'approved_by' => Auth::id(),
        ]);

        return back()->with('success', 'Leave request status updated.');
    }
}
