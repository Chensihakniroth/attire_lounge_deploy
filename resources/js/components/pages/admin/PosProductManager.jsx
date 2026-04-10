import React, { useState, useEffect, useMemo, useRef } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import axios from 'axios';
import { motion, AnimatePresence } from 'framer-motion';
import { 
    X, Plus, Edit, Trash2, 
    Hash, DollarSign, Layers, Check, 
    Filter, ChevronDown, Archive, ChevronLeft, ChevronRight, Search, Package,
    Download, Upload, Settings, Tag, Smartphone, Scissors,
    Menu, ShoppingBag, ShoppingCart, Command, AlertCircle,
    ArrowUp, ArrowDown, Keyboard, Save, Box, Eye, FolderPlus
} from 'lucide-react';
import { LumaSpin } from '@/components/ui/luma-spin';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import BulkActionDialog from './pos/BulkActionDialog';
import ModernModal from '../../common/ModernModal';
import { formatPrice } from '@/helpers/format';
import { useAdmin } from './AdminContext';
import MorphingPageDots from '@/components/ui/morphing-page-dots';

/* ─── Cyber-Bespoke Form Components ────────────────────────────────────── */
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

const inputBase = "w-full bg-black/5 dark:bg-[#0d1117] border border-black/5 dark:border-[#30363d] rounded-xl py-3.5 px-4 text-gray-900 dark:text-[#c9d1d9] text-sm focus:border-[#0d3542] dark:focus:border-[#58a6ff] outline-none transition-all placeholder:text-gray-300 dark:placeholder:text-white/10";


const SidebarSection = ({ title, icon: Icon, children }) => (
    <div className="mb-0 border-b-2 border-black/15 dark:border-[#30363d] transition-all last:border-b-0">
        <div className="bg-black/2 dark:bg-[#161b22] px-8 py-5 flex items-center gap-3">
            {Icon && <Icon size={14} className="text-[#0d3542] dark:text-[#58a6ff]" />}
            <h3 className="text-[12px] font-black uppercase tracking-[0.3em] text-gray-900 dark:text-[#c9d1d9] leading-none">
                {title}
            </h3>
        </div>
        <div className="px-8 py-6 bg-[#fdfdfc] dark:bg-[#0d1117]">
            {children}
        </div>
    </div>
);

const BespokeSelect = ({ value, options, onChange, onAction, placeholder = "Select...", className = "", direction = "down" }) => {
    const [isOpen, setIsOpen] = useState(false);
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

    const handleOptionClick = (val, isActionItem) => {
        if (isActionItem && onAction) {
            onAction(val);
        } else {
            onChange(val);
            setIsOpen(false);
        }
    };

    return (
        <div ref={containerRef} className={`relative ${className}`}>
            <button
                type="button"
                onClick={() => setIsOpen(!isOpen)}
                className="w-full bg-black/5 dark:bg-white/5 p-5 text-[13px] font-black outline-none border border-black/15 dark:border-white/10 focus:border-[#0d3542] dark:focus:border-[#58a6ff] ring-inset focus:ring-1 focus:ring-[#0d3542] dark:focus:ring-[#58a6ff] transition-all uppercase text-gray-900 dark:text-white flex items-center justify-between rounded-2xl group"
            >
                <span className={!value ? 'text-gray-400 dark:text-white/10' : ''}>
                    {value || placeholder}
                </span>
                <ChevronDown size={16} className={`text-[#0d3542] dark:text-[#58a6ff] transition-transform duration-300 ${isOpen ? 'rotate-180' : ''}`} />
            </button>
            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ opacity: 0, y: direction === "up" ? 10 : -10, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: direction === "up" ? 10 : -10, scale: 0.95 }}
                        transition={{ duration: 0.2, ease: "easeOut" }}
                        className={`absolute z-100 w-full mt-2 bg-white dark:bg-[#161b22] border-2 border-black/15 dark:border-[#30363d] shadow-2xl rounded-2xl overflow-hidden py-2 ${direction === "up" ? "bottom-full mb-2" : ""}`}
                    >
                        <div className="max-h-75 overflow-y-auto attire-scrollbar">
                            {options.map((option, i) => {
                                const isString = typeof option === 'string';
                                const label = isString ? option : option.label;
                                const val = isString ? option : option.value;
                                const isAction = !isString && option.isAction;

                                return (
                                    <button
                                        key={i}
                                        type="button"
                                        onClick={() => handleOptionClick(val, isAction)}
                                        className={`w-full px-5 py-4 text-left text-[11px] font-black uppercase tracking-widest transition-colors flex items-center justify-between group
                                            ${val === value 
                                                ? 'bg-[#0d3542]/5 dark:bg-[#58a6ff]/10 text-[#0d3542] dark:text-[#58a6ff]' 
                                                : isAction 
                                                    ? 'text-[#0d3542] dark:text-[#58a6ff] border-t-2 border-black/15 dark:border-[#30363d] mt-2'
                                                    : 'text-gray-600 dark:text-[#8b949e] hover:bg-black/5 dark:hover:bg-white/5'
                                            }`}
                                    >
                                        <span>{label}</span>
                                        {val === value && <Check size={14} />}
                                        {isAction && <Plus size={14} />}
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

const ProductRow = React.memo(({ 
    product, isSelected, isFocused, quickEditField, 
    onToggleSelect, onFocus, onEdit, onQuickEdit, onUpdateField,
    formatPrice, performanceMode
}) => {
    const p = product;
    return (
        <React.Fragment>
            <tr 
                key={p.id} id={`row-${p.id}`}
                onClick={(e) => { e.stopPropagation(); onFocus(isFocused ? null : p.id); }}
                onDoubleClick={(e) => { e.stopPropagation(); onEdit(p); }}
                className={`group cursor-pointer border-b border-black/15 dark:border-[#30363d] ${isSelected ? 'bg-[#0d3542]/5 dark:bg-[#58a6ff]/5' : 'hover:bg-black/[0.01] dark:hover:bg-white/[0.02]'} ${isFocused ? 'bg-black/[0.03] dark:bg-white/[0.04]' : ''}`}
            >
                <td className="px-4 py-3 text-center relative">
                    {isFocused && <div className="absolute left-0 top-0 bottom-0 w-1 bg-[#0d3542] dark:bg-[#58a6ff]" />}
                    <button 
                        onClick={(e) => { e.stopPropagation(); onToggleSelect(p.id); }}
                        className={`w-5 h-5 rounded-md border-2 flex items-center justify-center transition-all mx-auto ${isSelected ? 'bg-[#0d3542] dark:bg-[#58a6ff] border-[#0d3542] dark:border-[#58a6ff]' : 'border-black/25 dark:border-[#30363d] group-hover:border-[#0d3542]/40 dark:group-hover:border-[#58a6ff]/40'}`}
                    >
                        {isSelected && <Check size={12} className="text-white dark:text-black" />}
                    </button>
                </td>
                <td className="px-4 py-3 text-center border-l-2 border-black/15 dark:border-[#30363d]">
                    <div className="flex items-center justify-center gap-2">
                        <div className={`w-2 h-2 rounded-full ring-2 ${p.stock_qty > 0 ? 'bg-emerald-500 ring-emerald-500/30' : 'bg-red-500 ring-red-500/30'}`} />
                    </div>
                </td>
                <td className="px-5 py-3 font-mono font-black tracking-tighter text-[#0d3542] dark:text-[#58a6ff] uppercase text-[12px] border-l-2 border-black/15 dark:border-[#30363d] text-center">{p.sku}</td>
                <td className="px-6 py-3 border-l-2 border-black/15 dark:border-[#30363d] overflow-hidden">
                    <div className="flex items-center gap-2 leading-tight truncate">
                        <span className="font-black text-gray-900 dark:text-[#c9d1d9] uppercase tracking-wider group-hover:text-[#0d3542] dark:group-hover:text-[#58a6ff] transition-colors text-[14px] truncate">{p.name}</span>
                        {p.attributes && p.attributes.length > 0 ? (
                            p.attributes.map((attr, idx) => {
                                const isSize = attr.key?.toUpperCase() === 'SIZE';
                                return (
                                    <span 
                                        key={idx}
                                        className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-black uppercase tracking-widest ${isSize ? 'bg-red-500/10 text-red-500 border border-red-500/20' : attr.color ? '' : 'bg-black/5 dark:bg-white/5 text-gray-500 dark:text-white/60'}`}
                                        style={attr.color ? { backgroundColor: attr.color + '20', borderColor: attr.color, color: attr.color } : {}}
                                    >
                                        {attr.color && <div className="w-2 h-2 rounded-full" style={{ backgroundColor: attr.color }} />}
                                        {attr.value}
                                    </span>
                                );
                            })
                        ) : p.variant ? (
                            <span className="inline-flex items-center px-2 py-0.5 bg-black/5 dark:bg-white/5 text-gray-400 dark:text-[#8b949e]/40 text-[9px] font-black uppercase tracking-widest rounded border border-black/5 dark:border-white/5">
                                {p.variant}
                            </span>
                        ) : null}
                    </div>
                </td>
                <td className="px-5 py-3 border-l-2 border-black/15 dark:border-[#30363d] text-center">
                    <span className="px-2 py-0.5 bg-black/5 dark:bg-[#161b22] text-[9px] font-black text-gray-400 dark:text-[#8b949e] rounded-md uppercase tracking-[0.2em] border border-black/15 dark:border-[#30363d]">{p.category}</span>
                </td>
                <td className={`px-6 py-3 text-right font-mono font-black relative text-[20px] border-l-2 border-black/15 dark:border-[#30363d] ${p.stock_qty <= (p.min_stock || 5) ? 'text-red-500' : 'text-emerald-600 dark:text-emerald-400'}`}>
                    {isFocused && quickEditField === 'stock' ? (
                        <QuickEditCell value={p.stock_qty} onSave={(val) => onUpdateField(p.id, { stock_qty: val })} onClose={() => onQuickEdit(null)} />
                    ) : (
                        <div className="flex items-center justify-end gap-1">
                            <span className="drop-shadow-sm">{p.stock_qty}</span>
                            <Box size={14} className="opacity-60" />
                        </div>
                    )}
                </td>
                <td className="px-8 py-3 text-center font-mono font-black text-gray-900 dark:text-[#c9d1d9] text-[16px] relative border-l-2 border-black/15 dark:border-[#30363d]">
                    {isFocused && quickEditField === 'price' ? (
                        <QuickEditCell value={p.price} prefix="$" onSave={(val) => onUpdateField(p.id, { price: val })} onClose={() => onQuickEdit(null)} />
                    ) : formatPrice(p.price)}
                </td>
            </tr>
        </React.Fragment>
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
    const [currentPage, setCurrentPage] = useState(1);
    const [currentGroupPage, setCurrentGroupPage] = useState(1);
    const pageSize = 500;
    const itemsPerGroupPage = 20;

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
    const [isCreatingGroup, setIsCreatingGroup] = useState(false);
    const [newGroupName, setNewGroupName] = useState('');

    // --- Bulk Matrix State ---
    const [matrixConfig, setMatrixConfig] = useState({
        primaryKey: 'COLOR',
        primaryValues: '',
        secondaryKey: 'SIZE',
        secondaryValues: ''
    });
    const [matrixData, setMatrixData] = useState({}); // { "COLOR_VAL-SIZE_VAL": qty }

    // --- Debounced Filters for API ---
    const [debouncedFilters, setDebouncedFilters] = useState(filters);
    useEffect(() => {
        const timer = setTimeout(() => {
            setDebouncedFilters(filters);
            setCurrentPage(1);
            setCurrentGroupPage(1);
        }, 300);
        return () => clearTimeout(timer);
    }, [filters]);

    const searchRef = useRef(null);

    // --- Data Fetching ---
    const { data: productsData, isLoading, isFetching, isError, error } = useQuery({
        queryKey: ['admin-pos-products', debouncedFilters.nameBarcode, debouncedFilters.code, debouncedFilters.attribute, debouncedFilters.group, currentPage],
        keepPreviousData: true,
        retry: 1,
        queryFn: async () => {
            const { data } = await axios.get('/api/v1/admin/pos/products', {
                params: { 
                    type: 'all',
                    search: debouncedFilters.nameBarcode || debouncedFilters.code || debouncedFilters.attribute, 
                    category: debouncedFilters.group !== 'ALL GROUPS' ? debouncedFilters.group : '',
                    page: currentPage,
                    per_page: pageSize 
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

    const groupedProducts = useMemo(() => {
        const groups = {};
        products.forEach(p => {
            const baseName = (p.name || '').trim().toUpperCase();
            if (!groups[baseName]) {
                groups[baseName] = {
                    name: baseName,
                    items: []
                };
            }
            groups[baseName].items.push(p);
        });
        
        Object.values(groups).forEach(group => {
            group.items.sort((a, b) => {
                const aAttrs = a.attributes || [];
                const bAttrs = b.attributes || [];
                
                const aColor = aAttrs.find(attr => attr.key?.toUpperCase() === 'COLOR')?.value?.toUpperCase() || '';
                const bColor = bAttrs.find(attr => attr.key?.toUpperCase() === 'COLOR')?.value?.toUpperCase() || '';
                
                if (aColor !== bColor) {
                    return aColor.localeCompare(bColor);
                }
                
                const aSize = aAttrs.find(attr => attr.key?.toUpperCase() === 'SIZE')?.value?.toUpperCase() || '';
                const bSize = bAttrs.find(attr => attr.key?.toUpperCase() === 'SIZE')?.value?.toUpperCase() || '';
                
                const sizeOrder = ['XXS', 'XS', 'S', 'M', 'L', 'XL', 'XXL', 'XXXL'];
                const aIdx = sizeOrder.indexOf(aSize);
                const bIdx = sizeOrder.indexOf(bSize);
                
                if (aIdx !== -1 && bIdx !== -1) return aIdx - bIdx;
                if (aIdx !== -1) return -1;
                if (bIdx !== -1) return 1;
                
                const aNum = parseInt(aSize);
                const bNum = parseInt(bSize);
                if (!isNaN(aNum) && !isNaN(bNum)) return aNum - bNum;
                
                return aSize.localeCompare(bSize);
            });
        });
        
        return Object.values(groups).sort((a, b) => a.name.localeCompare(b.name));
    }, [products]);

    const paginatedGroups = useMemo(() => {
        const start = (currentGroupPage - 1) * itemsPerGroupPage;
        return groupedProducts.slice(start, start + itemsPerGroupPage);
    }, [groupedProducts, currentGroupPage]);

    const totalGroupPages = Math.max(1, Math.ceil(groupedProducts.length / itemsPerGroupPage));

    const groupPageRange = useMemo(() => {
        const range = [];
        const maxVisible = 5;
        let start = Math.max(1, currentGroupPage - Math.floor(maxVisible / 2));
        let end = Math.min(totalGroupPages, start + maxVisible - 1);
        if (end - start + 1 < maxVisible) start = Math.max(1, end - maxVisible + 1);
        for (let i = start; i <= end; i++) range.push(i);
        return range;
    }, [currentGroupPage, totalGroupPages]);

    const categories = useMemo(() => {
        const unique = Array.from(new Set(products.map(p => p.category).filter(Boolean)));
        return ['ALL GROUPS', ...unique.sort()];
    }, [products]);

    const selectedProducts = useMemo(() => 
        products.filter(p => selectedIds.has(p.id)),
    [products, selectedIds]);

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

    const bulkStoreMutation = useMutation({
        mutationFn: (data) => axios.post('/api/v1/admin/pos/products/bulk', data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['admin-pos-products'] });
            setView('list');
            setIsSaving(false);
        },
        onError: (err) => {
            setIsSaving(false);
            alert(err.response?.data?.message || 'Failed to save bulk products. Check for duplicate SKUs.');
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
        if (selectedIds.size === products.length && products.length > 0) {
            setSelectedIds(new Set());
        } else {
            setSelectedIds(new Set(products.map(p => p.id)));
        }
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
        setMatrixConfig({
            primaryKey: 'COLOR',
            primaryValues: '',
            secondaryKey: 'SIZE',
            secondaryValues: ''
        });
        setMatrixData({});
        setView('form');
        setActiveTab('general');
    };

    const fileInputRef = useRef(null);

    const handleExport = async () => {
        try {
            const res = await axios.get('/api/v1/admin/pos/products/export', {
                responseType: 'blob'
            });
            const url = window.URL.createObjectURL(new Blob([res.data]));
            const link = document.createElement('a');
            link.href = url;
            link.setAttribute('download', `pos_products_${new Date().toISOString().split('T')[0]}.csv`);
            document.body.appendChild(link);
            link.click();
            link.remove();
        } catch (err) {
            console.error('Export failed:', err);
            alert('Export failed. Please try again.');
        }
    };

    const handleImport = async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        const formData = new FormData();
        formData.append('file', file);

        try {
            const res = await axios.post('/api/v1/admin/pos/products/import', formData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });
            alert(`Import completed! ${res.data.imported} products processed.`);
            if (res.data.errors && res.data.errors.length > 0) {
                console.warn('Import errors:', res.data.errors);
            }
            queryClient.invalidateQueries(['admin-pos-products']);
        } catch (err) {
            console.error('Import failed:', err);
            alert('Import failed: ' + (err.response?.data?.message || err.message));
        } finally {
            if (fileInputRef.current) fileInputRef.current.value = '';
        }
    };
    const handleAddSimilar = (group) => {
        const firstItem = group.items[0];
        setEditingProduct(null);
        setFormData({
            sku: '',
            name: group.name,
            price: firstItem?.price || '',
            stock_qty: '',
            category: firstItem?.category || '',
            is_service: false,
            barcode: '',
            status: 'available',
            min_stock: firstItem?.min_stock || '0',
            max_stock: firstItem?.max_stock || '99999',
            watch_threshold: firstItem?.watch_threshold || false,
            variant: '',
            attributes: []
        });
        setMatrixConfig({
            primaryKey: 'COLOR',
            primaryValues: '',
            secondaryKey: 'SIZE',
            secondaryValues: ''
        });
        setMatrixData({});
        setView('form');
        setActiveTab('general');
    };

    const handleSubmit = (e) => {
        if (e) e.preventDefault();
        setIsSaving(true);

        if (activeTab === 'bulkmatrix') {
            const pVals = (matrixConfig.primaryValues || '').split(',').map(v => v.trim()).filter(Boolean);
            const sVals = (matrixConfig.secondaryValues || '').split(',').map(v => v.trim()).filter(Boolean);
            
            const products = [];
            pVals.forEach(p => {
                sVals.forEach(s => {
                    const qty = parseInt(matrixData[`${p}-${s}`] || 0);
                    if (qty > 0) {
                        const variant = `-${p.toUpperCase()} -${s.toUpperCase()}`;
                        // Generate SKU: BASE-ATTR1-ATTR2
                        const baseSku = formData.sku || formData.name.substring(0, 5).replace(/\s+/g, '').toUpperCase();
                        const finalSku = `${baseSku}-${p.toUpperCase()}-${s.toUpperCase()}`;
                        
                        products.push({
                            sku: finalSku,
                            name: formData.name,
                            price: formData.price,
                            stock_qty: qty,
                            category: formData.category,
                            is_service: formData.is_service || false,
                            variant: variant,
                        });
                    }
                });
            });

            if (products.length === 0) {
                alert('Please enter quantities in the matrix.');
                setIsSaving(false);
                return;
            }

            bulkStoreMutation.mutate({ products });
            return;
        }

        // --- Name Builder ---
        // Compiles attributes into a standardized string: "-VAL1 -VAL2 ..."
        const attributeString = (formData.attributes || [])
            .filter(attr => attr.value?.trim())
            .map(attr => `-${attr.value.trim().toUpperCase()}`)
            .join(' ');

        const finalData = {
            sku: formData.sku || undefined,
            name: formData.name,
            price: formData.price,
            stock_qty: formData.stock_qty || 0,
            category: formData.category,
            is_service: formData.is_service || false,
            variant: attributeString || undefined,
        };

        mutation.mutate(finalData);
    };

    // (isLoading removed for full-page, moved inside table)

    const MatrixGrid = () => {
        const pVals = (matrixConfig.primaryValues || '').split(',').map(v => v.trim()).filter(Boolean);
        const sVals = (matrixConfig.secondaryValues || '').split(',').map(v => v.trim()).filter(Boolean);

        const updateQty = (p, s, qty) => {
            setMatrixData(prev => ({ ...prev, [`${p}-${s}`]: qty }));
        };

        const totalToCreate = Object.values(matrixData).filter(v => parseInt(v) > 0).length;

        const presets = {
            sizes: 'S, M, L, XL, XXL',
            numbers: '28, 30, 32, 34, 36, 38',
            colors: 'BLACK, WHITE, NAVY, GREY, BEIGE'
        };

        const applyPreset = (key, val) => {
            setMatrixConfig(prev => ({ ...prev, [key]: val }));
        };

        // Handle Arrow Key Navigation in Grid
        const handleGridKeyDown = (e, rIdx, cIdx) => {
            let nextR = rIdx;
            let nextC = cIdx;

            if (e.key === 'ArrowDown') nextR++;
            else if (e.key === 'ArrowUp') nextR--;
            else if (e.key === 'ArrowRight') nextC++;
            else if (e.key === 'ArrowLeft') nextC--;
            else return;

            const nextEl = document.querySelector(`input[data-pos="${nextR}-${nextC}"]`);
            if (nextEl) {
                e.preventDefault();
                nextEl.focus();
                nextEl.select();
            }
        };

        return (
            <div className="space-y-16 animate-in fade-in slide-in-from-bottom-4 duration-500">
                {/* Configuration Area */}
                <div className="grid grid-cols-2 gap-16">
                    {/* Primary Attribute */}
                    <div className="space-y-6">
                        <div className="flex items-center justify-between px-1">
                            <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Primary (e.g. COLOR)</label>
                            <div className="flex gap-2">
                                <button onClick={() => applyPreset('primaryValues', presets.colors)} className="text-[9px] font-black text-[#0d3542] dark:text-[#58a6ff] hover:underline uppercase tracking-tighter">Colors</button>
                            </div>
                        </div>
                        <input 
                            value={matrixConfig.primaryKey} 
                            onChange={e => setMatrixConfig({...matrixConfig, primaryKey: e.target.value.toUpperCase()})} 
                            className="w-full bg-black/5 dark:bg-white/5 p-5 text-[13px] font-black outline-none border border-black/15 dark:border-white/10 focus:border-[#0d3542] dark:focus:border-[#58a6ff] rounded-2xl transition-all" 
                            placeholder="ATTRIBUTE NAME"
                        />
                        <textarea 
                            placeholder="Enter values separated by commas..." 
                            value={matrixConfig.primaryValues} 
                            onChange={e => setMatrixConfig({...matrixConfig, primaryValues: e.target.value})} 
                            className="w-full bg-black/5 dark:bg-white/5 p-5 text-[13px] font-bold outline-none border border-black/15 dark:border-white/10 focus:border-[#0d3542] dark:focus:border-[#58a6ff] rounded-2xl min-h-24 attire-scrollbar uppercase" 
                        />
                    </div>

                    {/* Secondary Attribute */}
                    <div className="space-y-6">
                        <div className="flex items-center justify-between px-1">
                            <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Secondary (e.g. SIZE)</label>
                            <div className="flex gap-2">
                                <button onClick={() => applyPreset('secondaryValues', presets.sizes)} className="text-[9px] font-black text-[#0d3542] dark:text-[#58a6ff] hover:underline uppercase tracking-tighter">Sizes</button>
                                <span className="text-gray-300">|</span>
                                <button onClick={() => applyPreset('secondaryValues', presets.numbers)} className="text-[9px] font-black text-[#0d3542] dark:text-[#58a6ff] hover:underline uppercase tracking-tighter">Numbers</button>
                            </div>
                        </div>
                        <input 
                            value={matrixConfig.secondaryKey} 
                            onChange={e => setMatrixConfig({...matrixConfig, secondaryKey: e.target.value.toUpperCase()})} 
                            className="w-full bg-black/5 dark:bg-white/5 p-5 text-[13px] font-black outline-none border border-black/15 dark:border-white/10 focus:border-[#0d3542] dark:focus:border-[#58a6ff] rounded-2xl transition-all" 
                            placeholder="ATTRIBUTE NAME"
                        />
                        <textarea 
                            placeholder="Enter values separated by commas..." 
                            value={matrixConfig.secondaryValues} 
                            onChange={e => setMatrixConfig({...matrixConfig, secondaryValues: e.target.value})} 
                            className="w-full bg-black/5 dark:bg-white/5 p-5 text-[13px] font-bold outline-none border border-black/15 dark:border-white/10 focus:border-[#0d3542] dark:focus:border-[#58a6ff] rounded-2xl min-h-24 attire-scrollbar uppercase" 
                        />
                    </div>
                </div>

                {/* SKU Template Preview */}
                <div className="p-6 bg-[#0d3542]/5 dark:bg-[#58a6ff]/5 rounded-3xl border border-[#0d3542]/10 dark:border-[#58a6ff]/10">
                    <div className="flex items-center justify-between mb-4">
                        <span className="text-[10px] font-black text-[#0d3542] dark:text-[#58a6ff] uppercase tracking-[0.2em]">SKU Template Preview</span>
                        {totalToCreate > 0 && (
                            <div className="flex items-center gap-2">
                                <Badge variant="outline" className="bg-emerald-500/10 text-emerald-600 border-emerald-500/20 px-3 py-1">
                                    {totalToCreate} Products to Create
                                </Badge>
                            </div>
                        )}
                    </div>
                    <p className="font-mono text-[12px] text-gray-500 dark:text-white/40">
                        {formData.name || 'PRODUCT'} - [VALUE1] - [VALUE2] → <span className="text-[#0d3542] dark:text-[#58a6ff] font-bold">
                            {(formData.sku || (formData.name || 'PROD').substring(0, 5)).toUpperCase()}-{pVals[0] || 'VAL1'}-{sVals[0] || 'VAL2'}
                        </span>
                    </p>
                </div>

                {/* The Matrix Grid */}
                {pVals.length > 0 && sVals.length > 0 ? (
                    <div className="space-y-6 animate-in zoom-in-95 duration-500">
                        <div className="flex items-center gap-4">
                            <div className="h-1 w-10 bg-[#0d3542] dark:bg-[#58a6ff] rounded-full" />
                            <h3 className="text-xs font-black uppercase tracking-[0.4em] text-[#0d3542] dark:text-[#58a6ff]">Stock Grid</h3>
                        </div>
                        
                        <div className="overflow-x-auto border-2 border-black/15 dark:border-white/5 rounded-[2rem] bg-white dark:bg-[#0d1117] shadow-xl">
                            <table className="w-full border-collapse">
                                <thead>
                                    <tr>
                                        <th className="p-6 border-b-2 border-r-2 border-black/15 dark:border-white/10 text-[9px] font-black uppercase tracking-[0.2em] text-gray-400 bg-black/[0.02] dark:bg-white/[0.02] sticky left-0 z-10 min-w-40">
                                            {matrixConfig.primaryKey} \ {matrixConfig.secondaryKey}
                                        </th>
                                        {sVals.map(s => (
                                            <th key={s} className="p-6 border-b-2 border-black/15 dark:border-white/10 text-[11px] font-black uppercase tracking-[0.1em] text-[#0d3542] dark:text-[#58a6ff] min-w-28">
                                                {s}
                                            </th>
                                        ))}
                                    </tr>
                                </thead>
                                <tbody>
                                    {pVals.map((p, rIdx) => (
                                        <tr key={p} className="group">
                                            <td className="p-6 border-r-2 border-black/15 dark:border-white/10 text-[11px] font-black uppercase tracking-wider text-[#0d3542] dark:text-[#58a6ff] bg-black/[0.01] dark:bg-white/[0.01] group-hover:bg-black/[0.03] dark:group-hover:bg-white/[0.03] transition-colors sticky left-0 z-10">
                                                {p}
                                            </td>
                                            {sVals.map((s, cIdx) => (
                                                <td key={s} className="p-2 border-b border-black/15 dark:border-white/5 group-hover:bg-black/[0.01] dark:group-hover:bg-white/[0.01] transition-colors">
                                                    <input 
                                                        type="number" 
                                                        data-pos={`${rIdx}-${cIdx}`}
                                                        value={matrixData[`${p}-${s}`] || ''} 
                                                        onChange={e => updateQty(p, s, e.target.value)}
                                                        onKeyDown={e => handleGridKeyDown(e, rIdx, cIdx)}
                                                        className="w-full bg-black/5 dark:bg-white/5 border-2 border-transparent p-4 text-center font-mono font-black text-lg rounded-xl focus:border-[#0d3542] dark:focus:border-[#58a6ff] focus:bg-white dark:focus:bg-[#161b22] outline-none transition-all placeholder:text-gray-300 dark:placeholder:text-white/5 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                                                        placeholder="0"
                                                    />
                                                </td>
                                            ))}
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                        <div className="flex items-center justify-center gap-6">
                            <div className="flex items-center gap-2">
                                <Keyboard size={14} className="text-gray-400" />
                                <span className="text-[9px] font-bold text-gray-400 uppercase tracking-widest">Use arrow keys to navigate grid</span>
                            </div>
                            <div className="w-1.5 h-1.5 rounded-full bg-gray-200" />
                            <span className="text-[9px] font-bold text-gray-400 uppercase tracking-widest">Only entries with stock will be created</span>
                        </div>
                    </div>
                ) : (
                    <div className="py-20 text-center border-2 border-dashed border-black/15 dark:border-white/5 rounded-[3rem] bg-black/[0.01] dark:bg-white/[0.01]">
                        <Layers size={40} className="mx-auto text-gray-300 mb-4 opacity-20" />
                        <p className="text-[11px] font-black text-gray-400 uppercase tracking-[0.3em]">Enter attributes above to unlock the grid</p>
                    </div>
                )}
            </div>
        );
    };

    return (
        <div className="flex flex-row w-full h-full bg-background dark:bg-[#111111] font-sans selection:bg-[#0d3542]/20 relative text-gray-900 dark:text-white transition-colors duration-300">
            
            {/* --- Persistent Sidebar Filter Hub --- */}
            <div className="w-[340px] shrink-0 flex flex-col p-0 overflow-y-auto no-scrollbar border-r-2 border-black/15 dark:border-[#30363d] bg-[#fdfdfc] dark:bg-[#0d1117] transition-colors sticky top-0 h-screen z-50">
                <div className="p-8 border-b-2 border-black/15 dark:border-[#30363d] bg-[#fdfdfc] dark:bg-[#0d1117]">

                    
                    <div className="space-y-4">
                        <Button 
                            onClick={handleAddClick}
                            className="w-full bg-[#0d3542] dark:bg-[#58a6ff] text-white dark:text-black hover:opacity-90 text-[12px] font-black uppercase tracking-[0.3em] h-14 shadow-none ring-1 ring-inset ring-white/10 transition-all rounded-2xl"
                        >
                            <Plus size={16} className="mr-3" /> Add Product
                        </Button>
                        <div className="flex gap-3">
                            <input 
                                type="file" 
                                ref={fileInputRef} 
                                onChange={handleImport} 
                                accept=".csv" 
                                className="hidden" 
                            />
                            <Button 
                                onClick={handleExport}
                                variant="outline" 
                                className="flex-1 h-12 border-2 border-black/15 dark:border-[#30363d] text-[10px] font-black uppercase tracking-widest text-gray-400 dark:text-[#8b949e] hover:bg-black/5 dark:hover:bg-white/5 rounded-2xl transition-all"
                            >
                                <Download size={14} className="mr-2" /> Export
                            </Button>
                            <Button 
                                onClick={() => fileInputRef.current?.click()}
                                variant="outline" 
                                className="flex-1 h-12 border-2 border-black/15 dark:border-[#30363d] text-[10px] font-black uppercase tracking-widest text-gray-400 dark:text-[#8b949e] hover:bg-black/5 dark:hover:bg-white/5 rounded-2xl transition-all"
                            >
                                <Upload size={14} className="mr-2" /> Import
                            </Button>
                        </div>
                    </div>
                </div>

                <SidebarSection title="Search" icon={Search}>
                    <div className="space-y-6">
                        <div className="space-y-3">
                            <label className="text-[11px] font-black text-gray-400 dark:text-[#8b949e]/40 uppercase tracking-[0.2em] flex items-center gap-3">
                                <Hash size={12} /> Code
                            </label>
                            <input 
                                type="text"
                                value={filters.code}
                                onChange={e => setFilters({...filters, code: e.target.value.toUpperCase()})}
                                className="w-full bg-white dark:bg-[#161b22] border-2 border-black/15 dark:border-[#30363d] focus:border-[#0d3542] dark:focus:border-[#58a6ff] px-5 py-4 text-[13px] font-bold tracking-widest outline-none transition-all uppercase text-gray-900 dark:text-white placeholder:text-gray-300 dark:placeholder:text-[#8b949e]/10 rounded-2xl"
                                placeholder="LEDGER-00..."
                            />
                        </div>
                        <div className="space-y-3">
                            <label className="text-[11px] font-black text-gray-400 dark:text-[#8b949e]/40 uppercase tracking-[0.2em] flex items-center gap-3">
                                <Tag size={12} /> Search Name
                            </label>
                            <input 
                                id="filter-name"
                                type="text"
                                value={filters.nameBarcode}
                                onChange={e => setFilters({...filters, nameBarcode: e.target.value})}
                                className="w-full bg-white dark:bg-[#161b22] border-2 border-black/15 dark:border-[#30363d] focus:border-[#0d3542] dark:focus:border-[#58a6ff] px-5 py-4 text-[13px] font-bold outline-none transition-all uppercase text-gray-900 dark:text-white placeholder:text-gray-300 dark:placeholder:text-[#8b949e]/10 rounded-2xl"
                                placeholder="PRODUCT NAME..."
                            />
                        </div>
                        <div className="space-y-3">
                            <label className="text-[11px] font-black text-gray-400 dark:text-[#8b949e]/40 uppercase tracking-[0.2em] flex items-center gap-3">
                                <Layers size={12} /> Attributes
                            </label>
                            <input 
                                type="text"
                                value={filters.attribute}
                                onChange={e => setFilters({...filters, attribute: e.target.value.toUpperCase()})}
                                className="w-full bg-white dark:bg-[#161b22] border-2 border-black/15 dark:border-[#30363d] focus:border-[#0d3542] dark:focus:border-[#58a6ff] px-5 py-4 text-[13px] font-bold outline-none transition-all uppercase text-gray-900 dark:text-white placeholder:text-gray-300 dark:placeholder:text-[#8b949e]/10 rounded-2xl"
                                placeholder="SIZE / FABRIC..."
                            />
                        </div>
                    </div>
                </SidebarSection>

                <SidebarSection title="Group" icon={Layers}>
                    <BespokeSelect 
                        value={filters.group}
                        options={categories}
                        onChange={val => setFilters({...filters, group: val})}
                        direction="up"
                    />
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

                            <div className="grid grid-cols-3 gap-4 p-6 border-b border-black/20 dark:border-white/5 bg-background dark:bg-[#111] transition-colors duration-300">
                                <div className="flex items-center gap-4 px-4 py-3 rounded-2xl bg-emerald-500/5 border border-emerald-500/10">
                                    <div className="w-10 h-10 rounded-xl bg-emerald-500/10 flex items-center justify-center">
                                        <DollarSign size={20} className="text-emerald-500" />
                                    </div>
                                    <div>
                                        <p className="text-2xl font-mono font-black text-[#0d3542] dark:text-white">{formatPrice(metrics.totalValue)}</p>
                                        <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Stock Value</p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-4 px-4 py-3 rounded-2xl bg-black/5 dark:bg-white/5 border border-black/15 dark:border-white/5">
                                    <div className="w-10 h-10 rounded-xl bg-black/5 dark:bg-white/5 flex items-center justify-center">
                                        <Package size={20} className="text-gray-500 dark:text-white/60" />
                                    </div>
                                    <div>
                                        <p className="text-2xl font-mono font-black text-gray-900 dark:text-white">{metrics.totalSkus}</p>
                                        <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Products</p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-4 px-4 py-3 rounded-2xl bg-rose-500/5 border border-rose-500/10">
                                    <div className="w-10 h-10 rounded-xl bg-rose-500/10 flex items-center justify-center">
                                        <AlertCircle size={20} className="text-rose-500" />
                                    </div>
                                    <div>
                                        <p className="text-2xl font-mono font-black text-rose-500">{metrics.criticalCount}</p>
                                        <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Low Stock</p>
                                    </div>
                                </div>
                            </div>


                             <div className={`flex-1 overflow-auto attire-scrollbar relative min-h-0 bg-background dark:bg-[#0f0f0f] border-t border-black/20 dark:border-white/5`}>
                                        {(isLoading && !productsData) && (
                                            <div className="absolute inset-0 z-50 flex items-center justify-center bg-white/50 dark:bg-black/80">
                                                <LumaSpin size="lg" />
                                            </div>
                                        )}
                                        <table className="w-full text-left border-separate border-spacing-0 min-w-200 bg-transparent">
                                            <thead className="sticky top-0 z-40 bg-[#fdfdfc] dark:bg-[#0d1117]">
                                                <tr className="bg-black/2 dark:bg-[#161b22] text-gray-400 dark:text-[#8b949e]/40 uppercase text-[10px] tracking-[0.3em] font-black transition-colors border-b-2 border-black/15 dark:border-[#30363d]">
                                                    <th className="px-4 py-4 w-14 text-center">
                                                        <button 
                                                            onClick={handleSelectAll}
                                                            className={`w-5 h-5 rounded-md border-2 flex items-center justify-center transition-all mx-auto ${selectedIds.size === products.length && products.length > 0 ? 'bg-[#0d3542] dark:bg-[#58a6ff] border-[#0d3542] dark:border-[#58a6ff]' : 'border-black/25 dark:border-[#30363d]'}`}
                                                        >
                                                            {selectedIds.size === products.length && products.length > 0 && <Check size={12} className="text-white dark:text-black" />}
                                                        </button>
                                                    </th>
                                                    <th className="px-4 py-4 w-28 border-l-2 border-black/15 dark:border-[#30363d] text-center">Status</th>
                                                    <th className="px-5 py-4 w-36 border-l-2 border-black/15 dark:border-[#30363d] text-center">SKU</th>
                                                    <th className="px-6 py-4 border-l-2 border-black/15 dark:border-[#30363d]">Product Name</th>
                                                    <th className="px-5 py-4 w-32 border-l-2 border-black/15 dark:border-[#30363d]">Category</th>
                                                    <th className="px-6 py-4 w-28 border-l-2 border-black/15 dark:border-[#30363d] text-right">In Stock</th>
                                                    <th className="px-8 py-4 w-36 border-l-2 border-black/15 dark:border-[#30363d] text-center">Price</th>
                                                </tr>
                                            </thead>
                                            <tbody className="divide-y-2 divide-black/5 dark:divide-[#30363d]/30">
                                                {isError ? (
                                                    <tr><td colSpan="7" className="py-32 text-center px-8">
                                                        <div className="text-rose-500 font-black uppercase tracking-widest mb-2">Error Loading Products</div>
                                                        <div className="text-gray-400 text-xs font-mono">{error?.message || 'Please login to access admin features'}</div>
                                                    </td></tr>
                                                ) : products.length === 0 ? (
                                                    <tr><td colSpan="7" className="py-32 text-center opacity-30 italic uppercase tracking-[0.4em] font-black text-gray-400 dark:text-[#8b949e] transition-colors">No products found</td></tr>
                                                ) : (
                                                    <React.Fragment>
                                                        {paginatedGroups.map((group) => (
                                                            <React.Fragment key={group.name}>
                                                                <tr className="bg-[#0d3542]/5 dark:bg-[#58a6ff]/5 border-b-2 border-[#0d3542]/20 dark:border-[#58a6ff]/20">
                                                                    <td colSpan="7" className="px-6 py-4">
                                                                        <div className="flex items-center justify-between gap-3">
                                                                            <div className="flex items-center gap-3">
                                                                                <button
                                                                                    onClick={() => {
                                                                                        const newSet = new Set(selectedIds);
                                                                                        const isGroupSelected = group.items.every(p => newSet.has(p.id));
                                                                                        group.items.forEach(p => {
                                                                                            if (isGroupSelected) newSet.delete(p.id);
                                                                                            else newSet.add(p.id);
                                                                                        });
                                                                                        setSelectedIds(newSet);
                                                                                    }}
                                                                                    className={`w-5 h-5 rounded-md border-2 flex items-center justify-center transition-all ${group.items.every(p => selectedIds.has(p.id)) ? 'bg-[#0d3542] dark:bg-[#58a6ff] border-[#0d3542] dark:border-[#58a6ff]' : 'border-black/25 dark:border-[#30363d]'}`}
                                                                                >
                                                                                    {group.items.every(p => selectedIds.has(p.id)) && <Check size={12} className="text-white dark:text-black" />}
                                                                                </button>
                                                                                <div className="h-1 w-8 bg-[#0d3542] dark:bg-[#58a6ff] rounded-full" />
                                                                                <span className="text-[12px] font-black uppercase tracking-[0.3em] text-[#0d3542] dark:text-[#58a6ff]">{group.name}</span>
                                                                                <span className="px-2 py-0.5 bg-black/10 dark:bg-white/10 text-[9px] font-black text-gray-500 dark:text-white/40 uppercase tracking-widest rounded">{group.items.length} variants</span>
                                                                            </div>
                                                                            <button 
                                                                                onClick={() => handleAddSimilar(group)}
                                                                                className="flex items-center gap-2 px-3 py-1.5 bg-[#0d3542] dark:bg-[#58a6ff] text-white dark:text-black text-[9px] font-black uppercase tracking-widest rounded-lg hover:opacity-90 transition-all"
                                                                            >
                                                                                <Plus size={12} /> Add Similar
                                                                            </button>
                                                                        </div>
                                                                    </td>
                                                                </tr>
                                                                {group.items.map((p) => (
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
                                                                ))}
                                                            </React.Fragment>
                                                        ))}
                                                        {totalGroupPages > 1 && (
                                                            <tr>
                                                                <td colSpan="7" className="py-6 px-6 relative border-t-2 border-black/5 dark:border-[#30363d]">
                                                                    <div className="flex items-center justify-between">
                                                                        <p className="text-[10px] font-bold uppercase tracking-widest text-gray-400 dark:text-[#8b949e]/50 tabular-nums">
                                                                            {((currentGroupPage - 1) * itemsPerGroupPage) + 1}–{Math.min(currentGroupPage * itemsPerGroupPage, groupedProducts.length)} of {groupedProducts.length}
                                                                        </p>
                                                                        <div className="flex items-center gap-1">
                                                                            <button
                                                                                onClick={() => setCurrentGroupPage(p => Math.max(1, p - 1))}
                                                                                disabled={currentGroupPage === 1}
                                                                                className="p-2 rounded-lg text-gray-400 dark:text-[#8b949e] hover:bg-black/5 dark:hover:bg-[#1c2128] hover:text-gray-900 dark:hover:text-white disabled:opacity-30 disabled:pointer-events-none transition-all"
                                                                            >
                                                                                <ChevronLeft size={16} />
                                                                            </button>
                                                                            {groupPageRange[0] > 1 && (
                                                                                <>
                                                                                    <button onClick={() => setCurrentGroupPage(1)} className="w-8 h-8 rounded-lg text-[10px] font-bold text-gray-500 dark:text-[#8b949e] hover:bg-black/5 dark:hover:bg-[#1c2128] transition-all">1</button>
                                                                                    {groupPageRange[0] > 2 && <span className="text-[10px] text-gray-300 dark:text-[#8b949e]/30 px-0.5">…</span>}
                                                                                </>
                                                                            )}
                                                                            {groupPageRange.map(p => (
                                                                                <button
                                                                                    key={p}
                                                                                    onClick={() => setCurrentGroupPage(p)}
                                                                                    className={`w-8 h-8 rounded-lg text-[10px] font-bold transition-all ${
                                                                                        p === currentGroupPage
                                                                                            ? 'bg-[#0d3542] dark:bg-[#58a6ff] text-white dark:text-black'
                                                                                            : 'text-gray-500 dark:text-[#8b949e] hover:bg-black/5 dark:hover:bg-[#1c2128]'
                                                                                    }`}
                                                                                >
                                                                                    {p}
                                                                                </button>
                                                                            ))}
                                                                            {groupPageRange[groupPageRange.length - 1] < totalGroupPages && (
                                                                                <>
                                                                                    {groupPageRange[groupPageRange.length - 1] < totalGroupPages - 1 && <span className="text-[10px] text-gray-300 dark:text-[#8b949e]/30 px-0.5">…</span>}
                                                                                    <button onClick={() => setCurrentGroupPage(totalGroupPages)} className="w-8 h-8 rounded-lg text-[10px] font-bold text-gray-500 dark:text-[#8b949e] hover:bg-black/5 dark:hover:bg-[#1c2128] transition-all">{totalGroupPages}</button>
                                                                                </>
                                                                            )}
                                                                            <button
                                                                                onClick={() => setCurrentGroupPage(p => Math.min(totalGroupPages, p + 1))}
                                                                                disabled={currentGroupPage === totalGroupPages}
                                                                                className="p-2 rounded-lg text-gray-400 dark:text-[#8b949e] hover:bg-black/5 dark:hover:bg-[#1c2128] hover:text-gray-900 dark:hover:text-white disabled:opacity-30 disabled:pointer-events-none transition-all"
                                                                            >
                                                                                <ChevronRight size={16} />
                                                                            </button>
                                                                        </div>
                                                                    </div>
                                                                </td>
                                                            </tr>
                                                        )}

                                                    </React.Fragment>
                                                )}
                                            </tbody>
                                        </table>
                                    </div>
                        </motion.div>
                    ) : (
                        <motion.div key="form" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="flex-1 flex flex-col overflow-hidden bg-[#fcfcfa] dark:bg-[#0f0f0f]">
                            {/* --- Form Header --- */}
                            <div className="h-24 shrink-0 border-b border-black/15 dark:border-white/5 flex items-center justify-between px-12 bg-white dark:bg-[#111]">
                                <div className="flex items-center gap-6">
                                    <button 
                                        onClick={() => { setView('list'); setEditingProduct(null); }}
                                        className="h-12 w-12 rounded-2xl bg-black/5 dark:bg-white/5 flex items-center justify-center text-gray-500 hover:text-[#0d3542] dark:hover:text-[#58a6ff] transition-all hover:bg-[#0d3542]/10 dark:hover:bg-[#58a6ff]/10"
                                    >
                                        <ChevronLeft size={20} />
                                    </button>
                                    <div>
                                        <h2 className="text-xl font-black text-[#0d3542] dark:text-[#58a6ff] tracking-[0.4em] uppercase">{editingProduct ? 'Edit Product' : 'Add New Product'}</h2>
                                        <p className="text-[10px] font-bold text-gray-400 dark:text-white/30 uppercase tracking-widest mt-1">Product Settings</p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-4">
                                    <Button variant="outline" onClick={() => setView('list')} className="h-12 px-8 text-[11px] font-black uppercase tracking-[0.2em] border-black/25 dark:border-white/10 text-gray-400 rounded-xl hover:bg-black/5 dark:hover:bg-white/5">CANCEL</Button>
                                    <Button onClick={handleSubmit} disabled={isSaving} className="h-12 px-10 bg-[#0d3542] dark:bg-[#58a6ff] text-white dark:text-black text-[11px] font-black uppercase tracking-[0.2em] shadow-lg ring-1 ring-inset ring-white/10 dark:ring-black/10 hover:opacity-90 transition-all rounded-xl">
                                        {isSaving ? <LumaSpin size="sm" className="mr-2" /> : <Save size={14} className="mr-2" />}
                                        CONFIRM & RECORD
                                    </Button>
                                </div>
                            </div>

                            {/* --- 2-Panel Form Layout --- */}
                            <div className="flex-1 flex overflow-hidden bg-[#fdfdfc] dark:bg-[#0d1117]">
                                {/* Main Content Area (Left) */}
                                <div className="flex-[2.5] overflow-y-auto p-8 attire-scrollbar space-y-6">
                                    <div className="grid xl:grid-cols-2 gap-6">
                                        <Section title="General Information" icon={Package}>
                                            <div className="space-y-4">
                                                <Field label="SKU Code" hint="AUTO-GENERATE IF LEFT EMPTY">
                                                    <input value={formData.sku} onChange={e => setFormData({...formData, sku: e.target.value.toUpperCase()})} className={`${inputBase} uppercase font-mono tracking-widest`} placeholder="AUTO-GENERATE" />
                                                </Field>
                                                <Field label="Product Name" hint="* Required">
                                                    <input required value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} className={`${inputBase} uppercase font-black`} placeholder="ENTER PRODUCT NAME..." />
                                                </Field>
                                                <Field label="Product Price" hint="Base product price">
                                                    <div className="relative">
                                                        <input type="number" value={formData.price} onChange={e => setFormData({...formData, price: e.target.value})} className={`${inputBase} pl-10 text-lg font-mono tracking-tight`} />
                                                        <span className="absolute left-4 top-1/2 -translate-y-1/2 text-[#0d3542] dark:text-[#58a6ff] font-black text-lg">$</span>
                                                    </div>
                                                </Field>
                                            </div>
                                        </Section>
                                        
                                        <Section title="Name Preview" icon={Eye}>
                                            <div className="p-6 bg-black/3 dark:bg-white/3 rounded-xl border border-dashed border-black/25 dark:border-white/10 h-full min-h-32 flex flex-col justify-center text-center space-y-2">
                                                <div className="text-[10px] font-black text-[#0d3542]/50 dark:text-[#58a6ff]/50 uppercase tracking-widest mb-2">Generated Name</div>
                                                <div className="text-xl font-mono font-black text-gray-900 dark:text-white uppercase leading-snug">
                                                    {formData.name || 'PRODUCT NAME'} 
                                                    <br/>
                                                    <span className="text-[#0d3542] dark:text-[#58a6ff] text-base mt-1">{(formData.attributes || []).filter(a => a.value).map(a => `-${a.value.toUpperCase()}`).join(' ')}</span>
                                                </div>
                                            </div>
                                        </Section>
                                    </div>

                                    <Section title="Variants & Details" icon={Layers}>
                                        <div className="space-y-4">
                                            {(formData.attributes || []).map((attr, idx) => (
                                                <div key={idx} className="flex gap-4 items-end animate-in fade-in slide-in-from-left-2 transition-all">
                                                    <div className="flex-1">
                                                        <Field label="Variant Type">
                                                            <input value={attr.key} onChange={e => {
                                                                const newAttrs = [...formData.attributes];
                                                                newAttrs[idx].key = e.target.value.toUpperCase();
                                                                setFormData({...formData, attributes: newAttrs});
                                                            }} className={`${inputBase} font-bold uppercase text-xs`} placeholder="E.G. FABRIC" />
                                                        </Field>
                                                    </div>
                                                    <div className="flex-2">
                                                        <Field label="Variant Option">
                                                            <input value={attr.value} onChange={e => {
                                                                const newAttrs = [...formData.attributes];
                                                                newAttrs[idx].value = e.target.value.toUpperCase();
                                                                setFormData({...formData, attributes: newAttrs});
                                                            }} className={`${inputBase} font-bold uppercase text-xs`} placeholder="E.G. SCABAL DIAMOND CHIP" />
                                                        </Field>
                                                    </div>
                                                    <button onClick={() => setFormData({...formData, attributes: formData.attributes.filter((_, i) => i !== idx)})} className="h-[48px] w-[48px] flex items-center justify-center text-gray-400 hover:text-white transition-all bg-black/5 dark:bg-white/5 rounded-xl border border-black/15 dark:border-white/5 hover:bg-rose-500 hover:border-rose-500 shrink-0">
                                                        <Trash2 size={16} />
                                                    </button>
                                                </div>
                                            ))}
                                            <button 
                                                onClick={() => setFormData({...formData, attributes: [...(formData.attributes || []), { key: '', value: '' }]})}
                                                className="w-full flex items-center justify-center gap-2 bg-black/5 dark:bg-white/5 hover:bg-black/10 dark:hover:bg-white/10 text-gray-500 hover:text-gray-900 dark:hover:text-white py-4 rounded-xl text-xs font-black uppercase tracking-widest transition-all border border-dashed border-black/20 dark:border-white/10"
                                            >
                                                <Plus size={14} /> Add Detail
                                            </button>
                                        </div>
                                    </Section>

                                    {!editingProduct && (
                                        <div className="pt-2">
                                            <MatrixGrid />
                                        </div>
                                    )}
                                </div>

                                {/* Sidebar Config Area (Right) */}
                                <div className="w-[340px] shrink-0 border-l border-black/5 dark:border-[#30363d]/50 bg-white/30 dark:bg-[#161b22]/30 overflow-y-auto attire-scrollbar p-6 space-y-6">
                                    <Section title="Organization" icon={FolderPlus}>
                                        <div className="space-y-4">
                                            <Field label="Product Group">
                                                {isCreatingGroup ? (
                                                    <div className="flex gap-2">
                                                        <input
                                                            type="text"
                                                            value={newGroupName}
                                                            onChange={e => setNewGroupName(e.target.value.toUpperCase())}
                                                            onKeyDown={e => {
                                                                if (e.key === 'Enter' && newGroupName.trim()) {
                                                                    setFormData({...formData, category: newGroupName.trim()});
                                                                    setIsCreatingGroup(false);
                                                                    setNewGroupName('');
                                                                }
                                                                if (e.key === 'Escape') {
                                                                    setIsCreatingGroup(false);
                                                                    setNewGroupName('');
                                                                }
                                                            }}
                                                            autoFocus
                                                            className="flex-1 min-w-0 bg-white dark:bg-[#0d1117] border border-black/5 dark:border-[#30363d] focus:border-[#0d3542] dark:focus:border-[#58a6ff] px-4 py-3 text-[13px] font-black uppercase outline-none transition-all text-gray-900 dark:text-white rounded-xl"
                                                            placeholder="ENTER GROUP NAME..."
                                                        />
                                                        <button onClick={() => { if (newGroupName.trim()) { setFormData({...formData, category: newGroupName.trim()}); setIsCreatingGroup(false); setNewGroupName(''); } }} className="px-3 py-3 bg-[#0d3542] dark:bg-[#58a6ff] text-white dark:text-black rounded-xl hover:opacity-90 transition-all"><Check size={16} /></button>
                                                        <button onClick={() => { setIsCreatingGroup(false); setNewGroupName(''); }} className="px-3 py-3 bg-black/5 dark:bg-white/5 text-gray-500 hover:bg-red-500/10 hover:text-red-500 rounded-xl transition-all"><X size={16} /></button>
                                                    </div>
                                                ) : (
                                                    <BespokeSelect 
                                                        value={formData.category}
                                                        options={[
                                                            ...categories.filter(c => c !== 'ALL GROUPS'),
                                                            { label: '+ Create New Group', value: 'NEW_GROUP', isAction: true }
                                                        ]}
                                                        onChange={val => setFormData({...formData, category: val})}
                                                        onAction={() => setIsCreatingGroup(true)}
                                                        placeholder="SELECT GROUP"
                                                    />
                                                )}
                                            </Field>
                                        </div>
                                    </Section>

                                    <Section title="Inventory" icon={Archive}>
                                        <Field label="Current Stock" hint="Physical stock count">
                                            <input type="number" value={formData.stock_qty} onChange={e => setFormData({...formData, stock_qty: e.target.value})} className={`${inputBase} font-mono font-bold`} />
                                        </Field>
                                    </Section>
                                </div>
                            </div>

                        </motion.div>
                    )}
                </AnimatePresence>
            </div>

             {/* --- Floating Command Bar --- */}
            <AnimatePresence>
                {selectedIds.size > 0 && view === 'list' && (
                    <motion.div initial={{ y: 100, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: 100, opacity: 0 }} className="fixed bottom-10 left-1/2 ml-30 -translate-x-1/2 z-80">
                        <div className="bg-[#fdfdfc] dark:bg-[#111] rounded-2xl px-8 h-20 flex items-center gap-10 shadow-2xl border border-[#0d3542]/30 dark:border-[#58a6ff]/30 ring-1 ring-inset ring-white/10 dark:ring-black/10 transition-all duration-300">
                            <div className="flex items-center gap-4 pr-10 border-r border-black/25 dark:border-white/10">
                                <div className="bg-[#0d3542] dark:bg-[#58a6ff] text-white dark:text-black text-[11px] font-black h-8 w-8 rounded-lg flex items-center justify-center shadow-lg ring-1 ring-white/20">{selectedIds.size}</div>
                                <span className="text-[#0d3542] dark:text-[#58a6ff] text-[11px] font-black uppercase tracking-[0.3em] whitespace-nowrap">Selected Items</span>
                            </div>
                            <div className="flex items-center gap-10">
                                <button onClick={() => setIsBulkDialogOpen(true)} className="flex items-center gap-2 text-gray-500 dark:text-white/40 hover:text-[#0d3542] dark:hover:text-[#58a6ff] transition-colors group">
                                    <Command size={14} className="group-hover:scale-110 transition-transform" />
                                    <span className="text-[10px] font-black uppercase tracking-[0.2em]">Bulk Edit</span>
                                </button>
                                <button onClick={() => setSelectedIds(new Set())} className="text-gray-400 dark:text-white/20 hover:text-[#0d3542] dark:hover:text-[#58a6ff] text-[10px] font-black uppercase tracking-[0.2em]">Clear All</button>
                            </div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            <BulkActionDialog 
                isOpen={isBulkDialogOpen}
                onClose={() => setIsBulkDialogOpen(false)}
                selectedCount={selectedIds.size}
                products={selectedProducts}
                onApply={handleBulkApply}
            />

        </div>
    );
};

export default ProductsPage;

