<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;

use App\Models\WorkSchedule;
use App\Models\Shift;
use App\Models\Employee;
use Inertia\Inertia;
use Illuminate\Support\Carbon;

class WorkScheduleController extends Controller
{
    public function index(Request $request)
    {
        // Default to current week
        $startOfWeek = $request->start_date ? Carbon::parse($request->start_date)->startOfWeek() : Carbon::now()->startOfWeek();
        $endOfWeek = $startOfWeek->copy()->endOfWeek();
        
        $schedules = WorkSchedule::with(['employee.user', 'shift'])
            ->whereBetween('date', [$startOfWeek->format('Y-m-d'), $endOfWeek->format('Y-m-d')])
            ->get();
            
        $employees = Employee::with('user')->where('employment_status', 'Active')->get();
        $shifts = Shift::all();

        return Inertia::render('Schedule/Index', [
            'schedules' => $schedules,
            'employees' => $employees,
            'shifts' => $shifts,
            'startDate' => $startOfWeek->format('Y-m-d'),
            'endDate' => $endOfWeek->format('Y-m-d'),
        ]);
    }

    public function store(Request $request)
    {
        $request->validate([
            'employee_id' => 'required|exists:employees,id',
            'shift_id' => 'required|exists:shifts,id',
            'date' => 'required|date',
        ]);

        // Upsert the schedule (update if exists for that employee & date, else create)
        WorkSchedule::updateOrCreate(
            [
                'employee_id' => $request->employee_id,
                'date' => $request->date,
            ],
            [
                'shift_id' => $request->shift_id,
            ]
        );

        return back()->with('success', 'Schedule assigned successfully.');
    }

    public function destroy(WorkSchedule $schedule)
    {
        $schedule->delete();
        return back()->with('success', 'Schedule removed successfully.');
    }
}
