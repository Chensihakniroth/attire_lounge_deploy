import React, { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import axios from 'axios';
import { motion, AnimatePresence } from 'framer-motion';
import { 
    Package, Search, X, Plus, Edit, Trash2, 
    Hash, DollarSign, Layers, Check, 
    Loader, Filter, ChevronDown, Archive, ChevronLeft,
    Download, Upload, Settings, Tag, Smartphone, Scissors,
    Menu, ShoppingBag, ShoppingCart, Command, AlertCircle,
    ArrowUp, ArrowDown, Keyboard, Save
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import BulkActionDialog from './pos/BulkActionDialog';
import ModernModal from '../../common/ModernModal';

// Helper for formatting price
const formatPrice = (price) => {
    return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'USD',
    }).format(price || 0);
};

// Sidebar Selection Component - Revamped with Navy Blocks - Now flush to the edges! ✨
const SidebarSection = ({ title, children }) => (
    <div className="mb-0 border-b border-black/5 dark:border-white/5 transition-[background-color,border-color] duration-150">
        <div className="bg-gray-200 dark:bg-[#1a1a1a] border-y border-[#0d3542]/10 text-[#0d3542] dark:text-attire-accent px-6 py-2.5 text-[10px] font-black uppercase tracking-[0.3em] transition-colors duration-200">
            {title}
        </div>
        <div className="bg-[#fcfcfa] dark:bg-[#111] p-6 space-y-5">
            {children}
        </div>
    </div>
);

// --- Quick Edit Component ---
const QuickEditCell = ({ value, prefix = '', onSave, onClose }) => {
    const [val, setVal] = useState(value);
    const inputRef = useRef(null);

    useEffect(() => {
        inputRef.current?.focus();
        inputRef.current?.select();
    }, []);

    const handleKeyDown = (e) => {
        if (e.key === 'Enter') onSave(val);
        if (e.key === 'Escape') onClose();
    };

    return (
        <div className="absolute inset-0 z-50 bg-[#f8f8f6] dark:bg-[#222] flex items-center px-4 ring-2 ring-[#0d3542] shadow-[0_0_30px_rgba(13,53,66,0.2)] translate-y-[-2px]">
            {prefix && <span className="text-[10px] font-black text-[#0d3542] mr-2">{prefix}</span>}
            <input 
                ref={inputRef}
                value={val}
                onChange={e => setVal(e.target.value)}
                onKeyDown={handleKeyDown}
                onBlur={onClose}
                className="flex-1 bg-transparent border-none outline-none text-sm font-black text-gray-900 dark:text-white"
            />
            <div className="flex items-center gap-1 ml-2">
                <div className="px-1 py-0.5 bg-white/5 rounded text-[7px] font-black uppercase text-[#0d3542]">Enter: Save</div>
            </div>
        </div>
    );
};

// --- Memoized Product Row Component ---
const ProductRow = React.memo(({ 
    product, isSelected, isFocused, quickEditField, 
    onToggleSelect, onFocus, onEdit, onQuickEdit, onUpdateField,
    formatPrice 
}) => {
    const p = product;
    return (
        <tr 
            key={p.id} id={`row-${p.id}`}
            onClick={() => { onFocus(p.id); onToggleSelect(p.id); }}
            onDoubleClick={() => onEdit(p)}
            className={`group cursor-pointer border-b border-black/[0.03] dark:border-white/[0.03] ${isSelected ? 'bg-[#0d3542]/10' : 'hover:bg-black/[0.02] dark:hover:bg-white/[0.02]'} ${isFocused ? 'bg-black/[0.04] dark:bg-white/[0.08] ring-1 ring-inset ring-[#0d3542]/30' : ''}`}
        >
            <td className="px-8 py-4 text-center">
                <div className={`w-5 h-5 rounded border flex items-center justify-center transition-colors duration-200 ${isSelected ? 'bg-[#0d3542] border-[#0d3542]' : 'border-black/20 dark:border-white/20 bg-transparent'}`}>
                    {isSelected && <Check size={12} className="text-black" />}
                </div>
            </td>
            <td className="px-8 py-4 font-mono font-bold tracking-tighter text-gray-500 dark:text-white/50 uppercase text-[12px]">{p.sku}</td>
            <td className="px-8 py-4">
                <div className="flex flex-col">
                    <span className="font-black text-gray-900 dark:text-white uppercase tracking-wide group-hover:text-[#0d3542] transition-colors text-[14px]">{p.name}</span>
                    <span className="text-[11px] text-gray-400 dark:text-white/30 uppercase font-bold tracking-widest">{p.variant || 'STANDARD EDITION'}</span>
                </div>
            </td>
            <td className="px-8 py-4">
                <span className="px-3 py-1 bg-black/5 dark:bg-white/5 text-[11px] font-black text-gray-500 dark:text-white/60 rounded-sm uppercase tracking-widest">{p.category}</span>
            </td>
            <td className="px-8 py-4 text-right font-mono font-bold text-[#0d3542] text-[15px] relative">
                {isFocused && quickEditField === 'price' ? (
                    <QuickEditCell value={p.price} prefix="$" onSave={(val) => onUpdateField(p.id, { price: val })} onClose={() => onQuickEdit(null)} />
                ) : formatPrice(p.price)}
            </td>
            <td className={`px-8 py-4 text-right font-mono font-bold relative text-[15px] ${p.stock_qty <= (p.min_stock || 5) ? 'text-rose-500' : 'text-gray-600 dark:text-white/70'}`}>
                {isFocused && quickEditField === 'stock' ? (
                    <QuickEditCell value={p.stock_qty} onSave={(val) => onUpdateField(p.id, { stock_qty: val })} onClose={() => onQuickEdit(null)} />
                ) : (
                    <>{p.stock_qty} <span className="text-[10px] opacity-30 ml-1">UNITS</span></>
                )}
            </td>
            <td className="px-8 py-4 text-center">
                <div className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest ${p.is_active ? 'bg-emerald-500/10 text-emerald-400' : 'bg-black/5 dark:bg-white/5 text-gray-400 dark:text-white/30'}`}>
                    <div className={`w-1.5 h-1.5 rounded-full ${p.is_active ? 'bg-emerald-400' : 'bg-black/20 dark:bg-white/30'}`} />
                    {p.is_active ? 'Active' : 'Archived'}
                </div>
            </td>
        </tr>
    );
});

const ProductsPage = () => {
    const queryClient = useQueryClient();
    const [view, setView] = useState('list'); // 'list' | 'form'
    const [activeTab, setActiveTab] = useState('general');
    const [selectedIds, setSelectedIds] = useState(new Set());
    const [focusedId, setFocusedId] = useState(null);
    const [isBulkDialogOpen, setIsBulkDialogOpen] = useState(false);
    const [quickEditField, setQuickEditField] = useState(null); // 'price' | 'stock' | null
    const [isSaving, setIsSaving] = useState(false);

    // Sidebar Filter States
    const [filters, setFilters] = useState({
        code: '',
        nameBarcode: '',
        attribute: '',
        group: 'ALL GROUPS'
    });
    
    // Form State
    const [editingProduct, setEditingProduct] = useState(null);
    const [formData, setFormData] = useState({
        sku: '', name: '', price: '', stock_qty: '', category: '', is_service: false,
        barcode: '', status: 'available', min_stock: '0', max_stock: '99999',
        watch_threshold: false, variant: '', description: '', attributes: []
    });
    const [showFormModal, setShowFormModal] = useState(false);

    // --- Debounced Filters for API ---
    const [debouncedFilters, setDebouncedFilters] = useState(filters);
    useEffect(() => {
        const timer = setTimeout(() => {
            setDebouncedFilters(filters);
        }, 300);
        return () => clearTimeout(timer);
    }, [filters]);

    const searchRef = useRef(null);

    // --- Data Fetching ---
    const { data: productsData, isLoading, isFetching } = useQuery({
        queryKey: ['admin-pos-products', debouncedFilters.nameBarcode, debouncedFilters.code, debouncedFilters.group],
        keepPreviousData: true, // Keep the UI stable while fetching new results
        queryFn: async () => {
            const { data } = await axios.get('/api/v1/admin/pos/products', {
                params: { 
                    search: debouncedFilters.nameBarcode || debouncedFilters.code, 
                    category: debouncedFilters.group !== 'ALL GROUPS' ? debouncedFilters.group : '',
                    per_page: 100 
                }
            });
            return data;
        }
    });
    
    // --- Metric Calculations ---
    const metrics = useMemo(() => {
        const data = productsData?.data || [];
        const totalValue = data.reduce((acc, p) => acc + (parseFloat(p.price || 0) * (p.stock_qty || 0)), 0);
        const criticalCount = data.filter(p => p.stock_qty <= (p.min_stock || 5)).length;
        return {
            totalValue,
            criticalCount,
            totalSkus: data.length
        };
    }, [productsData]);

    const products = useMemo(() => productsData?.data || [], [productsData]);

    const categories = useMemo(() => {
        const unique = Array.from(new Set(products.map(p => p.category).filter(Boolean)));
        return ['ALL GROUPS', ...unique.sort()];
    }, [products]);

    // --- Mutations ---
    const mutation = useMutation({
        mutationFn: (data) => {
            if (editingProduct) return axios.put(`/api/v1/admin/pos/products/${editingProduct.id}`, data);
            return axios.post('/api/v1/admin/pos/products', data);
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['admin-pos-products'] });
            setView('list');
            setIsSaving(false);
        },
        onError: () => setIsSaving(false)
    });

    const updateMutation = useMutation({
        mutationFn: ({ id, data }) => axios.put(`/api/v1/admin/pos/products/${id}`, data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['admin-pos-products'] });
            setQuickEditField(null);
        }
    });

    const bulkUpdateMutation = useMutation({
        mutationFn: (data) => axios.post('/api/v1/admin/pos/products/bulk-update', data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['admin-pos-products'] });
            setSelectedIds(new Set());
            setIsBulkDialogOpen(false);
        }
    });

    const bulkArchiveMutation = useMutation({
        mutationFn: (data) => axios.post('/api/v1/admin/pos/products/bulk-deactivate', data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['admin-pos-products'] });
            setSelectedIds(new Set());
            setIsBulkDialogOpen(false);
        }
    });

    // --- Keyboard Navigation ---
    useEffect(() => {
        const handleKeyDown = (e) => {
            // Focus Name/Barcode filter with '/'
            if (e.key === '/' && document.activeElement.tagName !== 'INPUT') {
                e.preventDefault();
                document.getElementById('filter-name')?.focus();
            }

            // Command Palette / Bulk Action
            if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
                e.preventDefault();
                if (selectedIds.size > 0) setIsBulkDialogOpen(true);
            }

            // Selection & Navigation (List View Only)
            if (view === 'list') {
                if (e.key === 'ArrowDown') {
                    // Only navigate if not typing in an input
                    if (document.activeElement.tagName === 'INPUT' || document.activeElement.tagName === 'TEXTAREA') return;
                    e.preventDefault();
                    setFocusedId(prev => {
                        const idx = products.findIndex(p => p.id === prev);
                        if (idx === -1) return products[0]?.id;
                        return products[Math.min(idx + 1, products.length - 1)]?.id;
                    });
                }
                if (e.key === 'ArrowUp') {
                    // Only navigate if not typing in an input
                    if (document.activeElement.tagName === 'INPUT' || document.activeElement.tagName === 'TEXTAREA') return;
                    e.preventDefault();
                    setFocusedId(prev => {
                        const idx = products.findIndex(p => p.id === prev);
                        if (idx <= 0) return products[0]?.id;
                        return products[idx - 1]?.id;
                    });
                }
                if (e.key === ' ') {
                    if (document.activeElement.tagName !== 'INPUT') {
                        e.preventDefault();
                        if (focusedId) toggleSelect(focusedId);
                    }
                }
                if (e.key.toLowerCase() === 'e') {
                    if (focusedId && document.activeElement.tagName !== 'INPUT') {
                        e.preventDefault();
                        setQuickEditField('price');
                    }
                }
                if (e.key.toLowerCase() === 's') {
                    if (focusedId && document.activeElement.tagName !== 'INPUT') {
                        e.preventDefault();
                        setQuickEditField('stock');
                    }
                }
                if (e.key === 'Enter') {
                    if (focusedId && document.activeElement.tagName !== 'INPUT') {
                        const p = products.find(p => p.id === focusedId);
                        if (p) handleEditClick(p);
                    }
                }
                if (e.key === 'Escape') {
                    if (document.activeElement.tagName === 'INPUT') {
                        document.activeElement.blur();
                    } else {
                        setSelectedIds(new Set());
                        setFilters({...filters, nameBarcode: '', code: ''});
                    }
                }
            }
        };

        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [view, focusedId, selectedIds, products, filters]);

    // Scroll focused row into view
    useEffect(() => {
        if (focusedId) {
            const el = document.getElementById(`row-${focusedId}`);
            el?.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
        }
    }, [focusedId]);

    // --- Handlers ---
    const toggleSelect = (id) => {
        const newSet = new Set(selectedIds);
        if (newSet.has(id)) newSet.delete(id);
        else newSet.add(id);
        setSelectedIds(newSet);
    };

    const handleSelectAll = (e) => {
        if (e.target.checked) setSelectedIds(new Set(products.map(p => p.id)));
        else setSelectedIds(new Set());
    };

    const handleBulkApply = (action, config) => {
        const product_ids = Array.from(selectedIds);
        if (action === 'archive') {
            bulkArchiveMutation.mutate({ product_ids });
        } else {
            bulkUpdateMutation.mutate({
                product_ids,
                category: action === 'category' ? config.category : undefined,
                price_change_type: action === 'price' ? config.priceType : undefined,
                price_change_value: action === 'price' ? config.priceValue : undefined,
                stock_reset_value: action === 'stock' ? config.stockValue : undefined,
            });
        }
    };

    const handleEditClick = (product) => {
        setEditingProduct(product);
        setFormData({
            sku: product.sku || '',
            name: product.name || '',
            price: product.price || '',
            stock_qty: product.stock_qty || '',
            category: product.category || '',
            is_service: product.is_service || false,
            barcode: product.barcode || '',
            status: product.status || 'available',
            min_stock: product.min_stock || '0',
            max_stock: product.max_stock || '99999',
            watch_threshold: product.watch_threshold || false,
            variant: product.variant || '',
            description: product.description || '',
            attributes: product.attributes || []
        });
        setView('list'); // Keep view as list since we're using a modal now
        setActiveTab('general');
        setShowFormModal(true);
    };

    const handleAddClick = () => {
        setEditingProduct(null);
        setFormData({
            sku: '', name: '', price: '', stock_qty: '', category: '', is_service: false,
            barcode: '', status: 'available', min_stock: '0', max_stock: '99999',
            watch_threshold: false, variant: '', description: '', attributes: []
        });
        setView('list');
        setActiveTab('general');
        setShowFormModal(true);
    };

    const handleSubmit = (e) => {
        if (e) e.preventDefault();
        setIsSaving(true);
        mutation.mutate(formData);
        setShowFormModal(false);
    };

    // (isLoading removed for full-page, moved inside table)

    return (
        <div className="flex flex-row w-full h-full bg-[#fcfcfa] dark:bg-[#111111] font-sans selection:bg-[#0d3542]/20 overflow-hidden relative text-gray-900 dark:text-white transition-[background-color,border-color] duration-150">
            
            {/* --- Persistent Sidebar --- */}
            <div className="w-[240px] shrink-0 flex flex-col p-0 overflow-y-auto no-scrollbar border-r border-black/5 dark:border-white/5 bg-white dark:bg-[#111] transition-[background-color,border-color] duration-150">
                <SidebarSection title="System Access">
                    <div className="flex flex-col gap-2">
                        <Button 
                            onClick={handleAddClick}
                            className="w-full bg-[#0d3542] text-white hover:bg-[#0a2a35] text-[12px] font-black uppercase tracking-widest h-12 transition-all shadow-[0_0_20px_rgba(13,53,66,0.15)]"
                        >
                            <Plus size={14} className="mr-2" /> ADD PRODUCT
                        </Button>
                        <div className="flex gap-2">
                            <Button variant="outline" className="flex-1 h-10 border-black/10 dark:border-white/10 text-[9px] font-black uppercase tracking-widest text-[#0d3542] hover:bg-black/5 dark:hover:bg-white/5"><Download size={12} className="mr-1" /> EXPORT</Button>
                            <Button variant="outline" className="flex-1 h-10 border-black/10 dark:border-white/10 text-[9px] font-black uppercase tracking-widest text-[#0d3542] hover:bg-black/5 dark:hover:bg-white/5"><Upload size={12} className="mr-1" /> IMPORT</Button>
                        </div>
                    </div>
                </SidebarSection>

                <SidebarSection title="Search">
                    <div className="space-y-5">
                        <div className="space-y-1.5">
                            <label className="text-[11px] font-bold text-slate-900/50 dark:text-white/40 uppercase tracking-widest ml-1 transition-colors duration-200">By Code</label>
                            <input 
                                type="text"
                                value={filters.code}
                                onChange={e => setFilters({...filters, code: e.target.value.toUpperCase()})}
                                className="w-full bg-black/5 dark:bg-[#222] border-b-2 border-black/5 dark:border-white/10 px-3 py-2.5 text-[14px] font-bold tracking-widest outline-none focus:border-[#0d3542] transition-all uppercase text-gray-900 dark:text-white placeholder:text-gray-400 dark:placeholder:text-white/20"
                                placeholder="LEDGER-00"
                            />
                        </div>
                        <div className="space-y-1.5">
                            <label className="text-[11px] font-bold text-slate-900/50 dark:text-white/40 uppercase tracking-widest ml-1 transition-colors duration-200">By Name / Barcode</label>
                            <input 
                                id="filter-name"
                                type="text"
                                value={filters.nameBarcode}
                                onChange={e => setFilters({...filters, nameBarcode: e.target.value})}
                                className="w-full bg-black/5 dark:bg-[#222] border-b-2 border-black/5 dark:border-white/10 px-3 py-2.5 text-[14px] font-bold outline-none focus:border-[#0d3542] transition-all uppercase text-gray-900 dark:text-white placeholder:text-gray-400 dark:placeholder:text-white/20"
                                placeholder="PRODUCT NAME"
                            />
                        </div>
                    </div>
                </SidebarSection>

                <SidebarSection title="Product Groups">
                    <div className="space-y-1.5 relative group">
                        <select 
                            value={filters.group}
                            onChange={e => setFilters({...filters, group: e.target.value})}
                            className="w-full bg-black/5 dark:bg-[#222] border-b-2 border-black/5 dark:border-white/10 px-3 py-2.5 text-[12px] font-black tracking-widest outline-none focus:border-[#0d3542] transition-all uppercase text-gray-900 dark:text-white cursor-pointer appearance-none"
                        >
                            {categories.map(cat => (
                                <option key={cat} value={cat}>{cat}</option>
                            ))}
                        </select>
                        <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-gray-400 group-hover:text-[#0d3542] transition-colors">
                            <ChevronDown size={14} />
                        </div>
                    </div>
                </SidebarSection>
            </div>

            {/* --- Content Area --- */}
            <div className="flex-1 flex flex-col overflow-hidden bg-[#fcfcfa] dark:bg-[#111111] transition-[background-color,border-color] duration-150">
                <AnimatePresence mode="wait">
                    {view === 'list' && (
                        <motion.div key="list" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="flex-1 flex flex-col overflow-hidden">
                            {/* --- Dashboard Metrics Bar --- */}
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 p-8 border-b border-black/5 dark:border-white/5 bg-white/40 dark:bg-[#111] backdrop-blur-sm transition-[background-color,border-color] duration-150">
                                <div className="border-l-4 border-[#0d3542] pl-6 py-2 bg-gradient-to-r from-[#0d3542]/5 to-transparent">
                                    <p className="text-[11px] font-black text-slate-900/40 dark:text-white/30 uppercase tracking-widest mb-1">Total Vault Value</p>
                                    <div className="flex items-baseline gap-2">
                                        <span className="text-3xl font-mono font-black text-[#0d3542] dark:text-white drop-shadow-[0_0_10px_rgba(13,53,66,0.1)] transition-colors duration-150">{formatPrice(metrics.totalValue)}</span>
                                        <span className="text-[11px] text-emerald-500 font-bold uppercase tracking-widest">Digital Assets</span>
                                    </div>
                                </div>
                                <div className="border-l-4 border-white/20 dark:border-white/10 pl-6 py-2 bg-gradient-to-r from-white/5 to-transparent">
                                    <p className="text-[11px] font-black text-slate-900/40 dark:text-white/30 uppercase tracking-widest mb-1">Active Ledger SKUs</p>
                                    <div className="flex items-baseline gap-2">
                                        <span className="text-3xl font-mono font-black text-slate-900 dark:text-white transition-colors duration-150">{metrics.totalSkus}</span>
                                        <span className="text-[11px] text-slate-900/30 dark:text-white/20 font-bold uppercase tracking-widest">Master Records</span>
                                    </div>
                                </div>
                                <div className="border-l-4 border-rose-500 pl-6 py-2 bg-gradient-to-r from-rose-500/5 to-transparent">
                                    <p className="text-[11px] font-black text-slate-900/40 dark:text-white/30 uppercase tracking-widest mb-1">Critical Stock Alerts</p>
                                    <div className="flex items-baseline gap-2">
                                        <span className="text-3xl font-mono font-black text-rose-500 transition-colors duration-150">{metrics.criticalCount}</span>
                                        <span className="text-[11px] text-rose-500/40 font-bold uppercase tracking-widest">Below Threshold</span>
                                    </div>
                                </div>
                            </div>

                            <div className="h-20 shrink-0 border-b border-black/5 dark:border-white/5 flex items-center justify-between px-10 bg-[#fcfcfa]/95 dark:bg-[#0d0d0d] transition-[background-color,border-color] duration-150">
                                <div className="flex items-center gap-3">
                                    <h2 className="text-base font-black text-[#0d3542] dark:text-attire-accent tracking-[0.4em] uppercase">Sovereign Ledger</h2>
                                    {isFetching && <motion.div animate={{ opacity: [0.3, 1, 0.3] }} transition={{ repeat: Infinity, duration: 1.5 }} className="w-1.5 h-1.5 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]" />}
                                </div>
                                <div className="flex items-center gap-3 px-4 py-1.5 bg-black/5 dark:bg-white/5 rounded text-[10px] font-black text-slate-900/40 dark:text-white/40 tracking-widest">
                                    <Command size={12} /> SYSTEM NOMENCLATURE: '/' SEARCH | 'SPACE' SELECT | 'CMD+K' BULK
                                </div>
                            </div>
                            <div className="flex-1 overflow-auto no-scrollbar relative min-h-0">
                                {(isLoading && !productsData) && (
                                    <div className="absolute inset-0 z-50 flex items-center justify-center bg-white/50 dark:bg-black/50 backdrop-blur-[2px]">
                                        <Loader className="animate-spin text-[#0d3542] dark:text-attire-accent" size={30} />
                                    </div>
                                )}
                                <table className="w-full text-left border-separate border-spacing-0 min-w-[800px] bg-transparent transition-colors duration-300">
                                    <thead className="sticky top-0 z-40">
                                        <tr className="bg-gray-100/50 dark:bg-[#222] text-[#0d3542] dark:text-white/80 uppercase text-[11px] tracking-[0.3em] font-black border-b border-black/5 dark:border-white/5 transition-[background-color,border-color] duration-150">
                        
                                            <th className="px-8 py-5 w-14 text-center border-b border-white/10">
                                                <input type="checkbox" checked={selectedIds.size === products.length && products.length > 0} onChange={handleSelectAll} className="accent-[#0d3542] scale-125" />
                                            </th>
                                            <th className="px-8 py-5 w-40 border-b border-white/10">SKU / IDENTITY</th>
                                            <th className="px-8 py-5 border-b border-white/10">DESIGNATION</th>
                                            <th className="px-8 py-5 w-48 border-b border-white/10">COLLECTION</th>
                                            <th className="px-8 py-5 w-36 border-b border-white/10 text-right">VALUATION</th>
                                            <th className="px-8 py-5 w-36 border-b border-white/10 text-right">LEDGER</th>
                                            <th className="px-8 py-5 w-36 border-b border-white/10 text-center">STATUS</th>
                                        </tr>
                                    </thead>
                                    <tbody className="text-[11px] font-medium">
                                        {products.length === 0 ? (
                                            <tr><td colSpan="7" className="py-20 text-center opacity-30 italic uppercase tracking-widest font-bold text-gray-400 dark:text-white transition-colors duration-300">No products detected in archive</td></tr>
                                        ) : (
                                            products.map((p) => (
                                                <ProductRow 
                                                    key={p.id}
                                                    product={p}
                                                    isSelected={selectedIds.has(p.id)}
                                                    isFocused={focusedId === p.id}
                                                    quickEditField={quickEditField}
                                                    onToggleSelect={toggleSelect}
                                                    onFocus={setFocusedId}
                                                    onEdit={handleEditClick}
                                                    onQuickEdit={setQuickEditField}
                                                    onUpdateField={(id, data) => updateMutation.mutate({ id, data })}
                                                    formatPrice={formatPrice}
                                                />
                                            ))
                                        )}
                                    </tbody>
                                </table>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>

            {/* --- Product Form Modal --- */}
            <ModernModal
                isOpen={showFormModal}
                onClose={() => setShowFormModal(false)}
                title={editingProduct ? 'Edit Product' : 'Add New Product'}
                maxWidth="max-w-4xl"
            >
                <div className="flex flex-col h-full bg-[#fcfcfa] dark:bg-[#0d0d0d]">
                    {/* Form Tabs */}
                    <div className="px-8 h-12 border-b border-black/5 dark:border-white/5 flex items-center gap-10 bg-black/[0.02] dark:bg-white/[0.02] transition-colors duration-500">
                        {['General', 'Attributes'].map((tab) => {
                            const id = tab.toLowerCase();
                            const active = activeTab === id;
                            return (
                                <button 
                                    key={id} onClick={() => setActiveTab(id)}
                                    className={`h-full px-1 text-[10px] font-black uppercase tracking-[0.2em] transition-all relative ${active ? 'text-[#0d3542] dark:text-attire-accent' : 'text-gray-400 dark:text-white/20 hover:text-gray-600 dark:hover:text-white/40'}`}
                                >
                                    {tab}
                                    {active && <motion.div layoutId="tabUnderline" className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#0d3542] dark:bg-attire-accent" />}
                                </button>
                            );
                        })}
                    </div>

                    {/* Form Content */}
                    <div className="flex-1 overflow-y-auto p-12 no-scrollbar attire-scrollbar">
                        {activeTab === 'general' ? (
                            <div className="max-w-6xl space-y-16">
                                <section>
                                    <div className="flex items-center gap-4 mb-8">
                                        <div className="h-0.5 w-12 bg-[#0d3542] dark:bg-attire-accent" />
                                        <h3 className="text-[11px] font-black uppercase tracking-[0.4em] text-[#0d3542] dark:text-attire-accent">Product Identity</h3>
                                    </div>
                                    <div className="grid grid-cols-2 gap-12">
                                        <div className="space-y-2">
                                            <label className="text-[10px] font-black text-gray-500 dark:text-white/40 uppercase tracking-widest">PRIMARY SKU / CODE</label>
                                            <input value={formData.sku} onChange={e => setFormData({...formData, sku: e.target.value.toUpperCase()})} className="w-full bg-black/5 dark:bg-white/5 p-4 text-[12px] font-mono font-bold tracking-widest outline-none border-b border-black/5 dark:border-white/5 focus:border-[#0d3542] dark:focus:border-attire-accent transition-all uppercase text-gray-900 dark:text-white" placeholder="AUTO-GEN ON EMPTY" />
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-[10px] font-black text-gray-500 dark:text-white/40 uppercase tracking-widest">DESIGNATION (NAME) *</label>
                                            <input required value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} className="w-full bg-black/5 dark:bg-white/5 p-4 text-[12px] font-black outline-none border-b border-black/5 dark:border-white/5 focus:border-[#0d3542] dark:focus:border-attire-accent transition-all uppercase text-gray-900 dark:text-white" />
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-[9px] font-black text-gray-400 dark:text-white/30 uppercase tracking-widest">VALUATION (PRICE)</label>
                                            <div className="relative">
                                                <input type="number" value={formData.price} onChange={e => setFormData({...formData, price: e.target.value})} className="w-full bg-black/5 dark:bg-white/5 p-4 pl-12 text-[14px] font-mono font-bold tracking-tight outline-none border-b border-black/5 dark:border-white/5 focus:border-[#0d3542] dark:focus:border-attire-accent transition-all text-gray-900 dark:text-white" />
                                                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-[#0d3542] dark:text-attire-accent font-black text-lg">$</span>
                                            </div>
                                        </div>
                                        <div className="space-y-6 pt-10">
                                            <label className="flex items-center gap-4 cursor-pointer group">
                                                <div className={`w-5 h-5 rounded border-2 flex items-center justify-center transition-all ${formData.is_service ? 'bg-[#0d3542] dark:bg-attire-accent border-[#0d3542] dark:border-attire-accent' : 'border-black/10 dark:border-white/10 bg-transparent group-hover:border-[#0d3542]/30 dark:group-hover:border-attire-accent/30'}`}>
                                                    {formData.is_service && <Check size={12} className="text-white dark:text-black" />}
                                                </div>
                                                <input type="checkbox" className="hidden" checked={formData.is_service} onChange={e => setFormData({...formData, is_service: e.target.checked})} />
                                                <div>
                                                    <span className="text-[11px] font-black uppercase tracking-widest text-[#0d3542] dark:text-attire-accent">Service Mode</span>
                                                    <p className="text-[9px] text-gray-500 dark:text-white/30 font-bold uppercase tracking-widest mt-0.5">Excludes from physical inventory math</p>
                                                </div>
                                            </label>
                                        </div>
                                    </div>
                                </section>

                                <section>
                                    <div className="flex items-center gap-4 mb-8">
                                        <div className="h-0.5 w-12 bg-[#0d3542] dark:bg-attire-accent" />
                                        <h3 className="text-[11px] font-black uppercase tracking-[0.4em] text-[#0d3542] dark:text-attire-accent">Logistical Bounds</h3>
                                    </div>
                                    <div className="grid grid-cols-2 gap-12">
                                        <div className="space-y-2">
                                            <label className="text-[9px] font-black text-gray-400 dark:text-white/30 uppercase tracking-widest">PRODUCT GROUP (CATEGORY)</label>
                                            <div className="relative group">
                                                <select 
                                                    value={formData.category} 
                                                    onChange={e => setFormData({...formData, category: e.target.value})} 
                                                    className="w-full bg-black/5 dark:bg-white/5 p-4 text-[11px] font-black outline-none border-b border-black/5 dark:border-white/5 focus:border-[#0d3542] dark:focus:border-attire-accent transition-all uppercase text-gray-900 dark:text-white appearance-none cursor-pointer"
                                                >
                                                    <option value="">SELECT GROUP</option>
                                                    {categories.filter(c => c !== 'ALL GROUPS').map(cat => (
                                                        <option key={cat} value={cat}>{cat}</option>
                                                    ))}
                                                    <option value="NEW_GROUP">+ CREATE NEW GROUP</option>
                                                </select>
                                                <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-[#0d3542] dark:text-attire-accent opacity-50 group-hover:opacity-100 transition-opacity">
                                                    <ChevronDown size={16} />
                                                </div>
                                            </div>
                                            {formData.category === 'NEW_GROUP' && (
                                                <motion.input 
                                                    initial={{ opacity: 0, y: -10 }}
                                                    animate={{ opacity: 1, y: 0 }}
                                                    type="text"
                                                    placeholder="ENTER NEW GROUP NAME"
                                                    className="w-full mt-2 bg-black/5 dark:bg-white/5 p-4 text-[11px] font-black outline-none border-b border-[#0d3542] dark:border-attire-accent transition-all uppercase text-gray-900 dark:text-white"
                                                    onBlur={(e) => {
                                                        const val = e.target.value.toUpperCase();
                                                        if (val) setFormData({...formData, category: val});
                                                        else setFormData({...formData, category: ''});
                                                    }}
                                                    autoFocus
                                                />
                                            )}
                                        </div>
                                        <div className="grid grid-cols-2 gap-4">
                                            <div className="space-y-2">
                                                <label className="text-[9px] font-black text-gray-400 dark:text-white/30 uppercase tracking-widest">LOWER BOUND (MIN)</label>
                                                <input type="number" value={formData.min_stock} onChange={e => setFormData({...formData, min_stock: e.target.value})} className="w-full bg-black/5 dark:bg-white/5 p-4 text-[11px] font-mono font-bold outline-none border-b border-black/5 dark:border-white/5 focus:border-[#0d3542] dark:focus:border-attire-accent transition-all text-gray-900 dark:text-white" />
                                            </div>
                                            <div className="space-y-2">
                                                <label className="text-[9px] font-black text-gray-400 dark:text-white/30 uppercase tracking-widest">UPPER BOUND (MAX)</label>
                                                <input type="number" value={formData.max_stock} onChange={e => setFormData({...formData, max_stock: e.target.value})} className="w-full bg-black/5 dark:bg-white/5 p-4 text-[11px] font-mono font-bold outline-none border-b border-black/5 dark:border-white/5 focus:border-[#0d3542] dark:focus:border-attire-accent transition-all text-gray-900 dark:text-white" />
                                            </div>
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-[9px] font-black text-gray-400 dark:text-white/30 uppercase tracking-widest">SCANNER BARCODE</label>
                                            <input value={formData.barcode} onChange={e => setFormData({...formData, barcode: e.target.value})} className="w-full bg-black/5 dark:bg-white/5 p-4 text-[11px] font-mono font-bold outline-none border-b border-black/5 dark:border-white/5 focus:border-[#0d3542] dark:focus:border-attire-accent transition-all text-gray-900 dark:text-white" />
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-[9px] font-black text-gray-400 dark:text-white/30 uppercase tracking-widest">OPERATIONAL STATUS</label>
                                            <select value={formData.status} onChange={e => setFormData({...formData, status: e.target.value})} className="w-full bg-black/5 dark:bg-white/5 h-[55px] px-4 text-[11px] font-black uppercase outline-none border-b border-black/5 dark:border-white/5 cursor-pointer appearance-none text-[#0d3542] dark:text-attire-accent bg-transparent">
                                                <option value="available">ACTIVE / AVAILABLE</option>
                                                <option value="unavailable">LOCKED / UNAVAILABLE</option>
                                            </select>
                                        </div>
                                    </div>
                                </section>
                            </div>
                        ) : (
                            <div className="max-w-3xl space-y-8">
                                <div className="flex items-center justify-between">
                                    <h3 className="text-xs font-black text-gray-900 dark:text-attire-accent uppercase tracking-widest">Product Attributes</h3>
                                    <Button variant="outline" onClick={() => setFormData({...formData, attributes: [...(formData.attributes || []), { key: '', value: '' }]})} className="h-8 text-[9px] font-black uppercase tracking-widest border-black/10 dark:border-white/10 text-gray-400 dark:text-white/60 hover:text-gray-900 dark:hover:text-white transition-all">
                                        <Plus size={12} className="mr-1" /> ADD ATTRIBUTE
                                    </Button>
                                </div>
                                <div className="space-y-4">
                                    {(formData.attributes || []).map((attr, idx) => (
                                        <div key={idx} className="flex gap-4 items-end animate-in fade-in slide-in-from-left-2 transition-all">
                                            <div className="flex-1 space-y-2">
                                                <label className="text-[8px] font-black text-gray-400 uppercase tracking-[0.2em]">Label</label>
                                                <input value={attr.key} onChange={e => {
                                                    const newAttrs = [...formData.attributes];
                                                    newAttrs[idx].key = e.target.value.toUpperCase();
                                                    setFormData({...formData, attributes: newAttrs});
                                                }} className="w-full bg-black/5 dark:bg-white/5 p-3 text-[10px] font-bold uppercase outline-none border-b border-black/5 dark:border-white/5 focus:border-[#0d3542] dark:focus:border-attire-accent transition-all text-gray-900 dark:text-white" placeholder="E.G. SIZE" />
                                            </div>
                                            <div className="flex-[2] space-y-2">
                                                <label className="text-[8px] font-black text-gray-400 uppercase tracking-[0.2em]">Value</label>
                                                <input value={attr.value} onChange={e => {
                                                    const newAttrs = [...formData.attributes];
                                                    newAttrs[idx].value = e.target.value.toUpperCase();
                                                    setFormData({...formData, attributes: newAttrs});
                                                }} className="w-full bg-black/5 dark:bg-white/5 p-3 text-[10px] font-bold uppercase outline-none border-b border-black/5 dark:border-white/5 focus:border-[#0d3542] dark:focus:border-attire-accent transition-all text-gray-900 dark:text-white" placeholder="E.G. XL" />
                                            </div>
                                            <button onClick={() => setFormData({...formData, attributes: formData.attributes.filter((_, i) => i !== idx)})} className="p-3 text-gray-400 hover:text-rose-500 transition-colors">
                                                <Trash2 size={16} />
                                            </button>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>
                    
                    {/* Form Footer */}
                    <div className="h-20 shrink-0 border-t border-black/5 dark:border-white/5 flex items-center justify-end px-12 gap-4 bg-black/[0.02] dark:bg-white/[0.02] transition-colors duration-500">
                        <Button variant="outline" onClick={() => setShowFormModal(false)} className="h-10 px-8 text-[10px] font-black uppercase tracking-widest border-black/10 dark:border-white/10 text-gray-400">CANCEL</Button>
                        <Button onClick={handleSubmit} disabled={isSaving} className="h-10 px-12 bg-[#0d3542] dark:bg-attire-accent text-white dark:text-black text-[10px] font-black uppercase tracking-widest hover:scale-[1.02] transition-transform shadow-xl">
                            {isSaving ? <Loader size={14} className="animate-spin mr-2" /> : <Save size={14} className="mr-2" />}
                            CONFIRM CHANGES
                        </Button>
                    </div>
                </div>
            </ModernModal>

            {/* --- Floating Command Bar --- */}
            <AnimatePresence>
                {selectedIds.size > 0 && view === 'list' && (
                     <motion.div initial={{ y: 100, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: 100, opacity: 0 }} className="fixed bottom-10 left-[calc(50%+120px)] -translate-x-1/2 z-[80]">
                        <div className="bg-[#f8f8f6] dark:bg-[#1a1a1a] shadow-2xl rounded-lg px-8 h-16 flex items-center gap-8 border border-[#0d3542]/20 dark:border-[#0d3542]/40 backdrop-blur-md transition-colors duration-300">
                            <div className="flex items-center gap-3 pr-8 border-r border-black/10 dark:border-white/10">
                                <div className="bg-[#0d3542] text-white text-[10px] font-black h-5 w-5 rounded flex items-center justify-center">{selectedIds.size}</div>
                                <span className="text-[#0d3542] text-[10px] font-black uppercase tracking-[0.2em]">Items Selected</span>
                            </div>
                            <div className="flex items-center gap-6">
                                <button onClick={() => setIsBulkDialogOpen(true)} className="flex items-center gap-2 text-gray-500 dark:text-white/70 hover:text-gray-900 dark:hover:text-white transition-colors group">
                                    <Command size={14} className="group-hover:scale-110 transition-transform" />
                                    <span className="text-[10px] font-black uppercase tracking-widest">Run Command</span>
                                    <span className="ml-2 px-1.5 py-0.5 bg-black/5 dark:bg-white/5 rounded text-[8px] opacity-40">CMD+K</span>
                                </button>
                                <button onClick={() => setSelectedIds(new Set())} className="text-gray-400 dark:text-white/40 hover:text-gray-900 dark:hover:text-white text-[10px] font-black uppercase tracking-widest">Clear</button>
                            </div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* --- Modals --- */}
            <BulkActionDialog 
                isOpen={isBulkDialogOpen} 
                onClose={() => setIsBulkDialogOpen(false)}
                selectedCount={selectedIds.size}
                products={products.filter(p => selectedIds.has(p.id))}
                onApply={handleBulkApply}
            />

        </div>
    );
};

export default ProductsPage;

