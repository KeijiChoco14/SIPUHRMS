<?php

namespace App\Http\Controllers;

use App\Models\Task;
use App\Models\TaskAttachment;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Storage;

class TaskAttachmentController extends Controller
{
    /**
     * Check if user is authorized to interact with the task.
     */
    protected function canAccessTask($user, Task $task): bool
    {
        if ($user->hasAnyRole(['Super Admin', 'HRD / Admin', 'General Manager'])) {
            return true;
        }

        if ($task->created_by === $user->id) {
            return true;
        }

        $employee = $user->employee;
        if (! $employee) {
            return false;
        }

        if ($task->assignees()->where('employee_id', $employee->id)->exists()) {
            return true;
        }

        if ($task->project && ($task->project->created_by === $user->id || ($task->project->owner_id && $task->project->owner_id === $employee->id))) {
            return true;
        }

        if ($employee->department_id) {
            if ($task->assignees()->where('department_id', $employee->department_id)->exists()) {
                return true;
            }
            if ($task->project && $task->project->department_id === $employee->department_id) {
                return true;
            }
        }

        // Open/unassigned tasks with no restricted assignees or creator can be accessed by any active employee
        if (is_null($task->created_by) && ! $task->assignees()->exists()) {
            return true;
        }

        return false;
    }

    public function store(Request $request, Task $task)
    {
        $user = Auth::user();
        if (! $this->canAccessTask($user, $task)) {
            abort(403, 'You do not have permission to attach files to this task.');
        }

        $request->validate([
            'file' => 'required|file|max:10240|mimes:pdf,doc,docx,xls,xlsx,ppt,pptx,jpg,jpeg,png,webp,zip,csv,txt',
        ]);

        $employee = $user->employee;
        if (! $employee) {
            return back()->with('error', 'Only employees can upload attachments.');
        }

        $file = $request->file('file');
        $path = $file->store('task_attachments', 'public');

        $task->attachments()->create([
            'employee_id' => $employee->id,
            'file_name' => $file->getClientOriginalName(),
            'file_path' => $path,
            'file_size' => $file->getSize(),
        ]);

        $task->activities()->create([
            'employee_id' => $employee->id,
            'action' => 'attachment_uploaded',
            'description' => "Uploaded attachment: {$file->getClientOriginalName()}",
        ]);

        return back()->with('success', 'Attachment uploaded.');
    }

    public function destroy(TaskAttachment $attachment)
    {
        $user = Auth::user();
        $isOwner = $user->employee && $user->employee->id === $attachment->employee_id;
        $isPrivileged = $user->hasAnyRole(['Super Admin', 'HRD / Admin', 'General Manager']);

        if (! $isOwner && ! $isPrivileged) {
            abort(403, 'You do not have permission to delete this attachment.');
        }

        $task = $attachment->task;
        $fileName = $attachment->file_name;
        $employeeId = $user->employee?->id;

        Storage::disk('public')->delete($attachment->file_path);
        $attachment->delete();

        if ($task) {
            $task->activities()->create([
                'employee_id' => $employeeId,
                'action' => 'attachment_deleted',
                'description' => "Deleted attachment: {$fileName}",
            ]);
        }

        return back()->with('success', 'Attachment deleted.');
    }
}
