<?php
$data = [
    'name' => 'Test User',
    'sender_age' => '',
    'email' => '',
    'phone' => '(123) 456-7890',
    'recipient_name' => 'John Doe',
    'recipient_title' => 'Mr',
    'recipient_phone' => '',
    'recipient_email' => '',
    'preferences' => 'Test',
    'selected_items' => []
];

$ch = curl_init('http://attire-lounge.test/api/v1/gift-requests');
curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
curl_setopt($ch, CURLOPT_POSTFIELDS, json_encode($data));
curl_setopt($ch, CURLOPT_HTTPHEADER, ['Content-Type: application/json', 'Accept: application/json']);

$response = curl_exec($ch);
$httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);

echo "HTTP Code: $httpCode\n";
echo "Response: $response\n";
