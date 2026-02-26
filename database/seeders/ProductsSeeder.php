<?php

namespace Database\Seeders;

use App\Models\Product;
use App\Models\Category;
use App\Models\Collection;
use Illuminate\Database\Seeder;

class ProductsSeeder extends Seeder
{
    /**
     * Run the database seeds.
     * Matches existing database data exactly and adds the 2 new series.
     */
    public function run(): void
    {
        // --- 1. Seed Groom Collection ---
        $groomColl = Collection::where('slug', 'groom-collection')->first();
        $groomCat = Category::where('slug', 'groom-wear')->first();
        if ($groomColl && $groomCat) {
            for ($i = 1; $i <= 11; $i++) {
                Product::updateOrCreate(['slug' => "g{$i}"], [
                    'name' => $this->getGroomName($i),
                    'description' => $this->getGroomDesc($i),
                    'price' => $this->getGroomPrice($i),
                    'category_id' => $groomCat->id,
                    'collection_id' => $groomColl->id,
                    'is_featured' => $i !== 3,
                    'availability' => 'In Stock',
                    'sizing' => $this->getGroomSizing($i),
                ]);
            }
        }

        // --- 2. Seed Havana Collection ---
        $havanaColl = Collection::where('slug', 'havana-collection')->first();
        $casualCat = Category::where('slug', 'casual-wear')->first();
        if ($havanaColl && $casualCat) {
            $havanaItems = [
                'hvn0' => ['name' => 'Havana Linen Shirt', 'price' => 85.00, 'is_featured' => true],
                'hvn3' => ['name' => 'Havana Cotton Trousers', 'price' => 120.00, 'is_featured' => false],
                'hvn1' => ['name' => 'Havana Product 1', 'price' => 149.99, 'is_featured' => true],
                'hvn2' => ['name' => 'Havana Product 2', 'price' => 149.99, 'is_featured' => true],
                'hvn4' => ['name' => 'Havana Product 4', 'price' => 149.99, 'is_featured' => true],
                'hvn5' => ['name' => 'Havana Product 5', 'price' => 149.99, 'is_featured' => true],
                'hvn6' => ['name' => 'Havana Product 6', 'price' => 149.99, 'is_featured' => true],
                'hvn7' => ['name' => 'Havana Product 7', 'price' => 149.99, 'is_featured' => true],
                'hvn8' => ['name' => 'Havana Product 8', 'price' => 149.99, 'is_featured' => true],
            ];
            foreach ($havanaItems as $slug => $data) {
                Product::updateOrCreate(['slug' => $slug], [
                    'name' => $data['name'],
                    'description' => $slug === 'hvn0' ? 'Lightweight linen shirt for a relaxed, stylish look.' : ($slug === 'hvn3' ? 'Comfortable and breathable cotton trousers.' : 'A breezy and stylish piece perfect for warm evenings.'),
                    'price' => $data['price'],
                    'category_id' => $casualCat->id,
                    'collection_id' => $havanaColl->id,
                    'is_featured' => $data['is_featured'],
                    'availability' => 'In Stock',
                    'sizing' => $slug === 'hvn0' ? ['S', 'M', 'L', 'XL'] : ($slug === 'hvn3' ? ['30', '32', '34', '36'] : ['XS', 'S', 'M', 'L']),
                ]);
            }
        }

        // --- 3. Seed Mocha Mousse Collection ---
        $mochaColl = Collection::where('slug', 'mocha-mousse-25')->first();
        $everydayCat = Category::where('slug', 'everyday-wear')->first();
        if ($mochaColl && $everydayCat) {
            $mochaItems = [
                'mm1' => ['name' => 'Mocha Mousse Blazer', 'price' => 350.00, 'is_featured' => true],
                'mm3' => ['name' => 'Mocha Mousse Dress Shirt', 'price' => 90.00, 'is_featured' => false],
                'mm2' => ['name' => 'Mocha Mousse Product 2', 'price' => 249.99, 'is_featured' => true],
                'mm4' => ['name' => 'Mocha Mousse Product 4', 'price' => 249.99, 'is_featured' => true],
                'mm5' => ['name' => 'Mocha Mousse Product 5', 'price' => 249.99, 'is_featured' => true],
                'mm6' => ['name' => 'Mocha Mousse Product 6', 'price' => 249.99, 'is_featured' => true],
                'mm7' => ['name' => 'Mocha Mousse Product 7', 'price' => 249.99, 'is_featured' => true],
            ];
            foreach ($mochaItems as $slug => $data) {
                Product::updateOrCreate(['slug' => $slug], [
                    'name' => $data['name'],
                    'description' => $slug === 'mm1' ? 'Sophisticated blazer with a modern cut.' : ($slug === 'mm3' ? 'Crisp dress shirt, ideal for business or casual wear.' : 'A soft and breathable garment, perfect for sophisticated comfort.'),
                    'price' => $data['price'],
                    'category_id' => $everydayCat->id,
                    'collection_id' => $mochaColl->id,
                    'is_featured' => $data['is_featured'],
                    'availability' => 'In Stock',
                    'sizing' => $slug === 'mm1' ? ['48', '50', '52'] : ($slug === 'mm3' ? ['S', 'M', 'L'] : ['XS', 'S', 'M', 'L', 'XL']),
                ]);
            }
        }

        // --- 4. Seed Office Collection ---
        $officeColl = Collection::where('slug', 'office-collections')->first();
        $formalCat = Category::where('slug', 'formal-wear')->first();
        if ($officeColl && $formalCat) {
            $officeItems = [
                'of1' => ['name' => 'Office Professional Trousers', 'price' => 150.00, 'is_featured' => true],
                'of2' => ['name' => 'Office Product 2', 'price' => 399.99, 'is_featured' => true],
                'of4' => ['name' => 'Office Product 4', 'price' => 399.99, 'is_featured' => true],
                'of5' => ['name' => 'Office Product 5', 'price' => 399.99, 'is_featured' => true],
                'of3' => ['name' => 'Office suits', 'price' => 60.00, 'is_featured' => false],
            ];
            foreach ($officeItems as $slug => $data) {
                Product::updateOrCreate(['slug' => $slug], [
                    'name' => $data['name'],
                    'description' => $slug === 'of1' ? 'Smart and comfortable trousers for the office.' : ($slug === 'of3' ? 'A luxurious silk tie to complete your professional attire.' : 'A sharp and modern piece designed for the professional environment.'),
                    'price' => $data['price'],
                    'category_id' => $formalCat->id,
                    'collection_id' => $officeColl->id,
                    'is_featured' => $data['is_featured'],
                    'availability' => 'In Stock',
                    'sizing' => $slug === 'of1' ? ['30', '32', '34', '36'] : ($slug === 'of3' ? ['One Size'] : ['S', 'M', 'L']),
                ]);
            }
        }

        // --- 5. Seed Accessories Collection ---
        $accColl = Collection::where('slug', 'accessories')->first();
        $accCat = Category::where('slug', 'accessories')->first();
        if ($accColl && $accCat) {
            $accessoriesItems = [
                'red69' => 'Red Tie 69$', 'white69' => 'White Tie 69$', 'green49' => 'Green Tie 49$',
                'blue69' => 'Blue Tie 69$', 'brown69' => 'Brown Tie 69$', 'cream49' => 'Cream Tie 49$',
                'cyan69' => 'Cyan Tie 69$', 'psblue' => 'Pocket Square Blue', 'psgreen' => 'Pocket Square Green',
                'pspink' => 'Pocket Square Pink', 'psred' => 'Pocket Square Red', 'psyellow' => 'Pocket Square Yellow',
                'psyellowgreen' => 'Pocket Square Yellow Green',
            ];
            foreach ($accessoriesItems as $slug => $name) {
                Product::updateOrCreate(['slug' => $slug], [
                    'name' => $name,
                    'description' => str_contains($slug, 'Tie') ? 'A premium silk tie.' : 'A fine pocket square.',
                    'price' => (float) preg_replace('/[^0-9.]/', '', $name) ?: 20.00,
                    'category_id' => $accCat->id,
                    'collection_id' => $accColl->id,
                    'is_featured' => $slug === 'red69',
                    'availability' => 'In Stock',
                    'sizing' => ['One Size'],
                ]);
            }
        }

        // --- 6. Seed Travel Collection ---
        $travelColl = Collection::where('slug', 'travel-collection')->first();
        $suitsCat = Category::where('slug', 'suits')->first();
        if ($travelColl && $suitsCat) {
            for ($i = 0; $i <= 10; $i++) {
                Product::updateOrCreate(['slug' => "t{$i}"], [
                    'name' => "Travel Collection Item T{$i}",
                    'description' => 'Stylish and durable essentials for the modern explorer.',
                    'price' => 250.00,
                    'category_id' => $suitsCat->id,
                    'collection_id' => $travelColl->id,
                    'is_featured' => $i === 0,
                    'availability' => 'In Stock',
                    'sizing' => ['One Size'],
                ]);
            }
        }

        // --- 7. Seed Shades of Elegance (NEW) ---
        $shadesColl = Collection::where('slug', 'shades-of-elegance')->first();
        if ($shadesColl && $suitsCat) {
            for ($i = 1; $i <= 11; $i++) {
                Product::updateOrCreate(['slug' => "shades-{$i}"], [
                    'name' => "Shades of Elegance Item {$i}",
                    'description' => 'A definitive visual catalog of styling excellence.',
                    'price' => 450.00,
                    'category_id' => $suitsCat->id,
                    'collection_id' => $shadesColl->id,
                    'is_featured' => $i <= 4,
                    'availability' => 'In Stock',
                    'sizing' => ['48', '50', '52', '54'],
                ]);
            }
        }

        // --- 8. Seed Street Sartorial (NEW) ---
        $streetColl = Collection::where('slug', 'street-sartorial')->first();
        if ($streetColl && $casualCat) {
            for ($i = 1; $i <= 10; $i++) {
                Product::updateOrCreate(['slug' => "street-{$i}"], [
                    'name' => "Street Sartorial Item {$i}",
                    'description' => 'Contemporary silhouettes meeting traditional craftsmanship.',
                    'price' => 299.00,
                    'category_id' => $casualCat->id,
                    'collection_id' => $streetColl->id,
                    'is_featured' => $i <= 3,
                    'availability' => 'In Stock',
                    'sizing' => ['S', 'M', 'L', 'XL'],
                ]);
            }
        }
    }

    private function getGroomName($i) {
        if ($i === 1) return 'Classic Wedding Suit';
        if ($i === 2) return 'Ceremonial Velvet Tuxedo';
        if ($i === 3) return 'Reception Tuxedo';
        return "Groom Product {$i}";
    }

    private function getGroomDesc($i) {
        if ($i === 1) return 'An elegant suit perfect for your special day.';
        if ($i === 2) return 'A luxurious velvet tuxedo for the most memorable occasions.';
        if ($i === 3) return 'Stylish tuxedo for evening receptions.';
        return 'A timeless black tuxedo for the discerning groom.';
    }

    private function getGroomPrice($i) {
        if ($i === 1) return 1200.00;
        if ($i === 2) return 1500.00;
        if ($i === 3) return 950.00;
        return 599.99;
    }

    private function getGroomSizing($i) {
        if ($i === 1) return ['40R', '42R', '44R'];
        if ($i === 2) return ['40R', '42R', '44R', '46R'];
        if ($i === 3) return ['38R', '40R', '42R'];
        return ['S', 'M', 'L', 'XL'];
    }
}
