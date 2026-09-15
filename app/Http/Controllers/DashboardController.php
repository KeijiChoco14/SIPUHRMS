<?php

namespace App\Http\Controllers;

use App\Models\Announcement;
use App\Models\Attendance;
use App\Models\Department;
use App\Models\Employee;
use App\Models\LeaveRequest;
use App\Models\OvertimeRequest;
use App\Models\PerformanceScore;
use App\Models\Project;
use App\Models\Task;
use App\Models\TaskActivity;
use App\Models\WorkSchedule;
use Illuminate\Support\Carbon;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;

class DashboardController extends Controller
{
    public function index()
    {
        $user = Auth::user();
        $role = $user->getRoleNames()->first() ?? 'Staff / Employee';
        $today = Carbon::today();

        $latestAnnouncements = Announcement::with('creator')
            ->where(function ($q) use ($role) {
                $q->where('target_audience', 'All')
                    ->orWhere('target_audience', 'like', "%{$role}%");
            })
            ->orderBy('published_at', 'desc')
            ->limit(3)
            ->get();

        $data = [
            'role' => $role,
            'announcements' => $latestAnnouncements,
        ];

        if ($role === 'Staff / Employee') {
            $employeeId = $user->employee?->id;
            $latestScore = PerformanceScore::where('employee_id', $employeeId)
                ->orderBy('created_at', 'desc')
                ->first();

            $todaySchedule = WorkSchedule::with('shift')
                ->where('employee_id', $employeeId)
                ->where('date', $today->format('Y-m-d'))
                ->first();

            // Attendance summary for this month
            $monthStart = $today->copy()->startOfMonth();
            $attendanceThisMonth = Attendance::where('employee_id', $employeeId)
                ->whereBetween('date', [$monthStart, $today])
                ->get();

            $attendanceSummary = [
                'present' => $attendanceThisMonth->where('status', 'Present')->count(),
                'late' => $attendanceThisMonth->where('status', 'Late')->count(),
                'absent' => $attendanceThisMonth->where('status', 'Absent')->count(),
                'total_days' => $today->diffInWeekdays($monthStart) + 1,
            ];

            // Leave balance
            $leaveStats = [
                'pending' => LeaveRequest::where('employee_id', $employeeId)->where('status', 'Pending')->count(),
                'approved' => LeaveRequest::where('employee_id', $employeeId)->where('status', 'Approved')->whereYear('start_date', $today->year)->count(),
            ];

            // Recent task activities
            $recentActivities = TaskActivity::with(['task:id,title', 'employee.user:id,name'])
                ->where('employee_id', $employeeId)
                ->orderBy('created_at', 'desc')
                ->limit(5)
                ->get();

            $data['employeeData'] = [
                'todaySchedule' => $todaySchedule,
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
                'attendanceSummary' => $attendanceSummary,
                'leaveStats' => $leaveStats,
                'recentActivities' => $recentActivities,
            ];
        } elseif ($role === 'Supervisor' || $role === 'Head of Department') {
            // Team attendance today
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

            // Pending leave requests from team
            $pendingLeaves = LeaveRequest::whereIn('employee_id', $teamEmployeeIds)
                ->where('status', 'Pending')
                ->count();

            // Project progress
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
        } elseif ($role === 'HRD / Admin') {
            // Attendance today
            $totalEmployees = Employee::count();
            $attendanceToday = Attendance::where('date', $today->format('Y-m-d'))->get();

            $attendanceTodaySummary = [
                'total' => $totalEmployees,
                'present' => $attendanceToday->where('status', 'Present')->count(),
                'late' => $attendanceToday->where('status', 'Late')->count(),
                'absent' => $totalEmployees - $attendanceToday->whereIn('status', ['Present', 'Late'])->count(),
            ];

            // Pending approvals
            $pendingLeaves = LeaveRequest::where('status', 'Pending')->count();
            $pendingOvertime = OvertimeRequest::where('status', 'Pending')->count();

            // Recent hires
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
                'pendingLeaves' => $pendingLeaves,
                'pendingOvertime' => $pendingOvertime,
                'recentHires' => $recentHires,
            ];
        } elseif ($role === 'General Manager' || $role === 'Super Admin') {
            // Attendance rate this month
            $monthStart = $today->copy()->startOfMonth();
            $totalEmployees = Employee::count();
            $workDays = max($today->diffInWeekdays($monthStart) + 1, 1);
            $totalPossible = $totalEmployees * $workDays;
            $totalPresent = Attendance::whereBetween('date', [$monthStart, $today])
                ->whereIn('status', ['Present', 'Late'])
                ->count();
            $attendanceRate = $totalPossible > 0 ? round(($totalPresent / $totalPossible) * 100, 1) : 0;

            // Pending approvals
            $pendingLeaves = LeaveRequest::where('status', 'Pending')->count();
            $pendingOvertime = OvertimeRequest::where('status', 'Pending')->count();

            // Department performance
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
                'projectProgress' => Project::withCount(['tasks as total_tasks', 'tasks as completed_tasks' => function ($query) {
                    $query->where('status', 'Done');
                }])->get()->map(function ($project) {
                    $project->progress = $project->total_tasks > 0 ? round(($project->completed_tasks / $project->total_tasks) * 100) : 0;

                    return $project;
                }),
                'taskStatusDistribution' => Task::selectRaw('status, count(*) as count')->groupBy('status')->get(),
                'attendanceRate' => $attendanceRate,
                'totalEmployees' => $totalEmployees,
                'pendingLeaves' => $pendingLeaves,
                'pendingOvertime' => $pendingOvertime,
                'departmentPerformance' => $departmentPerformance,
            ];
        }

        return Inertia::render('Dashboard', $data);
    }
}
