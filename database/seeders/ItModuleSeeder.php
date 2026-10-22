<?php

namespace Database\Seeders;

use App\Models\Employee;
use App\Models\ItAsset;
use App\Models\ItTicket;
use App\Models\ItTicketUpdate;
use App\Models\User;
use Carbon\Carbon;
use Illuminate\Database\Seeder;

class ItModuleSeeder extends Seeder
{
    public function run(): void
    {
        // Don't duplicate if already seeded
        if (ItAsset::count() > 0) {
            return;
        }

        $adminUser = User::where('email', 'admin@swissbelhotel.com')->first();
        $adminEmployee = Employee::where('user_id', $adminUser?->id)->first();
        $foStaff = Employee::whereHas('department', fn($q) => $q->where('name', 'Front Office'))->first();
        $fbStaff = Employee::whereHas('department', fn($q) => $q->where('name', 'Food & Beverage'))->first();
        $accStaff = Employee::whereHas('department', fn($q) => $q->where('name', 'Accounting'))->first();
        $hkStaff = Employee::whereHas('department', fn($q) => $q->where('name', 'Housekeeping'))->first();

        // 1. Seed Assets
        $asset1 = ItAsset::create([
            'asset_code' => 'IT-PC-FO-01',
            'name' => 'PC All-in-One HP ProOne 440 G9',
            'category' => 'Desktop / PC',
            'brand' => 'HP',
            'model' => 'ProOne 440 G9 23.8"',
            'serial_number' => 'HP440-G9-882194',
            'specifications' => 'Intel Core i5-12500, 16GB DDR4, 512GB NVMe SSD, 23.8" FHD IPS, Win 11 Pro',
            'status' => 'In Use',
            'assigned_to_employee_id' => $foStaff?->id,
            'location' => 'Front Office Desk 1',
            'ip_address' => '192.168.10.21',
            'purchase_date' => Carbon::parse('2024-03-15'),
            'warranty_expiry' => Carbon::parse('2027-03-15'),
            'purchase_cost' => 14500000,
            'notes' => 'Dedicated workstation untuk PMS Opera / Frontdesk Swiss-Belinn.',
        ]);

        $asset2 = ItAsset::create([
            'asset_code' => 'IT-PC-FO-02',
            'name' => 'PC All-in-One HP ProOne 440 G9',
            'category' => 'Desktop / PC',
            'brand' => 'HP',
            'model' => 'ProOne 440 G9 23.8"',
            'serial_number' => 'HP440-G9-882195',
            'specifications' => 'Intel Core i5-12500, 16GB DDR4, 512GB NVMe SSD, 23.8" FHD IPS, Win 11 Pro',
            'status' => 'In Use',
            'assigned_to_employee_id' => $foStaff?->id,
            'location' => 'Front Office Desk 2',
            'ip_address' => '192.168.10.22',
            'purchase_date' => Carbon::parse('2024-03-15'),
            'warranty_expiry' => Carbon::parse('2027-03-15'),
            'purchase_cost' => 14500000,
            'notes' => 'PMS Opera Terminal 2 Receptionist.',
        ]);

        $asset3 = ItAsset::create([
            'asset_code' => 'IT-LPT-ACC-01',
            'name' => 'Laptop Lenovo ThinkPad E14 Gen 4',
            'category' => 'Laptop',
            'brand' => 'Lenovo',
            'model' => 'ThinkPad E14 Gen 4',
            'serial_number' => 'PF-39XKL2',
            'specifications' => 'AMD Ryzen 5 5625U, 16GB RAM, 512GB SSD, Windows 11 Pro 64-bit',
            'status' => 'In Use',
            'assigned_to_employee_id' => $accStaff?->id,
            'location' => 'Accounting Department',
            'ip_address' => '192.168.10.45',
            'purchase_date' => Carbon::parse('2023-11-10'),
            'warranty_expiry' => Carbon::parse('2026-11-10'),
            'purchase_cost' => 12800000,
            'notes' => 'Laptop Finance & Accounting Manager.',
        ]);

        $asset4 = ItAsset::create([
            'asset_code' => 'IT-POS-FB-01',
            'name' => 'Printer Kasir Thermal Epson TM-T82X',
            'category' => 'Printer / Scanner',
            'brand' => 'Epson',
            'model' => 'TM-T82X USB+Serial',
            'serial_number' => 'EPS-T82-99210',
            'specifications' => 'Thermal 80mm, Auto-cutter, Speed 200mm/s, Interface USB/Serial',
            'status' => 'In Use',
            'assigned_to_employee_id' => $fbStaff?->id,
            'location' => 'Restoran Swiss-Cafe POS Counter',
            'ip_address' => '192.168.15.5',
            'purchase_date' => Carbon::parse('2024-01-20'),
            'warranty_expiry' => Carbon::parse('2025-01-20'),
            'purchase_cost' => 2450000,
            'notes' => 'Printer cetak bill tamu restoran & bar.',
        ]);

        $asset5 = ItAsset::create([
            'asset_code' => 'IT-DEV-FO-ENC',
            'name' => 'RFID Keycard Encoder VingCard Essence',
            'category' => 'Other',
            'brand' => 'ASSA ABLOY VingCard',
            'model' => 'RFID Encoder USB',
            'serial_number' => 'VC-ENC-2024-001',
            'specifications' => 'USB Interface, Support Mifare Classic & Ultralight C, Visionline PMS Integration',
            'status' => 'In Use',
            'assigned_to_employee_id' => $foStaff?->id,
            'location' => 'Front Office Reception Counter',
            'ip_address' => null,
            'purchase_date' => Carbon::parse('2023-08-15'),
            'warranty_expiry' => Carbon::parse('2025-08-15'),
            'purchase_cost' => 8500000,
            'notes' => 'Encoder kartu kunci kamar tamu.',
        ]);

        $asset6 = ItAsset::create([
            'asset_code' => 'IT-NET-SW-CORE',
            'name' => 'Core Switch Cisco Catalyst 2960-X 48 Port',
            'category' => 'Network',
            'brand' => 'Cisco',
            'model' => 'WS-C2960X-48FPS-L',
            'serial_number' => 'FOC2134S0AB',
            'specifications' => '48x 10/100/1000 PoE+ (740W), 4x 1G SFP, Layer 2+ Enterprise Switch',
            'status' => 'In Use',
            'assigned_to_employee_id' => $adminEmployee?->id,
            'location' => 'Server Room Lt. 2 (Rack A1)',
            'ip_address' => '192.168.1.2',
            'purchase_date' => Carbon::parse('2022-06-10'),
            'warranty_expiry' => Carbon::parse('2027-06-10'),
            'purchase_cost' => 38000000,
            'notes' => 'Core distribution switch seluruh lantai dan access point.',
        ]);

        $asset7 = ItAsset::create([
            'asset_code' => 'IT-NET-AP-BLR',
            'name' => 'Access Point Ubiquiti UniFi U6-Pro',
            'category' => 'Network',
            'brand' => 'Ubiquiti',
            'model' => 'UniFi WiFi 6 Pro (U6-Pro)',
            'serial_number' => 'UB-U6P-091244',
            'specifications' => 'WiFi 6 AX5400, Dual-band 4x4 MU-MIMO, PoE+ powered, Max 350+ clients',
            'status' => 'In Use',
            'assigned_to_employee_id' => $adminEmployee?->id,
            'location' => 'Grand Ballroom Plafon Utama',
            'ip_address' => '192.168.20.15',
            'purchase_date' => Carbon::parse('2024-02-18'),
            'warranty_expiry' => Carbon::parse('2026-02-18'),
            'purchase_cost' => 3200000,
            'notes' => 'AP untuk event skala besar dan tamu banquet.',
        ]);

        $asset8 = ItAsset::create([
            'asset_code' => 'IT-PRN-ADM-01',
            'name' => 'Printer Multifungsi Canon imageRUNNER 2625i',
            'category' => 'Printer / Scanner',
            'brand' => 'Canon',
            'model' => 'imageRUNNER 2625i',
            'serial_number' => 'CNR-2625-7712',
            'specifications' => 'A3/A4 Laser B&W, 25 ppm, DADF, Duplex, Network LAN / Scan to Email',
            'status' => 'Maintenance',
            'assigned_to_employee_id' => $accStaff?->id,
            'location' => 'General Administration Office',
            'ip_address' => '192.168.10.88',
            'purchase_date' => Carbon::parse('2023-01-10'),
            'warranty_expiry' => Carbon::parse('2025-01-10'),
            'purchase_cost' => 34000000,
            'notes' => 'Roller penarik kertas macet, sedang dijadwalkan servis vendor.',
        ]);

        $asset9 = ItAsset::create([
            'asset_code' => 'IT-TAB-HK-01',
            'name' => 'Tablet Samsung Galaxy Tab A8 Rugged',
            'category' => 'Other',
            'brand' => 'Samsung',
            'model' => 'Galaxy Tab A8 10.5" LTE',
            'serial_number' => 'R52M8032JHA',
            'specifications' => '10.5" WUXGA, Unisoc T618, 4GB RAM, 64GB, Rugged Shockproof Cover',
            'status' => 'Available',
            'assigned_to_employee_id' => null,
            'location' => 'IT Office / HK Storage',
            'ip_address' => null,
            'purchase_date' => Carbon::parse('2024-05-12'),
            'warranty_expiry' => Carbon::parse('2025-05-12'),
            'purchase_cost' => 3700000,
            'notes' => 'Unit cadangan inspeksi kebersihan kamar Housekeeping.',
        ]);

        // 2. Seed Tickets
        $ticket1 = ItTicket::create([
            'ticket_number' => 'TCK-20261014-0001',
            'title' => 'Printer Kasir Restoran Tidak Mau Mencetak Struk',
            'description' => 'Printer thermal kasir restoran error lampu merah berkedip terus dan tidak merespon saat tombol print ditekan dari sistem POS kasir.',
            'category' => 'Printer & Scanner',
            'priority' => 'High',
            'status' => 'In Progress',
            'reported_by_employee_id' => $fbStaff?->id ?? 1,
            'assigned_to_user_id' => $adminUser?->id,
            'it_asset_id' => $asset4->id,
            'location' => 'Swiss-Cafe Restaurant POS Counter',
        ]);
        if ($adminUser) {
            $ticket1->assignedUsers()->sync([$adminUser->id]);
        }

        ItTicketUpdate::create([
            'it_ticket_id' => $ticket1->id,
            'user_id' => $fbStaff?->user_id ?? 1,
            'status_from' => null,
            'status_to' => 'Open',
            'message' => 'Tiket kendala IT dilaporkan oleh staff Restoran. Tamu menunggu bill pembayaran.',
            'created_at' => Carbon::now()->subHours(3),
        ]);

        ItTicketUpdate::create([
            'it_ticket_id' => $ticket1->id,
            'user_id' => $adminUser?->id ?? 1,
            'status_from' => 'Open',
            'status_to' => 'In Progress',
            'message' => 'Teknisi IT sedang menuju outlet resto untuk cek kabel interface dan sensor paper jam.',
            'created_at' => Carbon::now()->subHours(2),
        ]);

        $ticket2 = ItTicket::create([
            'ticket_number' => 'TCK-20261014-0002',
            'title' => 'Keycard Encoder Front Office Sering Not Responding',
            'description' => 'Saat proses check-in tamu rombongan, aplikasi Visionline lock encoder tiba-tiba freezing dan harus restart software berulang kali.',
            'category' => 'Hardware',
            'priority' => 'Urgent',
            'status' => 'Open',
            'reported_by_employee_id' => $foStaff?->id ?? 1,
            'assigned_to_user_id' => null,
            'it_asset_id' => $asset5->id,
            'location' => 'Front Office Desk 1',
        ]);

        ItTicketUpdate::create([
            'it_ticket_id' => $ticket2->id,
            'user_id' => $foStaff?->user_id ?? 1,
            'status_from' => null,
            'status_to' => 'Open',
            'message' => 'Tiket dilaporkan. Mohon diprioritaskan karena peak check-in jam 14:00.',
            'created_at' => Carbon::now()->subMinutes(45),
        ]);

        $ticket3 = ItTicket::create([
            'ticket_number' => 'TCK-20261013-0001',
            'title' => 'WiFi di Ruang Meeting Siak Lambat saat Sesi Presentasi',
            'description' => 'Koneksi internet tamu meeting corporate drop dan sering putus-putus saat zoom call di meeting room Lt. 2.',
            'category' => 'Network & Internet',
            'priority' => 'Medium',
            'status' => 'Resolved',
            'reported_by_employee_id' => $foStaff?->id ?? 1,
            'assigned_to_user_id' => $adminUser?->id,
            'it_asset_id' => $asset7->id,
            'location' => 'Meeting Room Siak Lt. 2',
            'resolved_at' => Carbon::now()->subHours(18),
            'resolution_notes' => 'Dilakukan band steering 5GHz dan peningkatan alokasi bandwidth QoS untuk VLAN Meeting Room. Sinyal stabil kembali.',
        ]);
        if ($adminUser) {
            $ticket3->assignedUsers()->sync([$adminUser->id]);
        }

        ItTicketUpdate::create([
            'it_ticket_id' => $ticket3->id,
            'user_id' => $adminUser?->id ?? 1,
            'status_from' => 'In Progress',
            'status_to' => 'Resolved',
            'message' => 'Bandwidth QoS telah dinaikkan dan speed test di ruangan mencapai 85 Mbps.',
            'created_at' => Carbon::now()->subHours(18),
        ]);
    }
}
