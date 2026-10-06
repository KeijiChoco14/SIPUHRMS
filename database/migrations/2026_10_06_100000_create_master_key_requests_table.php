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
            
            // A. Request type: create_new, extension, replacement
            $table->string('request_type')->default('create_new'); // create_new, extension, replacement
            
            $table->foreignId('employee_id')->constrained()->cascadeOnDelete();
            $table->foreignId('department_id')->constrained()->cascadeOnDelete();
            
            // Key details
            $table->string('key_number'); // e.g. MK-HK-01, RFID-FL2-01
            $table->string('key_type')->default('Floor Master Key');
            $table->string('room_range_access'); // e.g. Lantai 2 & 3 (Kamar 201-330)
            
            // Validity & 3 months cycle
            $table->date('valid_from');
            $table->date('valid_until');
            $table->unsignedInteger('renewal_cycle_months')->default(3); // 3 bulan sekali
            
            // B. Remark kolom untuk menjelaskan kenapa key dibuat / diperbarui / diganti
            $table->text('remark')->nullable();
            $table->text('purpose')->nullable();
            
            // C. Status: on request and done
            $table->string('status')->default('On Request'); // 'On Request', 'Done'
            
            // D. Username, tanggal request dan kapan done tercatat di log
            $table->foreignId('requested_by_user_id')->nullable()->constrained('users')->nullOnDelete();
            $table->string('requested_by_username')->nullable();
            $table->timestamp('requested_at')->nullable();
            
            $table->foreignId('done_by_user_id')->nullable()->constrained('users')->nullOnDelete();
            $table->string('done_by_username')->nullable();
            $table->timestamp('done_at')->nullable();
            $table->text('done_notes')->nullable();
            
            // Digital signatures
            $table->longText('requester_signature')->nullable();
            $table->longText('approver_signature')->nullable();
            
            // Reference to previous request for extension or replacement
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
