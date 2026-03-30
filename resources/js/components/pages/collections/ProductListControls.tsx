import React, { useState, useEffect, useRef, memo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search as SearchIcon, SlidersHorizontal, ChevronDown, X } from 'lucide-react';

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

export const ProductListControls: React.FC<ControlsProps> = memo(({ 
    sortOrder, 
    setSortOrder, 
    searchQuery, 
    setSearchQuery, 
    selectedCollections, 
    collections, 
    handleCollectionToggle, 
    clearFilters, 
    removeCollectionFilter 
}) => (
    <div className="w-full max-w-6xl mx-auto space-y-6">
        <div className="relative group z-[999]">
            {/* Background Container */}
            <div className="absolute inset-0 bg-black/40 border border-white/5 rounded-2xl backdrop-blur-md transition-all duration-500 pointer-events-none" />

            {/* Content Container */}
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
                <div className="flex flex-col sm:flex-row items-center gap-2 w-full md:w-auto md:min-w-[400px]">
                    <CollectionDropdown collections={collections} selectedCollections={selectedCollections} handleCollectionToggle={handleCollectionToggle} />
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
                            {collections.find(c => c.slug === slug)?.name || slug}
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
));

const CollectionDropdown: React.FC<{ collections: any[]; selectedCollections: string[]; handleCollectionToggle: (slug: string) => void }> = memo(({ collections, selectedCollections, handleCollectionToggle }) => {
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
                        className="absolute left-0 right-0 mt-3 bg-attire-navy border border-white/10 rounded-2xl p-6 z-[300] backdrop-blur-xl"
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
});

const FilterSortDropdown: React.FC<{ sortOrder: string; setSortOrder: (order: string) => void }> = memo(({ sortOrder, setSortOrder }) => {
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
                        className="absolute left-0 right-0 md:left-auto md:right-0 mt-3 w-full md:w-64 bg-attire-navy border border-white/10 rounded-2xl p-2 z-[300] backdrop-blur-xl"
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
});

interface FilterTagProps {
    children: React.ReactNode;
    onRemove: () => void;
}

const FilterTag: React.FC<FilterTagProps> = memo(({ children, onRemove }) => (
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
));
