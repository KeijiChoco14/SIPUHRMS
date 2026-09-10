<?php

namespace App\Http\Controllers;

use App\Models\Task;
use App\Models\TaskComment;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class TaskCommentController extends Controller
{
    public function store(Request $request, Task $task)
    {
        $validated = $request->validate([
            'content' => 'required|string',
        ]);

        $employee = Auth::user()->employee;
        if (! $employee) {
            return back()->with('error', 'Only employees can comment on tasks.');
        }

        $task->comments()->create([
            'employee_id' => $employee->id,
            'content' => $validated['content'],
        ]);

        return back()->with('success', 'Comment added.');
    }

    public function destroy(TaskComment $comment)
    {
        if (Auth::user()->employee?->id !== $comment->employee_id) {
            abort(403);
        }

        $comment->delete();

        return back()->with('success', 'Comment deleted.');
    }
}
