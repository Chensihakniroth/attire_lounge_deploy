import React, { useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link } from 'react-router-dom';
import { useFavorites } from '../../context/FavoritesContext.jsx';
import ItemCard from './collections/ItemCard.jsx';
import { ChevronLeft, Heart, ArrowRight, Loader2, Trash2 } from 'lucide-react';
import { useProducts } from '../../hooks/useProducts';
import SEO from '../common/SEO';
import GrainOverlay from '../common/GrainOverlay.jsx';

const FavoritesPage = () => {
    const { favorites, toggleFavorite, clearFavorites } = useFavorites();
    
    // Fetch real data from DB for these slugs
    const { data, isLoading } = useProducts({
        slugs: favorites.join(','),
        per_page: 100 // Load all favorites at once
    });

    const favoriteProducts = useMemo(() => {
        if (!data?.data) return [];
        // Keep the order the user added them if possible
        return data.data;
    }, [data]);
    
    const containerVariants = {
        hidden: { opacity: 0 },
        visible: { 
            opacity: 1, 
            transition: { 
                staggerChildren: 0.1,
                delayChildren: 0.3
            } 
        }
    };

    const itemVariants = {
        hidden: { opacity: 0, y: 30 },
        visible: { 
            opacity: 1, 
            y: 0, 
            transition: { 
                duration: 0.8, 
                ease: [0.22, 1, 0.36, 1] 
            } 
        }
    };

    const handleClearAll = () => {
        if (window.confirm("Are you sure you want to clear your collection?")) {
            clearFavorites();
        }
    };

    return (
        <div className="min-h-screen bg-attire-navy relative selection:bg-attire-accent selection:text-white">
            <SEO 
                title="Your Favorites | Elite Styling House"
                description="Your private collection of preferred pieces, selected for your next sartorial chapter."
            />
            <GrainOverlay />
            
            {/* Header Section */}
            <header className="relative z-10 pt-32 pb-16 sm:pt-48 sm:pb-24 px-6 text-center">
                <div className="max-w-4xl mx-auto">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 1 }}
                        className="flex flex-col items-center"
                    >
                        <div className="flex items-center gap-4 mb-8">
                            <div className="h-px w-8 bg-attire-accent/30" />
                            <span className="text-attire-accent text-[10px] tracking-[0.6em] uppercase font-bold">Curated Gallery</span>
                            <div className="h-px w-8 bg-attire-accent/30" />
                        </div>

                        <h1 className="font-serif text-6xl md:text-8xl lg:text-[7rem] font-light text-white mb-10 leading-[0.85] tracking-tighter italic">
                            Your <br /> 
                            <span className="text-attire-silver/40">Favorites</span>
                        </h1>

                        <div className="flex flex-col sm:flex-row items-center justify-center gap-8">
                            <Link to="/products" className="group flex items-center gap-3 text-[10px] uppercase tracking-[0.3em] font-bold text-white/40 hover:text-attire-accent transition-colors duration-500">
                                <ChevronLeft size={14} className="group-hover:-translate-x-2 transition-transform duration-500" />
                                Continue Exploring
                            </Link>

                            {favorites.length > 0 && (
                                <button 
                                    onClick={handleClearAll}
                                    className="group flex items-center gap-3 text-[10px] uppercase tracking-[0.3em] font-bold text-white/20 hover:text-red-400 transition-colors duration-500"
                                >
                                    <Trash2 size={12} className="group-hover:rotate-12 transition-transform duration-500" />
                                    Clear Collection
                                </button>
                            )}
                        </div>
                    </motion.div>
                </div>
            </header>

            {/* Main Content */}
            <main className="relative z-10 max-w-screen-2xl mx-auto px-6 sm:px-12 lg:px-24 pb-32">
                <AnimatePresence mode="wait">
                    {isLoading ? (
                        <motion.div 
                            key="loading"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="flex flex-col items-center justify-center py-32"
                        >
                            <Loader2 className="w-12 h-12 text-attire-accent animate-spin mb-4" />
                            <p className="text-attire-silver/60 text-xs uppercase tracking-widest font-bold">Recalling Your Choices...</p>
                        </motion.div>
                    ) : favoriteProducts.length > 0 ? (
                        <motion.div
                            key="grid"
                            className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-8 lg:gap-12"
                            variants={containerVariants}
                            initial="hidden"
                            animate="visible"
                        >
                            {favoriteProducts.map((item) => (
                                <motion.div 
                                    key={item.id} 
                                    variants={itemVariants}
                                    className="relative group"
                                >
                                    <ItemCard product={item} />
                                    
                                    <button 
                                        onClick={(e) => {
                                            e.preventDefault();
                                            toggleFavorite(item.slug);
                                        }}
                                        className="absolute top-4 right-4 z-20 w-10 h-10 flex items-center justify-center bg-black/40 backdrop-blur-md border border-white/10 text-attire-accent rounded-full opacity-0 translate-y-2 group-hover:opacity-100 group-hover:translate-y-0 transition-all duration-500 hover:bg-white hover:text-black"
                                        title="Remove from favorites"
                                    >
                                        <Heart size={16} fill="currentColor" />
                                    </button>
                                </motion.div>
                            ))}
                        </motion.div>
                    ) : (
                        <motion.div 
                            key="empty"
                            initial={{ opacity: 0, y: 20 }} 
                            animate={{ opacity: 1, y: 0 }} 
                            className="flex flex-col items-center justify-center py-32 text-center"
                        >
                            <div className="relative mb-12">
                                <div className="absolute inset-0 bg-attire-accent/10 blur-[80px] rounded-full" />
                                <div className="relative w-32 h-32 bg-white/[0.03] backdrop-blur-md rounded-full flex items-center justify-center border border-white/10 shadow-2xl">
                                    <Heart size={48} className="text-white/10" strokeWidth={1} />
                                </div>
                            </div>
                            
                            <h2 className="font-serif text-4xl md:text-5xl text-white mb-6 tracking-tighter italic">Your gallery is <span className="text-attire-silver/40">awaiting curation</span></h2>
                            <p className="text-attire-silver/50 text-xs uppercase tracking-[0.4em] font-bold max-w-md mx-auto mb-12 leading-relaxed">
                                Discover our latest collections and start selecting your perfect wardrobe.
                            </p>
                            
                            <Link to="/products" className="group flex flex-col items-center gap-6">
                                <div className="w-20 h-20 rounded-full border border-white/10 flex items-center justify-center group-hover:bg-white group-hover:border-white transition-all duration-700 shadow-2xl shadow-white/5 relative overflow-hidden">
                                    <ArrowRight className="text-white group-hover:text-black transition-colors duration-500 relative z-10" size={28} />
                                    <div className="absolute inset-0 bg-white translate-y-full group-hover:translate-y-0 transition-transform duration-700" />
                                </div>
                                <span className="text-[10px] tracking-[0.5em] text-white/30 uppercase font-bold group-hover:text-attire-accent transition-colors duration-500">Start Curating</span>
                            </Link>
                        </motion.div>
                    )}
                </AnimatePresence>
            </main>
        </div>
    );
};

export default FavoritesPage;
