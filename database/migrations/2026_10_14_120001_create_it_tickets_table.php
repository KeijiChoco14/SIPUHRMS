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
        Schema::create('it_tickets', function (Blueprint $table) {
            $table->id();
            $table->string('ticket_number')->unique(); // e.g. TCK-202610-0001
            $table->string('title');
            $table->text('description');
            $table->string('category')->default('Hardware'); // Hardware, Network & Internet, Software & OS, Printer & Scanner, Email & Account, Other
            $table->string('priority')->default('Medium'); // Low, Medium, High, Urgent
            $table->string('status')->default('Open'); // Open, In Progress, Pending Parts, Resolved, Closed
            $table->foreignId('reported_by_employee_id')->constrained('employees')->cascadeOnDelete();
            $table->foreignId('assigned_to_user_id')->nullable()->constrained('users')->nullOnDelete();
            $table->foreignId('it_asset_id')->nullable()->constrained('it_assets')->nullOnDelete();
            $table->string('location')->nullable();
            $table->timestamp('resolved_at')->nullable();
            $table->text('resolution_notes')->nullable();
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('it_tickets');
    }
};
