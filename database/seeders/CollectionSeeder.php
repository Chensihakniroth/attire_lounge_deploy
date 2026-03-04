<?php

namespace Database\Seeders;

use App\Models\Collection;
use Illuminate\Database\Seeder;

class CollectionSeeder extends Seeder
{
    /**
     * Run the database seeds.
     * Updated to match the existing database state for Attire Lounge Official Styling House.
     */
    public function run(): void
    {
        Collection::updateOrCreate(['slug' => 'havana-collection'], [
            'name' => 'Havana Collection',
            'description' => 'Lightweight fabrics and breezy silhouettes.',
            'year' => 2024,
            'image' => '/uploads/collections/default/hvn1.jpg?v=new',
            'is_active' => true,
            'sort_order' => 1,
        ]);

        Collection::updateOrCreate(['slug' => 'mocha-mousse-25'], [
            'name' => 'Mocha Mousse \'25',
            'description' => 'Breathable natural fabrics for sophisticated comfort.',
            'year' => 2025,
            'image' => '/uploads/collections/default/mm1.jpg?v=new',
            'is_active' => true,
            'sort_order' => 2,
        ]);

        Collection::updateOrCreate(['slug' => 'groom-collection'], [
            'name' => 'Groom Collection',
            'description' => 'Elegant tuxedos and formal wear for special occasions.',
            'year' => 2025,
            'image' => '/uploads/collections/default/g1.webp?v=new',
            'is_active' => true,
            'sort_order' => 3,
        ]);

        Collection::updateOrCreate(['slug' => 'office-collections'], [
            'name' => 'Office Collections',
            'description' => 'Sophisticated and comfortable attire for the modern workplace.',
            'year' => 2024,
            'image' => '/uploads/collections/default/of1.jpg?v=new',
            'is_active' => true,
            'sort_order' => 4,
        ]);

        Collection::updateOrCreate(['slug' => 'accessories'], [
            'name' => 'Accessories Collection',
            'description' => 'Fine accessories to complete your look.',
            'year' => 2024,
            'image' => '/uploads/collections/accessories/cuff.JPG',
            'is_active' => true,
            'sort_order' => 5,
        ]);

        Collection::updateOrCreate(['slug' => 'travel-collection'], [
            'name' => 'Travel Collection',
            'description' => 'Stylish and durable essentials for the modern explorer.',
            'year' => 2024,
            'image' => '/uploads/collections/Travel%20collections/t0.webp',
            'is_active' => true,
            'sort_order' => 6,
        ]);

        Collection::updateOrCreate(['slug' => 'shades-of-elegance'], [
            'name' => 'Shades of Elegance',
            'description' => 'A definitive visual catalog of styling excellence.',
            'year' => 2025,
            'image' => '/uploads/shades1/1.webp',
            'is_active' => true,
            'sort_order' => 7,
        ]);

        Collection::updateOrCreate(['slug' => 'street-sartorial'], [
            'name' => 'Street Sartorial',
            'description' => 'Contemporary silhouettes meeting traditional craftsmanship.',
            'year' => 2025,
            'image' => '/uploads/street1/1.webp',
            'is_active' => true,
            'sort_order' => 8,
        ]);
    }
}
