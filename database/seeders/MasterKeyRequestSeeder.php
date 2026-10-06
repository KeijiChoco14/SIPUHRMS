<?php

namespace Database\Seeders;

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

        $adminUser = User::where('email', 'admin@swissbelhotel.com')->first();
        $hodUser = $hodHK?->user ?? $adminUser;

        $today = Carbon::today();

        // 1. Active Key (Yuni Rahayu) - renewed 1 month ago, valid for 2 more months
        $yuni = $staffHKList->firstWhere('employee_number', 'SBH-110') ?? $staffHKList->first();
        if ($yuni) {
            $validFrom = $today->copy()->subMonth();
            $validUntil = $validFrom->copy()->addMonths(3);

            MasterKeyRequest::firstOrCreate(
                ['request_number' => 'MKR-' . date('Ym') . '-0001'],
                [
                    'employee_id' => $yuni->id,
                    'department_id' => $hkDept->id,
                    'key_number' => 'MK-HK-201',
                    'key_type' => 'Floor Master Key',
                    'room_range_access' => 'Lantai 2 (Kamar 201 - 240)',
                    'valid_from' => $validFrom->toDateString(),
                    'valid_until' => $validUntil->toDateString(),
                    'renewal_cycle_months' => 3,
                    'purpose' => 'Pembersihan harian kamar tamu, pergantian linen, dan make up room Lantai 2.',
                    'status' => 'Approved',
                    'approved_by' => $hodUser?->id,
                    'approved_at' => $validFrom->copy()->addHours(2),
                    'approval_notes' => 'Disetujui untuk perpanjangan akses operasional rutin 3 bulan (Q4).',
                ]
            );
        }

        // 2. Expiring Soon Key (Tono Sugiarto) - 5 days remaining, requires renewal!
        $tono = $staffHKList->firstWhere('employee_number', 'SBH-111') ?? ($staffHKList->count() > 1 ? $staffHKList[1] : null);
        if ($tono) {
            $validUntil = $today->copy()->addDays(5);
            $validFrom = $validUntil->copy()->subMonths(3);

            MasterKeyRequest::firstOrCreate(
                ['request_number' => 'MKR-' . date('Ym') . '-0002'],
                [
                    'employee_id' => $tono->id,
                    'department_id' => $hkDept->id,
                    'key_number' => 'MK-HK-301',
                    'key_type' => 'Floor Master Key',
                    'room_range_access' => 'Lantai 3 (Kamar 301 - 340)',
                    'valid_from' => $validFrom->toDateString(),
                    'valid_until' => $validUntil->toDateString(),
                    'renewal_cycle_months' => 3,
                    'purpose' => 'Akses rutin pembersihan kamar dan turn-down service Lantai 3.',
                    'status' => 'Approved',
                    'approved_by' => $hodUser?->id,
                    'approved_at' => $validFrom->copy()->addHours(3),
                    'approval_notes' => 'Disetujui. Perhatikan batas waktu 3 bulan sebelum masa aktif berakhir.',
                ]
            );
        }

        // 3. Expired Key (Sari Dewi) - expired 6 days ago, ready for Quick Renewal!
        $sari = $staffHKList->firstWhere('employee_number', 'SBH-112') ?? ($staffHKList->count() > 2 ? $staffHKList[2] : null);
        if ($sari) {
            $validUntil = $today->copy()->subDays(6);
            $validFrom = $validUntil->copy()->subMonths(3);

            MasterKeyRequest::firstOrCreate(
                ['request_number' => 'MKR-' . date('Ym') . '-0003'],
                [
                    'employee_id' => $sari->id,
                    'department_id' => $hkDept->id,
                    'key_number' => 'MK-HK-501',
                    'key_type' => 'Floor Master Key',
                    'room_range_access' => 'Lantai 5 (Kamar 501 - 540)',
                    'valid_from' => $validFrom->toDateString(),
                    'valid_until' => $validUntil->toDateString(),
                    'renewal_cycle_months' => 3,
                    'purpose' => 'Operasional pembersihan kamar dan inspeksi kebersihan Lantai 5.',
                    'status' => 'Approved',
                    'approved_by' => $hodUser?->id,
                    'approved_at' => $validFrom->copy()->addHours(1),
                    'approval_notes' => 'Disetujui periode sebelumnya. Masa berlaku telah habis dan perlu perpanjangan segera.',
                ]
            );
        }

        // 4. Pending Approval (Lestari Putri - Supervisor) - Section Master
        if ($supHK) {
            $validFrom = $today;
            $validUntil = $validFrom->copy()->addMonths(3);

            MasterKeyRequest::firstOrCreate(
                ['request_number' => 'MKR-' . date('Ym') . '-0004'],
                [
                    'employee_id' => $supHK->id,
                    'department_id' => $hkDept->id,
                    'key_number' => 'SMK-HK-02',
                    'key_type' => 'Section Master Key',
                    'room_range_access' => 'Lantai 2 - 3 (Kamar 201 - 340)',
                    'valid_from' => $validFrom->toDateString(),
                    'valid_until' => $validUntil->toDateString(),
                    'renewal_cycle_months' => 3,
                    'purpose' => 'Supervisi, inspeksi kebersihan kamar check-out, dan cross check room attendant shift pagi & siang.',
                    'status' => 'Pending',
                ]
            );
        }

        // 5. Grand Master Key (Dewi Kartika - Executive Housekeeper) - Active
        if ($hodHK) {
            $validFrom = $today->copy()->subWeeks(2);
            $validUntil = $validFrom->copy()->addMonths(3);

            MasterKeyRequest::firstOrCreate(
                ['request_number' => 'MKR-' . date('Ym') . '-0005'],
                [
                    'employee_id' => $hodHK->id,
                    'department_id' => $hkDept->id,
                    'key_number' => 'GMK-HK-01',
                    'key_type' => 'Grand Master Key',
                    'room_range_access' => 'Seluruh Area Kamar Tamu & Linen (All HK Guest Rooms)',
                    'valid_from' => $validFrom->toDateString(),
                    'valid_until' => $validUntil->toDateString(),
                    'renewal_cycle_months' => 3,
                    'purpose' => 'Akses Head of Department untuk audit kualitas kebersihan seluruh kamar tamu dan penanganan darurat.',
                    'status' => 'Approved',
                    'approved_by' => $adminUser?->id,
                    'approved_at' => $validFrom->copy()->addHours(1),
                    'approval_notes' => 'Disetujui oleh Manajemen / General Manager.',
                ]
            );
        }
    }
}
