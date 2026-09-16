<?php
require 'vendor/autoload.php';
$app = require_once 'bootstrap/app.php';
$kernel = $app->make(Illuminate\Contracts\Console\Kernel::class);
$kernel->bootstrap();

$s = \App\Models\SystemSetting::latest('id')->first();
$s->contact_phone = '555-1234';
$s->save();

$s2 = \App\Models\SystemSetting::latest('id')->first();
echo "Phone after save: " . $s2->contact_phone;
