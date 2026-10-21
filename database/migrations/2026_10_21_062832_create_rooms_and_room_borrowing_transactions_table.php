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
        Schema::create('rooms', function (Blueprint $table) {
            $table->id();
            $table->string('room_number', 50)->unique();
            $table->string('name', 150);
            $table->string('location', 150)->nullable();
            $table->integer('capacity')->nullable();
            $table->text('description')->nullable();
            $table->string('key_code', 50)->nullable();
            $table->string('status', 30)->default('AVAILABLE')->index();
            $table->boolean('is_active')->default(true)->index();
            $table->timestamps();
        });

        Schema::create('room_borrowing_transactions', function (Blueprint $table) {
            $table->id();
            $table->string('transaction_number', 50)->unique();
            $table->foreignId('room_id')->constrained('rooms')->cascadeOnDelete();
            $table->foreignId('borrower_employee_id')->constrained('employees')->cascadeOnDelete();
            $table->timestamp('borrowed_at');
            $table->text('purpose')->nullable();
            $table->string('status', 30)->default('BORROWED')->index();
            $table->timestamp('return_requested_at')->nullable();
            $table->text('return_notes')->nullable();
            $table->timestamp('returned_at')->nullable();
            $table->foreignId('security_user_id')->nullable()->constrained('users')->nullOnDelete();
            $table->text('security_notes')->nullable();
            $table->timestamps();

            $table->index(['room_id', 'status']);
            $table->index(['borrower_employee_id', 'status']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('room_borrowing_transactions');
        Schema::dropIfExists('rooms');
    }
};
