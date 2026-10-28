<?php

namespace App\Http\Controllers;

use App\Models\Shift;
use Illuminate\Http\Request;
use Inertia\Inertia;

class ShiftController extends Controller
{
    public function index()
    {
        $shifts = Shift::withCount(['workSchedules', 'attendances'])->get();

        return Inertia::render('Shift/Index', [
            'shifts' => $shifts,
        ]);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'code' => 'nullable|string|max:50',
            'start_time' => 'required',
            'end_time' => 'required',
            'clock_in_window_start' => 'nullable',
            'clock_in_window_end' => 'nullable',
            'clock_out_window_start' => 'nullable',
            'clock_out_window_end' => 'nullable',
            'is_overnight' => 'nullable|boolean',
            'late_tolerance_minutes' => 'nullable|integer|min:0|max:180',
            'is_active' => 'nullable|boolean',
            'color' => 'required|string|max:20',
        ]);

        // Auto-detect overnight shift if end_time is less than start_time
        if (!isset($validated['is_overnight']) || $validated['is_overnight'] === null) {
            $validated['is_overnight'] = ($validated['end_time'] < $validated['start_time']);
        }

        $validated['late_tolerance_minutes'] = $validated['late_tolerance_minutes'] ?? 0;
        $validated['is_active'] = $validated['is_active'] ?? true;

        Shift::create($validated);

        return back()->with('success', 'Work shift created successfully.');
    }

    public function update(Request $request, Shift $shift)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'code' => 'nullable|string|max:50',
            'start_time' => 'required',
            'end_time' => 'required',
            'clock_in_window_start' => 'nullable',
            'clock_in_window_end' => 'nullable',
            'clock_out_window_start' => 'nullable',
            'clock_out_window_end' => 'nullable',
            'is_overnight' => 'nullable|boolean',
            'late_tolerance_minutes' => 'nullable|integer|min:0|max:180',
            'is_active' => 'nullable|boolean',
            'color' => 'required|string|max:20',
        ]);

        if (!isset($validated['is_overnight']) || $validated['is_overnight'] === null) {
            $validated['is_overnight'] = ($validated['end_time'] < $validated['start_time']);
        }

        $validated['late_tolerance_minutes'] = $validated['late_tolerance_minutes'] ?? 0;
        $validated['is_active'] = $validated['is_active'] ?? true;

        $shift->update($validated);

        return back()->with('success', 'Work shift updated successfully.');
    }

    public function destroy(Shift $shift)
    {
        // Safe check: If shift is referenced by existing attendance records or work schedules, deactivate instead of hard delete
        $hasUsage = $shift->attendances()->exists() || $shift->workSchedules()->exists();

        if ($hasUsage) {
            $shift->update(['is_active' => false]);
            return back()->with('success', 'Shift has active historical attendance or roster records and was deactivated instead of permanently deleted.');
        }

        $shift->delete();

        return back()->with('success', 'Shift deleted successfully.');
    }
}
