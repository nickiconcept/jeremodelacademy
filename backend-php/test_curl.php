<?php
$payload = json_encode(['contact_phone'=>'888-888-8888', 'contact_email'=>'new@test.com', 'ticker_text'=>'Latest Ticker']);
$ch = curl_init('http://127.0.0.1:8000/api/website/school-info');
curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
curl_setopt($ch, CURLOPT_HTTPHEADER, ['Content-Type: application/json', 'Accept: application/json']);
curl_setopt($ch, CURLOPT_POST, true);
curl_setopt($ch, CURLOPT_POSTFIELDS, $payload);
$res = curl_exec($ch);
echo "Response:\n" . $res . "\n";
