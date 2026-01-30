import React, { useState, useMemo, useEffect, useRef } from 'react';
import { useLocation, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { wrap } from "popmotion";
import Lightbox from './lookbook/Lightbox';
import { ChevronLeft, ChevronRight, Search, ChevronsUpDown, X, Filter, ChevronDown, Check } from 'lucide-react';
import { products as allProducts, collections as allCollections } from '../../data/products.js';
import ItemCard from './collections/ItemCard';
import { useFavorites } from '../../context/FavoritesContext.jsx';
import useDebounce from '../../hooks/useDebounce.js';

const sortOptions = [
    { value: 'popularity-desc', label: 'Most Popular' },
    { value: 'createdAt-desc', label: 'Newest Arrivals' },
    { value: 'price-asc', label: 'Price: Low to High' },
    { value: 'price-desc', label: 'Price: High to Low' },
    { value: 'name-asc', label: 'Name: A to Z' },
];

const useQuery = () => {
    return new URLSearchParams(useLocation().search);
};

const ProductListPage = () => {
    const query = useQuery();
    const location = useLocation();
    const collectionQuery = query.get('collection');

    const [sortOrder, setSortOrder] = useState('popularity-desc');
    const [priceRange, setPriceRange] = useState([0, 1000]);
    const [[page, direction], setPage] = useState([null, 0]);
    const { favorites, addFavorite, removeFavorite, isFavorited } = useFavorites();
    
    const [selectedCollections, setSelectedCollections] = useState(() => {
        return collectionQuery ? [collectionQuery] : [];
    });

    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 16;

    useEffect(() => {
        setCurrentPage(1);
    }, [selectedCollections, sortOrder]);

    const { pageTitle, filteredProducts } = useMemo(() => {
        let products = [...allProducts];

        if (selectedCollections.length > 0) {
            products = products.filter(p => selectedCollections.includes(p.collectionSlug));
        }

        const currentCollectionDetails = allCollections.find(c => c.slug === selectedCollections[0]);
        const pageTitle = selectedCollections.length === 1 && currentCollectionDetails
            ? currentCollectionDetails.title
            : "All Products";

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
    }, [sortOrder, selectedCollections]);

    const imageIndex = page !== null ? wrap(0, filteredProducts.length, page) : null;
    const selectedImage = page !== null ? filteredProducts[imageIndex] : null;

    const openLightbox = (index) => setPage([index, 0]);
    const closeLightbox = () => setPage([null, 0]);
    const paginate = (newDirection) => {
        if (page === null || !filteredProducts.length) return;
        setPage([page + newDirection, newDirection]);
    };

    const toggleFavorite = (id) => {
        if (isFavorited(id)) {
            removeFavorite(id);
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
    
    useEffect(() => {
        const newCollectionQuery = new URLSearchParams(location.search).get('collection');
        if (newCollectionQuery && !selectedCollections.includes(newCollectionQuery)) {
            setSelectedCollections([newCollectionQuery]);
        }
    }, [location.search]);

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
    
    const totalPages = Math.ceil(filteredProducts.length / itemsPerPage);
    const paginatedProducts = filteredProducts.slice(
        (currentPage - 1) * itemsPerPage,
        currentPage * itemsPerPage
    );

    const handlePageChange = (newPage) => {
        if (newPage >= 1 && newPage <= totalPages) {
            setCurrentPage(newPage);
            window.scrollTo({ top: 0, behavior: 'smooth' });
        }
    };

    return (
        <div className="min-h-screen bg-attire-navy relative">
            {/* Background Decorations */}
            <div className="fixed top-0 left-0 w-full h-screen overflow-hidden pointer-events-none z-0">
                <div className="absolute top-[-10%] right-[-5%] w-[600px] h-[600px] bg-attire-accent/5 rounded-full blur-[120px]" />
                <div className="absolute bottom-[-10%] left-[-10%] w-[500px] h-[500px] bg-blue-900/10 rounded-full blur-[100px]" />
            </div>

            <header className="relative z-10 pt-28 pb-12 px-6 text-center">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8, ease: "easeOut" }}
                >
                    <h1 className="text-5xl md:text-7xl font-serif font-light text-white mb-6">
                        {pageTitle}
                    </h1>
                    <div className="flex items-center justify-center gap-2">
                        <Link to="/collections" className="group flex items-center gap-2 text-sm text-attire-silver hover:text-white transition-colors">
                            <ChevronLeft size={16} className="group-hover:-translate-x-1 transition-transform" />
                            Back to Collections
                        </Link>
                    </div>
                </motion.div>
            </header>

            <main className="relative z-10 max-w-screen-2xl mx-auto px-4 sm:px-6 lg:px-8 pb-24">
                <div className="sticky top-24 z-30 mb-8 transition-all duration-300">
                    <Controls
                        sortOrder={sortOrder}
                        setSortOrder={setSortOrder}
                        selectedCollections={selectedCollections}
                        handleCollectionToggle={handleCollectionToggle}
                        clearFilters={clearFilters}
                        removeCollectionFilter={removeCollectionFilter}
                    />
                </div>
                
                <AnimatePresence mode="wait">
                    {filteredProducts.length > 0 ? (
                        <motion.div
                            key={currentPage + sortOrder + selectedCollections.join('')}
                            className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-x-6 gap-y-12"
                            variants={containerVariants}
                            initial="hidden"
                            animate="visible"
                            exit={{ opacity: 0 }}
                        >
                            {paginatedProducts.map((item, index) => (
                                <ItemCard 
                                    key={item.id} 
                                    product={item} 
                                    openLightbox={() => openLightbox((currentPage - 1) * itemsPerPage + index)} 
                                />
                            ))}
                        </motion.div>
                    ) : (
                        <motion.div 
                            initial={{ opacity: 0 }} 
                            animate={{ opacity: 1 }} 
                            exit={{ opacity: 0 }}
                            className="flex flex-col items-center justify-center py-32 text-center"
                        >
                            <div className="w-20 h-20 bg-white/5 rounded-full flex items-center justify-center mb-6 border border-white/10">
                                <Search size={32} className="text-attire-silver/50" />
                            </div>
                            <h3 className="text-2xl font-serif text-white mb-2">No products found</h3>
                            <p className="text-attire-silver">Try adjusting your filters to find what you're looking for.</p>
                            <button 
                                onClick={clearFilters}
                                className="mt-6 text-attire-accent hover:text-white transition-colors underline underline-offset-4"
                            >
                                Clear all filters
                            </button>
                        </motion.div>
                    )}
                </AnimatePresence>

                {totalPages > 1 && (
                    <div className="flex justify-center items-center gap-6 mt-20">
                        <button
                            onClick={() => handlePageChange(currentPage - 1)}
                            disabled={currentPage === 1}
                            className="group p-3 rounded-full border border-white/10 text-white hover:bg-white/10 disabled:opacity-30 disabled:cursor-not-allowed transition-all"
                        >
                            <ChevronLeft size={20} className="group-hover:-translate-x-0.5 transition-transform" />
                        </button>
                        <span className="text-attire-silver font-medium text-sm tracking-wider">
                            PAGE {currentPage} / {totalPages}
                        </span>
                        <button
                            onClick={() => handlePageChange(currentPage + 1)}
                            disabled={currentPage === totalPages}
                            className="group p-3 rounded-full border border-white/10 text-white hover:bg-white/10 disabled:opacity-30 disabled:cursor-not-allowed transition-all"
                        >
                            <ChevronRight size={20} className="group-hover:translate-x-0.5 transition-transform" />
                        </button>
                    </div>
                )}
            </main>

            <AnimatePresence>
                {selectedImage && (
                    <Lightbox
                        key="lightbox"
                        selectedImage={{
                            ...selectedImage,
                            src: selectedImage.images[0],
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

const Controls = ({ 
    sortOrder, 
    setSortOrder, 
    selectedCollections, 
    handleCollectionToggle, 
    clearFilters,
    removeCollectionFilter
}) => {
    const scrollContainerRef = useRef(null);

    const scroll = (direction) => {
        if (scrollContainerRef.current) {
            scrollContainerRef.current.scrollBy({ left: direction * 200, behavior: 'smooth' });
        }
    };

    return (
        <div className="w-full">
            <div className="backdrop-blur-xl bg-black/20 border border-white/10 rounded-2xl p-2 md:p-3 flex flex-col md:flex-row gap-4 shadow-xl">
                {/* Collections Filter Scroll */}
                <div className="flex-grow flex items-center min-w-0 relative">
                    <div className="absolute left-0 top-0 bottom-0 w-8 bg-gradient-to-r from-black/20 to-transparent z-10 md:hidden pointer-events-none" />
                    <div className="absolute right-0 top-0 bottom-0 w-8 bg-gradient-to-l from-black/20 to-transparent z-10 md:hidden pointer-events-none" />
                    
                    <button onClick={() => scroll(-1)} className="p-2 text-white/50 hover:text-white md:hidden z-20"><ChevronLeft size={18} /></button>
                    
                    <div ref={scrollContainerRef} className="flex items-center gap-2 overflow-x-auto flex-nowrap px-2 md:px-0 [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
                        <span className="text-xs font-medium text-attire-silver/60 uppercase tracking-wider flex-shrink-0 mr-2 hidden md:block">Collections</span>
                        {allCollections.map(collection => (
                            <button
                                key={collection.id}
                                onClick={() => handleCollectionToggle(collection.slug)}
                                className={`px-4 py-2 text-sm rounded-full transition-all duration-300 flex-shrink-0 border ${
                                    selectedCollections.includes(collection.slug)
                                        ? 'bg-attire-accent text-black border-attire-accent font-medium shadow-[0_0_15px_rgba(212,168,76,0.3)]'
                                        : 'bg-white/5 text-attire-silver border-white/5 hover:bg-white/10 hover:text-white'
                                }`}
                            >
                                {collection.title}
                            </button>
                        ))}
                    </div>
                    
                    <button onClick={() => scroll(1)} className="p-2 text-white/50 hover:text-white md:hidden z-20"><ChevronRight size={18} /></button>
                </div>

                {/* Sort Dropdown */}
                <div className="flex-shrink-0 border-t md:border-t-0 md:border-l border-white/10 pt-3 md:pt-0 md:pl-3">
                    <FilterSortDropdown 
                        sortOrder={sortOrder} 
                        setSortOrder={setSortOrder} 
                    />
                </div>
            </div>
            
            {/* Active Filters Display */}
            <AnimatePresence>
                {selectedCollections.length > 0 && (
                    <motion.div 
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        className="flex items-center flex-wrap gap-2 mt-4 px-2"
                    >
                        <span className="text-xs text-attire-silver/60 uppercase tracking-wider mr-2">Active:</span>
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
                            className="text-xs font-medium text-red-400 hover:text-red-300 ml-auto transition-colors px-2"
                        >
                            Clear All
                        </button>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

const FilterTag = ({ children, onRemove }) => (
    <motion.div
        layout
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.8 }}
        className="flex items-center gap-2 bg-white/10 border border-white/10 text-white rounded-full pl-3 pr-1 py-1 text-xs font-medium"
    >
        <span>{children}</span>
        <button onClick={onRemove} className="p-1 hover:bg-white/20 rounded-full transition-colors">
            <X size={14} />
        </button>
    </motion.div>
);

const FilterSortDropdown = ({
    sortOrder, 
    setSortOrder
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

    const selectedLabel = sortOptions.find(opt => opt.value === sortOrder)?.label || 'Sort By';

    return (
        <div ref={dropdownRef} className="relative z-50 min-w-[200px]">
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="flex items-center justify-between w-full px-4 py-2.5 bg-black/40 hover:bg-black/60 border border-white/10 rounded-xl text-sm font-medium text-white transition-all focus:outline-none focus:ring-1 focus:ring-attire-accent/50"
            >
                <span className="truncate mr-2">{selectedLabel}</span>
                <ChevronDown size={16} className={`text-attire-silver transition-transform duration-300 ${isOpen ? 'rotate-180' : ''}`} />
            </button>
            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ opacity: 0, y: 8, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 8, scale: 0.95 }}
                        transition={{ duration: 0.2 }}
                        className="absolute right-0 mt-2 w-56 bg-[#1a1a1a] border border-white/10 rounded-xl shadow-2xl overflow-hidden py-1"
                    >
                        {sortOptions.map(option => (
                            <button
                                key={option.value}
                                onClick={() => {
                                    setSortOrder(option.value);
                                    setIsOpen(false);
                                }}
                                className={`w-full flex items-center justify-between px-4 py-3 text-sm text-left transition-colors ${
                                    sortOrder === option.value 
                                        ? 'bg-attire-accent/10 text-attire-accent' 
                                        : 'text-attire-silver hover:bg-white/5 hover:text-white'
                                }`}
                            >
                                <span>{option.label}</span>
                                {sortOrder === option.value && <Check size={14} />}
                            </button>
                        ))}
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default ProductListPage;