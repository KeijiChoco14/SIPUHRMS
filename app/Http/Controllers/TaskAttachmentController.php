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

        $task->activities()->create([
            'employee_id' => $employee->id,
            'action' => 'attachment_uploaded',
            'description' => "Mengunggah berkas lampiran: {$file->getClientOriginalName()}",
        ]);

        return back()->with('success', 'Attachment uploaded.');
    }

    public function destroy(TaskAttachment $attachment)
    {
        if (Auth::user()->employee?->id !== $attachment->employee_id) {
            abort(403);
        }

        $task = $attachment->task;
        $fileName = $attachment->file_name;
        $employeeId = Auth::user()->employee?->id;

        Storage::disk('public')->delete($attachment->file_path);
        $attachment->delete();

        if ($task) {
            $task->activities()->create([
                'employee_id' => $employeeId,
                'action' => 'attachment_deleted',
                'description' => "Menghapus berkas lampiran: {$fileName}",
            ]);
        }

        return back()->with('success', 'Attachment deleted.');
    }
}
