import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import GalleryItem from './lookbook/GalleryItem';
import Lightbox from './lookbook/Lightbox';
import { wrap } from "popmotion";

const LookbookPage = () => {
    const [images] = useState([
        { id: 1, src: '/uploads/collections/model/1.jpg', title: 'Modern Sartorial', collection: 'Havana Collection', category: 'sartorial' },
        { id: 2, src: '/uploads/collections/model/2.jpg', title: 'Urban Elegance', collection: 'Mocha Mousse 25', category: 'office' },
        { id: 3, src: '/uploads/collections/model/3.jpg', title: 'Evening Sophistication', collection: 'Groom Collection', category: 'groom' },
        { id: 4, src: '/uploads/collections/model/4.jpg', title: 'Business Refined', collection: 'Office Collection', category: 'office' },
        { id: 5, src: '/uploads/collections/model/5.jpg', title: 'Linen Summer', collection: 'Havana Collection', category: 'sartorial' },
        { id: 6, src: '/uploads/collections/model/6.jpg', title: 'Accessory Details', collection: 'The Little Details', category: 'accessories' },
        { id: 7, src: '/uploads/lookbook/lookbook-7.jpg', title: 'Casual Luxury', collection: 'Mocha Mousse 25', category: 'sartorial' },
        { id: 8, src: '/uploads/lookbook/lookbook-8.jpg', title: 'Groom Style', collection: 'Groom Collection', category: 'groom' },
        { id: 9, src: '/uploads/lookbook/lookbook-9.jpg', title: 'Office Attire', collection: 'Office Collection', category: 'office' },
        { id: 10, src: '/uploads/lookbook/lookbook-10.jpg', title: 'Summer Linen', collection: 'Havana Collection', category: 'sartorial' },
        { id: 11, src: '/uploads/lookbook/lookbook-11.jpg', title: 'Cufflink Details', collection: 'The Little Details', category: 'accessories' },
        { id: 12, src: '/uploads/lookbook/lookbook-12.jpg', title: 'Evening Wear', collection: 'Groom Collection', category: 'groom' },
    ]);

    const [[page, direction], setPage] = useState([null, 0]);
    const [filter, setFilter] = useState('all');
    const [favorites, setFavorites] = useState([]);
    
    const categories = [
        { id: 'all', name: 'All' },
        { id: 'sartorial', name: 'Sartorial' },
        { id: 'groom', name: 'Groom' },
        { id: 'office', name: 'Office' },
        { id: 'accessories', name: 'Accessories' },
    ];

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
        <div className="min-h-screen py-24 px-4 sm:px-6 lg:px-8 bg-attire-cream/50">
            <motion.div 
                className="max-w-7xl mx-auto"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
            >
                <div className="text-center mb-16">
                    <h1 className="text-5xl md:text-7xl font-serif font-light text-attire-charcoal mb-3">Lookbook</h1>
                    <p className="text-lg text-attire-stone max-w-2xl mx-auto">
                        Discover style inspiration from our curated collections.
                    </p>
                </div>

                <div className="flex justify-center mb-16">
                    <div className="flex flex-wrap justify-center items-center gap-2 p-1.5 bg-black/5 backdrop-blur-sm rounded-full">
                        {categories.map((category) => (
                            <button
                                key={category.id}
                                onClick={() => setFilter(category.id)}
                                className={`px-5 py-2.5 rounded-full text-sm font-medium transition-colors relative ${
                                    filter === category.id ? 'text-attire-charcoal' : 'text-attire-stone/70 hover:text-attire-charcoal'
                                }`}
                            >
                                {filter === category.id && (
                                    <motion.div
                                        layoutId="filter-active"
                                        className="absolute inset-0 bg-white shadow-md rounded-full"
                                        transition={{ type: 'spring', stiffness: 200, damping: 20 }}
                                    />
                                )}
                                <span className="relative z-10">{category.name}</span>
                            </button>
                        ))}
                    </div>
                </div>

                <motion.div
                    key={filter}
                    variants={containerVariants}
                    initial="hidden"
                    animate="visible"
                    className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-x-6 gap-y-10"
                >
                    {filteredImages.map((image, index) => (
                        <GalleryItem
                            key={image.id}
                            image={image}
                            openLightbox={() => openLightbox(index)}
                            toggleFavorite={toggleFavorite}
                            isFavorite={favorites.includes(image.id)}
                        />
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
        </div>
    );
};

export default LookbookPage;
