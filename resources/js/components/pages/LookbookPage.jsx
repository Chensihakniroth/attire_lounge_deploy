import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Lightbox from './lookbook/Lightbox';
import { wrap } from "popmotion";
import minioBaseUrl from '../../config.js';
import { ChevronLeft, ChevronRight } from 'lucide-react';

const LookbookPage = () => {
    const [images] = useState([
        // Havana Collection - Sartorial
        { id: 1, src: `${minioBaseUrl}/uploads/collections/default/hvn0.jpg`, title: 'Havana Breezy', collection: 'Havana Collection', category: ['sartorial'], span: 'col-span-2 row-span-2' },
        { id: 2, src: `${minioBaseUrl}/uploads/collections/default/hvn1.jpg`, title: 'Sunset Casual', collection: 'Havana Collection', category: ['sartorial'], span: 'col-span-1 row-span-1' },
        { id: 3, src: `${minioBaseUrl}/uploads/collections/default/hvn2.jpg`, title: 'Cuban Nights', collection: 'Havana Collection', category: ['sartorial'], span: 'col-span-1 row-span-2' },
        { id: 4, src: `${minioBaseUrl}/uploads/collections/default/hvn3.jpg`, title: 'Linen Classic', collection: 'Havana Collection', category: ['sartorial'], span: 'col-span-1 row-span-1' },
        { id: 5, src: `${minioBaseUrl}/uploads/collections/default/hvn4.jpg`, title: 'Tropical Sophistication', collection: 'Havana Collection', category: ['sartorial'], span: 'col-span-1 row-span-2' },
        { id: 6, src: `${minioBaseUrl}/uploads/collections/default/hvn5.jpg`, title: 'Coastal Charm', collection: 'Havana Collection', category: ['sartorial'], span: 'col-span-1 row-span-1' },
        { id: 7, src: `${minioBaseUrl}/uploads/collections/default/hvn6.jpg`, title: 'Island Elegance', collection: 'Havana Collection', category: ['sartorial'], span: 'col-span-1 row-span-1' },
        { id: 8, src: `${minioBaseUrl}/uploads/collections/default/hvn7.jpg`, title: 'Seaside Style', collection: 'Havana Collection', category: ['sartorial'], span: 'col-span-2 row-span-1' },
        { id: 9, src: `${minioBaseUrl}/uploads/collections/default/hvn8.jpg`, title: 'Caribbean Cool', collection: 'Havana Collection', category: ['sartorial'], span: 'col-span-1 row-span-1' },

        // Mocha Mousse Collection - Sartorial
        { id: 10, src: `${minioBaseUrl}/uploads/collections/default/mm1.jpg`, title: 'Espresso Edge', collection: 'Mocha Mousse 25', category: ['sartorial'], span: 'col-span-1 row-span-2' },
        { id: 11, src: `${minioBaseUrl}/uploads/collections/default/mm2.jpg`, title: 'Urban Comfort', collection: 'Mocha Mousse 25', category: ['sartorial'], span: 'col-span-1 row-span-1' },
        { id: 12, src: `${minioBaseUrl}/uploads/collections/default/mm3.jpg`, title: 'Downtown Vibe', collection: 'Mocha Mousse 25', category: ['sartorial'], span: 'col-span-1 row-span-1' },
        { id: 13, src: `${minioBaseUrl}/uploads/collections/default/mm4.jpg`, title: 'City Classic', collection: 'Mocha Mousse 25', category: ['sartorial'], span: 'col-span-1 row-span-2' },
        { id: 14, src: `${minioBaseUrl}/uploads/collections/default/mm5.jpg`, title: 'Metro Style', collection: 'Mocha Mousse 25', category: ['sartorial'], span: 'col-span-2 row-span-2' },
        { id: 15, src: `${minioBaseUrl}/uploads/collections/default/mm6.jpg`, title: 'Modern Mocha', collection: 'Mocha Mousse 25', category: ['sartorial'], span: 'col-span-1 row-span-1' },
        { id: 16, src: `${minioBaseUrl}/uploads/collections/default/mm7.jpg`, title: 'Refined Casual', collection: 'Mocha Mousse 25', category: ['sartorial'], span: 'col-span-1 row-span-1' },

        // Business Collection (formerly Office)
        { id: 17, src: `${minioBaseUrl}/uploads/collections/default/of1.jpg`, title: 'Boardroom Ready', collection: 'Office Collection', category: ['business'], span: 'col-span-1 row-span-1' },
        { id: 18, src: `${minioBaseUrl}/uploads/collections/default/of2.jpg`, title: 'Executive Presence', collection: 'Office Collection', category: ['business'], span: 'col-span-1 row-span-2' },
        { id: 19, src: `${minioBaseUrl}/uploads/collections/default/of3.jpg`, title: 'Corporate Style', collection: 'Office Collection', category: ['business'], span: 'col-span-1 row-span-1' },
        { id: 20, src: `${minioBaseUrl}/uploads/collections/default/of4.jpg`, title: 'Business Formal', collection: 'Office Collection', category: ['business', 'formal'], span: 'col-span-2 row-span-1' },
        { id: 21, src: `${minioBaseUrl}/uploads/collections/default/of5.jpg`, title: 'Professional Polish', collection: 'Office Collection', category: ['business'], span: 'col-span-1 row-span-1' },

        // Groom & Formal Collection
        { id: 22, src: `${minioBaseUrl}/uploads/collections/default/g1.jpg`, title: 'Classic Tuxedo', collection: 'Groom Collection', category: ['grooms', 'formal'], span: 'col-span-1 row-span-1' },
        { id: 23, src: `${minioBaseUrl}/uploads/collections/default/g2.jpg`, title: 'Wedding Day', collection: 'Groom Collection', category: ['grooms', 'formal'], span: 'col-span-1 row-span-2' },
        { id: 24, src: `${minioBaseUrl}/uploads/collections/default/g3.jpg`, title: 'Groomsmen Style', collection: 'Groom Collection', category: ['grooms', 'formal'], span: 'col-span-1 row-span-1' },
        { id: 25, src: `${minioBaseUrl}/uploads/collections/default/g4.jpg`, title: 'Elegant Ceremony', collection: 'Groom Collection', category: ['grooms', 'formal'], span: 'col-span-2 row-span-1' },
        { id: 26, src: `${minioBaseUrl}/uploads/collections/default/g5.jpg`, title: 'Reception Look', collection: 'Groom Collection', category: ['grooms', 'formal'], span: 'col-span-1 row-span-1' },
        { id: 27, src: `${minioBaseUrl}/uploads/collections/default/g6.jpg`, title: 'Tailored Perfection', collection: 'Groom Collection', category: ['grooms', 'formal'], span: 'col-span-1 row-span-2' },
        { id: 28, src: `${minioBaseUrl}/uploads/collections/default/g7.jpg`, title: 'Celebration Suit', collection: 'Groom Collection', category: ['grooms', 'formal'], span: 'col-span-1 row-span-1' },
        { id: 29, src: `${minioBaseUrl}/uploads/collections/default/g8.jpg`, title: 'Formal Event', collection: 'Groom Collection', category: ['grooms', 'formal'], span: 'col-span-2 row-span-2' },
    ]);

    const [[page, direction], setPage] = useState([null, 0]);
    const [filter, setFilter] = useState('all');
    const [favorites, setFavorites] = useState([]);

    const filteredImages = images.filter(img => filter === 'all' || img.category.includes(filter));
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

    const categories = [
        { id: 'all', name: 'All' },
        { id: 'sartorial', name: 'Sartorial' },
        { id: 'grooms', name: 'Grooms' },
        { id: 'formal', name: 'Formal' },
        { id: 'business', name: 'Business' },
    ];

    const scrollContainerRef = useRef(null);

    const scroll = (direction) => {
        if (scrollContainerRef.current) {
            scrollContainerRef.current.scrollBy({ left: direction * 200, behavior: 'smooth' });
        }
    };

    return (
        <motion.div
            className="h-full w-full flex flex-col bg-attire-navy overflow-hidden relative"
        >
            <div className="w-full p-6 bg-attire-dark/20 backdrop-blur-sm z-10 lg:pt-24">
                <div className="flex items-center">
                    <button 
                        onClick={() => scroll(-1)}
                        className="p-1 text-white/50 hover:text-white md:hidden"
                    >
                        <ChevronLeft size={20} />
                    </button>
                    <div ref={scrollContainerRef} className="flex-grow flex items-center justify-start md:justify-center gap-4 overflow-x-auto [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none] py-2">
                        {categories.map((category) => (
                            <button
                                key={category.id}
                                onClick={() => setFilter(category.id)}
                                className={`flex-shrink-0 px-5 py-2.5 rounded-full text-sm font-medium transition-colors relative ${
                                    filter === category.id ? 'text-white' : 'text-attire-silver/70 hover:text-white'
                                }`}
                            >
                                {filter === category.id && (
                                    <motion.div
                                        layoutId="lookbook-filter-active"
                                        className="absolute inset-0 bg-attire-accent shadow-md rounded-full"
                                        transition={{ type: 'spring', stiffness: 200, damping: 20 }}
                                    />
                                )}
                                <span className="relative z-10">{category.name}</span>
                            </button>
                        ))}
                    </div>
                    <button 
                        onClick={() => scroll(1)}
                        className="p-1 text-white/50 hover:text-white md:hidden"
                    >
                        <ChevronRight size={20} />
                    </button>
                </div>
            </div>

            <motion.div
                id="main-content"
                className="flex-grow overflow-y-auto [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none] touch-pan-y"
            >
                <motion.div
                    key={filter}
                    variants={containerVariants}
                    initial="hidden"
                    animate="visible"
                    className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 p-4 lg:p-8"
                >
                    {filteredImages.map((image, index) => (
                        <div
                            key={image.id}
                            className="group relative cursor-pointer overflow-hidden h-[28rem]"
                            onClick={() => openLightbox(index)}
                        >
                            <img
                                src={image.src}
                                alt={image.title}
                                className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                            />
                        </div>
                    ))}
                </motion.div>
            </motion.div>

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
