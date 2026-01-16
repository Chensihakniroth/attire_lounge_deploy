import React, { useState, useMemo } from 'react';
import { useParams, useLocation, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ChevronLeft, Search, ChevronsUpDown } from 'lucide-react';
import { products as allProducts, collections } from '../../data/products.js';
import ItemCard from './collections/ItemCard';

const ProductListPage = () => {
    const { collectionSlug } = useParams();
    const location = useLocation();
    const [searchTerm, setSearchTerm] = useState('');
    const [sortOrder, setSortOrder] = useState('name-asc');

    const { currentCollection, filteredProducts } = useMemo(() => {
        const currentCollection = collections.find(c => c.slug === collectionSlug);
        
        let products;
        if (collectionSlug && currentCollection) {
            products = allProducts.filter(p => p.collectionSlug === collectionSlug);
        } else {
            products = allProducts;
        }

        // Filter by search term
        if (searchTerm) {
            products = products.filter(p => p.name.toLowerCase().includes(searchTerm.toLowerCase()));
        }

        // Sort products
        const [sortKey, sortDirection] = sortOrder.split('-');
        products.sort((a, b) => {
            if (a[sortKey] < b[sortKey]) return sortDirection === 'asc' ? -1 : 1;
            if (a[sortKey] > b[sortKey]) return sortDirection === 'asc' ? 1 : -1;
            return 0;
        });

        return { currentCollection, filteredProducts: products };
    }, [collectionSlug, searchTerm, sortOrder]);

    const pageTitle = collectionSlug && currentCollection ? currentCollection.title : "All Products";

    const containerVariants = {
        hidden: { opacity: 0 },
        visible: {
            opacity: 1,
            transition: {
                staggerChildren: 0.05
            }
        }
    };
    
    return (
        <div className="min-h-screen bg-white">
            <div className="text-center py-16 sm:py-24 bg-gray-50">
                <motion.h1
                    className="text-4xl sm:text-5xl md:text-6xl font-serif font-light text-gray-800 mb-4"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8, ease: "easeOut" }}
                >
                    {pageTitle}
                </motion.h1>
                <Link to="/collections" className="flex items-center justify-center gap-2 text-sm text-gray-500 hover:text-black transition-colors">
                    <ChevronLeft size={16} />
                    Back to Collections
                </Link>
            </div>

            <main className="max-w-screen-xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
                {/* Search and Sort Controls */}
                <div className="flex flex-col md:flex-row justify-between items-center mb-12 gap-4">
                    <div className="relative w-full md:max-w-xs">
                        <input
                            type="text"
                            placeholder="Search products..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-full focus:ring-2 focus:ring-black focus:border-transparent transition"
                        />
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                    </div>
                    <div className="relative">
                         <select
                            value={sortOrder}
                            onChange={(e) => setSortOrder(e.target.value)}
                            className="appearance-none w-full md:w-auto bg-white border border-gray-300 rounded-full pl-4 pr-10 py-2 focus:ring-2 focus:ring-black focus:border-transparent transition"
                        >
                            <option value="name-asc">Sort by Name (A-Z)</option>
                            <option value="name-desc">Sort by Name (Z-A)</option>
                            <option value="price-asc">Sort by Price (Low-High)</option>
                            <option value="price-desc">Sort by Price (High-Low)</option>
                        </select>
                        <ChevronsUpDown className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" size={20} />
                    </div>
                </div>

                <motion.div
                    className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-x-6 gap-y-12"
                    variants={containerVariants}
                    initial="hidden"
                    animate="visible"
                >
                    {filteredProducts.map(item => (
                        <ItemCard key={item.id} product={item} />
                    ))}
                </motion.div>

                {filteredProducts.length === 0 && (
                    <div className="text-center py-20">
                        <p className="text-xl text-gray-500">No products found.</p>
                    </div>
                )}
            </main>
        </div>
    );
};

export default ProductListPage;