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
        Schema::create('power_pro_requests', function (Blueprint $table) {
            $table->id();
            $table->string('request_number')->unique(); // e.g. PPR-202610-0001
            
            // Request type: create_new, modify_access, reset_password, deactivate
            $table->string('request_type')->default('create_new');
            
            $table->foreignId('employee_id')->constrained()->cascadeOnDelete();
            $table->foreignId('department_id')->constrained()->cascadeOnDelete();
            
            // Employment status: Permanent, Contract, Daily Worker, Trainee / OJT
            $table->string('employment_status')->nullable();
            
            // System and module access details
            $table->string('system_type')->default('Power Pro PMS');
            $table->json('power_pro_modules')->nullable(); // e.g. ["Front Office", "Point of Sales (POS)", "Housekeeping"]
            $table->string('access_level')->default('Staff / Operator'); // e.g. Receptionist, Cashier, Supervisor, Night Audit
            $table->json('special_privileges')->nullable(); // e.g. ["Void Transaction", "Discount Override", "Reprint Receipt"]
            $table->string('proposed_username')->nullable(); // Proposed login ID
            $table->text('reason')->nullable(); // Purpose / Business justification
            
            // Status: On Request, Approved, Done, Rejected
            $table->string('status')->default('On Request');
            
            // 1. Requester tracking
            $table->foreignId('requested_by_user_id')->nullable()->constrained('users')->nullOnDelete();
            $table->string('requested_by_username')->nullable();
            $table->timestamp('requested_at')->nullable();
            $table->longText('requester_signature')->nullable();
            
            // 2. Head of Department (HOD) approval tracking
            $table->foreignId('approved_by_user_id')->nullable()->constrained('users')->nullOnDelete();
            $table->string('approved_by_username')->nullable();
            $table->timestamp('approved_at')->nullable();
            $table->longText('approver_signature')->nullable();
            $table->text('approval_notes')->nullable();
            
            // 3. IT execution tracking
            $table->foreignId('processed_by_user_id')->nullable()->constrained('users')->nullOnDelete();
            $table->string('processed_by_username')->nullable();
            $table->timestamp('processed_at')->nullable();
            $table->longText('it_signature')->nullable();
            $table->string('created_user_id')->nullable(); // The actual Power Pro user ID created in server
            $table->text('it_notes')->nullable();
            
            // Rejection reason
            $table->text('rejection_reason')->nullable();
            
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('power_pro_requests');
    }
};
