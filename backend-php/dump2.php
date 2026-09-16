<?php
require 'vendor/autoload.php';
$app = require_once 'bootstrap/app.php';
$kernel = $app->make(Illuminate\Contracts\Console\Kernel::class);
$kernel->bootstrap();
$s = \App\Models\SystemSetting::all()->toArray();
echo json_encode(array_slice($s, -2), JSON_PRETTY_PRINT);
