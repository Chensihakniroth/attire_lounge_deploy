import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import CollectionCard from './collections/CollectionCard';
import { collections as mockCollections } from '../../data/products.js';
import minioBaseUrl from '../../config.js';
import LoadingSpinner from '../common/LoadingSpinner.jsx';
import { ArrowRight } from 'lucide-react';
import OptimizedImage from '../common/OptimizedImage.jsx';

const PageHeader = () => (
    <div className="relative text-center py-20 sm:py-32 px-6 z-10">
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
        >
            <span className="text-attire-accent text-xs tracking-[0.3em] uppercase mb-4 inline-block">Discover</span>
            <h1 className="text-5xl md:text-7xl font-serif font-light text-white mb-6">
                Our Collections
            </h1>
            <p className="text-lg text-attire-silver max-w-2xl mx-auto leading-relaxed font-light">
                Curated ensembles where timeless elegance meets modern style. 
                Each piece is designed to elevate your personal look with effortless sophistication.
            </p>
        </motion.div>
    </div>
);

const CollectionsPage = () => {
    const [loadingCollections, setLoadingCollections] = useState(true);

    useEffect(() => {
        // Simulate API call
        setTimeout(() => {
            setLoadingCollections(false);
        }, 600);
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
        <div className="min-h-screen bg-attire-navy relative overflow-hidden">
            <PageHeader />

            <main className="relative z-10 max-w-screen-2xl mx-auto px-4 sm:px-6 lg:px-8 pb-24">
                {loadingCollections ? (
                     <div className="flex justify-center py-20">
                        <LoadingSpinner />
                     </div>
                ) : (
                    <motion.div
                        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
                    >
                        {collectionsWithBrowseAll.map((collection, index) => (
                            <Link 
                                to={collection.id === 0 ? '/products' : `/products?collection=${collection.slug}`} 
                                key={collection.id}
                                className="block h-full"
                            >
                                <motion.div
                                    initial={{ opacity: 0, y: 30 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ duration: 0.4, delay: index * 0.1, ease: 'easeOut' }}
                                    className="h-full"
                                >
                                    {collection.id === 0 ? (
                                        <div className="group relative h-[24rem] rounded-2xl overflow-hidden shadow-xl border border-white/5">
                                            {/* Background Image */}
                                            <div className="absolute inset-0">
                                                <OptimizedImage 
                                                    src={collection.image} 
                                                    alt={collection.title}
                                                    containerClassName="w-full h-full"
                                                    className="w-full h-full transition-transform duration-700 group-hover:scale-105 will-change-transform"
                                                />
                                                <div className="absolute inset-0 bg-attire-accent/90 mix-blend-multiply opacity-90 transition-opacity duration-500" />
                                                <div className="absolute inset-0 bg-black/20 group-hover:bg-black/10 transition-colors duration-500" />
                                            </div>

                                            {/* Content */}
                                            <div className="relative z-10 h-full flex flex-col items-center justify-center text-center p-8">
                                                <h3 className="text-4xl font-serif text-white mb-4 transform group-hover:-translate-y-2 transition-transform duration-500">
                                                    {collection.title}
                                                </h3>
                                                <p className="text-white/80 max-w-xs mb-8 opacity-0 group-hover:opacity-100 transform translate-y-4 group-hover:translate-y-0 transition-all duration-500 delay-100">
                                                    {collection.description}
                                                </p>
                                                <span className="inline-flex items-center gap-2 text-white font-medium border-b border-white/30 pb-1 group-hover:border-white transition-colors">
                                                    View All Products
                                                    <ArrowRight size={16} className="transform group-hover:translate-x-1 transition-transform" />
                                                </span>
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