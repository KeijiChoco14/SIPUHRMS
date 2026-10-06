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
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;
use Symfony\Component\HttpFoundation\StreamedResponse;

class MasterKeyRequestController extends Controller
{
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

        $query = MasterKeyRequest::with([
            'employee.user',
            'employee.department',
            'employee.position',
            'approver',
            'previousRequest',
        ])->latest();

        // If regular employee (Room Attendant / non-management), show their own requests
        if (!$canManageAll) {
            $query->where('employee_id', $userEmployee?->id);
        }

        // Search filter
        if ($search = $request->input('search')) {
            $query->where(function ($q) use ($search) {
                $q->where('request_number', 'like', "%{$search}%")
                    ->orWhere('key_number', 'like', "%{$search}%")
                    ->orWhere('room_range_access', 'like', "%{$search}%")
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

        // Tab status filter
        $tab = $request->input('tab', 'all');
        $today = Carbon::today()->toDateString();
        $fourteenDaysLater = Carbon::today()->addDays(14)->toDateString();

        if ($tab === 'pending') {
            $query->where('status', 'Pending');
        } elseif ($tab === 'active') {
            $query->where('status', 'Approved')
                ->where('valid_until', '>=', $today);
        } elseif ($tab === 'expiring') {
            $query->where('status', 'Approved')
                ->where('valid_until', '>=', $today)
                ->where('valid_until', '<=', $fourteenDaysLater);
        } elseif ($tab === 'expired') {
            $query->where('status', 'Approved')
                ->where('valid_until', '<', $today);
        } elseif ($tab === 'history') {
            $query->whereIn('status', ['Rejected', 'Revoked']);
        }

        $requests = $query->paginate(15)->withQueryString();

        // Compute overall statistics based on scope
        $statsBaseQuery = MasterKeyRequest::query();
        if (!$canManageAll) {
            $statsBaseQuery->where('employee_id', $userEmployee?->id);
        }

        $totalKeys = (clone $statsBaseQuery)->count();
        $pendingApprovals = (clone $statsBaseQuery)->where('status', 'Pending')->count();
        $activeKeys = (clone $statsBaseQuery)->where('status', 'Approved')->where('valid_until', '>=', $today)->count();
        $expiringSoon = (clone $statsBaseQuery)->where('status', 'Approved')->where('valid_until', '>=', $today)->where('valid_until', '<=', $fourteenDaysLater)->count();
        $expiredKeys = (clone $statsBaseQuery)->where('status', 'Approved')->where('valid_until', '<', $today)->count();

        // Housekeeping employees list for selection
        $hkDepartment = Department::where('name', 'Housekeeping')->first();
        $hkEmployees = Employee::with(['user', 'position'])
            ->where('department_id', $hkDepartment?->id)
            ->get();

        return Inertia::render('MasterKey/Index', [
            'requests' => $requests,
            'filters' => [
                'tab' => $tab,
                'search' => $search ?? '',
                'key_type' => $keyType ?? '',
            ],
            'stats' => [
                'total' => $totalKeys,
                'pending' => $pendingApprovals,
                'active' => $activeKeys,
                'expiring_soon' => $expiringSoon,
                'expired' => $expiredKeys,
            ],
            'canApprove' => $canApprove,
            'canManageAll' => $canManageAll,
            'currentEmployee' => $userEmployee?->load(['department', 'position']),
            'hkEmployees' => $hkEmployees,
            'defaultKeyTypes' => [
                'Floor Master Key',
                'Section Master Key',
                'Room Attendant Master',
                'Grand Master Key',
                'Emergency Key',
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
     * Store a newly created master key access request.
     */
    public function store(Request $request)
    {
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
            'key_number' => 'required|string|max:50',
            'key_type' => 'required|string|max:100',
            'room_range_access' => 'required|string|max:255',
            'valid_from' => 'required|date',
            'renewal_cycle_months' => 'nullable|integer|min:1|max:12',
            'purpose' => 'required|string|max:1000',
            'requester_signature' => 'nullable|string',
        ];

        if ($canManageAll) {
            $rules['employee_id'] = 'required|exists:employees,id';
        }

        $validated = $request->validate($rules);

        $targetEmployeeId = $canManageAll && !empty($validated['employee_id'])
            ? $validated['employee_id']
            : $userEmployee?->id;

        if (!$targetEmployeeId) {
            return back()->with('error', 'Karyawan tidak ditemukan. Pastikan akun Anda terhubung dengan data karyawan.');
        }

        $targetEmployee = Employee::with('department')->findOrFail($targetEmployeeId);

        $cycleMonths = (int) ($validated['renewal_cycle_months'] ?? 3);
        $validFrom = Carbon::parse($validated['valid_from'])->startOfDay();
        $validUntil = $validFrom->copy()->addMonths($cycleMonths);

        $masterKeyRequest = MasterKeyRequest::create([
            'request_number' => MasterKeyRequest::generateRequestNumber(),
            'employee_id' => $targetEmployee->id,
            'department_id' => $targetEmployee->department_id,
            'key_number' => $validated['key_number'],
            'key_type' => $validated['key_type'],
            'room_range_access' => $validated['room_range_access'],
            'valid_from' => $validFrom->toDateString(),
            'valid_until' => $validUntil->toDateString(),
            'renewal_cycle_months' => $cycleMonths,
            'purpose' => $validated['purpose'],
            'requester_signature' => $validated['requester_signature'] ?? null,
            'status' => 'Pending',
        ]);

        AuditLog::log([
            'action' => 'CREATE_MASTER_KEY_REQUEST',
            'model_type' => MasterKeyRequest::class,
            'model_id' => $masterKeyRequest->id,
            'description' => "Pengajuan akses master key {$masterKeyRequest->key_number} ({$masterKeyRequest->request_number}) untuk karyawan {$targetEmployee->user?->name}.",
            'new_values' => $masterKeyRequest->toArray(),
        ]);

        // Send In-App Notification to Executive Housekeeper (HOD) and Admins
        $this->notifyApprovers($masterKeyRequest);

        return redirect()->route('master-keys.index')->with('success', 'Form permohonan akses master key 3 bulan berhasil diajukan dan menunggu persetujuan.');
    }

    /**
     * Quick renew (Perpanjang 3 Bulan) for an existing master key.
     */
    public function renew(Request $request, MasterKeyRequest $masterKeyRequest)
    {
        $user = Auth::user();
        $userEmployee = $user->employee;
        $isSuperAdmin = $user->hasRole('Super Admin');
        $isHRD = $user->hasRole('HRD / Admin');
        $isGM = $user->hasRole('General Manager');
        $isHOD = $user->hasRole('Head of Department');
        $isSupervisor = $user->hasRole('Supervisor');
        $isHK = $userEmployee?->department?->name === 'Housekeeping';

        $canManageAll = $isSuperAdmin || $isHRD || $isGM || ($isHOD && $isHK) || ($isSupervisor && $isHK);
        $isOwner = $userEmployee && $masterKeyRequest->employee_id === $userEmployee->id;

        if (!$canManageAll && !$isOwner) {
            return back()->with('error', 'Anda tidak memiliki otorisasi untuk memperpanjang kunci ini.');
        }

        $validated = $request->validate([
            'purpose' => 'nullable|string|max:1000',
            'requester_signature' => 'nullable|string',
        ]);

        // Calculate new renewal period (3 months)
        $previousUntil = Carbon::parse($masterKeyRequest->valid_until);
        $today = Carbon::today();

        // If still active or close to expiring, start right after previous expiration
        $newValidFrom = $previousUntil->isPast() ? $today : $previousUntil->copy()->addDay();
        $newValidUntil = $newValidFrom->copy()->addMonths(3);

        $defaultPurpose = "Perpanjangan berkala 3 bulan akses master key {$masterKeyRequest->key_number} (Ref: {$masterKeyRequest->request_number}).";
        $purpose = $validated['purpose'] ?? $defaultPurpose;

        $newRequest = MasterKeyRequest::create([
            'request_number' => MasterKeyRequest::generateRequestNumber(),
            'employee_id' => $masterKeyRequest->employee_id,
            'department_id' => $masterKeyRequest->department_id,
            'key_number' => $masterKeyRequest->key_number,
            'key_type' => $masterKeyRequest->key_type,
            'room_range_access' => $masterKeyRequest->room_range_access,
            'valid_from' => $newValidFrom->toDateString(),
            'valid_until' => $newValidUntil->toDateString(),
            'renewal_cycle_months' => 3,
            'purpose' => $purpose,
            'requester_signature' => $validated['requester_signature'] ?? $masterKeyRequest->requester_signature,
            'status' => 'Pending',
            'previous_request_id' => $masterKeyRequest->id,
        ]);

        AuditLog::log([
            'action' => 'RENEW_MASTER_KEY_REQUEST',
            'model_type' => MasterKeyRequest::class,
            'model_id' => $newRequest->id,
            'description' => "Pengajuan perpanjangan 3 bulan master key {$newRequest->key_number} ({$newRequest->request_number}) dari permohonan sebelumnya ({$masterKeyRequest->request_number}).",
            'new_values' => $newRequest->toArray(),
        ]);

        // Send In-App Notification to Executive Housekeeper and Admins
        $this->notifyApprovers($newRequest);

        return redirect()->route('master-keys.index')->with('success', "Permohonan perpanjangan 3 bulan untuk kunci {$masterKeyRequest->key_number} berhasil diajukan ({$newRequest->request_number}).");
    }

    /**
     * Update request status (Approve, Reject, Revoke).
     */
    public function updateStatus(Request $request, MasterKeyRequest $masterKeyRequest)
    {
        $user = Auth::user();
        $isSuperAdmin = $user->hasRole('Super Admin');
        $isHRD = $user->hasRole('HRD / Admin');
        $isGM = $user->hasRole('General Manager');
        $isHOD = $user->hasRole('Head of Department');
        $isHK = $user->employee?->department?->name === 'Housekeeping';

        $canApprove = $isSuperAdmin || $isHRD || $isGM || ($isHOD && $isHK);

        if (!$canApprove) {
            return back()->with('error', 'Anda tidak memiliki hak akses untuk menyetujui permohonan ini.');
        }

        $validated = $request->validate([
            'status' => 'required|in:Approved,Rejected,Revoked',
            'notes' => 'nullable|string|max:1000',
            'approver_signature' => 'nullable|string',
        ]);

        $oldStatus = $masterKeyRequest->status;
        $status = $validated['status'];

        $updateData = [
            'status' => $status,
            'approved_by' => $user->id,
            'approved_at' => Carbon::now(),
        ];

        if (!empty($validated['approver_signature'])) {
            $updateData['approver_signature'] = $validated['approver_signature'];
        }

        if ($status === 'Approved') {
            $updateData['approval_notes'] = $validated['notes'] ?? 'Disetujui untuk perpanjangan operasional housekeeping 3 bulan.';
            $updateData['rejection_reason'] = null;
        } elseif ($status === 'Rejected') {
            $updateData['rejection_reason'] = $validated['notes'] ?? 'Permohonan ditolak.';
        } elseif ($status === 'Revoked') {
            $updateData['approval_notes'] = $validated['notes'] ?? 'Akses dicabut / kunci telah dikembalikan ke Housekeeping.';
        }

        $masterKeyRequest->update($updateData);

        AuditLog::log([
            'action' => 'UPDATE_MASTER_KEY_STATUS',
            'model_type' => MasterKeyRequest::class,
            'model_id' => $masterKeyRequest->id,
            'description' => "Status permohonan master key {$masterKeyRequest->request_number} diubah dari {$oldStatus} menjadi {$status} oleh {$user->name}.",
            'old_values' => ['status' => $oldStatus],
            'new_values' => ['status' => $status, 'notes' => $validated['notes'] ?? null],
        ]);

        // Send In-App Notification to Requester Employee
        if ($masterKeyRequest->employee?->user) {
            try {
                $masterKeyRequest->employee->user->notify(
                    new MasterKeyStatusNotification($masterKeyRequest, 'STATUS_UPDATED')
                );
            } catch (\Throwable $e) {
                // Log and continue gracefully
            }
        }

        $statusLabel = [
            'Approved' => 'disetujui',
            'Rejected' => 'ditolak',
            'Revoked' => 'dicabut/dikembalikan',
        ][$status] ?? 'diperbarui';

        return back()->with('success', "Permohonan akses master key {$masterKeyRequest->request_number} telah {$statusLabel}.");
    }

    /**
     * Export master key records to Excel-compatible CSV.
     */
    public function export(Request $request): StreamedResponse
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

        $query = MasterKeyRequest::with([
            'employee.user',
            'employee.department',
            'employee.position',
            'approver',
            'previousRequest',
        ])->latest();

        if (!$canManageAll) {
            $query->where('employee_id', $userEmployee?->id);
        }

        if ($search = $request->input('search')) {
            $query->where(function ($q) use ($search) {
                $q->where('request_number', 'like', "%{$search}%")
                    ->orWhere('key_number', 'like', "%{$search}%")
                    ->orWhere('room_range_access', 'like', "%{$search}%")
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

        $tab = $request->input('tab', 'all');
        $today = Carbon::today()->toDateString();
        $fourteenDaysLater = Carbon::today()->addDays(14)->toDateString();

        if ($tab === 'pending') {
            $query->where('status', 'Pending');
        } elseif ($tab === 'active') {
            $query->where('status', 'Approved')->where('valid_until', '>=', $today);
        } elseif ($tab === 'expiring') {
            $query->where('status', 'Approved')->where('valid_until', '>=', $today)->where('valid_until', '<=', $fourteenDaysLater);
        } elseif ($tab === 'expired') {
            $query->where('status', 'Approved')->where('valid_until', '<', $today);
        } elseif ($tab === 'history') {
            $query->whereIn('status', ['Rejected', 'Revoked']);
        }

        $records = $query->get();
        $filename = 'Rekap_Akses_Master_Key_SwissBelinn_' . date('Ymd_His') . '.csv';

        $response = new StreamedResponse(function () use ($records) {
            $handle = fopen('php://output', 'w');

            // Add UTF-8 BOM for Microsoft Excel compatibility
            fprintf($handle, chr(0xEF) . chr(0xBB) . chr(0xBF));

            // Header row
            fputcsv($handle, [
                'No. Registrasi',
                'Tanggal Pengajuan',
                'NIK Karyawan',
                'Nama Pemegang',
                'Departemen',
                'Jabatan',
                'No. Kunci Master',
                'Tipe Kunci',
                'Cakupan Area & Nomor Kamar',
                'Tanggal Mulai Berlaku',
                'Tanggal Berakhir (Jatuh Tempo)',
                'Siklus Evaluasi',
                'Status Akses',
                'Sisa Hari Masa Aktif',
                'Pejabat Penyetujui',
                'Tanggal Persetujuan',
                'Catatan Persetujuan / Alasan Penolakan',
                'Keperluan Pengajuan',
            ]);

            foreach ($records as $r) {
                fputcsv($handle, [
                    $r->request_number,
                    $r->created_at->format('Y-m-d H:i'),
                    $r->employee?->employee_number ?? '-',
                    $r->employee?->user?->name ?? '-',
                    $r->employee?->department?->name ?? 'Housekeeping',
                    $r->employee?->position?->name ?? 'Room Attendant',
                    $r->key_number,
                    $r->key_type,
                    $r->room_range_access,
                    $r->valid_from->format('Y-m-d'),
                    $r->valid_until->format('Y-m-d'),
                    $r->renewal_cycle_months . ' Bulan Sekali',
                    $r->computed_status,
                    $r->status === 'Approved' ? $r->days_remaining . ' hari' : '-',
                    $r->approver?->name ?? '-',
                    $r->approved_at ? $r->approved_at->format('Y-m-d H:i') : '-',
                    $r->approval_notes ?: ($r->rejection_reason ?: '-'),
                    $r->purpose,
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
            'approver.employee.position',
            'previousRequest',
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

        if (!$isSuperAdmin && !($isOwner && $masterKeyRequest->status === 'Pending')) {
            return back()->with('error', 'Anda tidak memiliki hak untuk menghapus permohonan ini.');
        }

        $reqNumber = $masterKeyRequest->request_number;
        $masterKeyRequest->delete();

        AuditLog::log([
            'action' => 'DELETE_MASTER_KEY_REQUEST',
            'model_type' => MasterKeyRequest::class,
            'model_id' => $masterKeyRequest->id,
            'description' => "Permohonan master key {$reqNumber} telah dihapus.",
        ]);

        return back()->with('success', "Permohonan {$reqNumber} berhasil dihapus.");
    }

    /**
     * Helper to notify approvers when a new or renewed request is submitted.
     */
    protected function notifyApprovers(MasterKeyRequest $request): void
    {
        try {
            $hkDept = Department::where('name', 'Housekeeping')->first();

            // Notify Executive Housekeeper (Head of Department) & Admins
            $approvers = User::whereHas('roles', function ($q) {
                $q->whereIn('name', ['Head of Department', 'HRD / Admin', 'Super Admin']);
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
            // Silently continue if notification fails
        }
    }
}
