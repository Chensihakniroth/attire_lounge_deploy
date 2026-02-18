import React from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { wrap } from "../../helpers/math.js";
import { useFavorites } from '../../context/FavoritesContext.jsx';
import { products as allProducts } from '../../data/products.js';
import ItemCard from './collections/ItemCard.jsx';
import { ChevronLeft, Heart, ShoppingBag, ArrowRight } from 'lucide-react';

const FavoritesPage = () => {
    const { favorites, addFavorite, removeFavorite, isFavorited } = useFavorites();
    const favoriteProducts = allProducts.filter(p => favorites.includes(p.id));
    
    const containerVariants = {
        hidden: { opacity: 0 },
        visible: { opacity: 1, transition: { staggerChildren: 0.1, delayChildren: 0.2 } }
    };

    const itemVariants = {
        hidden: { opacity: 0, y: 20 },
        visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: "easeOut" } }
    };

    return (
        <div className="min-h-screen bg-attire-navy relative overflow-hidden flex flex-col">
            {/* Cinematic Background */}
            <div className="fixed inset-0 pointer-events-none z-0">
                <div className="absolute top-[-10%] right-[-5%] w-[800px] h-[800px] bg-attire-accent/[0.03] rounded-full blur-[160px] animate-pulse-soft" />
                <div className="absolute bottom-[-10%] left-[-10%] w-[600px] h-[600px] bg-attire-accent/[0.05] rounded-full blur-[140px] animate-float" />
                <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-[0.03] mix-blend-overlay" />
            </div>

            {/* Header Section */}
            <header className="relative z-10 pt-32 pb-16 px-6 overflow-hidden">
                <div className="max-w-7xl mx-auto">
                    <motion.div
                        initial={{ opacity: 0, y: 30 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 1, ease: "easeOut" }}
                        className="flex flex-col md:flex-row md:items-end justify-between gap-8"
                    >
                        <div className="max-w-2xl">
                            <motion.div 
                                initial={{ opacity: 0, x: -20 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: 0.5 }}
                                className="flex items-center gap-3 mb-6"
                            >
                                <div className="h-px w-8 bg-attire-accent" />
                                <span className="text-attire-accent font-serif italic text-lg">Curated Gallery</span>
                            </motion.div>
                            
                            <h1 className="text-6xl md:text-8xl font-serif text-white mb-6 tracking-tighter leading-[0.9]">
                                Your <br/>
                                <span className="italic text-transparent bg-clip-text bg-gradient-to-r from-attire-cream to-attire-silver opacity-90">Favorites</span>
                            </h1>
                            
                            <p className="text-attire-silver/60 text-lg font-light leading-relaxed max-w-md border-l border-white/10 pl-6">
                                A private collection of your preferred pieces, selected for your next sartorial chapter.
                            </p>
                        </div>

                        <div className="flex flex-col items-start md:items-end gap-6">
                            <div className="flex items-center gap-4 bg-white/5 backdrop-blur-md border border-white/10 px-6 py-3 rounded-full">
                                <Heart size={18} className="text-attire-accent fill-attire-accent animate-pulse-soft" />
                                <span className="text-white font-medium tracking-widest text-xs uppercase">
                                    {favoriteProducts.length} {favoriteProducts.length === 1 ? 'Piece' : 'Pieces'} Saved
                                </span>
                            </div>
                            
                            <Link to="/collections" className="group flex items-center gap-3 text-attire-silver/50 hover:text-white transition-all text-[10px] uppercase tracking-[0.3em] font-bold">
                                <ChevronLeft size={14} className="group-hover:-translate-x-1 transition-transform" />
                                Continue Exploring
                            </Link>
                        </div>
                    </motion.div>
                </div>
            </header>

            {/* Main Content */}
            <main className="relative z-10 flex-grow max-w-7xl mx-auto w-full px-6 pb-32">
                {favoriteProducts.length > 0 ? (
                    <motion.div
                        className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-x-8 gap-y-16"
                        variants={containerVariants}
                        initial="hidden"
                        animate="visible"
                    >
                        {favoriteProducts.map((item, index) => (
                            <motion.div 
                                key={item.id} 
                                variants={itemVariants}
                                className="group relative"
                            >
                                <div className="relative overflow-hidden rounded-sm shadow-2xl transition-transform duration-500 group-hover:-translate-y-2">
                                    <ItemCard 
                                        product={item} 
                                    />
                                    
                                    {/* Glass Remove Button Overlay */}
                                    <button 
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            removeFavorite(item.id);
                                        }}
                                        className="absolute top-4 right-4 z-20 w-10 h-10 flex items-center justify-center bg-black/40 backdrop-blur-md border border-white/10 text-white rounded-full opacity-0 translate-y-2 group-hover:opacity-100 group-hover:translate-y-0 transition-all duration-300 hover:bg-red-500 hover:border-red-500"
                                        title="Remove from favorites"
                                    >
                                        <Heart size={16} fill="currentColor" />
                                    </button>
                                </div>
                            </motion.div>
                        ))}
                    </motion.div>
                ) : (
                    <motion.div 
                        initial={{ opacity: 0 }} 
                        animate={{ opacity: 1 }} 
                        className="flex flex-col items-center justify-center py-32 text-center"
                    >
                        <div className="relative mb-12">
                            <div className="absolute inset-0 bg-attire-accent/20 blur-[60px] rounded-full animate-pulse-soft" />
                            <div className="relative w-32 h-32 bg-white/5 backdrop-blur-sm rounded-full flex items-center justify-center border border-white/10 shadow-2xl">
                                <Heart size={48} className="text-white/20" strokeWidth={1} />
                            </div>
                        </div>
                        
                        <h2 className="font-serif text-4xl md:text-5xl text-white mb-6">Your gallery is <span className="italic text-attire-silver">empty</span></h2>
                        <p className="text-attire-silver/50 text-lg font-light max-w-md mx-auto mb-12 leading-relaxed">
                            Discover our latest collections and start curating your perfect wardrobe today.
                        </p>
                        
                        <Link to="/collections" className="group relative flex flex-col items-center gap-4">
                            <div className="w-16 h-16 rounded-full border border-white/20 flex items-center justify-center group-hover:bg-white group-hover:border-white transition-all duration-500 shadow-xl shadow-white/5">
                                <ArrowRight className="text-white group-hover:text-black transition-colors duration-300" size={24} />
                            </div>
                            <span className="text-[10px] tracking-[0.4em] text-white/50 uppercase font-bold group-hover:text-white transition-colors">Start Curating</span>
                        </Link>
                    </motion.div>
                )}
            </main>
        </div>
    );
};

export default FavoritesPage;
