<?php

namespace Tests\Feature;

use Illuminate\Foundation\Testing\RefreshDatabase;
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
}
