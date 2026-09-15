<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;

use App\Models\OvertimeRequest;
use Inertia\Inertia;
use Illuminate\Support\Facades\Auth;

class OvertimeRequestController extends Controller
{
    public function index()
    {
        $user = Auth::user();
        
        // If HR/Admin/Manager, they can see all requests
        if ($user->hasRole(['Super Admin', 'HRD / Admin', 'General Manager'])) {
            $requests = OvertimeRequest::with(['employee.user', 'approver'])
                ->orderBy('created_at', 'desc')
                ->get();
            return Inertia::render('Overtime/Approvals', [
                'overtimeRequests' => $requests
            ]);
        }
        
        // Otherwise, Employee sees only their own
        $employee = $user->employee;
        $requests = OvertimeRequest::with(['approver'])
            ->where('employee_id', $employee?->id)
            ->orderBy('created_at', 'desc')
            ->get();
            
        return Inertia::render('Overtime/Index', [
            'overtimeRequests' => $requests
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

        $employee = Auth::user()->employee;
        
        if (!$employee) {
            return back()->with('error', 'Only employees can request overtime.');
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
