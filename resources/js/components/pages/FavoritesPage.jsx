// resources/js/components/pages/FavoritesPage.jsx - CLEAN FAVORITES
import React, { useMemo, useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link } from 'react-router-dom';
import { useFavorites } from '../../context/FavoritesContext.jsx';
import ItemCard from './collections/ItemCard.jsx';
import { Heart, ArrowRight, Loader2, Trash2 } from 'lucide-react';
import { useProducts } from '../../hooks/useProducts';
import SEO from '../common/SEO';
import { isSafari } from '../../helpers/browserUtils.js';

const FavoritesPage = () => {
    const { favorites, toggleFavorite, clearFavorites } = useFavorites();
    const [isSafariBrowser, setIsSafariBrowser] = useState(false);

    useEffect(() => {
        setIsSafariBrowser(isSafari());
    }, []);
    
    const { data, isLoading } = useProducts({
        slugs: favorites.join(','),
        per_page: 100
    });

    const favoriteProducts = useMemo(() => {
        if (favorites.length === 0) return [];
        if (!data?.data) return [];
        return data.data;
    }, [data, favorites]);

    const handleClearAll = () => {
        if (window.confirm("Clear all favorites?")) {
            clearFavorites();
        }
    };

    return (
        <div className="min-h-screen bg-[#0d3542] relative">
            <SEO 
                title="Favorites | Attire Lounge"
                description="Your saved items and preferred pieces."
            />
            
            {/* Header */}
            <header className="relative z-10 pt-28 pb-16 md:pt-36 md:pb-20 px-6 text-center">
                <div className="max-w-3xl mx-auto">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                    >
                        <h1 className="font-serif text-4xl md:text-6xl leading-tight text-white mb-4">
                            Favorites
                        </h1>
                        <p className="text-white/50 text-sm md:text-base font-light max-w-md mx-auto leading-relaxed">
                            Your saved items. Manage your selection before your next appointment.
                        </p>

                        <div className="flex items-center justify-center gap-6 mt-8">
                            {favorites.length > 0 && (
                                <button 
                                    onClick={handleClearAll}
                                    className="group flex items-center gap-2 text-[10px] uppercase tracking-[0.2em] font-bold text-white/30 hover:text-red-400 transition-colors duration-300"
                                >
                                    <Trash2 size={12} />
                                    Clear All
                                </button>
                            )}
                        </div>
                    </motion.div>
                </div>
            </header>

            {/* Main Content */}
            <main className="relative z-10 max-w-[1600px] mx-auto px-6 sm:px-10 lg:px-16 pb-24">
                <AnimatePresence mode="wait">
                    {isLoading && favorites.length > 0 ? (
                        <motion.div 
                            key="loading"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="flex flex-col items-center justify-center py-24"
                        >
                            <Loader2 className="w-8 h-8 text-[#f5a81c] animate-spin mb-3" />
                            <p className="text-white/40 text-[10px] uppercase tracking-[0.2em] font-bold">Loading...</p>
                        </motion.div>
                    ) : favoriteProducts.length > 0 ? (
                        <motion.div
                            key="grid"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6"
                        >
                            {favoriteProducts.map((item) => (
                                <div key={item.id} className="relative group">
                                    <ItemCard product={item} />
                                    <button 
                                        onClick={(e) => {
                                            e.preventDefault();
                                            toggleFavorite(item.slug);
                                        }}
                                        className="absolute top-3 right-3 z-20 w-8 h-8 flex items-center justify-center bg-black/40 backdrop-blur border border-white/10 text-white/70 rounded-full opacity-0 group-hover:opacity-100 transition-all duration-300 hover:bg-red-500 hover:text-white hover:border-red-500"
                                        title="Remove from favorites"
                                    >
                                        <Heart size={12} fill="currentColor" />
                                    </button>
                                </div>
                            ))}
                        </motion.div>
                    ) : (
                        <motion.div 
                            key="empty"
                            initial={{ opacity: 0, y: 20 }} 
                            animate={{ opacity: 1, y: 0 }} 
                            className="flex flex-col items-center justify-center py-24 text-center"
                        >
                            <div className="w-16 h-16 bg-white/[0.03] rounded-full flex items-center justify-center border border-white/10 mb-8">
                                <Heart size={24} className="text-white/20" strokeWidth={1} />
                            </div>
                            
                            <h2 className="text-2xl font-serif text-white mb-3">No favorites yet</h2>
                            <p className="text-white/40 text-sm font-light max-w-sm mb-8">
                                Browse our collections and save items you like.
                            </p>
                            
                            <Link to="/products" className="group flex items-center gap-3">
                                <ArrowRight className="text-white/40 group-hover:text-[#f5a81c] transition-colors duration-300" size={14} />
                                <span className="text-[10px] tracking-[0.3em] text-white/40 uppercase font-bold group-hover:text-[#f5a81c] transition-colors duration-300">Browse Products</span>
                            </Link>
                        </motion.div>
                    )}
                </AnimatePresence>
            </main>
        </div>
    );
};

export default FavoritesPage;
