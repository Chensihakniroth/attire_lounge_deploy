// resources/js/data/lookbook.js
//
// LOOKBOOK_CATEGORIES drives the filter bar on the Lookbook page.
// Filter IDs are either:
//   a) A product's category_slug (from the DB categories table), or
//   b) A product's collection_slug (for collection-based filters like shades, street)
//
// The LookbookPage checks both category_slug and collection_slug when filtering,
// so products appear under any matching filter regardless of which field matches.

export const LOOKBOOK_CATEGORIES = [
    { id: 'all', name: 'All' },
    { id: 'groom-wear', name: "Groom's Wear" },
    { id: 'formal-wear', name: 'Formal' },
    { id: 'casual-wear', name: 'Casual' },
    { id: 'everyday-wear', name: 'Everyday' },
    { id: 'suits', name: 'Suits' },
    { id: 'accessories', name: 'Accessories' },
    { id: 'shades-of-elegance', name: 'Shades' },
    { id: 'street-sartorial', name: 'Street' },
];
