<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    /**
     * Backfill the catalog that was previously only present in the frontend
     * seed data. insertOrIgnore keeps this migration safe for deployments where
     * an administrator has already created or edited an item.
     */
    public function up(): void
    {
        $minio = 'https://bucket-production-4ca0.up.railway.app/product-assets/uploads/collections/accessories';
        $image = static fn (string $file): string => $minio . '/' . $file;
        $now = now();

        $items = [
            // Ties
            ['item_id' => 'tie-brown69', 'name' => 'Hand-roll Silk Tie', 'category' => 'ties', 'color' => 'Brown', 'price' => 69, 'image' => $image('brown69.webp'), 'is_active' => true, 'sort_order' => 0],
            ['item_id' => 'tie-cream49', 'name' => 'Silk Tie', 'category' => 'ties', 'color' => 'Cream', 'price' => 49, 'image' => $image('cream49.webp'), 'is_active' => true, 'sort_order' => 1],
            ['item_id' => 'tie-cyan69', 'name' => 'Hand-roll Silk Tie', 'category' => 'ties', 'color' => 'Cyan', 'price' => 69, 'image' => $image('cyan69.webp'), 'is_active' => true, 'sort_order' => 2],
            ['item_id' => 'tie-blue69', 'name' => 'Hand-roll Silk Tie', 'category' => 'ties', 'color' => 'Blue', 'price' => 69, 'image' => $image('blue69.webp'), 'is_active' => true, 'sort_order' => 3],
            ['item_id' => 'tie-green49', 'name' => 'Silk Tie', 'category' => 'ties', 'color' => 'Green', 'price' => 49, 'image' => $image('green49.webp'), 'is_active' => true, 'sort_order' => 4],
            ['item_id' => 'tie-white69', 'name' => 'Hand-roll Silk Tie', 'category' => 'ties', 'color' => 'White', 'price' => 69, 'image' => $image('white69.webp'), 'is_active' => true, 'sort_order' => 5],
            ['item_id' => 'tie-red69', 'name' => 'Hand-roll Silk Tie', 'category' => 'ties', 'color' => 'Red', 'price' => 69, 'image' => $image('red69.webp'), 'is_active' => true, 'sort_order' => 6],

            // Pocket squares
            ['item_id' => 'ps-blue', 'name' => 'Silk Pocket Square', 'category' => 'pocket_squares', 'color' => 'Blue', 'price' => 20, 'image' => $image('psblue.webp'), 'is_active' => true, 'sort_order' => 7],
            ['item_id' => 'ps-green', 'name' => 'Silk Pocket Square', 'category' => 'pocket_squares', 'color' => 'Green', 'price' => 20, 'image' => $image('psgreen.webp'), 'is_active' => true, 'sort_order' => 8],
            ['item_id' => 'ps-pink', 'name' => 'Silk Pocket Square', 'category' => 'pocket_squares', 'color' => 'Pink', 'price' => 20, 'image' => $image('pspink.webp'), 'is_active' => true, 'sort_order' => 9],
            ['item_id' => 'ps-red', 'name' => 'Silk Pocket Square', 'category' => 'pocket_squares', 'color' => 'Red', 'price' => 20, 'image' => $image('psred.webp'), 'is_active' => true, 'sort_order' => 10],
            ['item_id' => 'ps-yellowgreen', 'name' => 'Silk Pocket Square', 'category' => 'pocket_squares', 'color' => 'Yellow Green', 'price' => 20, 'image' => $image('psyellowgreen.webp'), 'is_active' => true, 'sort_order' => 11],
            ['item_id' => 'ps-yellow', 'name' => 'Silk Pocket Square', 'category' => 'pocket_squares', 'color' => 'Yellow', 'price' => 20, 'image' => $image('psyellow.webp'), 'is_active' => true, 'sort_order' => 12],

            // Gift boxes
            ['item_id' => 'box-small', 'name' => 'Small Box', 'category' => 'boxes', 'color' => null, 'price' => 1, 'image' => $image('smallbox.webp'), 'is_active' => true, 'sort_order' => 13],
            ['item_id' => 'box-mid', 'name' => 'Mid Box', 'category' => 'boxes', 'color' => null, 'price' => 1.5, 'image' => $image('midbox.webp'), 'is_active' => true, 'sort_order' => 14],
            ['item_id' => 'box-designer', 'name' => 'Designer Box', 'category' => 'boxes', 'color' => null, 'price' => 10, 'image' => $image('designer_box.jpg'), 'is_active' => true, 'sort_order' => 15],
        ];

        foreach ($items as &$item) {
            $item['created_at'] = $now;
            $item['updated_at'] = $now;
        }
        unset($item);

        DB::table('gift_items')->insertOrIgnore($items);
    }

    public function down(): void
    {
        // Keep catalog rows on rollback; they may contain administrator edits.
    }
};
