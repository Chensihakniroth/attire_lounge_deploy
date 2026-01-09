import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
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
    const [isFilterOpen, setIsFilterOpen] = useState(false);

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
            transition: { staggerChildren: 0.08 }
        }
    };
    
    const filterDropdownVariants = {
        hidden: { opacity: 0, y: -10 },
        visible: { opacity: 1, y: 0 }
    }

    return (
        <div className="min-h-screen bg-white text-black">
            <div className="sticky top-[70px] z-30">
                <div className="text-fluid-base flex items-center justify-between border-y border-solid border-black bg-white py-4 px-4 font-normal text-black lg:px-12">
                    <div className="relative">
                        <button 
                            className="z-20 flex h-full items-center justify-center gap-1" 
                            type="button"
                            onClick={() => setIsFilterOpen(!isFilterOpen)}
                        >
                            <span className="text-bodyLarge">Filter</span> +
                        </button>
                        <AnimatePresence>
                        {isFilterOpen && (
                            <motion.div 
                                className="absolute top-full left-0 mt-2 bg-white border border-solid border-black rounded-md shadow-lg py-2 w-48"
                                variants={filterDropdownVariants}
                                initial="hidden"
                                animate="visible"
                                exit="hidden"
                            >
                                {filters.map(f => (
                                    <button
                                        key={f.id}
                                        onClick={() => { setFilter(f.id); setIsFilterOpen(false); }}
                                        className={`block w-full text-left px-4 py-2 text-sm ${filter === f.id ? 'font-bold' : 'hover:bg-gray-100'}`}
                                    >
                                        {f.label}
                                    </button>
                                ))}
                            </motion.div>
                        )}
                        </AnimatePresence>
                    </div>
                    <div className="opacity-60 hidden md:block">{filteredCollections.length} Items</div>
                </div>
            </div>

            <main className="max-w-screen-xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <motion.div
                    key={filter}
                    variants={containerVariants}
                    initial="hidden"
                    animate="visible"
                    className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 auto-rows-fr"
                >
                    {filteredCollections.map((collection, index) => (
                        <motion.div
                            key={collection.id}
                            layout
                            className={`
                                ${index === 0 ? 'lg:col-span-2 lg:row-span-2' : ''}
                                ${collection.featured && index !== 0 ? 'lg:col-span-2' : ''}
                            `}
                        >
                            <CollectionCard collection={collection} />
                        </motion.div>
                    ))}
                </motion.div>

                 {filteredCollections.length === 0 && (
                    <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="text-center py-20"
                    >
                        <p className="text-gray-500 text-lg">No collections match this filter.</p>
                    </motion.div>
                 )}
            </main>
        </div>
    );
};

export default CollectionsPage;
