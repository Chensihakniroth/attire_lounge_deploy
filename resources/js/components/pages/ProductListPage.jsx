import React, { useState, useMemo, useEffect, useRef } from 'react';
import { useParams, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronLeft, Search, ChevronsUpDown, X, Filter, ChevronDown } from 'lucide-react';
import { products as allProducts, collections as allCollections } from '../../data/products.js';
import ItemCard from './collections/ItemCard';
import useDebounce from '../../hooks/useDebounce.js';

const mainSortOptions = [
    { value: 'popularity-desc', label: 'Most Popular' },
    { value: 'createdAt-desc', label: 'Newest' },
    { value: 'createdAt-asc', label: 'Oldest' },
];

const sortOptions = [
    { value: 'price-asc', label: 'Price: Low to High' },
    { value: 'price-desc', label: 'Price: High to Low' },
    { value: 'name-asc', label: 'Name: A to Z' },
    { value: 'name-desc', label: 'Name: Z to A' },
];

const ProductListPage = () => {
    const { collectionSlug } = useParams();

    const baseProducts = useMemo(() => {
        if (collectionSlug) {
            const currentCollection = allCollections.find(c => c.slug === collectionSlug);
            return currentCollection ? allProducts.filter(p => p.collectionSlug === collectionSlug) : [];
        }
        return allProducts;
    }, [collectionSlug]);

    const [sortOrder, setSortOrder] = useState('popularity-desc');
    const [priceRange, setPriceRange] = useState([0, 1000]);
    const [selectedCollections, setSelectedCollections] = useState([]);

    const debouncedPriceRange = useDebounce(priceRange, 500);

    const { pageTitle, filteredProducts } = useMemo(() => {
        const currentCollectionDetails = allCollections.find(c => c.slug === collectionSlug);
        const pageTitle = currentCollectionDetails ? currentCollectionDetails.title : "All Products";

        let products = [...baseProducts];

        products = products.filter(p => p.price >= debouncedPriceRange[0] && p.price <= debouncedPriceRange[1]);

        if (!collectionSlug && selectedCollections.length > 0) {
            products = products.filter(p => selectedCollections.includes(p.collectionSlug));
        }

        const [sortKey, sortDirection] = sortOrder.split('-');
        products.sort((a, b) => {
            if (sortKey === 'price') {
                return sortDirection === 'asc' ? a.price - b.price : b.price - a.price;
            }
            if (sortKey === 'createdAt') {
                return sortDirection === 'asc' ? new Date(a.createdAt) - new Date(b.createdAt) : new Date(b.createdAt) - new Date(a.createdAt);
            }
            if (sortKey === 'popularity') {
                return sortDirection === 'asc' ? a.popularity - b.popularity : b.popularity - a.popularity;
            }
            if (a.name < b.name) return sortDirection === 'asc' ? -1 : 1;
            if (a.name > b.name) return sortDirection === 'asc' ? 1 : -1;
            return 0;
        });

        return { pageTitle, filteredProducts: products };
    }, [baseProducts, sortOrder, debouncedPriceRange, selectedCollections, collectionSlug]);

    const containerVariants = {
        hidden: { opacity: 0 },
        visible: { opacity: 1, transition: { staggerChildren: 0.05 } }
    };

    const handleCollectionToggle = (slug) => {
        setSelectedCollections(prev => prev.includes(slug) ? prev.filter(s => s !== slug) : [...prev, slug]);
    };

    const clearFilters = () => {
        setPriceRange([0, 1000]);
        setSelectedCollections([]);
    };

    const removeCollectionFilter = (slug) => {
        setSelectedCollections(prev => prev.filter(s => s !== slug));
    };
    
    const isDefaultPrice = priceRange[0] === 0 && priceRange[1] === 1000;

    return (
        <div className="min-h-screen bg-gray-50">
            <header className="text-center py-16 sm:py-24 bg-attire-navy border-b border-gray-200">
                <motion.h1
                    className="text-4xl sm:text-5xl md:text-6xl font-serif font-light text-white mb-4"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8, ease: "easeOut" }}
                >
                    {pageTitle}
                </motion.h1>
                <Link to="/collections" className="flex items-center justify-center gap-2 text-sm text-white hover:text-black transition-colors">
                    <ChevronLeft size={16} />
                    Back to Collections
                </Link>
            </header>

            <main className="max-w-screen-xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
                <Controls
                    sortOrder={sortOrder}
                    setSortOrder={setSortOrder}
                    priceRange={priceRange}
                    setPriceRange={setPriceRange}
                    selectedCollections={selectedCollections}
                    handleCollectionToggle={handleCollectionToggle}
                    collectionSlug={collectionSlug}
                    clearFilters={clearFilters}
                />

                <ActiveFilters
                    priceRange={priceRange}
                    isDefaultPrice={isDefaultPrice}
                    clearPrice={() => setPriceRange([0, 1000])}
                    selectedCollections={selectedCollections}
                    removeCollectionFilter={removeCollectionFilter}
                    clearAllFilters={clearFilters}
                />
                
                <AnimatePresence mode="wait">
                    <motion.div
                        key={filteredProducts.map(p => p.id).join('-')}
                        className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-x-6 gap-y-12 mt-8"
                        variants={containerVariants}
                        initial="hidden"
                        animate="visible"
                    >
                        {filteredProducts.map(item => (
                            <ItemCard key={item.id} product={item} />
                        ))}
                    </motion.div>
                </AnimatePresence>

                {filteredProducts.length === 0 && (
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center py-20 w-full">
                        <p className="text-2xl font-serif text-gray-600">No products found.</p>
                        <p className="text-gray-500 mt-2">Try adjusting your filters or search term.</p>
                    </motion.div>
                )}
            </main>


        </div>
    );
};

const Controls = ({ 
    sortOrder, 
    setSortOrder, 
    priceRange, 
    setPriceRange, 
    selectedCollections, 
    handleCollectionToggle, 
    collectionSlug, 
    clearFilters 
}) => (
    <div className="flex flex-col md:flex-row items-center justify-between gap-4 mb-6 p-4 bg-white rounded-lg shadow-sm border border-gray-200">
        <div className="flex items-center gap-2">
            {mainSortOptions.map(option => (
                <button
                    key={option.value}
                    onClick={() => setSortOrder(option.value)}
                    className={`px-4 py-2 text-sm font-medium rounded-full ${
                        sortOrder === option.value 
                            ? 'bg-attire-navy text-white' 
                            : 'bg-gray-200 text-gray-800'
                    }`}
                >
                    {option.label}
                </button>
            ))}
        </div>
        <div className="flex items-center gap-4">
            <span className="text-sm font-medium text-gray-600 hidden lg:block">Sort & Filter:</span>
            <FilterSortDropdown 
                sortOrder={sortOrder} 
                setSortOrder={setSortOrder} 
                priceRange={priceRange}
                setPriceRange={setPriceRange}
                selectedCollections={selectedCollections}
                handleCollectionToggle={handleCollectionToggle}
                collectionSlug={collectionSlug}
                clearFilters={clearFilters}
            />
        </div>
    </div>
);

const ActiveFilters = ({ priceRange, isDefaultPrice, clearPrice, selectedCollections, removeCollectionFilter, clearAllFilters }) => {
    const showFilters = !isDefaultPrice || selectedCollections.length > 0;
    if (!showFilters) return null;

    return (
        <div className="flex items-center flex-wrap gap-2 mb-8">
            <span className="text-sm font-medium">Active Filters:</span>
            {!isDefaultPrice && (
                <FilterTag onRemove={clearPrice}>
                    Price: ${priceRange[0]} - ${priceRange[1]}
                </FilterTag>
            )}
            {selectedCollections.map(slug => {
                const collection = allCollections.find(c => c.slug === slug);
                return (
                    <FilterTag key={slug} onRemove={() => removeCollectionFilter(slug)}>
                        {collection?.title || slug}
                    </FilterTag>
                );
            })}
            <button
                onClick={clearAllFilters}
                className="text-sm font-semibold text-black hover:underline"
            >
                Clear All
            </button>
        </div>
    );
};

const FilterTag = ({ children, onRemove }) => (
    <motion.div
        layout
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.8 }}
        className="flex items-center gap-1 bg-black text-white rounded-full pl-3 pr-2 py-1 text-sm"
    >
        <span>{children}</span>
        <button onClick={onRemove} className="text-white/80 hover:text-white">
            <X size={16} />
        </button>
    </motion.div>
);

const FilterSortDropdown = ({ 
    sortOrder, 
    setSortOrder, 
    priceRange, 
    setPriceRange, 
    selectedCollections, 
    handleCollectionToggle, 
    collectionSlug, 
    clearFilters 
}) => {
    const [isOpen, setIsOpen] = useState(false);
    const [internalPrice, setInternalPrice] = useState(priceRange[1]);
    const debouncedPrice = useDebounce(internalPrice, 300);

    useEffect(() => {
        setPriceRange([0, debouncedPrice]);
    }, [debouncedPrice, setPriceRange]);

    useEffect(() => {
        if (isOpen) {
            setInternalPrice(priceRange[1]);
        }
    }, [isOpen, priceRange]);

    const dropdownRef = useRef(null);
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setIsOpen(false);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    const allSortOptions = [...mainSortOptions, ...sortOptions];
    const selectedLabel = allSortOptions.find(opt => opt.value === sortOrder)?.label || 'Sort & Filter';

    return (
        <div ref={dropdownRef} className="relative w-64 z-10">
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="flex items-center justify-between w-full px-4 py-2 bg-white border border-gray-300 rounded-full text-sm font-medium text-attire-navy hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-black"
            >
                <span>{selectedLabel}</span>
                <motion.div animate={{ rotate: isOpen ? 180 : 0 }}>
                    <ChevronDown size={16} />
                </motion.div>
            </button>
            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        className="absolute right-0 mt-2 w-full bg-white border border-gray-200 rounded-md shadow-lg overflow-hidden p-4"
                    >
                        <div className="mb-4">
                            <h4 className="font-semibold text-lg mb-2 bg-attire-navy text-white">Sort by</h4>
                            {sortOptions.map(option => (
                                <div
                                    key={option.value}
                                    onClick={() => {
                                        setSortOrder(option.value);
                                    }}
                                    className={`px-2 py-1 text-sm cursor-pointer rounded-md hover:bg-gray-100 ${sortOrder === option.value ? 'font-bold bg-gray-100' : 'font-medium'}`}
                                >
                                    <span className="text-white">{option.label}</span>
                                </div>
                            ))}
                        </div>
                        <div className="mb-4">
                            <h4 className="font-semibold text-lg mb-2 bg-attire-navy text-white">Price</h4>
                            <input
                                type="range"
                                min="0"
                                max="1000"
                                value={internalPrice}
                                onChange={(e) => setInternalPrice(Number(e.target.value))}
                                className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-black"
                            />
                            <div className="flex justify-between text-md text-white mt-2">
                                <span>$0</span>
                                <span>${internalPrice}</span>
                            </div>
                        </div>

                        {!collectionSlug && (
                            <div className="mb-4">
                                <h4 className="font-semibold text-lg mb-2 bg-attire-navy text-white">Collections</h4>
                                <div className="space-y-2">
                                    {allCollections.map(collection => (
                                        <label key={collection.id} className="flex items-center text-md">
                                            <input
                                                type="checkbox"
                                                checked={selectedCollections.includes(collection.slug)}
                                                onChange={() => handleCollectionToggle(collection.slug)}
                                                className="h-5 w-5 rounded border-gray-400 text-black focus:ring-black"
                                            />
                                            <span className="ml-3 text-white">{collection.title}</span>
                                        </label>
                                    ))}
                                </div>
                            </div>
                        )}

                        <button
                            onClick={() => {
                                clearFilters();
                                setIsOpen(false);
                            }}
                            className="w-full mt-4 py-2 px-4 border border-transparent rounded-md shadow-sm text-md font-medium text-white bg-black hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-black"
                        >
                            Clear All Filters
                        </button>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};



export default ProductListPage;