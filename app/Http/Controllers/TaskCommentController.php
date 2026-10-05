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
            'tagged_user_ids' => 'nullable|array',
            'tagged_user_ids.*' => 'integer|exists:users,id',
        ]);

        $employee = Auth::user()->employee;
        if (! $employee) {
            return back()->with('error', 'Only employees can comment on tasks.');
        }

        $taggedUserIds = collect($validated['tagged_user_ids'] ?? [])
            ->map(fn($id) => (int)$id)
            ->all();

        // Also auto-detect any @Name mentioned in the text
        $allUsers = \App\Models\User::select('id', 'name')->get();
        foreach ($allUsers as $u) {
            if (stripos($validated['content'], '@' . $u->name) !== false) {
                $taggedUserIds[] = (int)$u->id;
            }
        }

        // Deduplicate and filter out author so they don't notify themselves
        $currentUserId = (int)Auth::id();
        $taggedUserIds = array_values(array_unique(array_filter($taggedUserIds, fn($id) => $id !== $currentUserId)));

        $comment = $task->comments()->create([
            'employee_id' => $employee->id,
            'content' => $validated['content'],
            'tagged_user_ids' => $taggedUserIds,
        ]);

        // Send notification to tagged users
        if (!empty($taggedUserIds)) {
            $usersToNotify = \App\Models\User::whereIn('id', $taggedUserIds)->get();
            if ($usersToNotify->isNotEmpty()) {
                try {
                    \Illuminate\Support\Facades\Notification::send(
                        $usersToNotify,
                        new \App\Notifications\CommentMentioned($task, $comment, Auth::user())
                    );
                } catch (\Throwable $e) {
                    \Illuminate\Support\Facades\Log::warning('Failed to dispatch comment mention notification: ' . $e->getMessage());
                }
            }
        }

        $taggedNames = !empty($taggedUserIds) 
            ? \App\Models\User::whereIn('id', $taggedUserIds)->pluck('name')->implode(', ')
            : null;

        $activityDesc = 'Menambahkan komentar: "' . \Illuminate\Support\Str::limit($validated['content'], 40) . '"';
        if ($taggedNames) {
            $activityDesc .= ' (Menandai: ' . $taggedNames . ')';
        }

        $task->activities()->create([
            'employee_id' => $employee->id,
            'action' => 'comment_added',
            'description' => $activityDesc,
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
