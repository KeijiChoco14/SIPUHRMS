<?php

namespace App\Http\Controllers;

use App\Models\Employee;
use App\Models\PerformancePeriod;
use App\Models\PerformanceScore;
use App\Models\SupervisorAssessment;
use App\Services\PerformanceCalculationService;
use Illuminate\Http\Request;
use Inertia\Inertia;

class PerformanceController extends Controller
{
    public function index(Request $request)
    {
        $periods = PerformancePeriod::orderBy('start_date', 'desc')->get();
        $selectedPeriodId = $request->query('period_id', $periods->first()?->id);

        $scores = PerformanceScore::with(['employee.user', 'employee.department'])
            ->where('performance_period_id', $selectedPeriodId)
            ->get();

        return Inertia::render('Performance/Index', [
            'periods' => $periods,
            'selectedPeriodId' => $selectedPeriodId,
            'scores' => $scores,
        ]);
    }

    public function show($employee_id, $period_id)
    {
        $employee = Employee::with(['user', 'department', 'position'])->findOrFail($employee_id);

        $user = auth()->user();
        $isOwner = $user->employee && $user->employee->id === $employee->id;
        $isHR = $user->hasAnyRole(['HRD / Admin', 'General Manager']);
        $isSupervisor = $user->employee && $employee->supervisor_id === $user->employee->id;

        if (! $isOwner && ! $isHR && ! $isSupervisor) {
            abort(403, 'Unauthorized access to this performance record.');
        }

        $period = PerformancePeriod::findOrFail($period_id);
        $score = PerformanceScore::where('employee_id', $employee_id)
            ->where('performance_period_id', $period_id)
            ->first();

        $assessment = SupervisorAssessment::where('employee_id', $employee_id)
            ->where('performance_period_id', $period_id)
            ->with('supervisor.user')
            ->first();

        return Inertia::render('Performance/Show', [
            'employee' => $employee,
            'period' => $period,
            'score' => $score,
            'assessment' => $assessment,
        ]);
    }

    public function assess($employee_id, $period_id)
    {
        $employee = Employee::with(['user', 'department'])->findOrFail($employee_id);
        $user = auth()->user();

        $isHR = $user->hasAnyRole(['HRD / Admin', 'General Manager']);
        $isSupervisor = $user->employee && $employee->supervisor_id === $user->employee->id;

        if (! $isHR && ! $isSupervisor) {
            abort(403, 'Only supervisors or HR can assess this employee.');
        }

        $period = PerformancePeriod::findOrFail($period_id);
        $assessment = SupervisorAssessment::where('employee_id', $employee_id)
            ->where('performance_period_id', $period_id)
            ->first();

        return Inertia::render('Performance/Assess', [
            'employee' => $employee,
            'period' => $period,
            'assessment' => $assessment,
        ]);
    }

    public function storeAssessment(Request $request, $employee_id, $period_id)
    {
        $validated = $request->validate([
            'work_quality' => 'required|integer|min:1|max:5',
            'accuracy' => 'required|integer|min:1|max:5',
            'responsibility' => 'required|integer|min:1|max:5',
            'communication' => 'required|integer|min:1|max:5',
            'notes' => 'nullable|string',
        ]);

        $employee = Employee::findOrFail($employee_id);
        $user = auth()->user();

        $isHR = $user->hasAnyRole(['HRD / Admin', 'General Manager']);
        $isSupervisor = $user->employee && $employee->supervisor_id === $user->employee->id;

        if (! $isHR && ! $isSupervisor) {
            abort(403, 'Only supervisors or HR can assess this employee.');
        }

        $supervisor = $user->employee;

        if (! $supervisor && ! $isHR) {
            abort(403, 'User is not an employee.');
        }

        SupervisorAssessment::updateOrCreate(
            ['employee_id' => $employee->id, 'performance_period_id' => $period_id],
            [
                'supervisor_id' => $supervisor ? $supervisor->id : null, // allow null if HR did it
                'work_quality' => $validated['work_quality'],
                'accuracy' => $validated['accuracy'],
                'responsibility' => $validated['responsibility'],
                'communication' => $validated['communication'],
                'notes' => $validated['notes'],
            ]
        );

        // Auto-calculate after assessment is submitted
        $service = new PerformanceCalculationService;
        $service->calculateForEmployee($employee, PerformancePeriod::findOrFail($period_id));

        return redirect()->route('performance.show', [$employee->id, $period_id])
            ->with('success', 'Assessment submitted successfully.');
    }

    public function calculate(Request $request)
    {
        $validated = $request->validate([
            'period_id' => 'required|exists:performance_periods,id',
        ]);

        $period = PerformancePeriod::find($validated['period_id']);
        $employees = Employee::where('employment_status', 'Active')->get();
        $service = new PerformanceCalculationService;

        foreach ($employees as $employee) {
            $service->calculateForEmployee($employee, $period);
        }

        return back()->with('success', 'Performance scores calculated successfully.');
    }
}
