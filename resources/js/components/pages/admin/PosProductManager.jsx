import React, { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import axios from 'axios';
import { motion, AnimatePresence } from 'framer-motion';
import { 
    X, Plus, Edit, Trash2, 
    Hash, DollarSign, Layers, Check, 
    Filter, ChevronDown, Archive, ChevronLeft,
    Download, Upload, Settings, Tag, Smartphone, Scissors,
    Menu, ShoppingBag, ShoppingCart, Command, AlertCircle,
    ArrowUp, ArrowDown, Keyboard, Save
} from 'lucide-react';
import { LumaSpin } from '@/components/ui/luma-spin';
import { Button } from '@/components/ui/button';
import BulkActionDialog from './pos/BulkActionDialog';
import ModernModal from '../../common/ModernModal';
import { formatPrice } from '@/helpers/format';
import { useAdmin } from './AdminContext';

const SidebarSection = ({ title, children }) => (
    <div className="mb-0 border-b border-black/5 dark:border-[#30363d] transition-[background-color,border-color] duration-150">
        <div className="bg-black/[0.02] dark:bg-[#161b22] border-y border-black/5 dark:border-[#30363d] text-[#0d3542] dark:text-[#58a6ff] px-8 py-3.5 text-[12.5px] font-black uppercase tracking-[0.3em] transition-colors duration-200">
            {title}
        </div>
        <div className="px-6 py-4 bg-[#fdfdfc] dark:bg-[#0d1117]">
            {children}
        </div>
    </div>
);

const QuickEditCell = ({ value, prefix, onSave, onClose }) => {
    const [val, setVal] = useState(value);
    const inputRef = useRef(null);

    useEffect(() => {
        if (inputRef.current) inputRef.current.focus();
    }, []);

    const handleKeyDown = (e) => {
        if (e.key === 'Enter') {
            onSave(val);
            onClose();
        } else if (e.key === 'Escape') {
            onClose();
        }
    };

    return (
        <div className="absolute inset-0 z-50 bg-[#fdfdfc] dark:bg-[#161b22] flex items-center px-4 ring-2 ring-[#0d3542] dark:ring-[#58a6ff] translate-y-[-2px]">
            {prefix && <span className="text-[14px] font-black text-[#0d3542] dark:text-[#58a6ff] mr-2">{prefix}</span>}
            <input 
                ref={inputRef}
                value={val}
                onChange={e => setVal(e.target.value)}
                onKeyDown={handleKeyDown}
                onBlur={onClose}
                className="flex-1 bg-transparent border-none outline-none text-[15.5px] font-black text-gray-900 dark:text-white"
            />
            <div className="flex items-center gap-1 ml-2">
                <div className="px-2 py-1 bg-black/5 dark:bg-[#0d1117] rounded text-[10px] font-black uppercase text-[#0d3542] dark:text-[#58a6ff]">Enter: Save</div>
            </div>
        </div>
    );
};

const ProductRow = React.memo(({ 
    product, isSelected, isFocused, quickEditField, 
    onToggleSelect, onFocus, onEdit, onQuickEdit, onUpdateField,
    formatPrice, performanceMode
}) => {
    const p = product;
    return (
        <tr 
            key={p.id} id={`row-${p.id}`}
            onClick={() => { onFocus(p.id); onToggleSelect(p.id); }}
            onDoubleClick={() => onEdit(p)}
            className={`group cursor-pointer border-b border-black/[0.03] dark:border-white/[0.03] ${isSelected ? 'bg-[#0d3542]/10' : 'hover:bg-black/[0.02] dark:hover:bg-white/[0.02]'} ${isFocused ? 'bg-black/[0.04] dark:bg-white/[0.08] ring-1 ring-inset ring-[#0d3542]/30' : ''} ${performanceMode ? 'transition-none' : 'transition-colors duration-200'}`}
        >
            <td className="px-8 py-4 text-center">
                <div className={`w-5 h-5 rounded border flex items-center justify-center transition-colors duration-200 ${isSelected ? 'bg-[#0d3542] dark:bg-[#58a6ff] border-[#0d3542] dark:border-[#58a6ff]' : 'border-black/20 dark:border-[#30363d] bg-transparent'}`}>
                    {isSelected && <Check size={12} className="text-white dark:text-black" />}
                </div>
            </td>
            <td className="px-8 py-5 font-mono font-bold tracking-tighter text-gray-500 dark:text-white/50 uppercase text-[15px]">{p.sku}</td>
            <td className="px-8 py-5">
                <div className="flex flex-col">
                    <span className="font-black text-gray-900 dark:text-white uppercase tracking-wide group-hover:text-[#0d3542] transition-colors text-[17.5px]">{p.name}</span>
                    <span className="text-[13px] text-gray-400 dark:text-white/30 uppercase font-black tracking-widest">{p.variant || 'STANDARD EDITION'}</span>
                </div>
            </td>
            <td className="px-8 py-5">
                <span className="px-4 py-1.5 bg-black/5 dark:bg-white/5 text-[12.5px] font-black text-gray-500 dark:text-white/60 rounded-sm uppercase tracking-widest">{p.category}</span>
            </td>
            <td className="px-8 py-5 text-right font-mono font-bold text-[#0d3542] text-xl relative">
                {isFocused && quickEditField === 'price' ? (
                    <QuickEditCell value={p.price} prefix="$" onSave={(val) => onUpdateField(p.id, { price: val })} onClose={() => onQuickEdit(null)} />
                ) : formatPrice(p.price)}
            </td>
            <td className={`px-8 py-5 text-right font-mono font-bold relative text-xl ${p.stock_qty <= (p.min_stock || 5) ? 'text-rose-500' : 'text-gray-600 dark:text-white/70'}`}>
                {isFocused && quickEditField === 'stock' ? (
                    <QuickEditCell value={p.stock_qty} onSave={(val) => onUpdateField(p.id, { stock_qty: val })} onClose={() => onQuickEdit(null)} />
                ) : (
                    <>{p.stock_qty} <span className="text-[12.5px] opacity-30 ml-1">UNITS</span></>
                )}
            </td>
            <td className="px-8 py-5 text-center border-l border-black/5 dark:border-white/5">
                <div className={`inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-[12.5px] font-black uppercase tracking-widest ${p.is_active ? 'bg-emerald-500/10 text-emerald-400' : 'bg-black/5 dark:bg-white/5 text-gray-400 dark:text-white/30'}`}>
                    <div className={`w-2 h-2 rounded-full ${p.is_active ? 'bg-emerald-400' : 'bg-black/20 dark:bg-white/30'}`} />
                    {p.is_active ? 'Active' : 'Archived'}
                </div>
            </td>
        </tr>
    );
});

const ProductsPage = () => {
    const queryClient = useQueryClient();
    const { performanceMode } = useAdmin();
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
        watch_threshold: false, variant: '', attributes: []
    });

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
            el?.scrollIntoView({ behavior: performanceMode ? 'auto' : 'smooth', block: 'nearest' });
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
            attributes: product.attributes || []
        });
        setView('form');
        setActiveTab('general');
    };

    const handleAddClick = () => {
        setEditingProduct(null);
        setFormData({
            sku: '', name: '', price: '', stock_qty: '', category: '', is_service: false,
            barcode: '', status: 'available', min_stock: '0', max_stock: '99999',
            watch_threshold: false, variant: '', attributes: []
        });
        setView('form');
        setActiveTab('general');
    };

    const handleSubmit = (e) => {
        if (e) e.preventDefault();
        setIsSaving(true);

        // --- Bespoke Nomenclature Engine ---
        // Compiles attributes into a standardized string: "-VAL1 -VAL2 ..."
        const attributeString = (formData.attributes || [])
            .filter(attr => attr.value?.trim())
            .map(attr => `-${attr.value.trim().toUpperCase()}`)
            .join(' ');

        const finalData = {
            ...formData,
            variant: attributeString || ""
        };

        mutation.mutate(finalData);
    };

    // (isLoading removed for full-page, moved inside table)

    return (
        <div className="flex flex-row w-full h-full bg-background dark:bg-[#111111] font-sans selection:bg-[#0d3542]/20 relative text-gray-900 dark:text-white transition-colors duration-300">
            
            {/* --- Persistent Sidebar --- */}
            <div className="w-[240px] shrink-0 flex flex-col p-0 overflow-y-auto attire-scrollbar border-r border-black/[0.08] dark:border-white/5 bg-background dark:bg-[#111] transition-colors duration-300">
                <SidebarSection title="System Access">
                    <div className="flex flex-col gap-2">
                        <Button 
                            onClick={handleAddClick}
                            className="w-full bg-[#0d3542] dark:bg-[#58a6ff] text-white dark:text-black hover:opacity-90 text-xs font-black uppercase tracking-widest h-12 transition-all rounded-xl"
                        >
                            <Plus size={14} className="mr-2" /> ADD PRODUCT
                        </Button>
                        <div className="flex gap-2">
                            <Button variant="outline" className="flex-1 h-10 border-black/10 dark:border-[#30363d] text-[10px] font-black uppercase tracking-widest text-[#0d3542] dark:text-[#58a6ff] hover:bg-black/5 dark:hover:bg-[#161b22] rounded-xl"><Download size={12} className="mr-1" /> EXPORT</Button>
                            <Button variant="outline" className="flex-1 h-10 border-black/10 dark:border-[#30363d] text-[10px] font-black uppercase tracking-widest text-[#0d3542] dark:text-[#58a6ff] hover:bg-black/5 dark:hover:bg-[#161b22] rounded-xl"><Upload size={12} className="mr-1" /> IMPORT</Button>
                        </div>
                    </div>
                </SidebarSection>

                <SidebarSection title="Search">
                    <div className="space-y-5">
                        <div className="space-y-1.5">
                            <label className="text-xs font-bold text-slate-900/50 dark:text-white/40 uppercase tracking-widest ml-1 transition-colors duration-200">By Code</label>
                            <input 
                                type="text"
                                value={filters.code}
                                onChange={e => setFilters({...filters, code: e.target.value.toUpperCase()})}
                                className="w-full bg-black/5 dark:bg-[#222] border-b-2 border-black/5 dark:border-white/10 px-3 py-2.5 text-sm font-bold tracking-widest outline-none focus:border-[#0d3542] transition-all uppercase text-gray-900 dark:text-white placeholder:text-gray-400 dark:placeholder:text-white/20"
                                placeholder="LEDGER-00"
                            />
                        </div>
                        <div className="space-y-1.5">
                            <label className="text-xs font-bold text-slate-900/50 dark:text-white/40 uppercase tracking-widest ml-1 transition-colors duration-200">By Name / Barcode</label>
                            <input 
                                id="filter-name"
                                type="text"
                                value={filters.nameBarcode}
                                onChange={e => setFilters({...filters, nameBarcode: e.target.value})}
                                className="w-full bg-black/5 dark:bg-[#222] border-b-2 border-black/5 dark:border-white/10 px-3 py-2.5 text-sm font-bold outline-none focus:border-[#0d3542] transition-all uppercase text-gray-900 dark:text-white placeholder:text-gray-400 dark:placeholder:text-white/20"
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
                            className="w-full bg-black/5 dark:bg-[#161b22] border-b-2 border-black/5 dark:border-[#30363d] px-3 py-3.5 text-[14px] font-black tracking-widest outline-none focus:border-[#0d3542] dark:focus:border-[#58a6ff] transition-all uppercase text-gray-900 dark:text-white cursor-pointer appearance-none rounded-xl"
                        >
                            {categories.map(cat => (
                                <option key={cat} value={cat}>{cat}</option>
                            ))}
                        </select>
                        <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-gray-400 group-hover:text-[#0d3542] dark:group-hover:text-[#58a6ff] transition-colors">
                            <ChevronDown size={16} />
                        </div>
                    </div>
                </SidebarSection>
            </div>

            {/* --- Content Area --- */}
            <div className="flex-1 flex flex-col overflow-hidden bg-background dark:bg-[#111111] transition-colors duration-300">
                <AnimatePresence mode="wait">
                    {view === 'list' ? (
                        <motion.div 
                            key="list" 
                            initial={performanceMode ? { opacity: 0 } : { opacity: 0, x: -20 }} 
                            animate={{ opacity: 1, x: 0 }} 
                            exit={performanceMode ? { opacity: 0 } : { opacity: 0, x: 20 }} 
                            transition={performanceMode ? { duration: 0 } : { duration: 0.3 }}
                            className="flex-1 flex flex-col overflow-hidden"
                        >
                             {/* --- Dashboard Metrics Bar --- */}
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 p-6 border-b border-black/[0.08] dark:border-[#30363d] bg-background dark:bg-[#161b22] transition-colors duration-300">
                                <div className="border-l-4 border-[#0d3542] dark:border-[#58a6ff] pl-6 py-2 bg-gradient-to-r from-[#0d3542]/5 dark:from-[#58a6ff]/5 to-transparent">
                                    <p className="text-xs font-black text-slate-900/40 dark:text-[#8b949e] uppercase tracking-widest mb-1">Total Vault Value</p>
                                    <div className="flex items-baseline gap-2">
                                        <span className="text-3xl font-mono font-black text-[#0d3542] dark:text-[#58a6ff] transition-colors duration-150">{formatPrice(metrics.totalValue)}</span>
                                        <span className="text-xs text-emerald-500 font-bold uppercase tracking-widest">Digital Assets</span>
                                    </div>
                                </div>
                                <div className="border-l-4 border-white/20 dark:border-white/10 pl-6 py-2 bg-gradient-to-r from-white/5 to-transparent">
                                    <p className="text-xs font-black text-slate-900/40 dark:text-white/30 uppercase tracking-widest mb-1">Active Ledger SKUs</p>
                                    <div className="flex items-baseline gap-2">
                                        <span className="text-3xl font-mono font-black text-slate-900 dark:text-white transition-colors duration-150">{metrics.totalSkus}</span>
                                        <span className="text-xs text-slate-900/30 dark:text-white/20 font-bold uppercase tracking-widest">Master Records</span>
                                    </div>
                                </div>
                                <div className="border-l-4 border-rose-500 pl-6 py-2 bg-gradient-to-r from-rose-500/5 to-transparent">
                                    <p className="text-xs font-black text-slate-900/40 dark:text-white/30 uppercase tracking-widest mb-1">Critical Stock Alerts</p>
                                    <div className="flex items-baseline gap-2">
                                        <span className="text-3xl font-mono font-black text-rose-500 transition-colors duration-150">{metrics.criticalCount}</span>
                                        <span className="text-xs text-rose-500/40 font-bold uppercase tracking-widest">Below Threshold</span>
                                    </div>
                                </div>
                            </div>

                             <div className={`h-20 shrink-0 border-b border-black/[0.08] dark:border-[#30363d] flex items-center justify-between px-10 bg-background dark:bg-[#0d1117] transition-colors duration-300`}>
                                <div className="flex items-center gap-4">
                                    <h2 className="text-xl font-black text-[#0d3542] dark:text-[#c9d1d9] tracking-[0.4em] uppercase">Sovereign Ledger</h2>
                                    {isFetching && !performanceMode && <motion.div animate={{ opacity: [0.3, 1, 0.3] }} transition={{ repeat: Infinity, duration: 1.5 }} className="w-2 h-2 rounded-full bg-[#0d3542] dark:bg-[#58a6ff]" />}
                                    {isFetching && performanceMode && <div className="w-2 h-2 rounded-full bg-[#0d3542] dark:bg-[#58a6ff]" />}
                                </div>
                                <div className="flex items-center gap-4 px-6 py-2.5 bg-black/5 dark:bg-[#161b22] rounded-xl text-[13px] font-black text-slate-900/40 dark:text-[#8b949e] tracking-widest">
                                    <Command size={14} /> SYSTEM NOMENCLATURE: '/' SEARCH | 'SPACE' SELECT | 'CMD+K' BULK
                                </div>
                            </div>
                             <div className={`flex-1 overflow-auto attire-scrollbar relative min-h-0 bg-background dark:bg-[#0f0f0f] border-t border-black/[0.08] dark:border-white/5`}>
                                {(isLoading && !productsData) && (
                                    <div className={`absolute inset-0 z-50 flex items-center justify-center bg-white/50 dark:bg-black/50 ${performanceMode ? '' : 'backdrop-blur-[2px]'}`}>
                                        <LumaSpin size="lg" />
                                    </div>
                                )}
                                <table className="w-full text-left border-separate border-spacing-0 min-w-[800px] bg-transparent transition-colors duration-300">
                                    <thead className="sticky top-0 z-40">
                                        <tr className="bg-black/[0.02] dark:bg-[#161b22] text-[#0d3542] dark:text-[#c9d1d9] uppercase text-xs tracking-[0.3em] font-black border-b border-black/5 dark:border-[#30363d] transition-[background-color,border-color] duration-150">
                                            <th className="px-8 py-6 w-14 text-center border-b border-black/5 dark:border-[#30363d]">
                                                <input type="checkbox" checked={selectedIds.size === products.length && products.length > 0} onChange={handleSelectAll} className="accent-[#0d3542] dark:accent-[#58a6ff] scale-125" />
                                            </th>
                                            <th className="px-8 py-6 w-40 border-b border-black/5 dark:border-[#30363d]">SKU / IDENTITY</th>
                                            <th className="px-8 py-6 border-b border-black/5 dark:border-[#30363d]">DESIGNATION</th>
                                            <th className="px-8 py-6 w-48 border-b border-black/5 dark:border-[#30363d]">COLLECTION</th>
                                            <th className="px-8 py-6 w-36 border-b border-black/5 dark:border-[#30363d] text-right">VALUATION</th>
                                            <th className="px-8 py-6 w-36 border-b border-black/5 dark:border-[#30363d] text-right">LEDGER</th>
                                            <th className="px-8 py-6 w-36 border-b border-black/5 dark:border-[#30363d] text-center">STATUS</th>
                                        </tr>
                                    </thead>
                                    <tbody className="text-[13px] font-medium">
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
                                                    performanceMode={performanceMode}
                                                />
                                            ))
                                        )}
                                    </tbody>
                                </table>
                            </div>
                        </motion.div>
                    ) : (
                        <motion.div key="form" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="flex-1 flex flex-col overflow-hidden bg-[#fcfcfa] dark:bg-[#0d0d0d]">
                            {/* --- Form Header --- */}
                            <div className="h-24 shrink-0 border-b border-black/5 dark:border-white/5 flex items-center justify-between px-12 bg-white dark:bg-[#0a0a0a]">
                                <div className="flex items-center gap-6">
                                    <button 
                                        onClick={() => { setView('list'); setEditingProduct(null); }}
                                        className="h-12 w-12 rounded-2xl bg-black/5 dark:bg-white/5 flex items-center justify-center text-gray-500 hover:text-[#00C4B4] transition-all hover:bg-[#00C4B4]/10"
                                    >
                                        <ChevronLeft size={20} />
                                    </button>
                                    <div>
                                        <h2 className="text-xl font-black text-[#0d3542] dark:text-[#58a6ff] tracking-[0.4em] uppercase">{editingProduct ? 'Edit Identity' : 'Establish New Identity'}</h2>
                                        <p className="text-[11px] font-bold text-gray-400 dark:text-[#8b949e] uppercase tracking-widest mt-1">Product Configuration Module</p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-4">
                                    <Button variant="outline" onClick={() => setView('list')} className="h-12 px-8 text-xs font-black uppercase tracking-widest border-black/10 dark:border-[#30363d] text-gray-400 rounded-xl hover:bg-black/5 dark:hover:bg-[#161b22]">CANCEL</Button>
                                    <Button onClick={handleSubmit} disabled={isSaving} className="h-12 px-10 bg-[#0d3542] dark:bg-[#58a6ff] text-white dark:text-black text-xs font-black uppercase tracking-widest hover:scale-[1.05] transition-all rounded-xl">
                                        {isSaving ? <LumaSpin size="sm" className="mr-2" /> : <Save size={14} className="mr-2" />}
                                        CONFIRM & RECORD
                                    </Button>
                                </div>
                            </div>

                            {/* --- Form Tabs --- */}
                            <div className="px-12 h-16 border-b border-black/5 dark:border-[#30363d] flex items-center gap-12 bg-black/[0.01] dark:bg-[#161b22]">
                                {['General', 'Attributes'].map((tab) => {
                                    const id = tab.toLowerCase();
                                    const active = activeTab === id;
                                    return (
                                        <button 
                                            key={id} onClick={() => setActiveTab(id)}
                                            className={`h-full px-2 text-[11px] font-black uppercase tracking-[0.3em] transition-all relative ${active ? 'text-[#0d3542] dark:text-[#58a6ff]' : 'text-gray-400 dark:text-[#8b949e] hover:text-[#0d3542] dark:hover:text-[#58a6ff]'}`}
                                        >
                                            {tab}
                                            {active && <motion.div layoutId="tabUnderline" className="absolute bottom-0 left-0 right-0 h-1 bg-[#0d3542] dark:bg-[#58a6ff] rounded-t-full" />}
                                        </button>
                                    );
                                })}
                            </div>

                            {/* --- Form Content --- */}
                            <div className="flex-1 overflow-y-auto p-16 no-scrollbar">
                                <div className="max-w-5xl mx-auto space-y-20">
                                    {activeTab === 'general' ? (
                                        <>
                                            <section className="animate-in fade-in slide-in-from-bottom-4 duration-500">
                                                <div className="flex items-center gap-4 mb-10">
                                                    <div className="h-1 w-10 bg-[#0d3542] dark:bg-[#58a6ff] rounded-full" />
                                                    <h3 className="text-xs font-black uppercase tracking-[0.4em] text-[#0d3542] dark:text-[#58a6ff]">Base Metadata</h3>
                                                </div>
                                                <div className="grid grid-cols-2 gap-16">
                                                    <div className="space-y-3">
                                                        <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">PRIMARY SKU / CODE</label>
                                                        <input value={formData.sku} onChange={e => setFormData({...formData, sku: e.target.value.toUpperCase()})} className="w-full bg-black/5 dark:bg-[#161b22] p-5 text-sm font-mono font-bold tracking-widest outline-none border border-black/5 dark:border-[#30363d] focus:border-[#0d3542] dark:focus:border-[#58a6ff] transition-all uppercase text-gray-900 dark:text-white rounded-2xl" placeholder="AUTO-GEN ON EMPTY" />
                                                    </div>
                                                    <div className="space-y-3">
                                                        <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">PRODUCT NAME *</label>
                                                        <input required value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} className="w-full bg-black/5 dark:bg-[#161b22] p-5 text-sm font-black outline-none border border-black/5 dark:border-[#30363d] focus:border-[#0d3542] dark:focus:border-[#58a6ff] transition-all uppercase text-gray-900 dark:text-white rounded-2xl" />
                                                        
                                                        {/* Name Preview */}
                                                        <div className="mt-4 px-4 py-3 bg-black/[0.03] dark:bg-[#161b22] rounded-xl border border-dashed border-black/10 dark:border-[#30363d]">
                                                            <div className="text-[10px] font-black text-[#0d3542]/50 dark:text-[#58a6ff]/50 uppercase tracking-widest mb-1">Name Preview</div>
                                                            <div className="text-sm font-mono font-bold text-gray-400 dark:text-white/40 break-all uppercase">
                                                                {formData.name} {(formData.attributes || []).filter(a => a.value).map(a => `-${a.value.toUpperCase()}`).join(' ')}
                                                            </div>
                                                        </div>
                                                    </div>
                                                    <div className="space-y-3">
                                                        <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">ITEM PRICE</label>
                                                        <div className="relative">
                                                            <input type="number" value={formData.price} onChange={e => setFormData({...formData, price: e.target.value})} className="w-full bg-black/5 dark:bg-[#161b22] p-5 pl-14 text-lg font-mono font-bold tracking-tight outline-none border border-black/5 dark:border-[#30363d] focus:border-[#0d3542] dark:focus:border-[#58a6ff] transition-all text-gray-900 dark:text-white rounded-2xl" />
                                                            <span className="absolute left-5 top-1/2 -translate-y-1/2 text-[#0d3542] dark:text-[#58a6ff] font-black text-xl">$</span>
                                                        </div>
                                                    </div>
                                                    <div className="space-y-3">
                                                        <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">PRODUCT GROUP</label>
                                                        <div className="relative group">
                                                            <select 
                                                                value={formData.category} 
                                                                onChange={e => setFormData({...formData, category: e.target.value})} 
                                                                className="w-full bg-black/5 dark:bg-[#161b22] p-5 text-sm font-black outline-none border border-black/5 dark:border-[#30363d] focus:border-[#0d3542] dark:focus:border-[#58a6ff] transition-all uppercase text-gray-900 dark:text-white appearance-none cursor-pointer rounded-2xl"
                                                            >
                                                                <option value="">SELECT GROUP</option>
                                                                {categories.filter(c => c !== 'ALL GROUPS').map(cat => (
                                                                    <option key={cat} value={cat}>{cat}</option>
                                                                ))}
                                                                <option value="NEW_GROUP">+ CREATE NEW GROUP</option>
                                                            </select>
                                                            <ChevronDown className="absolute right-5 top-1/2 -translate-y-1/2 text-[#0d3542] dark:text-[#58a6ff]" size={16} />
                                                        </div>
                                                    </div>
                                                </div>
                                            </section>

                                            <section className="animate-in fade-in slide-in-from-bottom-4 duration-700">
                                                <div className="flex items-center gap-4 mb-10">
                                                    <div className="h-1 w-10 bg-[#0d3542] dark:bg-[#58a6ff] rounded-full" />
                                                    <h3 className="text-xs font-black uppercase tracking-[0.4em] text-[#0d3542] dark:text-[#58a6ff]">Inventory Thresholds</h3>
                                                </div>
                                                <div className="grid grid-cols-3 gap-12">
                                                    <div className="space-y-3">
                                                        <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">CURRENT RECORD</label>
                                                        <input type="number" value={formData.stock_qty} onChange={e => setFormData({...formData, stock_qty: e.target.value})} className="w-full bg-black/5 dark:bg-[#161b22] p-5 text-sm font-mono font-bold outline-none border border-black/5 dark:border-[#30363d] focus:border-[#0d3542] dark:focus:border-[#58a6ff] transition-all text-gray-900 dark:text-white rounded-2xl" />
                                                    </div>
                                                    <div className="space-y-3">
                                                        <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">MIN THRESHOLD</label>
                                                        <input type="number" value={formData.min_stock} onChange={e => setFormData({...formData, min_stock: e.target.value})} className="w-full bg-black/5 dark:bg-[#161b22] p-5 text-sm font-mono font-bold outline-none border border-black/5 dark:border-[#30363d] focus:border-[#0d3542] dark:focus:border-[#58a6ff] transition-all text-gray-900 dark:text-white rounded-2xl" />
                                                    </div>
                                                    <div className="space-y-3">
                                                        <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">MAX THRESHOLD</label>
                                                        <input type="number" value={formData.max_stock} onChange={e => setFormData({...formData, max_stock: e.target.value})} className="w-full bg-black/5 dark:bg-[#161b22] p-5 text-sm font-mono font-bold outline-none border border-black/5 dark:border-[#30363d] focus:border-[#0d3542] dark:focus:border-[#58a6ff] transition-all text-gray-900 dark:text-white rounded-2xl" />
                                                    </div>
                                                </div>
                                            </section>
                                        </>
                                    ) : (
                                        <section className="animate-in fade-in slide-in-from-bottom-4 duration-500">
                                            <div className="flex items-center justify-between mb-10">
                                                <div className="flex items-center gap-4">
                                                    <div className="h-1 w-10 bg-[#0d3542] dark:bg-[#58a6ff] rounded-full" />
                                                    <h3 className="text-xs font-black uppercase tracking-[0.4em] text-[#0d3542] dark:text-[#58a6ff]">Technical Matrix</h3>
                                                </div>
                                                <Button variant="outline" onClick={() => setFormData({...formData, attributes: [...(formData.attributes || []), { key: '', value: '' }]})} className="h-10 text-[10px] font-black uppercase tracking-widest border-black/10 dark:border-[#30363d] text-gray-400 hover:text-[#0d3542] dark:hover:text-[#58a6ff] transition-all rounded-xl">
                                                    <Plus size={14} className="mr-2" /> ADD PARAMETER
                                                </Button>
                                            </div>
                                            <div className="space-y-6">
                                                {(formData.attributes || []).map((attr, idx) => (
                                                    <div key={idx} className="flex gap-6 items-end animate-in fade-in slide-in-from-left-2 transition-all">
                                                        <div className="flex-1 space-y-3">
                                                            <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">KEY</label>
                                                            <input value={attr.key} onChange={e => {
                                                                const newAttrs = [...formData.attributes];
                                                                newAttrs[idx].key = e.target.value.toUpperCase();
                                                                setFormData({...formData, attributes: newAttrs});
                                                            }} className="w-full bg-black/5 dark:bg-[#161b22] p-5 text-xs font-bold uppercase outline-none border border-black/5 dark:border-[#30363d] focus:border-[#0d3542] dark:focus:border-[#58a6ff] transition-all text-gray-900 dark:text-white rounded-2xl" placeholder="E.G. FABRIC" />
                                                        </div>
                                                        <div className="flex-[2] space-y-3">
                                                            <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">VALUE</label>
                                                            <input value={attr.value} onChange={e => {
                                                                const newAttrs = [...formData.attributes];
                                                                newAttrs[idx].value = e.target.value.toUpperCase();
                                                                setFormData({...formData, attributes: newAttrs});
                                                            }} className="w-full bg-black/5 dark:bg-[#161b22] p-5 text-xs font-bold uppercase outline-none border border-black/5 dark:border-[#30363d] focus:border-[#0d3542] dark:focus:border-[#58a6ff] transition-all text-gray-900 dark:text-white rounded-2xl" placeholder="E.G. SCABAL DIAMOND CHIP" />
                                                        </div>
                                                        <button onClick={() => setFormData({...formData, attributes: formData.attributes.filter((_, i) => i !== idx)})} className="h-[60px] w-[60px] flex items-center justify-center text-gray-400 hover:text-white transition-all bg-black/5 dark:bg-white/5 rounded-2xl border border-black/5 dark:border-white/5 hover:bg-rose-500 hover:border-rose-500">
                                                            <Trash2 size={18} />
                                                        </button>
                                                    </div>
                                                ))}
                                            </div>
                                        </section>
                                    )}
                                </div>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>

            {/* --- Floating Command Bar --- */}
            <AnimatePresence>
                {selectedIds.size > 0 && view === 'list' && (
                    <motion.div initial={{ y: 100, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: 100, opacity: 0 }} className="fixed bottom-10 left-[calc(50%+120px)] -translate-x-1/2 z-[80]">
                                <div className="bg-[#fdfdfc] dark:bg-[#161b22] rounded-2xl px-8 h-20 flex items-center gap-10 border border-[#0d3542]/30 dark:border-[#58a6ff]/30 transition-all duration-300">
                            <div className="flex items-center gap-4 pr-10 border-r border-black/10 dark:border-[#30363d]">
                                <div className="bg-[#0d3542] dark:bg-[#58a6ff] text-white dark:text-black text-xs font-black h-7 w-7 rounded-lg flex items-center justify-center">{selectedIds.size}</div>
                                <span className="text-[#0d3542] dark:text-[#58a6ff] text-xs font-black uppercase tracking-[0.3em] whitespace-nowrap">Ledger Items</span>
                            </div>
                            <div className="flex items-center gap-10">
                                <button onClick={() => setIsBulkDialogOpen(true)} className="flex items-center gap-2 text-gray-500 dark:text-[#8b949e] hover:text-[#0d3542] dark:hover:text-[#58a6ff] transition-colors group">
                                    <Command size={16} className="group-hover:scale-110 transition-transform" />
                                    <span className="text-xs font-black uppercase tracking-[0.2em]">Bulk Override</span>
                                </button>
                                <button onClick={() => setSelectedIds(new Set())} className="text-gray-400 dark:text-[#8b949e]/40 hover:text-[#0d3542] dark:hover:text-[#58a6ff] text-[11px] font-black uppercase tracking-[0.2em]">Clear Ledger</button>
                            </div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

        </div>
    );
};

export default ProductsPage;

