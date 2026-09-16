<?php
require 'vendor/autoload.php';
$app = require_once 'bootstrap/app.php';
$kernel = $app->make(Illuminate\Contracts\Console\Kernel::class);
$kernel->bootstrap();

$request = \Illuminate\Http\Request::create('/api/website/school-info', 'POST', [
    'contact_phone' => '123-123-1234',
    'contact_email' => 'test@test.com',
    'ticker_text' => 'New Announcement!'
]);

$controller = new \App\Http\Controllers\WebsiteController();
$response = $controller->updateSchoolInfo($request);

echo $response->getContent();
