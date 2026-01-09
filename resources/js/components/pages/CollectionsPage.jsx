import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, LayoutGrid } from 'lucide-react';
import CollectionCard from './collections/CollectionCard';
import minioBaseUrl from '../../config.js';

// Mock collection data remains the same
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

const ITEMS_PER_PAGE = 6;

const PageHeader = () => (
    <div className="text-center py-16 sm:py-24 bg-gray-50/50">
        <motion.h1 
            className="text-4xl sm:text-5xl md:text-6xl font-serif font-light text-gray-800 mb-4"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
        >
            Our Collections
        </motion.h1>
        <motion.p 
            className="text-base sm:text-lg text-gray-500 max-w-2xl mx-auto px-4"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2, ease: "easeOut" }}
        >
            Discover our curated collections, where timeless elegance meets modern craftsmanship. Each piece is designed to elevate your personal style.
        </motion.p>
    </div>
);

const FilterPanel = ({ isOpen, onClose, filters, currentFilter, onFilterChange }) => (
    <AnimatePresence>
        {isOpen && (
            <>
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    onClick={onClose}
                    className="fixed inset-0 bg-black/30 z-40"
                />
                <motion.div
                    initial={{ x: '-100%' }}
                    animate={{ x: 0 }}
                    exit={{ x: '-100%' }}
                    transition={{ type: 'spring', stiffness: 300, damping: 30 }}
                    className="fixed top-0 left-0 h-full w-full max-w-md bg-white z-50 shadow-2xl"
                >
                    <div className="p-6 h-full flex flex-col">
                        <div className="flex items-center justify-between mb-8">
                            <h2 className="text-2xl font-serif">Filter Collections</h2>
                            <button onClick={onClose} className="p-2 -mr-2 text-gray-500 hover:text-black">
                                <X size={24} />
                            </button>
                        </div>
                        <div className="flex-grow space-y-2">
                            {filters.map(f => (
                                <button
                                    key={f.id}
                                    onClick={() => onFilterChange(f.id)}
                                    className={`block w-full text-left py-3 px-4 rounded-lg text-lg transition-colors ${currentFilter === f.id ? 'bg-gray-100 font-semibold text-black' : 'hover:bg-gray-50 text-gray-600'}`}
                                >
                                    {f.label}
                                </button>
                            ))}
                        </div>
                         <button onClick={onClose} className="w-full bg-black text-white py-4 rounded-lg text-lg font-semibold mt-auto hover:bg-gray-800 transition-colors">
                            Show Results
                         </button>
                    </div>
                </motion.div>
            </>
        )}
    </AnimatePresence>
);

const CollectionsPage = () => {
    const [filter, setFilter] = useState('all');
    const [isFilterPanelOpen, setIsFilterPanelOpen] = useState(false);
    const [visibleCount, setVisibleCount] = useState(ITEMS_PER_PAGE);

    const filters = [
        { id: 'all', label: 'All' },
        { id: 'featured', label: 'Featured' },
        { id: 'seasonal', label: 'Seasonal' },
        { id: 'formal', label: 'Formal' },
        { id: 'accessories', label: 'Accessories' }
    ];

    const filteredCollections = useMemo(() => collections.filter(collection => {
        if (filter === 'all') return true;
        if (filter === 'featured') return collection.featured;
        return collection.category === filter;
    }), [filter]);

    const paginatedCollections = useMemo(() => filteredCollections.slice(0, visibleCount), [filteredCollections, visibleCount]);

    const handleFilterChange = (newFilter) => {
        setFilter(newFilter);
        setVisibleCount(ITEMS_PER_PAGE); // Reset pagination on filter change
    };

    const loadMore = () => {
        setVisibleCount(prevCount => prevCount + ITEMS_PER_PAGE);
    };

    const getCardLayout = (index) => {
        const pattern = ['wide', 'tall', 'regular', 'regular', 'tall', 'wide'];
        const layout = pattern[index % pattern.length];
        
        if (paginatedCollections.length === 1) return 'md:col-span-2 lg:col-span-4';

        if (layout === 'wide') return 'md:col-span-2';
        if (layout === 'tall') return 'md:row-span-2';
        return 'md:col-span-1';
    };

    return (
        <div className="min-h-screen bg-white text-gray-800">
            <PageHeader />
            
            <FilterPanel 
                isOpen={isFilterPanelOpen} 
                onClose={() => setIsFilterPanelOpen(false)}
                filters={filters}
                currentFilter={filter}
                onFilterChange={handleFilterChange}
            />

            <div className="sticky top-[70px] z-30 backdrop-blur-md bg-white/80 border-b border-gray-200">
                <div className="max-w-screen-2xl mx-auto flex items-center justify-between py-3 px-4 sm:px-6 lg:px-8">
                    <button 
                        className="flex items-center gap-2 text-sm font-medium" 
                        onClick={() => setIsFilterPanelOpen(true)}
                    >
                        <LayoutGrid size={20} />
                        Filter
                    </button>
                    <div className="text-sm text-gray-500">{filteredCollections.length} Items</div>
                </div>
            </div>

            <main className="max-w-screen-2xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
                <AnimatePresence>
                    <motion.div
                        layout
                        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6"
                        style={{ gridAutoRows: 'minmax(200px, auto)' }}
                    >
                        {paginatedCollections.map((collection, index) => (
                            <motion.div
                                key={collection.id}
                                layout
                                initial={{ opacity: 0, scale: 0.95 }}
                                animate={{ opacity: 1, scale: 1 }}
                                exit={{ opacity: 0, scale: 0.9 }}
                                transition={{ duration: 0.4, ease: 'easeOut' }}
                                className={getCardLayout(index)}
                            >
                                <CollectionCard collection={collection} />
                            </motion.div>
                        ))}
                    </motion.div>
                </AnimatePresence>

                 {paginatedCollections.length === 0 && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="text-center py-20"
                    >
                        <p className="text-gray-500 text-lg">No collections found for this filter.</p>
                    </motion.div>
                 )}
                
                {visibleCount < filteredCollections.length && (
                    <div className="text-center mt-12">
                        <motion.button
                            onClick={loadMore}
                            className="bg-black text-white font-semibold py-3 px-8 rounded-full hover:bg-gray-800 transition-colors"
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                        >
                            Load More
                        </motion.button>
                    </div>
                )}
            </main>
        </div>
    );
};

export default CollectionsPage;
