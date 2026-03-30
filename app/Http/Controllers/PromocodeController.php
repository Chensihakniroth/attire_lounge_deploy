<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\Promocode;
use Carbon\Carbon;

class PromocodeController extends Controller
{
    public function index()
    {
        return response()->json(Promocode::all());
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'discount_percentage' => 'required|integer|min:1|max:100',
            'expires_at' => 'required|date',
            'code' => 'required|string|unique:promocodes',
        ]);

        $promocode = Promocode::create([
            'name' => $validated['name'],
            'discount_percentage' => $validated['discount_percentage'],
            'code' => $validated['code'],
            'expires_at' => Carbon::parse($validated['expires_at']),
        ]);

        return response()->json($promocode, 201);
    }

    public function destroy($id)
    {
        $promocode = Promocode::findOrFail($id);
        $promocode->delete();

        return response()->json(['message' => 'Promocode deleted successfully']);
    }

    public function validateCode(Request $request)
    {
        $request->validate(['code' => 'required|string']);

        $promocode = Promocode::where('code', $request->code)->first();

        if (!$promocode) {
            return response()->json(['valid' => false, 'message' => 'Invalid promo code.'], 200);
        }

        if (Carbon::now()->isAfter($promocode->expires_at)) {
            return response()->json(['valid' => false, 'message' => 'This promo code has expired.'], 400);
        }

        return response()->json([
            'valid' => true,
            'discount_percentage' => $promocode->discount_percentage,
            'code' => $promocode->code
        ]);
    }
}
