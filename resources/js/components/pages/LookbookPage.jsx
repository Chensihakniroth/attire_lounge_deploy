import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Filter, X } from 'lucide-react';
import GalleryItem from './lookbook/GalleryItem';
import Lightbox from './lookbook/Lightbox';
import { wrap } from "popmotion";

const FilterContent = ({ isMobile, setFilter, setIsFilterOpen, currentFilter }) => {
    const categories = [
        { id: 'all', name: 'All' },
        { id: 'sartorial', name: 'Sartorial' },
        { id: 'office', name: 'Office' },
    ];

    const handleFilterClick = (filterId) => {
        setFilter(filterId);
        if (isMobile) {
            setIsFilterOpen(false);
        }
    };

    return (
        <div className="flex flex-col items-start gap-4">
            {categories.map((category) => (
                <button
                    key={category.id}
                    onClick={() => handleFilterClick(category.id)}
                    className={`px-5 py-2.5 rounded-full text-sm font-medium transition-colors relative w-full text-left ${
                        currentFilter === category.id ? 'text-white' : 'text-attire-silver/70 hover:text-white'
                    }`}
                >
                    {currentFilter === category.id && (
                        <motion.div
                            layoutId="filter-active"
                            className="absolute inset-0 bg-attire-dark shadow-md rounded-full"
                            transition={{ type: 'spring', stiffness: 200, damping: 20 }}
                        />
                    )}
                    <span className="relative z-10">{category.name}</span>
                </button>
            ))}
        </div>
    );
};

import minioBaseUrl from '../../config.js';

const LookbookPage = () => {
    const [images] = useState([
        // Havana Collection
        { id: 1, src: `${minioBaseUrl}/uploads/collections/default/hvn0.jpg`, title: 'Havana Breezy', collection: 'Havana Collection', category: 'sartorial', span: 'col-span-2 row-span-2' },
        { id: 2, src: `${minioBaseUrl}/uploads/collections/default/hvn1.jpg`, title: 'Sunset Casual', collection: 'Havana Collection', category: 'sartorial', span: 'col-span-1 row-span-1' },
        { id: 3, src: `${minioBaseUrl}/uploads/collections/default/hvn2.jpg`, title: 'Cuban Nights', collection: 'Havana Collection', category: 'sartorial', span: 'col-span-1 row-span-2' },
        { id: 4, src: `${minioBaseUrl}/uploads/collections/default/hvn3.jpg`, title: 'Linen Classic', collection: 'Havana Collection', category: 'sartorial', span: 'col-span-1 row-span-1' },
        { id: 5, src: `${minioBaseUrl}/uploads/collections/default/hvn4.jpg`, title: 'Tropical Sophistication', collection: 'Havana Collection', category: 'sartorial', span: 'col-span-1 row-span-2' },
        { id: 6, src: `${minioBaseUrl}/uploads/collections/default/hvn5.jpg`, title: 'Coastal Charm', collection: 'Havana Collection', category: 'sartorial', span: 'col-span-1 row-span-1' },
        { id: 7, src: `${minioBaseUrl}/uploads/collections/default/hvn6.jpg`, title: 'Island Elegance', collection: 'Havana Collection', category: 'sartorial', span: 'col-span-1 row-span-1' },
        { id: 8, src: `${minioBaseUrl}/uploads/collections/default/hvn7.jpg`, title: 'Seaside Style', collection: 'Havana Collection', category: 'sartorial', span: 'col-span-2 row-span-1' },
        { id: 9, src: `${minioBaseUrl}/uploads/collections/default/hvn8.jpg`, title: 'Caribbean Cool', collection: 'Havana Collection', category: 'sartorial', span: 'col-span-1 row-span-1' },
        
        // Mocha Mousse Collection
        { id: 10, src: `${minioBaseUrl}/uploads/collections/default/mm1.jpg`, title: 'Espresso Edge', collection: 'Mocha Mousse 25', category: 'sartorial', span: 'col-span-1 row-span-2' },
        { id: 11, src: `${minioBaseUrl}/uploads/collections/default/mm2.jpg`, title: 'Urban Comfort', collection: 'Mocha Mousse 25', category: 'sartorial', span: 'col-span-1 row-span-1' },
        { id: 12, src: `${minioBaseUrl}/uploads/collections/default/mm3.jpg`, title: 'Downtown Vibe', collection: 'Mocha Mousse 25', category: 'sartorial', span: 'col-span-1 row-span-1' },
        { id: 13, src: `${minioBaseUrl}/uploads/collections/default/mm4.jpg`, title: 'City Classic', collection: 'Mocha Mousse 25', category: 'sartorial', span: 'col-span-1 row-span-2' },
        { id: 14, src: `${minioBaseUrl}/uploads/collections/default/mm5.jpg`, title: 'Metro Style', collection: 'Mocha Mousse 25', category: 'sartorial', span: 'col-span-2 row-span-2' },
        { id: 15, src: `${minioBaseUrl}/uploads/collections/default/mm6.jpg`, title: 'Modern Mocha', collection: 'Mocha Mousse 25', category: 'sartorial', span: 'col-span-1 row-span-1' },
        { id: 16, src: `${minioBaseUrl}/uploads/collections/default/mm7.jpg`, title: 'Refined Casual', collection: 'Mocha Mousse 25', category: 'sartorial', span: 'col-span-1 row-span-1' },

        // Office Collection
        { id: 17, src: `${minioBaseUrl}/uploads/collections/default/of1.jpg`, title: 'Boardroom Ready', collection: 'Office Collection', category: 'office', span: 'col-span-1 row-span-1' },
        { id: 18, src: `${minioBaseUrl}/uploads/collections/default/of2.jpg`, title: 'Executive Presence', collection: 'Office Collection', category: 'office', span: 'col-span-1 row-span-2' },
        { id: 19, src: `${minioBaseUrl}/uploads/collections/default/of3.jpg`, title: 'Corporate Style', collection: 'Office Collection', category: 'office', span: 'col-span-1 row-span-1' },
        { id: 20, src: `${minioBaseUrl}/uploads/collections/default/of4.jpg`, title: 'Business Formal', collection: 'Office Collection', category: 'office', span: 'col-span-2 row-span-1' },
        { id: 21, src: `${minioBaseUrl}/uploads/collections/default/of5.jpg`, title: 'Professional Polish', collection: 'Office Collection', category: 'office', span: 'col-span-1 row-span-1' },
    ]);

    const [[page, direction], setPage] = useState([null, 0]);
    const [filter, setFilter] = useState('all');
    const [favorites, setFavorites] = useState([]);
    const [isFilterOpen, setIsFilterOpen] = useState(false);
    const [isMobile, setIsMobile] = useState(false);

    useEffect(() => {
        const checkMobile = () => setIsMobile(window.innerWidth < 1024); // lg breakpoint
        checkMobile();
        window.addEventListener('resize', checkMobile);
        return () => window.removeEventListener('resize', checkMobile);
    }, []);
    
    const filteredImages = images.filter(img => filter === 'all' || img.category === filter);
    const imageIndex = page !== null ? wrap(0, filteredImages.length, page) : null;
    const selectedImage = page !== null ? filteredImages[imageIndex] : null;

    useEffect(() => {
        const savedFavorites = localStorage.getItem('lookbook_favorites');
        if (savedFavorites) {
            try {
                setFavorites(JSON.parse(savedFavorites));
            } catch (e) {
                console.error("Failed to parse favorites from localStorage", e);
            }
        }
    }, []);

    useEffect(() => {
        localStorage.setItem('lookbook_favorites', JSON.stringify(favorites));
    }, [favorites]);

    const openLightbox = (index) => setPage([index, 0]);
    const closeLightbox = () => setPage([null, 0]);
    const paginate = (newDirection) => {
        if (page === null || !filteredImages.length) return;
        setPage([page + newDirection, newDirection]);
    };

    const toggleFavorite = (id) => {
        setFavorites(prev =>
            prev.includes(id) ? prev.filter(favId => favId !== id) : [...prev, id]
        );
    };

    useEffect(() => {
        const filterState = isMobile ? isFilterOpen : false;
        window.dispatchEvent(new CustomEvent('lookbookFilterStateChange', { detail: { isFilterOpen: filterState } }));
    }, [isFilterOpen, isMobile]);

    useEffect(() => {
        const handleKeyDown = (e) => {
            if (page === null) return;
            if (e.key === 'ArrowRight') paginate(1);
            if (e.key === 'ArrowLeft') paginate(-1);
            if (e.key === 'Escape') closeLightbox();
        };
        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [page]);

    const containerVariants = {
        hidden: { opacity: 0 },
        visible: {
            opacity: 1,
            transition: { staggerChildren: 0.07, delayChildren: 0.2 }
        }
    };

    return (
        <motion.div
        className="h-full w-full flex bg-attire-navy overflow-hidden relative"
        onPanEnd={isMobile ? (event, info) => {
            const threshold = 50;
            const velocityThreshold = 200;

            if (Math.abs(info.velocity.y) > Math.abs(info.velocity.x)) {
                return;
            }

            if (isFilterOpen) {
                if (info.offset.x > threshold && info.velocity.x > velocityThreshold) {
                    setIsFilterOpen(false);
                }
            } else {
                if (info.offset.x < -threshold && info.velocity.x < -velocityThreshold) {
                    setIsFilterOpen(true);
                }
            }
        } : undefined}
    >
            {isMobile && !isFilterOpen && (
                <button
                    className="fixed top-6 right-6 z-30 p-3 bg-attire-dark/50 backdrop-blur-sm rounded-full text-white shadow-lg"
                    onClick={() => setIsFilterOpen(true)}
                >
                    <Filter size={20} />
                </button>
            )}
            {/* Main Content - Grid */}
            <motion.div
                className="flex-grow overflow-y-auto [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none] touch-pan-y"
            >
                                                        <motion.div
                                                            key={filter}
                                                            variants={containerVariants}
                                                            initial="hidden"
                                                            animate="visible"
                                                            className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-x-6 gap-y-12 px-4 lg:px-8"
                                                        >                                        {filteredImages.map((image, index) => (
                                            <div
                                                key={image.id}
                                                className={`group relative bg-attire-dark cursor-pointer`}
                                                onClick={() => openLightbox(index)}
                                            >
                                                <div className="relative overflow-hidden h-[28rem]">
                                                    {/* Image */}
                                                    <img
                                                        src={image.src}
                                                        alt={image.title}
                                                        className="w-full h-full object-cover transition-transform duration-700"
                                                    />
                                                </div>
                                                <div className="pt-4 pb-2 text-center">
                                                    <h3 className="text-base text-white">{image.title}</h3>
                                                </div>
                                            </div>
                                        ))}
                                    </motion.div>            </motion.div>

            {/* Desktop Sidebar */}
            <div className="hidden lg:block w-64 flex-shrink-0 p-8 border-l border-white/10 overflow-y-auto">
                <h2 className="text-2xl font-serif text-white mb-8">Filter by</h2>
                <FilterContent isMobile={isMobile} setFilter={setFilter} setIsFilterOpen={setIsFilterOpen} currentFilter={filter} />
            </div>

            {/* Mobile Sidebar */}
            <AnimatePresence>
                {isMobile && isFilterOpen && (
                    <motion.div
                        className="fixed top-0 right-0 h-full w-64 bg-attire-dark z-40 p-8 border-l border-white/10"
                        initial={{ x: "100%" }}
                        animate={{ x: 0 }}
                        exit={{ x: "100%" }}
                        transition={{ type: 'spring', stiffness: 300, damping: 30 }}
                    >
                        <div className="flex justify-between items-center mb-8">
                            <h2 className="text-2xl font-serif text-white">Filter by</h2>
                            <button className="lg:hidden text-white" onClick={() => setIsFilterOpen(false)}>
                                <X size={24} />
                            </button>
                        </div>
                        <FilterContent isMobile={isMobile} setFilter={setFilter} setIsFilterOpen={setIsFilterOpen} currentFilter={filter} />
                    </motion.div>
                )}
            </AnimatePresence>

            <AnimatePresence>
                {selectedImage && (
                    <Lightbox
                        key="lightbox"
                        selectedImage={selectedImage}
                        closeLightbox={closeLightbox}
                        direction={direction}
                        paginate={paginate}
                        toggleFavorite={toggleFavorite}
                        favorites={favorites}
                    />
                )}
            </AnimatePresence>
        </motion.div>
    );
};

export default LookbookPage;
