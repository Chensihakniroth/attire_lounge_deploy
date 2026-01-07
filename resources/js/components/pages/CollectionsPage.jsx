import React, { useState } from 'react';
import { motion } from 'framer-motion';
import CollectionCard from './collections/CollectionCard';

import minioBaseUrl from '../../config.js';

// Mock collection data
const collections = [
    { id: 1, title: 'Havana Collection', description: 'Lightweight fabrics and breezy silhouettes.', itemsCount: 42, image: `${minioBaseUrl}/uploads/collections/model/1.jpg`, featured: true, category: 'seasonal' },
    { id: 2, title: 'Signature Suits', description: 'Tailored perfection for the modern man.', itemsCount: 28, image: `${minioBaseUrl}/uploads/collections/model/2.jpg`, featured: true, category: 'formal' },
    { id: 3, title: 'Groom Collection', description: 'Elegant tuxedos and formal wear for special occasions.', itemsCount: 19, image: `${minioBaseUrl}/uploads/collections/model/3.jpg`, category: 'formal' },
    { id: 4, title: 'The Little Details', description: 'Premium leather accessories and outerwear.', itemsCount: 24, image: `${minioBaseUrl}/uploads/lookbook/lookbook-11.jpg`, category: 'accessories' },
    { id: 5, title: "Mocha Mousse '25'", description: 'Breathable natural fabrics for sophisticated comfort.', itemsCount: 35, image: `${minioBaseUrl}/uploads/collections/model/5.jpg`, category: 'seasonal' },
    { id: 6, title: 'Office Collection', description: 'Smart office attire that balances comfort and professionalism.', itemsCount: 38, image: `${minioBaseUrl}/uploads/collections/model/4.jpg`, featured: true, category: 'formal' },
    { id: 7, title: 'Italian Footwear', description: 'Handcrafted shoes with unparalleled craftsmanship.', itemsCount: 31, image: `${minioBaseUrl}/uploads/lookbook/lookbook-6.jpg`, category: 'accessories' },
    { id: 8, title: 'Winter Essentials', description: 'Cozy woolens and cold-weather sophistication.', itemsCount: 26, image: `${minioBaseUrl}/uploads/lookbook/lookbook-8.jpg`, category: 'seasonal' },
];

const CollectionsPage = () => {
    const [filter, setFilter] = useState('all');

    const filters = [
        { id: 'all', label: 'All' },
        { id: 'featured', label: 'Featured' },
        { id: 'seasonal', label: 'Seasonal' },
        { id: 'formal', label: 'Formal' },
        { id: 'accessories', label: 'Accessories' }
    ];

    const filteredCollections = collections.filter(collection => {
        if (filter === 'all') return true;
        if (filter === 'featured') return collection.featured;
        return collection.category === filter;
    });

    const containerVariants = {
        hidden: { opacity: 0 },
        visible: {
            opacity: 1,
            transition: { staggerChildren: 0.08, delayChildren: 0.2 }
        }
    };

    return (
        <div className="min-h-screen py-24 px-4 sm:px-6 lg:px-8 bg-attire-navy">
            <motion.div
                className="max-w-7xl mx-auto"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
            >
                {/* Header */}
                <div className="text-center mb-16">
                    <h1 className="text-5xl md:text-7xl font-serif font-light text-white mb-3">Our Collections</h1>
                    <p className="text-lg text-attire-silver max-w-2xl mx-auto">
                        Timeless elegance, curated for the modern gentleman.
                    </p>
                </div>

                {/* Animated Filter Tabs */}
                <div className="flex justify-center mb-16">
                    <div className="flex flex-wrap justify-center items-center gap-2 p-1.5 bg-white/5 backdrop-blur-sm rounded-full">
                        {filters.map((filterItem) => (
                            <button
                                key={filterItem.id}
                                onClick={() => setFilter(filterItem.id)}
                                className={`px-5 py-2.5 rounded-full text-sm font-medium transition-colors relative ${
                                    filter === filterItem.id ? 'text-white' : 'text-attire-silver/70 hover:text-white'
                                }`}
                            >
                                {filter === filterItem.id && (
                                    <motion.div
                                        layoutId="collection-filter-active"
                                        className="absolute inset-0 bg-attire-dark shadow-md rounded-full"
                                        transition={{ type: 'spring', stiffness: 200, damping: 20 }}
                                    />
                                )}
                                <span className="relative z-10">{filterItem.label}</span>
                            </button>
                        ))}
                    </div>
                </div>

                {/* Collections Grid */}
                <motion.div
                    key={filter} // Re-trigger animation when filter changes
                    variants={containerVariants}
                    initial="hidden"
                    animate="visible"
                    className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-x-6 gap-y-10"
                >
                    {filteredCollections.map((collection) => (
                        <CollectionCard key={collection.id} collection={collection} />
                    ))}
                </motion.div>

                 {/* Empty State */}
                 {filteredCollections.length === 0 && (
                    <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="text-center py-20"
                    >
                        <p className="text-attire-silver text-lg">No collections match this filter.</p>
                    </motion.div>
                 )}
            </motion.div>
        </div>
    );
};

export default CollectionsPage;
