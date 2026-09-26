<?php

require __DIR__.'/vendor/autoload.php';
$app = require_once __DIR__.'/bootstrap/app.php';
$app->make(Illuminate\Contracts\Console\Kernel::class)->bootstrap();

use App\Models\User;

$u = User::where('role', 'admin')->first();
if (!$u) {
    echo "No admin found.\n";
    exit;
}

$p = $u->permissions ?? [];
if (is_string($p)) $p = json_decode($p, true);

if (!in_array('super_admin', $p)) {
    $p[] = 'super_admin';
    $u->permissions = $p;
    $u->save();
    echo "Granted super_admin to {$u->username}\n";
} else {
    echo "{$u->username} already has super_admin\n";
}
