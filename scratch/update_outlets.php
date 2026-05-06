<?php
require __DIR__ . '/../vendor/autoload.php';
$app = require_once __DIR__ . '/../bootstrap/app.php';
$kernel = $app->make(Illuminate\Contracts\Console\Kernel::class);
$kernel->bootstrap();

use App\Models\PosProduct;

// Categories to move to Kravat
$categories = [
    'Tequila & Mezcal',
    'SECRET MENUS',
    'Samai International Rum Day',
    'Gin',
    'Liqueur and Other',
    'Vodka',
    'CLASSICS',
    'SPARKLING FEELING',
    'JUICE',
    'Whisky',
    'Rum',
    'BEER',
    'SIGNATURES',
    'OLD MENU 1.0',
    'WINE',
    'Rare Spirit',
    'SOFT DRINKS',
    'SOFT_DRINKS',
    'KRAVAT 2.0',
    'WOMAN TAKEOVER',
    'Nikka Sora Takeover',
    'Christmas 24',
    'CUSTOMIZE'
];

// Specific SKUs to move
$skus = [
    'P0000150',
    'P0000332',
    'P0000266',
    'P0000328',
    'P0000329',
    'P0000330',
    'P0000331'
];

// 1. Update by exact category match
$updatedCategories = PosProduct::whereIn('category', $categories)
    ->update(['outlet' => 'kravat']);

// 2. Update by SKU match
$updatedSkus = PosProduct::whereIn('sku', $skus)
    ->update(['outlet' => 'kravat']);

// 3. Update by partial category/name match for "1800s" or "Samai Whisper"
$updatedMisc = PosProduct::where('category', 'LIKE', '%1800%')
    ->orWhere('name', 'LIKE', '%1800%')
    ->orWhere('name', 'LIKE', '%Samai Whisper%')
    ->update(['outlet' => 'kravat']);

echo "Update Summary:\n";
echo "- Category Matches Updated: $updatedCategories\n";
echo "- SKU Matches Updated: $updatedSkus\n";
echo "- '1800s' or 'Samai Whisper' Matches Updated: $updatedMisc\n";
echo "Total estimated moved: " . ($updatedCategories + $updatedSkus + $updatedMisc) . "\n";
