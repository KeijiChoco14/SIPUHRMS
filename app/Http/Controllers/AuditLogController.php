<?php

namespace App\Http\Controllers;

use App\Models\AuditLog;
use Illuminate\Http\Request;
use Inertia\Inertia;

class AuditLogController extends Controller
{
    /**
     * Display a listing of audit logs.
     */
    public function index(Request $request)
    {
        $query = AuditLog::with('user')->latest();

        if ($search = $request->input('search')) {
            $query->where('description', 'like', "%{$search}%")
                ->orWhereHas('user', function ($q) use ($search) {
                    $q->where('name', 'like', "%{$search}%");
                });
        }

        if ($action = $request->input('action')) {
            $query->where('action', $action);
        }

        $logs = $query->paginate(20)->withQueryString();

        return Inertia::render('Administration/AuditLogs', [
            'logs' => $logs,
            'filters' => $request->only(['search', 'action']),
        ]);
    }
}
