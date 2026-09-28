<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\GiftItem;

class GiftItemSeeder extends Seeder
{
    /**
     * Seeds the catalog that used to live hardcoded in
     * resources/js/data/giftOptions.js. Idempotent — updateOrCreate on item_id.
     */
    public function run(): void
    {
        $minio = 'https://bucket-production-4ca0.up.railway.app/product-assets/uploads/collections/accessories';
        $img = fn(string $file) => $minio . '/' . $file;

        $items = [
            // Ties
            ['item_id' => 'tie-brown69', 'name' => 'Hand-roll Silk Tie', 'category' => 'ties', 'color' => 'Brown', 'price' => 69, 'image' => $img('brown69.webp')],
            ['item_id' => 'tie-cream49', 'name' => 'Silk Tie', 'category' => 'ties', 'color' => 'Cream', 'price' => 49, 'image' => $img('cream49.webp')],
            ['item_id' => 'tie-cyan69', 'name' => 'Hand-roll Silk Tie', 'category' => 'ties', 'color' => 'Cyan', 'price' => 69, 'image' => $img('cyan69.webp')],
            ['item_id' => 'tie-blue69', 'name' => 'Hand-roll Silk Tie', 'category' => 'ties', 'color' => 'Blue', 'price' => 69, 'image' => $img('blue69.webp')],
            ['item_id' => 'tie-green49', 'name' => 'Silk Tie', 'category' => 'ties', 'color' => 'Green', 'price' => 49, 'image' => $img('green49.webp')],
            ['item_id' => 'tie-white69', 'name' => 'Hand-roll Silk Tie', 'category' => 'ties', 'color' => 'White', 'price' => 69, 'image' => $img('white69.webp')],
            ['item_id' => 'tie-red69', 'name' => 'Hand-roll Silk Tie', 'category' => 'ties', 'color' => 'Red', 'price' => 69, 'image' => $img('red69.webp')],

            // Pocket Squares
            ['item_id' => 'ps-blue', 'name' => 'Silk Pocket Square', 'category' => 'pocket_squares', 'color' => 'Blue', 'price' => 20, 'image' => $img('psblue.webp')],
            ['item_id' => 'ps-green', 'name' => 'Silk Pocket Square', 'category' => 'pocket_squares', 'color' => 'Green', 'price' => 20, 'image' => $img('psgreen.webp')],
            ['item_id' => 'ps-pink', 'name' => 'Silk Pocket Square', 'category' => 'pocket_squares', 'color' => 'Pink', 'price' => 20, 'image' => $img('pspink.webp')],
            ['item_id' => 'ps-red', 'name' => 'Silk Pocket Square', 'category' => 'pocket_squares', 'color' => 'Red', 'price' => 20, 'image' => $img('psred.webp')],
            ['item_id' => 'ps-yellowgreen', 'name' => 'Silk Pocket Square', 'category' => 'pocket_squares', 'color' => 'Yellow Green', 'price' => 20, 'image' => $img('psyellowgreen.webp')],
            ['item_id' => 'ps-yellow', 'name' => 'Silk Pocket Square', 'category' => 'pocket_squares', 'color' => 'Yellow', 'price' => 20, 'image' => $img('psyellow.webp')],

            // Boxes
            ['item_id' => 'box-small', 'name' => 'Small Box', 'category' => 'boxes', 'color' => null, 'price' => 1, 'image' => $img('smallbox.webp')],
            ['item_id' => 'box-mid', 'name' => 'Mid Box', 'category' => 'boxes', 'color' => null, 'price' => 1.5, 'image' => $img('midbox.webp')],
            ['item_id' => 'box-designer', 'name' => 'Designer Box', 'category' => 'boxes', 'color' => null, 'price' => 10, 'image' => $img('designer_box.jpg')],
        ];

        foreach ($items as $i => $item) {
            GiftItem::updateOrCreate(
                ['item_id' => $item['item_id']],
                $item + ['sort_order' => $i, 'is_active' => true]
            );
        }
    }
}
