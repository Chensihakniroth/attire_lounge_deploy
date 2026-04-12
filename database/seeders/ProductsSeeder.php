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
     * Comprehensive product catalog for Attire Lounge Styling House.
     * Every item has a real name, description, and proper pricing.
     */
    public function run(): void
    {
        // --- 1. Groom Collection ─────────────────────────────────────
        $groomColl = Collection::where('slug', 'groom-collection')->first();
        $groomCat  = Category::where('slug', 'groom-wear')->first();
        if ($groomColl && $groomCat) {
            $groomItems = [
                'g1'  => ['name' => 'Classic Wedding Suit',            'price' => 1200.00, 'desc' => 'An elegant two-piece suit with a slim-cut silhouette, perfect for your special day.',                      'sizing' => ['40R','42R','44R'],           'featured' => true],
                'g2'  => ['name' => 'Ceremonial Velvet Tuxedo',        'price' => 1500.00, 'desc' => 'A luxurious velvet tuxedo for the most memorable occasions, featuring satin peak lapels.',              'sizing' => ['40R','42R','44R','46R'],     'featured' => true],
                'g3'  => ['name' => 'Reception Tuxedo',                'price' =>  950.00, 'desc' => 'Stylish midnight-blue tuxedo for evening receptions and after-party elegance.',                          'sizing' => ['38R','40R','42R'],           'featured' => false],
                'g4'  => ['name' => 'Ivory Shawl-Collar Dinner Jacket','price' =>  680.00, 'desc' => 'A contemporary ivory dinner jacket with shawl collar, ideal for destination weddings.',                  'sizing' => ['S','M','L','XL'],           'featured' => true],
                'g5'  => ['name' => 'Charcoal Morning Suit',           'price' =>  850.00, 'desc' => 'Traditional morning suit with tails, perfect for daytime ceremonies and garden weddings.',                'sizing' => ['S','M','L','XL'],           'featured' => true],
                'g6'  => ['name' => 'Black Peak-Lapel Tuxedo',         'price' =>  790.00, 'desc' => 'Timeless black tuxedo with peak lapels, grosgrain trim, and a one-button closure.',                      'sizing' => ['S','M','L','XL','2XL'],     'featured' => true],
                'g7'  => ['name' => 'Navy Double-Breasted Suit',       'price' =>  720.00, 'desc' => 'A structured double-breasted suit in deep navy, perfect for formal engagement parties.',                  'sizing' => ['S','M','L','XL'],           'featured' => true],
                'g8'  => ['name' => 'Burgundy Velvet Blazer',          'price' =>  450.00, 'desc' => 'Rich burgundy velvet blazer that commands attention at any rehearsal dinner.',                             'sizing' => ['S','M','L','XL'],           'featured' => true],
                'g9'  => ['name' => 'White Mandarin-Collar Suit',      'price' =>  880.00, 'desc' => 'Modern mandarin-collar suit in crisp white, designed for minimalist grooms.',                              'sizing' => ['S','M','L','XL'],           'featured' => true],
                'g10' => ['name' => 'Three-Piece Pinstripe Suit',      'price' => 1100.00, 'desc' => 'Distinguished three-piece with subtle chalk pinstripes, vest, and matching trousers.',                    'sizing' => ['40R','42R','44R','46R'],    'featured' => true],
                'g11' => ['name' => 'Champagne Satin-Trim Tuxedo',     'price' => 1350.00, 'desc' => 'Champagne-toned tuxedo with satin shawl lapels, a showpiece for evening nuptials.',                       'sizing' => ['38R','40R','42R','44R'],    'featured' => true],
            ];
            foreach ($groomItems as $slug => $data) {
                Product::updateOrCreate(['slug' => $slug], [
                    'name'          => $data['name'],
                    'description'   => $data['desc'],
                    'price'         => $data['price'],
                    'category_id'   => $groomCat->id,
                    'collection_id' => $groomColl->id,
                    'is_featured'   => $data['featured'],
                    'availability'  => 'In Stock',
                    'sizing'        => $data['sizing'],
                ]);
            }
        }

        // --- 2. Havana Collection ────────────────────────────────────
        $havanaColl = Collection::where('slug', 'havana-collection')->first();
        $casualCat  = Category::where('slug', 'casual-wear')->first();
        if ($havanaColl && $casualCat) {
            $havanaItems = [
                'hvn0' => ['name' => 'Havana Linen Shirt',            'price' =>  85.00, 'desc' => 'Lightweight linen shirt for a relaxed, stylish look — breezy Cuban-collar cut.',             'sizing' => ['S','M','L','XL'],       'featured' => true],
                'hvn1' => ['name' => 'Havana Camp-Collar Shirt',      'price' =>  95.00, 'desc' => 'Short-sleeve camp-collar shirt in earthy terracotta, perfect for sunset cocktails.',          'sizing' => ['S','M','L','XL'],       'featured' => true],
                'hvn2' => ['name' => 'Havana Guayabera',              'price' => 110.00, 'desc' => 'Traditional guayabera with four pockets, updated with a modern slim fit.',                    'sizing' => ['S','M','L','XL','2XL'], 'featured' => true],
                'hvn3' => ['name' => 'Havana Cotton Trousers',        'price' => 120.00, 'desc' => 'Comfortable and breathable cotton trousers with a relaxed tapered leg.',                      'sizing' => ['30','32','34','36'],    'featured' => false],
                'hvn4' => ['name' => 'Havana Drawstring Linen Pants', 'price' => 105.00, 'desc' => 'Elastic-waist linen pants with a drawstring, effortless resort-ready style.',                 'sizing' => ['S','M','L','XL'],       'featured' => true],
                'hvn5' => ['name' => 'Havana Mandarin Linen Blazer',  'price' => 220.00, 'desc' => 'Unstructured linen blazer with mandarin collar, a laid-back take on tailoring.',              'sizing' => ['S','M','L','XL'],       'featured' => true],
                'hvn6' => ['name' => 'Havana Open-Weave Polo',        'price' =>  75.00, 'desc' => 'Textured open-weave polo knit in sand, designed for warm-climate sophistication.',            'sizing' => ['S','M','L','XL'],       'featured' => true],
                'hvn7' => ['name' => 'Havana Chambray Short-Sleeve',  'price' =>  90.00, 'desc' => 'Washed chambray shirt with a casual, lived-in hand feel — pair with rolled chinos.',          'sizing' => ['S','M','L','XL'],       'featured' => true],
                'hvn8' => ['name' => 'Havana Pleated Linen Shorts',   'price' =>  80.00, 'desc' => 'Single-pleat linen shorts that bridge casual and polished for any island getaway.',            'sizing' => ['30','32','34','36'],    'featured' => true],
            ];
            foreach ($havanaItems as $slug => $data) {
                Product::updateOrCreate(['slug' => $slug], [
                    'name'          => $data['name'],
                    'description'   => $data['desc'],
                    'price'         => $data['price'],
                    'category_id'   => $casualCat->id,
                    'collection_id' => $havanaColl->id,
                    'is_featured'   => $data['featured'],
                    'availability'  => 'In Stock',
                    'sizing'        => $data['sizing'],
                ]);
            }
        }

        // --- 3. Mocha Mousse '25 Collection ──────────────────────────
        $mochaColl    = Collection::where('slug', 'mocha-mousse-25')->first();
        $everydayCat  = Category::where('slug', 'everyday-wear')->first();
        if ($mochaColl && $everydayCat) {
            $mochaItems = [
                'mm1' => ['name' => 'Mocha Mousse Blazer',           'price' => 350.00, 'desc' => 'Sophisticated warm-toned blazer with a modern cut, soft shoulder construction.',                  'sizing' => ['48','50','52'],           'featured' => true],
                'mm2' => ['name' => 'Mocha Mousse Knit Polo',        'price' => 120.00, 'desc' => 'Fine-gauge merino polo in mocha, the perfect smart-casual layering piece.',                       'sizing' => ['S','M','L','XL'],         'featured' => true],
                'mm3' => ['name' => 'Mocha Mousse Dress Shirt',      'price' =>  90.00, 'desc' => 'Crisp cotton dress shirt in a warm taupe, ideal for business or elevated casual.',                'sizing' => ['S','M','L'],              'featured' => false],
                'mm4' => ['name' => 'Mocha Mousse Chinos',           'price' => 140.00, 'desc' => 'Stretch-cotton chinos in the season\'s signature mocha, tapered for a clean line.',               'sizing' => ['30','32','34','36'],      'featured' => true],
                'mm5' => ['name' => 'Mocha Mousse Linen Suit',       'price' => 480.00, 'desc' => 'Full linen suit in warm mousse, half-lined for breathability — a summer staple.',                 'sizing' => ['48','50','52','54'],      'featured' => true],
                'mm6' => ['name' => 'Mocha Mousse Turtleneck',       'price' =>  95.00, 'desc' => 'Lightweight merino turtleneck, perfect for layering under blazers in cooler months.',             'sizing' => ['S','M','L','XL'],         'featured' => true],
                'mm7' => ['name' => 'Mocha Mousse Suede Loafers',    'price' => 260.00, 'desc' => 'Italian suede loafers in a rich mousse tone with leather sole and hand-sewn apron.',              'sizing' => ['40','41','42','43','44'], 'featured' => true],
            ];
            foreach ($mochaItems as $slug => $data) {
                Product::updateOrCreate(['slug' => $slug], [
                    'name'          => $data['name'],
                    'description'   => $data['desc'],
                    'price'         => $data['price'],
                    'category_id'   => $everydayCat->id,
                    'collection_id' => $mochaColl->id,
                    'is_featured'   => $data['featured'],
                    'availability'  => 'In Stock',
                    'sizing'        => $data['sizing'],
                ]);
            }
        }

        // --- 4. Office Collection ────────────────────────────────────
        $officeColl = Collection::where('slug', 'office-collections')->first();
        $formalCat  = Category::where('slug', 'formal-wear')->first();
        if ($officeColl && $formalCat) {
            $officeItems = [
                'of1' => ['name' => 'Office Professional Trousers',    'price' => 150.00, 'desc' => 'Smart and comfortable flat-front trousers in charcoal wool-blend.',                                  'sizing' => ['30','32','34','36'],      'featured' => true],
                'of2' => ['name' => 'Executive Navy Blazer',           'price' => 420.00, 'desc' => 'Structured half-canvas blazer in navy — boardroom-ready with gold-tone buttons.',                    'sizing' => ['S','M','L','XL'],         'featured' => true],
                'of3' => ['name' => 'Slim-Fit Office Suit',            'price' => 580.00, 'desc' => 'Two-piece slim-fit suit in mid-grey super 120s wool, ideal for daily executive wear.',                'sizing' => ['46','48','50','52'],      'featured' => false],
                'of4' => ['name' => 'French-Cuff Dress Shirt',         'price' =>  95.00, 'desc' => 'Premium Egyptian cotton dress shirt with French cuffs, pairs perfectly with cufflinks.',               'sizing' => ['S','M','L','XL','2XL'],  'featured' => true],
                'of5' => ['name' => 'Herringbone Vest',                'price' => 180.00, 'desc' => 'Tailored herringbone waistcoat that adds structure to any office ensemble.',                           'sizing' => ['S','M','L','XL'],         'featured' => true],
            ];
            foreach ($officeItems as $slug => $data) {
                Product::updateOrCreate(['slug' => $slug], [
                    'name'          => $data['name'],
                    'description'   => $data['desc'],
                    'price'         => $data['price'],
                    'category_id'   => $formalCat->id,
                    'collection_id' => $officeColl->id,
                    'is_featured'   => $data['featured'],
                    'availability'  => 'In Stock',
                    'sizing'        => $data['sizing'],
                ]);
            }
        }

        // --- 5. Accessories Collection ───────────────────────────────
        $accColl = Collection::where('slug', 'accessories')->first();
        $accCat  = Category::where('slug', 'accessories')->first();
        if ($accColl && $accCat) {
            $accessoryItems = [
                // Ties
                'red69'          => ['name' => 'Crimson Silk Tie',               'price' =>  69.00, 'desc' => 'Hand-stitched pure silk tie in a deep crimson — a boardroom essential.'],
                'white69'        => ['name' => 'Pearl White Silk Tie',           'price' =>  69.00, 'desc' => 'Elegant pearl white silk tie perfect for weddings and formal events.'],
                'green49'        => ['name' => 'Forest Green Silk Tie',          'price' =>  49.00, 'desc' => 'Rich forest green tie with a subtle herringbone texture.'],
                'blue69'         => ['name' => 'Royal Blue Silk Tie',            'price' =>  69.00, 'desc' => 'Bold royal blue tie that adds a pop of color to any navy suit.'],
                'brown69'        => ['name' => 'Espresso Brown Silk Tie',        'price' =>  69.00, 'desc' => 'Warm espresso brown tie, pairs beautifully with tan and mocha tones.'],
                'cream49'        => ['name' => 'Cream Linen Tie',               'price' =>  49.00, 'desc' => 'Lightweight cream linen tie for relaxed summer tailoring.'],
                'cyan69'         => ['name' => 'Teal Silk Tie',                  'price' =>  69.00, 'desc' => 'Distinctive teal silk tie with a micro-dot pattern.'],
                // Pocket squares
                'psblue'         => ['name' => 'Navy Pocket Square',             'price' =>  25.00, 'desc' => 'Hand-rolled Italian silk pocket square in a classic navy print.'],
                'psgreen'        => ['name' => 'Emerald Pocket Square',          'price' =>  25.00, 'desc' => 'Emerald green pocket square with a contrasting rolled edge.'],
                'pspink'         => ['name' => 'Blush Pink Pocket Square',       'price' =>  25.00, 'desc' => 'Soft blush pink silk square, the finishing touch for wedding attire.'],
                'psred'          => ['name' => 'Ruby Red Pocket Square',         'price' =>  25.00, 'desc' => 'Vibrant ruby red pocket square, perfect for adding a bold accent.'],
                'psyellow'       => ['name' => 'Saffron Pocket Square',          'price' =>  25.00, 'desc' => 'Warm saffron pocket square with a subtle paisley motif.'],
                'psyellowgreen'  => ['name' => 'Chartreuse Pocket Square',       'price' =>  25.00, 'desc' => 'Eye-catching chartreuse pocket square for the fashion-forward gentleman.'],
                // Cufflinks & extras
                'cuff-gold'      => ['name' => 'Gold Knot Cufflinks',            'price' =>  45.00, 'desc' => 'Classic knot-design cufflinks in brushed gold-tone finish.'],
                'cuff-silver'    => ['name' => 'Silver Bar Cufflinks',           'price' =>  45.00, 'desc' => 'Minimalist silver bar cufflinks with a polished mirror finish.'],
                'belt-black'     => ['name' => 'Black Italian Leather Belt',     'price' =>  85.00, 'desc' => 'Full-grain Italian leather belt with a matte nickel buckle.'],
                'belt-brown'     => ['name' => 'Tan Italian Leather Belt',       'price' =>  85.00, 'desc' => 'Hand-burnished tan leather belt, pairs with any brown-tone outfit.'],
            ];
            foreach ($accessoryItems as $slug => $data) {
                Product::updateOrCreate(['slug' => $slug], [
                    'name'          => $data['name'],
                    'description'   => $data['desc'],
                    'price'         => $data['price'],
                    'category_id'   => $accCat->id,
                    'collection_id' => $accColl->id,
                    'is_featured'   => in_array($slug, ['red69', 'cuff-gold', 'belt-black']),
                    'availability'  => 'In Stock',
                    'sizing'        => in_array($slug, ['belt-black', 'belt-brown']) ? ['30','32','34','36','38'] : ['One Size'],
                ]);
            }
        }

        // --- 6. Travel Collection ────────────────────────────────────
        $travelColl = Collection::where('slug', 'travel-collection')->first();
        $suitsCat   = Category::where('slug', 'suits')->first();
        if ($travelColl && $suitsCat) {
            $travelItems = [
                't0'  => ['name' => 'Voyager Wrinkle-Free Blazer',     'price' => 320.00, 'desc' => 'Performance-stretch blazer that resists wrinkles, designed for the jet-setter.',       'featured' => true],
                't1'  => ['name' => 'Nomad Stretch Chinos',            'price' => 130.00, 'desc' => 'Four-way stretch chinos with hidden zip pockets — security meets style.',              'featured' => true],
                't2'  => ['name' => 'Explorer Merino Polo',            'price' =>  95.00, 'desc' => 'Temperature-regulating merino polo, naturally odor-resistant for long journeys.',       'featured' => true],
                't3'  => ['name' => 'Transit Packable Suit Jacket',    'price' => 280.00, 'desc' => 'Folds into its own pocket and emerges wrinkle-free — the ultimate travel companion.',  'featured' => false],
                't4'  => ['name' => 'Waypoint Technical Vest',         'price' => 160.00, 'desc' => 'Lightweight insulating vest with hidden travel pockets and water-resistant shell.',     'featured' => false],
                't5'  => ['name' => 'Passport Linen Shirt',            'price' =>  85.00, 'desc' => 'Relaxed-fit linen shirt in a neutral stone wash, ideal for tropical transit.',          'featured' => false],
                't6'  => ['name' => 'Traverse Hybrid Shorts',          'price' =>  75.00, 'desc' => 'Shorts with a tailored look and athletic performance — beach to bar seamlessly.',       'featured' => false],
                't7'  => ['name' => 'Globe-Trotter Harrington Jacket', 'price' => 240.00, 'desc' => 'Classic Harrington silhouette with weather-proof coating and tartan lining.',            'featured' => false],
                't8'  => ['name' => 'Red-Eye Comfort Joggers',         'price' => 110.00, 'desc' => 'Premium knit joggers engineered for long-haul comfort without sacrificing style.',       'featured' => false],
                't9'  => ['name' => 'Altitude Performance Tee',        'price' =>  55.00, 'desc' => 'Moisture-wicking performance tee with UPF 50+ sun protection, minimal design.',         'featured' => false],
                't10' => ['name' => 'Expedition Weekender Bag',        'price' => 195.00, 'desc' => 'Canvas and leather weekender bag with shoe compartment — carry-on approved.',             'featured' => false],
            ];
            foreach ($travelItems as $slug => $data) {
                Product::updateOrCreate(['slug' => $slug], [
                    'name'          => $data['name'],
                    'description'   => $data['desc'],
                    'price'         => $data['price'],
                    'category_id'   => $suitsCat->id,
                    'collection_id' => $travelColl->id,
                    'is_featured'   => $data['featured'],
                    'availability'  => 'In Stock',
                    'sizing'        => $slug === 't10' ? ['One Size'] : ['S','M','L','XL'],
                ]);
            }
        }

        // --- 7. Shades of Elegance ───────────────────────────────────
        $shadesColl = Collection::where('slug', 'shades-of-elegance')->first();
        if ($shadesColl && $suitsCat) {
            $shadesItems = [
                'shades-1'  => ['name' => 'Midnight Formal Suit',           'price' => 520.00, 'desc' => 'Deep midnight two-piece suit with subtle sheen — for galas and black-tie affairs.'],
                'shades-2'  => ['name' => 'Slate Grey Business Suit',       'price' => 480.00, 'desc' => 'Sophisticated slate grey suit in super 130s wool, ultra-refined drape.'],
                'shades-3'  => ['name' => 'Obsidian Peak-Lapel Suit',       'price' => 550.00, 'desc' => 'Jet-black peak-lapel suit with hand-finished buttonholes and fused canvas.'],
                'shades-4'  => ['name' => 'Graphite Pinstripe Suit',        'price' => 500.00, 'desc' => 'Graphite suit with tonal pinstripes, dual vents, and surgeon cuffs.'],
                'shades-5'  => ['name' => 'Pewter Double-Breasted Suit',    'price' => 580.00, 'desc' => 'Imposing double-breasted silhouette in pewter grey, six-on-two button closure.'],
                'shades-6'  => ['name' => 'Charcoal Windowpane Suit',       'price' => 460.00, 'desc' => 'Charcoal with subtle windowpane check pattern, classic notch lapel.'],
                'shades-7'  => ['name' => 'Onyx Slim-Cut Suit',             'price' => 490.00, 'desc' => 'Contemporary slim-cut in onyx black, minimal detailing for a sharp clean look.'],
                'shades-8'  => ['name' => 'Storm Blue Italian Suit',        'price' => 540.00, 'desc' => 'Storm blue imported Italian wool suit, half-canvas construction.'],
                'shades-9'  => ['name' => 'Carbon Textured Suit',           'price' => 470.00, 'desc' => 'Carbon-toned suit with a micro-textured weave, excellent for client-facing days.'],
                'shades-10' => ['name' => 'Silver Mist Evening Suit',       'price' => 620.00, 'desc' => 'Pale silver suit with a mist finish, designed for twilight ceremonies.'],
                'shades-11' => ['name' => 'Iron Flannel Three-Piece',       'price' => 680.00, 'desc' => 'Heavy flannel three-piece in iron grey, the apex of cold-weather suiting.'],
            ];
            foreach ($shadesItems as $slug => $data) {
                Product::updateOrCreate(['slug' => $slug], [
                    'name'          => $data['name'],
                    'description'   => $data['desc'],
                    'price'         => $data['price'],
                    'category_id'   => $suitsCat->id,
                    'collection_id' => $shadesColl->id,
                    'is_featured'   => in_array($slug, ['shades-1','shades-2','shades-3','shades-4']),
                    'availability'  => 'In Stock',
                    'sizing'        => ['48','50','52','54'],
                ]);
            }
        }

        // --- 8. Street Sartorial ─────────────────────────────────────
        $streetColl = Collection::where('slug', 'street-sartorial')->first();
        if ($streetColl && $casualCat) {
            $streetItems = [
                'street-1'  => ['name' => 'Deconstructed Linen Blazer',     'price' => 280.00, 'desc' => 'Unstructured linen blazer with raw-edge details — tailoring meets streetwear.'],
                'street-2'  => ['name' => 'Oversized Band-Collar Shirt',    'price' => 120.00, 'desc' => 'Relaxed-fit band-collar shirt in washed grey, effortlessly cool.'],
                'street-3'  => ['name' => 'Cropped Wide-Leg Trousers',      'price' => 160.00, 'desc' => 'Cropped wide-leg trousers with a high rise, modern proportions.'],
                'street-4'  => ['name' => 'Knit Bomber Jacket',             'price' => 240.00, 'desc' => 'Heavyweight knit bomber with contrast ribbing and satin lining.'],
                'street-5'  => ['name' => 'Graphic Jacquard Vest',          'price' => 180.00, 'desc' => 'Jacquard knit vest with geometric patterns — a statement layering piece.'],
                'street-6'  => ['name' => 'Utility Cargo Trousers',         'price' => 145.00, 'desc' => 'Tapered cargo trousers with hidden pockets, elevated with premium cotton.'],
                'street-7'  => ['name' => 'Monochrome Hoodie',              'price' =>  95.00, 'desc' => 'Premium heavyweight hoodie in double-faced jersey with kangaroo pocket.'],
                'street-8'  => ['name' => 'Patchwork Denim Jacket',         'price' => 320.00, 'desc' => 'Artisan patchwork denim jacket, each panel sourced from premium selvedge.'],
                'street-9'  => ['name' => 'Asymmetric Zip Tee',             'price' =>  75.00, 'desc' => 'Avant-garde tee with asymmetric zip detail and dropped shoulder seams.'],
                'street-10' => ['name' => 'Textured Knit Cardigan',         'price' => 195.00, 'desc' => 'Chunky textured knit cardigan with horn buttons and ribbed shawl collar.'],
            ];
            foreach ($streetItems as $slug => $data) {
                Product::updateOrCreate(['slug' => $slug], [
                    'name'          => $data['name'],
                    'description'   => $data['desc'],
                    'price'         => $data['price'],
                    'category_id'   => $casualCat->id,
                    'collection_id' => $streetColl->id,
                    'is_featured'   => in_array($slug, ['street-1','street-2','street-3']),
                    'availability'  => 'In Stock',
                    'sizing'        => ['S','M','L','XL'],
                ]);
            }
        }
    }
}
