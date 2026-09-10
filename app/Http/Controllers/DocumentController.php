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
            'type' => 'required|string',
            'file' => 'required|file|max:10240', // Max 10MB
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

        return Storage::disk('public')->download($document->file_path, $document->title);
    }
}
