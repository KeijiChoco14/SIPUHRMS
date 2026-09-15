<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\LeaveRequest;
use Inertia\Inertia;
use Illuminate\Support\Facades\Auth;

class LeaveRequestController extends Controller
{
    public function index()
    {
        $user = Auth::user();
        
        // If HR/Admin/Manager, they can see all requests or approvals
        if ($user->hasRole(['Super Admin', 'HRD / Admin', 'General Manager'])) {
            $requests = LeaveRequest::with(['employee.user', 'approver'])
                ->orderBy('created_at', 'desc')
                ->get();
            return Inertia::render('Leave/Approvals', [
                'leaveRequests' => $requests
            ]);
        }
        
        // Otherwise, Employee sees only their own
        $employee = $user->employee;
        $requests = LeaveRequest::with(['approver'])
            ->where('employee_id', $employee?->id)
            ->orderBy('created_at', 'desc')
            ->get();
            
        return Inertia::render('Leave/Index', [
            'leaveRequests' => $requests
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

        $employee = Auth::user()->employee;
        
        if (!$employee) {
            return back()->with('error', 'Only employees can request leave.');
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
