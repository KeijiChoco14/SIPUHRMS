<?php

namespace App\Http\Controllers;

use App\Models\Task;
use App\Models\TaskChecklist;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class TaskChecklistController extends Controller
{
    public function store(Request $request, Task $task)
    {
        $validated = $request->validate([
            'title' => 'required|string|max:255',
        ]);

        $task->checklists()->create([
            'title' => $validated['title'],
        ]);

        return back()->with('success', 'Checklist item added.');
    }

    public function update(Request $request, TaskChecklist $checklist)
    {
        $validated = $request->validate([
            'is_completed' => 'required|boolean',
        ]);

        $checklist->update([
            'is_completed' => $validated['is_completed'],
            'completed_by' => $validated['is_completed'] ? Auth::user()->employee?->id : null,
        ]);

        return back()->with('success', 'Checklist updated.');
    }

    public function destroy(TaskChecklist $checklist)
    {
        $checklist->delete();

        return back()->with('success', 'Checklist item deleted.');
    }
}
