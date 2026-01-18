import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useFavorites } from '../../context/FavoritesContext.jsx';
import { products as allProducts } from '../../data/products.js';
import ItemCard from './collections/ItemCard.jsx';
import { ChevronLeft } from 'lucide-react';

const FavoritesPage = () => {
    const { favorites } = useFavorites();
    const favoriteProducts = allProducts.filter(p => favorites.includes(p.id));

    const containerVariants = {
        hidden: { opacity: 0 },
        visible: { opacity: 1, transition: { staggerChildren: 0.05 } }
    };

    return (
        <div className="min-h-screen bg-attire-navy">
            <header className="text-center py-16 sm:py-24 border-b border-attire-silver/10">
                <motion.h1
                    className="text-4xl sm:text-5xl md:text-6xl font-serif font-light text-white mb-4"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8, ease: "easeOut" }}
                >
                    Your Favorites
                </motion.h1>
                <Link to="/collections" className="flex items-center justify-center gap-2 text-sm text-white hover:text-attire-accent transition-colors">
                    <ChevronLeft size={16} />
                    Back to Collections
                </Link>
            </header>

            <main className="max-w-screen-xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
                {favoriteProducts.length > 0 ? (
                    <motion.div
                        className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-x-6 gap-y-12 mt-8"
                        variants={containerVariants}
                        initial="hidden"
                        animate="visible"
                    >
                        {favoriteProducts.map(item => (
                            <ItemCard key={item.id} product={item} />
                        ))}
                    </motion.div>
                ) : (
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center py-20 w-full">
                        <p className="text-2xl font-serif text-attire-cream">No favorites yet.</p>
                        <p className="text-attire-cream mt-2">Browse our collections and add some products to your favorites.</p>
                        <Link to="/collections" className="mt-6 inline-block bg-attire-accent text-attire-dark font-semibold px-8 py-3 rounded-lg hover:opacity-90 transition-opacity">
                            Browse Collections
                        </Link>
                    </motion.div>
                )}
            </main>
        </div>
    );
};

export default FavoritesPage;
