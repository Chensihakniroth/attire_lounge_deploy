import React, { useState, useEffect, useMemo, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
    Search, 
    Filter, 
    Check, 
    ChevronDown, 
    Package, 
    Hash, 
    Tag, 
    Info, 
    DollarSign,
    Barcode,
    Layers,
    Activity,
    X
} from 'lucide-react';
import { LumaSpin } from '@/components/ui/luma-spin';
import axios from 'axios';
import { usePOS } from './POSContext';

// --- Animation Variants ---
// Animations removed for performance on large lists

// --- Sub-Components ---

const ProductLogRow = React.memo(React.forwardRef(({ product, isSelected, onToggleSelect }, ref) => {
    return (
        <div 
            ref={ref}
            className="border-b border-black/5 dark:border-[#30363d] last:border-0 hover:z-10 relative"
            onClick={() => onToggleSelect(product)}
        >
            <div
                className={`w-full min-h-13 flex items-center transition-all cursor-pointer hover:bg-black/[0.02] dark:hover:bg-[#161b22] active:bg-black/[0.04] dark:active:bg-[#0d1117] ${isSelected ? 'bg-[#0d3542]/10 dark:bg-[#f5a81c]/10' : ''}`}
            >
                {/* Selection Indicator Bar - Absolute to prevent shifting */}
                {isSelected && <div className="absolute left-0 top-0 bottom-0 w-1 bg-[#0d3542] dark:bg-[#f5a81c] z-10" />}

                {/* Custom Checkbox */}
                <div className="w-16 h-13 border-r border-black/5 dark:border-[#30363d] flex items-center justify-center transition-all flex-shrink-0">
                    <div className={`w-4 h-4 rounded-md border-2 flex items-center justify-center transition-all ${isSelected ? 'bg-[#0d3542] dark:bg-[#f5a81c] border-[#0d3542] dark:border-[#f5a81c]' : 'border-black/10 dark:border-[#30363d] group-hover:border-[#0d3542]/40 dark:group-hover:border-[#f5a81c]/40'}`}>
                        {isSelected && <Check size={10} className="text-white dark:text-black font-black" />}
                    </div>
                </div>

                <div className="w-32 border-r border-black/5 dark:border-[#30363d] px-4 h-13 flex items-center flex-shrink-0">
                    <div className={`px-2 py-0.5 rounded-lg text-[11px] font-black uppercase tracking-widest ${
                        product.stock_qty > 0 
                            ? 'bg-green-500/10 text-green-500 dark:text-green-400' 
                            : 'bg-red-500/10 text-red-500 dark:text-red-400'
                    }`}>
                        {product.stock_qty > 0 ? 'In Stock' : 'Out Stock'}
                    </div>
                </div>

                <div className="w-40 border-r border-black/5 dark:border-[#30363d] px-5 h-13 flex items-center flex-shrink-0 font-mono text-[13px] font-black text-[#0d3542] dark:text-[#f5a81c] tracking-tighter truncate">
                    {product.sku}
                </div>

                <div className="flex-1 border-r border-black/5 dark:border-[#30363d] px-6 h-13 flex items-center min-w-0 overflow-hidden">
                    <p className={`text-[14px] font-black uppercase tracking-wider truncate transition-colors ${isSelected ? 'text-[#0d3542] dark:text-[#f5a81c]' : 'text-gray-900 dark:text-[#c9d1d9]'}`}>
                        {product.display_name || product.name}
                    </p>
                </div>

                <div className="w-28 border-r border-black/5 dark:border-[#30363d] px-4 h-13 flex items-center justify-center">
                    <span className={`font-mono text-[12px] font-black px-3 py-1 rounded-xl border ${product.stock_qty <= 5 ? 'bg-red-500/10 border-red-500/20 text-red-500' : 'bg-black/5 dark:bg-[#0d1117] border-black/10 dark:border-[#30363d] text-gray-500/60 dark:text-[#8b949e]/40'}`}>
                        {product.stock_qty}
                    </span>
                </div>

                <div className="w-36 px-6 h-13 flex items-center justify-end font-mono text-[16px] font-black text-gray-900 dark:text-[#c9d1d9] pr-8">
                    ${parseFloat(product.price).toLocaleString()}
                </div>
            </div>
        </div>
    );
}));

const FilterPanel = ({ filters, categories, onChange, totalResults, searchQuery, onSearchQueryChange }) => {
    const [isGroupOpen, setIsGroupOpen] = useState(false);
    const [dropUp, setDropUp] = useState(false);
    const triggerRef = useRef(null);
    const stockOptions = ["all", "in-stock", "out-of-stock"];

    const toggleFilter = (category, value) => {
        const current = Array.isArray(filters[category]) ? filters[category] : [filters[category]];
        const isSelected = current.includes(value);

        let updated;
        if (category === 'stockStatus') {
            updated = value;
        } else {
            updated = isSelected
                ? current.filter(entry => entry !== value)
                : [...current, value];
        }

        onChange({
            ...filters,
            [category]: updated,
        });
    };

    const clearAll = () => {
        onChange({
            categories: [],
            stockStatus: 'all',
            name: "",
            attribute: "",
            code: "",
        });
    };

    const hasActiveFilters = filters.categories.length > 0 || filters.stockStatus !== 'all' || filters.name || filters.attribute || filters.code;

    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="flex h-full flex-col space-y-8 overflow-y-auto bg-[#fdfdfc] dark:bg-[#0d1117] p-8 no-scrollbar"
        >
            <div className="flex items-center justify-between">
                <div>
                    <h3 className="text-[18px] font-black uppercase tracking-[0.25em] text-gray-900 dark:text-[#c9d1d9]">Filter</h3>
                    <p className="text-[10px] font-bold text-gray-400 dark:text-[#8b949e]/40 uppercase tracking-widest mt-1">{totalResults} matches</p>
                </div>
                {hasActiveFilters && (
                    <button
                        onClick={clearAll}
                        className="text-[10px] font-black uppercase tracking-widest text-[#0d3542] dark:text-[#f5a81c] hover:underline"
                    >
                        Reset
                    </button>
                )}
            </div>

            {/* Specialized Search Hub */}
            <div className="space-y-6">
                <div className="space-y-3">
                    <p className="text-[11px] font-black uppercase tracking-[0.2em] text-gray-400 dark:text-[#8b949e]/40 flex items-center gap-3">
                        <Tag size={12} /> Search Name
                    </p>
                    <div className="relative">
                        <input
                            type="text"
                            placeholder="PRODUCT NAME..."
                            value={filters.name || ""}
                            onChange={(e) => onChange({...filters, name: e.target.value})}
                            className="w-full bg-white dark:bg-[#161b22] border-2 border-black/5 dark:border-[#30363d] focus:border-[#0d3542] dark:focus:border-[#f5a81c] rounded-xl py-3.5 pl-5 pr-10 text-[12px] font-black uppercase tracking-widest outline-none transition-all text-gray-900 dark:text-[#c9d1d9] placeholder:text-gray-300 dark:placeholder:text-[#8b949e]/20"
                        />
                    </div>
                </div>

                <div className="space-y-3">
                    <p className="text-[11px] font-black uppercase tracking-[0.2em] text-gray-400 dark:text-[#8b949e]/40 flex items-center gap-3">
                        <Layers size={12} /> Search Attribute
                    </p>
                    <div className="relative">
                        <input
                            type="text"
                            placeholder="SIZE, FABRIC, ETC..."
                            value={filters.attribute || ""}
                            onChange={(e) => onChange({...filters, attribute: e.target.value})}
                            className="w-full bg-white dark:bg-[#161b22] border-2 border-black/5 dark:border-[#30363d] focus:border-[#0d3542] dark:focus:border-[#f5a81c] rounded-xl py-3.5 pl-5 pr-10 text-[12px] font-black uppercase tracking-widest outline-none transition-all text-gray-900 dark:text-[#c9d1d9] placeholder:text-gray-300 dark:placeholder:text-[#8b949e]/20"
                        />
                    </div>
                </div>

                <div className="space-y-3">
                    <p className="text-[11px] font-black uppercase tracking-[0.2em] text-gray-400 dark:text-[#8b949e]/40 flex items-center gap-3">
                        <Hash size={12} /> Search Code
                    </p>
                    <div className="relative">
                        <input
                            type="text"
                            placeholder="SKU OR ID..."
                            value={filters.code || ""}
                            onChange={(e) => onChange({...filters, code: e.target.value})}
                            className="w-full bg-white dark:bg-[#161b22] border-2 border-black/5 dark:border-[#30363d] focus:border-[#0d3542] dark:focus:border-[#f5a81c] rounded-xl py-3.5 pl-5 pr-10 text-[12px] font-black uppercase tracking-widest outline-none transition-all text-gray-900 dark:text-[#c9d1d9] placeholder:text-gray-300 dark:placeholder:text-[#8b949e]/20"
                        />
                    </div>
                </div>
            </div>

            {/* Availability */}
            <div className="space-y-4">
                <p className="text-[12px] font-black uppercase tracking-[0.2em] text-gray-400 dark:text-[#8b949e]/40 flex items-center gap-3">
                    <Activity size={14} /> Availability
                </p>
                <div className="space-y-2">
                    {stockOptions.map((opt) => {
                        const selected = filters.stockStatus === opt;
                        return (
                            <button
                                key={opt}
                                onClick={() => toggleFilter("stockStatus", opt)}
                                className={`flex w-full items-center justify-between px-6 py-4 rounded-xl border-2 text-[11px] font-black uppercase tracking-widest transition-all ${
                                    selected
                                        ? "border-[#0d3542] dark:border-[#f5a81c] bg-[#0d3542]/10 dark:bg-[#f5a81c]/10 text-[#0d3542] dark:text-[#f5a81c] shadow-none"
                                        : "border-transparent bg-white dark:bg-[#161b22] text-gray-500 dark:text-[#8b949e] hover:bg-black/5 dark:hover:bg-[#30363d]/50"
                                }`}
                            >
                                {opt.replace('-', ' ')}
                                {selected && <Check className="h-4 w-4" />}
                            </button>
                        );
                    })}
                </div>
            </div>

            {/* Product Group */}
            <div className="space-y-4">
                <p className="text-[12px] font-black uppercase tracking-[0.2em] text-gray-400 dark:text-[#8b949e]/40 flex items-center gap-3">
                    <Layers size={14} /> Product Group
                </p>
                <div className="relative" ref={triggerRef}>
                    <button
                        onClick={() => {
                            if (!isGroupOpen && triggerRef.current) {
                                const rect = triggerRef.current.getBoundingClientRect();
                                const spaceBelow = window.innerHeight - rect.bottom;
                                setDropUp(spaceBelow < 300); // Popup if less than 300px below
                            }
                            setIsGroupOpen(!isGroupOpen);
                        }}
                        className={`w-full flex items-center justify-between px-6 py-4 bg-white dark:bg-[#161b22] border-2 rounded-xl text-[13px] font-black uppercase tracking-widest transition-all ${isGroupOpen ? 'border-[#0d3542] dark:border-[#f5a81c] ring-4 ring-[#0d3542]/5 dark:ring-[#f5a81c]/5' : 'border-transparent text-gray-900 dark:text-[#c9d1d9] hover:bg-black/5 dark:hover:bg-[#30363d]/50'}`}
                    >
                        <span className="truncate">{filters.categories[0] || 'All Groups'}</span>
                        <motion.div
                            animate={{ rotate: isGroupOpen ? 180 : 0 }}
                            transition={{ duration: 0.2 }}
                        >
                            <ChevronDown size={18} className="text-[#0d3542] dark:text-[#f5a81c]" />
                        </motion.div>
                    </button>

                    <AnimatePresence>
                        {isGroupOpen && (
                            <>
                                <motion.div 
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    exit={{ opacity: 0 }}
                                    onClick={() => setIsGroupOpen(false)}
                                    className="fixed inset-0 z-40"
                                />
                                <motion.div
                                    initial={{ opacity: 0, y: dropUp ? 12 : -12, scale: 0.95 }}
                                    animate={{ opacity: 1, y: 0, scale: 1 }}
                                    exit={{ opacity: 0, y: dropUp ? 12 : -12, scale: 0.95 }}
                                    transition={{ duration: 0.2 }}
                                    className={`absolute ${dropUp ? 'bottom-full mb-3' : 'top-full mt-3'} left-0 right-0 bg-white dark:bg-[#161b22] border-2 border-black/10 dark:border-[#30363d] rounded-2xl shadow-none overflow-hidden z-50`}
                                >
                                    <div className="max-h-72 overflow-y-auto no-scrollbar py-2">
                                        <button 
                                            onClick={() => {
                                                onChange({ ...filters, categories: [] });
                                                setIsGroupOpen(false);
                                            }}
                                            className={`w-full px-6 py-4 text-[11px] font-black uppercase tracking-widest text-left transition-all flex items-center justify-between ${filters.categories.length === 0 ? 'bg-[#0d3542] dark:bg-[#f5a81c] text-white dark:text-black' : 'text-gray-400 dark:text-[#8b949e]/40 hover:bg-black/5 dark:hover:bg-[#30363d]/50'}`}
                                        >
                                            All Groups
                                            {filters.categories.length === 0 && <Check size={14} />}
                                        </button>
                                        <div className="h-px bg-black/5 dark:bg-[#30363d]/50 mx-3 my-1" />
                                        {categories.map((cat) => (
                                            <button
                                                key={cat}
                                                onClick={() => {
                                                    onChange({ ...filters, categories: [cat] });
                                                    setIsGroupOpen(false);
                                                }}
                                                className={`w-full px-6 py-5 text-[13px] font-black uppercase tracking-widest text-left transition-all flex items-center justify-between ${filters.categories.includes(cat) ? 'bg-[#0d3542] dark:bg-[#f5a81c] text-white dark:text-black' : 'text-gray-500 dark:text-[#8b949e] hover:bg-black/5 dark:hover:bg-[#30363d]/50 hover:text-[#0d3542] dark:hover:text-[#f5a81c]'}`}
                                            >
                                                {cat}
                                                {filters.categories.includes(cat) && <Check size={16} />}
                                            </button>
                                        ))}
                                    </div>
                                </motion.div>
                            </>
                        )}
                    </AnimatePresence>
                </div>
            </div>
        </motion.div>
    );
};

// --- Product Catalog ---

const ProductCatalog = ({ onSearchClick }) => {
    const { addItem, addItems } = usePOS();
    
    const initialFilters = {
        categories: [],
        stockStatus: 'all',
        name: "",
        attribute: "",
        code: "",
    };

    const getInitialCache = () => {
        if (window.__posProductCache) {
            const cacheKey = JSON.stringify(initialFilters);
            if (window.__posProductCache[cacheKey]) {
                return window.__posProductCache[cacheKey];
            }
        }
        return null;
    };

    const initialCache = getInitialCache();

    const [products, setProducts] = useState(initialCache || []);
    const [categories, setCategories] = useState(window.__posCategoryCache || []);
    const [loading, setLoading] = useState(!initialCache);
    const [filters, setFilters] = useState(initialFilters);
    const [selectedProducts, setSelectedProducts] = useState(new Map());
    const [isAnimating, setIsAnimating] = useState(true);

    useEffect(() => {
        // Defer rendering the full list until the modal animation completes (220ms matches modal transition)
        const timer = setTimeout(() => setIsAnimating(false), 220);
        return () => clearTimeout(timer);
    }, []);

    // Fetch categories
    useEffect(() => {
        const fetchCategories = async () => {
            if (window.__posCategoryCache && window.__posCategoryCache.length > 0) {
                setCategories(window.__posCategoryCache);
            }
            try {
                const response = await axios.get('/api/v1/admin/pos/products/categories');
                window.__posCategoryCache = response.data;
                setCategories(response.data);
            } catch (err) {
                console.error('Failed to fetch categories');
            }
        };
        fetchCategories();
    }, []);

    // Load data from API
    const fetchProducts = useCallback(async () => {
        const cacheKey = JSON.stringify(filters);
        
        if (!window.__posProductCache) window.__posProductCache = {};
        
        if (window.__posProductCache[cacheKey]) {
            setProducts(window.__posProductCache[cacheKey]);
            setLoading(false);
        } else {
            setLoading(true);
        }

        try {
            const response = await axios.get('/api/v1/admin/pos/products', {
                params: {
                    name: filters.name,
                    attribute: filters.attribute,
                    code: filters.code,
                    category: filters.categories.length > 0 ? filters.categories.join(',') : '',
                    in_stock: filters.stockStatus === 'in-stock' ? 1 : (filters.stockStatus === 'out-of-stock' ? 0 : ''),
                    per_page: 100
                }
            });
            window.__posProductCache[cacheKey] = response.data.data;
            setProducts(response.data.data);
        } catch (err) {
            console.error('Failed to fetch products');
        } finally {
            setLoading(false);
        }
    }, [filters]);

    const isFirstMount = useRef(true);

    useEffect(() => {
        if (isFirstMount.current) {
            fetchProducts();
            isFirstMount.current = false;
        } else {
            const timer = setTimeout(() => {
                fetchProducts();
            }, 250); // Reduced debounce for snappier searching
            return () => clearTimeout(timer);
        }
    }, [fetchProducts]);

    const clearAll = useCallback(() => {
        setFilters({
            categories: [],
            stockStatus: 'all',
            name: "",
            attribute: "",
            code: "",
        });
        setSelectedProducts(new Map());
    }, []);

    const toggleSelect = useCallback((product) => {
        setSelectedProducts(prevSelected => {
            const newSelected = new Map(prevSelected);
            if (newSelected.has(product.id)) {
                newSelected.delete(product.id);
            } else {
                newSelected.set(product.id, product);
            }
            return newSelected;
        });
    }, []);

    const handleBatchAdd = () => {
        addItems(Array.from(selectedProducts.values()));
        setSelectedProducts(new Map());
        if (onSearchClick) onSearchClick();
    };

    return (
        <div className="h-full w-full flex flex-col bg-[#fdfdfc] dark:bg-[#0d1117] overflow-hidden rounded-2xl border border-black/10 dark:border-[#30363d] shadow-none">
            {/* Header - Clean & Minimalist */}
            <div className="border-b-2 border-black/5 dark:border-[#30363d] bg-[#fdfdfc] dark:bg-[#0d1117] p-6 sticky top-0 z-30">
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-[20px] font-black uppercase tracking-[0.4em] text-gray-900 dark:text-[#c9d1d9] leading-none">Catalog</h1>
                        <p className="text-[11px] font-bold text-gray-400 dark:text-[#8b949e]/40 uppercase tracking-widest mt-2 flex items-center gap-3">
                            <Hash size={12} className="text-[#0d3542] dark:text-[#f5a81c]" /> Product Inventory System
                        </p>
                    </div>
                </div>
            </div>

            {/* Main Area */}
            <div className="flex flex-1 overflow-hidden">
                {/* Sidebar Filter Hub */}
                <div className="overflow-hidden border-r-2 border-black/5 dark:border-[#30363d] h-full w-[340px]">
                    <FilterPanel
                        filters={filters}
                        categories={categories}
                        onChange={setFilters}
                        totalResults={products.length}
                    />
                </div>

                <div className="flex-1 flex flex-col h-full bg-[#fdfdfc] dark:bg-[#0d1117]">
                    {/* List Header */}
                    <div className="bg-black/[0.02] dark:bg-[#161b22] border-b-2 border-black/5 dark:border-[#30363d] flex items-center text-[10px] font-black uppercase tracking-[0.3em] text-gray-400 dark:text-[#8b949e]/40 sticky top-0 z-20 transition-colors">
                        <div className="w-16 border-r border-black/5 dark:border-[#30363d] flex items-center justify-center py-4">
                            <button 
                                onClick={() => {
                                    if (selectedProducts.size === products.length && products.length > 0) {
                                        setSelectedProducts(new Map());
                                    } else {
                                        const next = new Map();
                                        products.forEach(p => next.set(p.id, p));
                                        setSelectedProducts(next);
                                    }
                                }}
                                className={`w-5 h-5 rounded-md border-2 flex items-center justify-center transition-all flex-shrink-0 ${selectedProducts.size === products.length && products.length > 0 ? 'bg-[#0d3542] dark:bg-[#f5a81c] border-[#0d3542] dark:border-[#f5a81c]' : 'border-black/20 dark:border-[#30363d]'}`}
                            >
                                {selectedProducts.size === products.length && products.length > 0 && <Check size={12} className="text-white dark:text-black" />}
                            </button>
                        </div>
                        <div className="w-32 border-r border-black/5 dark:border-[#30363d] px-4 py-4">Status</div>
                        <div className="w-40 border-r border-black/5 dark:border-[#30363d] px-5 py-4">SKU</div>
                        <div className="flex-1 border-r border-black/5 dark:border-[#30363d] px-6 py-4">Product Name</div>
                        <div className="w-28 border-r border-black/5 dark:border-[#30363d] px-4 py-4 text-center">In Stock</div>
                        <div className="w-36 px-6 py-4 text-right pr-8">Price</div>
                    </div>

                    <div className="flex-1 overflow-y-auto attire-scrollbar relative">
                        <AnimatePresence>
                            {loading && products.length === 0 ? (
                                <motion.div 
                                    key="loader"
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    exit={{ opacity: 0 }}
                                    transition={{ duration: 0.15 }}
                                    className="h-full flex flex-col items-center justify-center space-y-10"
                                >
                                    <LumaSpin size="lg" />
                                    <p className="text-[13px] font-black uppercase tracking-[0.4em] text-gray-500 dark:text-[#8b949e]/40 animate-pulse">Syncing Inventory...</p>
                                </motion.div>
                            ) : products.length === 0 ? (
                                <motion.div 
                                    key="empty"
                                    initial={{ opacity: 0, y: 8 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ duration: 0.2 }}
                                    className="h-full flex flex-col items-center justify-center p-20 text-center"
                                >
                                    <Activity size={64} className="text-gray-200 dark:text-[#30363d] mb-8" />
                                    <h3 className="text-[18px] font-black uppercase tracking-[0.2em] text-gray-400 dark:text-[#8b949e]/40">Zero Results Found</h3>
                                    <p className="text-[12px] text-gray-500 dark:text-[#8b949e]/60 mt-4 max-w-sm">Try adjusting your filters or search terms for better accuracy.</p>
                                    <button 
                                        onClick={clearAll}
                                        className="mt-12 px-10 py-5 bg-[#0d3542]/10 dark:bg-[#f5a81c]/10 border-2 border-[#0d3542]/20 dark:border-[#f5a81c]/20 text-[#0d3542] dark:text-[#f5a81c] text-[12px] font-black uppercase tracking-widest rounded-2xl hover:bg-[#0d3542] dark:hover:bg-[#f5a81c] hover:text-white dark:hover:text-black transition-all shadow-none"
                                    >
                                        Clear All Filters
                                    </button>
                                </motion.div>
                            ) : (
                                <div 
                                    key="results"
                                    className="divide-y-2 divide-black/5 dark:divide-[#30363d]/30"
                                >
                                    {(isAnimating ? products.slice(0, 10) : products).map((product) => (
                                        <ProductLogRow
                                            key={product.id}
                                            product={product}
                                            isSelected={selectedProducts.has(product.id)}
                                            onToggleSelect={toggleSelect}
                                        />
                                    ))}
                                </div>
                            )}
                        </AnimatePresence>
                    </div>
                </div>
            </div>

            {/* Floating Action Bar */}
            <AnimatePresence>
                {selectedProducts.size > 0 && (
                    <motion.div
                        initial={{ y: 80, opacity: 0, scale: 0.96 }}
                        animate={{ y: 0, opacity: 1, scale: 1 }}
                        exit={{ y: 80, opacity: 0, scale: 0.96 }}
                        transition={{ duration: 0.2, ease: [0.25, 0.46, 0.45, 0.94] }}
                        style={{ willChange: 'transform, opacity' }}
                        className="fixed bottom-8 left-1/2 -translate-x-1/2 z-[100]"
                    >
                        <div className="flex items-center gap-1 bg-white/90 dark:bg-[#161b22]/95 backdrop-blur-xl border border-black/10 dark:border-[#30363d] rounded-full shadow-lg shadow-black/10 dark:shadow-black/40 px-2 py-2">

                            {/* Count Badge */}
                            <div className="flex items-center gap-2.5 pl-3 pr-4">
                                <div className="w-5 h-5 rounded-full bg-[#0d3542] dark:bg-[#f5a81c] flex items-center justify-center flex-shrink-0">
                                    <span className="text-[10px] font-black text-white dark:text-black leading-none">{selectedProducts.size}</span>
                                </div>
                                <span className="text-[11px] font-black uppercase tracking-widest text-gray-500 dark:text-[#8b949e] whitespace-nowrap">
                                    item{selectedProducts.size !== 1 ? 's' : ''} selected
                                </span>
                            </div>

                            {/* Divider */}
                            <div className="w-px h-5 bg-black/10 dark:bg-[#30363d] mx-1 flex-shrink-0" />

                            {/* Clear */}
                            <button
                                onClick={() => setSelectedProducts(new Map())}
                                className="px-3 py-2 text-[11px] font-black uppercase tracking-widest text-gray-400 dark:text-[#8b949e]/60 hover:text-gray-700 dark:hover:text-[#c9d1d9] transition-colors rounded-full hover:bg-black/5 dark:hover:bg-white/5"
                            >
                                Clear
                            </button>

                            {/* Add Button */}
                            <button
                                onClick={handleBatchAdd}
                                className="px-5 py-2.5 bg-[#0d3542] dark:bg-[#f5a81c] text-white dark:text-black text-[11px] font-black uppercase tracking-widest rounded-full hover:opacity-90 active:scale-95 transition-all"
                            >
                                Add to Cart
                            </button>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}

export default ProductCatalog;
