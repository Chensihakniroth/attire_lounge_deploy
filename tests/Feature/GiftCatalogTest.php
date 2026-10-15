<?php

namespace Tests\Feature;

use App\Models\GiftItem;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Laravel\Sanctum\Sanctum;
use Spatie\Permission\Models\Role;
use Tests\TestCase;

class GiftCatalogTest extends TestCase
{
    use RefreshDatabase;

    public function test_public_catalog_is_populated_for_the_storefront(): void
    {
        $response = $this->getJson('/api/v1/gift-items');

        $response
            ->assertOk()
            ->assertJsonStructure([
                'ties' => [['id', 'name', 'color', 'price', 'image']],
                'pocket_squares' => [['id', 'name', 'color', 'price', 'image']],
                'boxes' => [['id', 'name', 'color', 'price', 'image']],
            ])
            ->assertJsonCount(7, 'ties')
            ->assertJsonCount(6, 'pocket_squares')
            ->assertJsonCount(3, 'boxes');
    }

    public function test_admin_can_hide_and_show_an_item_on_the_storefront(): void
    {
        $adminRole = Role::create(['name' => 'admin']);
        $admin = User::factory()->create();
        $admin->assignRole($adminRole);
        Sanctum::actingAs($admin);

        $item = GiftItem::where('item_id', 'tie-brown69')->firstOrFail();

        $this->patchJson("/api/v1/admin/gift-items/{$item->item_id}/visibility", [
            'is_active' => false,
        ])
            ->assertOk()
            ->assertJsonPath('is_active', false);

        $publicIds = collect($this->getJson('/api/v1/gift-items')->json('ties'))->pluck('id');
        $this->assertFalse($publicIds->contains($item->item_id));

        $adminItem = collect($this->getJson('/api/v1/admin/gift-items')->json('ties'))
            ->firstWhere('id', $item->item_id);
        $this->assertFalse($adminItem['is_active']);

        $this->patchJson("/api/v1/admin/gift-items/{$item->item_id}/visibility", [
            'is_active' => true,
        ])->assertOk()->assertJsonPath('is_active', true);

        $publicIds = collect($this->getJson('/api/v1/gift-items')->json('ties'))->pluck('id');
        $this->assertTrue($publicIds->contains($item->item_id));
    }
}

