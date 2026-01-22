import minioBaseUrl from '../config.js';

const createProductItems = (collection, prefix, name, count, priceRange) => {
    return Array.from({ length: count }, (_, i) => ({
        id: `${prefix}${i + 1}`,
        name: `${name} Style ${i + 1}`,
        collection: collection,
        collectionSlug: collection.toLowerCase().replace(/ /g, '-').replace(/'/g, ''),
        price: Math.floor(Math.random() * (priceRange[1] - priceRange[0] + 1)) + priceRange[0],
        images: [`${minioBaseUrl}/uploads/collections/default/${prefix}${i + 1}.jpg`],
        createdAt: new Date(Date.now() - Math.floor(Math.random() * 30) * 24 * 60 * 60 * 1000), // Randomly in the last 30 days
        popularity: Math.random(),
    }));
};

export const products = [
    ...createProductItems('Havana Collection', 'hvn', 'Havana', 9, [150, 450]),
    ...createProductItems('Mocha Mousse \'25', 'mm', 'Mocha Mousse', 7, [180, 500]),
    ...createProductItems('Groom Collection', 'g', 'Groom', 10, [250, 800]),
    ...createProductItems('Office Collection', 'of', 'Office', 5, [200, 550]),
    {
        id: 'browntie',
        name: 'Brown Tie',
        collection: 'Accessories',
        collectionSlug: 'accessories',
        price: 55,
        images: [`${minioBaseUrl}/uploads/collections/accessories/browntie.jpg`],
        createdAt: new Date(),
        popularity: 0.8,
        description: 'A classic brown tie.'
    },
    {
        id: 'bluetie',
        name: 'Blue Tie',
        collection: 'Accessories',
        collectionSlug: 'accessories',
        price: 55,
        images: [`${minioBaseUrl}/uploads/collections/accessories/bluetie.jpg`],
        createdAt: new Date(),
        popularity: 0.9,
        description: 'A classic blue tie.'
    },
    {
        id: 'blue49',
        name: 'Blue Silk Tie',
        collection: 'Accessories',
        collectionSlug: 'accessories',
        price: 85,
        images: [`${minioBaseUrl}/uploads/collections/accessories/blue49.jpg`],
        createdAt: new Date(),
        popularity: 0.95,
        description: 'A luxurious blue tie made of silk.'
    },
    {
        id: 'brown49',
        name: 'Brown Silk Tie',
        collection: 'Accessories',
        collectionSlug: 'accessories',
        price: 85,
        images: [`${minioBaseUrl}/uploads/collections/accessories/brown49.jpg`],
        createdAt: new Date(),
        popularity: 0.92,
        description: 'A luxurious brown tie made of silk.'
    },
    {
        id: 'cuff',
        name: 'Cufflinks',
        collection: 'Accessories',
        collectionSlug: 'accessories',
        price: 120,
        images: [`${minioBaseUrl}/uploads/collections/accessories/cuff.JPG`],
        createdAt: new Date(),
        popularity: 0.98,
        description: 'Elegant cufflinks to complete your look.'
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
      "image": `${minioBaseUrl}/uploads/collections/default/g1.jpg`
    },
    {
      "id": 4,
      "slug": "accessories",
      "title": "Accessories",
      "description": "The finishing touches that define your style.",
      "image": `${minioBaseUrl}/uploads/collections/accessories/cuff.JPG`
    }
];
