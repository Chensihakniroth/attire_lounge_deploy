<?php
$json = file_get_contents('storage/pos_products.json');
$data = json_decode($json, true);

if (!$data) {
    echo "Invalid JSON.\n";
    exit;
}

$caffeine = array_filter($data, function($item) {
    return isset($item['outlet']) && $item['outlet'] === 'caffeine';
});

echo "Total items in pos_products.json: " . count($data) . "\n";
echo "Total 'caffeine' items: " . count($caffeine) . "\n";

$categories = [];
foreach ($caffeine as $item) {
    $cat = $item['category'] ?? 'UNKNOWN';
    $categories[$cat] = ($categories[$cat] ?? 0) + 1;
}

echo "Categories in caffeine outlet:\n";
print_r($categories);

file_put_contents('storage/caffeine_products.json', json_encode(array_values($caffeine), JSON_PRETTY_PRINT));
echo "Saved caffeine_products.json\n";
