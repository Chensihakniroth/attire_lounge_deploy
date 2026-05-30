import React, { useState, useEffect, useRef, useCallback } from 'react';
import { 
    Search, 
    Trash2, 
    Plus, 
    Minus,
    X,
    Undo2
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { usePOS } from './POSContext';
import { useAdmin } from '../admin/AdminContext';
import axios from 'axios';

// --- Inline Quick Search Bar ---
const InlineSearch = ({ onSearchClick, addItem }) => {
    const [query, setQuery] = useState('');
    const [results, setResults] = useState([]);
    const [isOpen, setIsOpen] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const inputRef = useRef(null);
    const debounceRef = useRef(null);
    const containerRef = useRef(null);

    useEffect(() => {
        const handleClickOutside = (e) => {
            if (containerRef.current && !containerRef.current.contains(e.target)) {
                setIsOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const searchProducts = useCallback(async (q) => {
        // Clear any pending timeout immediately to prevent stale queries from executing
        clearTimeout(debounceRef.current);

        if (!q || q.trim().length < 1) {
            setResults([]);
            setIsOpen(false);
            return;
        }
        const trimmed = q.trim();

        // 1. Cache-first: instant client-side filter from preloaded cache
        const cacheKey = JSON.stringify({ categories: [], stockStatus: 'all', name: '', attribute: '', code: '' });
        const cached = window.__posProductCache?.[cacheKey];
        if (cached && cached.length > 0) {
            const lower = trimmed.toLowerCase();
            const matched = cached.filter(p =>
                p.name?.toLowerCase().includes(lower) ||
                p.sku?.toLowerCase().includes(lower) ||
                p.display_name?.toLowerCase().includes(lower)
            ).slice(0, 8);
            setResults(matched);
            setIsOpen(matched.length > 0);

            // Exact SKU match → auto-add and clear
            const exactSku = cached.find(p => p.sku?.toLowerCase() === lower);
            if (exactSku) {
                addItem(exactSku);
                setQuery('');
                setResults([]);
                setIsOpen(false);
                return;
            }
        }

        // 2. Debounced API fallback
        debounceRef.current = setTimeout(async () => {
            // Guard: check if input has been cleared since the timeout was scheduled
            if (!inputRef.current?.value?.trim()) {
                setResults([]);
                setIsOpen(false);
                return;
            }

            setIsLoading(true);
            try {
                const res = await axios.get('/api/v1/admin/pos/products', {
                    params: { search: trimmed, name: trimmed, code: trimmed, per_page: 8 }
                });
                
                // Guard: check if input was cleared while the request was in flight
                if (!inputRef.current?.value?.trim()) {
                    setResults([]);
                    setIsOpen(false);
                    return;
                }

                const data = res.data?.data || res.data || [];
                
                // Exact SKU match in API results → auto-add and clear!
                const exactSku = data.find(p => p.sku?.toLowerCase() === trimmed.toLowerCase());
                if (exactSku) {
                    addItem(exactSku);
                    setQuery('');
                    setResults([]);
                    setIsOpen(false);
                    return;
                }

                setResults(data);
                setIsOpen(data.length > 0);
            } catch (e) {
                console.error('Inline search failed', e);
            } finally {
                setIsLoading(false);
            }
        }, 220);
    }, [addItem]);

    const handleChange = (e) => {
        const val = e.target.value;
        setQuery(val);
        searchProducts(val);
    };

    const handleSelect = (product) => {
        addItem(product);
        setQuery('');
        setResults([]);
        setIsOpen(false);
        inputRef.current?.focus();
    };

    const handleClear = () => {
        setQuery('');
        setResults([]);
        setIsOpen(false);
        inputRef.current?.focus();
    };

    return (
        <div ref={containerRef} className="relative w-full group">
            <Search className="absolute left-6 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-[#f5a81c] transition-colors pointer-events-none" size={18} />
            <input
                ref={inputRef}
                type="text"
                value={query}
                onChange={handleChange}
                onFocus={() => query && results.length > 0 && setIsOpen(true)}
                placeholder="Scan or search product name / SKU..."
                className="w-full bg-black/[0.02] dark:bg-[#161b22] border-2 border-transparent hover:border-[#f5a81c]/20 dark:hover:border-[#30363d] rounded-xl py-4 pl-14 pr-24 text-[13px] font-black uppercase tracking-[0.2em] text-gray-900 dark:text-[#c9d1d9] outline-none focus:border-[#f5a81c]/50 focus:bg-background dark:focus:bg-[#0d1117] transition-all placeholder:text-gray-400/50 dark:placeholder:text-[#8b949e]/20"
            />
            <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-1">
                {query && (
                    <button onClick={handleClear} className="p-2 text-gray-400 hover:text-gray-700 dark:hover:text-white transition-colors rounded-lg">
                        <X size={14} />
                    </button>
                )}
                <button
                    onClick={onSearchClick}
                    className="p-2.5 rounded-xl bg-[#f5a81c]/10 text-[#f5a81c] hover:bg-[#f5a81c] hover:text-[#0d1117] transition-all flex items-center justify-center shadow-lg shadow-black/5"
                    title="Open Full Catalog"
                >
                    <Search size={16} />
                </button>
            </div>

            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ opacity: 0, y: -4, scale: 0.98 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: -4, scale: 0.98 }}
                        transition={{ duration: 0.15, ease: 'easeOut' }}
                        style={{ willChange: 'transform, opacity' }}
                        className="absolute top-full left-0 right-0 mt-2 bg-white dark:bg-[#161b22] border border-black/10 dark:border-[#30363d] rounded-2xl shadow-xl shadow-black/10 dark:shadow-black/40 overflow-hidden z-50"
                    >
                        {results.map((product) => (
                            <button
                                key={product.id}
                                onClick={() => handleSelect(product)}
                                className="w-full flex items-center gap-4 px-5 py-3.5 hover:bg-[#f5a81c]/5 transition-colors border-b border-black/5 dark:border-[#30363d] last:border-0 text-left group/row"
                            >
                                <div className={`w-1.5 h-8 rounded-full flex-shrink-0 ${product.stock_qty > 0 ? 'bg-green-400' : 'bg-red-400'}`} />
                                <div className="flex-1 min-w-0">
                                    <p className="text-[13px] font-black uppercase tracking-wide text-gray-900 dark:text-[#c9d1d9] truncate group-hover/row:text-[#f5a81c] transition-colors">
                                        {product.display_name || product.name}
                                    </p>
                                    <p className="text-[10px] font-bold text-gray-400 dark:text-[#8b949e]/60 font-mono uppercase tracking-wider mt-0.5">
                                        {product.sku}
                                    </p>
                                </div>
                                <div className="text-right flex-shrink-0">
                                    <p className="text-[14px] font-black text-gray-900 dark:text-[#c9d1d9] font-mono">${parseFloat(product.price).toLocaleString()}</p>
                                    <p className={`text-[9px] font-black uppercase tracking-widest ${product.stock_qty > 0 ? 'text-green-500' : 'text-red-400'}`}>
                                        {product.stock_qty > 0 ? `${product.stock_qty} left` : 'out of stock'}
                                    </p>
                                </div>
                                <div className="w-7 h-7 rounded-full bg-[#f5a81c]/10 text-[#f5a81c] flex items-center justify-center flex-shrink-0 opacity-0 group-hover/row:opacity-100 transition-opacity">
                                    <Plus size={13} />
                                </div>
                            </button>
                        ))}
                        {isLoading && results.length === 0 && (
                            <div className="px-5 py-4 text-[11px] font-black uppercase tracking-widest text-gray-400 dark:text-[#8b949e]/40 text-center">Searching...</div>
                        )}
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};


const OrderLedger = ({ onSearchClick }) => {
    const { activeTab, updateQty, removeItem, addItem, updateItemDiscount, updateItemPrice, updateItemAttribute, selectAllRefundItems } = usePOS();
    const { activeOutlet, OUTLET_CONFIG } = useAdmin();
    const outletData = OUTLET_CONFIG?.[activeOutlet] || { label: 'Attire Lounge' };
    const isRefund = activeTab.isRefundMode;

    return (
        <div className={`flex-1 flex flex-col overflow-hidden h-full bg-[#f4f5f8] dark:bg-[#0d1117] transition-all duration-500 ${isRefund ? 'ring-inset ring-2 ring-red-500/20' : ''}`}>

            {/* Header Area */}
            <div className={`p-4 bg-white dark:bg-[#0d1117] border-b border-black/5 dark:border-[#30363d] sticky top-0 z-20 transition-all duration-300`}>
                {isRefund ? (
                    <div className="flex items-center justify-between gap-4 p-1">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-xl bg-red-500/10 flex items-center justify-center text-red-500">
                                <Undo2 size={20} />
                            </div>
                            <div>
                                <h4 className="text-[11px] font-black uppercase tracking-[0.2em] text-gray-900 dark:text-white">Refund Selection</h4>
                                <p className="text-[9px] text-gray-500 uppercase tracking-widest font-bold">Pick items to return from Invoice #{activeTab.originalInvoice?.invoice_number}</p>
                            </div>
                        </div>
                        
                        <button 
                            onClick={selectAllRefundItems}
                            className="flex items-center gap-2 px-6 py-3 rounded-xl bg-red-500 text-white text-[10px] font-black uppercase tracking-[0.2em] hover:bg-red-600 transition-all shadow-lg shadow-red-500/20 active:scale-95"
                        >
                            <Plus size={14} className="rotate-45" /> Select All Items
                        </button>
                    </div>
                ) : (
                    <InlineSearch onSearchClick={onSearchClick} addItem={addItem} />
                )}
            </div>

            {/* Active Order Ledger */}
            <div className="flex-1 overflow-y-auto attire-scrollbar p-0">
                {activeTab.cartItems.length === 0 ? (
                    <div className="h-full flex flex-col items-center justify-center text-center p-12">
                        <motion.div 
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ duration: 1.5, ease: "easeOut" }}
                            className="relative"
                        >
                            <img 
                                src={outletData.logo || "https://bucket-production-4ca0.up.railway.app/product-assets/uploads/asset/ALO.png"} 
                                alt={outletData.label || "Attire Lounge"} 
                                className="w-64 h-auto relative z-10 brightness-110 opacity-80 cursor-default"
                            />
                        </motion.div>
                    </div>
                ) : (
                    <table className="w-full text-left border-collapse">
                        <thead className="sticky top-0 z-10 bg-white dark:bg-[#161b22] border-b border-black/5 dark:border-[#30363d] shadow-none">
                            <tr>
                                <th className="pl-6 pr-2 py-5 text-[11px] font-black uppercase tracking-[0.25em] text-gray-400 dark:text-[#8b949e]/40 w-12">#</th>
                                <th className="px-4 py-5 text-[11px] font-black uppercase tracking-[0.25em] text-gray-400 dark:text-[#8b949e]/40 w-36">SKU</th>
                                <th className="px-4 py-5 text-[11px] font-black uppercase tracking-[0.25em] text-gray-400 dark:text-[#8b949e]/40">Product Name</th>
                                <th className="px-4 py-5 text-[11px] font-black uppercase tracking-[0.25em] text-gray-400 dark:text-[#8b949e]/40 w-40 text-center">Qty / Balance</th>
                                <th className="px-4 py-5 text-[11px] font-black uppercase tracking-[0.25em] text-gray-400 dark:text-[#8b949e]/40 w-28 text-right">Unit Price</th>
                                <th className="px-4 py-5 text-[11px] font-black uppercase tracking-[0.25em] text-gray-400 dark:text-[#8b949e]/40 w-[180px] text-left">Disc. Override</th>
                                <th className="px-4 py-5 text-[11px] font-black uppercase tracking-[0.25em] text-gray-400 dark:text-[#8b949e]/40 w-32 text-right">Total</th>
                                <th className="px-6 py-5 text-[11px] font-black uppercase tracking-[0.25em] text-gray-400 dark:text-[#8b949e]/40 w-16 text-center"></th>
                            </tr>
                        </thead>
                        <tbody className="text-[13px] font-bold text-gray-700 dark:text-white/80">
                            <AnimatePresence mode="popLayout">
                                {activeTab.cartItems
                                    .filter(item => !item.is_service)
                                    .map((item, index) => {
                                        const rowTotal = (item.unit_price * item.quantity);
                                        const discountAmount = item.discount_type === 'percentage' 
                                            ? (rowTotal * (item.discount_value / 100))
                                            : (item.discount_type === 'price' ? item.discount_value : 0);
                                        const finalTotal = Math.max(0, rowTotal - discountAmount);
                                        const hasDiscount = item.discount_value > 0;

                                        return (
                                            <motion.tr 
                                                layout
                                                initial={{ opacity: 0, y: 5 }}
                                                animate={{ opacity: item.is_fully_refunded ? 0.4 : 1, y: 0 }}
                                                exit={{ opacity: 0, x: -20 }}
                                                key={item.cart_item_id}
                                                className={`group border-b border-black/5 dark:border-white/[0.02] hover:bg-black/[0.02] dark:hover:bg-white/[0.01] transition-all ${item.is_fully_refunded ? 'bg-black/5 dark:bg-white/5 grayscale pointer-events-none' : ''}`}
                                            >
                                                <td className="pl-6 pr-2 py-4 font-mono text-[12px] text-gray-400/50 dark:text-[#8b949e]/40">{String(index + 1).padStart(2, '0')}</td>
                                                <td className="px-4 py-4 font-mono text-[13px] font-black text-[#0d3542] dark:text-[#f5a81c] tracking-tighter uppercase truncate">{item.product_sku || 'N/A'}</td>
                                                <td className="px-4 py-4">
                                                    <div className="flex flex-col gap-0.5">
                                                        <div className="flex items-center gap-2">
                                                            <div className="flex flex-col">
                                                                <span className="uppercase text-[16px] font-black leading-tight tracking-[0.02em] text-gray-900 dark:text-[#c9d1d9] group-hover:text-[#0d3542] dark:group-hover:text-[#f5a81c] transition-colors">{item.product_name}</span>
                                                                {item.product_variant && (
                                                                    <span className="text-[10px] font-bold text-gray-500 uppercase tracking-[0.15em] mt-0.5">{String(item.product_variant).replace(/^-/, '').trim()}</span>
                                                                )}
                                                            </div>
                                                            {item.is_fully_refunded && (
                                                                <span className="text-[8px] px-2 py-0.5 bg-red-500 text-white rounded-md font-black uppercase tracking-widest">Fully Refunded</span>
                                                            )}
                                                            {!item.is_fully_refunded && item.past_refunded_qty > 0 && (
                                                                <span className="text-[8px] px-2 py-0.5 bg-orange-500/10 text-orange-500 border border-orange-500/20 rounded-md font-black uppercase tracking-widest">
                                                                    {item.past_refunded_qty} Units Returned
                                                                </span>
                                                            )}
                                                        </div>
                                                        <div className="flex items-center gap-2">
                                                            {item.gift_wrap && <span className="text-[9px] px-2 py-0.5 bg-[#0d3542]/10 dark:bg-[#f5a81c]/10 text-[#0d3542] dark:text-[#f5a81c] rounded-md font-black uppercase tracking-widest border border-[#0d3542]/20 dark:border-[#f5a81c]/20">Gift Wrap</span>}
                                                            {item.total_original_qty > 0 && (
                                                                <span className="text-[9px] text-gray-400 font-bold uppercase tracking-widest">
                                                                    Original Order: {item.total_original_qty} units
                                                                </span>
                                                            )}
                                                        </div>

                                                        {/* Caffeine Customizations */}
                                                        {activeOutlet === 'caffeine' && !item.is_service && !isRefund && (
                                                            <div className="flex flex-col gap-1.5 mt-2.5">
                                                                <div className="flex items-center gap-2">
                                                                    <span className="text-[9px] font-black uppercase tracking-widest text-gray-400 dark:text-[#8b949e]/60 w-12">Sugar:</span>
                                                                    <div className="flex gap-1">
                                                                        {['100%', '75%', '50%', '25%', '0%'].map((lvl) => (
                                                                            <button
                                                                                key={lvl}
                                                                                onClick={() => updateItemAttribute(item.cart_item_id, 'sugar_level', lvl)}
                                                                                className={`px-1.5 py-0.5 rounded text-[9px] font-black tracking-wider border transition-all ${
                                                                                    (item.sugar_level || '100%') === lvl
                                                                                        ? 'bg-[#6f4e37] text-white border-[#6f4e37]'
                                                                                        : 'bg-transparent text-gray-500 dark:text-[#8b949e]/60 border-gray-300 dark:border-[#30363d] hover:border-[#6f4e37]/50'
                                                                                }`}
                                                                            >
                                                                                {lvl}
                                                                            </button>
                                                                        ))}
                                                                    </div>
                                                                </div>
                                                                <div className="flex items-center gap-2">
                                                                    <span className="text-[9px] font-black uppercase tracking-widest text-gray-400 dark:text-[#8b949e]/60 w-12">Milk:</span>
                                                                    <div className="flex gap-1">
                                                                        {['None', 'Oat', 'soy', 'coconut'].map((mlk) => (
                                                                            <button
                                                                                key={mlk}
                                                                                onClick={() => updateItemAttribute(item.cart_item_id, 'milk_type', mlk)}
                                                                                className={`px-1.5 py-0.5 rounded text-[9px] font-black tracking-wider uppercase border transition-all ${
                                                                                    (item.milk_type || 'Oat') === mlk
                                                                                        ? 'bg-[#6f4e37] text-white border-[#6f4e37]'
                                                                                        : 'bg-transparent text-gray-500 dark:text-[#8b949e]/60 border-gray-300 dark:border-[#30363d] hover:border-[#6f4e37]/50'
                                                                                }`}
                                                                            >
                                                                                {mlk}
                                                                            </button>
                                                                        ))}
                                                                    </div>
                                                                </div>
                                                            </div>
                                                        )}
                                                    </div>
                                                </td>
                                                <td className="px-4 py-4">
                                                    <div className="flex items-center justify-center bg-black/5 dark:bg-[#161b22] rounded-xl border border-transparent p-0.5 w-32 mx-auto group-hover:border-black/5 dark:group-hover:border-[#30363d] transition-all">
                                                        <button 
                                                            onClick={() => updateQty(item.cart_item_id, -1)}
                                                            className="p-2 hover:text-red-500 hover:bg-red-500/10 rounded-lg transition-all"
                                                        >
                                                            <Minus size={14} />
                                                        </button>
                                                        <span className="flex-1 text-center font-black text-[16px] text-gray-900 dark:text-[#c9d1d9]">{item.quantity}</span>
                                                        <button 
                                                            onClick={() => updateQty(item.cart_item_id, 1)}
                                                            className="p-2 hover:text-[#0d3542] dark:hover:text-[#f5a81c] hover:bg-[#0d3542]/10 dark:hover:bg-[#f5a81c]/10 rounded-lg transition-all"
                                                        >
                                                            <Plus size={14} />
                                                        </button>
                                                    </div>
                                                </td>
                                                <td className="px-4 py-4">
                                                    <div className="flex items-center justify-end gap-1 p-1 bg-black/5 dark:bg-[#161b22] rounded-xl border border-transparent hover:border-black/5 dark:hover:border-[#30363d] focus-within:border-[#f5a81c] dark:focus-within:border-[#f5a81c] transition-all w-fit ml-auto">
                                                        <div className="w-7 h-7 rounded-lg flex items-center justify-center text-[13px] font-black bg-white dark:bg-[#0d1117] text-gray-400 dark:text-[#8b949e]/60 shadow-sm">
                                                            $
                                                        </div>
                                                        <input 
                                                            type="number"
                                                            min="0"
                                                            step="0.01"
                                                            value={item.unit_price}
                                                            onChange={(e) => {
                                                                const val = e.target.value === '' ? 0 : Math.max(0, parseFloat(e.target.value));
                                                                updateItemPrice(item.cart_item_id, val);
                                                            }}
                                                            className="w-16 bg-transparent text-right font-mono text-[14px] font-black text-gray-900 dark:text-[#c9d1d9] outline-none [appearance:textfield] pr-1"
                                                        />
                                                    </div>
                                                </td>
                                                <td className="px-4 py-4">
                                                    <div className="flex items-center justify-start gap-1 p-1 bg-black/5 dark:bg-[#161b22] rounded-xl border border-transparent hover:border-black/5 dark:hover:border-[#30363d] transition-all w-fit">
                                                        <button 
                                                            onClick={() => {
                                                                const newType = item.discount_type === 'percentage' ? 'price' : 'percentage';
                                                                updateItemDiscount(item.cart_item_id, newType, item.discount_value);
                                                            }}
                                                            className={`w-8 h-8 rounded-lg flex items-center justify-start pl-2.5 text-[14px] font-black transition-all ${hasDiscount ? 'bg-[#0d3542] dark:bg-[#f5a81c] text-white dark:text-black shadow-none' : 'bg-black/5 dark:bg-[#0d1117] text-gray-400 dark:text-[#8b949e]/40 hover:text-gray-900 dark:hover:text-[#c9d1d9]'}`}
                                                        >
                                                            {item.discount_type === 'percentage' ? '%' : '$'}
                                                        </button>
                                                        <input 
                                                            type="number"
                                                            min="0"
                                                            placeholder="0"
                                                            value={item.discount_value || ''}
                                                            onChange={(e) => {
                                                                const val = Math.max(0, parseFloat(e.target.value) || 0);
                                                                updateItemDiscount(item.cart_item_id, item.discount_type || 'percentage', val);
                                                            }}
                                                            className={`w-14 bg-transparent text-left font-black text-[15px] outline-none transition-colors ml-1 [appearance:textfield] ${hasDiscount ? 'text-gray-900 dark:text-[#c9d1d9]' : 'text-gray-400 dark:text-[#8b949e]/40 focus:text-gray-900 dark:focus:text-[#c9d1d9]'}`}
                                                        />
                                                    </div>
                                                </td>
                                                <td className="px-4 py-4 text-right font-black text-gray-900 dark:text-[#c9d1d9] text-[18px] border-l border-black/5 dark:border-[#30363d] tracking-tighter whitespace-nowrap">
                                                    ${finalTotal.toLocaleString()}
                                                </td>
                                                <td className="px-6 py-4 text-center">
                                                    <button 
                                                        onClick={() => removeItem(item.cart_item_id)}
                                                        className="p-2.5 text-gray-200 dark:text-[#8b949e]/40 hover:text-red-500 hover:bg-red-500/10 rounded-xl transition-all opacity-0 group-hover:opacity-100"
                                                    >
                                                        <Trash2 size={16} />
                                                    </button>
                                                </td>
                                            </motion.tr>
                                        );
                                    })}

                                {/* Service Add-ons Section Divider */}
                                {activeTab.cartItems.some(i => i.is_service) && (
                                    <tr className="bg-black/2 dark:bg-white/2 border-y border-black/10 dark:border-white/10">
                                        <td colSpan={8} className="px-6 py-2.5 text-[10px] font-black uppercase tracking-[0.4em] text-[#0d3542] dark:text-[#f5a81c]">Add-on Services</td>
                                    </tr>
                                )}

                                {activeTab.cartItems
                                    .filter(item => item.is_service)
                                    .map((item, index) => (
                                        <motion.tr 
                                            layout
                                            initial={{ opacity: 0, scale: 0.98 }}
                                            animate={{ opacity: 1, scale: 1 }}
                                            key={item.cart_item_id}
                                            className="group border-b border-black/5 dark:border-white/2 hover:bg-blue-500/2 transition-all"
                                        >
                                            <td className="pl-6 pr-2 py-4 font-mono text-[10px] text-blue-500/30">ADD</td>
                                            <td className="px-4 py-4 font-mono text-[13px] font-black text-blue-500/60 tracking-tighter uppercase truncate">{item.product_sku || 'N/A'}</td>
                                            <td className="px-4 py-4">
                                                <div className="flex flex-col">
                                                    <span className="uppercase text-[16px] font-black leading-tight tracking-[0.02em] text-gray-900 dark:text-[#c9d1d9] group-hover:text-blue-400 transition-colors">{item.product_name}</span>
                                                    <span className="text-[8px] font-black uppercase tracking-widest text-blue-400/60">+ Service Add-on</span>
                                                </div>
                                            </td>
                                            <td className="px-4 py-4 text-center">
                                                <div className="inline-flex px-3 py-1 bg-black/5 dark:bg-white/5 rounded-lg font-black text-[13px] text-gray-400">1</div>
                                            </td>
                                            <td className="px-4 py-4 text-right font-mono text-[14px] font-bold text-gray-400">${parseFloat(item.unit_price).toLocaleString()}</td>
                                            <td className="px-4 py-4">
                                                <div className="text-[9px] font-black uppercase tracking-widest text-gray-400 italic">Fixed Price</div>
                                            </td>
                                            <td className="px-4 py-4 text-right font-black text-gray-900 dark:text-[#c9d1d9] text-[18px] border-l border-black/5 dark:border-[#30363d] tracking-tighter">
                                                ${parseFloat(item.unit_price).toLocaleString()}
                                            </td>
                                            <td className="px-6 py-4 text-center">
                                                <button 
                                                    onClick={() => removeItem(item.cart_item_id)}
                                                    className="p-2.5 text-gray-200 dark:text-[#8b949e]/40 hover:text-red-500 hover:bg-red-500/10 rounded-xl transition-all opacity-0 group-hover:opacity-100"
                                                >
                                                    <Trash2 size={16} />
                                                </button>
                                            </td>
                                        </motion.tr>
                                    ))}
                            </AnimatePresence>
                        </tbody>
                    </table>
                )}
            </div>
        </div>
    );
};

export default OrderLedger;
