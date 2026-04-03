import React, { useState, useEffect, useMemo, useCallback } from 'react';
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

// --- Sub-Components ---

const ProductLogRow = ({ product, expanded, onToggle, onAdd }) => {
    return (
        <div className="border-b border-black/5 dark:border-white/5 last:border-0">
            <motion.div
                onClick={onToggle}
                className={`w-full p-4 flex items-center gap-4 transition-all cursor-pointer hover:bg-black/[0.02] dark:hover:bg-white/[0.02] active:bg-black/[0.05] dark:active:bg-white/[0.05] ${expanded ? 'bg-attire-accent/5 dark:bg-attire-accent/5' : ''}`}
            >
                <motion.div
                    animate={{ rotate: expanded ? 180 : 0 }}
                    transition={{ duration: 0.2 }}
                    className="flex-shrink-0 text-gray-400"
                >
                    <ChevronDown size={16} />
                </motion.div>

                <div className={`px-2 py-0.5 rounded text-[9px] font-black uppercase tracking-widest flex-shrink-0 ${
                    product.stock_qty > 0 
                        ? 'bg-green-500/10 text-green-500' 
                        : 'bg-red-500/10 text-red-500'
                }`}>
                    {product.stock_qty > 0 ? 'In Stock' : 'Out Stock'}
                </div>

                <div className="w-24 flex-shrink-0 font-mono text-[10px] font-black text-attire-accent tracking-tighter truncate">
                    {product.sku}
                </div>

                <div className="flex-shrink-0 w-28 text-[10px] font-black uppercase tracking-widest text-gray-500 truncate">
                    {product.category}
                </div>

                <div className="flex-1 min-w-0">
                    <p className="text-[11px] font-black uppercase tracking-wider text-gray-900 dark:text-white truncate">
                        {product.name}
                    </p>
                </div>

                <div className="w-24 text-right font-mono text-[12px] font-black text-gray-900 dark:text-white">
                    ${parseFloat(product.price).toLocaleString()}
                </div>

                <button 
                    onClick={(e) => { e.stopPropagation(); onAdd(product); }}
                    className="px-3 py-1 bg-attire-accent text-black text-[10px] font-black rounded-lg hover:scale-105 active:scale-95 transition-all uppercase tracking-widest"
                >
                    Add
                </button>
            </motion.div>

            <AnimatePresence initial={false}>
                {expanded && (
                    <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.25, ease: "easeInOut" }}
                        className="overflow-hidden bg-black/[0.03] dark:bg-white/[0.01] border-t border-black/5 dark:border-white/5"
                    >
                        <div className="p-6 grid grid-cols-1 md:grid-cols-3 gap-8">
                            {/* Detailed Info */}
                            <div className="space-y-4">
                                <div>
                                    <p className="text-[8px] font-black uppercase tracking-[0.2em] text-gray-400 mb-2">Item Description</p>
                                    <p className="text-[11px] font-medium text-gray-600 dark:text-gray-300 leading-relaxed italic bg-white dark:bg-black/20 p-3 rounded-xl border border-black/5 dark:border-white/5">
                                        {product.description || `High-quality ${product.category} from the Attire Lounge collection. Expertly crafted for the modern gentleman.`}
                                    </p>
                                </div>
                                <div className="flex items-center gap-4">
                                    <div className="flex-1">
                                        <p className="text-[8px] font-black uppercase tracking-[0.2em] text-gray-400 mb-1">Variant</p>
                                        <p className="font-mono text-[11px] font-bold text-gray-800 dark:text-white">{product.variant || 'Standard Edition'}</p>
                                    </div>
                                    <div className="flex-1">
                                        <p className="text-[8px] font-black uppercase tracking-[0.2em] text-gray-400 mb-1">Stock Position</p>
                                        <p className="font-mono text-[11px] font-black text-attire-accent">{product.stock_qty} Units Available</p>
                                    </div>
                                </div>
                            </div>

                            {/* Inventory & Metadata */}
                            <div className="space-y-4">
                                <div>
                                    <p className="text-[8px] font-black uppercase tracking-[0.2em] text-gray-400 mb-2 font-mono">System Metadata</p>
                                    <div className="bg-black/5 dark:bg-black/40 rounded-xl p-3 border border-black/5 dark:border-white/5 space-y-2">
                                        <div className="flex justify-between items-center text-[10px]">
                                            <span className="text-gray-500 uppercase tracking-widest font-bold">Internal ID</span>
                                            <span className="font-mono text-gray-400">{product.id}</span>
                                        </div>
                                        <div className="flex justify-between items-center text-[10px]">
                                            <span className="text-gray-500 uppercase tracking-widest font-bold">Category</span>
                                            <span className="px-1.5 py-0.5 bg-attire-accent/10 text-attire-accent rounded text-[9px] font-black">{product.category}</span>
                                        </div>
                                        <div className="flex justify-between items-center text-[10px]">
                                            <span className="text-gray-500 uppercase tracking-widest font-bold">Added On</span>
                                            <span className="text-gray-400 font-mono">{new Date().toLocaleDateString()}</span>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Large Visual/Barcode Hub */}
                            <div className="flex flex-col items-center justify-center bg-white dark:bg-white/[0.02] rounded-2xl border border-dashed border-black/10 dark:border-white/10 p-4 min-h-[140px]">
                                <Barcode size={48} className="text-gray-300 dark:text-white/10 mb-2" />
                                <p className="font-mono text-[14px] font-black tracking-[0.2em] text-gray-400 dark:text-white/20 select-all">
                                    {product.sku}
                                </p>
                                <p className="text-[8px] font-black uppercase tracking-widest text-gray-500 mt-2">Machine Readable SKU</p>
                            </div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

const FilterPanel = ({ filters, categories, onChange, totalResults }) => {
    const stockOptions = ["all", "in-stock", "out-of-stock"];

    const toggleFilter = (category, value) => {
        const current = Array.isArray(filters[category]) ? filters[category] : [filters[category]];
        const isSelected = current.includes(value);

        let updated;
        if (category === 'stockStatus') {
            updated = value; // Single select for stock status
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
        });
    };

    const hasActiveFilters = filters.categories.length > 0 || filters.stockStatus !== 'all';

    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="flex h-full flex-col space-y-8 overflow-y-auto bg-gray-50 dark:bg-black/20 p-6 no-scrollbar"
        >
            <div className="flex items-center justify-between">
                <div>
                    <h3 className="text-[12px] font-black uppercase tracking-[0.2em] text-gray-900 dark:text-white">Active Refinement</h3>
                    <p className="text-[9px] font-bold text-gray-400 uppercase tracking-widest mt-0.5">{totalResults} matches found</p>
                </div>
                {hasActiveFilters && (
                    <button
                        onClick={clearAll}
                        className="text-[9px] font-black uppercase tracking-widest text-attire-accent hover:underline"
                    >
                        Reset
                    </button>
                )}
            </div>

            {/* In Stock Filter */}
            <div className="space-y-3">
                <p className="text-[10px] font-black uppercase tracking-[0.15em] text-gray-400 flex items-center gap-2">
                    <Activity size={10} /> Availability
                </p>
                <div className="space-y-2">
                    {stockOptions.map((opt) => {
                        const selected = filters.stockStatus === opt;
                        return (
                            <button
                                key={opt}
                                onClick={() => toggleFilter("stockStatus", opt)}
                                className={`flex w-full items-center justify-between px-4 py-3 rounded-xl border text-[10px] font-black uppercase tracking-widest transition-all ${
                                    selected
                                        ? "border-attire-accent bg-attire-accent/10 text-attire-accent shadow-[0_0_15px_rgba(212,175,55,0.05)]"
                                        : "border-black/5 dark:border-white/5 text-gray-500 hover:bg-black/5 dark:hover:bg-white/5"
                                }`}
                            >
                                {opt.replace('-', ' ')}
                                {selected && <Check className="h-3 w-3" />}
                            </button>
                        );
                    })}
                </div>
            </div>

            {/* Category Filter */}
            <div className="space-y-3">
                <p className="text-[10px] font-black uppercase tracking-[0.15em] text-gray-400 flex items-center gap-2">
                    <Layers size={10} /> Classification
                </p>
                <div className="space-y-2">
                    {categories.map((cat) => {
                        const selected = filters.categories.includes(cat);
                        return (
                            <button
                                key={cat}
                                onClick={() => toggleFilter("categories", cat)}
                                className={`flex w-full items-center justify-between px-4 py-3 rounded-xl border text-[10px] font-black uppercase tracking-widest transition-all ${
                                    selected
                                        ? "border-attire-accent bg-attire-accent/10 text-attire-accent shadow-[0_0_15px_rgba(212,175,55,0.05)]"
                                        : "border-black/5 dark:border-white/5 text-gray-500 hover:bg-black/5 dark:hover:bg-white/5"
                                }`}
                            >
                                {cat}
                                {selected && <Check className="h-3 w-3" />}
                            </button>
                        );
                    })}
                </div>
            </div>
        </motion.div>
    );
};

// --- Main Interactive Product Catalog ---

export default function ProductCatalog({ onSearchClick }) {
    const { addItem } = usePOS();
    const [searchQuery, setSearchQuery] = useState("");
    const [expandedId, setExpandedId] = useState(null);
    const [products, setProducts] = useState([]);
    const [categories, setCategories] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filters, setFilters] = useState({
        categories: [],
        stockStatus: 'all',
    });

    // Fetch initial categories
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
                    search: searchQuery,
                    category: filters.categories.length > 0 ? filters.categories.join(',') : '',
                    in_stock: filters.stockStatus === 'in-stock' ? 1 : (filters.stockStatus === 'out-of-stock' ? 0 : ''),
                    per_page: 50 // Load a decent chunk for interactive feel
                }
            });
            setProducts(response.data.data);
        } catch (err) {
            console.error('Failed to fetch products');
        } finally {
            setLoading(false);
        }
    }, [searchQuery, filters]);

    useEffect(() => {
        const timer = setTimeout(() => {
            fetchProducts();
        }, 300);
        return () => clearTimeout(timer);
    }, [fetchProducts]);

    // Clear all filters and search
    const clearAll = useCallback(() => {
        setSearchQuery("");
        setFilters({
            categories: [],
            stockStatus: 'all',
        });
    }, []);

    return (
        <div className="h-full w-full flex flex-col bg-white dark:bg-[#050505] overflow-hidden">
            {/* Header Area */}
            <div className="border-b border-black/10 dark:border-white/10 bg-white/80 dark:bg-[#0a0a0a]/80 backdrop-blur-xl p-6 pr-28 z-30 sticky top-0">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                    <div>
                        <h1 className="text-[20px] font-black uppercase tracking-[0.3em] text-gray-900 dark:text-white leading-none">Catalog</h1>
                        <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mt-2 flex items-center gap-2">
                            <Hash size={10} /> Global product archive for Attire Lounge
                        </p>
                    </div>

                    <div className="flex items-center gap-3 w-full md:w-auto">
                        <div className="relative flex-1 md:w-96">
                            <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                            <input
                                placeholder="Search by SKU, Name or Category..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="w-full bg-black/[0.04] dark:bg-white/[0.04] border border-black/10 dark:border-white/10 rounded-xl py-3 pl-11 pr-4 text-[12px] font-bold outline-none focus:border-attire-accent transition-all placeholder:text-gray-400 dark:placeholder:text-gray-600"
                            />
                        </div>

                    </div>
                </div>
            </div>

            {/* Main Interactive Zone */}
            <div className="flex flex-1 overflow-hidden">
                {/* Sidebar - Permanent UI */}
                <div className="overflow-hidden border-r border-black/5 dark:border-white/5 h-full w-[280px]">
                    <FilterPanel
                        filters={filters}
                        categories={categories}
                        onChange={setFilters}
                        totalResults={products.length}
                    />
                </div>


                <div className="flex-1 flex flex-col h-full bg-white dark:bg-[#050505]">
                    {/* List Header */}
                    <div className="bg-gray-50/50 dark:bg-white/[0.01] border-b border-black/5 dark:border-white/5 px-6 py-4 flex items-center gap-4 text-[9px] font-black uppercase tracking-[0.25em] text-gray-400 sticky top-0 z-20 transition-colors">
                        <div className="w-4"></div>
                        <div className="flex-shrink-0">Status</div>
                        <div className="w-24 flex-shrink-0">Ident</div>
                        <div className="w-28 flex-shrink-0">Class</div>
                        <div className="flex-1">Description</div>
                        <div className="w-24 text-right">Value</div>
                        <div className="w-16"></div>
                    </div>

                    <div className="flex-1 overflow-y-auto attire-scrollbar relative">
                        {loading && products.length === 0 ? (
                            <div className="h-full flex flex-col items-center justify-center space-y-6">
                                <Loader2 className="animate-spin text-attire-accent" size={32} />
                                <p className="text-[11px] font-black uppercase tracking-[0.3em] text-gray-500 animate-pulse">Syncing Neural Catalog...</p>
                            </div>
                        ) : products.length === 0 ? (
                            <div className="h-64 flex flex-col items-center justify-center p-12 text-center">
                                <Package size={48} className="text-gray-300 dark:text-white/5 mb-6" />
                                <p className="text-[12px] font-black uppercase tracking-[0.2em] text-gray-400">Zero matches detected</p>
                                <p className="text-[10px] text-gray-500 mt-2">Adjust your refinement criteria or refresh the neural link</p>
                                <button 
                                    onClick={clearAll}
                                    className="mt-8 px-6 py-3 bg-attire-accent/10 text-attire-accent text-[9px] font-black uppercase tracking-widest rounded-xl hover:bg-attire-accent hover:text-black transition-all"
                                >
                                    Force Reset
                                </button>
                            </div>
                        ) : (
                            <div className="divide-y divide-black/5 dark:divide-white/5">
                                <AnimatePresence mode="popLayout">
                                    {products.map((product) => (
                                        <ProductLogRow
                                            key={product.id}
                                            product={product}
                                            expanded={expandedId === product.id}
                                            onToggle={() => setExpandedId(expandedId === product.id ? null : product.id)}
                                            onAdd={addItem}
                                        />
                                    ))}
                                </AnimatePresence>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
