<?php
require 'vendor/autoload.php';
$app = require_once 'bootstrap/app.php';
$kernel = $app->make(Illuminate\Contracts\Console\Kernel::class);
$kernel->bootstrap();
$s = \App\Models\SystemSetting::latest('id')->first();
echo json_encode($s->toArray(), JSON_PRETTY_PRINT);
