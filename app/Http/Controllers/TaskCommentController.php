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

        $task->activities()->create([
            'employee_id' => $employee->id,
            'action' => 'comment_added',
            'description' => 'Menambahkan komentar: "' . \Illuminate\Support\Str::limit($validated['content'], 40) . '"',
        ]);

        return back()->with('success', 'Comment added.');
    }

    public function destroy(TaskComment $comment)
    {
        if (Auth::user()->employee?->id !== $comment->employee_id) {
            abort(403);
        }

        $task = $comment->task;
        $employeeId = Auth::user()->employee?->id;

        $comment->delete();

        if ($task) {
            $task->activities()->create([
                'employee_id' => $employeeId,
                'action' => 'comment_deleted',
                'description' => 'Menghapus komentar',
            ]);
        }

        return back()->with('success', 'Comment deleted.');
    }
}
