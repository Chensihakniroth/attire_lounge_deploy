import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { useInView } from 'react-intersection-observer';
import CollectionCard from './collections/CollectionCard';
import minioBaseUrl from '../../config.js';
import LoadingSpinner from '../common/LoadingSpinner.jsx';
import { ArrowRight, Loader2 } from 'lucide-react';
import OptimizedImage from '../common/OptimizedImage.jsx';
import { useCollections } from '../../hooks/useProducts';

const PageHeader = () => (
    <div className="relative text-center py-20 sm:py-32 px-6 z-10">
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: 'easeOut' }}
        >
            <span className="text-attire-accent text-xs tracking-[0.3em] uppercase mb-4 inline-block">
                Discover
            </span>
            <h1 className="text-5xl md:text-7xl font-serif font-light text-white mb-6">
                Our Collections
            </h1>
            <p className="text-lg text-attire-silver/95 max-w-2xl mx-auto leading-relaxed font-normal drop-shadow-sm">
                Curated ensembles where timeless elegance meets modern style.
                Each piece is designed to elevate your personal look with
                effortless sophistication.
            </p>
        </motion.div>
    </div>
);

const CollectionsPage = () => {
    const { data: rawCollections, isLoading: loadingCollections } = useCollections();
    const [itemsToShow, setItemsToShow] = useState(6);

    const { ref: loadMoreRef, inView } = useInView({
        threshold: 0,
        rootMargin: '200px',
    });

    // Map the collections when data arrives
    const collections = React.useMemo(() => {
        if (!rawCollections) return [];
        
        return rawCollections.map((c) => {
            let imageUrl = c.image_url;

            // Fallback logic: if image_url is missing or relative, we use the raw image path + minioBaseUrl
            if (!imageUrl || (!imageUrl.startsWith('http') && c.image)) {
                const path = c.image.startsWith('/') ? c.image : `/${c.image}`;
                imageUrl = `${minioBaseUrl}${path}`;
            }

            return {
                ...c,
                title: c.name,
                image: imageUrl,
                itemsCount: c.is_new ? 'New' : '',
            };
        });
    }, [rawCollections]);

    const browseAllCard = {
        id: 0,
        slug: 'products',
        title: 'Browse All',
        description: 'Explore our entire range of products.',
        image: `${minioBaseUrl}/uploads/collections/default/of3.jpg?v=new`,
        itemsCount: 'All',
    };

    const collectionsWithBrowseAll = [...collections, browseAllCard];

    // --- Infinite Scroll Logic ---
    useEffect(() => {
        if (inView && itemsToShow < collectionsWithBrowseAll.length) {
            setItemsToShow((prev) =>
                Math.min(prev + 6, collectionsWithBrowseAll.length)
            );
        }
    }, [inView, collectionsWithBrowseAll.length]);

    const visibleCollections = collectionsWithBrowseAll.slice(0, itemsToShow);
    const hasMore = itemsToShow < collectionsWithBrowseAll.length;

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
                        layout
                        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
                    >
                        {visibleCollections.map((collection, index) => (
                            <Link
                                to={
                                    collection.id === 0
                                        ? '/products'
                                        : `/products?collection=${collection.slug}`
                                }
                                key={collection.id}
                                className="block h-full"
                            >
                                <motion.div
                                    layout
                                    initial={{ opacity: 0, y: 30 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{
                                        duration: 0.4,
                                        delay: index * 0.1,
                                        ease: 'easeOut',
                                    }}
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
                                                    className="w-full h-full transition-transform duration-700 group-hover:scale-105"
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
                                                    <ArrowRight
                                                        size={16}
                                                        className="transform group-hover:translate-x-1 transition-transform"
                                                    />
                                                </span>
                                            </div>
                                        </div>
                                    ) : (
                                        <CollectionCard
                                            collection={collection}
                                        />
                                    )}
                                </motion.div>
                            </Link>
                        ))}

                        {hasMore && (
                            <div
                                ref={loadMoreRef}
                                className="col-span-full flex justify-center py-12 pb-24"
                            >
                                <div className="flex items-center gap-4 opacity-50">
                                    <Loader2 className="w-5 h-5 text-attire-accent animate-spin" />
                                    <span className="text-[10px] tracking-[0.4em] uppercase font-bold text-white">
                                        Loading More
                                    </span>
                                </div>
                            </div>
                        )}
                    </motion.div>
                )}
            </main>
        </div>
    );
};

export default CollectionsPage;
