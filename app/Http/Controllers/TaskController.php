<?php

namespace App\Http\Controllers;

use App\Enums\TaskPriority;
use App\Enums\TaskStatus;
use App\Models\Task;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;

class TaskController extends Controller
{
    public function index(Request $request)
    {
        $user = Auth::user();
        if (! $user->employee && ! $user->hasAnyRole(['Super Admin', 'HRD / Admin', 'General Manager'])) {
            abort(403, 'Only employees can have tasks.');
        }

        $query = Task::with([
            'project', 
            'assignees.user', 
            'assignees.department', 
            'creator',
            'comments.employee.user', 
            'attachments.employee.user', 
            'checklists', 
            'activities.employee.user'
        ]);

        if (! $user->hasAnyRole(['Super Admin', 'HRD / Admin', 'General Manager'])) {
            $query->where(function ($q) use ($user) {
                if ($user->employee) {
                    $q->whereHas('assignees', function ($sq) use ($user) {
                        $sq->where('employee_id', $user->employee->id);
                    });
                }
                $q->orWhere('created_by', $user->id);
            });
        }

        if ($request->filled('filter')) {
            if ($request->filter === 'active') {
                $query->whereNotIn('status', [TaskStatus::Done->value, TaskStatus::Cancelled->value]);
            } elseif ($request->filter === 'completed') {
                $query->where('status', TaskStatus::Done->value);
            } elseif ($request->filter === 'overdue') {
                $query->where('deadline', '<', now())->whereNotIn('status', [TaskStatus::Done->value, TaskStatus::Cancelled->value]);
            }
        } elseif ($request->filled('status')) {
            $query->where('status', $request->status);
        }

        $tasks = $query->orderBy('deadline', 'asc')->get();

        return Inertia::render('Tasks/Index', [
            'tasks' => $tasks,
            'filters' => $request->only(['filter', 'status']),
            'employees' => \App\Models\Employee::with(['user', 'department'])->get(),
            'statuses' => TaskStatus::cases(),
            'priorities' => TaskPriority::cases(),
        ]);
    }

    public function kanban()
    {
        $user = Auth::user();
        if (! $user->employee && ! $user->hasAnyRole(['Super Admin', 'HRD / Admin', 'General Manager'])) {
            abort(403, 'Only employees can have tasks.');
        }

        $query = Task::with([
            'project', 
            'assignees.user', 
            'assignees.department', 
            'creator', 
            'comments.employee.user', 
            'attachments.employee.user', 
            'checklists', 
            'activities.employee.user'
        ]);

        if (! $user->hasAnyRole(['Super Admin', 'HRD / Admin', 'General Manager'])) {
            $query->where(function ($q) use ($user) {
                if ($user->employee) {
                    $q->whereHas('assignees', function ($sq) use ($user) {
                        $sq->where('employee_id', $user->employee->id);
                    });
                }
                $q->orWhere('created_by', $user->id);
            });
        }

        $tasks = $query->get();

        return Inertia::render('Tasks/Kanban', [
            'tasks' => $tasks,
            'employees' => \App\Models\Employee::with(['user', 'department'])->get(),
            'statuses' => TaskStatus::cases(),
            'priorities' => TaskPriority::cases(),
        ]);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'title' => 'required|string|max:255',
            'description' => 'nullable|string',
            'project_id' => 'nullable|exists:projects,id',
            'priority' => 'required|string',
            'deadline' => 'nullable|date',
            'status' => 'required|string',
            'assignees' => 'nullable|array',
            'assignees.*' => 'exists:employees,id',
        ]);

        $validated['created_by'] = Auth::id();

        $task = Task::create(collect($validated)->except('assignees')->toArray());

        if (! empty($validated['assignees'])) {
            $task->assignees()->sync($validated['assignees']);

            // Notify assigned users
            $users = \App\Models\Employee::whereIn('id', $validated['assignees'])
                ->with('user')
                ->get()
                ->pluck('user')
                ->filter();
            
            \Illuminate\Support\Facades\Notification::send($users, new \App\Notifications\TaskAssigned($task));
        }

        return back()->with('success', 'Task created successfully.');
    }

    public function update(Request $request, Task $task)
    {
        $user = Auth::user();
        $isCreator = $task->created_by === $user->id 
            || ($task->project && $task->project->created_by === $user->id)
            || $user->hasAnyRole(['Super Admin', 'HRD / Admin', 'General Manager']);
        
        $isAssignee = $user->employee && $task->assignees()->where('employee_id', $user->employee->id)->exists();

        // Check if this is exclusively a status change (e.g. from Kanban drag/drop or status select)
        $isOnlyStatusUpdate = $request->has('status') && !$request->hasAny(['title', 'description', 'priority', 'deadline', 'assignees']);

        if ($isOnlyStatusUpdate) {
            if (!$isCreator && !$isAssignee) {
                abort(403, 'Anda tidak memiliki akses untuk mengubah status task ini.');
            }
        } else {
            if (!$isCreator) {
                abort(403, 'Hanya pembuat task yang dapat mengubah informasi atau penugasan task ini.');
            }
        }

        $validated = $request->validate([
            'title' => 'sometimes|required|string|max:255',
            'description' => 'nullable|string',
            'priority' => 'sometimes|required|string',
            'deadline' => 'nullable|date',
            'status' => 'sometimes|required|string',
            'assignees' => 'nullable|array',
            'assignees.*' => 'exists:employees,id',
        ]);

        $taskData = collect($validated)->except('assignees')->toArray();
        if (!empty($taskData)) {
            $task->update($taskData);
        }

        if ($request->has('assignees')) {
            $changes = $task->assignees()->sync($validated['assignees'] ?? []);

            if (!empty($changes['attached'])) {
                $newEmployees = \App\Models\Employee::whereIn('id', $changes['attached'])
                    ->with('user')
                    ->get();
                
                $names = $newEmployees->map(fn($e) => $e->user?->name ?? $e->employee_number)->implode(', ');
                $task->activities()->create([
                    'employee_id' => Auth::user()?->employee?->id,
                    'action' => 'assignee_added',
                    'description' => "Added assignee(s): {$names}",
                ]);

                $newUsers = $newEmployees->pluck('user')->filter();
                if ($newUsers->isNotEmpty()) {
                    \Illuminate\Support\Facades\Notification::send($newUsers, new \App\Notifications\TaskAssigned($task));
                }
            }

            if (!empty($changes['detached'])) {
                $removedEmployees = \App\Models\Employee::whereIn('id', $changes['detached'])
                    ->with('user')
                    ->get();
                $names = $removedEmployees->map(fn($e) => $e->user?->name ?? $e->employee_number)->implode(', ');
                $task->activities()->create([
                    'employee_id' => Auth::user()?->employee?->id,
                    'action' => 'assignee_removed',
                    'description' => "Removed assignee(s): {$names}",
                ]);
            }
        }

        return back()->with('success', 'Task updated successfully.');
    }

    public function destroy(Task $task)
    {
        $user = Auth::user();
        $isCreator = $task->created_by === $user->id 
            || ($task->project && $task->project->created_by === $user->id)
            || $user->hasAnyRole(['Super Admin', 'HRD / Admin', 'General Manager']);

        if (!$isCreator) {
            abort(403, 'Hanya pembuat task yang dapat menghapus task ini.');
        }

        $task->delete();

        return back()->with('success', 'Task deleted successfully.');
    }

    public function acknowledge(Task $task)
    {
        $employee = Auth::user()->employee;
        if (! $employee) {
            return back()->with('error', 'Only employees can acknowledge tasks.');
        }

        $task->assignees()->updateExistingPivot($employee->id, [
            'acknowledged_at' => now(),
        ]);

        return back()->with('success', 'Task acknowledged successfully.');
    }
}
