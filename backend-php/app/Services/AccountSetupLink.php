<?php

namespace App\Services;

use Illuminate\Support\Facades\DB;

class AccountSetupLink
{
    public function createFor(int $userId, string $email): string
    {
        $token = bin2hex(random_bytes(32));

        DB::table('account_setup_tokens')->where('user_id', $userId)->whereNull('used_at')->delete();
        DB::table('account_setup_tokens')->insert([
            'user_id' => $userId,
            'email' => $email,
            'token_hash' => hash('sha256', $token),
            'expires_at' => now()->addHours(24),
            'created_at' => now(),
            'updated_at' => now(),
        ]);

        return url('/account/setup#token='.urlencode($token));
    }
}
