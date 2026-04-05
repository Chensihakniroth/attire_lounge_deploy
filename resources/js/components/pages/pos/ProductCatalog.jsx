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
const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
        opacity: 1,
        transition: {
            staggerChildren: 0.04,
        },
    },
};

const rowVariants = {
    hidden: { opacity: 0, y: 20, filter: 'blur(8px)' },
    visible: { 
        opacity: 1, 
        y: 0, 
        filter: 'blur(0px)',
        transition: { duration: 0.5, ease: [0.16, 1, 0.3, 1] }
    },
    exit: { 
        opacity: 0, 
        scale: 0.95, 
        filter: 'blur(4px)',
        transition: { duration: 0.2 } 
    },
};

// --- Sub-Components ---

const ProductLogRow = React.forwardRef(({ product, isSelected, onToggleSelect }, ref) => {
    return (
        <motion.div 
            ref={ref}
            layout
            variants={rowVariants}
            className="border-b border-black/5 dark:border-[#30363d] last:border-0 hover:z-10 relative"
            onClick={onToggleSelect}
        >
            <div
                className={`w-full min-h-[70px] flex items-center transition-all cursor-pointer hover:bg-black/[0.02] dark:hover:bg-[#161b22] active:bg-black/[0.04] dark:active:bg-[#0d1117] ${isSelected ? 'bg-[#0d3542]/10 dark:bg-[#58a6ff]/10 pr-5' : 'pr-5'}`}
            >
                {/* Custom Checkbox */}
                <div className={`w-16 h-[70px] border-r border-black/5 dark:border-[#30363d] flex items-center justify-center transition-all flex-shrink-0 ${isSelected ? 'border-l-[4px] border-[#0d3542] dark:border-[#58a6ff]' : ''}`}>
                    <div className={`w-5 h-5 rounded-md border-2 flex items-center justify-center transition-all ${isSelected ? 'bg-[#0d3542] dark:bg-[#58a6ff] border-[#0d3542] dark:border-[#58a6ff]' : 'border-black/10 dark:border-[#30363d] group-hover:border-[#0d3542]/40 dark:group-hover:border-[#58a6ff]/40'}`}>
                        {isSelected && <Check size={12} className="text-white dark:text-black font-black" />}
                    </div>
                </div>

                <div className="w-32 border-r border-black/5 dark:border-[#30363d] px-4 h-[70px] flex items-center flex-shrink-0">
                    <div className={`px-2.5 py-1 rounded-lg text-[10px] font-black uppercase tracking-widest ${
                        product.stock_qty > 0 
                            ? 'bg-green-500/10 text-green-500 dark:text-green-400' 
                            : 'bg-red-500/10 text-red-500 dark:text-red-400'
                    }`}>
                        {product.stock_qty > 0 ? 'In Stock' : 'Out Stock'}
                    </div>
                </div>

                <div className="w-40 border-r border-black/5 dark:border-[#30363d] px-5 h-[70px] flex items-center flex-shrink-0 font-mono text-[13px] font-black text-[#0d3542] dark:text-[#58a6ff] tracking-tighter truncate">
                    {product.sku}
                </div>

                <div className="flex-1 border-r border-black/5 dark:border-[#30363d] px-6 h-[70px] flex items-center min-w-0 overflow-hidden">
                    <p className={`text-[15px] font-black uppercase tracking-wider truncate transition-colors ${isSelected ? 'text-[#0d3542] dark:text-[#58a6ff]' : 'text-gray-900 dark:text-[#c9d1d9]'}`}>
                        {product.display_name || product.name}
                    </p>
                </div>

                <div className="w-28 border-r border-black/5 dark:border-[#30363d] px-4 h-[70px] flex items-center justify-center">
                    <span className={`font-mono text-[14px] font-black px-4 py-1.5 rounded-xl border ${product.stock_qty <= 5 ? 'bg-red-500/10 border-red-500/20 text-red-500' : 'bg-black/5 dark:bg-[#0d1117] border-black/10 dark:border-[#30363d] text-gray-500/60 dark:text-[#8b949e]/40'}`}>
                        {product.stock_qty}
                    </span>
                </div>

                <div className="w-36 px-6 h-[70px] flex items-center justify-end font-mono text-[18px] font-black text-gray-900 dark:text-[#c9d1d9]">
                    ${parseFloat(product.price).toLocaleString()}
                </div>
            </div>
        </motion.div>
    );
});

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
                    <h3 className="text-[14px] font-black uppercase tracking-[0.25em] text-gray-900 dark:text-[#c9d1d9]">Filter</h3>
                    <p className="text-[10px] font-bold text-gray-400 dark:text-[#8b949e]/40 uppercase tracking-widest mt-1">{totalResults} matches</p>
                </div>
                {hasActiveFilters && (
                    <button
                        onClick={clearAll}
                        className="text-[10px] font-black uppercase tracking-widest text-[#0d3542] dark:text-[#58a6ff] hover:underline"
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
                            className="w-full bg-white dark:bg-[#161b22] border-2 border-black/5 dark:border-[#30363d] focus:border-[#0d3542] dark:focus:border-[#58a6ff] rounded-xl py-3.5 pl-5 pr-10 text-[12px] font-black uppercase tracking-widest outline-none transition-all placeholder:text-gray-300 dark:placeholder:text-[#8b949e]/20"
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
                            className="w-full bg-white dark:bg-[#161b22] border-2 border-black/5 dark:border-[#30363d] focus:border-[#0d3542] dark:focus:border-[#58a6ff] rounded-xl py-3.5 pl-5 pr-10 text-[12px] font-black uppercase tracking-widest outline-none transition-all placeholder:text-gray-300 dark:placeholder:text-[#8b949e]/20"
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
                            className="w-full bg-white dark:bg-[#161b22] border-2 border-black/5 dark:border-[#30363d] focus:border-[#0d3542] dark:focus:border-[#58a6ff] rounded-xl py-3.5 pl-5 pr-10 text-[12px] font-black uppercase tracking-widest outline-none transition-all placeholder:text-gray-300 dark:placeholder:text-[#8b949e]/20"
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
                                        ? "border-[#0d3542] dark:border-[#58a6ff] bg-[#0d3542]/10 dark:bg-[#58a6ff]/10 text-[#0d3542] dark:text-[#58a6ff] shadow-none"
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
                        className={`w-full flex items-center justify-between px-6 py-4 bg-white dark:bg-[#161b22] border-2 rounded-xl text-[13px] font-black uppercase tracking-widest transition-all ${isGroupOpen ? 'border-[#0d3542] dark:border-[#58a6ff] ring-4 ring-[#0d3542]/5 dark:ring-[#58a6ff]/5' : 'border-transparent text-gray-900 dark:text-[#c9d1d9] hover:bg-black/5 dark:hover:bg-[#30363d]/50'}`}
                    >
                        <span className="truncate">{filters.categories[0] || 'All Groups'}</span>
                        <motion.div
                            animate={{ rotate: isGroupOpen ? 180 : 0 }}
                            transition={{ duration: 0.2 }}
                        >
                            <ChevronDown size={18} className="text-[#0d3542] dark:text-[#58a6ff]" />
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
                                            className={`w-full px-6 py-4 text-[11px] font-black uppercase tracking-widest text-left transition-all flex items-center justify-between ${filters.categories.length === 0 ? 'bg-[#0d3542] dark:bg-[#58a6ff] text-white dark:text-black' : 'text-gray-400 dark:text-[#8b949e]/40 hover:bg-black/5 dark:hover:bg-[#30363d]/50'}`}
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
                                                className={`w-full px-6 py-5 text-[13px] font-black uppercase tracking-widest text-left transition-all flex items-center justify-between ${filters.categories.includes(cat) ? 'bg-[#0d3542] dark:bg-[#58a6ff] text-white dark:text-black' : 'text-gray-500 dark:text-[#8b949e] hover:bg-black/5 dark:hover:bg-[#30363d]/50 hover:text-[#0d3542] dark:hover:text-[#58a6ff]'}`}
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
    const { addItem } = usePOS();
    const [products, setProducts] = useState([]);
    const [categories, setCategories] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filters, setFilters] = useState({
        categories: [],
        stockStatus: 'all',
        name: "",
        attribute: "",
        code: "",
    });
    const [selectedProducts, setSelectedProducts] = useState(new Map());

    // Fetch categories
    useEffect(() => {
        const fetchCategories = async () => {
            try {
                const response = await axios.get('/api/v1/admin/pos/products/categories');
                setCategories(response.data);
            } catch (err) {
                console.error('Failed to fetch categories');
            }
        };
        fetchCategories();
    }, []);

    // Load data from API
    const fetchProducts = useCallback(async () => {
        setLoading(true);
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
            setProducts(response.data.data);
        } catch (err) {
            console.error('Failed to fetch products');
        } finally {
            setLoading(false);
        }
    }, [filters]);

    useEffect(() => {
        const timer = setTimeout(() => {
            fetchProducts();
        }, 300);
        return () => clearTimeout(timer);
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
        const newSelected = new Map(selectedProducts);
        if (newSelected.has(product.id)) {
            newSelected.delete(product.id);
        } else {
            newSelected.set(product.id, product);
        }
        setSelectedProducts(newSelected);
    }, [selectedProducts]);

    const handleBatchAdd = () => {
        selectedProducts.forEach(product => addItem(product));
        setSelectedProducts(new Map());
        if (onSearchClick) onSearchClick();
    };

    return (
        <div className="h-full w-full flex flex-col bg-[#fdfdfc] dark:bg-[#0d1117] overflow-hidden rounded-2xl border border-black/10 dark:border-[#30363d] shadow-none">
            {/* Header - Clean & Minimalist */}
            <div className="border-b-2 border-black/5 dark:border-[#30363d] bg-[#fdfdfc] dark:bg-[#0d1117] p-8 sticky top-0 z-30">
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-[28px] font-black uppercase tracking-[0.4em] text-gray-900 dark:text-[#c9d1d9] leading-none">Catalog</h1>
                        <p className="text-[12px] font-bold text-gray-400 dark:text-[#8b949e]/40 uppercase tracking-widest mt-3 flex items-center gap-3">
                            <Hash size={14} className="text-[#0d3542] dark:text-[#58a6ff]" /> Product Inventory System
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
                                className={`w-5 h-5 rounded-md border-2 flex items-center justify-center transition-all flex-shrink-0 ${selectedProducts.size === products.length && products.length > 0 ? 'bg-[#0d3542] dark:bg-[#58a6ff] border-[#0d3542] dark:border-[#58a6ff]' : 'border-black/20 dark:border-[#30363d]'}`}
                            >
                                {selectedProducts.size === products.length && products.length > 0 && <Check size={12} className="text-white dark:text-black" />}
                            </button>
                        </div>
                        <div className="w-32 border-r border-black/5 dark:border-[#30363d] px-4 py-4">Status</div>
                        <div className="w-40 border-r border-black/5 dark:border-[#30363d] px-5 py-4">SKU</div>
                        <div className="flex-1 border-r border-black/5 dark:border-[#30363d] px-6 py-4">Product Name</div>
                        <div className="w-28 border-r border-black/5 dark:border-[#30363d] px-4 py-4 text-center">In Stock</div>
                        <div className="w-36 px-6 py-4 text-right">Price</div>
                    </div>

                    <div className="flex-1 overflow-y-auto attire-scrollbar relative">
                        <AnimatePresence mode="wait">
                            {loading && products.length === 0 ? (
                                <motion.div 
                                    key="loader"
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    exit={{ opacity: 0 }}
                                    className="h-full flex flex-col items-center justify-center space-y-10"
                                >
                                    <LumaSpin size="lg" />
                                    <p className="text-[13px] font-black uppercase tracking-[0.4em] text-gray-500 dark:text-[#8b949e]/40 animate-pulse">Syncing Inventory...</p>
                                </motion.div>
                            ) : products.length === 0 ? (
                                <motion.div 
                                    key="empty"
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    className="h-full flex flex-col items-center justify-center p-20 text-center"
                                >
                                    <Activity size={64} className="text-gray-200 dark:text-[#30363d] mb-8" />
                                    <h3 className="text-[18px] font-black uppercase tracking-[0.2em] text-gray-400 dark:text-[#8b949e]/40">Zero Results Found</h3>
                                    <p className="text-[12px] text-gray-500 dark:text-[#8b949e]/60 mt-4 max-w-sm">Try adjusting your filters or search terms for better accuracy.</p>
                                    <button 
                                        onClick={clearAll}
                                        className="mt-12 px-10 py-5 bg-[#0d3542]/10 dark:bg-[#58a6ff]/10 border-2 border-[#0d3542]/20 dark:border-[#58a6ff]/20 text-[#0d3542] dark:text-[#58a6ff] text-[12px] font-black uppercase tracking-widest rounded-2xl hover:bg-[#0d3542] dark:hover:bg-[#58a6ff] hover:text-white dark:hover:text-black transition-all shadow-none"
                                    >
                                        Clear All Filters
                                    </button>
                                </motion.div>
                            ) : (
                                <motion.div 
                                    key="results"
                                    variants={containerVariants}
                                    initial="hidden"
                                    animate="visible"
                                    className="divide-y-2 divide-black/5 dark:divide-[#30363d]/30"
                                >
                                    {products.map((product) => (
                                        <ProductLogRow
                                            key={product.id}
                                            product={product}
                                            isSelected={selectedProducts.has(product.id)}
                                            onToggleSelect={() => toggleSelect(product)}
                                        />
                                    ))}
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </div>
                </div>
            </div>

            {/* Floating Action Bar */}
            <AnimatePresence>
                {selectedProducts.size > 0 && (
                    <motion.div
                        initial={{ y: 150, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        exit={{ y: 150, opacity: 0 }}
                        className="fixed bottom-16 left-1/2 -translate-x-1/2 z-[100] w-full max-w-4xl px-6"
                    >
                        <div className="bg-[#fdfdfc] dark:bg-[#161b22] border-2 border-[#0d3542]/20 dark:border-[#30363d] px-10 py-6 rounded-[32px] shadow-none flex items-center gap-12 overflow-hidden relative">
                            {/* Accent Bar */}
                            <div className="absolute left-0 top-0 bottom-0 w-3 bg-[#0d3542] dark:bg-[#58a6ff]" />
                            
                            <div className="flex flex-col">
                                <span className="text-[11px] font-black uppercase tracking-[0.3em] text-[#0d3542] dark:text-[#58a6ff] leading-none mb-2">Ready to add</span>
                                <span className="text-[24px] font-black text-gray-900 dark:text-[#c9d1d9] leading-none tracking-tight">{selectedProducts.size} items selected</span>
                            </div>
                            
                            <div className="h-12 w-px bg-black/10 dark:bg-[#30363d] flex-shrink-0" />
                            
                            <div className="flex items-center gap-6 ml-auto">
                                <button 
                                    onClick={() => setSelectedProducts(new Map())}
                                    className="px-6 py-4 text-[12px] font-black uppercase tracking-widest text-gray-400 dark:text-[#8b949e]/40 hover:text-gray-900 dark:hover:text-white transition-colors"
                                >
                                    Reset
                                </button>
                                <button 
                                    onClick={handleBatchAdd}
                                    className="px-12 py-5 bg-[#0d3542] dark:bg-[#58a6ff] text-white dark:text-black text-[14px] font-black uppercase tracking-[0.2em] rounded-2xl hover:scale-105 active:scale-95 transition-all shadow-none"
                                >
                                    Add to cart
                                </button>
                            </div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}

export default ProductCatalog;
