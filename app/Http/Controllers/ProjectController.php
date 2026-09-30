<?php

namespace App\Http\Controllers;

use App\Enums\ProjectStatus;
use App\Enums\TaskPriority;
use App\Enums\TaskStatus;
use App\Models\Department;
use App\Models\Employee;
use App\Models\Project;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;

class ProjectController extends Controller
{
    private function checkAccess(Project $project)
    {
        $user = Auth::user();
        if ($user->hasAnyRole(['Super Admin', 'HRD / Admin', 'General Manager', 'Supervisor', 'Head of Department'])) {
            return;
        }

        $employeeId = $user->employee->id ?? null;
        $isOwner = $project->owner_id == $employeeId;
        $isMember = $project->members()->where('employee_id', $employeeId)->exists();

        if (!$isOwner && !$isMember) {
            abort(403, 'Anda tidak memiliki akses ke project ini.');
        }
    }
    public function index()
    {
        $user = Auth::user();
        $query = Project::with(['owner.user', 'department'])->latest();

        if (!$user->hasAnyRole(['Super Admin', 'HRD / Admin', 'General Manager', 'Supervisor', 'Head of Department'])) {
            $employeeId = $user->employee->id ?? null;
            $query->where(function ($q) use ($employeeId) {
                $q->where('owner_id', $employeeId)
                  ->orWhereHas('members', function ($q2) use ($employeeId) {
                      $q2->where('employee_id', $employeeId);
                  });
            });
        }

        $projects = $query->paginate(10);

        return Inertia::render('Projects/Index', [
            'projects' => $projects,
        ]);
    }

    public function create()
    {
        return Inertia::render('Projects/Create', [
            'employees' => Employee::with(['user', 'department'])->get(),
            'departments' => Department::all(),
            'projectStatuses' => ProjectStatus::cases(),
        ]);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'description' => 'nullable|string',
            'owner_id' => 'nullable|exists:employees,id',
            'department_id' => 'nullable|exists:departments,id',
            'start_date' => 'nullable|date',
            'deadline' => 'nullable|date' . ($request->filled('start_date') ? '|after_or_equal:start_date' : ''),
            'status' => 'nullable|string',
        ]);

        $validated['created_by'] = Auth::id();
        $validated['status'] = $validated['status'] ?? ProjectStatus::Planning->value;

        $project = Project::create($validated);

        return redirect()->route('projects.show', $project)->with('success', 'Project created successfully.');
    }

    public function show(Project $project)
    {
        $this->checkAccess($project);

        $project->load([
            'owner.user',
            'department',
            'members.user',
            'tasks.assignees.user',
            'tasks.assignees.department',
            'tasks.comments.employee.user',
            'tasks.attachments.employee.user',
            'tasks.checklists',
            'tasks.activities.employee.user',
        ]);

        $user = Auth::user();
        $canEdit = $project->created_by === $user->id 
            || ($project->owner_id && $user->employee && $project->owner_id === $user->employee->id)
            || $user->hasAnyRole(['Super Admin', 'HRD / Admin', 'General Manager']);

        return Inertia::render('Projects/Show', [
            'project' => $project,
            'canEdit' => $canEdit,
            'statuses' => TaskStatus::cases(),
            'priorities' => TaskPriority::cases(),
            'projectStatuses' => ProjectStatus::cases(),
            'departments' => Department::all(),
            'employees' => Employee::with(['user', 'department'])->get(),
        ]);
    }

    private function checkEditAccess(Project $project)
    {
        $user = Auth::user();
        $isCreator = $project->created_by === $user->id 
            || ($project->owner_id && $user->employee && $project->owner_id === $user->employee->id)
            || $user->hasAnyRole(['Super Admin', 'HRD / Admin', 'General Manager']);

        if (!$isCreator) {
            abort(403, 'Hanya pembuat project yang dapat mengubah atau menghapus project ini.');
        }
    }

    public function edit(Project $project)
    {
        $this->checkEditAccess($project);

        return Inertia::render('Projects/Edit', [
            'project' => $project->load(['owner.user', 'department']),
            'employees' => Employee::with(['user', 'department'])->get(),
            'departments' => Department::all(),
            'projectStatuses' => ProjectStatus::cases(),
        ]);
    }

    public function update(Request $request, Project $project)
    {
        $this->checkEditAccess($project);

        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'description' => 'nullable|string',
            'owner_id' => 'nullable|exists:employees,id',
            'department_id' => 'nullable|exists:departments,id',
            'start_date' => 'nullable|date',
            'deadline' => 'nullable|date' . ($request->filled('start_date') ? '|after_or_equal:start_date' : ''),
            'status' => 'required|string',
        ]);

        $project->update($validated);

        return redirect()->route('projects.show', $project)->with('success', 'Project updated successfully.');
    }

    public function destroy(Project $project)
    {
        $this->checkEditAccess($project);

        $project->delete();

        return redirect()->route('projects.index')->with('success', 'Project deleted successfully.');
    }
}
