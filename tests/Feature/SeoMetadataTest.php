<?php

namespace Tests\Feature;

use App\Models\Collection as ProductCollection;
use App\Models\Category;
use App\Models\Product;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Laravel\Sanctum\Sanctum;
use Spatie\Permission\Models\Role;
use Tests\TestCase;

class SeoMetadataTest extends TestCase
{
    use RefreshDatabase;

    public function test_admin_can_save_seo_metadata_for_products_and_collections(): void
    {
        $adminRole = Role::create(['name' => 'admin']);
        $admin = User::factory()->create();
        $admin->assignRole($adminRole);
        Sanctum::actingAs($admin);

        $category = Category::create([
            'name' => 'SEO Test Category',
            'slug' => 'seo-test-category',
        ]);
        $product = Product::create([
            'name' => 'SEO Test Product',
            'slug' => 'seo-test-product',
            'description' => 'A test product description.',
            'price' => 120,
            'category_id' => $category->id,
            'availability' => 'In Stock',
            'is_visible' => true,
        ]);
        $collection = ProductCollection::create([
            'name' => 'SEO Test Collection',
            'slug' => 'seo-test-collection',
            'year' => 2026,
            'is_active' => true,
        ]);

        $productResponse = $this->putJson("/api/v1/admin/products/{$product->id}", [
            'meta_title' => 'SEO Test Product | Attire Lounge',
            'meta_description' => 'Shop the SEO test product from Attire Lounge.',
        ]);
        $productResponse
            ->assertOk()
            ->assertJsonPath('data.meta_title', 'SEO Test Product | Attire Lounge')
            ->assertJsonPath('data.meta_description', 'Shop the SEO test product from Attire Lounge.');

        $collectionResponse = $this->putJson("/api/v1/admin/collections/{$collection->id}", [
            'meta_title' => 'SEO Test Collection | Attire Lounge',
            'meta_description' => 'Explore the SEO test collection from Attire Lounge.',
        ]);
        $collectionResponse
            ->assertOk()
            ->assertJsonPath('data.meta_title', 'SEO Test Collection | Attire Lounge')
            ->assertJsonPath('data.meta_description', 'Explore the SEO test collection from Attire Lounge.');

        $this->assertSame('SEO Test Product | Attire Lounge', $product->fresh()->meta_title);
        $this->assertSame('SEO Test Collection | Attire Lounge', $collection->fresh()->meta_title);
    }
}
