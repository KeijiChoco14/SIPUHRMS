<?php

namespace Database\Seeders;

use App\Models\AuditLog;
use App\Models\Department;
use App\Models\Employee;
use App\Models\MasterKeyRequest;
use App\Models\User;
use Carbon\Carbon;
use Illuminate\Database\Seeder;

class MasterKeyRequestSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $hkDept = Department::where('name', 'Housekeeping')->first();
        if (!$hkDept) {
            return;
        }

        $hodHK = Employee::with('user')->where('department_id', $hkDept->id)->whereHas('user.roles', function ($q) {
            $q->where('name', 'Head of Department');
        })->first();

        $supHK = Employee::with('user')->where('department_id', $hkDept->id)->whereHas('user.roles', function ($q) {
            $q->where('name', 'Supervisor');
        })->first();

        $staffHKList = Employee::with('user')->where('department_id', $hkDept->id)->whereHas('user.roles', function ($q) {
            $q->where('name', 'Staff / Employee');
        })->get();

        $adminUser = User::where('email', 'admin@swissbelhotel.com')->first() ?? User::first();
        $hodUser = $hodHK?->user ?? $adminUser;

        $today = Carbon::today();

        // 1. Extension (Done) - Yuni Rahayu
        $yuni = $staffHKList->firstWhere('employee_number', 'SBH-110') ?? $staffHKList->first();
        if ($yuni) {
            $validFrom = $today->copy()->subMonth();
            $validUntil = $validFrom->copy()->addMonths(3);

            $m1 = MasterKeyRequest::updateOrCreate(
                ['request_number' => 'MKR-' . date('Ym') . '-0001'],
                [
                    'request_type' => 'extension',
                    'request_by' => $yuni->user?->name ?? 'Yuni Rahayu',
                    'employee_id' => $yuni->id,
                    'department_id' => $hkDept->id,
                    'key_number' => 'MK-HK-201',
                    'key_type' => 'Floor Key',
                    'room_range_access' => 'Lantai 2 (Kamar 201 - 240)',
                    'valid_from' => $validFrom->toDateString(),
                    'valid_until' => $validUntil->toDateString(),
                    'renewal_cycle_months' => 3,
                    'remark' => 'Perpanjangan berkala 3 bulan akses master key Lantai 2 untuk operasional pembersihan rutin triwulan berjalan.',
                    'purpose' => 'Pembersihan harian kamar tamu, pergantian linen, dan make up room Lantai 2.',
                    'status' => 'Done',
                    'requested_by_user_id' => $yuni->user?->id ?? $adminUser?->id,
                    'requested_by_username' => $yuni->user?->name ?? 'Yuni Rahayu',
                    'requested_at' => $validFrom->copy()->subDay(),
                    'done_by_user_id' => $hodUser?->id,
                    'done_by_username' => $hodUser?->name ?? 'Dewi Kartika (EHK)',
                    'done_at' => $validFrom->copy()->addHours(2),
                    'done_notes' => 'Disetujui dan fisik master key diserahkan untuk perpanjangan triwulan.',
                ]
            );

            AuditLog::firstOrCreate([
                'action' => 'REQUEST_MASTER_KEY',
                'model_type' => MasterKeyRequest::class,
                'model_id' => $m1->id,
            ], [
                'user_id' => $yuni->user?->id ?? $adminUser?->id,
                'description' => "[Extension (Perpanjangan 3 Bulan)] Diajukan oleh '{$m1->request_by}' (Username: '{$m1->requested_by_username}') pada {$m1->requested_at}. Kunci: MK-HK-201. Remark: {$m1->remark}",
                'ip_address' => '127.0.0.1',
            ]);

            AuditLog::firstOrCreate([
                'action' => 'DONE_MASTER_KEY',
                'model_type' => MasterKeyRequest::class,
                'model_id' => $m1->id,
            ], [
                'user_id' => $hodUser?->id,
                'description' => "Permohonan master key {$m1->request_number} ditandai [DONE] oleh username '{$m1->done_by_username}' pada {$m1->done_at}. Catatan: {$m1->done_notes}",
                'ip_address' => '127.0.0.1',
            ]);
        }

        // 2. Replacement (Done - Expiring Soon) - Tono Sugiarto (Penggantian Kunci Chip Rusak)
        $tono = $staffHKList->firstWhere('employee_number', 'SBH-111') ?? ($staffHKList->count() > 1 ? $staffHKList[1] : null);
        if ($tono) {
            $validUntil = $today->copy()->addDays(5);
            $validFrom = $validUntil->copy()->subMonths(3);

            $m2 = MasterKeyRequest::updateOrCreate(
                ['request_number' => 'MKR-' . date('Ym') . '-0002'],
                [
                    'request_type' => 'replacement',
                    'request_by' => $tono->user?->name ?? 'Tono Sugiarto',
                    'employee_id' => $tono->id,
                    'department_id' => $hkDept->id,
                    'key_number' => 'MK-HK-301-B',
                    'key_type' => 'Floor Key',
                    'room_range_access' => 'Lantai 3 (Kamar 301 - 340)',
                    'valid_from' => $validFrom->toDateString(),
                    'valid_until' => $validUntil->toDateString(),
                    'renewal_cycle_months' => 3,
                    'remark' => 'Penggantian kartu RFID master key lama yang chip sensornya retak/tidak terbaca di kamar 312 & 318.',
                    'purpose' => 'Akses rutin pembersihan kamar dan turn-down service Lantai 3.',
                    'status' => 'Done',
                    'requested_by_user_id' => $tono->user?->id ?? $adminUser?->id,
                    'requested_by_username' => $tono->user?->name ?? 'Tono Sugiarto',
                    'requested_at' => $validFrom->copy()->subHours(5),
                    'done_by_user_id' => $hodUser?->id,
                    'done_by_username' => $hodUser?->name ?? 'Dewi Kartika (EHK)',
                    'done_at' => $validFrom->copy()->addHours(1),
                    'done_notes' => 'Kartu RFID lama ditarik dan dimusnahkan. Kartu pengganti MK-HK-301-B diserahkan.',
                ]
            );

            AuditLog::firstOrCreate([
                'action' => 'REQUEST_MASTER_KEY',
                'model_type' => MasterKeyRequest::class,
                'model_id' => $m2->id,
            ], [
                'user_id' => $tono->user?->id ?? $adminUser?->id,
                'description' => "[Replacement (Penggantian Kunci)] Diajukan oleh '{$m2->request_by}' (Username: '{$m2->requested_by_username}') pada {$m2->requested_at}. Kunci: MK-HK-301-B. Remark: {$m2->remark}",
                'ip_address' => '127.0.0.1',
            ]);
        }

        // 3. Create New (On Request) - Lestari Putri (Supervisor)
        if ($supHK) {
            $validFrom = $today;
            $validUntil = $validFrom->copy()->addMonths(3);

            $m3 = MasterKeyRequest::updateOrCreate(
                ['request_number' => 'MKR-' . date('Ym') . '-0003'],
                [
                    'request_type' => 'create_new',
                    'request_by' => $supHK->user?->name ?? 'Lestari Putri',
                    'employee_id' => $supHK->id,
                    'department_id' => $hkDept->id,
                    'key_number' => 'MK-HK-02',
                    'key_type' => 'Master Key',
                    'room_range_access' => 'Lantai 2 - 3 (Kamar 201 - 340)',
                    'valid_from' => $validFrom->toDateString(),
                    'valid_until' => $validUntil->toDateString(),
                    'renewal_cycle_months' => 3,
                    'remark' => 'Penambahan akses Master Key baru sehubungan dengan mutasi jadwal supervisi shift pagi & siang area lantai 2-3.',
                    'purpose' => 'Supervisi, inspeksi kebersihan kamar check-out, dan cross check room attendant shift pagi & siang.',
                    'status' => 'On Request',
                    'requested_by_user_id' => $supHK->user?->id ?? $adminUser?->id,
                    'requested_by_username' => $supHK->user?->name ?? 'Lestari Putri',
                    'requested_at' => $today->copy()->setTime(9, 15),
                    'done_by_user_id' => null,
                    'done_by_username' => null,
                    'done_at' => null,
                    'done_notes' => null,
                ]
            );

            AuditLog::firstOrCreate([
                'action' => 'REQUEST_MASTER_KEY',
                'model_type' => MasterKeyRequest::class,
                'model_id' => $m3->id,
            ], [
                'user_id' => $supHK->user?->id ?? $adminUser?->id,
                'description' => "[Create New (Kunci Baru)] Diajukan oleh username '{$m3->requested_by_username}' pada {$m3->requested_at}. Kunci: SMK-HK-02. Remark: {$m3->remark}",
                'ip_address' => '127.0.0.1',
            ]);
        }
    }
}
