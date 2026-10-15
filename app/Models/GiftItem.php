<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use App\Traits\Auditable;

class GiftItem extends Model
{
    use HasFactory, Auditable;

    /** The three catalog sections, in storefront display order. */
    public const CATEGORIES = [
        'ties' => 'Ties',
        'pocket_squares' => 'Pocket Squares',
        'boxes' => 'Gift Boxes',
    ];

    protected $fillable = [
        'item_id',
        'name',
        'category',
        'color',
        'price',
        'image',
        'is_active',
        'sort_order',
    ];

    protected $casts = [
        'price' => 'float',
        'is_active' => 'boolean',
        'sort_order' => 'integer',
    ];

    /**
     * Route model binding resolves on the slug, not the auto-increment id —
     * the frontend (and gift_item_stocks.item_id) only ever knows item_id.
     */
    public function getRouteKeyName(): string
    {
        return 'item_id';
    }

    /**
     * Frontend contract shape — matches the legacy giftOptions.js entries so
     * every existing consumer (storefront, POS, export) keeps working.
     */
    public function toOption(): array
    {
        return [
            'id' => $this->item_id,
            'name' => $this->name,
            'color' => $this->color,
            'price' => (float) $this->price,
            'image' => $this->image,
        ];
    }

    /**
     * Admin catalog shape — includes visibility so the inventory screen can
     * offer a reversible hide/show control without exposing admin state in the
     * public storefront response.
     */
    public function toAdminOption(): array
    {
        return $this->toOption() + [
            'is_active' => (bool) $this->is_active,
        ];
    }
}
