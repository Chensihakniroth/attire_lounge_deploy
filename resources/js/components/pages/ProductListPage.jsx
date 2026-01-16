import React, { useState, useMemo, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronLeft, Search, ChevronsUpDown, X, Filter } from 'lucide-react';
import { products as allProducts, collections as allCollections } from '../../data/products.js';
import ItemCard from './collections/ItemCard';
import useDebounce from '../../hooks/useDebounce.js';

const ProductListPage = () => {
    const { collectionSlug } = useParams();

    // Base products for the page
    const baseProducts = useMemo(() => {
        if (collectionSlug) {
            const currentCollection = allCollections.find(c => c.slug === collectionSlug);
            return currentCollection ? allProducts.filter(p => p.collectionSlug === collectionSlug) : [];
        }
        return allProducts;
    }, [collectionSlug]);

    const [searchTerm, setSearchTerm] = useState('');
    const [sortOrder, setSortOrder] = useState('name-asc');
    const [priceRange, setPriceRange] = useState([0, 1000]);
    const [selectedCollections, setSelectedCollections] = useState([]);
    const [isFilterOpen, setIsFilterOpen] = useState(false);

    const debouncedSearchTerm = useDebounce(searchTerm, 300);

    const { pageTitle, filteredProducts } = useMemo(() => {
        const currentCollectionDetails = allCollections.find(c => c.slug === collectionSlug);
        const pageTitle = currentCollectionDetails ? currentCollectionDetails.title : "All Products";
        
        let products = [...baseProducts];

        // Filter by search term
        if (debouncedSearchTerm) {
            products = products.filter(p => p.name.toLowerCase().includes(debouncedSearchTerm.toLowerCase()));
        }

        // Filter by price range
        products = products.filter(p => p.price >= priceRange[0] && p.price <= priceRange[1]);

        // Filter by selected collections (only if viewing all products)
        if (!collectionSlug && selectedCollections.length > 0) {
            products = products.filter(p => selectedCollections.includes(p.collectionSlug));
        }

        // Sort products
        const [sortKey, sortDirection] = sortOrder.split('-');
        products.sort((a, b) => {
            if (sortKey === 'price') {
                return sortDirection === 'asc' ? a.price - b.price : b.price - a.price;
            }
            // Default to name sort
            if (a.name < b.name) return sortDirection === 'asc' ? -1 : 1;
            if (a.name > b.name) return sortDirection === 'asc' ? 1 : -1;
            return 0;
        });

        return { pageTitle, filteredProducts: products };
    }, [baseProducts, debouncedSearchTerm, sortOrder, priceRange, selectedCollections, collectionSlug]);


    const containerVariants = {
        hidden: { opacity: 0 },
        visible: {
            opacity: 1,
            transition: {
                staggerChildren: 0.05
            }
        }
    };

    const handleCollectionToggle = (slug) => {
        setSelectedCollections(prev => 
            prev.includes(slug) ? prev.filter(s => s !== slug) : [...prev, slug]
        );
    };

    const clearFilters = () => {
        setSearchTerm('');
        setPriceRange([0, 1000]);
        setSelectedCollections([]);
    };

    const FilterSidebar = ({ isOpen, onClose, initialPrice, setParentPriceRange }) => {
        const [internalPrice, setInternalPrice] = useState(initialPrice[1]);
        const debouncedPrice = useDebounce(internalPrice, 500);

        useEffect(() => {
            setParentPriceRange([0, debouncedPrice]);
        }, [debouncedPrice, setParentPriceRange]);

        return (
            <AnimatePresence>
                {isOpen && (
                    <>
                        {/* Overlay */}
                        <motion.div
                            className="fixed inset-0 bg-black/50 z-40 lg:hidden"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            onClick={onClose}
                        />
                        <motion.div
                            className="fixed top-0 right-0 w-80 h-full bg-white shadow-lg z-50 p-6 flex flex-col"
                            initial={{ x: '100%' }}
                            animate={{ x: 0 }}
                            exit={{ x: '100%' }}
                            transition={{ type: 'spring', stiffness: 300, damping: 30 }}
                        >
                            <div className="flex justify-between items-center mb-6">
                                <h3 className="text-xl font-semibold">Filters</h3>
                                <button onClick={onClose} className="text-gray-500 hover:text-black">
                                    <X size={24} />
                                </button>
                            </div>
                            
                            <div className="flex-grow overflow-y-auto">
                                {/* Price Range */}
                                <div className="mb-6">
                                    <h4 className="font-medium mb-2">Price</h4>
                                    <input
                                        type="range"
                                        min="0"
                                        max="1000"
                                        value={internalPrice}
                                        onChange={(e) => setInternalPrice(Number(e.target.value))}
                                        className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                                    />
                                    <div className="flex justify-between text-sm text-gray-600 mt-2">
                                        <span>$0</span>
                                        <span>${internalPrice}</span>
                                    </div>
                                </div>

                                {/* Collections Filter */}
                                {!collectionSlug && (
                                    <div className="mb-6">
                                        <h4 className="font-medium mb-2">Collections</h4>
                                        <div className="space-y-2">
                                            {allCollections.map(collection => (
                                                <label key={collection.id} className="flex items-center">
                                                    <input
                                                        type="checkbox"
                                                        checked={selectedCollections.includes(collection.slug)}
                                                        onChange={() => handleCollectionToggle(collection.slug)}
                                                        className="h-4 w-4 rounded border-gray-300 text-black focus:ring-black"
                                                    />
                                                    <span className="ml-2 text-sm text-gray-700">{collection.title}</span>
                                                </label>
                                            ))}
                                        </div>
                                    </div>
                                )}
                            </div>

                            <button
                                onClick={clearFilters}
                                className="w-full mt-4 py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-black hover:bg-gray-800"
                            >
                                Clear All Filters
                            </button>
                        </motion.div>
                    </>
                )}
            </AnimatePresence>
        );
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
                <div className="flex flex-col lg:flex-row lg:items-center justify-between mb-12 gap-6">
                    {/* Left: Search + Mobile Filter */}
                    <div className="flex items-center gap-4 w-full lg:w-1/3">
                        <div className="relative flex-grow">
                            <input
                                type="text"
                                placeholder="Search products..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="w-full pl-10 pr-10 py-2 border border-gray-300 rounded-full text-black placeholder-gray-500 focus:ring-2 focus:ring-black focus:border-transparent transition"
                            />
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                            {searchTerm && (
                                <button
                                    onClick={() => setSearchTerm('')}
                                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-black"
                                >
                                    <X size={20} />
                                </button>
                            )}
                        </div>
                        <button
                            onClick={() => setIsFilterOpen(true)}
                            className="p-2 border border-gray-300 rounded-full text-gray-600 hover:text-black hover:border-black transition lg:hidden"
                        >
                            <Filter size={20} />
                        </button>
                    </div>

                    {/* Middle: Desktop Price Slider */}
                    <div className="hidden lg:flex items-center gap-4 w-full lg:w-1/3">
                        <span className="text-sm font-medium text-gray-700">Price</span>
                        <input
                            type="range"
                            min="0"
                            max="1000"
                            value={priceRange[1]}
                            onChange={(e) => setPriceRange([0, Number(e.target.value)])}
                            className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                        />
                        <span className="text-sm font-medium text-gray-700 w-20 text-right">${priceRange[1]}</span>
                    </div>

                    {/* Right: Sort Dropdown */}
                    <div className="relative w-full lg:w-auto">
                        <div className="relative border border-gray-300 rounded-full">
                            <select
                                value={sortOrder}
                                onChange={(e) => setSortOrder(e.target.value)}
                                className="appearance-none w-full lg:w-auto bg-transparent rounded-full pl-5 pr-10 py-2 text-black focus:outline-none focus:ring-2 focus:ring-black"
                            >
                                <option value="name-asc">Sort by Name (A-Z)</option>
                                <option value="name-desc">Sort by Name (Z-A)</option>
                                <option value="price-asc">Sort by Price (Low-High)</option>
                                <option value="price-desc">Sort by Price (High-Low)</option>
                            </select>
                            <ChevronsUpDown className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" size={20} />
                        </div>
                    </div>
                </div>

                {/* Main Content */}
                <div className="flex">
                    {/* Products Grid */}
                    <div className="flex-1">
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
                            <div className="text-center py-20 w-full">
                                <p className="text-xl text-gray-500">No products match your criteria.</p>
                            </div>
                        )}
                    </div>
                </div>
            </main>
            <FilterSidebar 
                isOpen={isFilterOpen} 
                onClose={() => setIsFilterOpen(false)}
                initialPrice={priceRange}
                setParentPriceRange={setPriceRange}
            />
        </div>
    );
};

export default ProductListPage;