<?php

namespace App\Http\Controllers;

use App\Models\Announcement;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;

class AnnouncementController extends Controller
{
    public function index()
    {
        $announcements = Announcement::with('creator')
            ->orderBy('created_at', 'desc')
            ->get();

        return Inertia::render('Announcement/Index', [
            'announcements' => $announcements,
        ]);
    }

    public function store(Request $request)
    {
        $request->validate([
            'title' => 'required|string|max:255',
            'message' => 'required|string',
            'target_audience' => 'required|string',
        ]);

        Announcement::create([
            'title' => $request->title,
            'message' => $request->message,
            'target_audience' => $request->target_audience,
            'created_by' => Auth::id(),
            'published_at' => now(),
        ]);

        return redirect()->back()->with('success', 'Announcement posted successfully.');
    }
}
