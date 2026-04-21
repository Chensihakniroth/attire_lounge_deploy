<?php
require __DIR__.'/vendor/autoload.php';
$app = require_once __DIR__.'/bootstrap/app.php';
$kernel = $app->make(Illuminate\Contracts\Console\Kernel::class);
$kernel->bootstrap();

$products = Illuminate\Support\Facades\DB::table('pos_products')
    ->select('sku','barcode','name','variant','price','stock_qty','min_stock','category','tier','is_service','is_accessory','is_active')
    ->get()
    ->map(function($item) { return (array) $item; })
    ->toArray();

file_put_contents(storage_path('pos_products.json'), json_encode($products, JSON_PRETTY_PRINT));
echo count($products) . " exported.\n";
