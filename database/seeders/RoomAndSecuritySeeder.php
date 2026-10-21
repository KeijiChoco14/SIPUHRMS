<?php

namespace Database\Seeders;

use App\Models\Department;
use App\Models\Employee;
use App\Models\Position;
use App\Models\Room;
use App\Models\User;
use Carbon\Carbon;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;
use Spatie\Permission\Models\Role;

class RoomAndSecuritySeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // 1. Ensure Security Department exists
        $securityDept = Department::firstOrCreate(
            ['name' => 'Security & Safety'],
            ['description' => 'Physical asset protection, security post surveillance, and hotel key custody management.']
        );

        // 2. Ensure Security Position exists
        $securityPos = Position::firstOrCreate(
            ['name' => 'Duty Security Officer', 'department_id' => $securityDept->id]
        );

        // 3. Ensure Security Role exists
        $securityRole = Role::firstOrCreate(['name' => 'Security']);

        // 4. Create or update Security User
        $secUser = User::firstOrCreate(
            ['email' => 'security@swissbelhotel.com'],
            [
                'name' => 'Rahmat Hidayat (Security)',
                'password' => Hash::make('password'),
            ]
        );

        if (!$secUser->hasRole('Security')) {
            $secUser->assignRole($securityRole);
        }

        // 5. Create or update Employee profile for Security User
        Employee::firstOrCreate(
            ['user_id' => $secUser->id],
            [
                'employee_number' => 'SBH-SEC-01',
                'department_id' => $securityDept->id,
                'position_id' => $securityPos->id,
                'join_date' => Carbon::now()->subYears(2),
                'employment_status' => 'Active',
                'phone_number' => '081298765432',
            ]
        );

        // 6. Seed Rooms
        $rooms = [
            [
                'room_number' => 'MTG-01',
                'name' => 'Meeting Room SKA 1',
                'location' => '2nd Floor - East Wing',
                'capacity' => 25,
                'description' => '25-seat conference room equipped with ceiling projector, HDMI extender, and smart whiteboard.',
                'key_code' => 'KEY-MR01',
                'status' => Room::STATUS_AVAILABLE,
                'is_active' => true,
            ],
            [
                'room_number' => 'MTG-02',
                'name' => 'Meeting Room SKA 2',
                'location' => '2nd Floor - East Wing',
                'capacity' => 30,
                'description' => 'Executive meeting room with integrated video conferencing facilities and surround sound audio.',
                'key_code' => 'KEY-MR02',
                'status' => Room::STATUS_AVAILABLE,
                'is_active' => true,
            ],
            [
                'room_number' => 'MTG-03',
                'name' => 'Meeting Room SKA 3',
                'location' => '2nd Floor - West Wing',
                'capacity' => 15,
                'description' => 'Interactive department briefing room and external vendor consultation suite.',
                'key_code' => 'KEY-MR03',
                'status' => Room::STATUS_AVAILABLE,
                'is_active' => true,
            ],
            [
                'room_number' => 'BLR-01',
                'name' => 'Grand Ballroom SKA',
                'location' => '1st Floor - Main Hall',
                'capacity' => 500,
                'description' => 'Main hotel ballroom for large-scale banquets, wedding receptions, and corporate summits.',
                'key_code' => 'KEY-BLR01',
                'status' => Room::STATUS_AVAILABLE,
                'is_active' => true,
            ],
            [
                'room_number' => 'VIP-01',
                'name' => 'VIP Executive Lounge',
                'location' => '2nd Floor - West Wing',
                'capacity' => 12,
                'description' => 'Exclusive lounge for welcoming hotel VIP dignitaries and board of directors meetings.',
                'key_code' => 'KEY-VIP01',
                'status' => Room::STATUS_AVAILABLE,
                'is_active' => true,
            ],
            [
                'room_number' => 'BIZ-01',
                'name' => 'Business Center & Workspace',
                'location' => '1st Floor - Near Lobby',
                'capacity' => 20,
                'description' => 'Guest workstation hub, printing amenities, and hotel business center operations.',
                'key_code' => 'KEY-BIZ01',
                'status' => Room::STATUS_AVAILABLE,
                'is_active' => true,
            ],
            [
                'room_number' => 'FIT-01',
                'name' => 'Fitness & Pool Storage',
                'location' => '3rd Floor - Recreation Deck',
                'capacity' => 10,
                'description' => 'Storage facility for fitness center inventory and swimming pool maintenance equipment.',
                'key_code' => 'KEY-FIT01',
                'status' => Room::STATUS_AVAILABLE,
                'is_active' => true,
            ],
            [
                'room_number' => 'SRV-01',
                'name' => 'IT Server & Network Rack Room',
                'location' => '1st Floor - IT Back Office',
                'capacity' => 6,
                'description' => 'Core IT datacenter and hotel network rack room with precision cooling (Restricted access).',
                'key_code' => 'KEY-SRV01',
                'status' => Room::STATUS_AVAILABLE,
                'is_active' => true,
            ],
            [
                'room_number' => 'ENG-01',
                'name' => 'Engineering Workshop',
                'location' => 'Basement 1 - Utility Area',
                'capacity' => 15,
                'description' => 'Technician maintenance workshop for mechanical, electrical, and plumbing engineering.',
                'key_code' => 'KEY-ENG01',
                'status' => Room::STATUS_AVAILABLE,
                'is_active' => true,
            ],
            [
                'room_number' => 'LIN-01',
                'name' => 'Linen & Housekeeping Storage',
                'location' => '2nd Floor - Service Area',
                'capacity' => 8,
                'description' => 'Primary housekeeping stockroom for fresh bed linens, duvets, towels, and guest amenities.',
                'key_code' => 'KEY-LIN01',
                'status' => Room::STATUS_AVAILABLE,
                'is_active' => true,
            ],
        ];

        foreach ($rooms as $roomData) {
            Room::updateOrCreate(
                ['room_number' => $roomData['room_number']],
                $roomData
            );
        }
    }
}
