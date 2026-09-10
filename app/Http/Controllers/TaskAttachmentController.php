<?php

namespace App\Http\Controllers;

use App\Models\Task;
use App\Models\TaskAttachment;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Storage;

class TaskAttachmentController extends Controller
{
    public function store(Request $request, Task $task)
    {
        $request->validate([
            'file' => 'required|file|max:10240', // max 10MB
        ]);

        $employee = Auth::user()->employee;
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

        return back()->with('success', 'Attachment uploaded.');
    }

    public function destroy(TaskAttachment $attachment)
    {
        if (Auth::user()->employee?->id !== $attachment->employee_id) {
            abort(403);
        }

        Storage::disk('public')->delete($attachment->file_path);
        $attachment->delete();

        return back()->with('success', 'Attachment deleted.');
    }
}
