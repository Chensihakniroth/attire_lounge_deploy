import React, { useState, useMemo, useEffect, useRef } from 'react';
import { useLocation, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronLeft, Search, X, ChevronDown, Loader2, SlidersHorizontal, Search as SearchIcon } from 'lucide-react';
import ItemCard from './collections/ItemCard';
import GrainOverlay from '../common/GrainOverlay.jsx';
import SEO from '../common/SEO';
import { useProducts } from '../../hooks/useProducts';
import { Product } from '../../types';
import useDebounce from '../../hooks/useDebounce';

interface CollectionOption {
// ... existing interface ...
// (Note: I'll keep the rest of the file structure but focus on the changes)
    id: number;
    title: string;
    slug: string;
}

const allCollections: CollectionOption[] = [
    { id: 1, title: 'Havana Collection', slug: 'havana-collection' },
    { id: 2, title: 'Mocha Mousse', slug: 'mocha-mousse-25' },
    { id: 3, title: 'Groom Collection', slug: 'groom-collection' },
    { id: 4, title: 'Office Collections', slug: 'office-collections' },
    { id: 5, title: 'Travel Collection', slug: 'travel-collection' },
    { id: 6, title: 'Accessories', slug: 'accessories' },
];

const sortOptions: SortOption[] = [
    { value: 'newest', label: 'Newest Arrivals' },
    { value: 'price_low', label: 'Price: Low to High' },
    { value: 'price_high', label: 'Price: High to Low' },
    { value: 'featured', label: 'Featured First' },
];

const useQuery = () => {
    return new URLSearchParams(useLocation().search);
};

const ProductListPage: React.FC = () => {
    const query = useQuery();
    const collectionQuery = query.get('collection');

    const [sortOrder, setSortOrder] = useState<string>('newest');
    const [searchQuery, setSearchQuery] = useState<string>('');
    const debouncedSearch = useDebounce(searchQuery, 500);

    const [selectedCollections, setSelectedCollections] = useState<string[]>(() => {
        return collectionQuery ? [collectionQuery] : [];
    });

    const productsPerPage = 12; 
    const [currentLoadedPage, setCurrentLoadedPage] = useState<number>(1);
    const [allLoadedProducts, setAllLoadedProducts] = useState<Product[]>([]);
    const [hasMore, setHasMore] = useState<boolean>(true);

    const { data, isLoading, isFetching } = useProducts({
        category: selectedCollections.join(','),
        sort: sortOrder,
        search: debouncedSearch,
        page: currentLoadedPage,
        per_page: productsPerPage
    });

    const meta = data?.meta || { total: 0, last_page: 1, current_page: 1 };

    useEffect(() => {
        setAllLoadedProducts([]);
        setCurrentLoadedPage(1);
        setHasMore(true);
        

    }, [selectedCollections, sortOrder, debouncedSearch]);

    useEffect(() => {
        if (data?.data && currentLoadedPage > 0) {
            setAllLoadedProducts(prevProducts => {
                const newProducts = data.data.filter(
                    np => !prevProducts.some(p => p.id === np.id)
                );
                
                if (currentLoadedPage === 1) return data.data;
                
                return [...prevProducts, ...newProducts];
            });
            setHasMore(meta.current_page < meta.last_page);
        }
    }, [data, currentLoadedPage, meta.current_page, meta.last_page]);

    const pageTitle = useMemo(() => {
        const currentCollectionDetails = allCollections.find(c => c.slug === selectedCollections[0]);
        return selectedCollections.length === 1 && currentCollectionDetails
            ? currentCollectionDetails.title
            : selectedCollections.length > 1 
                ? "Multiple Collections" 
                : "Elite Collections";
    }, [selectedCollections]);

    const handleCollectionToggle = (slug: string) => {
        setSelectedCollections(prev => 
            prev.includes(slug) 
                ? prev.filter(s => s !== slug) 
                : [...prev, slug]
        );
    };

    const clearFilters = () => {
        setSelectedCollections([]);
        setSearchQuery('');
    };

    const removeCollectionFilter = (slug: string) => {
        setSelectedCollections(prev => prev.filter(s => s !== slug));
    };

    const handleLoadMore = () => {
        if (hasMore && !isFetching) {
            setCurrentLoadedPage(prevPage => prevPage + 1);
        }
    };

    return (
        <motion.div 
            className="min-h-screen bg-attire-navy relative selection:bg-attire-accent selection:text-white"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
        >
            <SEO 
                title={`${pageTitle} | Elite Styling House`}
                description={`Explore our ${pageTitle}. Expertly curated luxury styles designed for the modern gentleman.`}
            />
            <GrainOverlay />
            
            <header className="relative z-10 pt-32 pb-16 sm:pt-48 sm:pb-24 px-6 text-center">
                <div className="max-w-4xl mx-auto">
                    <div className="flex items-center justify-center gap-4 mb-8">
                        <div className="h-px w-8 bg-attire-accent/30" />
                        <span className="text-attire-accent text-[10px] tracking-[0.6em] uppercase font-bold">Collection</span>
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
                </div>
            </header>

            <main className="relative z-10 max-w-screen-2xl mx-auto px-6 sm:px-12 lg:px-24 pb-32">
                <div className="z-50 mb-20 relative">
                    <Controls
                        sortOrder={sortOrder}
                        setSortOrder={setSortOrder}
                        searchQuery={searchQuery}
                        setSearchQuery={setSearchQuery}
                        selectedCollections={selectedCollections}
                        handleCollectionToggle={handleCollectionToggle}
                        clearFilters={clearFilters}
                        removeCollectionFilter={removeCollectionFilter}
                    />
                </div>
                
                <AnimatePresence mode="wait">
                    {isLoading && allLoadedProducts.length === 0 ? (
                        <motion.div 
                            key="loading-initial"
                            className="flex flex-col items-center justify-center py-32"
                        >
                            <Loader2 className="w-12 h-12 text-attire-accent animate-spin mb-4" />
                            <p className="text-attire-silver/60 text-xs uppercase tracking-widest">Gathering Excellence...</p>
                        </motion.div>
                    ) : allLoadedProducts.length > 0 ? (
                        <motion.div
                            key="results"
                            className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-8 lg:gap-12"
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                        >
                            {allLoadedProducts.map((item) => (
                                <ItemCard key={item.id} product={item} />
                            ))}
                        </motion.div>
                    ) : (
                        <motion.div 
                            key="empty"
                            className="flex flex-col items-center justify-center py-32 text-center"
                        >
                            <Search size={32} className="text-attire-silver/50 mb-6" />
                            <h3 className="text-2xl font-serif text-white mb-2">No items found</h3>
                            <button onClick={clearFilters} className="mt-8 text-[10px] uppercase tracking-[0.2em] font-bold text-attire-accent">Reset Filters</button>
                        </motion.div>
                    )}
                </AnimatePresence>

                {hasMore && (
                    <motion.div 
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.5 }}
                        className="flex justify-center mt-24"
                    >
                        <button 
                            onClick={handleLoadMore} 
                            disabled={isFetching}
                            className="group flex items-center justify-center gap-3 px-8 py-4 bg-white text-black text-[11px] font-bold uppercase tracking-[0.5em] transition-all duration-700 relative overflow-hidden"
                        >
                            <span className="relative z-10">{isFetching ? 'Loading More...' : 'Load More Products'}</span>
                            {!isFetching && <ChevronDown size={18} className="relative z-10 group-hover:translate-y-1 transition-transform duration-500" />}
                            <div className="absolute inset-0 bg-attire-accent translate-y-full group-hover:translate-y-0 transition-transform duration-700" />
                        </button>
                    </motion.div>
                )}
            </main>
        </motion.div>
    );
};

interface ControlsProps {
    sortOrder: string;
    setSortOrder: (order: string) => void;
    searchQuery: string;
    setSearchQuery: (query: string) => void;
    selectedCollections: string[];
    handleCollectionToggle: (slug: string) => void;
    clearFilters: () => void;
    removeCollectionFilter: (slug: string) => void;
}

const Controls: React.FC<ControlsProps> = ({ sortOrder, setSortOrder, searchQuery, setSearchQuery, selectedCollections, handleCollectionToggle, clearFilters, removeCollectionFilter }) => (
    <div className="w-full max-w-6xl mx-auto space-y-6">
        <div className="relative group z-[999]">
            {/* Background & Glow Container - This clips the glow! */}
            <div className="absolute inset-0 bg-white/[0.03] border border-white/10 rounded-2xl backdrop-blur-sm transition-all duration-500 overflow-hidden pointer-events-none" />
            
            {/* Content Container - No overflow-hidden here, so dropdowns can fly free! */}
            <div className="relative flex flex-col md:flex-row items-center gap-4 p-2 md:p-3 z-10">
                {/* Search Input */}
                <div className="relative w-full md:flex-grow group/search">
                    <SearchIcon size={18} className="absolute left-5 top-1/2 -translate-y-1/2 text-white/30 group-focus-within/search:text-attire-accent transition-colors duration-500" />
                    <input 
                        type="text"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        placeholder="Search our masterpiece..."
                        className="w-full bg-white/[0.05] border border-transparent focus:border-white/10 focus:bg-white/[0.08] text-white text-[11px] uppercase tracking-[0.2em] font-medium py-4 pl-14 pr-6 rounded-xl outline-none transition-all duration-500 placeholder:text-white/20"
                    />
                </div>

                {/* Dropdowns Container */}
                <div className="flex items-center gap-2 w-full md:w-auto">
                    <CollectionDropdown selectedCollections={selectedCollections} handleCollectionToggle={handleCollectionToggle} />
                    <div className="h-8 w-px bg-white/10 hidden md:block" />
                    <FilterSortDropdown sortOrder={sortOrder} setSortOrder={setSortOrder} />
                </div>
            </div>
        </div>

        {/* Active Filters */}
        <AnimatePresence>
            {(selectedCollections.length > 0 || searchQuery) && (
                <motion.div 
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className="flex items-center flex-wrap gap-3 px-2"
                >
                    <span className="text-[9px] uppercase tracking-[0.3em] font-bold text-white/20 mr-2">Refining by:</span>
                    {searchQuery && (
                        <FilterTag onRemove={() => setSearchQuery('')}>
                            Search: {searchQuery}
                        </FilterTag>
                    )}
                    {selectedCollections.map(slug => (
                        <FilterTag key={slug} onRemove={() => removeCollectionFilter(slug)}>
                            {allCollections.find(c => c.slug === slug)?.title || slug}
                        </FilterTag>
                    ))}
                    <button 
                        onClick={clearFilters}
                        className="text-[9px] uppercase tracking-[0.3em] font-bold text-attire-accent hover:text-white transition-colors duration-300 ml-2"
                    >
                        Reset All
                    </button>
                </motion.div>
            )}
        </AnimatePresence>
    </div>
);

const CollectionDropdown: React.FC<{ selectedCollections: string[]; handleCollectionToggle: (slug: string) => void }> = ({ selectedCollections, handleCollectionToggle }) => {
    const [isOpen, setIsOpen] = useState(false);
    const dropdownRef = useRef<HTMLDivElement>(null);
    const label = 'Collections';

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    return (
        <div ref={dropdownRef} className="relative w-full md:w-auto">
            <button 
                onClick={() => setIsOpen(!isOpen)} 
                className={`w-full md:w-auto px-6 py-4 text-[10px] font-bold uppercase tracking-[0.2em] transition-all duration-500 flex items-center justify-between md:justify-start gap-3 rounded-xl ${isOpen ? 'bg-white/10 text-white' : 'text-white/40 hover:text-white hover:bg-white/5'}`}
            >
                <SlidersHorizontal size={14} className={selectedCollections.length > 0 ? 'text-attire-accent' : ''} />
                <span className="truncate max-w-[120px]">{label}</span>
                <ChevronDown size={14} className={`transition-transform duration-500 ${isOpen ? 'rotate-180' : ''}`} />
            </button>
            <AnimatePresence>
                {isOpen && (
                    <motion.div 
                        initial={{ opacity: 0, y: 10, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 10, scale: 0.95 }}
                        className="absolute left-0 mt-3 w-full md:w-72 bg-[#0a0a0a] border border-white/10 rounded-2xl p-2 z-[300] shadow-2xl backdrop-blur-xl"
                    >
                        <div className="grid grid-cols-1 gap-1">
                            {allCollections.map(c => (
                                <button 
                                    key={c.id} 
                                    onClick={() => { handleCollectionToggle(c.slug); }} 
                                    className={`w-full px-5 py-3.5 text-[10px] uppercase tracking-[0.1em] font-bold text-left rounded-lg transition-all duration-300 ${selectedCollections.includes(c.slug) ? 'bg-attire-accent text-black' : 'text-white/40 hover:text-white hover:bg-white/5'}`}
                                >
                                    {c.title}
                                </button>
                            ))}
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

const FilterSortDropdown: React.FC<{ sortOrder: string; setSortOrder: (order: string) => void }> = ({ sortOrder, setSortOrder }) => {
    const [isOpen, setIsOpen] = useState(false);
    const dropdownRef = useRef<HTMLDivElement>(null);
    const label = 'Sorting';

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    return (
        <div ref={dropdownRef} className="relative w-full md:w-auto">
            <button 
                onClick={() => setIsOpen(!isOpen)} 
                className={`w-full md:w-auto px-6 py-4 text-[10px] font-bold uppercase tracking-[0.2em] transition-all duration-500 flex items-center justify-between md:justify-start gap-3 rounded-xl ${isOpen ? 'bg-white/10 text-white' : 'text-white/40 hover:text-white hover:bg-white/5'}`}
            >
                <span className="truncate max-w-[120px]">{label}</span>
                <ChevronDown size={14} className={`transition-transform duration-500 ${isOpen ? 'rotate-180' : ''}`} />
            </button>
            <AnimatePresence>
                {isOpen && (
                    <motion.div 
                        initial={{ opacity: 0, y: 10, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 10, scale: 0.95 }}
                        className="absolute right-0 mt-3 w-full md:w-64 bg-[#0a0a0a] border border-white/10 rounded-2xl p-2 z-[300] shadow-2xl backdrop-blur-xl"
                    >
                        <div className="grid grid-cols-1 gap-1">
                            {sortOptions.map(opt => (
                                <button 
                                    key={opt.value} 
                                    onClick={() => { setSortOrder(opt.value); setIsOpen(false); }} 
                                    className={`w-full px-5 py-3.5 text-[10px] uppercase tracking-[0.1em] font-bold text-left rounded-lg transition-all duration-300 ${sortOrder === opt.value ? 'bg-attire-accent text-black' : 'text-white/40 hover:text-white hover:bg-white/5'}`}
                                >
                                    {opt.label}
                                </button>
                            ))}
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

interface FilterTagProps {
    children: React.ReactNode;
    onRemove: () => void;
}

const FilterTag: React.FC<FilterTagProps> = ({ children, onRemove }) => (
    <motion.div 
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className="flex items-center gap-2 bg-white/5 border border-white/10 text-white rounded-lg pl-4 pr-2 py-2 text-[9px] font-bold uppercase tracking-widest group hover:border-white/20 transition-all duration-300"
    >
        <span className="opacity-60 group-hover:opacity-100 transition-opacity">{children}</span>
        <button 
            onClick={onRemove} 
            className="p-1 hover:bg-white/10 rounded-md transition-colors text-white/30 hover:text-white"
        >
            <X size={12} />
        </button>
    </motion.div>
);

export default ProductListPage;
