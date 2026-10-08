<?php

namespace App\Http\Controllers;

use App\Models\Task;
use App\Models\TaskComment;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Storage;

class TaskCommentController extends Controller
{
    public function store(Request $request, Task $task)
    {
        $validated = $request->validate([
            'content' => 'nullable|string',
            'tagged_user_ids' => 'nullable|array',
            'tagged_user_ids.*' => 'integer|exists:users,id',
            'file' => 'nullable|file|max:20480', // max 20MB
        ]);

        $content = trim($validated['content'] ?? '');
        $hasFile = $request->hasFile('file');

        if (empty($content) && !$hasFile) {
            return back()->withErrors(['content' => 'Please provide a comment message or attach a file.']);
        }

        $employee = Auth::user()->employee;
        if (! $employee) {
            return back()->with('error', 'Only employees can comment on tasks.');
        }

        $taggedUserIds = collect($validated['tagged_user_ids'] ?? [])
            ->map(fn($id) => (int)$id)
            ->all();

        // Also auto-detect any @Name mentioned in the text
        if (!empty($content)) {
            $allUsers = \App\Models\User::select('id', 'name')->get();
            foreach ($allUsers as $u) {
                if (stripos($content, '@' . $u->name) !== false) {
                    $taggedUserIds[] = (int)$u->id;
                }
            }
        }

        // Deduplicate and filter out author so they don't notify themselves
        $currentUserId = (int)Auth::id();
        $taggedUserIds = array_values(array_unique(array_filter($taggedUserIds, fn($id) => $id !== $currentUserId)));

        $commentData = [
            'employee_id' => $employee->id,
            'content' => $content,
        ];

        if ($hasFile) {
            $file = $request->file('file');
            $path = $file->store('task_comment_attachments', 'public');
            $commentData['file_path'] = $path;
            $commentData['file_name'] = $file->getClientOriginalName();
            $commentData['file_size'] = $file->getSize();
            $commentData['file_type'] = $file->getMimeType();
        }

        // Guard against databases where migration has not run yet
        if (\Illuminate\Support\Facades\Schema::hasColumn('task_comments', 'tagged_user_ids')) {
            $commentData['tagged_user_ids'] = $taggedUserIds;
        }

        $comment = $task->comments()->create($commentData);

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

        $descContent = !empty($content) ? '"' . \Illuminate\Support\Str::limit($content, 40) . '"' : '';
        $fileInfo = $hasFile ? '(Attached: ' . $commentData['file_name'] . ')' : '';
        $activityDesc = 'Added comment ' . trim($descContent . ' ' . $fileInfo);
        if ($taggedNames) {
            $activityDesc .= ' (Mentioned: ' . $taggedNames . ')';
        }

        $task->activities()->create([
            'employee_id' => $employee->id,
            'action' => 'comment_added',
            'description' => trim($activityDesc),
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

        if ($comment->file_path) {
            Storage::disk('public')->delete($comment->file_path);
        }

        $comment->delete();

        if ($task) {
            $task->activities()->create([
                'employee_id' => $employeeId,
                'action' => 'comment_deleted',
                'description' => 'Deleted comment',
            ]);
        }

        return back()->with('success', 'Comment deleted.');
    }
}
