<?php

namespace App\Http\Controllers;

use App\Models\GiftItem;
use Illuminate\Http\Request;
use Illuminate\Support\Str;

class GiftItemController extends Controller
{
    /**
     * Public catalog, grouped by category. Consumed by the storefront gift
     * customization page and the admin Inventory Manager.
     */
    public function index()
    {
        $items = GiftItem::where('is_active', true)
            ->orderBy('sort_order')
            ->orderBy('id')
            ->get();

        $grouped = [];
        foreach (GiftItem::CATEGORIES as $key => $label) {
            $grouped[$key] = $items->where('category', $key)->map->toOption()->values();
        }

        return response()->json($grouped);
    }

    /**
     * Full catalog for admin, including inactive items.
     */
    public function adminIndex()
    {
        $items = GiftItem::orderBy('sort_order')->orderBy('id')->get();

        $grouped = [];
        foreach (GiftItem::CATEGORIES as $key => $label) {
            $grouped[$key] = $items->where('category', $key)->map->toOption()->values();
        }

        return response()->json($grouped);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'category' => 'required|string|in:' . implode(',', array_keys(GiftItem::CATEGORIES)),
            'color' => 'nullable|string|max:100',
            'price' => 'required|numeric|min:0',
            'image' => 'nullable|string|max:2048',
        ]);

        // Slug from name+category, made unique. Stable and readable.
        $base = Str::slug($validated['category'] . '-' . $validated['name']);
        $itemId = $base;
        $n = 1;
        while (GiftItem::where('item_id', $itemId)->exists()) {
            $itemId = $base . '-' . (++$n);
        }

        $maxOrder = (int) GiftItem::where('category', $validated['category'])->max('sort_order');

        $item = GiftItem::create($validated + [
            'item_id' => $itemId,
            'sort_order' => $maxOrder + 1,
            'is_active' => true,
        ]);

        return response()->json($item->toOption(), 201);
    }

    public function update(Request $request, GiftItem $giftItem)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'category' => 'required|string|in:' . implode(',', array_keys(GiftItem::CATEGORIES)),
            'color' => 'nullable|string|max:100',
            'price' => 'required|numeric|min:0',
            'image' => 'nullable|string|max:2048',
            'is_active' => 'sometimes|boolean',
        ]);

        // item_id is intentionally immutable — gift_item_stocks and any
        // submitted gift request reference it.
        $giftItem->update($validated);

        return response()->json($giftItem->fresh()->toOption());
    }

    /**
     * Soft delete — deactivate so historical gift requests keep resolving
     * their item name/image and stock rows are not orphaned.
     */
    public function destroy(GiftItem $giftItem)
    {
        $giftItem->update(['is_active' => false]);

        return response()->json(['success' => true, 'item' => $giftItem->toOption()]);
    }
}
