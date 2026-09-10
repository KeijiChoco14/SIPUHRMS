<?php

namespace App\Http\Controllers;

use App\Models\Announcement;
use App\Models\Department;
use App\Models\Employee;
use App\Models\PerformanceScore;
use App\Models\Project;
use App\Models\Task;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;

class DashboardController extends Controller
{
    public function index()
    {
        $user = Auth::user();
        $role = $user->getRoleNames()->first() ?? 'Staff / Employee';

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
            ];
        } elseif ($role === 'Supervisor' || $role === 'Head of Department') {
            $data['supervisorData'] = [
                'activeProjects' => Project::where('status', 'Active')->count(),
                'totalTasks' => Task::count(),
                'completedTasks' => Task::where('status', 'Done')->count(),
                'overdueTasks' => Task::where('deadline', '<', now())->where('status', '!=', 'Done')->count(),
                'pendingReview' => Task::where('status', 'Review')->count(),
                'teamWorkload' => Employee::with('user')->withCount(['tasks as active_tasks_count' => function ($query) {
                    $query->where('status', '!=', 'Done');
                }])->get(),
            ];
        } elseif ($role === 'HRD / Admin') {
            $data['hrData'] = [
                'employeeCount' => Employee::count(),
                'departmentCount' => Department::count(),
                'employeeWorkload' => Employee::with('user')->withCount(['tasks as active_tasks_count' => function ($query) {
                    $query->where('status', '!=', 'Done');
                }])->orderByDesc('active_tasks_count')->limit(5)->get(),
            ];
        } elseif ($role === 'General Manager' || $role === 'Super Admin') {
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
            ];
        }

        return Inertia::render('Dashboard', $data);
    }
}
