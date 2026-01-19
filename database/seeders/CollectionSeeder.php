<?php

namespace Database\Seeders;

use App\Models\Collection;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

class CollectionSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        Collection::firstOrCreate(['slug' => 'havana-collection'], [
            'name' => 'Havana Collection',
            'description' => 'Lightweight fabrics and breezy silhouettes.',
            'year' => 2024,
            'is_active' => true,
            'sort_order' => 1,
        ]);

        Collection::firstOrCreate(['slug' => 'mocha-mousse-25'], [
            'name' => 'Mocha Mousse \'25',
            'description' => 'Breathable natural fabrics for sophisticated comfort.',
            'year' => 2025,
            'is_active' => true,
            'sort_order' => 2,
        ]);

        Collection::firstOrCreate(['slug' => 'groom-collection'], [
            'name' => 'Groom Collection',
            'description' => 'Elegant tuxedos and formal wear for special occasions.',
            'year' => 2025,
            'is_active' => true,
            'sort_order' => 3,
        ]);
    }
}
