<?php

namespace App\Http\Controllers;

use App\Models\Document;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Storage;
use Inertia\Inertia;

class DocumentController extends Controller
{
    public function index()
    {
        $documents = Document::with(['uploader', 'department'])
            ->orderBy('created_at', 'desc')
            ->get();

        return Inertia::render('Document/Index', [
            'documents' => $documents,
        ]);
    }

    public function store(Request $request)
    {
        $request->validate([
            'title' => 'required|string|max:255',
            'type' => 'required|string|max:100',
            'department_id' => 'nullable|exists:departments,id',
            'file' => 'required|file|max:10240|mimes:pdf,doc,docx,xls,xlsx,ppt,pptx,jpg,jpeg,png,webp,zip,csv,txt',
        ]);

        $path = $request->file('file')->store('documents', 'public');

        Document::create([
            'title' => $request->title,
            'file_path' => $path,
            'type' => $request->type,
            'department_id' => $request->department_id,
            'uploaded_by' => Auth::id(),
        ]);

        return redirect()->back()->with('success', 'Document uploaded successfully.');
    }

    public function download($id)
    {
        $document = Document::findOrFail($id);

        $user = Auth::user();
        if (! $user->hasAnyRole(['Super Admin', 'HRD / Admin', 'General Manager'])) {
            if ($document->department_id && $user->employee?->department_id !== $document->department_id) {
                abort(403, 'You do not have permission to access documents belonging to other departments.');
            }
        }

        $sanitizedTitle = preg_replace('/[^A-Za-z0-9_\-\. ]/', '_', $document->title);
        $extension = pathinfo($document->file_path, PATHINFO_EXTENSION);
        $downloadName = $sanitizedTitle;
        if ($extension && ! str_ends_with(strtolower($downloadName), '.' . strtolower($extension))) {
            $downloadName .= '.' . $extension;
        }

        return Storage::disk('public')->download($document->file_path, $downloadName);
    }
}
