<?php

namespace App\Http\Controllers;

use App\Models\Payroll;
use App\Models\PayrollPeriod;
use App\Services\PayrollCalculationService;
use Carbon\Carbon;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;

class PayrollController extends Controller
{
    // HR View: List all payroll periods and their payrolls
    public function index(Request $request)
    {
        $periods = PayrollPeriod::orderBy('start_date', 'desc')->get();
        $selectedPeriodId = $request->query('period_id', $periods->first()?->id);

        $payrolls = [];
        if ($selectedPeriodId) {
            $payrolls = Payroll::with(['employee.user', 'employee.department'])
                ->where('payroll_period_id', $selectedPeriodId)
                ->get();
        }

        return Inertia::render('Payroll/Index', [
            'periods' => $periods,
            'selectedPeriodId' => $selectedPeriodId,
            'payrolls' => $payrolls,
        ]);
    }

    // HR Action: Generate payroll for a given month/year
    public function generate(Request $request, PayrollCalculationService $service)
    {
        $request->validate([
            'month' => 'required|integer|min:1|max:12',
            'year' => 'required|integer|min:2020|max:2099',
        ]);

        $month = str_pad($request->month, 2, '0', STR_PAD_LEFT);
        $startDate = Carbon::createFromFormat('Y-m', "{$request->year}-{$month}")->startOfMonth();
        $endDate = $startDate->copy()->endOfMonth();
        $name = $startDate->format('F Y');

        $period = PayrollPeriod::firstOrCreate(
            ['month' => $request->month, 'year' => $request->year],
            [
                'name' => $name,
                'start_date' => $startDate,
                'end_date' => $endDate,
                'status' => 'Draft',
            ]
        );

        $service->generateForPeriod($period);

        return redirect()->route('payroll.index', ['period_id' => $period->id])
            ->with('success', 'Payroll generated successfully.');
    }

    // Employee View: My Payslips
    public function myPayslips(Request $request)
    {
        $user = Auth::user();
        if (! $user->employee) {
            abort(403);
        }

        $payrolls = Payroll::with('period')
            ->where('employee_id', $user->employee->id)
            ->orderBy('created_at', 'desc')
            ->get();

        return Inertia::render('Payroll/MyPayslips', [
            'payrolls' => $payrolls,
        ]);
    }

    // Employee View: Single Payslip details
    public function showPayslip($id)
    {
        $user = Auth::user();
        $payroll = Payroll::with(['period', 'items', 'employee.user', 'employee.department'])
            ->findOrFail($id);

        // Security check: Only the owner or HR/Manager can view
        if ($payroll->employee_id !== $user->employee?->id && ! $user->hasAnyRole(['HRD / Admin', 'General Manager'])) {
            abort(403);
        }

        return Inertia::render('Payroll/Payslip', [
            'payroll' => $payroll,
        ]);
    }
}
