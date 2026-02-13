import minioBaseUrl from '../config.js';

const createProductItems = (collection, prefix, name, count, priceRange, fileExt = 'jpg', category = 'Suits') => {
    return Array.from({ length: count }, (_, i) => ({
        id: `${prefix}${i + 1}`,
        name: `${name} Style ${i + 1}`,
        collection: collection,
        category: category,
        collectionSlug: collection.toLowerCase().replace(/ /g, '-').replace(/'/g, ''),
        price: Math.floor(Math.random() * (priceRange[1] - priceRange[0] + 1)) + priceRange[0],
        images: [`${minioBaseUrl}/uploads/collections/default/${prefix}${i + 1}.${fileExt}?v=new`],
        createdAt: new Date(Date.now() - Math.floor(Math.random() * 30) * 24 * 60 * 60 * 1000), // Randomly in the last 30 days
        popularity: Math.random(),
    }));
};

export const products = [
    ...createProductItems('Havana Collection', 'hvn', 'Havana', 8, [150, 450], 'jpg', 'Summer Suits'),
    ...createProductItems('Mocha Mousse \'25', 'mm', 'Mocha Mousse', 7, [180, 500], 'jpg', 'Business Suits'),
    ...createProductItems('Groom Collection', 'g', 'Groom', 10, [250, 800], 'webp', 'Tuxedos'),
    ...createProductItems('Office Collection', 'of', 'Office', 5, [200, 550], 'jpg', 'Business Suits'),

    {
        id: 'cuff',
        name: 'Cufflinks',
        collection: 'Accessories',
        category: 'Cufflinks',
        collectionSlug: 'accessories',
        price: 120,
        images: [`${minioBaseUrl}/uploads/collections/accessories/cuff.JPG`],
        createdAt: new Date(),
        popularity: 0.98,
        description: 'Elegant cufflinks to complete your look.'
    },
    // New Ties
    {
        id: 'brown69',
        name: 'Hand-roll Silk Tie',
        collection: 'Accessories',
        category: 'Ties',
        collectionSlug: 'accessories',
        price: 69,
        images: [`${minioBaseUrl}/uploads/collections/accessories/brown69.webp`],
        createdAt: new Date(),
        popularity: 0.9,
        description: 'A premium hand-roll silk tie in brown.'
    },
    {
        id: 'cream49',
        name: 'Silk Tie',
        collection: 'Accessories',
        category: 'Ties',
        collectionSlug: 'accessories',
        price: 49,
        images: [`${minioBaseUrl}/uploads/collections/accessories/cream49.webp`],
        createdAt: new Date(),
        popularity: 0.85,
        description: 'An elegant silk tie in cream.'
    },
    {
        id: 'cyan69',
        name: 'Hand-roll Silk Tie',
        collection: 'Accessories',
        category: 'Ties',
        collectionSlug: 'accessories',
        price: 69,
        images: [`${minioBaseUrl}/uploads/collections/accessories/cyan69.webp`],
        createdAt: new Date(),
        popularity: 0.88,
        description: 'A vibrant hand-roll silk tie in cyan.'
    },
    {
        id: 'blue69',
        name: 'Hand-roll Silk Tie',
        collection: 'Accessories',
        category: 'Ties',
        collectionSlug: 'accessories',
        price: 69,
        images: [`${minioBaseUrl}/uploads/collections/accessories/blue69.webp`],
        createdAt: new Date(),
        popularity: 0.93,
        description: 'A deep blue hand-roll silk tie for formal occasions.'
    },
    {
        id: 'green49',
        name: 'Silk Tie',
        collection: 'Accessories',
        category: 'Ties',
        collectionSlug: 'accessories',
        price: 49,
        images: [`${minioBaseUrl}/uploads/collections/accessories/green49.webp`],
        createdAt: new Date(),
        popularity: 0.87,
        description: 'A sophisticated silk tie in green.'
    },
    {
        id: 'white69',
        name: 'Hand-roll Silk Tie',
        collection: 'Accessories',
        category: 'Ties',
        collectionSlug: 'accessories',
        price: 69,
        images: [`${minioBaseUrl}/uploads/collections/accessories/white69.webp`],
        createdAt: new Date(),
        popularity: 0.82,
        description: 'A pristine hand-roll silk tie in white.'
    },
    {
        id: 'red69',
        name: 'Hand-roll Silk Tie',
        collection: 'Accessories',
        category: 'Ties',
        collectionSlug: 'accessories',
        price: 69,
        images: [`${minioBaseUrl}/uploads/collections/accessories/red69.webp`],
        createdAt: new Date(),
        popularity: 0.91,
        description: 'A classic hand-roll silk tie in red.'
    },
    // New Pocket Squares
    {
        id: 'psblue',
        name: 'Blue Pocket Square',
        collection: 'Accessories',
        category: 'Pocket Squares',
        collectionSlug: 'accessories',
        price: 20,
        images: [`${minioBaseUrl}/uploads/collections/accessories/psblue.webp`],
        createdAt: new Date(),
        popularity: 0.89,
        description: 'A classic blue pocket square.'
    },
    {
        id: 'psgreen',
        name: 'Green Pocket Square',
        collection: 'Accessories',
        category: 'Pocket Squares',
        collectionSlug: 'accessories',
        price: 20,
        images: [`${minioBaseUrl}/uploads/collections/accessories/psgreen.webp`],
        createdAt: new Date(),
        popularity: 0.84,
        description: 'A refined green pocket square.'
    },
    {
        id: 'pspink',
        name: 'Pink Pocket Square',
        collection: 'Accessories',
        category: 'Pocket Squares',
        collectionSlug: 'accessories',
        price: 20,
        images: [`${minioBaseUrl}/uploads/collections/accessories/pspink.webp`],
        createdAt: new Date(),
        popularity: 0.86,
        description: 'A stylish pink pocket square.'
    },
    {
        id: 'psred',
        name: 'Red Pocket Square',
        collection: 'Accessories',
        category: 'Pocket Squares',
        collectionSlug: 'accessories',
        price: 20,
        images: [`${minioBaseUrl}/uploads/collections/accessories/psred.webp`],
        createdAt: new Date(),
        popularity: 0.88,
        description: 'A bold red pocket square.'
    },
    {
        id: 'psyellowgreen',
        name: 'Yellow Green Pocket Square',
        collection: 'Accessories',
        category: 'Pocket Squares',
        collectionSlug: 'accessories',
        price: 20,
        images: [`${minioBaseUrl}/uploads/collections/accessories/psyellowgreen.webp`],
        createdAt: new Date(),
        popularity: 0.83,
        description: 'A unique yellow green pocket square.'
    },
    {
        id: 'psyellow',
        name: 'Yellow Pocket Square',
        collection: 'Accessories',
        category: 'Pocket Squares',
        collectionSlug: 'accessories',
        price: 20,
        images: [`${minioBaseUrl}/uploads/collections/accessories/psyellow.webp`],
        createdAt: new Date(),
        popularity: 0.85,
        description: 'A cheerful yellow pocket square.'
    }
];

export const collections = [
    {
      "id": 1,
      "slug": "havana-collection",
      "title": "Havana Collection",
      "description": "Inspired by the vibrant, relaxed energy of Cuba.",
      "image": `${minioBaseUrl}/uploads/collections/default/hvn1.jpg`
    },
    {
      "id": 2,
      "slug": "mocha-mousse-25",
      "title": "Mocha Mousse '25",
      "description": "Rich, earthy tones meet modern, sharp silhouettes.",
      "image": `${minioBaseUrl}/uploads/collections/default/mm1.jpg`
    },
    {
      "id": 3,
      "slug": "groom-collection",
      "title": "Groom Collection",
      "description": "Exquisite tailoring for the most memorable occasions.",
      "image": `${minioBaseUrl}/uploads/collections/default/g1.webp?v=new`
    },
    {
      "id": 4,
      "slug": "accessories",
      "title": "Accessories",
      "description": "The finishing touches that define your style.",
      "image": `${minioBaseUrl}/uploads/collections/accessories/cuff.JPG`
    }
];
