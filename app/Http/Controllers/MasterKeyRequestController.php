<?php

namespace App\Http\Controllers;

use App\Models\AuditLog;
use App\Models\Department;
use App\Models\Employee;
use App\Models\MasterKeyRequest;
use App\Models\User;
use App\Notifications\MasterKeyStatusNotification;
use Carbon\Carbon;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Artisan;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Schema;
use Inertia\Inertia;
use Symfony\Component\HttpFoundation\StreamedResponse;

class MasterKeyRequestController extends Controller
{
    /**
     * Ensure the master_key_requests table exists, attempting auto-migration if missing.
     */
    private function ensureTableExists(): bool
    {
        if (Schema::hasTable('master_key_requests') && Schema::hasColumn('master_key_requests', 'request_by')) {
            return true;
        }

        try {
            Artisan::call('migrate', ['--force' => true]);
        } catch (\Throwable $e) {
            Log::warning('Auto migrate master_key_requests failed: ' . $e->getMessage());
        }

        return Schema::hasTable('master_key_requests');
    }

    /**
     * Display a listing of master key access requests.
     */
    public function index(Request $request)
    {
        $user = Auth::user();
        $isSuperAdmin = $user->hasRole('Super Admin');
        $isHRD = $user->hasRole('HRD / Admin');
        $isGM = $user->hasRole('General Manager');
        $isHOD = $user->hasRole('Head of Department');
        $isSupervisor = $user->hasRole('Supervisor');

        $userEmployee = $user->employee;
        $isHK = $userEmployee?->department?->name === 'Housekeeping';

        $canApprove = $isSuperAdmin || $isHRD || $isGM || ($isHOD && $isHK);
        $canManageAll = $canApprove || ($isSupervisor && $isHK);

        if (!$this->ensureTableExists()) {
            $hkDepartment = Department::where('name', 'Housekeeping')->first();
            $hkEmployees = Employee::with(['user', 'position'])
                ->where('department_id', $hkDepartment?->id)
                ->get();

            return Inertia::render('MasterKey/Index', [
                'requests' => new \Illuminate\Pagination\LengthAwarePaginator([], 0, 15),
                'filters' => [
                    'tab' => $request->input('tab', 'all'),
                    'search' => $request->input('search', ''),
                    'key_type' => $request->input('key_type', ''),
                    'request_type' => $request->input('request_type', ''),
                ],
                'stats' => [
                    'total' => 0,
                    'on_request' => 0,
                    'done' => 0,
                    'expiring_soon' => 0,
                    'expired' => 0,
                ],
                'canApprove' => $canApprove,
                'canManageAll' => $canManageAll,
                'currentEmployee' => $userEmployee?->load(['department', 'position']),
                'currentUser' => $user,
                'hkEmployees' => $hkEmployees,
                'existingKeys' => [],
                'defaultKeyTypes' => [
                    'Grand Master Key',
                    'Master Key',
                    'Floor Key',
                    'Lift Only',
                ],
                'commonRoomRanges' => [
                    'Lantai 2 (Kamar 201 - 240)',
                    'Lantai 3 (Kamar 301 - 340)',
                    'Lantai 5 (Kamar 501 - 540)',
                    'Lantai 6 (Kamar 601 - 640)',
                    'Lantai 2 - 3 (Kamar 201 - 340)',
                    'Lantai 5 - 6 (Kamar 501 - 640)',
                    'Seluruh Area Kamar Tamu (All HK Guest Rooms)',
                    'Area Publik & Linen Room',
                ],
                'migrationNotice' => 'Tabel "master_key_requests" belum tersedia di database MySQL server ini. Sistem mencoba menjalankan migrasi otomatis, atau Anda dapat menjalankan "php artisan migrate" di terminal server.',
            ]);
        }

        $query = MasterKeyRequest::with([
            'employee.user',
            'employee.department',
            'employee.position',
            'requestedBy',
            'doneBy',
            'previousRequest',
            'auditLogs.user',
        ])->latest();

        // If regular staff, view own requests
        if (!$canManageAll) {
            $query->where('employee_id', $userEmployee?->id);
        }

        // Search filter
        if ($search = $request->input('search')) {
            $query->where(function ($q) use ($search) {
                $q->where('request_number', 'like', "%{$search}%")
                    ->orWhere('key_number', 'like', "%{$search}%")
                    ->orWhere('remark', 'like', "%{$search}%")
                    ->orWhere('room_range_access', 'like', "%{$search}%")
                    ->orWhere('request_by', 'like', "%{$search}%")
                    ->orWhere('requested_by_username', 'like', "%{$search}%")
                    ->orWhere('done_by_username', 'like', "%{$search}%")
                    ->orWhereHas('employee.user', function ($sub) use ($search) {
                        $sub->where('name', 'like', "%{$search}%");
                    })
                    ->orWhereHas('employee', function ($sub) use ($search) {
                        $sub->where('employee_number', 'like', "%{$search}%");
                    });
            });
        }

        // Key Type filter
        if ($keyType = $request->input('key_type')) {
            $query->where('key_type', $keyType);
        }

        // Request Type filter (create_new, extension, replacement)
        if ($requestType = $request->input('request_type')) {
            $query->where('request_type', $requestType);
        }

        // Tab status filter: all, on_request, done, expiring, expired
        $tab = $request->input('tab', 'all');
        $today = Carbon::today()->toDateString();
        $fourteenDaysLater = Carbon::today()->addDays(14)->toDateString();

        if ($tab === 'on_request') {
            $query->where('status', 'On Request');
        } elseif ($tab === 'done') {
            $query->where('status', 'Done');
        } elseif ($tab === 'expiring') {
            $query->where('status', 'Done')
                ->where('valid_until', '>=', $today)
                ->where('valid_until', '<=', $fourteenDaysLater);
        } elseif ($tab === 'expired') {
            $query->where('status', 'Done')
                ->where('valid_until', '<', $today);
        }

        $requests = $query->paginate(15)->withQueryString();

        // Statistics
        $statsBaseQuery = MasterKeyRequest::query();
        if (!$canManageAll) {
            $statsBaseQuery->where('employee_id', $userEmployee?->id);
        }

        $totalKeys = (clone $statsBaseQuery)->count();
        $onRequestCount = (clone $statsBaseQuery)->where('status', 'On Request')->count();
        $doneCount = (clone $statsBaseQuery)->where('status', 'Done')->count();
        $expiringSoon = (clone $statsBaseQuery)->where('status', 'Done')->where('valid_until', '>=', $today)->where('valid_until', '<=', $fourteenDaysLater)->count();
        $expiredCount = (clone $statsBaseQuery)->where('status', 'Done')->where('valid_until', '<', $today)->count();

        // Housekeeping employees list for selection
        $hkDepartment = Department::where('name', 'Housekeeping')->first();
        $hkEmployees = Employee::with(['user', 'position'])
            ->where('department_id', $hkDepartment?->id)
            ->get();

        // Recent / Active keys list for Quick Select when creating Extension / Replacement
        $existingKeys = MasterKeyRequest::with(['employee.user'])
            ->select('id', 'request_number', 'key_number', 'key_type', 'room_range_access', 'valid_until', 'employee_id', 'request_by')
            ->latest()
            ->take(30)
            ->get();

        return Inertia::render('MasterKey/Index', [
            'requests' => $requests,
            'filters' => [
                'tab' => $tab,
                'search' => $search ?? '',
                'key_type' => $keyType ?? '',
                'request_type' => $requestType ?? '',
            ],
            'stats' => [
                'total' => $totalKeys,
                'on_request' => $onRequestCount,
                'done' => $doneCount,
                'expiring_soon' => $expiringSoon,
                'expired' => $expiredCount,
            ],
            'canApprove' => $canApprove,
            'canManageAll' => $canManageAll,
            'currentEmployee' => $userEmployee?->load(['department', 'position']),
            'currentUser' => $user,
            'hkEmployees' => $hkEmployees,
            'existingKeys' => $existingKeys,
            'defaultKeyTypes' => [
                'Grand Master Key',
                'Master Key',
                'Floor Key',
                'Lift Only',
            ],
            'commonRoomRanges' => [
                'Lantai 2 (Kamar 201 - 240)',
                'Lantai 3 (Kamar 301 - 340)',
                'Lantai 5 (Kamar 501 - 540)',
                'Lantai 6 (Kamar 601 - 640)',
                'Lantai 2 - 3 (Kamar 201 - 340)',
                'Lantai 5 - 6 (Kamar 501 - 640)',
                'Seluruh Area Kamar Tamu (All HK Guest Rooms)',
                'Area Publik & Linen Room',
            ],
        ]);
    }

    /**
     * Store a newly created master key access request (1 Form: create new, extension, replacement).
     */
    public function store(Request $request)
    {
        if (!$this->ensureTableExists()) {
            return back()->with('error', 'Tabel master_key_requests belum tersedia di database. Silakan jalankan "php artisan migrate" di server terlebih dahulu.');
        }

        $user = Auth::user();
        $userEmployee = $user->employee;
        $isSuperAdmin = $user->hasRole('Super Admin');
        $isHRD = $user->hasRole('HRD / Admin');
        $isGM = $user->hasRole('General Manager');
        $isHOD = $user->hasRole('Head of Department');
        $isSupervisor = $user->hasRole('Supervisor');
        $isHK = $userEmployee?->department?->name === 'Housekeeping';

        $canManageAll = $isSuperAdmin || $isHRD || $isGM || ($isHOD && $isHK) || ($isSupervisor && $isHK);

        $rules = [
            'request_type' => 'required|in:create_new,extension,replacement',
            'request_by' => 'required|string|max:255',
            'key_number' => 'required|string|max:50',
            'key_type' => 'required|string|max:100',
            'room_range_access' => 'required|string|max:255',
            'valid_from' => 'required|date',
            'renewal_cycle_months' => 'nullable|integer|min:1|max:12',
            'remark' => 'required|string|max:1000',
            'purpose' => 'nullable|string|max:1000',
            'requester_signature' => 'nullable|string',
            'previous_request_id' => 'nullable|exists:master_key_requests,id',
            'employee_id' => 'nullable|exists:employees,id',
        ];

        $validated = $request->validate($rules);

        $requestBy = trim($validated['request_by']);

        // Check if an employee matches by name, or fall back to user's employee
        $targetEmployee = null;
        if (!empty($validated['employee_id'])) {
            $targetEmployee = Employee::with(['department', 'user'])->find($validated['employee_id']);
        }
        if (!$targetEmployee) {
            $targetEmployee = Employee::with(['department', 'user'])
                ->whereHas('user', function ($q) use ($requestBy) {
                    $q->where('name', $requestBy);
                })->first() ?? $userEmployee;
        }

        $hkDepartment = Department::where('name', 'Housekeeping')->first();
        $targetDepartmentId = $targetEmployee?->department_id ?? $hkDepartment?->id;
        $targetEmployeeId = $targetEmployee?->id;

        $cycleMonths = (int) ($validated['renewal_cycle_months'] ?? 3);
        $validFrom = Carbon::parse($validated['valid_from'])->startOfDay();
        $validUntil = $validFrom->copy()->addMonths($cycleMonths);

        $requestedAt = Carbon::now();
        $requestedByUsername = $user->name;

        $masterKeyRequest = MasterKeyRequest::create([
            'request_number' => MasterKeyRequest::generateRequestNumber(),
            'request_type' => $validated['request_type'],
            'request_by' => $requestBy,
            'employee_id' => $targetEmployeeId,
            'department_id' => $targetDepartmentId,
            'key_number' => $validated['key_number'],
            'key_type' => $validated['key_type'],
            'room_range_access' => $validated['room_range_access'],
            'valid_from' => $validFrom->toDateString(),
            'valid_until' => $validUntil->toDateString(),
            'renewal_cycle_months' => $cycleMonths,
            'remark' => $validated['remark'],
            'purpose' => $validated['purpose'] ?? $validated['remark'],
            'status' => 'On Request',
            'requested_by_user_id' => $user->id,
            'requested_by_username' => $requestedByUsername,
            'requested_at' => $requestedAt,
            'requester_signature' => $validated['requester_signature'] ?? null,
            'previous_request_id' => $validated['previous_request_id'] ?? null,
        ]);

        $typeLabels = [
            'create_new' => 'Create New (Kunci Baru)',
            'extension' => 'Extension (Perpanjangan 3 Bulan)',
            'replacement' => 'Replacement (Penggantian Kunci)',
        ];
        $typeLabel = $typeLabels[$validated['request_type']] ?? 'Permohonan Kunci';

        // Catat di Audit Log lengkap dengan username, nama pemegang, tanggal request, dan remark
        AuditLog::log([
            'action' => 'REQUEST_MASTER_KEY',
            'model_type' => MasterKeyRequest::class,
            'model_id' => $masterKeyRequest->id,
            'description' => "[{$typeLabel}] Diajukan oleh '{$requestBy}' (Akun: {$requestedByUsername}) pada " . $requestedAt->format('Y-m-d H:i:s') . ". Kunci: {$masterKeyRequest->key_number} ({$masterKeyRequest->request_number}). Remark: {$masterKeyRequest->remark}",
            'new_values' => $masterKeyRequest->toArray(),
        ]);

        // Send In-App Notification to Executive Housekeeper (HOD) and Admins
        $this->notifyApprovers($masterKeyRequest);

        return redirect()->route('master-keys.index')->with('success', "Form permohonan {$typeLabel} untuk master key {$masterKeyRequest->key_number} berhasil diajukan dengan status [On Request].");
    }

    /**
     * Mark master key request as DONE or update status.
     * Records username, done timestamp, notes, and audit log.
     */
    public function updateStatus(Request $request, MasterKeyRequest $masterKeyRequest)
    {
        if (!$this->ensureTableExists()) {
            return back()->with('error', 'Tabel master_key_requests belum tersedia di database. Silakan jalankan "php artisan migrate" di server terlebih dahulu.');
        }

        $user = Auth::user();
        $isSuperAdmin = $user->hasRole('Super Admin');
        $isHRD = $user->hasRole('HRD / Admin');
        $isGM = $user->hasRole('General Manager');
        $isHOD = $user->hasRole('Head of Department');
        $isSupervisor = $user->hasRole('Supervisor');
        $isHK = $user->employee?->department?->name === 'Housekeeping';

        $canApprove = $isSuperAdmin || $isHRD || $isGM || ($isHOD && $isHK) || ($isSupervisor && $isHK);

        if (!$canApprove) {
            return back()->with('error', 'Anda tidak memiliki hak akses untuk memproses permohonan ini.');
        }

        $validated = $request->validate([
            'status' => 'required|in:Done,On Request',
            'done_notes' => 'nullable|string|max:1000',
            'approver_signature' => 'nullable|string',
        ]);

        $oldStatus = $masterKeyRequest->status;
        $newStatus = $validated['status'];
        $now = Carbon::now();

        $updateData = [
            'status' => $newStatus,
        ];

        if ($newStatus === 'Done') {
            $updateData['done_by_user_id'] = $user->id;
            $updateData['done_by_username'] = $user->name;
            $updateData['done_at'] = $now;
            $updateData['done_notes'] = $validated['done_notes'] ?? 'Permohonan master key telah diproses dan diserahkan (Done).';
            if (!empty($validated['approver_signature'])) {
                $updateData['approver_signature'] = $validated['approver_signature'];
            }
        } else {
            // Revert back to On Request
            $updateData['done_by_user_id'] = null;
            $updateData['done_by_username'] = null;
            $updateData['done_at'] = null;
            $updateData['done_notes'] = null;
        }

        $masterKeyRequest->update($updateData);

        // Catat ke Audit Log lengkap dengan username penanggung jawab dan kapan done
        AuditLog::log([
            'action' => $newStatus === 'Done' ? 'DONE_MASTER_KEY' : 'REVERT_MASTER_KEY_STATUS',
            'model_type' => MasterKeyRequest::class,
            'model_id' => $masterKeyRequest->id,
            'description' => $newStatus === 'Done'
                ? "Permohonan master key {$masterKeyRequest->request_number} ditandai [DONE] oleh username '{$user->name}' pada " . $now->format('Y-m-d H:i:s') . ". Catatan: " . ($validated['done_notes'] ?? '-')
                : "Status permohonan {$masterKeyRequest->request_number} dikembalikan ke [On Request] oleh username '{$user->name}' pada " . $now->format('Y-m-d H:i:s') . ".",
            'old_values' => ['status' => $oldStatus],
            'new_values' => [
                'status' => $newStatus,
                'done_by_username' => $user->name,
                'done_at' => $now->toDateTimeString(),
                'done_notes' => $validated['done_notes'] ?? null,
            ],
        ]);

        // Send In-App Notification to Requester Employee
        if ($masterKeyRequest->employee?->user) {
            try {
                $masterKeyRequest->employee->user->notify(
                    new MasterKeyStatusNotification($masterKeyRequest, 'STATUS_UPDATED')
                );
            } catch (\Throwable $e) {
                // Continue gracefully
            }
        }

        $msg = $newStatus === 'Done'
            ? "Permohonan akses master key {$masterKeyRequest->request_number} berhasil diselesaikan (Status: Done)."
            : "Status permohonan {$masterKeyRequest->request_number} berhasil diubah ke On Request.";

        return back()->with('success', $msg);
    }

    /**
     * Export master key records to Excel-compatible CSV with full username and timestamps log.
     */
    public function export(Request $request): StreamedResponse
    {
        if (!$this->ensureTableExists()) {
            abort(404, 'Tabel master_key_requests belum tersedia di database. Silakan jalankan "php artisan migrate" di server terlebih dahulu.');
        }

        $user = Auth::user();
        $isSuperAdmin = $user->hasRole('Super Admin');
        $isHRD = $user->hasRole('HRD / Admin');
        $isGM = $user->hasRole('General Manager');
        $isHOD = $user->hasRole('Head of Department');
        $isSupervisor = $user->hasRole('Supervisor');

        $userEmployee = $user->employee;
        $isHK = $userEmployee?->department?->name === 'Housekeeping';

        $canApprove = $isSuperAdmin || $isHRD || $isGM || ($isHOD && $isHK);
        $canManageAll = $canApprove || ($isSupervisor && $isHK);

        $query = MasterKeyRequest::with([
            'employee.user',
            'employee.department',
            'employee.position',
            'requestedBy',
            'doneBy',
            'previousRequest',
        ])->latest();

        if (!$canManageAll) {
            $query->where('employee_id', $userEmployee?->id);
        }

        if ($search = $request->input('search')) {
            $query->where(function ($q) use ($search) {
                $q->where('request_number', 'like', "%{$search}%")
                    ->orWhere('key_number', 'like', "%{$search}%")
                    ->orWhere('remark', 'like', "%{$search}%")
                    ->orWhere('room_range_access', 'like', "%{$search}%")
                    ->orWhere('request_by', 'like', "%{$search}%")
                    ->orWhere('requested_by_username', 'like', "%{$search}%")
                    ->orWhere('done_by_username', 'like', "%{$search}%")
                    ->orWhereHas('employee.user', function ($sub) use ($search) {
                        $sub->where('name', 'like', "%{$search}%");
                    })
                    ->orWhereHas('employee', function ($sub) use ($search) {
                        $sub->where('employee_number', 'like', "%{$search}%");
                    });
            });
        }

        if ($keyType = $request->input('key_type')) {
            $query->where('key_type', $keyType);
        }

        if ($requestType = $request->input('request_type')) {
            $query->where('request_type', $requestType);
        }

        $tab = $request->input('tab', 'all');
        $today = Carbon::today()->toDateString();
        $fourteenDaysLater = Carbon::today()->addDays(14)->toDateString();

        if ($tab === 'on_request') {
            $query->where('status', 'On Request');
        } elseif ($tab === 'done') {
            $query->where('status', 'Done');
        } elseif ($tab === 'expiring') {
            $query->where('status', 'Done')->where('valid_until', '>=', $today)->where('valid_until', '<=', $fourteenDaysLater);
        } elseif ($tab === 'expired') {
            $query->where('status', 'Done')->where('valid_until', '<', $today);
        }

        $records = $query->get();
        $filename = 'Master_Key_Log_SwissBelinn_' . date('Ymd_His') . '.csv';

        $response = new StreamedResponse(function () use ($records) {
            $handle = fopen('php://output', 'w');

            // Add UTF-8 BOM for Microsoft Excel compatibility
            fprintf($handle, chr(0xEF) . chr(0xBB) . chr(0xBF));

            // Header row
            fputcsv($handle, [
                'No. Registrasi',
                'Tipe Form Permohonan',
                'Remark / Alasan Permohonan',
                'Status',
                'Diajukan oleh (Request by)',
                'Username Akun Pemohon',
                'Tanggal & Waktu Request',
                'Username Penyelesai (Done By)',
                'Kapan Done (Tanggal & Waktu)',
                'Catatan Selesai (Done Notes)',
                'NIK Pemegang',
                'Departemen',
                'Jabatan',
                'No. Kunci Master',
                'Tipe Kunci',
                'Cakupan Area Kamar',
                'Masa Berlaku Mulai',
                'Masa Berlaku Sampai (3 Bulan)',
                'Sisa Hari',
            ]);

            foreach ($records as $r) {
                fputcsv($handle, [
                    $r->request_number,
                    $r->request_type_label,
                    $r->remark ?? '-',
                    $r->status,
                    $r->request_by ?? ($r->employee?->user?->name ?? '-'),
                    $r->requested_by_username ?? ($r->requestedBy?->name ?? '-'),
                    $r->requested_at ? $r->requested_at->format('Y-m-d H:i:s') : $r->created_at->format('Y-m-d H:i:s'),
                    $r->done_by_username ?? ($r->doneBy?->name ?? '-'),
                    $r->done_at ? $r->done_at->format('Y-m-d H:i:s') : '-',
                    $r->done_notes ?? '-',
                    $r->employee?->employee_number ?? '-',
                    $r->employee?->department?->name ?? 'Housekeeping',
                    $r->employee?->position?->name ?? 'Room Attendant',
                    $r->key_number,
                    $r->key_type,
                    $r->room_range_access,
                    $r->valid_from->format('Y-m-d'),
                    $r->valid_until->format('Y-m-d'),
                    $r->status === 'Done' ? $r->days_remaining . ' hari' : '-',
                ]);
            }

            fclose($handle);
        });

        $response->headers->set('Content-Type', 'text/csv; charset=UTF-8');
        $response->headers->set('Content-Disposition', 'attachment; filename="' . $filename . '"');

        return $response;
    }

    /**
     * Display printable official hotel SOP form.
     */
    public function print(MasterKeyRequest $masterKeyRequest)
    {
        $masterKeyRequest->load([
            'employee.user',
            'employee.department',
            'employee.position',
            'employee.supervisor.user',
            'employee.supervisor.position',
            'requestedBy',
            'doneBy',
            'previousRequest',
            'auditLogs.user',
        ]);

        // Find Executive Housekeeper for signature section
        $hkDept = Department::where('name', 'Housekeeping')->first();
        $hodHK = Employee::with(['user', 'position'])
            ->where('department_id', $hkDept?->id)
            ->whereHas('user.roles', function ($q) {
                $q->where('name', 'Head of Department');
            })
            ->first();

        return Inertia::render('MasterKey/Print', [
            'requestData' => $masterKeyRequest,
            'hodHK' => $hodHK,
        ]);
    }

    /**
     * Remove the specified request from storage.
     */
    public function destroy(MasterKeyRequest $masterKeyRequest)
    {
        $user = Auth::user();
        $isSuperAdmin = $user->hasRole('Super Admin');
        $isOwner = $user->employee && $masterKeyRequest->employee_id === $user->employee->id;

        if (!$isSuperAdmin && !($isOwner && $masterKeyRequest->status === 'On Request')) {
            return back()->with('error', 'Anda tidak memiliki hak untuk menghapus permohonan ini.');
        }

        $reqNumber = $masterKeyRequest->request_number;
        $masterKeyRequest->delete();

        AuditLog::log([
            'action' => 'DELETE_MASTER_KEY_REQUEST',
            'model_type' => MasterKeyRequest::class,
            'model_id' => $masterKeyRequest->id,
            'description' => "Permohonan master key {$reqNumber} telah dihapus oleh username '{$user->name}'.",
        ]);

        return back()->with('success', "Permohonan {$reqNumber} berhasil dihapus.");
    }

    /**
     * Helper to notify approvers when a new request is submitted.
     */
    protected function notifyApprovers(MasterKeyRequest $request): void
    {
        try {
            $hkDept = Department::where('name', 'Housekeeping')->first();

            $approvers = User::whereHas('roles', function ($q) {
                $q->whereIn('name', ['Head of Department', 'HRD / Admin', 'Super Admin', 'Supervisor']);
            })->where(function ($q) use ($hkDept) {
                $q->whereHas('employee', function ($sub) use ($hkDept) {
                    $sub->where('department_id', $hkDept?->id);
                })->orWhereHas('roles', function ($sub) {
                    $sub->whereIn('name', ['HRD / Admin', 'Super Admin']);
                });
            })->get();

            foreach ($approvers as $approver) {
                $approver->notify(new MasterKeyStatusNotification($request, 'NEW_REQUEST'));
            }
        } catch (\Throwable $e) {
            // Silently continue
        }
    }
}
