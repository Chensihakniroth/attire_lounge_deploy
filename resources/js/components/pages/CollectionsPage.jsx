import React from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import CollectionCard from './collections/CollectionCard';
import minioBaseUrl from '../../config.js';

const collections = [
    { id: 1, title: 'Havana Collection', slug: 'havana-collection', description: 'Lightweight fabrics and breezy silhouettes.', itemsCount: 42, image: `${minioBaseUrl}/uploads/collections/default/hvn1.jpg` },
    { id: 5, title: "Mocha Mousse '25'", slug: 'mocha-mousse-25', description: 'Breathable natural fabrics for sophisticated comfort.', itemsCount: 35, image: `${minioBaseUrl}/uploads/collections/default/mm1.jpg` },
    { id: 3, title: 'Groom Collection', slug: 'groom-collection', description: 'Elegant tuxedos and formal wear for special occasions.', itemsCount: 19, image: `${minioBaseUrl}/uploads/collections/default/g10.jpg` },
];

const PageHeader = () => (
    <div className="text-center py-16 sm:py-24" style={{ backgroundColor: '#0d3542' }}>
        <motion.h1
            className="text-4xl sm:text-5xl md:text-6xl font-serif font-light text-white mb-4"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
        >
            Our Collections
        </motion.h1>
        <motion.p
            className="text-base sm:text-lg text-gray-300 max-w-2xl mx-auto px-4"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2, ease: "easeOut" }}
        >
            Discover our curated collections, where timeless elegance meets modern craftsmanship. Each piece is designed to elevate your personal style.
        </motion.p>
    </div>
);

const CollectionsPage = () => {
    return (
        <div className="min-h-screen bg-white text-gray-800">
            <PageHeader />

            <main className="max-w-screen-xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
                <motion.div
                    layout
                    className="grid grid-cols-1 md:grid-cols-3 gap-8 md:gap-12"
                >
                    {collections.map((collection) => (
                        <Link to={`/collections/${collection.slug}`} key={collection.id}>
                            <motion.div
                                layout
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ duration: 0.6, ease: 'easeOut' }}
                            >
                                <CollectionCard collection={collection} />
                            </motion.div>
                        </Link>
                    ))}
                </motion.div>
            </main>
        </div>
    );
};

export default CollectionsPage;
