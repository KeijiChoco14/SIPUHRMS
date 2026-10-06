<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('master_key_requests', function (Blueprint $table) {
            $table->id();
            $table->string('request_number')->unique(); // e.g. MKR-202610-0001
            $table->foreignId('employee_id')->constrained()->cascadeOnDelete();
            $table->foreignId('department_id')->constrained()->cascadeOnDelete();
            $table->string('key_number'); // e.g. MK-HK-01, RFID-FL2-01
            $table->string('key_type')->default('Floor Master Key'); // Floor Master Key, Grand Master Key, Section Master Key, Room Attendant Master, Emergency Key
            $table->string('room_range_access'); // e.g. Lantai 2 & 3 (Kamar 201-330)
            $table->date('valid_from');
            $table->date('valid_until');
            $table->unsignedInteger('renewal_cycle_months')->default(3); // 3 bulan sekali
            $table->text('purpose');
            $table->enum('status', ['Pending', 'Approved', 'Rejected', 'Revoked'])->default('Pending');
            $table->foreignId('approved_by')->nullable()->constrained('users')->nullOnDelete();
            $table->timestamp('approved_at')->nullable();
            $table->text('approval_notes')->nullable();
            $table->text('rejection_reason')->nullable();
            $table->foreignId('previous_request_id')->nullable()->constrained('master_key_requests')->nullOnDelete();
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('master_key_requests');
    }
};
