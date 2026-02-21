import minioBaseUrl from '../config.js';

export const LOOKBOOK_IMAGES = [
    // Havana Collection - Sartorial
    { id: 'hvn1', src: `${minioBaseUrl}/uploads/collections/default/hvn1.jpg`, title: 'Havana Breezy', collection: 'Havana Collection', category: ['sartorial'] },
    { id: 'hvn2', src: `${minioBaseUrl}/uploads/collections/default/hvn2.jpg`, title: 'Cuban Nights', collection: 'Havana Collection', category: ['sartorial'] },
    { id: 'hvn3', src: `${minioBaseUrl}/uploads/collections/default/hvn3.jpg`, title: 'Linen Classic', collection: 'Havana Collection', category: ['sartorial'] },
    { id: 'hvn4', src: `${minioBaseUrl}/uploads/collections/default/hvn4.jpg`, title: 'Tropical Sophistication', collection: 'Havana Collection', category: ['sartorial'] },
    { id: 'hvn5', src: `${minioBaseUrl}/uploads/collections/default/hvn5.jpg`, title: 'Coastal Charm', collection: 'Havana Collection', category: ['sartorial'] },
    { id: 'hvn6', src: `${minioBaseUrl}/uploads/collections/default/hvn6.jpg`, title: 'Island Elegance', collection: 'Havana Collection', category: ['sartorial'] },
    { id: 'hvn7', src: `${minioBaseUrl}/uploads/collections/default/hvn7.jpg`, title: 'Seaside Style', collection: 'Havana Collection', category: ['sartorial'] },

    // Mocha Mousse Collection - Sartorial
    { id: 'mm1', src: `${minioBaseUrl}/uploads/collections/default/mm1.jpg`, title: 'Espresso Edge', collection: 'Mocha Mousse 25', category: ['sartorial'] },
    { id: 'mm2', src: `${minioBaseUrl}/uploads/collections/default/mm2.jpg`, title: 'Urban Comfort', collection: 'Mocha Mousse 25', category: ['sartorial'] },
    { id: 'mm3', src: `${minioBaseUrl}/uploads/collections/default/mm3.jpg`, title: 'Downtown Vibe', collection: 'Mocha Mousse 25', category: ['sartorial'] },
    { id: 'mm4', src: `${minioBaseUrl}/uploads/collections/default/mm4.jpg`, title: 'City Classic', collection: 'Mocha Mousse 25', category: ['sartorial'] },
    { id: 'mm5', src: `${minioBaseUrl}/uploads/collections/default/mm5.jpg`, title: 'Metro Style', collection: 'Mocha Mousse 25', category: ['sartorial'] },
    { id: 'mm6', src: `${minioBaseUrl}/uploads/collections/default/mm6.jpg`, title: 'Modern Mocha', collection: 'Mocha Mousse 25', category: ['sartorial'] },
    { id: 'mm7', src: `${minioBaseUrl}/uploads/collections/default/mm7.jpg`, title: 'Refined Casual', collection: 'Mocha Mousse 25', category: ['sartorial'] },

    // Business Collection (formerly Office)
    { id: 'of1', src: `${minioBaseUrl}/uploads/collections/default/of1.jpg`, title: 'Boardroom Ready', collection: 'Office Collection', category: ['business'] },
    { id: 'of2', src: `${minioBaseUrl}/uploads/collections/default/of2.jpg`, title: 'Executive Presence', collection: 'Office Collection', category: ['business'] },
    { id: 'of3', src: `${minioBaseUrl}/uploads/collections/default/of3.jpg`, title: 'Corporate Style', collection: 'Office Collection', category: ['business'] },
    { id: 'of4', src: `${minioBaseUrl}/uploads/collections/default/of4.jpg`, title: 'Business Formal', collection: 'Office Collection', category: ['business', 'formal'] },
    { id: 'of5', src: `${minioBaseUrl}/uploads/collections/default/of5.jpg`, title: 'Professional Polish', collection: 'Office Collection', category: ['business'] },

    // Groom & Formal Collection
    { id: 'g1', src: `${minioBaseUrl}/uploads/collections/default/g1.webp?v=new`, title: 'Classic Tuxedo', collection: 'Groom Collection', category: ['grooms', 'formal'] },
    { id: 'g2', src: `${minioBaseUrl}/uploads/collections/default/g2.webp?v=new`, title: 'Wedding Day', collection: 'Groom Collection', category: ['grooms', 'formal'] },
    { id: 'g3', src: `${minioBaseUrl}/uploads/collections/default/g3.webp?v=new`, title: 'Groomsmen Style', collection: 'Groom Collection', category: ['grooms', 'formal'] },
    { id: 'g4', src: `${minioBaseUrl}/uploads/collections/default/g4.webp?v=new`, title: 'Elegant Ceremony', collection: 'Groom Collection', category: ['grooms', 'formal'] },
    { id: 'g5', src: `${minioBaseUrl}/uploads/collections/default/g5.webp?v=new`, title: 'Reception Look', collection: 'Groom Collection', category: ['grooms', 'formal'] },
    { id: 'g6', src: `${minioBaseUrl}/uploads/collections/default/g6.webp?v=new`, title: 'Tailored Perfection', collection: 'Groom Collection', category: ['grooms', 'formal'] },
    { id: 'g7', src: `${minioBaseUrl}/uploads/collections/default/g7.webp?v=new`, title: 'Celebration Suit', collection: 'Groom Collection', category: ['grooms', 'formal'] },
    { id: 'g8', src: `${minioBaseUrl}/uploads/collections/default/g8.webp?v=new`, title: 'Formal Event', collection: 'Groom Collection', category: ['grooms', 'formal'] },

    // Shade of Elegants Collection
    { id: 'shades001', src: `${minioBaseUrl}/uploads/shades1/1.webp`, title: 'Elegance 001', collection: 'Shade of Elegants', category: ['shades'] },
    { id: 'shades002', src: `${minioBaseUrl}/uploads/shades1/2.webp`, title: 'Elegance 002', collection: 'Shade of Elegants', category: ['shades'] },
    { id: 'shades003', src: `${minioBaseUrl}/uploads/shades1/3.webp`, title: 'Elegance 003', collection: 'Shade of Elegants', category: ['shades'] },
    { id: 'shades004', src: `${minioBaseUrl}/uploads/shades1/4.webp`, title: 'Elegance 004', collection: 'Shade of Elegants', category: ['shades'] },
    { id: 'shades005', src: `${minioBaseUrl}/uploads/shades1/5.webp`, title: 'Elegance 005', collection: 'Shade of Elegants', category: ['shades'] },
    { id: 'shades006', src: `${minioBaseUrl}/uploads/shades1/6.webp`, title: 'Elegance 006', collection: 'Shade of Elegants', category: ['shades'] },
    { id: 'shades007', src: `${minioBaseUrl}/uploads/shades1/7.webp`, title: 'Elegance 007', collection: 'Shade of Elegants', category: ['shades'] },
    { id: 'shades008', src: `${minioBaseUrl}/uploads/shades1/8.webp`, title: 'Elegance 008', collection: 'Shade of Elegants', category: ['shades'] },
    { id: 'shades009', src: `${minioBaseUrl}/uploads/shades1/9.webp`, title: 'Elegance 009', collection: 'Shade of Elegants', category: ['shades'] },
    { id: 'shades010', src: `${minioBaseUrl}/uploads/shades1/10.webp`, title: 'Elegance 010', collection: 'Shade of Elegants', category: ['shades'] },
    { id: 'shades011', src: `${minioBaseUrl}/uploads/shades1/11.webp`, title: 'Elegance 011', collection: 'Shade of Elegants', category: ['shades'] },

    // Street Sartorial Collection
    { id: 'street1', src: `${minioBaseUrl}/uploads/street1/1.webp`, title: 'Street Style 1', collection: 'Street Sartorial', category: ['street'] },
    { id: 'street2', src: `${minioBaseUrl}/uploads/street1/2.webp`, title: 'Street Style 2', collection: 'Street Sartorial', category: ['street'] },
    { id: 'street3', src: `${minioBaseUrl}/uploads/street1/3.webp`, title: 'Street Style 3', collection: 'Street Sartorial', category: ['street'] },
    { id: 'street4', src: `${minioBaseUrl}/uploads/street1/4.webp`, title: 'Street Style 4', collection: 'Street Sartorial', category: ['street'] },
    { id: 'street5', src: `${minioBaseUrl}/uploads/street1/5.webp`, title: 'Street Style 5', collection: 'Street Sartorial', category: ['street'] },
    { id: 'street6', src: `${minioBaseUrl}/uploads/street1/6.webp`, title: 'Street Style 6', collection: 'Street Sartorial', category: ['street'] },
    { id: 'street7', src: `${minioBaseUrl}/uploads/street1/7.webp`, title: 'Street Style 7', collection: 'Street Sartorial', category: ['street'] },
    { id: 'street8', src: `${minioBaseUrl}/uploads/street1/8.webp`, title: 'Street Style 8', collection: 'Street Sartorial', category: ['street'] },
    { id: 'street9', src: `${minioBaseUrl}/uploads/street1/9.webp`, title: 'Street Style 9', collection: 'Street Sartorial', category: ['street'] },
];

export const LOOKBOOK_CATEGORIES = [
    { id: 'all', name: 'All' },
    { id: 'sartorial', name: 'Sartorial' },
    { id: 'grooms', name: 'Grooms' },
    { id: 'formal', name: 'Formal' },
    { id: 'business', name: 'Business' },
    { id: 'shades', name: 'Shade of Elegants' },
    { id: 'street', name: 'Street Sartorial' },
];
