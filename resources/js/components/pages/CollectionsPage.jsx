import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import CollectionCard from './collections/CollectionCard';
import { collections as mockCollections } from '../../data/products.js'; // Import mock collections

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
    const [loadingCollections, setLoadingCollections] = useState(true);

    useEffect(() => {
        // Simulate API call for collections
        setTimeout(() => {
            setLoadingCollections(false);
        }, 500);
    }, []);

    return (
        <div className="min-h-screen bg-white text-gray-800">
            <PageHeader />

            <main className="max-w-screen-xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
                {loadingCollections ? (
                     <div className="text-center">Loading collections...</div>
                ) : (
                    <motion.div
                        layout
                        className="grid grid-cols-1 md:grid-cols-3 gap-8 md:gap-12"
                    >
                        {mockCollections.map((collection) => ( // Use mockCollections directly
                            <Link to={`/products/${collection.slug}`} key={collection.id}>
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
                )}
                <div className="text-center mt-16">
                    <Link
                        to="/products"
                        className="bg-attire-navy text-white font-semibold px-10 py-4 rounded-lg hover:bg-attire-navy/90 transition-colors inline-block"
                    >
                        Browse All Products
                    </Link>
                </div>
            </main>
        </div>
    );
};

export default CollectionsPage;