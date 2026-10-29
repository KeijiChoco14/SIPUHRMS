<?php

namespace App\Http\Controllers;

use App\Models\Department;
use App\Models\Employee;
use App\Models\Shift;
use App\Models\WorkSchedule;
use Illuminate\Http\Request;
use Illuminate\Support\Carbon;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;

class WorkScheduleController extends Controller
{
    public function index(Request $request)
    {
        // Default to current week (Monday to Sunday)
        $startOfWeek = $request->start_date 
            ? Carbon::parse($request->start_date)->startOfWeek() 
            : Carbon::now('Asia/Jakarta')->startOfWeek();
        $endOfWeek = $startOfWeek->copy()->endOfWeek();
        
        $deptId = $request->query('department_id');
        $user = Auth::user();
        $isHOD = $user->hasRole('Head of Department');
        $isSupervisor = $user->hasRole('Supervisor');

        // If user is HOD/Supervisor and department not explicitly chosen, default to their department
        if (!$deptId && ($isHOD || $isSupervisor) && $user->employee?->department_id) {
            $deptId = (string) $user->employee->department_id;
        }

        $employeesQuery = Employee::with([
            'user:id,name,email',
            'department:id,name',
            'position:id,name',
        ])
            ->where('employment_status', 'Active');

        if ($deptId) {
            $employeesQuery->where('department_id', $deptId);
        }

        $employees = $employeesQuery->orderBy('department_id')->orderBy('id')->get(['id', 'user_id', 'department_id', 'position_id', 'employee_number']);

        $employeeIds = $employees->pluck('id');

        $schedules = WorkSchedule::with([
            'employee.user:id,name',
            'shift:id,name,code,start_time,end_time,color,is_overnight',
        ])
            ->whereBetween('date', [$startOfWeek->format('Y-m-d'), $endOfWeek->format('Y-m-d')])
            ->whereIn('employee_id', $employeeIds)
            ->get();
            
        $departments = Department::getCachedList();
        $shifts = Shift::getCachedActiveList();

        return Inertia::render('Schedule/Index', [
            'schedules' => $schedules,
            'employees' => $employees,
            'shifts' => $shifts,
            'departments' => $departments,
            'selectedDepartmentId' => $deptId ? (int) $deptId : null,
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

    public function bulkStore(Request $request)
    {
        $validated = $request->validate([
            'employee_ids' => 'required|array|min:1',
            'employee_ids.*' => 'exists:employees,id',
            'shift_id' => 'required|exists:shifts,id',
            'dates' => 'required|array|min:1',
            'dates.*' => 'date',
            'overwrite' => 'boolean',
        ]);

        $employeeIds = $validated['employee_ids'];
        $shiftId = $validated['shift_id'];
        $dates = $validated['dates'];
        $overwrite = $request->boolean('overwrite', true);

        $assignedCount = 0;

        DB::transaction(function () use ($employeeIds, $shiftId, $dates, $overwrite, &$assignedCount) {
            foreach ($employeeIds as $empId) {
                foreach ($dates as $date) {
                    if ($overwrite) {
                        WorkSchedule::updateOrCreate(
                            ['employee_id' => $empId, 'date' => $date],
                            ['shift_id' => $shiftId]
                        );
                        $assignedCount++;
                    } else {
                        $created = WorkSchedule::firstOrCreate(
                            ['employee_id' => $empId, 'date' => $date],
                            ['shift_id' => $shiftId]
                        );
                        if ($created->wasRecentlyCreated) {
                            $assignedCount++;
                        }
                    }
                }
            }
        });

        return back()->with('success', "Batch scheduling completed: {$assignedCount} shift assignment(s) saved.");
    }

    public function copyPreviousWeek(Request $request)
    {
        $validated = $request->validate([
            'target_start_date' => 'required|date',
            'department_id' => 'nullable|exists:departments,id',
            'overwrite' => 'boolean',
        ]);

        $targetStart = Carbon::parse($validated['target_start_date'])->startOfWeek();
        $prevStart = $targetStart->copy()->subDays(7)->format('Y-m-d');
        $prevEnd = $targetStart->copy()->subDays(1)->format('Y-m-d');
        $overwrite = $request->boolean('overwrite', false);

        $query = WorkSchedule::whereBetween('date', [$prevStart, $prevEnd]);

        if (!empty($validated['department_id'])) {
            $query->whereHas('employee', fn($q) => $q->where('department_id', $validated['department_id']));
        }

        $prevSchedules = $query->get();

        if ($prevSchedules->isEmpty()) {
            return back()->withErrors(['message' => 'No schedules found in the previous week (' . $prevStart . ' to ' . $prevEnd . ') to copy.']);
        }

        $copiedCount = 0;

        DB::transaction(function () use ($prevSchedules, $overwrite, &$copiedCount) {
            foreach ($prevSchedules as $sched) {
                $targetDate = Carbon::parse($sched->date)->addDays(7)->format('Y-m-d');

                if ($overwrite) {
                    WorkSchedule::updateOrCreate(
                        ['employee_id' => $sched->employee_id, 'date' => $targetDate],
                        ['shift_id' => $sched->shift_id]
                    );
                    $copiedCount++;
                } else {
                    $created = WorkSchedule::firstOrCreate(
                        ['employee_id' => $sched->employee_id, 'date' => $targetDate],
                        ['shift_id' => $sched->shift_id]
                    );
                    if ($created->wasRecentlyCreated) {
                        $copiedCount++;
                    }
                }
            }
        });

        return back()->with('success', "Copied {$copiedCount} shift schedule(s) from previous week ({$prevStart} - {$prevEnd}) successfully.");
    }

    public function clearWeek(Request $request)
    {
        $validated = $request->validate([
            'start_date' => 'required|date',
            'end_date' => 'required|date',
            'employee_id' => 'nullable|exists:employees,id',
            'department_id' => 'nullable|exists:departments,id',
        ]);

        $query = WorkSchedule::whereBetween('date', [$validated['start_date'], $validated['end_date']]);

        if (!empty($validated['employee_id'])) {
            $query->where('employee_id', $validated['employee_id']);
        } elseif (!empty($validated['department_id'])) {
            $query->whereHas('employee', fn($q) => $q->where('department_id', $validated['department_id']));
        }

        $deletedCount = $query->delete();

        return back()->with('success', "Cleared {$deletedCount} schedule assignment(s).");
    }

    public function destroy(WorkSchedule $schedule)
    {
        $schedule->delete();
        return back()->with('success', 'Schedule removed successfully.');
    }
}
