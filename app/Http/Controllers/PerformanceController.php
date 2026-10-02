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

        // If no periods exist, create current month as default
        if ($periods->isEmpty()) {
            $now = now();
            $defaultPeriod = PerformancePeriod::create([
                'name' => $now->translatedFormat('F Y'),
                'start_date' => $now->copy()->startOfMonth()->toDateString(),
                'end_date' => $now->copy()->endOfMonth()->toDateString(),
                'type' => 'Monthly',
            ]);
            $periods = collect([$defaultPeriod]);
        }

        $requestedPeriodId = $request->query('period_id');
        $selectedPeriod = null;
        if ($requestedPeriodId) {
            $selectedPeriod = $periods->firstWhere('id', (int) $requestedPeriodId);
        }
        if (! $selectedPeriod) {
            $selectedPeriod = $periods->first();
        }
        $selectedPeriodId = $selectedPeriod ? $selectedPeriod->id : null;

        $scores = [];
        if ($selectedPeriodId) {
            $scores = PerformanceScore::with(['employee.user', 'employee.department'])
                ->where('performance_period_id', $selectedPeriodId)
                ->get();
        }

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

        $tasks = $employee->tasks()
            ->select('tasks.*')
            ->where(function ($q) use ($period) {
                $q->whereBetween('tasks.deadline', [$period->start_date, $period->end_date])
                    ->orWhereBetween('tasks.updated_at', [$period->start_date, $period->end_date])
                    ->orWhereBetween('tasks.created_at', [$period->start_date, $period->end_date]);
            })
            ->with('project')
            ->orderBy('tasks.created_at', 'desc')
            ->get();

        return Inertia::render('Performance/Show', [
            'employee' => $employee,
            'period' => $period,
            'score' => $score,
            'assessment' => $assessment,
            'tasks' => $tasks,
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

    public function storePeriod(Request $request)
    {
        // Support quick monthly generation
        if ($request->has('month') && $request->has('year') && ! $request->has('start_date')) {
            $request->validate([
                'month' => 'required|integer|min:1|max:12',
                'year' => 'required|integer|min:2020|max:2099',
            ]);

            $month = str_pad($request->month, 2, '0', STR_PAD_LEFT);
            $startDate = \Carbon\Carbon::createFromFormat('Y-m', "{$request->year}-{$month}")->startOfMonth();
            $endDate = $startDate->copy()->endOfMonth();
            $name = $startDate->translatedFormat('F Y');

            $period = PerformancePeriod::firstOrCreate(
                [
                    'name' => $name,
                    'start_date' => $startDate->toDateString(),
                    'end_date' => $endDate->toDateString(),
                ],
                [
                    'type' => 'Monthly',
                ]
            );

            return redirect()->route('performance.index', ['period_id' => $period->id])
                ->with('success', "Periode evaluasi '{$period->name}' berhasil ditambahkan.");
        }

        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'start_date' => 'required|date',
            'end_date' => 'required|date|after_or_equal:start_date',
            'type' => 'required|in:Monthly,Quarterly,Yearly',
        ]);

        $period = PerformancePeriod::create($validated);

        return redirect()->route('performance.index', ['period_id' => $period->id])
            ->with('success', "Periode evaluasi '{$period->name}' berhasil dibuat.");
    }

    public function destroyPeriod($id)
    {
        $period = PerformancePeriod::findOrFail($id);
        $name = $period->name;
        $period->scores()->delete();
        $period->assessments()->delete();
        $period->delete();

        return redirect()->route('performance.index')
            ->with('success', "Periode '{$name}' berhasil dihapus.");
    }

    public function calculate(Request $request)
    {
        $validated = $request->validate([
            'period_id' => 'required|exists:performance_periods,id',
        ]);

        $period = PerformancePeriod::findOrFail($validated['period_id']);
        $employees = Employee::where('employment_status', 'Active')->get();
        $service = new PerformanceCalculationService;

        foreach ($employees as $employee) {
            $service->calculateForEmployee($employee, $period);
        }

        return redirect()->route('performance.index', ['period_id' => $period->id])
            ->with('success', "Skor EPI untuk periode '{$period->name}' berhasil dihitung.");
    }
}
