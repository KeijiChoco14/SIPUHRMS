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
    public function index()
    {
        $user = Auth::user();
        if (! $user->employee) {
            abort(403, 'Only employees can have tasks.');
        }

        $tasks = Task::with([
            'project', 
            'assignees.user', 
            'creator',
            'comments.employee.user', 
            'attachments.employee.user', 
            'checklists', 
            'activities.employee.user'
        ])
            ->whereHas('assignees', function ($q) use ($user) {
                $q->where('employee_id', $user->employee->id);
            })
            ->orderBy('deadline', 'asc')
            ->get();

        return Inertia::render('Tasks/Index', [
            'tasks' => $tasks,
        ]);
    }

    public function kanban()
    {
        $user = Auth::user();
        if (! $user->employee) {
            abort(403, 'Only employees can have tasks.');
        }

        $tasks = Task::with([
            'project', 
            'assignees.user', 
            'creator', 
            'comments.employee.user', 
            'attachments.employee.user', 
            'checklists', 
            'activities.employee.user'
        ])
            ->whereHas('assignees', function ($q) use ($user) {
                $q->where('employee_id', $user->employee->id);
            })
            ->get();

        return Inertia::render('Tasks/Kanban', [
            'tasks' => $tasks,
            'statuses' => TaskStatus::cases(),
            'priorities' => TaskPriority::cases(),
        ]);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'title' => 'required|string|max:255',
            'description' => 'nullable|string',
            'project_id' => 'required|exists:projects,id',
            'priority' => 'required|string',
            'deadline' => 'nullable|date',
            'status' => 'required|string',
            'assignees' => 'nullable|array',
            'assignees.*' => 'exists:employees,id',
        ]);

        $validated['created_by'] = Auth::id();

        $task = Task::create($validated);

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
        $validated = $request->validate([
            'title' => 'sometimes|required|string|max:255',
            'description' => 'nullable|string',
            'priority' => 'sometimes|required|string',
            'deadline' => 'nullable|date',
            'status' => 'sometimes|required|string',
            'assignees' => 'nullable|array',
            'assignees.*' => 'exists:employees,id',
        ]);

        $task->update($validated);

        if ($request->has('assignees')) {
            $changes = $task->assignees()->sync($validated['assignees'] ?? []);

            if (!empty($changes['attached'])) {
                $newUsers = \App\Models\Employee::whereIn('id', $changes['attached'])
                    ->with('user')
                    ->get()
                    ->pluck('user')
                    ->filter();
                
                if ($newUsers->isNotEmpty()) {
                    \Illuminate\Support\Facades\Notification::send($newUsers, new \App\Notifications\TaskAssigned($task));
                }
            }
        }

        return back()->with('success', 'Task updated successfully.');
    }

    public function destroy(Task $task)
    {
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
