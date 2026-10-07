<?php

namespace App\Http\Controllers;

use App\Models\Announcement;
use App\Models\Attendance;
use App\Models\Department;
use App\Models\Employee;
use App\Models\LeaveRequest;
use App\Models\MasterKeyRequest;
use App\Models\OvertimeRequest;
use App\Models\PerformanceScore;
use App\Models\Project;
use App\Models\Task;
use App\Models\TaskActivity;
use App\Models\WorkSchedule;
use Illuminate\Http\Request;
use Illuminate\Support\Carbon;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Schema;
use Inertia\Inertia;

class DashboardController extends Controller
{
    public function index(Request $request)
    {
        $user = Auth::user();
        $role = $user->getRoleNames()->first() ?? 'Staff / Employee';
        $today = Carbon::today();
        $view = $request->input('view', 'launcher');

        $latestAnnouncements = Announcement::with('creator')
            ->where(function ($q) use ($role) {
                $q->where('target_audience', 'All')
                    ->orWhere('target_audience', 'like', "%{$role}%");
            })
            ->orderBy('published_at', 'desc')
            ->limit(4)
            ->get();

        $employeeId = $user->employee?->id;
        $isSuperAdmin = $user->hasRole('Super Admin');
        $isHRD = $user->hasRole('HRD / Admin');
        $isGM = $user->hasRole('General Manager');
        $isSupervisor = $user->hasRole('Supervisor') || $user->hasRole('Head of Department');
        $isAdmin = $isSuperAdmin || $isHRD || $isGM;

        // Access validation: HR module is restricted to HRD, GM, and Super Admin
        if ($view === 'hr' && !$isAdmin) {
            abort(403, 'Access Denied: The Human Resources (HR) module can only be accessed by HRD, General Manager, or Administrator.');
        }

        // Dynamic badge counters
        $activeTasksCount = 0;
        if ($employeeId && !$isAdmin) {
            $activeTasksCount = Task::whereHas('assignees', fn ($q) => $q->where('employee_id', $employeeId))
                ->where('status', '!=', 'Done')
                ->count();
        } else {
            $activeTasksCount = Task::where('status', '!=', 'Done')->count();
        }

        $masterKeyOnRequestCount = 0;
        if (Schema::hasTable('master_key_requests')) {
            $masterKeyQuery = MasterKeyRequest::where('status', 'On Request');
            if (!$isAdmin && !$isSupervisor) {
                $masterKeyQuery->where('employee_id', $employeeId);
            }
            $masterKeyOnRequestCount = $masterKeyQuery->count();
        }

        $pendingLeavesCount = 0;
        $pendingOvertimeCount = 0;
        if ($isAdmin || $isSupervisor) {
            $pendingLeavesCount = LeaveRequest::where('status', 'Pending')->count();
            $pendingOvertimeCount = OvertimeRequest::where('status', 'Pending')->count();
        } else {
            $pendingLeavesCount = LeaveRequest::where('employee_id', $employeeId)->where('status', 'Pending')->count();
            $pendingOvertimeCount = OvertimeRequest::where('employee_id', $employeeId)->where('status', 'Pending')->count();
        }

        $employeeTotalCount = Employee::count();
        $departmentTotalCount = Department::count();

        $launcherStats = [
            'activeTasks' => $activeTasksCount,
            'masterKeyOnRequest' => $masterKeyOnRequestCount,
            'pendingLeaves' => $pendingLeavesCount,
            'pendingOvertime' => $pendingOvertimeCount,
            'totalEmployees' => $employeeTotalCount,
            'totalDepartments' => $departmentTotalCount,
        ];

        $data = [
            'view' => $view,
            'role' => $role,
            'launcherStats' => $launcherStats,
            'announcements' => $latestAnnouncements,
        ];

        // 1. Employee Data
        $latestScore = PerformanceScore::where('employee_id', $employeeId)
            ->orderBy('created_at', 'desc')
            ->first();

        $leaveStats = [
            'pending' => LeaveRequest::where('employee_id', $employeeId)->where('status', 'Pending')->count(),
            'approved' => LeaveRequest::where('employee_id', $employeeId)->where('status', 'Approved')->whereYear('start_date', $today->year)->count(),
        ];

        $recentActivities = TaskActivity::with(['task:id,title', 'employee.user:id,name'])
            ->where('employee_id', $employeeId)
            ->orderBy('created_at', 'desc')
            ->limit(5)
            ->get();

        $data['employeeData'] = [
            'tasksSummary' => [
                'todo' => Task::whereHas('assignees', fn ($q) => $q->where('employee_id', $employeeId))->where('status', 'To Do')->count(),
                'in_progress' => Task::whereHas('assignees', fn ($q) => $q->where('employee_id', $employeeId))->where('status', 'In Progress')->count(),
                'review' => Task::whereHas('assignees', fn ($q) => $q->where('employee_id', $employeeId))->where('status', 'Review')->count(),
                'done' => Task::whereHas('assignees', fn ($q) => $q->where('employee_id', $employeeId))->where('status', 'Done')->count(),
                'overdue' => Task::whereHas('assignees', fn ($q) => $q->where('employee_id', $employeeId))->where('deadline', '<', now())->where('status', '!=', 'Done')->count(),
            ],
            'upcomingTasks' => Task::whereHas('assignees', fn ($q) => $q->where('employee_id', $employeeId))
                ->where('status', '!=', 'Done')
                ->whereNotNull('deadline')
                ->orderBy('deadline', 'asc')
                ->limit(5)
                ->get(),
            'latestPerformanceScore' => $latestScore,
            'leaveStats' => $leaveStats,
            'recentActivities' => $recentActivities,
        ];

        // 2. Supervisor Data
        $teamEmployeeIds = Employee::where('supervisor_id', $user->employee?->id)->pluck('id');
        $teamAttendanceToday = Attendance::whereIn('employee_id', $teamEmployeeIds)
            ->where('date', $today->format('Y-m-d'))
            ->get();

        $teamAttendanceSummary = [
            'total' => $teamEmployeeIds->count(),
            'present' => $teamAttendanceToday->whereIn('status', ['Present', 'Late'])->count(),
            'late' => $teamAttendanceToday->where('status', 'Late')->count(),
            'absent' => $teamEmployeeIds->count() - $teamAttendanceToday->whereIn('status', ['Present', 'Late'])->count(),
        ];

        $pendingLeaves = LeaveRequest::whereIn('employee_id', $teamEmployeeIds)
            ->where('status', 'Pending')
            ->count();

        $projectProgress = Project::where('status', 'Active')
            ->withCount(['tasks as total_tasks', 'tasks as completed_tasks' => function ($query) {
                $query->where('status', 'Done');
            }])->get()->map(function ($project) {
                $project->progress = $project->total_tasks > 0 ? round(($project->completed_tasks / $project->total_tasks) * 100) : 0;
                return $project;
            });

        $data['supervisorData'] = [
            'activeProjects' => Project::where('status', 'Active')->count(),
            'totalTasks' => Task::count(),
            'completedTasks' => Task::where('status', 'Done')->count(),
            'overdueTasks' => Task::where('deadline', '<', now())->where('status', '!=', 'Done')->count(),
            'pendingReview' => Task::where('status', 'Review')->count(),
            'teamWorkload' => Employee::with('user')->withCount(['tasks as active_tasks_count' => function ($query) {
                $query->where('status', '!=', 'Done');
            }])->get(),
            'teamAttendanceSummary' => $teamAttendanceSummary,
            'pendingLeaves' => $pendingLeaves,
            'projectProgress' => $projectProgress,
        ];

        // 3. HR Data
        $totalEmployees = Employee::count();
        $attendanceToday = Attendance::where('date', $today->format('Y-m-d'))->get();

        $attendanceTodaySummary = [
            'total' => $totalEmployees,
            'present' => $attendanceToday->where('status', 'Present')->count(),
            'late' => $attendanceToday->where('status', 'Late')->count(),
            'absent' => $totalEmployees - $attendanceToday->whereIn('status', ['Present', 'Late'])->count(),
        ];

        $recentHires = Employee::with(['user:id,name,email', 'department:id,name', 'position:id,name'])
            ->orderBy('join_date', 'desc')
            ->limit(5)
            ->get();

        $data['hrData'] = [
            'employeeCount' => $totalEmployees,
            'departmentCount' => Department::count(),
            'employeeWorkload' => Employee::with('user')->withCount(['tasks as active_tasks_count' => function ($query) {
                $query->where('status', '!=', 'Done');
            }])->orderByDesc('active_tasks_count')->limit(5)->get(),
            'departmentDistribution' => Department::withCount('employees')->get(),
            'attendanceTodaySummary' => $attendanceTodaySummary,
            'pendingLeaves' => LeaveRequest::where('status', 'Pending')->count(),
            'pendingOvertime' => OvertimeRequest::where('status', 'Pending')->count(),
            'recentHires' => $recentHires,
        ];

        // 4. Manager Data
        $monthStart = $today->copy()->startOfMonth();
        $workDays = max($today->diffInWeekdays($monthStart) + 1, 1);
        $totalPossible = $totalEmployees * $workDays;
        $totalPresent = Attendance::whereBetween('date', [$monthStart, $today])
            ->whereIn('status', ['Present', 'Late'])
            ->count();
        $attendanceRate = $totalPossible > 0 ? round(($totalPresent / $totalPossible) * 100, 1) : 0;

        $departmentPerformance = Department::withCount('employees')
            ->with(['employees' => function ($q) {
                $q->withCount([
                    'tasks as active_tasks_count' => function ($query) {
                        $query->where('status', '!=', 'Done');
                    },
                    'tasks as completed_tasks_count' => function ($query) {
                        $query->where('status', 'Done');
                    },
                ]);
            }])
            ->get()
            ->map(function ($dept) {
                $dept->total_active_tasks = $dept->employees->sum('active_tasks_count');
                $dept->total_completed_tasks = $dept->employees->sum('completed_tasks_count');
                unset($dept->employees);
                return $dept;
            });

        $data['managerData'] = [
            'activeProjects' => Project::where('status', 'Active')->count(),
            'activeTasks' => Task::where('status', '!=', 'Done')->count(),
            'completedThisMonth' => Task::where('status', 'Done')->whereMonth('updated_at', now()->month)->count(),
            'overdueTasks' => Task::where('deadline', '<', now())->where('status', '!=', 'Done')->count(),
            'projectProgress' => $projectProgress,
            'taskStatusDistribution' => Task::selectRaw('status, count(*) as count')->groupBy('status')->get(),
            'attendanceRate' => $attendanceRate,
            'totalEmployees' => $totalEmployees,
            'pendingLeaves' => LeaveRequest::where('status', 'Pending')->count(),
            'pendingOvertime' => OvertimeRequest::where('status', 'Pending')->count(),
            'departmentPerformance' => $departmentPerformance,
        ];

        return Inertia::render('Dashboard', $data);
    }
}
