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
        Schema::create('it_ticket_assignees', function (Blueprint $table) {
            $table->foreignId('it_ticket_id')->constrained('it_tickets')->cascadeOnDelete();
            $table->foreignId('user_id')->constrained('users')->cascadeOnDelete();
            $table->timestamps();

            $table->primary(['it_ticket_id', 'user_id']);
        });

        // Migrate any existing assigned_to_user_id to the new pivot table
        $existingTickets = \Illuminate\Support\Facades\DB::table('it_tickets')
            ->whereNotNull('assigned_to_user_id')
            ->select('id', 'assigned_to_user_id', 'created_at', 'updated_at')
            ->get();

        $rows = [];
        $now = now();
        foreach ($existingTickets as $ticket) {
            $rows[] = [
                'it_ticket_id' => $ticket->id,
                'user_id' => $ticket->assigned_to_user_id,
                'created_at' => $ticket->created_at ?? $now,
                'updated_at' => $ticket->updated_at ?? $now,
            ];
        }

        if (!empty($rows)) {
            \Illuminate\Support\Facades\DB::table('it_ticket_assignees')->insertOrIgnore($rows);
        }
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('it_ticket_assignees');
    }
};
