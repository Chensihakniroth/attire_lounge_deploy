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
    X,
    Loader2
} from 'lucide-react';
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
            className="border-b border-black/5 dark:border-white/5 last:border-0 hover:z-10 relative"
            onClick={onToggleSelect}
        >
            <div
                className={`w-full min-h-[70px] flex items-center transition-all cursor-pointer hover:bg-black/[0.02] dark:hover:bg-white/[0.02] active:bg-black/[0.04] dark:active:bg-white/[0.04] ${isSelected ? 'bg-attire-accent/15 dark:bg-attire-accent/10 pr-5' : 'pr-5'}`}
            >
                {/* Custom Checkbox */}
                <div className={`w-16 h-[70px] border-r border-black/5 dark:border-white/5 flex items-center justify-center transition-all flex-shrink-0 ${isSelected ? 'border-l-[4px] border-attire-accent' : ''}`}>
                    <div className={`w-5 h-5 rounded-md border-2 flex items-center justify-center transition-all ${isSelected ? 'bg-attire-accent border-attire-accent' : 'border-black/10 dark:border-white/10 group-hover:border-attire-accent/40'}`}>
                        {isSelected && <Check size={12} className="text-black font-black" />}
                    </div>
                </div>

                <div className="w-32 border-r border-black/5 dark:border-white/5 px-4 h-[70px] flex items-center flex-shrink-0">
                    <div className={`px-2.5 py-1 rounded-lg text-[10px] font-black uppercase tracking-widest ${
                        product.stock_qty > 0 
                            ? 'bg-green-500/10 text-green-500' 
                            : 'bg-red-500/10 text-red-500'
                    }`}>
                        {product.stock_qty > 0 ? 'In Stock' : 'Out Stock'}
                    </div>
                </div>

                <div className="w-40 border-r border-black/5 dark:border-white/5 px-5 h-[70px] flex items-center flex-shrink-0 font-mono text-[13px] font-black text-attire-accent tracking-tighter truncate">
                    {product.sku}
                </div>

                <div className="flex-1 border-r border-black/5 dark:border-white/5 px-6 h-[70px] flex items-center min-w-0 overflow-hidden">
                    <p className={`text-[15px] font-black uppercase tracking-wider truncate transition-colors ${isSelected ? 'text-attire-accent' : 'text-gray-900 dark:text-white'}`}>
                        {product.display_name || product.name}
                    </p>
                </div>

                <div className="w-28 border-r border-black/5 dark:border-white/5 px-4 h-[70px] flex items-center justify-center">
                    <span className={`font-mono text-[14px] font-black px-4 py-1.5 rounded-xl border ${product.stock_qty <= 5 ? 'bg-red-500/10 border-red-500/20 text-red-500' : 'bg-black/5 dark:bg-white/5 border-black/10 dark:border-white/10 text-gray-500/60'}`}>
                        {product.stock_qty}
                    </span>
                </div>

                <div className="w-36 px-6 h-[70px] flex items-center justify-end font-mono text-[18px] font-black text-gray-900 dark:text-white">
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
            className="flex h-full flex-col space-y-8 overflow-y-auto bg-gray-50 dark:bg-[#080808] p-8 no-scrollbar"
        >
            <div className="flex items-center justify-between">
                <div>
                    <h3 className="text-[14px] font-black uppercase tracking-[0.25em] text-gray-900 dark:text-white">Filter</h3>
                    <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mt-1">{totalResults} matches</p>
                </div>
                {hasActiveFilters && (
                    <button
                        onClick={clearAll}
                        className="text-[10px] font-black uppercase tracking-widest text-attire-accent hover:underline"
                    >
                        Reset
                    </button>
                )}
            </div>

            {/* Specialized Search Hub */}
            <div className="space-y-6">
                <div className="space-y-3">
                    <p className="text-[11px] font-black uppercase tracking-[0.2em] text-gray-400 flex items-center gap-3">
                        <Tag size={12} /> Search Name
                    </p>
                    <div className="relative">
                        <input
                            type="text"
                            placeholder="PRODUCT NAME..."
                            value={filters.name || ""}
                            onChange={(e) => onChange({...filters, name: e.target.value})}
                            className="w-full bg-white dark:bg-white/[0.03] border-2 border-transparent focus:border-attire-accent rounded-xl py-3.5 pl-5 pr-10 text-[12px] font-black uppercase tracking-widest outline-none transition-all placeholder:text-gray-300 dark:placeholder:text-white/10"
                        />
                    </div>
                </div>

                <div className="space-y-3">
                    <p className="text-[11px] font-black uppercase tracking-[0.2em] text-gray-400 flex items-center gap-3">
                        <Layers size={12} /> Search Attribute
                    </p>
                    <div className="relative">
                        <input
                            type="text"
                            placeholder="SIZE, FABRIC, ETC..."
                            value={filters.attribute || ""}
                            onChange={(e) => onChange({...filters, attribute: e.target.value})}
                            className="w-full bg-white dark:bg-white/[0.03] border-2 border-transparent focus:border-attire-accent rounded-xl py-3.5 pl-5 pr-10 text-[12px] font-black uppercase tracking-widest outline-none transition-all placeholder:text-gray-300 dark:placeholder:text-white/10"
                        />
                    </div>
                </div>

                <div className="space-y-3">
                    <p className="text-[11px] font-black uppercase tracking-[0.2em] text-gray-400 flex items-center gap-3">
                        <Hash size={12} /> Search Code
                    </p>
                    <div className="relative">
                        <input
                            type="text"
                            placeholder="SKU OR ID..."
                            value={filters.code || ""}
                            onChange={(e) => onChange({...filters, code: e.target.value})}
                            className="w-full bg-white dark:bg-white/[0.03] border-2 border-transparent focus:border-attire-accent rounded-xl py-3.5 pl-5 pr-10 text-[12px] font-black uppercase tracking-widest outline-none transition-all placeholder:text-gray-300 dark:placeholder:text-white/10"
                        />
                    </div>
                </div>
            </div>

            {/* Availability */}
            <div className="space-y-4">
                <p className="text-[12px] font-black uppercase tracking-[0.2em] text-gray-400 flex items-center gap-3">
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
                                        ? "border-attire-accent bg-attire-accent/10 text-attire-accent shadow-sm"
                                        : "border-transparent bg-white dark:bg-white/[0.03] text-gray-500 hover:bg-black/5 dark:hover:bg-white/5"
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
                <p className="text-[12px] font-black uppercase tracking-[0.2em] text-gray-400 flex items-center gap-3">
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
                        className={`w-full flex items-center justify-between px-6 py-4 bg-white dark:bg-white/[0.03] border-2 rounded-xl text-[13px] font-black uppercase tracking-widest transition-all ${isGroupOpen ? 'border-attire-accent ring-4 ring-attire-accent/5' : 'border-transparent text-gray-900 dark:text-white hover:bg-black/5 dark:hover:bg-white/5'}`}
                    >
                        <span className="truncate">{filters.categories[0] || 'All Groups'}</span>
                        <motion.div
                            animate={{ rotate: isGroupOpen ? 180 : 0 }}
                            transition={{ duration: 0.2 }}
                        >
                            <ChevronDown size={18} className="text-attire-accent" />
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
                                    className={`absolute ${dropUp ? 'bottom-full mb-3' : 'top-full mt-3'} left-0 right-0 bg-white/95 dark:bg-[#0f0f0f]/95 border-2 border-black/10 dark:border-white/10 rounded-2xl shadow-2xl overflow-hidden z-50 backdrop-blur-3xl`}
                                >
                                    <div className="max-h-72 overflow-y-auto no-scrollbar py-2">
                                        <button 
                                            onClick={() => {
                                                onChange({ ...filters, categories: [] });
                                                setIsGroupOpen(false);
                                            }}
                                            className={`w-full px-6 py-4 text-[11px] font-black uppercase tracking-widest text-left transition-all flex items-center justify-between ${filters.categories.length === 0 ? 'bg-attire-accent text-black' : 'text-gray-400 hover:bg-black/5 dark:hover:bg-white/5'}`}
                                        >
                                            All Groups
                                            {filters.categories.length === 0 && <Check size={14} />}
                                        </button>
                                        <div className="h-px bg-black/5 dark:bg-white/5 mx-3 my-1" />
                                        {categories.map((cat) => (
                                            <button
                                                key={cat}
                                                onClick={() => {
                                                    onChange({ ...filters, categories: [cat] });
                                                    setIsGroupOpen(false);
                                                }}
                                                className={`w-full px-6 py-5 text-[13px] font-black uppercase tracking-widest text-left transition-all flex items-center justify-between ${filters.categories.includes(cat) ? 'bg-attire-accent text-black' : 'text-gray-500 hover:bg-black/5 dark:hover:bg-white/5 hover:text-attire-accent'}`}
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
        <div className="h-full w-full flex flex-col bg-white dark:bg-[#050505] overflow-hidden rounded-2xl border border-black/10 dark:border-white/10 shadow-2xl">
            {/* Header - Clean & Minimalist */}
            <div className="border-b-2 border-black/5 dark:border-white/5 bg-white/60 dark:bg-[#0a0a0a]/60 backdrop-blur-2xl p-8 sticky top-0 z-30">
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-[28px] font-black uppercase tracking-[0.4em] text-gray-900 dark:text-white leading-none">Catalog</h1>
                        <p className="text-[12px] font-bold text-gray-400 uppercase tracking-widest mt-3 flex items-center gap-3">
                            <Hash size={14} className="text-attire-accent" /> Product Inventory System
                        </p>
                    </div>
                </div>
            </div>

            {/* Main Area */}
            <div className="flex flex-1 overflow-hidden">
                {/* Sidebar Filter Hub */}
                <div className="overflow-hidden border-r-2 border-black/5 dark:border-white/5 h-full w-[340px]">
                    <FilterPanel
                        filters={filters}
                        categories={categories}
                        onChange={setFilters}
                        totalResults={products.length}
                    />
                </div>

                <div className="flex-1 flex flex-col h-full bg-white dark:bg-[#050505]">
                    {/* List Header */}
                    <div className="bg-gray-50/80 dark:bg-white/[0.02] border-b-2 border-black/5 dark:border-white/5 flex items-center text-[10px] font-black uppercase tracking-[0.3em] text-gray-400 sticky top-0 z-20 transition-colors">
                        <div className="w-16 border-r border-black/5 dark:border-white/5 flex items-center justify-center py-4">
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
                                className={`w-5 h-5 rounded-md border-2 flex items-center justify-center transition-all flex-shrink-0 ${selectedProducts.size === products.length && products.length > 0 ? 'bg-attire-accent border-attire-accent' : 'border-black/20 dark:border-white/20'}`}
                            >
                                {selectedProducts.size === products.length && products.length > 0 && <Check size={12} className="text-black" />}
                            </button>
                        </div>
                        <div className="w-32 border-r border-black/5 dark:border-white/5 px-4 py-4">Status</div>
                        <div className="w-40 border-r border-black/5 dark:border-white/5 px-5 py-4">SKU</div>
                        <div className="flex-1 border-r border-black/5 dark:border-white/5 px-6 py-4">Product Name</div>
                        <div className="w-28 border-r border-black/5 dark:border-white/5 px-4 py-4 text-center">In Stock</div>
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
                                    <Loader2 className="animate-spin text-attire-accent" size={48} />
                                    <p className="text-[13px] font-black uppercase tracking-[0.4em] text-gray-500 animate-pulse">Syncing Inventory...</p>
                                </motion.div>
                            ) : products.length === 0 ? (
                                <motion.div 
                                    key="empty"
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    className="h-full flex flex-col items-center justify-center p-20 text-center"
                                >
                                    <Activity size={64} className="text-gray-200 dark:text-white/5 mb-8" />
                                    <h3 className="text-[18px] font-black uppercase tracking-[0.2em] text-gray-400">Zero Results Found</h3>
                                    <p className="text-[12px] text-gray-500 mt-4 max-w-sm">Try adjusting your filters or search terms for better accuracy.</p>
                                    <button 
                                        onClick={clearAll}
                                        className="mt-12 px-10 py-5 bg-attire-accent/10 border-2 border-attire-accent/20 text-attire-accent text-[12px] font-black uppercase tracking-widest rounded-2xl hover:bg-attire-accent hover:text-black transition-all shadow-xl"
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
                                    className="divide-y-2 divide-black/5 dark:divide-white/5"
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
                        <div className="bg-[#0f0f0f]/95 dark:bg-white/95 backdrop-blur-3xl border-2 border-white/10 dark:border-black/10 px-10 py-6 rounded-[32px] shadow-2xl flex items-center gap-12 overflow-hidden relative">
                            {/* Accent Bar */}
                            <div className="absolute left-0 top-0 bottom-0 w-3 bg-attire-accent" />
                            
                            <div className="flex flex-col">
                                <span className="text-[11px] font-black uppercase tracking-[0.3em] text-attire-accent leading-none mb-2">Ready to add</span>
                                <span className="text-[24px] font-black text-white dark:text-black leading-none tracking-tight">{selectedProducts.size} items selected</span>
                            </div>
                            
                            <div className="h-12 w-px bg-white/10 dark:bg-black/10 flex-shrink-0" />
                            
                            <div className="flex items-center gap-6 ml-auto">
                                <button 
                                    onClick={() => setSelectedProducts(new Map())}
                                    className="px-6 py-4 text-[12px] font-black uppercase tracking-widest text-white/50 dark:text-black/50 hover:text-white dark:hover:text-black transition-colors"
                                >
                                    Reset
                                </button>
                                <button 
                                    onClick={handleBatchAdd}
                                    className="px-12 py-5 bg-attire-accent text-black text-[14px] font-black uppercase tracking-[0.2em] rounded-2xl hover:scale-105 active:scale-95 transition-all shadow-[0_0_30px_rgba(0,196,180,0.3)]"
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
