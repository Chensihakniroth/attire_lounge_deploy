import React, { useState, useMemo, useEffect, useRef } from 'react';
import { useParams, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronLeft, Search, ChevronsUpDown, X, Filter, ChevronDown } from 'lucide-react';
import { products as allProducts, collections as allCollections } from '../../data/products.js';
import ItemCard from './collections/ItemCard';
import useDebounce from '../../hooks/useDebounce.js';

const sortOptions = [
    { value: 'popularity-desc', label: 'Most Popular' },
    { value: 'createdAt-desc', label: 'Newest' },
    { value: 'createdAt-asc', label: 'Oldest' },
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

        if (selectedCollections.length > 0) {
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
            if (sortKey === 'name') {
                if (a.name < b.name) return sortDirection === 'asc' ? -1 : 1;
                if (a.name > b.name) return sortDirection === 'asc' ? 1 : -1;
            }
            return 0;
        });

        return { pageTitle, filteredProducts: products };
    }, [baseProducts, sortOrder, selectedCollections, collectionSlug]);

    const containerVariants = {
        hidden: { opacity: 0 },
        visible: { opacity: 1, transition: { staggerChildren: 0.05 } }
    };

    const handleCollectionToggle = (slug) => {
        setSelectedCollections(prev => prev.includes(slug) ? prev.filter(s => s !== slug) : [...prev, slug]);
    };

    const clearFilters = () => {
        setSelectedCollections([]);
    };

    const removeCollectionFilter = (slug) => {
        setSelectedCollections(prev => prev.filter(s => s !== slug));
    };
    
    const isDefaultPrice = true; // Price filter removed

    return (
        <div className="min-h-screen bg-attire-navy">
            <header className="text-center py-16 sm:py-24">
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
                    selectedCollections={selectedCollections}
                    handleCollectionToggle={handleCollectionToggle}
                    collectionSlug={collectionSlug}
                    clearFilters={clearFilters}
                    removeCollectionFilter={removeCollectionFilter}
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
                        <p className="text-2xl font-serif text-attire-cream">No products found.</p>
                        <p className="text-attire-cream mt-2">Try adjusting your filters or search term.</p>
                    </motion.div>
                )}
            </main>


        </div>
    );
};

const Controls = ({ 
    sortOrder, 
    setSortOrder, 
    selectedCollections, 
    handleCollectionToggle, 
    collectionSlug, 
    clearFilters,
    removeCollectionFilter
}) => (
    <div className="flex flex-col gap-4 mb-6 p-4 bg-black/10 rounded-lg shadow-sm border border-attire-silver/10">
        <div className="flex flex-col md:flex-row items-center justify-between gap-4 w-full">
            <div className="flex items-center gap-2 flex-wrap">
                <span className="text-sm font-medium text-attire-silver">Collections:</span>
                {allCollections.map(collection => (
                    <button
                        key={collection.id}
                        onClick={() => handleCollectionToggle(collection.slug)}
                        className={`px-3 py-1 text-sm rounded-full transition-colors ${
                            selectedCollections.includes(collection.slug)
                                ? 'bg-attire-accent text-attire-dark font-semibold'
                                : 'bg-attire-charcoal text-attire-silver hover:bg-attire-navy'
                        }`}
                    >
                        {collection.title}
                    </button>
                ))}
            </div>
            <div className="flex items-center gap-4">
                <span className="text-sm font-medium text-attire-silver hidden lg:block">Sort by:</span>
                <FilterSortDropdown 
                    sortOrder={sortOrder} 
                    setSortOrder={setSortOrder} 
                    clearFilters={clearFilters}
                />
            </div>
        </div>
        
        {selectedCollections.length > 0 && (
            <div className="flex items-center flex-wrap gap-2 pt-4 border-t border-attire-silver/10">
                <span className="text-sm font-medium text-attire-silver">Active Filters:</span>
                {selectedCollections.map(slug => {
                    const collection = allCollections.find(c => c.slug === slug);
                    return (
                        <FilterTag key={slug} onRemove={() => removeCollectionFilter(slug)}>
                            {collection?.title || slug}
                        </FilterTag>
                    );
                })}
                <button
                    onClick={clearFilters}
                    className="text-sm font-semibold text-attire-accent hover:underline ml-auto"
                >
                    Clear All
                </button>
            </div>
        )}
    </div>
);

const FilterTag = ({ children, onRemove }) => (
    <motion.div
        layout
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.8 }}
        className="flex items-center gap-2 bg-attire-accent text-attire-dark rounded-full pl-3 pr-2 py-1 text-sm font-medium"
    >
        <span>{children}</span>
        <button onClick={onRemove} className="text-attire-dark/80 hover:text-attire-dark">
            <X size={16} />
        </button>
    </motion.div>
);

const FilterSortDropdown = ({
    sortOrder, 
    setSortOrder, 
    clearFilters 
}) => {
    const [isOpen, setIsOpen] = useState(false);

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

    const allSortOptions = [...sortOptions];
    const selectedLabel = allSortOptions.find(opt => opt.value === sortOrder)?.label || 'Sort & Filter';

    return (
        <div ref={dropdownRef} className="relative w-64 z-20">
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="flex items-center justify-between w-full px-4 py-2 bg-attire-charcoal border border-attire-silver/20 rounded-full text-sm font-medium text-white hover:bg-attire-navy focus:outline-none focus:ring-2 focus:ring-attire-accent"
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
                        className="absolute right-0 mt-2 w-full bg-attire-charcoal border border-attire-silver/10 rounded-md shadow-lg overflow-hidden p-4"
                    >
                        <div className="mb-4">
                            <h4 className="font-semibold text-lg mb-2 text-white">Sort by</h4>
                            {sortOptions.map(option => (
                                <div
                                    key={option.value}
                                    onClick={() => {
                                        setSortOrder(option.value);
                                        setIsOpen(false);
                                    }}
                                    className={`px-2 py-1 text-sm cursor-pointer rounded-md hover:bg-attire-navy ${sortOrder === option.value ? 'font-bold bg-attire-navy text-white' : 'font-medium text-attire-silver'}`}
                                >
                                    <span>{option.label}</span>
                                </div>
                            ))}
                        </div>

                        <button
                            onClick={() => {
                                clearFilters();
                                setIsOpen(false);
                            }}
                            className="w-full mt-4 py-2 px-4 border border-transparent rounded-md shadow-sm text-md font-medium text-attire-dark bg-attire-accent hover:bg-opacity-90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-attire-accent"
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