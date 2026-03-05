import React, { useState, useMemo, useEffect, useRef } from 'react';
import { useLocation, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronLeft, Search, X, ChevronDown, Loader2, SlidersHorizontal, Search as SearchIcon, Camera } from 'lucide-react';
import ItemCard from './collections/ItemCard';
import SEO from '../common/SEO';
import { useProducts, useCollections } from '../../hooks/useProducts';
import { Product } from '../../types';
import useDebounce from '../../hooks/useDebounce';

interface SortOption {
    value: string;
    label: string;
}

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
    const { data: collectionsData } = useCollections();

    const collections = useMemo(() => collectionsData || [], [collectionsData]);

    const [sortOrder, setSortOrder] = useState<string>('newest');
    const [searchQuery, setSearchQuery] = useState<string>('');
    const debouncedSearch = useDebounce(searchQuery, 500);

    const [selectedCollections, setSelectedCollections] = useState<string[]>(() => {
        return collectionQuery ? [collectionQuery] : [];
    });

    const productsPerPage = 12;
    const [currentLoadedPage, setCurrentLoadedPage] = useState<number>(1);
    const [allLoadedProducts, setAllLoadedProducts] = useState<Product[]>([]);
    
    // Track unique keys for animation triggers ✨
    const [displayKey, setDisplayKey] = useState<string>('initial');
    const [isInitialLoading, setIsInitialLoading] = useState(true);

    const { data, isLoading, isFetching } = useProducts({
        category: selectedCollections.join(','),
        sort: sortOrder,
        search: debouncedSearch,
        page: currentLoadedPage,
        per_page: productsPerPage
    });

    const meta = data?.meta || { total: 0, last_page: 1, current_page: 1 };

    useEffect(() => {
        const timer = setTimeout(() => setIsInitialLoading(false), 1000);
        return () => clearTimeout(timer);
    }, []);

    useEffect(() => {
        setCurrentLoadedPage(1);
    }, [selectedCollections, sortOrder, debouncedSearch]);

    useEffect(() => {
        if (data?.data) {
            if (currentLoadedPage === 1) {
                setAllLoadedProducts(data.data);
                // Update the key ONLY when new data arrives to trigger fade-in ✨
                setDisplayKey(`${sortOrder}-${selectedCollections.join(',')}-${debouncedSearch}`);
            } else {
                setAllLoadedProducts(prevProducts => {
                    const newProducts = data.data.filter(
                        np => !prevProducts.some(p => p.id === np.id)
                    );
                    return [...prevProducts, ...newProducts];
                });
            }
        }
    }, [data, currentLoadedPage]);

    const pageTitle = useMemo(() => {
        const currentCollectionDetails = collections.find(c => c.slug === selectedCollections[0]);
        return selectedCollections.length === 1 && currentCollectionDetails
            ? currentCollectionDetails.name || currentCollectionDetails.title
            : selectedCollections.length > 1
                ? "Multiple Collections"
                : "All Collections";
    }, [selectedCollections, collections]);

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
        if (meta.current_page < meta.last_page && !isFetching) {
            setCurrentLoadedPage(prevPage => prevPage + 1);
        }
    };

    return (
        <div className="min-h-screen bg-attire-navy relative selection:bg-attire-accent selection:text-white overflow-x-hidden">
            <SEO
                title={`${pageTitle} | Elite Styling House`}
                description={`Explore our ${pageTitle}. Expertly curated luxury styles designed for the modern gentleman.`}
            />

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

            <main className="relative z-10 max-w-[1800px] mx-auto px-6 sm:px-12 lg:px-20 pb-32">
                <div className="z-50 mb-20 relative">
                    <Controls
                        sortOrder={sortOrder}
                        setSortOrder={setSortOrder}
                        searchQuery={searchQuery}
                        setSearchQuery={setSearchQuery}
                        selectedCollections={selectedCollections}
                        collections={collections}
                        handleCollectionToggle={handleCollectionToggle}
                        clearFilters={clearFilters}
                        removeCollectionFilter={removeCollectionFilter}
                    />
                </div>

                <AnimatePresence mode="wait">
                    {isInitialLoading || (isLoading && allLoadedProducts.length === 0) ? (
                        <motion.div 
                            key="loader"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="flex flex-col items-center justify-center py-48"
                        >
                            <div className="relative mb-10">
                                <motion.div 
                                    animate={{ scale: [1, 1.1, 1], opacity: [0.3, 0.6, 0.3] }}
                                    transition={{ duration: 2, repeat: Infinity }}
                                    className="w-20 h-20 bg-attire-accent/10 rounded-full flex items-center justify-center border border-attire-accent/20"
                                >
                                    <Camera className="w-8 h-8 text-attire-accent" strokeWidth={1} />
                                </motion.div>
                                <Loader2 className="absolute inset-0 w-20 h-20 text-white/5 animate-spin" strokeWidth={0.5} />
                            </div>
                            <p className="text-white/60 text-[10px] uppercase tracking-[0.6em] font-black">Curating Selection</p>
                        </motion.div>
                    ) : (
                        <motion.div
                            key={displayKey}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -10 }}
                            transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
                        >
                            {allLoadedProducts.length > 0 ? (
                                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-8 lg:gap-12">
                                    {allLoadedProducts.map((item) => (
                                        <ItemCard key={item.id} product={item} />
                                    ))}
                                </div>
                            ) : (
                                <div className="flex flex-col items-center justify-center py-32 text-center">
                                    <Search size={32} className="text-attire-silver/50 mb-6" />
                                    <h3 className="text-2xl font-serif text-white mb-2">No items found</h3>
                                    <button onClick={clearFilters} className="mt-8 text-[10px] uppercase tracking-[0.2em] font-bold text-attire-accent">Reset Filters</button>
                                </div>
                            )}
                        </motion.div>
                    )}
                </AnimatePresence>

                {meta.current_page < meta.last_page && (
                    <div className="flex flex-col items-center mt-32 space-y-10">
                        <button 
                            onClick={handleLoadMore}
                            disabled={isFetching}
                            className="group relative px-16 py-7 rounded-2xl overflow-hidden transition-all duration-700 bg-white/[0.03] border border-white/10 hover:bg-white text-white hover:text-black"
                        >
                            <div className="relative flex items-center gap-6">
                                <span className="text-[11px] tracking-[0.6em] uppercase font-black">
                                    {isFetching ? 'Loading...' : 'Reveal More'}
                                </span>
                                <ChevronDown size={18} strokeWidth={3} />
                            </div>
                        </button>
                    </div>
                )}
            </main>
        </div>
    );
};

interface ControlsProps {
    sortOrder: string;
    setSortOrder: (order: string) => void;
    searchQuery: string;
    setSearchQuery: (query: string) => void;
    selectedCollections: string[];
    collections: any[];
    handleCollectionToggle: (slug: string) => void;
    clearFilters: () => void;
    removeCollectionFilter: (slug: string) => void;
}

const Controls: React.FC<ControlsProps> = ({ sortOrder, setSortOrder, searchQuery, setSearchQuery, selectedCollections, collections, handleCollectionToggle, clearFilters, removeCollectionFilter }) => (
    <div className="w-full max-w-6xl mx-auto space-y-6">
        <div className="relative group z-[999]">
            <div 
                className="absolute inset-0 bg-white/[0.03] border border-white/10 rounded-2xl backdrop-blur-2xl transition-all duration-500 pointer-events-none" 
                style={{ WebkitBackdropFilter: 'blur(16px) saturate(180%)' }} 
            />

            <div className="relative flex flex-col md:flex-row items-center gap-4 p-2 md:p-3 z-10">
                <div className="relative w-full md:flex-grow group/search">
                    <SearchIcon size={18} className="absolute left-5 top-1/2 -translate-y-1/2 text-white/30 group-focus-within/search:text-attire-accent transition-colors duration-500" />
                    <input
                        type="text"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        placeholder="Search masterpiece..."
                        className="w-full bg-white/[0.05] border border-transparent focus:border-white/10 focus:bg-white/[0.08] text-white text-[11px] uppercase tracking-[0.2em] font-medium py-4 pl-14 pr-6 rounded-xl outline-none transition-all duration-500 placeholder:text-white/20"
                    />
                </div>

                <div className="flex flex-col sm:flex-row items-center gap-2 w-full md:w-auto md:min-w-[400px]">
                    <CollectionDropdown collections={collections} selectedCollections={selectedCollections} handleCollectionToggle={handleCollectionToggle} />
                    <div className="h-8 w-px bg-white/10 hidden md:block" />
                    <FilterSortDropdown sortOrder={sortOrder} setSortOrder={setSortOrder} />
                </div>
            </div>
        </div>

        <div className="flex items-center flex-wrap gap-3 px-2">
            {(selectedCollections.length > 0 || searchQuery) && (
                <>
                    <span className="text-[9px] uppercase tracking-[0.3em] font-bold text-white/20 mr-2">Refining by:</span>
                    {searchQuery && (
                        <FilterTag onRemove={() => setSearchQuery('')}>
                            Search: {searchQuery}
                        </FilterTag>
                    )}
                    {selectedCollections.map(slug => (
                        <FilterTag key={slug} onRemove={() => removeCollectionFilter(slug)}>
                            {collections.find(c => c.slug === slug)?.name || slug}
                        </FilterTag>
                    ))}
                    <button
                        onClick={clearFilters}
                        className="text-[9px] uppercase tracking-[0.3em] font-bold text-attire-accent hover:text-white transition-colors duration-300 ml-2"
                    >
                        Reset All
                    </button>
                </>
            )}
        </div>
    </div>
);

const CollectionDropdown: React.FC<{ collections: any[]; selectedCollections: string[]; handleCollectionToggle: (slug: string) => void }> = ({ collections, selectedCollections, handleCollectionToggle }) => {
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
        <div ref={dropdownRef} className="w-full md:flex-1">
            <button
                onClick={() => setIsOpen(!isOpen)}
                className={`w-full px-6 py-4 text-[10px] font-bold uppercase tracking-[0.2em] transition-all duration-500 flex items-center justify-between gap-3 rounded-xl ${isOpen ? 'bg-white/10 text-white' : 'text-white/40 hover:text-white hover:bg-white/5'}`}
            >
                <div className="flex items-center gap-3 truncate">
                    <SlidersHorizontal size={14} className={selectedCollections.length > 0 ? 'text-attire-accent' : ''} />
                    <span className="truncate">{label}</span>
                </div>
                <ChevronDown size={14} className={`flex-shrink-0 transition-transform duration-500 ${isOpen ? 'rotate-180' : ''}`} />
            </button>
            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ opacity: 0, y: 10, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 10, scale: 0.95 }}
                        className="absolute left-0 right-0 mt-3 bg-[#0a0a0a] border border-white/10 rounded-2xl p-6 z-[300] backdrop-blur-2xl shadow-2xl"
                    >
                        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3">
                            {collections.map(c => (
                                <button
                                    key={c.id}
                                    onClick={() => { handleCollectionToggle(c.slug); }}
                                    className={`w-full px-5 py-4 text-[10px] uppercase tracking-[0.1em] font-bold text-left rounded-xl transition-all duration-300 border ${selectedCollections.includes(c.slug) ? 'bg-attire-accent border-attire-accent text-black' : 'text-white/40 border-white/5 hover:text-white hover:bg-white/5 hover:border-white/10'}`}
                                >
                                    {c.name}
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
        <div ref={dropdownRef} className="w-full md:flex-1">
            <button
                onClick={() => setIsOpen(!isOpen)}
                className={`w-full px-6 py-4 text-[10px] font-bold uppercase tracking-[0.2em] transition-all duration-500 flex items-center justify-between gap-3 rounded-xl ${isOpen ? 'bg-white/10 text-white' : 'text-white/40 hover:text-white hover:bg-white/5'}`}
            >
                <span className="truncate">{label}</span>
                <ChevronDown size={14} className={`flex-shrink-0 transition-transform duration-500 ${isOpen ? 'rotate-180' : ''}`} />
            </button>
            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ opacity: 0, y: 10, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 10, scale: 0.95 }}
                        className="absolute left-0 right-0 md:left-auto md:right-0 mt-3 w-full md:w-64 bg-[#0a0a0a] border border-white/10 rounded-2xl p-2 z-[300] backdrop-blur-2xl shadow-2xl"
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
    <div className="flex items-center gap-2 bg-white/5 border border-white/10 text-white rounded-lg pl-4 pr-2 py-2 text-[9px] font-bold uppercase tracking-widest group hover:border-white/20 transition-all duration-300">
        <span className="opacity-60 group-hover:opacity-100 transition-opacity">{children}</span>
        <button
            onClick={onRemove}
            className="p-1 hover:bg-white/10 rounded-md transition-colors text-white/30 hover:text-white"
        >
            <X size={12} />
        </button>
    </div>
);

export default ProductListPage;
