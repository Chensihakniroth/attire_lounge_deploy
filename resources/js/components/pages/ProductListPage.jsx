import React, { useState, useMemo, useEffect, useRef, memo } from 'react';
import { useLocation, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { wrap } from "../../helpers/math.js";
import Lightbox from './lookbook/Lightbox';
import { ChevronLeft, ChevronRight, Search, X, Filter, ChevronDown, Check, Star } from 'lucide-react';
import { products as allProducts, collections as allCollections } from '../../data/products.js';
import ItemCard from './collections/ItemCard';
import { useFavorites } from '../../context/FavoritesContext.jsx';

// --- Styled Components ---

const GrainOverlay = memo(() => (
  <div className="fixed inset-0 pointer-events-none z-50 opacity-[0.02] mix-blend-overlay">
    <svg viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg">
      <filter id="noiseFilter">
        <feTurbulence type="fractalNoise" baseFrequency="0.65" numOctaves="3" stitchTiles="stitch"/>
      </filter>
      <rect width="100%" height="100%" filter="url(#noiseFilter)"/>
    </svg>
  </div>
));

const sortOptions = [
    { value: 'category-asc', label: 'By Category' },
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

    const [sortOrder, setSortOrder] = useState('category-asc');
    const [[page, direction], setPage] = useState([null, 0]);
    const { favorites, toggleFavorite, isFavorited } = useFavorites();
    
    const [selectedCollections, setSelectedCollections] = useState(() => {
        return collectionQuery ? [collectionQuery] : [];
    });

    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 16;

    useEffect(() => {
        window.scrollTo({ top: 0, behavior: 'instant' });
    }, []);

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

        const categoryPriority = {
            'Ties': 1,
            'Pocket Squares': 2,
            'Cufflinks': 3,
            'Tuxedos': 4,
            'Business Suits': 5,
            'Summer Suits': 6,
            'Suits': 7
        };

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
            if (sortKey === 'category') {
                const priorityA = categoryPriority[a.category] || 99;
                const priorityB = categoryPriority[b.category] || 99;
                
                if (priorityA !== priorityB) {
                    return sortDirection === 'asc' ? priorityA - priorityB : priorityB - priorityA;
                }
                
                const colA = a.collection || '';
                const colB = b.collection || '';
                if (colA !== colB) {
                    return colA.localeCompare(colB);
                }
                
                return a.name.localeCompare(b.name);
            }
            if (sortKey === 'name') {
                return sortDirection === 'asc' 
                    ? a.name.localeCompare(b.name) 
                    : b.name.localeCompare(a.name);
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

    const handleLocalToggleFavorite = (id) => {
        toggleFavorite(id);
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
            window.scrollTo({ top: 400, behavior: 'smooth' });
        }
    };

    return (
        <div className="min-h-screen bg-attire-navy relative overflow-x-hidden selection:bg-attire-accent selection:text-white">
            <GrainOverlay />
            
            <style>
                {`
                    .no-scrollbar::-webkit-scrollbar {
                        display: none;
                    }
                    .no-scrollbar {
                        -ms-overflow-style: none;
                        scrollbar-width: none;
                    }
                `}
            </style>

            {/* Background Decorations */}
            <div className="fixed inset-0 pointer-events-none z-0">
                <div className="absolute top-[-20%] left-[-10%] w-[1000px] h-[1000px] bg-attire-accent/[0.03] rounded-full blur-[180px]" />
                <div className="absolute bottom-[-20%] right-[-10%] w-[800px] h-[800px] bg-white/[0.02] rounded-full blur-[150px]" />
            </div>

            <header className="relative z-10 pt-32 pb-16 sm:pt-48 sm:pb-24 px-6 text-center">
                <motion.div
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
                    className="max-w-4xl mx-auto"
                >
                    <div className="flex items-center justify-center gap-4 mb-8">
                        <div className="h-px w-8 bg-attire-accent/30" />
                        <span className="text-attire-accent text-[10px] tracking-[0.6em] uppercase font-bold text-center">Collection</span>
                        <div className="h-px w-8 bg-attire-accent/30" />
                    </div>

                    <h1 className="font-serif text-6xl md:text-8xl lg:text-[7rem] font-light text-white mb-10 leading-[0.85] tracking-tighter italic">
                        {pageTitle.split(' ')[0]} <br /> 
                        <span className="text-attire-silver/40">{pageTitle.split(' ').slice(1).join(' ') || 'Essentials'}</span>
                    </h1>

                    <div className="flex items-center justify-center">
                        <Link to="/collections" className="group flex items-center gap-3 text-[10px] uppercase tracking-[0.3em] font-bold text-white/40 hover:text-attire-accent transition-colors duration-500">
                            <ChevronLeft size={14} className="group-hover:-translate-x-2 transition-transform duration-500" />
                            Back to Gallery
                        </Link>
                    </div>
                </motion.div>
            </header>

            <main className="relative z-10 max-w-screen-2xl mx-auto px-6 sm:px-12 lg:px-24 pb-32">
                {/* Enhanced Controls Bar */}
                <div className="z-40 sticky top-24 mb-20 pointer-events-auto">
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
                            className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-x-6 gap-y-16"
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0 }}
                            transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
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
                            className="flex flex-col items-center justify-center py-32 text-center"
                        >
                            <div className="w-20 h-20 bg-white/5 rounded-full flex items-center justify-center mb-6 border border-white/10">
                                <Search size={32} className="text-attire-silver/50" />
                            </div>
                            <h3 className="text-2xl font-serif text-white mb-2">No items found</h3>
                            <p className="text-attire-silver/60 text-sm">Try adjusting your filters to find what you're looking for.</p>
                            <button 
                                onClick={clearFilters}
                                className="mt-8 text-[10px] uppercase tracking-[0.2em] font-bold text-attire-accent hover:text-white transition-colors underline underline-offset-8"
                            >
                                Reset Filters
                            </button>
                        </motion.div>
                    )}
                </AnimatePresence>

                {/* Enhanced Pagination */}
                {totalPages > 1 && (
                    <div className="flex justify-center items-center gap-12 mt-32">
                        <button
                            onClick={() => handlePageChange(currentPage - 1)}
                            disabled={currentPage === 1}
                            className="group flex flex-col items-center gap-4 text-white/20 hover:text-white disabled:opacity-0 transition-all duration-700"
                        >
                            <ChevronLeft size={24} strokeWidth={1} className="group-hover:-translate-x-4 transition-transform duration-700" />
                            <span className="text-[8px] uppercase tracking-[0.4em] font-bold">Previous</span>
                        </button>
                        
                        <div className="flex flex-col items-center gap-2">
                             <div className="text-attire-accent font-serif italic text-xl">
                                {currentPage.toString().padStart(2, '0')}
                            </div>
                            <div className="w-12 h-px bg-white/10" />
                            <div className="text-white/20 text-[10px] font-bold">
                                {totalPages.toString().padStart(2, '0')}
                            </div>
                        </div>

                        <button
                            onClick={() => handlePageChange(currentPage + 1)}
                            disabled={currentPage === totalPages}
                            className="group flex flex-col items-center gap-4 text-white/20 hover:text-white disabled:opacity-0 transition-all duration-700"
                        >
                            <ChevronRight size={24} strokeWidth={1} className="group-hover:translate-x-4 transition-transform duration-700" />
                            <span className="text-[8px] uppercase tracking-[0.4em] font-bold">Next Page</span>
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
                        toggleFavorite={handleLocalToggleFavorite}
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
            scrollContainerRef.current.scrollBy({ left: direction * 150, behavior: 'smooth' });
        }
    };

    return (
        <div className="w-full max-w-6xl mx-auto relative z-[100]">
            <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3, duration: 0.5 }}
                className="relative bg-white/[0.03] backdrop-blur-2xl border border-white/10 rounded-full p-1 sm:p-1.5 flex items-center shadow-2xl"
            >
                {/* Collections Filter Scroll */}
                <div className="flex-grow flex items-center min-w-0 relative">
                    <button 
                        onClick={() => scroll(-1)} 
                        className="flex-shrink-0 p-2 text-white/20 hover:text-white transition-colors lg:hidden"
                    >
                        <ChevronLeft size={16} />
                    </button>
                    
                    <div ref={scrollContainerRef} className="flex-grow flex items-center justify-start lg:justify-center gap-1 overflow-x-auto lg:overflow-x-visible lg:flex-nowrap no-scrollbar px-2">
                        {allCollections.map(collection => (
                            <button
                                key={collection.id}
                                onClick={() => handleCollectionToggle(collection.slug)}
                                className={`px-4 sm:px-5 py-2 sm:py-2.5 text-[9px] sm:text-[10px] uppercase tracking-[0.2em] font-bold rounded-full transition-all duration-500 flex-shrink-0 ${
                                    selectedCollections.includes(collection.slug)
                                        ? 'bg-white text-black shadow-lg'
                                        : 'text-white/40 hover:text-white hover:bg-white/5'
                                }`}
                            >
                                {collection.title}
                            </button>
                        ))}
                    </div>
                    
                    <button 
                        onClick={() => scroll(1)} 
                        className="flex-shrink-0 p-2 text-white/20 hover:text-white transition-colors lg:hidden"
                    >
                        <ChevronRight size={16} />
                    </button>
                </div>

                {/* Sort Dropdown */}
                <div className="flex-shrink-0 border-l border-white/10 pl-1 sm:pl-2">
                    <FilterSortDropdown 
                        sortOrder={sortOrder} 
                        setSortOrder={setSortOrder} 
                    />
                </div>
            </motion.div>
            
            {/* Active Filters Display */}
            <AnimatePresence>
                {selectedCollections.length > 0 && (
                    <motion.div 
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        className="flex flex-col sm:flex-row sm:items-center flex-wrap gap-4 mt-6 px-6"
                    >
                        <div className="flex items-center flex-wrap gap-2">
                            <span className="text-[9px] text-white/20 uppercase tracking-[0.3em] font-bold mr-2">Filtering By:</span>
                            {selectedCollections.map(slug => {
                                const collection = allCollections.find(c => c.slug === slug);
                                return (
                                    <FilterTag key={slug} onRemove={() => removeCollectionFilter(slug)}>
                                        {collection?.title || slug}
                                    </FilterTag>
                                );
                            })}
                        </div>
                        <button
                            onClick={clearFilters}
                            className="text-[9px] uppercase tracking-[0.2em] font-bold text-red-400/60 hover:text-red-400 sm:ml-auto transition-colors px-2 self-start sm:self-auto"
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
        className="flex items-center gap-3 bg-white/5 border border-white/10 text-white rounded-full pl-4 pr-2 py-1.5 text-[10px] font-bold tracking-wide"
    >
        <span className="opacity-60">{children}</span>
        <button onClick={onRemove} className="p-1 hover:bg-white/10 rounded-full transition-colors">
            <X size={12} className="text-white/40" />
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
        <div ref={dropdownRef} className="static sm:relative">
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="flex items-center gap-2 px-3 sm:px-6 py-2 sm:py-2.5 bg-transparent hover:bg-white/5 rounded-full text-[9px] sm:text-[10px] font-bold uppercase tracking-[0.2em] text-white/60 hover:text-white transition-all focus:outline-none"
            >
                <span className="truncate max-w-[60px] sm:max-w-none">{selectedLabel}</span>
                <ChevronDown size={14} className={`text-white/20 transition-transform duration-500 shrink-0 ${isOpen ? 'rotate-180' : ''}`} />
            </button>
            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ opacity: 0, y: 10, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 10, scale: 0.95 }}
                        transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
                        className="absolute left-0 right-0 sm:left-auto sm:right-0 mt-4 sm:w-56 bg-attire-navy border border-white/10 rounded-2xl shadow-2xl overflow-hidden py-2 z-[120]"
                    >
                        {sortOptions.map(option => (
                            <button
                                key={option.value}
                                onClick={() => {
                                    setSortOrder(option.value);
                                    setIsOpen(false);
                                }}
                                className={`w-full flex items-center justify-between px-6 py-3 text-[10px] font-bold uppercase tracking-widest text-left transition-colors ${
                                    sortOrder === option.value 
                                        ? 'bg-white/10 text-attire-accent' 
                                        : 'text-white/40 hover:bg-white/5 hover:text-white'
                                }`}
                            >
                                <span>{option.label}</span>
                                {sortOrder === option.value && <Check size={12} />}
                            </button>
                        ))}
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default ProductListPage;
