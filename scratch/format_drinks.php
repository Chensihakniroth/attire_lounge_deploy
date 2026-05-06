<?php
require __DIR__ . '/../vendor/autoload.php';
$app = require_once __DIR__ . '/../bootstrap/app.php';
$kernel = $app->make(Illuminate\Contracts\Console\Kernel::class);
$kernel->bootstrap();

use App\Models\PosProduct;

$drinkCategories = [
    'Espresso', 'Cold', 'Tea', 'Blend', 'SIGNATURES', 'CLASSICS', 'Gin', 'Whisky', 'Rum', 'Vodka',
    'Tequila & Mezcal', 'SOFT DRINKS', 'SOFT_DRINKS', 'BEER', 'WINE', 'JUICE', 'HOT', 'MOOD REFRESHERS',
    'SPARKLING FEELING', 'Liqueur and Other', 'Rare Spirit', 'Nikka Sora Takeover',
    'Samai International Rum Day', 'WOMAN TAKEOVER', 'MONTHLY DRINK', 'KRAVAT 2.0', 'COFFEE',
    'OLD MENU 1.0', 'SECRET MENUS', 'TOPPINGS', 'Christmas 24', 'COCKTAILS'
];

$drinks = PosProduct::whereIn('category', $drinkCategories)
    ->orWhere('name', 'LIKE', '%Shot%')
    ->get()
    ->groupBy('category')
    ->map(function($items) {
        return $items->map(function($p) {
            return [
                'ID' => $p->id,
                'Name' => $p->name,
                'Outlet' => $p->outlet
            ];
        });
    });

foreach ($drinks as $category => $items) {
    echo "### Category: $category\n";
    foreach ($items as $item) {
        echo "- [ ] ID: {$item['ID']} | **{$item['Name']}** (Current: {$item['Outlet']})\n";
    }
    echo "\n";
}
