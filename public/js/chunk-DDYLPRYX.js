import {
  config_default
} from "./chunk-4VPB5FGN.js";

// resources/js/data/products.js
var createProductItems = (collection, prefix, name, count, priceRange) => {
  return Array.from({ length: count }, (_, i) => ({
    id: `${prefix}${i + 1}`,
    name: `${name} Style ${i + 1}`,
    collection,
    collectionSlug: collection.toLowerCase().replace(/ /g, "-").replace(/'/g, ""),
    price: Math.floor(Math.random() * (priceRange[1] - priceRange[0] + 1)) + priceRange[0],
    images: [`${config_default}/uploads/collections/default/${prefix}${i + 1}.jpg`],
    createdAt: new Date(Date.now() - Math.floor(Math.random() * 30) * 24 * 60 * 60 * 1e3),
    // Randomly in the last 30 days
    popularity: Math.random()
  }));
};
var products = [
  ...createProductItems("Havana Collection", "hvn", "Havana", 8, [150, 450]),
  ...createProductItems("Mocha Mousse '25", "mm", "Mocha Mousse", 7, [180, 500]),
  ...createProductItems("Groom Collection", "g", "Groom", 10, [250, 800]),
  ...createProductItems("Office Collection", "of", "Office", 5, [200, 550]),
  {
    id: "cuff",
    name: "Cufflinks",
    collection: "Accessories",
    collectionSlug: "accessories",
    price: 120,
    images: [`${config_default}/uploads/collections/accessories/cuff.JPG`],
    createdAt: /* @__PURE__ */ new Date(),
    popularity: 0.98,
    description: "Elegant cufflinks to complete your look."
  },
  // New Ties
  {
    id: "brown69",
    name: "Brown Silk Tie (Premium)",
    collection: "Accessories",
    collectionSlug: "accessories",
    price: 85,
    images: [`${config_default}/uploads/collections/accessories/brown69.jpg`],
    createdAt: /* @__PURE__ */ new Date(),
    popularity: 0.9,
    description: "A premium brown silk tie."
  },
  {
    id: "cream49",
    name: "Cream Silk Tie",
    collection: "Accessories",
    collectionSlug: "accessories",
    price: 85,
    images: [`${config_default}/uploads/collections/accessories/cream49.jpg`],
    createdAt: /* @__PURE__ */ new Date(),
    popularity: 0.85,
    description: "An elegant cream silk tie."
  },
  {
    id: "cyan69",
    name: "Cyan Silk Tie",
    collection: "Accessories",
    collectionSlug: "accessories",
    price: 85,
    images: [`${config_default}/uploads/collections/accessories/cyan69.jpg`],
    createdAt: /* @__PURE__ */ new Date(),
    popularity: 0.88,
    description: "A vibrant cyan silk tie."
  },
  {
    id: "blue69",
    name: "Deep Blue Silk Tie",
    collection: "Accessories",
    collectionSlug: "accessories",
    price: 85,
    images: [`${config_default}/uploads/collections/accessories/blue69.jpg`],
    createdAt: /* @__PURE__ */ new Date(),
    popularity: 0.93,
    description: "A deep blue silk tie for formal occasions."
  },
  {
    id: "green49",
    name: "Green Silk Tie",
    collection: "Accessories",
    collectionSlug: "accessories",
    price: 85,
    images: [`${config_default}/uploads/collections/accessories/green49.jpg`],
    createdAt: /* @__PURE__ */ new Date(),
    popularity: 0.87,
    description: "A sophisticated green silk tie."
  },
  {
    id: "white69",
    name: "White Silk Tie",
    collection: "Accessories",
    collectionSlug: "accessories",
    price: 85,
    images: [`${config_default}/uploads/collections/accessories/white69.jpg`],
    createdAt: /* @__PURE__ */ new Date(),
    popularity: 0.82,
    description: "A pristine white silk tie."
  },
  {
    id: "red69",
    name: "Red Silk Tie",
    collection: "Accessories",
    collectionSlug: "accessories",
    price: 85,
    images: [`${config_default}/uploads/collections/accessories/red69.jpg`],
    createdAt: /* @__PURE__ */ new Date(),
    popularity: 0.91,
    description: "A classic red silk tie."
  },
  // New Pocket Squares
  {
    id: "psblue",
    name: "Blue Pocket Square",
    collection: "Accessories",
    collectionSlug: "accessories",
    price: 45,
    images: [`${config_default}/uploads/collections/accessories/psblue.jpg`],
    createdAt: /* @__PURE__ */ new Date(),
    popularity: 0.89,
    description: "A classic blue pocket square."
  },
  {
    id: "psgreen",
    name: "Green Pocket Square",
    collection: "Accessories",
    collectionSlug: "accessories",
    price: 45,
    images: [`${config_default}/uploads/collections/accessories/psgreen.jpg`],
    createdAt: /* @__PURE__ */ new Date(),
    popularity: 0.84,
    description: "A refined green pocket square."
  },
  {
    id: "pspink",
    name: "Pink Pocket Square",
    collection: "Accessories",
    collectionSlug: "accessories",
    price: 45,
    images: [`${config_default}/uploads/collections/accessories/pspink.jpg`],
    createdAt: /* @__PURE__ */ new Date(),
    popularity: 0.86,
    description: "A stylish pink pocket square."
  },
  {
    id: "psred",
    name: "Red Pocket Square",
    collection: "Accessories",
    collectionSlug: "accessories",
    price: 45,
    images: [`${config_default}/uploads/collections/accessories/psred.jpg`],
    createdAt: /* @__PURE__ */ new Date(),
    popularity: 0.88,
    description: "A bold red pocket square."
  },
  {
    id: "psyellowgreen",
    name: "Yellow Green Pocket Square",
    collection: "Accessories",
    collectionSlug: "accessories",
    price: 45,
    images: [`${config_default}/uploads/collections/accessories/psyellowgreen.jpg`],
    createdAt: /* @__PURE__ */ new Date(),
    popularity: 0.83,
    description: "A unique yellow green pocket square."
  },
  {
    id: "psyellow",
    name: "Yellow Pocket Square",
    collection: "Accessories",
    collectionSlug: "accessories",
    price: 45,
    images: [`${config_default}/uploads/collections/accessories/psyellow.jpg`],
    createdAt: /* @__PURE__ */ new Date(),
    popularity: 0.85,
    description: "A cheerful yellow pocket square."
  }
];
var collections = [
  {
    "id": 1,
    "slug": "havana-collection",
    "title": "Havana Collection",
    "description": "Inspired by the vibrant, relaxed energy of Cuba.",
    "image": `${config_default}/uploads/collections/default/hvn1.jpg`
  },
  {
    "id": 2,
    "slug": "mocha-mousse-25",
    "title": "Mocha Mousse '25",
    "description": "Rich, earthy tones meet modern, sharp silhouettes.",
    "image": `${config_default}/uploads/collections/default/mm1.jpg`
  },
  {
    "id": 3,
    "slug": "groom-collection",
    "title": "Groom Collection",
    "description": "Exquisite tailoring for the most memorable occasions.",
    "image": `${config_default}/uploads/collections/default/g1.jpg`
  },
  {
    "id": 4,
    "slug": "accessories",
    "title": "Accessories",
    "description": "The finishing touches that define your style.",
    "image": `${config_default}/uploads/collections/accessories/cuff.JPG`
  }
];

export {
  products,
  collections
};
//# sourceMappingURL=chunk-DDYLPRYX.js.map
