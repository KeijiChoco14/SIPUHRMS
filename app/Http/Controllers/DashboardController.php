<?php

namespace App\Http\Controllers;

use App\Models\Announcement;
use App\Models\Attendance;
use App\Models\Department;
use App\Models\Employee;
use App\Models\ItAsset;
use App\Models\ItTicket;
use App\Models\LeaveRequest;
use App\Models\MasterKeyRequest;
use App\Models\OvertimeRequest;
use App\Models\Payroll;
use App\Models\PerformanceScore;
use App\Models\Project;
use App\Models\RoomBorrowingTransaction;
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
        $isHOD = $user->hasRole('Head of Department');
        $isHK = $user->employee?->department?->name === 'Housekeeping';
        $isSupervisor = $user->hasRole('Supervisor') || $isHOD;
        $isAdmin = $isSuperAdmin || $isHRD || $isGM;
        $canAccessHousekeeping = $isAdmin || $isHOD || $isHK;

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
        if ($canAccessHousekeeping && Schema::hasTable('master_key_requests')) {
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

        $openItTicketsCount = 0;
        $totalItAssetsCount = 0;
        if (Schema::hasTable('it_tickets')) {
            $isItStaff = $user->employee && $user->employee->department && strtolower($user->employee->department->name) === 'it';
            $itTicketsQuery = ItTicket::whereIn('status', ['Open', 'In Progress']);
            if (!$isAdmin && !$isItStaff) {
                $itTicketsQuery->where('reported_by_employee_id', $employeeId);
            }
            $openItTicketsCount = $itTicketsQuery->count();
            $totalItAssetsCount = ItAsset::count();
        }

        $pendingRoomReturnsCount = 0;
        $myActiveRoomBorrowingsCount = 0;
        if (Schema::hasTable('room_borrowing_transactions')) {
            $isSecurityUser = $user->hasRole('Security') || $isAdmin;
            if ($isSecurityUser) {
                $pendingRoomReturnsCount = RoomBorrowingTransaction::where('status', RoomBorrowingTransaction::STATUS_PENDING_RETURN)->count();
            }
            if ($employeeId) {
                $myActiveRoomBorrowingsCount = RoomBorrowingTransaction::where('borrower_employee_id', $employeeId)
                    ->whereIn('status', [
                        RoomBorrowingTransaction::STATUS_BORROWED,
                        RoomBorrowingTransaction::STATUS_PENDING_RETURN,
                    ])->count();
            }
        }

        $launcherStats = [
            'activeTasks' => $activeTasksCount,
            'masterKeyOnRequest' => $masterKeyOnRequestCount,
            'pendingLeaves' => $pendingLeavesCount,
            'pendingOvertime' => $pendingOvertimeCount,
            'totalEmployees' => $employeeTotalCount,
            'totalDepartments' => $departmentTotalCount,
            'openItTickets' => $openItTicketsCount,
            'totalItAssets' => $totalItAssetsCount,
            'pendingRoomReturns' => $pendingRoomReturnsCount,
            'myActiveRoomBorrowings' => $myActiveRoomBorrowingsCount,
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

        // Unified Personal Service Requests Aggregation (Read-only summary across modules)
        $myRecentServiceRequests = [];
        if ($employeeId) {
            // 1. My Room Borrowings
            if (Schema::hasTable('room_borrowing_transactions')) {
                $borrowings = RoomBorrowingTransaction::with('room')
                    ->where('borrower_employee_id', $employeeId)
                    ->whereIn('status', [RoomBorrowingTransaction::STATUS_BORROWED, RoomBorrowingTransaction::STATUS_PENDING_RETURN])
                    ->get()
                    ->map(fn($b) => [
                        'id' => 'rb-' . $b->id,
                        'module' => 'Room & Key',
                        'type' => 'Room Key Borrowing',
                        'title' => $b->room ? ($b->room->name . ' (' . $b->room->room_number . ')') : 'Room Key',
                        'reference' => $b->transaction_number,
                        'status' => $b->status === RoomBorrowingTransaction::STATUS_BORROWED ? 'Active Loan' : 'Pending Return',
                        'raw_status' => $b->status,
                        'status_color' => $b->status === RoomBorrowingTransaction::STATUS_BORROWED ? 'emerald' : 'amber',
                        'date' => $b->borrowed_at ? $b->borrowed_at->format('d M Y, H:i') : null,
                        'link' => route('room-borrowing.index', ['tab' => 'my-borrowings']),
                    ]);
                $myRecentServiceRequests = array_merge($myRecentServiceRequests, $borrowings->toArray());
            }

            // 2. My IT Tickets
            if (Schema::hasTable('it_tickets')) {
                $tickets = ItTicket::where('reported_by_employee_id', $employeeId)
                    ->whereIn('status', ['Open', 'In Progress'])
                    ->latest()
                    ->limit(5)
                    ->get()
                    ->map(fn($t) => [
                        'id' => 'it-' . $t->id,
                        'module' => 'IT Helpdesk',
                        'type' => 'IT Support Ticket',
                        'title' => $t->title,
                        'reference' => $t->ticket_number,
                        'status' => $t->status,
                        'raw_status' => $t->status,
                        'status_color' => $t->status === 'Open' ? 'rose' : 'amber',
                        'date' => $t->created_at ? $t->created_at->format('d M Y, H:i') : null,
                        'link' => route('it.tickets.show', $t->id),
                    ]);
                $myRecentServiceRequests = array_merge($myRecentServiceRequests, $tickets->toArray());
            }

            // 3. My Power Pro Requests
            if (Schema::hasTable('power_pro_requests')) {
                $powerPros = \App\Models\PowerProRequest::where(function($q) use ($user, $employeeId) {
                        $q->where('requested_by_user_id', $user->id);
                        if ($employeeId) {
                            $q->orWhere('employee_id', $employeeId);
                        }
                    })
                    ->whereIn('status', ['On Request', 'Approved'])
                    ->latest()
                    ->limit(5)
                    ->get()
                    ->map(fn($p) => [
                        'id' => 'pp-' . $p->id,
                        'module' => 'IT Operations',
                        'type' => 'PowerPro User ID',
                        'title' => 'PMS Access Request (' . $p->access_level . ')',
                        'reference' => $p->request_number,
                        'status' => $p->status,
                        'raw_status' => $p->status,
                        'status_color' => $p->status === 'On Request' ? 'amber' : 'blue',
                        'date' => $p->created_at ? $p->created_at->format('d M Y, H:i') : null,
                        'link' => route('power-pro.index'),
                    ]);
                $myRecentServiceRequests = array_merge($myRecentServiceRequests, $powerPros->toArray());
            }

            // 4. My Master Key Requests
            if ($canAccessHousekeeping && Schema::hasTable('master_key_requests')) {
                $keys = MasterKeyRequest::where('employee_id', $employeeId)
                    ->where('status', 'On Request')
                    ->latest()
                    ->limit(5)
                    ->get()
                    ->map(fn($k) => [
                        'id' => 'mk-' . $k->id,
                        'module' => 'Housekeeping',
                        'type' => 'Master Key Request',
                        'title' => $k->key_type . ' (' . $k->key_number . ')',
                        'reference' => $k->request_number,
                        'status' => $k->status,
                        'raw_status' => $k->status,
                        'status_color' => 'amber',
                        'date' => $k->created_at ? $k->created_at->format('d M Y, H:i') : null,
                        'link' => route('master-keys.index'),
                    ]);
                $myRecentServiceRequests = array_merge($myRecentServiceRequests, $keys->toArray());
            }

            // 5. My Leave Requests
            $leaves = LeaveRequest::where('employee_id', $employeeId)
                ->where('status', 'Pending')
                ->latest()
                ->limit(3)
                ->get()
                ->map(fn($l) => [
                    'id' => 'lv-' . $l->id,
                    'module' => 'Human Resources',
                    'type' => 'Leave Request (' . $l->type . ')',
                    'title' => $l->reason,
                    'reference' => 'LV-' . $l->id,
                    'status' => $l->status,
                    'raw_status' => $l->status,
                    'status_color' => 'amber',
                    'date' => $l->created_at ? $l->created_at->format('d M Y, H:i') : null,
                    'link' => route('leave.index'),
                ]);
            $myRecentServiceRequests = array_merge($myRecentServiceRequests, $leaves->toArray());

            // 6. My Overtime Requests
            $overtimes = OvertimeRequest::where('employee_id', $employeeId)
                ->where('status', 'Pending')
                ->latest()
                ->limit(3)
                ->get()
                ->map(fn($o) => [
                    'id' => 'ot-' . $o->id,
                    'module' => 'Human Resources',
                    'type' => 'Overtime (SPKL)',
                    'title' => $o->reason,
                    'reference' => 'OT-' . $o->id,
                    'status' => $o->status,
                    'raw_status' => $o->status,
                    'status_color' => 'amber',
                    'date' => $o->created_at ? $o->created_at->format('d M Y, H:i') : null,
                    'link' => route('overtime.index'),
                ]);
            $myRecentServiceRequests = array_merge($myRecentServiceRequests, $overtimes->toArray());
        }

        $data['myServiceRequests'] = $myRecentServiceRequests;
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
            'myServiceRequests' => $myRecentServiceRequests,
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

        // 5. Employee Personal HR Data (for Employee Self-Service / Non-admin HR View)
        $myAttendanceToday = null;
        $myMonthlyAttendance = [
            'present' => 0,
            'late' => 0,
            'absent' => 0,
            'total' => 0,
        ];
        $latestPayslip = null;
        $myRecentLeaves = [];
        $myRecentOvertime = [];

        if ($employeeId) {
            $myAttendanceToday = Attendance::where('employee_id', $employeeId)
                ->where('date', $today->format('Y-m-d'))
                ->first();

            $monthAttendances = Attendance::where('employee_id', $employeeId)
                ->where('date', 'like', $today->format('Y-m') . '%')
                ->get();

            $myMonthlyAttendance = [
                'present' => $monthAttendances->where('status', 'Present')->count(),
                'late' => $monthAttendances->where('status', 'Late')->count(),
                'absent' => $monthAttendances->where('status', 'Absent')->count(),
                'total' => $monthAttendances->count(),
            ];

            if (Schema::hasTable('payrolls')) {
                $latestPayslip = Payroll::with('period')
                    ->where('employee_id', $employeeId)
                    ->latest()
                    ->first();
            }

            $myRecentLeaves = LeaveRequest::where('employee_id', $employeeId)
                ->orderBy('created_at', 'desc')
                ->limit(3)
                ->get();

            $myRecentOvertime = OvertimeRequest::where('employee_id', $employeeId)
                ->orderBy('created_at', 'desc')
                ->limit(3)
                ->get();
        }

        $data['employeeHrData'] = [
            'attendanceToday' => $myAttendanceToday,
            'monthlyAttendance' => $myMonthlyAttendance,
            'leaveStats' => $leaveStats,
            'recentLeaves' => $myRecentLeaves,
            'recentOvertime' => $myRecentOvertime,
            'pendingOvertime' => $pendingOvertimeCount,
            'latestPayslip' => $latestPayslip,
        ];

        return Inertia::render('Dashboard', $data);
    }
}
