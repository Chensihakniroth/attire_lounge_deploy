import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { wrap } from "popmotion";
import { useFavorites } from '../../context/FavoritesContext.jsx';
import { products as allProducts } from '../../data/products.js';
import ItemCard from './collections/ItemCard.jsx';
import Lightbox from './lookbook/Lightbox';
import { ChevronLeft, Heart, ShoppingBag, ArrowRight } from 'lucide-react';

const FavoritesPage = () => {
    const { favorites, addFavorite, removeFavorite, isFavorited } = useFavorites();
    const favoriteProducts = allProducts.filter(p => favorites.includes(p.id));
    
    // Lightbox State
    const [[page, direction], setPage] = useState([null, 0]);
    const imageIndex = page !== null ? wrap(0, favoriteProducts.length, page) : null;
    const selectedImage = page !== null ? favoriteProducts[imageIndex] : null;

    const openLightbox = (index) => setPage([index, 0]);
    const closeLightbox = () => setPage([null, 0]);
    
    const paginate = (newDirection) => {
        if (page === null || !favoriteProducts.length) return;
        setPage([page + newDirection, newDirection]);
    };

    const toggleFavorite = (id) => {
        if (isFavorited(id)) {
            removeFavorite(id);
            // If we remove the current item from lightbox, close it or stay safe
            if (selectedImage && selectedImage.id === id) {
                // Optional: Close lightbox or let it update
            }
        } else {
            addFavorite(id);
        }
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
        visible: { opacity: 1, transition: { staggerChildren: 0.05 } }
    };

    return (
        <div className="min-h-screen bg-attire-navy relative overflow-hidden">
            {/* Background Texture - Softened */}
            <div className="fixed top-0 left-0 w-full h-screen overflow-hidden pointer-events-none z-0">
                <div className="absolute top-[-10%] right-[-5%] w-[600px] h-[600px] bg-attire-accent/[0.03] rounded-full blur-[160px]" />
                <div className="absolute bottom-[-10%] left-[-10%] w-[500px] h-[500px] bg-blue-900/[0.05] rounded-full blur-[140px]" />
            </div>

            <header className="relative z-10 pt-24 pb-12 sm:pt-32 sm:pb-16 px-6 text-center">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8, ease: "easeOut" }}
                >
                    <h1 className="text-5xl md:text-7xl font-serif font-light text-white mb-6">
                        Your Favorites
                    </h1>
                    
                    <div className="flex items-center justify-center gap-6 text-sm">
                        <Link to="/collections" className="flex items-center gap-2 text-attire-silver hover:text-white transition-colors">
                            <ChevronLeft size={16} />
                            Back to Collections
                        </Link>
                        <span className="w-1 h-1 bg-attire-silver/30 rounded-full" />
                        <span className="text-attire-accent font-medium">
                            {favoriteProducts.length} {favoriteProducts.length === 1 ? 'Item' : 'Items'} Saved
                        </span>
                    </div>
                </motion.div>
            </header>

            <main className="relative z-10 max-w-screen-xl mx-auto px-4 sm:px-6 lg:px-8 pb-24">
                {favoriteProducts.length > 0 ? (
                    <motion.div
                        className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-x-6 gap-y-12"
                        variants={containerVariants}
                        initial="hidden"
                        animate="visible"
                    >
                        {favoriteProducts.map((item, index) => (
                            <div key={item.id} className="group relative">
                                <ItemCard 
                                    product={item} 
                                    openLightbox={() => openLightbox(index)}
                                />
                                <button 
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        removeFavorite(item.id);
                                    }}
                                    className="absolute top-2 right-2 p-2 bg-black/50 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-500/80"
                                    title="Remove from favorites"
                                >
                                    <Heart size={16} fill="currentColor" />
                                </button>
                            </div>
                        ))}
                    </motion.div>
                ) : (
                    <motion.div 
                        initial={{ opacity: 0, scale: 0.95 }} 
                        animate={{ opacity: 1, scale: 1 }} 
                        className="flex flex-col items-center justify-center py-20 text-center"
                    >
                        <div className="w-24 h-24 bg-white/5 rounded-full flex items-center justify-center mb-8 border border-white/10">
                            <Heart size={40} className="text-attire-silver/50" />
                        </div>
                        <h2 className="text-3xl font-serif text-white mb-4">No favorites yet</h2>
                        <p className="text-attire-silver max-w-md mx-auto mb-10 leading-relaxed">
                            Your wishlist is empty. Explore our collections and find the pieces that speak to your style.
                        </p>
                        <Link to="/collections" className="group inline-flex items-center gap-3 bg-attire-accent text-white font-semibold px-8 py-4 rounded-full transition-all hover:bg-attire-accent/90 hover:pr-10">
                            <span>Start Browsing</span>
                            <ArrowRight className="w-5 h-5 opacity-0 -ml-4 group-hover:opacity-100 group-hover:ml-0 transition-all" />
                        </Link>
                    </motion.div>
                )}
            </main>

            <AnimatePresence>
                {selectedImage && (
                    <Lightbox
                        key="lightbox"
                        selectedImage={{
                            ...selectedImage,
                            src: selectedImage.images[0], // Ensure compatibility with Lightbox format
                            title: selectedImage.name,
                            collection: selectedImage.collection
                        }}
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

export default FavoritesPage;
