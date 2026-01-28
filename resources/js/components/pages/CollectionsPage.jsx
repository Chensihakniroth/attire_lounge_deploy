import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import CollectionCard from './collections/CollectionCard';
import { collections as mockCollections } from '../../data/products.js'; // Import mock collections
import minioBaseUrl from '../../config.js';

const PageHeader = () => (
    <div className="text-center py-16 sm:py-24 bg-attire-navy">
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

    const browseAllCard = {
        id: 0,
        slug: 'products',
        title: 'Browse All',
        description: 'Explore our entire range of products.',
        image: `${minioBaseUrl}/uploads/collections/default/of3.jpg`,
        itemsCount: 'All'
    };

    const collectionsWithBrowseAll = [...mockCollections, browseAllCard];

    return (
        <div className="min-h-screen bg-attire-navy text-white">
            <PageHeader />

            <main className="max-w-screen-xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
                {loadingCollections ? (
                     <div className="text-center">Loading collections...</div>
                ) : (
                    <motion.div
                        layout
                        className="grid grid-cols-1 md:grid-cols-3 gap-8 md:gap-12"
                    >
                        {collectionsWithBrowseAll.map((collection) => (
                            <Link to={collection.id === 0 ? '/products' : `/products?collection=${collection.slug}`} key={collection.id}>
                                <motion.div
                                    layout
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ duration: 0.6, ease: 'easeOut' }}
                                >
                                    {collection.id === 0 ? (
                                        <div className="group cursor-pointer relative"
                                            style={{
                                                height: '28rem',
                                                borderRadius: '0.25rem',
                                                overflow: 'hidden'
                                            }}
                                        >
                                            <div
                                                className="absolute inset-0 bg-cover bg-center"
                                                style={{ backgroundImage: `url(${collection.image})` }}
                                            ></div>
                                            <div className="absolute inset-0 transition-opacity" style={{ backgroundColor: '#f5a81c' }}></div>
                                            <div className="relative z-10 flex items-center justify-center h-full">
                                                <h3 className="text-3xl font-serif text-white">{collection.title}</h3>
                                            </div>
                                        </div>
                                    ) : (
                                        <CollectionCard collection={collection} />
                                    )}
                                </motion.div>
                            </Link>
                        ))}
                    </motion.div>
                )}
            </main>
        </div>
    );
};

export default CollectionsPage;