<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\OvertimeRequest;
use Inertia\Inertia;
use Illuminate\Support\Facades\Auth;

class OvertimeRequestController extends Controller
{
    public function index(Request $request)
    {
        $user = Auth::user();
        $isApprover = $user->hasAnyRole(['Super Admin', 'HRD / Admin', 'General Manager']);
        $employee = $user->employee ?? $user->ensureEmployeeProfile();

        $tab = $request->query('tab', $isApprover ? 'approvals' : 'my');

        // Personal overtime requests of authenticated user
        $myRequests = $employee
            ? OvertimeRequest::with(['approver:id,name'])
                ->where('employee_id', $employee->id)
                ->orderBy('created_at', 'desc')
                ->get()
            : collect([]);

        // All employee overtime requests for authorized approvers
        $allRequests = $isApprover
            ? OvertimeRequest::with([
                'employee.user:id,name,email',
                'employee.department:id,name',
                'approver:id,name',
            ])
                ->orderBy('created_at', 'desc')
                ->get()
            : collect([]);

        $pendingApprovalsCount = $isApprover
            ? OvertimeRequest::where('status', 'Pending')->count()
            : 0;

        return Inertia::render('Overtime/Index', [
            'overtimeRequests' => ($isApprover && $tab === 'approvals') ? $allRequests : $myRequests,
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
            'date' => 'required|date',
            'start_time' => 'required',
            'end_time' => 'required',
            'reason' => 'required|string',
        ]);

        $user = Auth::user();
        $employee = $user->employee ?? $user->ensureEmployeeProfile();
        
        if (!$employee) {
            return back()->with('error', 'Only employees with active profiles can request overtime.');
        }

        OvertimeRequest::create([
            'employee_id' => $employee->id,
            'date' => $request->date,
            'start_time' => $request->start_time,
            'end_time' => $request->end_time,
            'reason' => $request->reason,
            'status' => 'Pending',
        ]);

        return back()->with('success', 'Overtime request submitted successfully.');
    }

    public function updateStatus(Request $request, OvertimeRequest $overtimeRequest)
    {
        $request->validate([
            'status' => 'required|in:Approved,Rejected',
        ]);

        $overtimeRequest->update([
            'status' => $request->status,
            'approved_by' => Auth::id(),
        ]);

        return back()->with('success', 'Overtime request status updated.');
    }
}
