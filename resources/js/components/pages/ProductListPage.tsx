import React, { useState, useEffect, useRef, useMemo } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { motion as m, AnimatePresence } from 'framer-motion';
import { ChevronLeft, ChevronRight, Search, X, ChevronDown, Check, ArrowUpDown } from 'lucide-react';
// @ts-ignore
import GrainOverlay from '../common/GrainOverlay';
import { useProducts, useCollections, useCategories } from '../../hooks/useProducts';
import { Product, Collection, Category } from '../../types';

const motion = m as any;
import ItemCard from './collections/ItemCard';
import useDebounce from '../../hooks/useDebounce';

// --- Type Definitions ---
interface SortOption {
    value: string;
    label: string;
}

const sortOptions: SortOption[] = [
    { value: 'category', label: 'By Category' },
    { value: 'popularity', label: 'Most Popular' },
    { value: 'newest', label: 'Newest Arrivals' },
    { value: 'price_low', label: 'Price: Low to High' },
    { value: 'price_high', label: 'Price: High to Low' },
    { value: 'name_asc', label: 'Name: A to Z' },
];

const ProductListPage: React.FC = () => {
    const [searchParams, setSearchParams] = useSearchParams();
    // navigate removed as it was unused

    // -- Derived State from URL --
    const selectedCollections = useMemo(() =>
        searchParams.get('collection')?.split(',').filter(c => c.trim() !== '') || [],
        [searchParams]);

    const selectedCategory = searchParams.get('category') || '';
    const sortOrder = searchParams.get('sort') || 'newest';
    const currentPage = parseInt(searchParams.get('page') || '1', 10);
    const urlSearchTerm = searchParams.get('search') || '';

    // Local state for search input to allow typing without immediate URL update
    const [searchTerm, setSearchTerm] = useState<string>(urlSearchTerm);

    // Sync URL search to local state (e.g. Back button)
    useEffect(() => {
        setSearchTerm(urlSearchTerm);
    }, [urlSearchTerm]);

    // Debounce search term for URL update
    const debouncedSearchTerm = useDebounce(searchTerm, 500);

    // Sync debounced search to URL
    useEffect(() => {
        if (debouncedSearchTerm !== urlSearchTerm) {
            setSearchParams(prev => {
                const newParams = new URLSearchParams(prev);
                if (debouncedSearchTerm) {
                    newParams.set('search', debouncedSearchTerm);
                } else {
                    newParams.delete('search');
                }
                newParams.set('page', '1'); // Reset to page 1 on search change
                return newParams;
            }, { replace: true });
        }
    }, [debouncedSearchTerm, urlSearchTerm, setSearchParams]);

    // -- Fetch Data using React Query --
    const { data: collectionsData } = useCollections();
    const collections = collectionsData || [];

    const { data: categoriesData } = useCategories();
    const categories = categoriesData || [];

    const { data: productsData, isLoading } = useProducts({
        page: currentPage,
        sort: sortOrder,
        collection: selectedCollections.length > 0 ? selectedCollections.join(',') : undefined,
        category: selectedCategory || undefined,
        search: debouncedSearchTerm || undefined,
        per_page: 12, // 12 items for matching grid columns (2, 3, 4)
    });

    const products = productsData?.data || [];
    const meta = productsData?.meta;

    // -- Handlers --
    const updateParams = (updates: Record<string, string | null>) => {
        setSearchParams(prev => {
            const newParams = new URLSearchParams(prev);
            Object.entries(updates).forEach(([key, value]) => {
                if (value === null || value === '') newParams.delete(key);
                else newParams.set(key, value);
            });
            // Reset page on filter change (unless page is the update)
            if (!updates.hasOwnProperty('page')) {
                newParams.set('page', '1');
            }
            return newParams;
        }, { replace: true });
    };

    const handleCollectionToggle = (slug: string) => {
        const newSelection = selectedCollections.includes(slug)
            ? selectedCollections.filter(s => s !== slug)
            : [...selectedCollections, slug];
        updateParams({ collection: newSelection.join(',') });
    };

    const handleCategoryChange = (slug: string) => {
        updateParams({ category: slug === selectedCategory ? null : slug });
    };

    const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setSearchTerm(e.target.value);
    };

    const handleSortChange = (newSort: string) => {
        updateParams({ sort: newSort });
    };

    const clearFilters = () => {
        setSearchParams({ sort: 'newest', page: '1' }, { replace: true });
        setSearchTerm('');
    };

    const removeCollectionFilter = (slug: string) => {
        const newSelection = selectedCollections.filter(s => s !== slug);
        updateParams({ collection: newSelection.join(',') });
    };

    const removeCategoryFilter = () => {
        updateParams({ category: null });
    };

    const handlePageChange = (newPage: number) => {
        if (meta && newPage >= 1 && newPage <= meta.last_page) {
            updateParams({ page: newPage.toString() });
            window.scrollTo({ top: 0, behavior: 'smooth' });
        }
    };

    // -- Derived UI State --
    const pageTitle = useMemo(() => {
        if (debouncedSearchTerm) return `Results for "${debouncedSearchTerm}"`;
        if (selectedCategory) {
             const cat = categories.find(c => c.slug === selectedCategory);
             return cat ? cat.name : 'Category';
        }
        if (selectedCollections.length === 1) {
            const col = collections.find(c => c.slug === selectedCollections[0]);
            return col ? col.name : 'Collection';
        }
        return "All Products";
    }, [selectedCollections, selectedCategory, debouncedSearchTerm, collections, categories]);

    // -- Animation Configs --
    const pageMotion = {
        initial: { opacity: 0, y: 20 },
        animate: { opacity: 1, y: 0, transition: { duration: 0.8, ease: [0.22, 1, 0.36, 1] } },
        exit: { opacity: 0, y: -20, transition: { duration: 0.4, ease: [0.22, 1, 0.36, 1] } }
    };

    return (
        <motion.div
            className="min-h-screen bg-attire-navy relative selection:bg-attire-accent selection:text-white"
            initial="initial"
            animate="animate"
            exit="exit"
            variants={pageMotion}
        >
            <GrainOverlay />

            <style>
                {`
                    .no-scrollbar::-webkit-scrollbar { display: none; }
                    .no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
                `}
            </style>

            <header className="relative z-10 pt-32 pb-16 sm:pt-48 sm:pb-24 px-6 text-center">
                <motion.div
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
                    className="max-w-4xl mx-auto"
                >
                    <div className="flex items-center justify-center gap-4 mb-8">
                        <div className="h-px w-8 bg-attire-accent/30" />
                        <span className="text-attire-accent text-[10px] tracking-[0.6em] uppercase font-bold text-center">
                            {selectedCategory ? 'Category' : selectedCollections.length > 0 ? 'Collection' : 'Gallery'}
                        </span>
                        <div className="h-px w-8 bg-attire-accent/30" />
                    </div>

                    <h1 className="font-serif text-5xl md:text-7xl lg:text-[6rem] font-light text-white mb-10 leading-[0.9] tracking-tighter italic break-words">
                        {pageTitle}
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
                {/* Controls Bar */}
                <div className="z-[100] relative md:sticky md:top-24 mb-20 pointer-events-auto">
                    <Controls
                        searchTerm={searchTerm}
                        handleSearchChange={handleSearchChange}
                        sortOrder={sortOrder}
                        setSortOrder={handleSortChange}
                        selectedCollections={selectedCollections}
                        handleCollectionToggle={handleCollectionToggle}
                        selectedCategory={selectedCategory}
                        handleCategoryChange={handleCategoryChange}
                        clearFilters={clearFilters}
                        removeCollectionFilter={removeCollectionFilter}
                        removeCategoryFilter={removeCategoryFilter}
                        allCollections={collections}
                        allCategories={categories}
                    />
                </div>

                <AnimatePresence mode='wait'>
                    {isLoading ? (
                        <motion.div
                            key="loading"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="flex justify-center items-center py-32"
                        >
                            <div className="w-12 h-12 border-2 border-white/20 border-t-attire-accent rounded-full animate-spin" />
                        </motion.div>
                    ) : products.length > 0 ? (
                        <motion.div
                            key="grid"
                            className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-8 lg:gap-12"
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0 }}
                            transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
                        >
                            {products.map((item: Product) => (
                                <ItemCard
                                    key={item.id}
                                    product={item}
                                />
                            ))}
                        </motion.div>
                    ) : (
                        <motion.div
                            key="empty"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
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

                {/* Pagination */}
                {meta && meta.last_page > 1 && (
                    <div className="flex justify-center items-center gap-12 mt-32">
                        <button
                            onClick={() => handlePageChange(currentPage - 1)}
                            disabled={currentPage === 1}
                            className="group flex flex-col items-center gap-4 text-white/20 hover:text-white disabled:opacity-0 transition-all duration-700 disabled:pointer-events-none"
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
                                {meta.last_page.toString().padStart(2, '0')}
                            </div>
                        </div>

                        <button
                            onClick={() => handlePageChange(currentPage + 1)}
                            disabled={currentPage === meta.last_page}
                            className="group flex flex-col items-center gap-4 text-white/20 hover:text-white disabled:opacity-0 transition-all duration-700 disabled:pointer-events-none"
                        >
                            <ChevronRight size={24} strokeWidth={1} className="group-hover:translate-x-4 transition-transform duration-700" />
                            <span className="text-[8px] uppercase tracking-[0.4em] font-bold">Next Page</span>
                        </button>
                    </div>
                )}
            </main>
        </motion.div>
    );
};

// --- Sub-Components ---

interface ControlsProps {
    searchTerm: string;
    handleSearchChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
    sortOrder: string;
    setSortOrder: (sort: string) => void;
    selectedCollections: string[];
    handleCollectionToggle: (slug: string) => void;
    selectedCategory: string;
    handleCategoryChange: (slug: string) => void;
    clearFilters: () => void;
    removeCollectionFilter: (slug: string) => void;
    removeCategoryFilter: () => void;
    allCollections: Collection[];
    allCategories: Category[];
}

const Controls: React.FC<ControlsProps> = ({
    searchTerm,
    handleSearchChange,
    sortOrder,
    setSortOrder,
    selectedCollections,
    handleCollectionToggle,
    selectedCategory,
    handleCategoryChange,
    clearFilters,
    removeCollectionFilter,
    removeCategoryFilter,
    allCollections,
    allCategories
}) => {
    const hasActiveFilters = selectedCollections.length > 0 || selectedCategory || searchTerm;

    return (
        <div className="w-full max-w-7xl mx-auto relative z-50 px-4">
            {/* Main Floating Bar - Mirror effect */}
            <motion.div
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
                className="bg-[#050810]/60 backdrop-blur-2xl border border-white/20 rounded-2xl shadow-2xl flex flex-col md:flex-row items-stretch md:items-center p-3 gap-3 md:gap-6"
            >
                {/* Search Section */}
                <div className="relative flex-grow md:max-w-xs group">
                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                        <Search size={18} className="text-white/50 group-focus-within:text-attire-accent transition-colors duration-300" />
                    </div>
                    <input
                        type="text"
                        value={searchTerm}
                        onChange={handleSearchChange}
                        placeholder="Search products..."
                        className="w-full bg-white/10 hover:bg-white/15 focus:bg-white border border-white/5 focus:border-white focus:text-black rounded-xl py-3.5 pl-12 pr-10 text-sm font-medium text-white placeholder-white/50 focus:placeholder-black/40 focus:ring-0 focus:outline-none transition-all duration-300"
                    />
                    {searchTerm && (
                        <button
                            onClick={() => handleSearchChange({ target: { value: '' } } as any)}
                            className="absolute inset-y-0 right-0 pr-3 flex items-center text-white/50 group-focus-within:text-black/50 hover:text-white transition-colors"
                        >
                            <X size={16} />
                        </button>
                    )}
                </div>

                {/* Divider (Desktop) */}
                <div className="hidden md:block w-px h-10 bg-white/10" />

                {/* Filters Row - Added relative z-20 to overlay Sort Section on mobile */}
                <div className="relative z-20 flex flex-1 items-center gap-3 flex-wrap pb-2 md:pb-0">
                    <Dropdown
                        label="Collection"
                        activeCount={selectedCollections.length}
                    >
                        {allCollections.map(collection => (
                            <DropdownItem
                                key={collection.id}
                                label={collection.name}
                                isSelected={selectedCollections.includes(collection.slug)}
                                onClick={() => handleCollectionToggle(collection.slug)}
                                count={selectedCollections.includes(collection.slug) ? 1 : 0}
                            />
                        ))}
                    </Dropdown>

                    <Dropdown
                        label="Category"
                        activeCount={selectedCategory ? 1 : 0}
                        activeLabel={allCategories.find(c => c.slug === selectedCategory)?.name}
                    >
                        {allCategories.map(category => (
                            <DropdownItem
                                key={category.id}
                                label={category.name}
                                isSelected={selectedCategory === category.slug}
                                onClick={() => handleCategoryChange(category.slug)}
                            />
                        ))}
                    </Dropdown>
                </div>

                {/* Sort Section - Added relative z-10 */}
                <div className="relative z-10 md:ml-auto border-t md:border-t-0 md:border-l border-white/10 pt-3 md:pt-0 md:pl-6">
                     <SortDropdown sortOrder={sortOrder} setSortOrder={setSortOrder} />
                </div>
            </motion.div>

            {/* Active Filters Display */}
            <AnimatePresence>
                {hasActiveFilters && (
                    <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        className="overflow-hidden"
                    >
                        <div className="flex flex-wrap items-center gap-3 mt-4 px-2">
                            <span className="text-[10px] text-white/60 uppercase tracking-widest font-bold mr-2">
                                Active Filters:
                            </span>

                            {searchTerm && (
                                <ActiveFilterChip label={`Search: ${searchTerm}`} onRemove={() => handleSearchChange({ target: { value: '' } } as any)} />
                            )}

                            {selectedCategory && (
                                <ActiveFilterChip
                                    label={allCategories.find(c => c.slug === selectedCategory)?.name || selectedCategory}
                                    onRemove={removeCategoryFilter}
                                />
                            )}

                            {selectedCollections.map(slug => (
                                <ActiveFilterChip
                                    key={slug}
                                    label={allCollections.find(c => c.slug === slug)?.name || slug}
                                    onRemove={() => removeCollectionFilter(slug)}
                                />
                            ))}

                            <button
                                onClick={clearFilters}
                                className="ml-auto text-[10px] uppercase tracking-widest font-bold text-red-400 hover:text-red-300 transition-colors py-1 px-3"
                            >
                                Clear All
                            </button>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

// --- Sub-Components ---

// 1. Reusable Dropdown Component
interface DropdownProps {
    label: string;
    activeCount?: number;
    activeLabel?: string;
    children: React.ReactNode;
}

const Dropdown: React.FC<DropdownProps> = ({ label, activeCount = 0, activeLabel, children }) => {
    const [isOpen, setIsOpen] = useState(false);
    const containerRef = useRef<HTMLDivElement>(null);

    // Close on click outside
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, [isOpen]);

    const isActive = activeCount > 0;
    const displayText = activeLabel || (activeCount > 0 ? `${label} (${activeCount})` : label);

    return (
        <div className={`relative shrink-0 w-[140px] md:w-[160px] lg:w-[180px] ${isOpen ? 'z-[100]' : 'z-auto'}`} ref={containerRef}>
            <button
                onClick={() => setIsOpen(!isOpen)}
                className={`
                    w-full flex items-center justify-between gap-2 px-4 md:px-5 py-3 rounded-xl text-[10px] font-bold uppercase tracking-widest transition-all duration-300 border
                    ${isOpen || isActive
                        ? 'bg-white text-black border-white shadow-lg shadow-white/10'
                        : 'bg-white/10 text-white/80 border-transparent hover:bg-white/20 hover:text-white'
                    }
                `}
            >
                <span className="truncate text-left flex-1">{displayText}</span>
                <ChevronDown size={14} className={`shrink-0 transition-transform duration-300 ${isOpen ? 'rotate-180' : ''}`} />
            </button>

            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ opacity: 0, y: 8, scale: 0.98 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 8, scale: 0.98 }}
                        transition={{ duration: 0.2 }}
                        className="absolute left-0 mt-3 w-72 max-h-96 overflow-y-auto custom-scrollbar bg-[#050810] border border-white/30 rounded-xl shadow-2xl shadow-black/80 z-[999] p-2"
                    >
                        <div className="flex flex-col gap-1">
                            {children}
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

// 2. Dropdown Item Component
interface DropdownItemProps {
    label: string;
    isSelected: boolean;
    onClick: () => void;
    count?: number;
}

const DropdownItem: React.FC<DropdownItemProps> = ({ label, isSelected, onClick }) => (
    <button
        onClick={onClick}
        className={`
            w-full flex items-center justify-between px-4 py-3 rounded-lg text-[10px] font-bold uppercase tracking-widest text-left transition-all
            ${isSelected
                ? 'bg-attire-accent text-white shadow-lg shadow-attire-accent/20'
                : 'text-white/70 hover:bg-white/10 hover:text-white'
            }
        `}
    >
        <span>{label}</span>
        {isSelected && <Check size={14} />}
    </button>
);

// 3. Sort Dropdown Component
interface SortDropdownProps {
    sortOrder: string;
    setSortOrder: (sort: string) => void;
}

const SortDropdown: React.FC<SortDropdownProps> = ({ sortOrder, setSortOrder }) => {
    const [isOpen, setIsOpen] = useState(false);
    const containerRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        };
        if (isOpen) document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, [isOpen]);

    const isFiltered = sortOrder !== 'newest';
    const activeLabel = sortOptions.find(opt => opt.value === sortOrder)?.label || 'Sort By';

    return (
        <div className={`relative w-full shrink-0 md:w-[180px] lg:w-[200px] ${isOpen ? 'z-[100]' : 'z-auto'}`} ref={containerRef}>
            <button
                onClick={() => setIsOpen(!isOpen)}
                className={`
                    w-full flex items-center justify-between gap-4 px-4 md:px-5 py-3 rounded-xl text-[10px] font-bold uppercase tracking-widest transition-all duration-300 border
                    ${isOpen || isFiltered
                        ? 'bg-white text-black border-white shadow-lg shadow-white/10'
                        : 'bg-white/5 text-white/50 border-white/5 hover:bg-white/10 hover:text-white hover:border-white/20'
                    }
                `}
            >
                <div className="flex items-center gap-2.5 truncate flex-1">
                    <ArrowUpDown size={14} className={`shrink-0 ${isOpen || isFiltered ? 'text-black' : 'text-white/30'}`} />
                    <span className="truncate text-left">{activeLabel}</span>
                </div>
                <ChevronDown size={14} className={`shrink-0 transition-transform duration-300 ${isOpen ? 'rotate-180' : ''}`} />
            </button>

            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ opacity: 0, y: 8, scale: 0.98 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 8, scale: 0.98 }}
                        transition={{ duration: 0.2 }}
                        className="absolute right-0 mt-3 w-full md:w-64 bg-[#050810] border border-white/30 rounded-xl shadow-2xl shadow-black/80 z-[999] p-2"
                    >
                        <div className="flex flex-col gap-1">
                            {sortOptions.map(option => (
                                <button
                                    key={option.value}
                                    onClick={() => {
                                        setSortOrder(option.value);
                                        setIsOpen(false);
                                    }}
                                    className={`
                                        w-full flex items-center justify-between px-4 py-3 rounded-lg text-[10px] font-bold uppercase tracking-widest text-left transition-all
                                        ${sortOrder === option.value
                                            ? 'bg-attire-accent text-white shadow-lg shadow-attire-accent/20'
                                            : 'text-white/50 hover:bg-white/5 hover:text-white'
                                        }
                                    `}
                                >
                                    <span>{option.label}</span>
                                    {sortOrder === option.value && <Check size={14} />}
                                </button>
                            ))}
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

// 4. Active Filter Chip Component
interface ActiveFilterChipProps {
    label: string;
    onRemove: () => void;
}

const ActiveFilterChip: React.FC<ActiveFilterChipProps> = ({ label, onRemove }) => (
    <motion.div
        layout
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.8 }}
        className="flex items-center gap-2 bg-white border border-white text-black rounded-full pl-3 pr-2 py-1.5 text-[9px] font-bold uppercase tracking-wider shadow-lg shadow-white/10"
    >
        <span className="opacity-90">{label}</span>
        <button
            onClick={onRemove}
            className="p-0.5 hover:bg-black/10 rounded-full transition-colors"
        >
            <X size={12} className="text-black/50 hover:text-black" />
        </button>
    </motion.div>
);

export default ProductListPage;
