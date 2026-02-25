import React, { useState, useMemo, useEffect, useRef } from 'react';
import { useLocation, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronLeft, Search, X, ChevronDown, Loader2 } from 'lucide-react';
import ItemCard from './collections/ItemCard';
import GrainOverlay from '../common/GrainOverlay.jsx';
import SEO from '../common/SEO';
import { useProducts } from '../../hooks/useProducts';
import { Product } from '../../types';

interface CollectionOption {
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

    const [sortOrder, setSortOrder] = useState<string>('newest');
    const [selectedCollections, setSelectedCollections] = useState<string[]>(() => {
        return collectionQuery ? [collectionQuery] : [];
    });

    const productsPerPage = 12; // Number of products to load per batch
    const [currentLoadedPage, setCurrentLoadedPage] = useState<number>(1);
    const [allLoadedProducts, setAllLoadedProducts] = useState<Product[]>([]);
    const [hasMore, setHasMore] = useState<boolean>(true);

    const { data, isLoading, isFetching } = useProducts({
        category: selectedCollections[0],
        sort: sortOrder,
        page: currentLoadedPage,
        per_page: productsPerPage
    });

    const meta = data?.meta || { total: 0, last_page: 1, current_page: 1 };

    useEffect(() => {
        // Reset state when filters or sort order changes
        setAllLoadedProducts([]);
        setCurrentLoadedPage(1);
        setHasMore(true);
        
        if (currentLoadedPage === 1) {
            window.scrollTo({ top: 0, behavior: 'smooth' });
        }
    }, [selectedCollections, sortOrder]);

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
            : "Elite Collections";
    }, [selectedCollections]);

    const handleCollectionToggle = (slug: string) => {
        setSelectedCollections(prev => prev.includes(slug) ? [] : [slug]);
    };

    const clearFilters = () => {
        setSelectedCollections([]);
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
                title={`${pageTitle} | Bespoke Menswear`}
                description={`Explore our ${pageTitle}. Hand-crafted luxury garments designed for the modern gentleman.`}
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
                <div className="z-40 sticky top-24 mb-20">
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
    selectedCollections: string[];
    handleCollectionToggle: (slug: string) => void;
    clearFilters: () => void;
    removeCollectionFilter: (slug: string) => void;
}

const Controls: React.FC<ControlsProps> = ({ sortOrder, setSortOrder, selectedCollections, handleCollectionToggle, clearFilters, removeCollectionFilter }) => (
    <div className="w-full max-w-6xl mx-auto relative">
        <div className="bg-attire-navy/80 backdrop-blur-xl border border-white/20 rounded-full p-1.5 flex items-center justify-between">
            <CollectionDropdown selectedCollections={selectedCollections} handleCollectionToggle={handleCollectionToggle} />
            <FilterSortDropdown sortOrder={sortOrder} setSortOrder={setSortOrder} />
        </div>
        {selectedCollections.length > 0 && (
            <div className="flex items-center flex-wrap gap-2 mt-6 px-6">
                {selectedCollections.map(slug => (
                    <FilterTag key={slug} onRemove={() => removeCollectionFilter(slug)}>
                        {allCollections.find(c => c.slug === slug)?.title || slug}
                    </FilterTag>
                ))}
                <button onClick={clearFilters} className="text-[9px] uppercase tracking-[0.2em] font-bold text-white bg-red-900 px-4 py-2 rounded-full">Clear All</button>
            </div>
        )}
    </div>
);

interface DropdownProps {
    selectedCollections: string[];
    handleCollectionToggle: (slug: string) => void;
}

const CollectionDropdown: React.FC<DropdownProps> = ({ selectedCollections, handleCollectionToggle }) => {
    const [isOpen, setIsOpen] = useState(false);
    const dropdownRef = useRef<HTMLDivElement>(null);
    const label = selectedCollections.length === 0 ? 'All Collections' : allCollections.find(c => c.slug === selectedCollections[0])?.title || 'Selected';

    return (
        <div ref={dropdownRef} className="relative">
            <button onClick={() => setIsOpen(!isOpen)} className="px-6 py-2.5 text-[10px] font-bold uppercase tracking-[0.2em] text-white/60 hover:text-white flex items-center gap-2">
                {label} <ChevronDown size={14} className={isOpen ? 'rotate-180' : ''} />
            </button>
            {isOpen && (
                <div className="absolute left-0 mt-4 w-64 bg-[#050810] border border-white/10 rounded-2xl py-2 z-[300]">
                    {allCollections.map(c => (
                        <button key={c.id} onClick={() => { handleCollectionToggle(c.slug); setIsOpen(false); }} className={`w-full px-6 py-3 text-[10px] uppercase font-bold text-left ${selectedCollections.includes(c.slug) ? 'text-attire-accent' : 'text-white/40 hover:text-white'}`}>
                            {c.title}
                        </button>
                    ))}
                </div>
            )}
        </div>
    );
};

interface SortDropdownProps {
    sortOrder: string;
    setSortOrder: (order: string) => void;
}

const FilterSortDropdown: React.FC<SortDropdownProps> = ({ sortOrder, setSortOrder }) => {
    const [isOpen, setIsOpen] = useState(false);
    const label = sortOptions.find(opt => opt.value === sortOrder)?.label || 'Sort By';

    return (
        <div className="relative">
            <button onClick={() => setIsOpen(!isOpen)} className="px-6 py-2.5 text-[10px] font-bold uppercase tracking-[0.2em] text-white/60 hover:text-white flex items-center gap-2">
                {label} <ChevronDown size={14} className={isOpen ? 'rotate-180' : ''} />
            </button>
            {isOpen && (
                <div className="absolute right-0 mt-4 w-56 bg-[#050810] border border-white/10 rounded-2xl py-2 z-[300]">
                    {sortOptions.map(opt => (
                        <button key={opt.value} onClick={() => { setSortOrder(opt.value); setIsOpen(false); }} className={`w-full px-6 py-3 text-[10px] uppercase font-bold text-left ${sortOrder === opt.value ? 'text-attire-accent' : 'text-white/40 hover:text-white'}`}>
                            {opt.label}
                        </button>
                    ))}
                </div>
            )}
        </div>
    );
};

interface FilterTagProps {
    children: React.ReactNode;
    onRemove: () => void;
}

const FilterTag: React.FC<FilterTagProps> = ({ children, onRemove }) => (
    <div className="flex items-center gap-3 bg-attire-dark border border-white/10 text-white rounded-full pl-4 pr-2 py-1.5 text-[10px] font-bold">
        <span className="opacity-60">{children}</span>
        <button onClick={onRemove} className="p-1 hover:bg-white/10 rounded-full"><X size={12} /></button>
    </div>
);

export default ProductListPage;
