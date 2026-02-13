<?php

namespace App\Http\Controllers;

use App\Models\GiftItemStock;
use Illuminate\Http\Request;

class GiftItemStockController extends Controller
{
    /**
     * Display a listing of out of stock items.
     */
    public function index()
    {
        $outOfStockItems = GiftItemStock::where('is_out_of_stock', true)
            ->pluck('item_id');
        
        return response()->json($outOfStockItems);
    }

    /**
     * Toggle the out of stock status of an item.
     */
    public function toggle(Request $request)
    {
        $validated = $request->validate([
            'item_id' => 'required|string',
            'is_out_of_stock' => 'required|boolean',
        ]);

        $itemStock = GiftItemStock::updateOrCreate(
            ['item_id' => $validated['item_id']],
            ['is_out_of_stock' => $validated['is_out_of_stock']]
        );

        return response()->json($itemStock);
    }
}
