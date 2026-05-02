import React, { useState, useMemo, useCallback, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient, keepPreviousData } from '@tanstack/react-query';
import axios from 'axios';
import { motion, AnimatePresence } from 'framer-motion';
import {
    X, Plus, Edit, Trash2, 
    Hash, DollarSign, Layers, Check, 
    ChevronDown, Archive, ChevronLeft, ChevronRight, Search, Package,
    Download, Upload, Tag, 
    Command, AlertCircle,
    ArrowUp, ArrowDown, Keyboard, Save, Box, Eye, FolderPlus,
    Coffee, GlassWater, Droplets, Flame, IceCream2, Wine, Beer, Cookie, Milk, Star, Award, Zap,
    Filter, RefreshCw, BarChart3, TrendingUp, Info, MoreVertical
} from 'lucide-react';
import { LumaSpin } from '@/components/ui/luma-spin';
import { Button } from '@/components/ui/button';
import { formatPrice } from '@/helpers/format';
import { useAdmin } from './AdminContext';
import Swal from 'sweetalert2';
import ModernModal from '../../common/ModernModal';

/* ─── Category Icons Map ──────────────────────────────────── */
const CATEGORY_ICONS = {
    Espresso: Flame,
    Cold: IceCream2,
    Tea: GlassWater,
    Blend: Droplets,
    Coffee: Coffee,
    SIGNATURES: Star,
    CLASSICS: Award,
    Gin: Zap,
    Whisky: Flame,
    Rum: Wine,
    Vodka: Droplets,
    'Tequila & Mezcal': Zap,
    SOFT_DRINKS: GlassWater,
    BEER: Beer,
    SNACKS: Cookie,
    WINE: Wine,
    GRAB: Milk,
};
const getCatIcon = (cat) => CATEGORY_ICONS[cat] || Coffee;

/* ─── Category Color Map ──────────────────────────────────── */
const CATEGORY_COLORS = {
    Espresso: {
        bg: 'bg-amber-500/10',
        border: 'border-amber-500/20',
        text: 'text-amber-600 dark:text-amber-400',
        fill: 'fill-amber-500',
    },
    Cold: {
        bg: 'bg-blue-500/10',
        border: 'border-blue-500/20',
        text: 'text-blue-600 dark:text-blue-400',
        fill: 'fill-blue-500',
    },
    Tea: {
        bg: 'bg-green-500/10',
        border: 'border-green-500/20',
        text: 'text-green-600 dark:text-green-400',
        fill: 'fill-green-500',
    },
    Blend: {
        bg: 'bg-purple-500/10',
        border: 'border-purple-500/20',
        text: 'text-purple-600 dark:text-purple-400',
        fill: 'fill-purple-500',
    },
    SIGNATURES: {
        bg: 'bg-indigo-500/10',
        border: 'border-indigo-500/20',
        text: 'text-indigo-600 dark:text-indigo-400',
        fill: 'fill-indigo-500',
    },
    CLASSICS: {
        bg: 'bg-rose-500/10',
        border: 'border-rose-500/20',
        text: 'text-rose-600 dark:text-rose-400',
        fill: 'fill-rose-500',
    },
    Gin: {
        bg: 'bg-cyan-500/10',
        border: 'border-cyan-500/20',
        text: 'text-cyan-600 dark:text-cyan-400',
        fill: 'fill-cyan-500',
    },
    Whisky: {
        bg: 'bg-orange-500/10',
        border: 'border-orange-500/20',
        text: 'text-orange-600 dark:text-orange-400',
        fill: 'fill-orange-500',
    },
    Rum: {
        bg: 'bg-red-500/10',
        border: 'border-red-500/20',
        text: 'text-red-600 dark:text-red-400',
        fill: 'fill-red-500',
    },
    SNACKS: {
        bg: 'bg-yellow-500/10',
        border: 'border-yellow-500/20',
        text: 'text-yellow-600 dark:text-yellow-400',
        fill: 'fill-yellow-500',
    },
    default: {
        bg: 'bg-gray-500/10',
        border: 'border-gray-500/20',
        text: 'text-gray-600 dark:text-gray-400',
        fill: 'fill-gray-500',
    },
};
const getCategoryColor = (cat) =>
    CATEGORY_COLORS[cat] || CATEGORY_COLORS.default;

/* ─── Animations ──────────────────────────────────────────── */
/* ─── Cyber-Bespoke UI Components ────────────────────────────────────── */
const Section = ({ title, subtitle, icon: Icon, children, accent = false }) => (
    <div className={`rounded-2xl border transition-colors ${accent ? 'border-[#0d3542]/15 dark:border-[#58a6ff]/15 bg-[#0d3542]/[0.02] dark:bg-[#58a6ff]/[0.02]' : 'border-black/5 dark:border-[#30363d] bg-white/50 dark:bg-[#161b22]/50'}`}>
        <div className="px-5 py-4 border-b border-black/5 dark:border-[#30363d]/50 flex items-center gap-3">
            {Icon && (
                <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${accent ? 'bg-[#0d3542]/10 dark:bg-[#58a6ff]/10' : 'bg-black/5 dark:bg-white/5'}`}>
                    <Icon size={16} className={accent ? 'text-[#0d3542] dark:text-[#58a6ff]' : 'text-gray-400 dark:text-[#8b949e]'} />
                </div>
            )}
            <div>
                <h3 className="text-xs font-bold text-gray-900 dark:text-[#c9d1d9] uppercase tracking-[0.15em]">{title}</h3>
                {subtitle && <p className="text-[9px] text-gray-400 dark:text-[#8b949e]/40 uppercase tracking-widest mt-0.5">{subtitle}</p>}
            </div>
        </div>
        <div className="p-5">
            {children}
        </div>
    </div>
);

const Field = ({ label, children, hint }) => (
    <div className="space-y-1.5">
        <label className="text-[10px] font-bold text-gray-400 dark:text-[#8b949e]/50 uppercase tracking-[0.15em] ml-0.5">{label}</label>
        {children}
        {hint && <p className="text-[9px] text-gray-300 dark:text-[#8b949e]/20 uppercase tracking-widest ml-0.5">{hint}</p>}
    </div>
);

const SidebarSection = ({ title, icon: Icon, children }) => (
    <div className="border-b border-black/5 dark:border-[#30363d]/50">
        <div className="px-5 py-3 flex items-center gap-2.5">
            {Icon && <Icon size={12} className="text-[#0d3542] dark:text-[#58a6ff]" />}
            <h3 className="text-[10px] font-black text-gray-900 dark:text-[#c9d1d9] uppercase tracking-[0.2em]">{title}</h3>
        </div>
        <div className="px-5 pb-4">
            {children}
        </div>
    </div>
);

const BespokeSelect = ({ value, options, onChange, placeholder = "Select...", className = "", direction = "down" }) => {
    const [isOpen, setIsOpen] = useState(false);
    const [calculatedDirection, setCalculatedDirection] = useState(direction);
    const containerRef = useRef(null);

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (containerRef.current && !containerRef.current.contains(event.target)) {
                setIsOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    useEffect(() => {
        if (isOpen && containerRef.current) {
            const rect = containerRef.current.getBoundingClientRect();
            const spaceBelow = window.innerHeight - rect.bottom;
            if (spaceBelow < 300) setCalculatedDirection("up");
            else setCalculatedDirection("down");
        }
    }, [isOpen]);

    return (
        <div ref={containerRef} className={`relative ${className}`}>
            <button
                type="button"
                onClick={() => setIsOpen(!isOpen)}
                className="w-full bg-black/5 dark:bg-white/5 p-4 text-[11px] font-black outline-none border border-black/15 dark:border-white/10 focus:border-[#0d3542] dark:focus:border-[#58a6ff] transition-all uppercase text-gray-900 dark:text-white flex items-center justify-between rounded-xl group"
            >
                <span className={!value ? 'text-gray-400 dark:text-white/10 truncate' : 'truncate'}>
                    {value || placeholder}
                </span>
                <ChevronDown size={14} className={`text-[#0d3542] dark:text-[#58a6ff] shrink-0 transition-transform duration-300 ${isOpen ? 'rotate-180' : ''}`} />
            </button>
            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ opacity: 0, y: calculatedDirection === "up" ? 10 : -10, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: calculatedDirection === "up" ? 10 : -10, scale: 0.95 }}
                        transition={{ duration: 0.2, ease: "easeOut" }}
                        className={`absolute z-100 min-w-full w-max max-w-[300px] mt-2 bg-white dark:bg-[#161b22] border-2 border-black/15 dark:border-[#30363d] shadow-2xl rounded-2xl overflow-hidden py-2 ${calculatedDirection === "up" ? "bottom-full mb-2" : ""}`}
                    >
                        <div className="max-h-75 overflow-y-auto attire-scrollbar">
                            {options.map((option, i) => {
                                const label = typeof option === 'string' ? option : option.label;
                                const val = typeof option === 'string' ? option : option.value;
                                return (
                                    <button
                                        key={i}
                                        type="button"
                                        onClick={() => { onChange(val); setIsOpen(false); }}
                                        className={`w-full px-5 py-4 text-left text-[11px] font-black uppercase tracking-widest transition-colors flex items-center justify-between group
                                            ${val === value 
                                                ? 'bg-[#0d3542]/5 dark:bg-[#58a6ff]/10 text-[#0d3542] dark:text-[#58a6ff]' 
                                                : 'text-gray-600 dark:text-[#8b949e] hover:bg-black/5 dark:hover:bg-white/5'
                                            }`}
                                    >
                                        <span>{label}</span>
                                        {val === value && <Check size={14} />}
                                    </button>
                                );
                            })}
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

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
        <div className="absolute inset-0 z-50 bg-[#fdfdfc] dark:bg-[#111] flex items-center px-4 ring-2 ring-inset ring-[#0d3542] dark:ring-[#58a6ff] translate-y-0">
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
                <div className="px-2 py-1 bg-black/5 dark:bg-white/5 border border-black/25 dark:border-white/10 rounded text-[10px] font-black uppercase text-[#0d3542] dark:text-[#58a6ff]">Enter: Save</div>
            </div>
        </div>
    );
};

const DrinkRow = React.memo(({ 
    drink, isSelected, isFocused, quickEditField, 
    onToggleSelect, onFocus, onEdit, onDelete, onQuickEdit, onUpdateField,
    performanceMode
}) => {
    const d = drink;
    const CatIcon = getCatIcon(d.category);
    const colorScheme = getCategoryColor(d.category);
    const isOut = d.stock_qty <= 0 && !d.is_service;

    return (
        <React.Fragment>
            <tr 
                id={`row-${d.id}`}
                onClick={(e) => { e.stopPropagation(); onFocus(isFocused ? null : d.id); }}
                onDoubleClick={(e) => { e.stopPropagation(); onEdit(d); }}
                className={`group cursor-pointer border-b border-black/15 dark:border-[#30363d] ${isSelected ? 'bg-[#0d3542]/5 dark:bg-[#58a6ff]/5' : 'hover:bg-black/[0.01] dark:hover:bg-white/[0.02]'} ${isFocused ? 'bg-black/[0.03] dark:bg-white/[0.04]' : ''}`}
            >
                <td className="px-4 py-3 text-center relative">
                    {isFocused && <div className="absolute left-0 top-0 bottom-0 w-1 bg-[#0d3542] dark:bg-[#58a6ff]" />}
                    <button 
                        onClick={(e) => { e.stopPropagation(); onToggleSelect(d.id); }}
                        className={`w-5 h-5 rounded-md border-2 flex items-center justify-center transition-all mx-auto ${isSelected ? 'bg-[#0d3542] dark:bg-[#58a6ff] border-[#0d3542] dark:border-[#58a6ff]' : 'border-black/25 dark:border-[#30363d] group-hover:border-[#0d3542]/40 dark:group-hover:border-[#58a6ff]/40'}`}
                    >
                        {isSelected && <Check size={12} className="text-white dark:text-black" />}
                    </button>
                </td>
                <td className="px-4 py-3 text-center border-l-2 border-black/15 dark:border-[#30363d]">
                    <div className="flex items-center justify-center gap-2">
                        <div className={`w-2 h-2 rounded-full ring-2 ${!d.is_active ? 'bg-gray-500 ring-gray-500/30' : (d.stock_qty > 0 || d.is_service ? 'bg-emerald-500 ring-emerald-500/30' : 'bg-red-500 ring-red-500/30')}`} />
                    </div>
                </td>
                <td className="px-5 py-3 font-mono font-black tracking-tighter text-[#0d3542] dark:text-[#58a6ff] uppercase text-[12px] border-l-2 border-black/15 dark:border-[#30363d] text-center">{d.sku || '—'}</td>
                <td className="px-6 py-3 border-l-2 border-black/15 dark:border-[#30363d] overflow-hidden">
                    <div className="flex items-center gap-3 leading-tight truncate">
                        <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${colorScheme.bg} border ${colorScheme.border}`}>
                            {d.image_path ? (
                                <img src={d.image_path} alt={d.name} className="w-full h-full object-cover rounded-lg" />
                            ) : (
                                <CatIcon size={14} className={colorScheme.text} />
                            )}
                        </div>
                        <span className={`font-black uppercase tracking-wider group-hover:text-[#0d3542] dark:group-hover:text-[#58a6ff] transition-colors text-[14px] truncate flex items-center gap-2 ${!d.is_active ? 'text-gray-400 opacity-50 line-through' : 'text-gray-900 dark:text-[#c9d1d9]'}`}>
                            {d.name}
                            {!d.is_active && <span className="text-[9px] px-1.5 py-0.5 rounded-sm bg-gray-500/10 text-gray-500 uppercase tracking-widest no-underline">Archived</span>}
                        </span>
                    </div>
                </td>
                <td className="px-5 py-3 border-l-2 border-black/15 dark:border-[#30363d] text-center">
                    <span className={`px-2 py-0.5 ${colorScheme.bg} text-[9px] font-black ${colorScheme.text} rounded-md uppercase tracking-[0.2em] border ${colorScheme.border}`}>{d.category}</span>
                </td>
                <td className={`px-6 py-3 text-right font-mono font-black relative text-[20px] border-l-2 border-black/15 dark:border-[#30363d] ${isOut ? 'text-red-500' : 'text-emerald-600 dark:text-emerald-400'}`}>
                    {isFocused && quickEditField === 'stock' ? (
                        <QuickEditCell value={d.stock_qty} onSave={(val) => onUpdateField(d.id, { stock_qty: val })} onClose={() => onQuickEdit(null)} />
                    ) : (
                        <div className="flex items-center justify-end gap-1">
                            <span className="drop-shadow-sm">{d.is_service ? '∞' : d.stock_qty}</span>
                            {!d.is_service && <Box size={14} className="opacity-60" />}
                        </div>
                    )}
                </td>
                <td className="px-8 py-3 text-center font-mono font-black text-gray-900 dark:text-[#c9d1d9] text-[16px] relative border-l-2 border-black/15 dark:border-[#30363d]">
                    {isFocused && quickEditField === 'price' ? (
                        <QuickEditCell value={d.price} prefix="$" onSave={(val) => onUpdateField(d.id, { price: val })} onClose={() => onQuickEdit(null)} />
                    ) : formatPrice(d.price)}
                </td>
            </tr>
        </React.Fragment>
    );
});

/* ─── Main Component ──────────────────────────────────────── */
export default function DrinkManager() {
    const queryClient = useQueryClient();
    const { activeOutlet, performanceMode, OUTLET_CONFIG } = useAdmin();

    // State
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingDrink, setEditingDrink] = useState(null);
    const [isSaving, setIsSaving] = useState(false);
    const [page, setPage] = useState(1);
    const [filters, setFilters] = useState({
        search: '',
        category: '',
        status: 'active',
        stockStatus: '',
    });

    // High Performance Matrix State
    const [selectedIds, setSelectedIds] = useState(new Set());
    const [focusedId, setFocusedId] = useState(null);
    const [quickEditField, setQuickEditField] = useState(null);

    const [formData, setFormData] = useState({
        sku: '',
        name: '',
        price: '',
        stock_qty: '',
        category: '',
        is_active: true,
        is_service: false,
        image_path: '',
    });
    const [uploading, setUploading] = useState(false);
    const [toast, setToast] = useState(null);

    const handleImageUpload = async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        setUploading(true);
        const formDataUpload = new FormData();
        formDataUpload.append('image', file);

        try {
            const response = await axios.post('/api/v1/admin/images/upload', formDataUpload, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });
            setFormData(prev => ({ ...prev, image_path: response.data.url }));
        } catch (err) {
            console.error("Upload Failed:", err);
            setToast({ type: 'error', message: 'Failed to upload image' });
            setTimeout(() => setToast(null), 3000);
        } finally {
            setUploading(false);
        }
    };

    // Auto-dismiss toasts
    useEffect(() => {
        if (!toast) return;
        const timer = setTimeout(() => setToast(null), 3500);
        return () => clearTimeout(timer);
    }, [toast]);

    // Centralized modal close — always resets everything
    const closeModal = useCallback(() => {
        setIsModalOpen(false);
        setIsSaving(false);
        // Delay state reset so the exit animation plays with current data
        setTimeout(() => {
            setEditingDrink(null);
            setFormData({ sku: '', name: '', price: '', stock_qty: '', category: '', is_active: true, is_service: false, image_path: '' });
        }, 200);
    }, []);

    // API Query
    const { data, isLoading } = useQuery({
        queryKey: ['admin-drinks', page, filters, activeOutlet],
        queryFn: async () => {
            const params = {
                page,
                status: filters.status,
                category: filters.category,
                search: filters.search,
                stock_status: filters.stockStatus,
                outlet: activeOutlet,
            };
            const res = await axios.get('/api/v1/admin/pos/products', { params });
            return res.data;
        },
        staleTime: 1000 * 15,
        placeholderData: keepPreviousData,
    });

    // Prefetch for inactive outlets to make switching instant
    useEffect(() => {
        const otherOutlets = Object.keys(OUTLET_CONFIG || { attire_lounge: 1, caffeine: 1, kravat: 1 }).filter(o => o !== activeOutlet);
        otherOutlets.forEach(outlet => {
            queryClient.prefetchQuery({
                queryKey: ['admin-drinks', 1, { status: 'active', category: '', search: '', stockStatus: '' }, outlet],
                queryFn: async () => {
                    const params = { page: 1, status: 'active', category: '', search: '', stockStatus: '', outlet };
                    const res = await axios.get('/api/v1/admin/pos/products', { 
                        params,
                        headers: { 'X-Active-Outlet': outlet }
                    });
                    return res.data;
                },
                staleTime: 5 * 60 * 1000,
            });
        });
    }, [activeOutlet, queryClient, OUTLET_CONFIG]);

    const drinks = data?.data || [];
    const meta = data?.meta || {};

    const categories = useMemo(() => {
        const cats = new Set(drinks.map((d) => d.category).filter(Boolean));
        return ['Espresso', 'Cold', 'Tea', 'Blend', ...Array.from(cats)]
            .filter((v, i, a) => a.indexOf(v) === i)
            .sort();
    }, [drinks]);

    const stats = useMemo(() => ({
        total: drinks.length,
        lowStock: drinks.filter(d => d.stock_qty <= 5 && d.stock_qty > 0 && !d.is_service).length,
        outOfStock: drinks.filter(d => d.stock_qty <= 0 && !d.is_service).length,
        unlimited: drinks.filter(d => d.is_service).length,
    }), [drinks]);

    const filteredDrinks = useMemo(() => {
        let result = drinks;
        if (filters.search) {
            const s = filters.search.toLowerCase();
            result = result.filter(d => 
                d.name.toLowerCase().includes(s) || 
                (d.sku && d.sku.toLowerCase().includes(s)) ||
                (d.category && d.category.toLowerCase().includes(s))
            );
        }
        if (filters.category) result = result.filter(d => d.category === filters.category);
        if (filters.stockStatus === 'low') result = result.filter(d => d.stock_qty <= 5 && d.stock_qty > 0 && !d.is_service);
        if (filters.stockStatus === 'out') result = result.filter(d => d.stock_qty <= 0 && !d.is_service);
        return result;
    }, [drinks, filters]);

    // Mutations
    const mutation = useMutation({
        mutationFn: async (payload) => {
            const data = { ...payload };
            
            // Clean up fields that aren't in the backend validation schema
            delete data.status;  // Not a validated field
            delete data.outlet;  // Sent via header, not body
            
            // Clean up empty optional fields to prevent Laravel validation 422s
            if (!data.sku) delete data.sku;
            if (data.image_path === '') data.image_path = null;
            if (data.price === '' || data.price === null || data.price === undefined) delete data.price;
            if (data.stock_qty === '' || data.stock_qty === null || data.stock_qty === undefined) data.stock_qty = 0;
            if (data.category === '') delete data.category;

            console.log('[DrinkManager] Saving payload:', JSON.stringify(data));

            if (editingDrink) {
                return axios.put(`/api/v1/admin/pos/products/${editingDrink.id}`, data);
            }
            return axios.post('/api/v1/admin/pos/products', data);
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['admin-drinks'] });
            queryClient.invalidateQueries({ queryKey: ['admin-stats'] });
            closeModal();
            setToast({ message: `Drink saved successfully!`, type: 'success' });
        },
        onError: (err) => {
            setIsSaving(false);
            const errors = err.response?.data?.errors;
            let detail = '';
            if (errors) {
                detail = ': ' + Object.values(errors).map(e => e.join(', ')).join(' | ');
            }
            console.error("Validation Errors:", errors);
            setToast({ message: (err.response?.data?.message || 'Failed to save drink.') + detail, type: 'error' });
        },
    });

    const deleteMutation = useMutation({
        mutationFn: async (id) => axios.delete(`/api/v1/admin/pos/products/${id}`),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['admin-drinks'] });
            queryClient.invalidateQueries({ queryKey: ['admin-stats'] });
            setToast({ message: 'Drink deleted successfully!', type: 'success' });
            setSelectedIds(new Set());
        },
        onError: (err) => {
            setToast({ message: err.response?.data?.message || 'Failed to delete drink.', type: 'error' });
        },
    });

    const bulkDeactivateMutation = useMutation({
        mutationFn: (ids) => axios.post('/api/v1/admin/pos/products/bulk-deactivate', { product_ids: ids }),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['admin-drinks'] });
            queryClient.invalidateQueries({ queryKey: ['admin-stats'] });
            setToast({ message: 'Selected drinks deactivated.', type: 'success' });
            setSelectedIds(new Set());
        },
        onError: (err) => {
            setToast({ message: err.response?.data?.message || 'Failed to deactivate.', type: 'error' });
        },
    });

    const bulkRestoreMutation = useMutation({
        mutationFn: (ids) => axios.post('/api/v1/admin/pos/products/bulk-restore', { product_ids: ids }),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['admin-drinks'] });
            queryClient.invalidateQueries({ queryKey: ['admin-stats'] });
            setToast({ message: 'Selected drinks restored.', type: 'success' });
            setSelectedIds(new Set());
        },
        onError: (err) => {
            setToast({ message: err.response?.data?.message || 'Failed to restore.', type: 'error' });
        },
    });


    const updateMutation = useMutation({
        mutationFn: ({ id, data }) => axios.put(`/api/v1/admin/pos/products/${id}`, { ...data, outlet: activeOutlet }),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['admin-drinks'] });
            queryClient.invalidateQueries({ queryKey: ['admin-stats'] });
            setQuickEditField(null);
        }
    });

    // Handlers
    const toggleSelect = useCallback((id) => {
        setSelectedIds(prev => {
            const next = new Set(prev);
            if (next.has(id)) next.delete(id);
            else next.add(id);
            return next;
        });
    }, []);

    const handleSelectAll = () => {
        if (selectedIds.size === filteredDrinks.length) {
            setSelectedIds(new Set());
        } else {
            setSelectedIds(new Set(filteredDrinks.map(d => d.id)));
        }
    };

    const handleBulkDeactivate = () => {
        if (!window.confirm(`Deactivate ${selectedIds.size} selected drinks?`)) return;
        bulkDeactivateMutation.mutate(Array.from(selectedIds));
    };

    const handleBulkRestore = () => {
        if (!window.confirm(`Restore ${selectedIds.size} selected drinks?`)) return;
        bulkRestoreMutation.mutate(Array.from(selectedIds));
    };

    // Keyboard Navigation
    useEffect(() => {
        const handleKeyDown = (e) => {
            if (e.key === '/' && document.activeElement.tagName !== 'INPUT') {
                e.preventDefault();
                document.getElementById('search-drinks')?.focus();
            }

            if (filteredDrinks.length === 0) return;

            if (e.key === 'ArrowDown') {
                if (document.activeElement.tagName === 'INPUT' || document.activeElement.tagName === 'TEXTAREA') return;
                e.preventDefault();
                setFocusedId(prev => {
                    const idx = filteredDrinks.findIndex(d => d.id === prev);
                    if (idx === -1) return filteredDrinks[0]?.id;
                    return filteredDrinks[Math.min(idx + 1, filteredDrinks.length - 1)]?.id;
                });
            }
            if (e.key === 'ArrowUp') {
                if (document.activeElement.tagName === 'INPUT' || document.activeElement.tagName === 'TEXTAREA') return;
                e.preventDefault();
                setFocusedId(prev => {
                    const idx = filteredDrinks.findIndex(d => d.id === prev);
                    if (idx <= 0) return filteredDrinks[0]?.id;
                    return filteredDrinks[idx - 1]?.id;
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
                if (focusedId && document.activeElement.tagName !== 'INPUT' && !quickEditField) {
                    e.preventDefault();
                    const drink = filteredDrinks.find(d => d.id === focusedId);
                    if (drink) {
                        setEditingDrink(drink);
                        setFormData({
                            sku: drink.sku || '',
                            name: drink.name || '',
                            price: drink.price || '',
                            stock_qty: drink.stock_qty || '',
                            category: drink.category || '',
                            is_active: drink.is_active ?? true,
                            is_service: drink.is_service || false,
                            image_path: drink.image_path || '',
                        });
                        setIsModalOpen(true);
                    }
                }
            }
            if (e.key === 'Escape') {
                if (isModalOpen) { closeModal(); return; }
                if (quickEditField) { setQuickEditField(null); return; }
                if (selectedIds.size > 0) { setSelectedIds(new Set()); return; }
                if (focusedId) { setFocusedId(null); return; }
            }
        };

        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [filteredDrinks, focusedId, quickEditField, toggleSelect, isModalOpen, closeModal, selectedIds]);

    // UI Render Matrix
    return (
        <div className="flex h-screen bg-[#fdfdfc] dark:bg-[#010409] text-gray-900 dark:text-[#c9d1d9] font-sans overflow-hidden selection:bg-[#0d3542]/20 dark:selection:bg-[#58a6ff]/30">
            {toast && (
                <div className="fixed top-6 right-6 z-50 animate-in slide-in-from-top-4 fade-in">
                    <div className={`px-6 py-4 rounded-2xl border flex items-center gap-3 font-black text-[13px] uppercase tracking-widest shadow-2xl ${toast.type === 'error' ? 'bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-900/50 text-red-600 dark:text-red-400' : 'bg-emerald-50 dark:bg-emerald-900/20 border-emerald-200 dark:border-emerald-900/50 text-emerald-600 dark:text-emerald-400'}`}>
                        {toast.type === 'error' ? <AlertCircle size={18} /> : <Check size={18} />}
                        {toast.message}
                    </div>
                </div>
            )}

            {/* Sidebar */}
            <div className="w-[320px] shrink-0 border-r border-black/10 dark:border-white/5 bg-[#fdfdfc] dark:bg-[#010409] flex flex-col z-20">
                <div className="p-8 pb-6 border-b border-black/10 dark:border-white/5 bg-black/[0.02] dark:bg-white/[0.02]">
                    <div className="flex items-center gap-4 mb-4">
                        <div className="w-12 h-12 bg-[#0d3542] dark:bg-[#58a6ff] rounded-xl flex items-center justify-center shadow-lg shadow-[#0d3542]/20 dark:shadow-[#58a6ff]/20">
                            <Coffee size={24} className="text-white dark:text-black" />
                        </div>
                        <div>
                            <h1 className="text-[24px] font-black tracking-tighter text-gray-900 dark:text-white leading-none">
                                Drinks
                            </h1>
                            <p className="text-[11px] font-bold tracking-widest text-[#0d3542] dark:text-[#58a6ff] uppercase mt-1">
                                {activeOutlet === 'attire_lounge' ? 'Lounge' : activeOutlet} Menu
                            </p>
                        </div>
                    </div>
                    <p className="text-[13px] text-gray-500 dark:text-[#8b949e] font-medium leading-relaxed">
                        Manage beverage inventory, prices, and categories.
                    </p>
                </div>

                <div className="flex-1 overflow-y-auto attire-scrollbar p-6 space-y-6">
                    <SidebarSection title="Search & Filter">
                        <div className="relative group">
                            <Search size={14} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 dark:text-[#8b949e] group-focus-within:text-[#0d3542] dark:group-focus-within:text-[#58a6ff] transition-colors" />
                            <input
                                id="search-drinks"
                                type="text"
                                placeholder="Search drinks... (/)"
                                value={filters.search}
                                onChange={(e) => setFilters(f => ({ ...f, search: e.target.value }))}
                                className="w-full bg-black/5 dark:bg-white/5 text-gray-900 dark:text-white text-[13px] font-bold rounded-xl pl-10 pr-4 py-3 outline-none border border-black/15 dark:border-white/10 focus:border-[#0d3542] dark:focus:border-[#58a6ff] transition-all placeholder-gray-400 dark:placeholder-white/20"
                            />
                        </div>
                    </SidebarSection>

                    <SidebarSection title="Categories">
                        <div className="space-y-1">
                            <button
                                onClick={() => setFilters(f => ({ ...f, category: '' }))}
                                className={`w-full text-left px-4 py-2.5 rounded-lg text-[11px] font-black uppercase tracking-widest transition-colors flex justify-between items-center ${!filters.category ? 'bg-[#0d3542] dark:bg-[#58a6ff] text-white dark:text-black' : 'text-gray-500 dark:text-[#8b949e] hover:bg-black/5 dark:hover:bg-white/5'}`}
                            >
                                All Categories
                            </button>
                            {categories.map(cat => (
                                <button
                                    key={cat}
                                    onClick={() => setFilters(f => ({ ...f, category: cat }))}
                                    className={`w-full text-left px-4 py-2.5 rounded-lg text-[11px] font-black uppercase tracking-widest transition-colors flex justify-between items-center ${filters.category === cat ? 'bg-[#0d3542] dark:bg-[#58a6ff] text-white dark:text-black' : 'text-gray-500 dark:text-[#8b949e] hover:bg-black/5 dark:hover:bg-white/5'}`}
                                >
                                    {cat}
                                </button>
                            ))}
                        </div>
                    </SidebarSection>
                    
                    <SidebarSection title="Inventory Health">
                        <div className="space-y-1">
                            <button
                                onClick={() => setFilters(f => ({ ...f, stockStatus: '' }))}
                                className={`w-full text-left px-4 py-2.5 rounded-lg text-[11px] font-black uppercase tracking-widest transition-colors flex justify-between items-center ${!filters.stockStatus ? 'bg-[#0d3542]/10 dark:bg-[#58a6ff]/10 text-[#0d3542] dark:text-[#58a6ff]' : 'text-gray-500 dark:text-[#8b949e] hover:bg-black/5 dark:hover:bg-white/5'}`}
                            >
                                <span>All Items</span>
                                <span className="opacity-50">{stats.total}</span>
                            </button>
                            <button
                                onClick={() => setFilters(f => ({ ...f, stockStatus: 'low' }))}
                                className={`w-full text-left px-4 py-2.5 rounded-lg text-[11px] font-black uppercase tracking-widest transition-colors flex justify-between items-center ${filters.stockStatus === 'low' ? 'bg-amber-500/10 text-amber-600 dark:text-amber-400' : 'text-gray-500 dark:text-[#8b949e] hover:bg-black/5 dark:hover:bg-white/5'}`}
                            >
                                <span>Low Stock</span>
                                <span className="opacity-50">{stats.lowStock}</span>
                            </button>
                            <button
                                onClick={() => setFilters(f => ({ ...f, stockStatus: 'out' }))}
                                className={`w-full text-left px-4 py-2.5 rounded-lg text-[11px] font-black uppercase tracking-widest transition-colors flex justify-between items-center ${filters.stockStatus === 'out' ? 'bg-red-500/10 text-red-600 dark:text-red-400' : 'text-gray-500 dark:text-[#8b949e] hover:bg-black/5 dark:hover:bg-white/5'}`}
                            >
                                <span>Out of Stock</span>
                                <span className="opacity-50">{stats.outOfStock}</span>
                            </button>
                        </div>
                    </SidebarSection>
                    
                    <SidebarSection title="Product Status">
                        <div className="space-y-1">
                            <button
                                onClick={() => setFilters(f => ({ ...f, status: 'active' }))}
                                className={`w-full text-left px-4 py-2.5 rounded-lg text-[11px] font-black uppercase tracking-widest transition-colors flex justify-between items-center ${filters.status === 'active' ? 'bg-[#0d3542] dark:bg-[#58a6ff] text-white dark:text-black' : 'text-gray-500 dark:text-[#8b949e] hover:bg-black/5 dark:hover:bg-white/5'}`}
                            >
                                Active Menu
                            </button>
                            <button
                                onClick={() => setFilters(f => ({ ...f, status: 'inactive' }))}
                                className={`w-full text-left px-4 py-2.5 rounded-lg text-[11px] font-black uppercase tracking-widest transition-colors flex justify-between items-center ${filters.status === 'inactive' ? 'bg-[#0d3542] dark:bg-[#58a6ff] text-white dark:text-black' : 'text-gray-500 dark:text-[#8b949e] hover:bg-black/5 dark:hover:bg-white/5'}`}
                            >
                                Archived / Inactive
                            </button>
                            <button
                                onClick={() => setFilters(f => ({ ...f, status: 'all' }))}
                                className={`w-full text-left px-4 py-2.5 rounded-lg text-[11px] font-black uppercase tracking-widest transition-colors flex justify-between items-center ${filters.status === 'all' ? 'bg-[#0d3542]/10 dark:bg-[#58a6ff]/10 text-[#0d3542] dark:text-[#58a6ff]' : 'text-gray-500 dark:text-[#8b949e] hover:bg-black/5 dark:hover:bg-white/5'}`}
                            >
                                Show All
                            </button>
                        </div>
                    </SidebarSection>
                </div>
            </div>

            {/* Main Content Area */}
            <div className="flex-1 flex flex-col relative min-w-0">
                <header className="h-[80px] shrink-0 border-b border-black/10 dark:border-white/5 bg-[#fdfdfc]/80 dark:bg-[#010409]/80 backdrop-blur-xl px-8 flex items-center justify-between z-10">
                    <div className="flex items-center gap-6">
                        <div className="flex gap-2">
                            <div className="h-2 w-2 rounded-full bg-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.5)]" />
                            <span className="text-[10px] font-black tracking-widest uppercase text-emerald-600 dark:text-emerald-400">System Live</span>
                        </div>
                        <div className="h-4 w-px bg-black/10 dark:bg-white/10" />
                        <div className="flex items-center gap-2 text-[10px] font-black tracking-widest uppercase text-gray-400 dark:text-[#8b949e]">
                            <Keyboard size={12} />
                            <span>Cmd+K: Actions</span>
                        </div>
                    </div>

                    <div className="flex items-center gap-3">
                        {selectedIds.size > 0 && (
                            <motion.div 
                                initial={{ opacity: 0, scale: 0.95 }}
                                animate={{ opacity: 1, scale: 1 }}
                                className="flex items-center gap-2 mr-4"
                            >
                                <span className="text-[11px] font-black uppercase tracking-widest text-[#0d3542] dark:text-[#58a6ff]">
                                    {selectedIds.size} Selected
                                </span>
                                <button
                                    onClick={filters.status === 'inactive' ? handleBulkRestore : handleBulkDeactivate}
                                    className={`px-4 py-2.5 rounded-lg text-[11px] font-black uppercase tracking-widest transition-colors flex items-center gap-2 ${
                                        filters.status === 'inactive'
                                            ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 hover:bg-emerald-500 hover:text-white'
                                            : 'bg-red-500/10 text-red-600 dark:text-red-400 hover:bg-red-500 hover:text-white'
                                    }`}
                                >
                                    {filters.status === 'inactive' ? <RefreshCw size={14} /> : <Trash2 size={14} />}
                                    {filters.status === 'inactive' ? 'Restore' : 'Deactivate'}
                                </button>
                            </motion.div>
                        )}
                        <button
                            onClick={() => {
                                setEditingDrink(null);
                                setFormData({
                                    sku: '', name: '', price: '', stock_qty: '', category: '', is_active: true, is_service: false, image_path: ''
                                });
                                setIsModalOpen(true);
                            }}
                            className="h-[40px] px-6 bg-[#0d3542] dark:bg-[#58a6ff] hover:opacity-90 text-white dark:text-black rounded-xl text-[12px] font-black uppercase tracking-widest transition-all flex items-center gap-2 shadow-lg shadow-[#0d3542]/20 dark:shadow-[#58a6ff]/20"
                        >
                            <Plus size={16} />
                            New Drink
                        </button>
                    </div>
                </header>

                <div className="flex-1 overflow-auto attire-scrollbar bg-[#f5f5f4] dark:bg-[#0d1117]">
                    {(isLoading && drinks.length === 0) ? (
                        <div className="min-w-[1000px] p-6 pb-24">
                            <div className="bg-[#fdfdfc] dark:bg-[#010409] border-2 border-black/10 dark:border-[#30363d] rounded-2xl shadow-xl overflow-hidden">
                                <table className="w-full text-left border-collapse table-fixed">
                                    <thead>
                                        <tr className="border-b-2 border-black/10 dark:border-[#30363d] bg-[#f5f5f4] dark:bg-[#161b22]">
                                            <th className="w-10 px-4 py-4"></th>
                                            <th className="w-auto px-6 py-4 border-l-2 border-black/10 dark:border-[#30363d] text-[10px] font-black uppercase tracking-widest text-[#0d3542] dark:text-[#58a6ff]">Beverage</th>
                                            <th className="w-40 px-5 py-4 border-l-2 border-black/10 dark:border-[#30363d] text-[10px] font-black uppercase tracking-widest text-[#0d3542] dark:text-[#58a6ff] text-center">Category</th>
                                            <th className="w-32 px-6 py-4 border-l-2 border-black/10 dark:border-[#30363d] text-[10px] font-black uppercase tracking-widest text-[#0d3542] dark:text-[#58a6ff] text-right">Stock</th>
                                            <th className="w-32 px-8 py-4 border-l-2 border-black/10 dark:border-[#30363d] text-[10px] font-black uppercase tracking-widest text-[#0d3542] dark:text-[#58a6ff] text-center">Price</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {Array.from({ length: 8 }).map((_, i) => (
                                            <tr key={i} className="border-b border-black/5 dark:border-[#21262d]">
                                                <td className="px-4 py-3"><div className="w-4 h-4 rounded bg-gray-200 dark:bg-[#21262d] animate-pulse" /></td>
                                                <td className="px-6 py-3 border-l-2 border-black/10 dark:border-[#30363d]">
                                                    <div className="flex items-center gap-3">
                                                        <div className="w-8 h-8 rounded-lg bg-gray-200 dark:bg-[#21262d] animate-pulse" />
                                                        <div className={`h-4 rounded bg-gray-200 dark:bg-[#21262d] animate-pulse`} style={{ width: `${100 + Math.random() * 120}px`, animationDelay: `${i * 80}ms` }} />
                                                    </div>
                                                </td>
                                                <td className="px-5 py-3 border-l-2 border-black/10 dark:border-[#30363d] text-center"><div className="h-5 w-16 mx-auto rounded-md bg-gray-200 dark:bg-[#21262d] animate-pulse" style={{ animationDelay: `${i * 80 + 40}ms` }} /></td>
                                                <td className="px-6 py-3 border-l-2 border-black/10 dark:border-[#30363d] text-right"><div className="h-5 w-10 ml-auto rounded bg-gray-200 dark:bg-[#21262d] animate-pulse" style={{ animationDelay: `${i * 80 + 60}ms` }} /></td>
                                                <td className="px-8 py-3 border-l-2 border-black/10 dark:border-[#30363d] text-center"><div className="h-5 w-14 mx-auto rounded bg-gray-200 dark:bg-[#21262d] animate-pulse" style={{ animationDelay: `${i * 80 + 80}ms` }} /></td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    ) : filteredDrinks.length === 0 ? (
                        <div className="h-full flex items-center justify-center">
                            <div className="text-center">
                                <Coffee size={48} className="mx-auto mb-4 text-black/10 dark:text-white/10" />
                                <h3 className="text-lg font-black text-gray-900 dark:text-white mb-1">No Drinks Found</h3>
                                <p className="text-sm text-gray-500 dark:text-[#8b949e]">Try adjusting your search or filters.</p>
                            </div>
                        </div>
                    ) : (
                        <div className="min-w-[1000px] p-6 pb-24">
                            <div className="bg-[#fdfdfc] dark:bg-[#010409] border-2 border-black/10 dark:border-[#30363d] rounded-2xl shadow-xl overflow-hidden">
                                <table className="w-full text-left border-collapse table-fixed">
                                    <thead>
                                        <tr className="bg-black/5 dark:bg-white/5 border-b-2 border-black/10 dark:border-[#30363d]">
                                            <th className="w-16 px-4 py-4 text-center">
                                                <button onClick={handleSelectAll} className={`w-5 h-5 rounded-md border-2 flex items-center justify-center transition-all mx-auto ${selectedIds.size === filteredDrinks.length && filteredDrinks.length > 0 ? 'bg-[#0d3542] dark:bg-[#58a6ff] border-[#0d3542] dark:border-[#58a6ff]' : 'border-black/25 dark:border-[#30363d] hover:border-[#0d3542]/40'}`}>
                                                    {selectedIds.size === filteredDrinks.length && filteredDrinks.length > 0 && <Check size={12} className="text-white dark:text-black" />}
                                                </button>
                                            </th>
                                            <th className="w-16 px-4 py-4 text-center border-l-2 border-black/10 dark:border-[#30363d] text-[10px] font-black uppercase tracking-widest text-[#0d3542] dark:text-[#58a6ff]">STS</th>
                                            <th className="w-32 px-5 py-4 border-l-2 border-black/10 dark:border-[#30363d] text-[10px] font-black uppercase tracking-widest text-[#0d3542] dark:text-[#58a6ff] text-center">SKU</th>
                                            <th className="w-auto px-6 py-4 border-l-2 border-black/10 dark:border-[#30363d] text-[10px] font-black uppercase tracking-widest text-[#0d3542] dark:text-[#58a6ff]">Beverage</th>
                                            <th className="w-40 px-5 py-4 border-l-2 border-black/10 dark:border-[#30363d] text-[10px] font-black uppercase tracking-widest text-[#0d3542] dark:text-[#58a6ff] text-center">Category</th>
                                            <th className="w-32 px-6 py-4 border-l-2 border-black/10 dark:border-[#30363d] text-[10px] font-black uppercase tracking-widest text-[#0d3542] dark:text-[#58a6ff] text-right">Stock</th>
                                            <th className="w-32 px-8 py-4 border-l-2 border-black/10 dark:border-[#30363d] text-[10px] font-black uppercase tracking-widest text-[#0d3542] dark:text-[#58a6ff] text-center">Price</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {filteredDrinks.map((d) => (
                                            <DrinkRow
                                                key={d.id}
                                                drink={d}
                                                isSelected={selectedIds.has(d.id)}
                                                isFocused={focusedId === d.id}
                                                quickEditField={quickEditField}
                                                onToggleSelect={toggleSelect}
                                                onFocus={setFocusedId}
                                                onEdit={(drink) => {
                                                    setEditingDrink(drink);
                                                    setFormData({
                                                        sku: drink.sku || '',
                                                        name: drink.name || '',
                                                        price: drink.price || '',
                                                        stock_qty: drink.stock_qty || '',
                                                        category: drink.category || '',
                                                        is_active: drink.is_active ?? true,
                                                        is_service: drink.is_service || false,
                                                        image_path: drink.image_path || '',
                                                    });
                                                    setIsModalOpen(true);
                                                }}
                                                onDelete={(id) => {
                                                    Swal.fire({
                                                        title: 'Delete this drink?',
                                                        text: 'This action cannot be undone.',
                                                        icon: 'warning',
                                                        showCancelButton: true,
                                                        confirmButtonColor: '#ef4444',
                                                        cancelButtonColor: '#6b7280',
                                                        confirmButtonText: 'Yes, delete it',
                                                        background: document.documentElement.classList.contains('dark') ? '#161b22' : '#fff',
                                                        color: document.documentElement.classList.contains('dark') ? '#c9d1d9' : '#111',
                                                    }).then((result) => {
                                                        if (result.isConfirmed) deleteMutation.mutate(id);
                                                    });
                                                }}
                                                onQuickEdit={setQuickEditField}
                                                onUpdateField={(id, data) => updateMutation.mutate({ id, data })}
                                                performanceMode={performanceMode}
                                            />
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {/* Editing Form Modal */}
            <ModernModal isOpen={isModalOpen} onClose={closeModal} title={editingDrink ? 'Edit Drink' : 'New Drink'} icon={Coffee}>
                <div className="p-6">
                    <form onSubmit={(e) => {
                        e.preventDefault();
                        setIsSaving(true);
                        mutation.mutate(formData);
                    }} className="space-y-6">

                        {/* Image Uploader */}
                        <div className="flex items-center gap-4 p-4 bg-gray-50 dark:bg-[#0d1117] border border-gray-200 dark:border-[#30363d] rounded-lg">
                            <label className={`w-20 h-20 shrink-0 rounded-xl border-2 border-dashed border-black/10 dark:border-[#30363d] flex flex-col items-center justify-center cursor-pointer hover:border-[#0d3542]/50 dark:hover:border-[#58a6ff]/50 hover:bg-black/5 dark:hover:bg-[#161b22] transition-all group overflow-hidden relative ${uploading ? 'pointer-events-none opacity-50' : ''}`}>
                                <input type="file" className="hidden" accept="image/*" onChange={handleImageUpload} />
                                {formData.image_path ? (
                                    <img src={formData.image_path} alt="Preview" className="w-full h-full object-cover" />
                                ) : uploading ? (
                                    <LumaSpin size={20} className="text-[#0d3542] dark:text-[#58a6ff]" />
                                ) : (
                                    <Upload size={20} className="text-gray-400 dark:text-[#8b949e] group-hover:text-[#0d3542] dark:group-hover:text-[#58a6ff] transition-colors mb-1" />
                                )}
                            </label>
                            <div className="flex-1">
                                <h4 className="text-[12px] font-black uppercase tracking-widest text-gray-900 dark:text-white mb-1">Drink Image</h4>
                                <p className="text-[11px] text-gray-500 dark:text-[#8b949e]">Upload a high-quality picture for the POS menu (Optional).</p>
                                {formData.image_path && (
                                    <button type="button" onClick={() => setFormData(f => ({ ...f, image_path: '' }))} className="mt-2 text-[10px] font-bold uppercase tracking-widest text-red-500 hover:text-red-600 transition-colors">Remove Image</button>
                                )}
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-1.5 col-span-2">
                                <label className="block text-[10px] font-semibold text-gray-400 dark:text-[#8b949e] uppercase tracking-wider ml-0.5">Name</label>
                                <input required value={formData.name} onChange={e => setFormData(f => ({ ...f, name: e.target.value }))} className="w-full bg-gray-50 dark:bg-[#0d1117] text-gray-900 dark:text-white px-4 py-2.5 rounded-lg border border-gray-200 dark:border-[#30363d] focus:border-[#0d3542] dark:focus:border-[#58a6ff] outline-none text-sm transition-colors" placeholder="Latte, Mocha..." />
                            </div>
                            <div className="space-y-1.5">
                                <label className="block text-[10px] font-semibold text-gray-400 dark:text-[#8b949e] uppercase tracking-wider ml-0.5">Category</label>
                                <input value={formData.category} onChange={e => setFormData(f => ({ ...f, category: e.target.value }))} className="w-full bg-gray-50 dark:bg-[#0d1117] text-gray-900 dark:text-white px-4 py-2.5 rounded-lg border border-gray-200 dark:border-[#30363d] focus:border-[#0d3542] dark:focus:border-[#58a6ff] outline-none text-sm transition-colors" placeholder="Espresso, Tea..." />
                            </div>
                            <div className="space-y-1.5">
                                <label className="block text-[10px] font-semibold text-gray-400 dark:text-[#8b949e] uppercase tracking-wider ml-0.5">Price</label>
                                <input type="number" step="0.01" required value={formData.price} onChange={e => setFormData(f => ({ ...f, price: e.target.value }))} className="w-full bg-gray-50 dark:bg-[#0d1117] text-gray-900 dark:text-white px-4 py-2.5 rounded-lg border border-gray-200 dark:border-[#30363d] focus:border-[#0d3542] dark:focus:border-[#58a6ff] outline-none text-sm transition-colors" placeholder="0.00" />
                            </div>
                            <div className="space-y-1.5">
                                <label className="block text-[10px] font-semibold text-gray-400 dark:text-[#8b949e] uppercase tracking-wider ml-0.5">Stock</label>
                                <input type="number" disabled={formData.is_service} value={formData.stock_qty} onChange={e => setFormData(f => ({ ...f, stock_qty: e.target.value }))} className="w-full bg-gray-50 dark:bg-[#0d1117] text-gray-900 dark:text-white px-4 py-2.5 rounded-lg border border-gray-200 dark:border-[#30363d] focus:border-[#0d3542] dark:focus:border-[#58a6ff] outline-none text-sm transition-colors disabled:opacity-50" placeholder={formData.is_service ? '∞' : '0'} />
                            </div>
                            <div className="space-y-1.5">
                                <label className="block text-[10px] font-semibold text-gray-400 dark:text-[#8b949e] uppercase tracking-wider ml-0.5">SKU (Optional)</label>
                                <input value={formData.sku} onChange={e => setFormData(f => ({ ...f, sku: e.target.value }))} className="w-full bg-gray-50 dark:bg-[#0d1117] text-gray-900 dark:text-white px-4 py-2.5 rounded-lg border border-gray-200 dark:border-[#30363d] focus:border-[#0d3542] dark:focus:border-[#58a6ff] outline-none text-sm transition-colors" placeholder="Auto-gen if empty" />
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div className="p-4 bg-gray-50 dark:bg-[#0d1117] border border-gray-200 dark:border-[#30363d] rounded-lg">
                                <label className="flex items-center gap-4 cursor-pointer">
                                    <input type="checkbox" checked={formData.is_active} onChange={e => setFormData(f => ({ ...f, is_active: e.target.checked }))} className="w-4 h-4 text-[#0d3542] dark:text-[#58a6ff] bg-white border-gray-300 rounded focus:ring-[#0d3542] dark:focus:ring-[#58a6ff]" />
                                    <div>
                                        <span className="text-sm font-semibold text-gray-900 dark:text-white">Active Product</span>
                                        <p className="text-[10px] text-gray-500">Uncheck to archive</p>
                                    </div>
                                </label>
                            </div>
                            <div className="p-4 bg-gray-50 dark:bg-[#0d1117] border border-gray-200 dark:border-[#30363d] rounded-lg">
                                <label className="flex items-center gap-4 cursor-pointer">
                                    <input type="checkbox" checked={formData.is_service} onChange={e => setFormData(f => ({ ...f, is_service: e.target.checked, stock_qty: e.target.checked ? '' : f.stock_qty }))} className="w-4 h-4 text-[#0d3542] dark:text-[#58a6ff] bg-white border-gray-300 rounded focus:ring-[#0d3542] dark:focus:ring-[#58a6ff]" />
                                    <div>
                                        <span className="text-sm font-semibold text-gray-900 dark:text-white">Service Item / Unlimited</span>
                                        <p className="text-[10px] text-gray-500">Does not track stock</p>
                                    </div>
                                </label>
                            </div>
                        </div>

                        <div className="flex gap-3 pt-4 border-t border-black/10 dark:border-white/10">
                            <button type="button" onClick={closeModal} className="flex-1 py-2.5 rounded-lg text-[12px] font-black uppercase tracking-widest border-2 border-black/10 dark:border-white/10 hover:bg-black/5 dark:hover:bg-white/5 transition-colors">Cancel</button>
                            <button type="submit" disabled={isSaving} className="flex-[2] py-2.5 bg-[#0d3542] dark:bg-[#58a6ff] text-white dark:text-black rounded-lg text-[12px] font-black uppercase tracking-widest hover:opacity-90 transition-opacity disabled:opacity-50 flex items-center justify-center gap-2">
                                {isSaving ? <LumaSpin size={16} /> : <Save size={16} />}
                                {editingDrink ? 'Save Changes' : 'Create Drink'}
                            </button>
                        </div>
                    </form>
                </div>
            </ModernModal>
        </div>
    );
}
