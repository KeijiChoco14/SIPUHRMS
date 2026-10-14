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
        Schema::create('it_assets', function (Blueprint $table) {
            $table->id();
            $table->string('asset_code')->unique(); // e.g. IT-AST-0001, PC-FO-01
            $table->string('name'); // e.g. Laptop Lenovo ThinkPad E14
            $table->string('category'); // Laptop, Desktop / PC, Printer / Scanner, Network, CCTV / Security, POS Terminal, Server, Other
            $table->string('brand')->nullable(); // Lenovo, HP, Epson, Cisco, Ubiquiti
            $table->string('model')->nullable();
            $table->string('serial_number')->nullable();
            $table->text('specifications')->nullable();
            $table->string('status')->default('Available'); // In Use, Available, Maintenance, Disposed
            $table->foreignId('assigned_to_employee_id')->nullable()->constrained('employees')->nullOnDelete();
            $table->string('location')->nullable(); // Front Office, Accounting, Ballroom, Server Room
            $table->string('ip_address')->nullable();
            $table->date('purchase_date')->nullable();
            $table->date('warranty_expiry')->nullable();
            $table->decimal('purchase_cost', 12, 2)->nullable();
            $table->text('notes')->nullable();
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('it_assets');
    }
};
