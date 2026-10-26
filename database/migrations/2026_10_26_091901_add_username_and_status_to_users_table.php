<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Str;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::table('users', function (Blueprint $table) {
            if (!Schema::hasColumn('users', 'username')) {
                $table->string('username')->nullable()->after('name');
            }
            if (!Schema::hasColumn('users', 'status')) {
                $table->string('status')->default('active')->after('password');
            }
            if (!Schema::hasColumn('users', 'terms_accepted_at')) {
                $table->timestamp('terms_accepted_at')->nullable()->after('status');
            }
        });

        // Safe non-destructive data migration: Backfill usernames and verify existing staff accounts
        $existingUsers = DB::table('users')->orderBy('id')->get();
        $usedUsernames = [];

        foreach ($existingUsers as $user) {
            $base = '';
            if (!empty($user->username)) {
                $base = Str::lower(trim($user->username));
            } elseif (!empty($user->email)) {
                $parts = explode('@', $user->email);
                $base = Str::lower(preg_replace('/[^a-zA-Z0-9._]/', '_', $parts[0] ?? ''));
            }

            if (empty($base) || strlen($base) < 3) {
                $base = 'user_' . $user->id;
            }

            $candidate = $base;
            $counter = 1;
            while (in_array($candidate, $usedUsernames, true)) {
                $candidate = $base . '_' . $counter;
                $counter++;
            }
            $usedUsernames[] = $candidate;

            DB::table('users')->where('id', $user->id)->update([
                'username' => $candidate,
                'status' => $user->status ?: 'active',
                'terms_accepted_at' => $user->terms_accepted_at ?: now(),
                // Ensure existing operational accounts are verified so staff are not locked out
                'email_verified_at' => $user->email_verified_at ?: now(),
            ]);
        }

        // Add unique index on username
        Schema::table('users', function (Blueprint $table) {
            $table->unique('username');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('users', function (Blueprint $table) {
            if (Schema::hasColumn('users', 'username')) {
                $table->dropUnique(['username']);
                $table->dropColumn('username');
            }
            if (Schema::hasColumn('users', 'status')) {
                $table->dropColumn('status');
            }
            if (Schema::hasColumn('users', 'terms_accepted_at')) {
                $table->dropColumn('terms_accepted_at');
            }
        });
    }
};
