<?php

namespace Database\Seeders;

use App\Models\Department;
use App\Models\Employee;
use App\Models\PowerProRequest;
use App\Models\User;
use Carbon\Carbon;
use Illuminate\Database\Seeder;

class PowerProRequestSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        if (PowerProRequest::count() > 0) {
            return;
        }

        $adminUser = User::where('email', 'admin@swissbelhotel.com')->first();
        $itStaff = Employee::whereHas('department', fn($q) => $q->where('name', 'IT'))->first();
        $foStaff = Employee::whereHas('department', fn($q) => $q->where('name', 'Front Office'))->first();
        $fbStaff = Employee::whereHas('department', fn($q) => $q->where('name', 'Food & Beverage'))->first();
        $hkStaff = Employee::whereHas('department', fn($q) => $q->where('name', 'Housekeeping'))->first();
        $accStaff = Employee::whereHas('department', fn($q) => $q->where('name', 'Accounting'))->first();

        // 1. Selesai (Done) - Front Office Receptionist
        if ($foStaff) {
            PowerProRequest::create([
                'request_number' => 'PPR-202610-0001',
                'request_type' => 'create_new',
                'employee_id' => $foStaff->id,
                'department_id' => $foStaff->department_id,
                'employment_status' => 'Permanent',
                'system_type' => 'Power Pro PMS',
                'power_pro_modules' => ['Front Office', 'Point of Sales (POS)'],
                'access_level' => 'Operator / Front Desk Agent',
                'special_privileges' => ['Reprint Receipt / Folio'],
                'proposed_username' => 'FO_RECEP_01',
                'reason' => 'Karyawan baru posisi Receptionist Shift Pagi/Sore, memerlukan akses check-in, check-out dan folio tamu.',
                'status' => 'Done',
                'requested_by_user_id' => $foStaff->user_id ?? $adminUser?->id,
                'requested_by_username' => $foStaff->user?->name ?? 'Front Office Staff',
                'requested_at' => Carbon::now()->subDays(5),
                'approved_by_user_id' => $adminUser?->id,
                'approved_by_username' => 'Front Office Manager',
                'approved_at' => Carbon::now()->subDays(4),
                'approval_notes' => 'Disetujui. Akun diperlukan segera untuk persiapan operasional.',
                'processed_by_user_id' => $itStaff?->user_id ?? $adminUser?->id,
                'processed_by_username' => $itStaff?->user?->name ?? 'IT Officer',
                'processed_at' => Carbon::now()->subDays(3),
                'created_user_id' => 'FO_RECEP_01',
                'it_notes' => 'User ID telah dibuat di Power Pro PMS Terminal FO Desk 1 & 2. Password default telah diserahkan secara tertutup.',
            ]);
        }

        // 2. Approved (Menunggu Eksekusi IT) - F&B Service Waiter / Cashier
        if ($fbStaff) {
            PowerProRequest::create([
                'request_number' => 'PPR-202610-0002',
                'request_type' => 'create_new',
                'employee_id' => $fbStaff->id,
                'department_id' => $fbStaff->department_id,
                'employment_status' => 'Contract',
                'system_type' => 'Power Pro PMS',
                'power_pro_modules' => ['Point of Sales (POS)'],
                'access_level' => 'Cashier / Order Taker',
                'special_privileges' => ['Open Cash Drawer', 'Reprint Receipt / Folio'],
                'proposed_username' => 'POS_RESTO_01',
                'reason' => 'Penugasan sebagai kasir Restoran BaReLo Shift Siang/Malam.',
                'status' => 'Approved',
                'requested_by_user_id' => $fbStaff->user_id ?? $adminUser?->id,
                'requested_by_username' => $fbStaff->user?->name ?? 'F&B Staff',
                'requested_at' => Carbon::now()->subDays(2),
                'approved_by_user_id' => $adminUser?->id,
                'approved_by_username' => 'F&B Manager',
                'approved_at' => Carbon::now()->subDay(),
                'approval_notes' => 'Disetujui. Mohon IT segera terbitkan User ID POS kasir.',
            ]);
        }

        // 3. On Request (Menunggu Approval HOD) - Housekeeping Room Status
        if ($hkStaff) {
            PowerProRequest::create([
                'request_number' => 'PPR-202610-0003',
                'request_type' => 'modify_access',
                'employee_id' => $hkStaff->id,
                'department_id' => $hkStaff->department_id,
                'employment_status' => 'Permanent',
                'system_type' => 'Power Pro PMS',
                'power_pro_modules' => ['Housekeeping'],
                'access_level' => 'Supervisor',
                'special_privileges' => [],
                'proposed_username' => 'HK_SPV_01',
                'reason' => 'Promosi menjadi Housekeeping Supervisor. Memerlukan hak update status kamar (VC/VD/OOO) dan inventory linen.',
                'status' => 'On Request',
                'requested_by_user_id' => $hkStaff->user_id ?? $adminUser?->id,
                'requested_by_username' => $hkStaff->user?->name ?? 'Housekeeping Staff',
                'requested_at' => Carbon::now()->subHours(8),
            ]);
        }

        // 4. Selesai (Done) - Accounting AR / Night Audit
        if ($accStaff) {
            PowerProRequest::create([
                'request_number' => 'PPR-202610-0004',
                'request_type' => 'create_new',
                'employee_id' => $accStaff->id,
                'department_id' => $accStaff->department_id,
                'employment_status' => 'Permanent',
                'system_type' => 'Power Pro PMS',
                'power_pro_modules' => ['Accounting / Back Office', 'Front Office'],
                'access_level' => 'Income Auditor / Night Auditor',
                'special_privileges' => ['Night Audit Posting', 'Rate Change Override', 'Void / Cancel Transaction'],
                'proposed_username' => 'ACC_AUDIT_01',
                'reason' => 'Petugas Night Audit harian untuk closing transaksi hotel dan posting jurnal harian.',
                'status' => 'Done',
                'requested_by_user_id' => $accStaff->user_id ?? $adminUser?->id,
                'requested_by_username' => $accStaff->user?->name ?? 'Accounting Staff',
                'requested_at' => Carbon::now()->subWeeks(2),
                'approved_by_user_id' => $adminUser?->id,
                'approved_by_username' => 'Accounting Manager',
                'approved_at' => Carbon::now()->subWeeks(2)->addHours(4),
                'approval_notes' => 'Disetujui. Memiliki kewenangan audit dan closing harian.',
                'processed_by_user_id' => $itStaff?->user_id ?? $adminUser?->id,
                'processed_by_username' => $itStaff?->user?->name ?? 'IT Officer',
                'processed_at' => Carbon::now()->subWeeks(2)->addDay(),
                'created_user_id' => 'ACC_AUDIT_01',
                'it_notes' => 'Hak akses modul Back Office dan Night Audit telah diaktifkan dengan otoritas posting jurnal.',
            ]);
        }
    }
}
