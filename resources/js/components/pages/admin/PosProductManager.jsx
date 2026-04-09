import React, { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import axios from 'axios';
import { motion, AnimatePresence } from 'framer-motion';
import { 
    X, Plus, Edit, Trash2, 
    Hash, DollarSign, Layers, Check, 
    Filter, ChevronDown, Archive, ChevronLeft, Search, Package,
    Download, Upload, Settings, Tag, Smartphone, Scissors,
    Menu, ShoppingBag, ShoppingCart, Command, AlertCircle,
    ArrowUp, ArrowDown, Keyboard, Save, Box
} from 'lucide-react';
import { LumaSpin } from '@/components/ui/luma-spin';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import PaginationAnt from '@/components/ui/pagination-ant';
import BulkActionDialog from './pos/BulkActionDialog';
import ModernModal from '../../common/ModernModal';
import { formatPrice } from '@/helpers/format';
import { useAdmin } from './AdminContext';

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

const IntelligencePanel = ({ product, onClose, onEdit }) => {
    if (!product) return null;

    return (
        <motion.div 
            initial={{ x: 20, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: 20, opacity: 0 }}
            className="w-[400px] shrink-0 border-l-2 border-black/15 dark:border-[#30363d] bg-[#fdfdfc] dark:bg-[#0d1117] flex flex-col overflow-hidden relative z-40"
        >
            <div className="p-8 flex flex-col h-full overflow-y-auto no-scrollbar">
                {/* Panel Header */}
                <div className="flex items-center justify-between mb-10">
                    <div className="flex items-center gap-3">
                        <div className="h-1 w-8 bg-[#0d3542] dark:bg-[#58a6ff] rounded-full" />
                        <span className="text-[10px] font-black uppercase tracking-[0.4em] text-[#0d3542] dark:text-[#58a6ff]">Preview</span>
                    </div>
                    <button onClick={onClose} className="p-2 hover:bg-black/5 dark:hover:bg-white/5 rounded-xl text-gray-400 transition-colors">
                        <X size={18} />
                    </button>
                </div>

                {/* Product Visual Area */}
                <div className="w-full aspect-square rounded-3xl bg-black/[0.03] dark:bg-white/[0.02] border-2 border-dashed border-black/15 dark:border-white/5 flex flex-col items-center justify-center p-10 mb-10 group relative overflow-hidden">
                    <div className="absolute inset-0 bg-gradient-to-br from-[#0d3542]/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                    <Package size={64} className="text-black/5 dark:text-white/5 mb-6 group-hover:scale-110 transition-transform duration-500" />
                    <p className="text-[10px] font-black text-gray-300 dark:text-white/10 uppercase tracking-[0.3em] text-center px-4 leading-relaxed">Product Image Placeholder</p>
                </div>

                {/* Product Info */}
                <div className="space-y-2 mb-10">
                    <div className="flex items-center gap-2 flex-wrap">
                        <span className="px-2 py-0.5 rounded-md bg-black/5 dark:bg-[#161b22] text-[9px] font-black text-gray-400 dark:text-[#8b949e] border border-black/15 dark:border-[#30363d] uppercase tracking-widest">{product.category}</span>
                        <Badge variant={product.stock_qty > 0 ? 'inStock' : 'outOfStock'} className="gap-1.5">
                            <div className={`w-2 h-2 rounded-full ${product.stock_qty > 0 ? 'bg-white' : 'bg-white'}`} />
                            {product.stock_qty > 0 ? 'In Stock' : 'Out of Stock'}
                        </Badge>
                    </div>
                    <h2 className="text-[22px] font-black text-gray-900 dark:text-[#c9d1d9] leading-tight uppercase tracking-tight">{product.name}</h2>
                    <p className="font-mono text-[13px] font-black text-[#0d3542] dark:text-[#58a6ff] tracking-tighter uppercase">{product.sku}</p>
                </div>

                {/* Stats */}
                <div className="grid grid-cols-2 gap-4 mb-10">
                    <div className="bg-black/[0.02] dark:bg-[#161b22] p-5 rounded-2xl border border-black/15 dark:border-[#30363d]">
                        <p className="text-[9px] font-black text-gray-400 dark:text-[#8b949e]/40 uppercase tracking-widest mb-2">Price</p>
                        <p className="text-[20px] font-mono font-black text-gray-900 dark:text-[#c9d1d9]">{formatPrice(product.price)}</p>
                    </div>
                    <div className="bg-black/[0.02] dark:bg-[#161b22] p-5 rounded-2xl border border-black/15 dark:border-[#30363d]">
                        <p className="text-[9px] font-black text-gray-400 dark:text-[#8b949e]/40 uppercase tracking-widest mb-2">Stock</p>
                        <div className="flex items-center gap-1">
                            <p className={`text-[24px] font-mono font-black ${product.stock_qty > 0 ? 'text-emerald-600 dark:text-emerald-400' : 'text-red-500'}`}>{product.stock_qty}</p>
                            <Box size={18} className={`${product.stock_qty > 0 ? 'text-emerald-600 dark:text-emerald-400' : 'text-red-500'} opacity-60`} />
                        </div>
                    </div>
                </div>

                {/* Attributes Grid */}
                {product.attributes && product.attributes.length > 0 && (
                    <div className="space-y-4 mb-10">
                        <p className="text-[10px] font-black text-gray-400 dark:text-[#8b949e]/40 uppercase tracking-[0.2em] flex items-center gap-2">
                             <Layers size={12} /> Product Details
                        </p>
                        <div className="grid grid-cols-1 gap-2">
                            {product.attributes.map((attr, i) => (
                                <div key={i} className="flex items-center justify-between py-3 border-b border-black/15 dark:border-[#30363d] last:border-0">
                                    <span className="text-[11px] font-black text-gray-400 dark:text-[#8b949e] uppercase tracking-widest">{attr.key}</span>
                                    <span className="text-[11px] font-black text-gray-900 dark:text-[#c9d1d9] uppercase tracking-widest">{attr.value}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* Primary Action */}
                <div className="mt-auto">
                    <Button 
                        onClick={() => onEdit(product)}
                        className="w-full h-14 bg-[#0d3542] dark:bg-[#58a6ff] text-white dark:text-black text-[12px] font-black uppercase tracking-[0.3em] rounded-2xl hover:scale-[1.02] active:scale-95 transition-all shadow-none ring-1 ring-inset ring-white/10"
                    >
                        Edit Product
                    </Button>
                </div>
            </div>
        </motion.div>
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
                className={`group cursor-pointer border-b border-black/15 dark:border-[#30363d] ${isSelected ? 'bg-[#0d3542]/5 dark:bg-[#58a6ff]/5' : 'hover:bg-black/[0.01] dark:hover:bg-white/[0.02]'} ${isFocused ? 'bg-black/[0.03] dark:bg-white/[0.04]' : ''} ${performanceMode ? 'transition-none' : 'transition-colors duration-150'}`}
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
                        {(p.attributes || []).map((attr, idx) => {
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
                        })}
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
            {isFocused && (
                <tr className="bg-black/[0.01] dark:bg-white/[0.01] border-b border-black/15 dark:border-[#30363d]">
                    <td colSpan="7" className="p-0">
                        <motion.div 
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: "auto", opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            transition={{ duration: 0.3 }}
                            className="overflow-hidden"
                        >
                            <div className="p-8 flex items-start gap-12">
                                <div className="w-32 h-32 shrink-0 rounded-2xl bg-black/[0.03] dark:bg-white/[0.02] border-2 border-dashed border-black/15 dark:border-white/5 flex flex-col items-center justify-center p-4">
                                    <Package size={32} className="text-black/10 dark:text-white/10 mb-2" />
                                    <p className="text-[8px] font-black text-gray-400 dark:text-white/20 uppercase tracking-[0.2em] text-center leading-tight">Image</p>
                                </div>
                                <div className="flex-1 grid grid-cols-2 gap-8">
                                    <div>
                                        <h4 className="text-[10px] font-black uppercase tracking-[0.3em] text-gray-400 mb-4">Quick Details</h4>
                                        <div className="space-y-2">
                                            <div className="flex justify-between items-center py-2 border-b border-black/5 dark:border-white/5">
                                                <span className="text-[11px] font-black text-gray-500 uppercase tracking-widest">Base SKU</span>
                                                <span className="text-[11px] font-black text-gray-900 dark:text-white uppercase tracking-widest">{p.sku.split('-')[0]}</span>
                                            </div>
                                            <div className="flex justify-between items-center py-2 border-b border-black/5 dark:border-white/5">
                                                <span className="text-[11px] font-black text-gray-500 uppercase tracking-widest">Min Stock</span>
                                                <span className="text-[11px] font-black text-gray-900 dark:text-white uppercase tracking-widest">{p.min_stock || 0}</span>
                                            </div>
                                            <div className="flex justify-between items-center py-2 border-b border-black/5 dark:border-white/5">
                                                <span className="text-[11px] font-black text-gray-500 uppercase tracking-widest">Added</span>
                                                <span className="text-[11px] font-black text-gray-900 dark:text-white uppercase tracking-widest">{new Date(p.created_at).toLocaleDateString()}</span>
                                            </div>
                                        </div>
                                    </div>
                                    <div>
                                        <h4 className="text-[10px] font-black uppercase tracking-[0.3em] text-gray-400 mb-4">Quick Actions</h4>
                                        <div className="flex flex-col gap-2">
                                            <Button onClick={(e) => { e.stopPropagation(); onEdit(p); }} className="w-full bg-[#0d3542] dark:bg-[#58a6ff] text-white dark:text-black text-[10px] font-black uppercase tracking-widest shadow-none rounded-xl">
                                                <Edit size={14} className="mr-2" /> Full Edit
                                            </Button>
                                            <div className="grid grid-cols-2 gap-2">
                                                <Button onClick={(e) => { e.stopPropagation(); setQuickEditField('stock'); }} variant="outline" className="w-full text-[10px] font-black uppercase tracking-widest border-black/15 dark:border-white/10 shadow-none rounded-xl">
                                                    Stock
                                                </Button>
                                                <Button onClick={(e) => { e.stopPropagation(); setQuickEditField('price'); }} variant="outline" className="w-full text-[10px] font-black uppercase tracking-widest border-black/15 dark:border-white/10 shadow-none rounded-xl">
                                                    Price
                                                </Button>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </motion.div>
                    </td>
                </tr>
            )}
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
    const pageSize = 100;

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
            setCurrentPage(1); // Reset page when filters change
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
                    <div className="flex flex-col gap-1.5 mb-8">
                        <h1 className="text-[20px] font-black uppercase tracking-[0.4em] text-gray-900 dark:text-[#c9d1d9] leading-none">Settings</h1>
                        <p className="text-[10px] font-black text-gray-400 dark:text-[#8b949e]/30 uppercase tracking-[0.3em] mt-1">Product Manager</p>
                    </div>
                    
                    <div className="space-y-4">
                        <Button 
                            onClick={handleAddClick}
                            className="w-full bg-[#0d3542] dark:bg-[#58a6ff] text-white dark:text-black hover:opacity-90 text-[12px] font-black uppercase tracking-[0.3em] h-14 shadow-none ring-1 ring-inset ring-white/10 transition-all rounded-2xl"
                        >
                            <Plus size={16} className="mr-3" /> Add Product
                        </Button>
                        <div className="flex gap-3">
                            <Button variant="outline" className="flex-1 h-12 border-2 border-black/15 dark:border-[#30363d] text-[10px] font-black uppercase tracking-widest text-gray-400 dark:text-[#8b949e] hover:bg-black/5 dark:hover:bg-white/5 rounded-2xl transition-all"><Download size={14} className="mr-2" /> Export</Button>
                            <Button variant="outline" className="flex-1 h-12 border-2 border-black/15 dark:border-[#30363d] text-[10px] font-black uppercase tracking-widest text-gray-400 dark:text-[#8b949e] hover:bg-black/5 dark:hover:bg-white/5 rounded-2xl transition-all"><Upload size={14} className="mr-2" /> Import</Button>
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

                             <div className="h-20 shrink-0 border-b border-black/20 dark:border-white/10 flex items-center justify-between px-10 bg-background dark:bg-[#111] transition-colors duration-300">
                                <div className="flex items-center gap-4">
                                    <h2 className="text-xl font-black text-[#0d3542] dark:text-[#58a6ff] tracking-[0.4em] uppercase">Product Manager</h2>
                                    {isFetching && !performanceMode && <motion.div animate={{ opacity: [0.3, 1, 0.3] }} transition={{ repeat: Infinity, duration: 1.5 }} className="w-2 h-2 rounded-full bg-[#0d3542] dark:bg-[#58a6ff]" />}
                                    {isFetching && performanceMode && <div className="w-2 h-2 rounded-full bg-[#0d3542] dark:bg-[#58a6ff]" />}
                                </div>
                            </div>
                             <div className={`flex-1 overflow-auto attire-scrollbar relative min-h-0 bg-background dark:bg-[#0f0f0f] border-t border-black/20 dark:border-white/5`}>
                                        {(isLoading && !productsData) && (
                                            <div className={`absolute inset-0 z-50 flex items-center justify-center bg-white/50 dark:bg-black/50 ${performanceMode ? '' : 'backdrop-blur-[2px]'}`}>
                                                <LumaSpin size="lg" />
                                            </div>
                                        )}
                                        <table className="w-full text-left border-separate border-spacing-0 min-w-200 bg-transparent transition-colors duration-300">
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
                                    
                                    {productsData?.total > pageSize && (
                                        <div className="px-6 py-4 flex items-center justify-between border-t border-black/20 dark:border-white/5 bg-background dark:bg-[#111]">
                                            <div className="text-[10px] font-black text-gray-500 uppercase tracking-widest">
                                                Showing {(currentPage - 1) * pageSize + 1} to {Math.min(currentPage * pageSize, productsData.total)} of {productsData.total} products
                                            </div>
                                            <PaginationAnt
                                                current={currentPage}
                                                total={productsData.total}
                                                pageSize={pageSize}
                                                onChange={(page) => setCurrentPage(page)}
                                                showSizeChanger={false}
                                            />
                                        </div>
                                    )}
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

                            {/* --- Form Tabs --- */}
                            <div className="px-12 h-16 border-b border-black/15 dark:border-white/5 flex items-center gap-12 bg-black/1 dark:bg-white/1">
                                {['General', 'Attributes', !editingProduct && 'Bulk Matrix'].filter(Boolean).map((tab) => {
                                    const id = tab.toLowerCase().replace(' ', '');
                                    const active = activeTab === id;
                                    return (
                                        <button 
                                            key={id} onClick={() => setActiveTab(id)}
                                            className={`h-full px-2 text-[10px] font-black uppercase tracking-[0.3em] transition-all relative ${active ? 'text-[#0d3542] dark:text-[#58a6ff]' : 'text-gray-400 dark:text-white/20 hover:text-[#0d3542] dark:hover:text-[#58a6ff]'}`}
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
                                    {activeTab === 'general' && (
                                        <>
                                            <section className="animate-in fade-in slide-in-from-bottom-4 duration-500">
                                                <div className="flex items-center gap-4 mb-10">
                                                    <div className="h-1 w-10 bg-[#0d3542] dark:bg-[#58a6ff] rounded-full" />
                                                    <h3 className="text-xs font-black uppercase tracking-[0.4em] text-[#0d3542] dark:bg-[#58a6ff]">General Info</h3>
                                                </div>
                                                <div className="grid grid-cols-2 gap-16">
                                                    <div className="space-y-3">
                                                        <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">SKU / Code</label>
                                                        <input value={formData.sku} onChange={e => setFormData({...formData, sku: e.target.value.toUpperCase()})} className="w-full bg-black/5 dark:bg-white/5 p-5 text-[13px] font-mono font-bold tracking-widest outline-none border border-black/15 dark:border-white/10 focus:border-[#0d3542] dark:focus:border-[#58a6ff] ring-inset focus:ring-1 focus:ring-[#0d3542] dark:focus:ring-[#58a6ff] transition-all uppercase text-gray-900 dark:text-white rounded-2xl" placeholder="AUTO-GENERATE" />
                                                    </div>
                                                    <div className="space-y-3">
                                                        <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Name *</label>
                                                        <input required value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} className="w-full bg-black/5 dark:bg-white/5 p-5 text-[13px] font-black outline-none border border-black/15 dark:border-white/10 focus:border-[#0d3542] dark:focus:border-[#58a6ff] ring-inset focus:ring-1 focus:ring-[#0d3542] dark:focus:ring-[#58a6ff] transition-all uppercase text-gray-900 dark:text-white rounded-2xl" />
                                                        
                                                        {/* Name Preview */}
                                                        <div className="mt-4 px-4 py-3 bg-black/3 dark:bg-white/3 rounded-xl border border-dashed border-black/25 dark:border-white/10">
                                                            <div className="text-[10px] font-black text-[#0d3542]/50 dark:text-[#58a6ff]/50 uppercase tracking-widest mb-1">Preview</div>
                                                            <div className="text-[12px] font-mono font-bold text-gray-400 dark:text-white/40 break-all uppercase">
                                                                {formData.name} {(formData.attributes || []).filter(a => a.value).map(a => `-${a.value.toUpperCase()}`).join(' ')}
                                                            </div>
                                                        </div>
                                                    </div>
                                                    <div className="space-y-3">
                                                        <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">PRICE</label>
                                                        <div className="relative">
                                                            <input type="number" value={formData.price} onChange={e => setFormData({...formData, price: e.target.value})} className="w-full bg-black/5 dark:bg-white/5 p-5 pl-14 text-lg font-mono font-bold tracking-tight outline-none border border-black/15 dark:border-white/10 focus:border-[#0d3542] dark:focus:border-[#58a6ff] ring-inset focus:ring-1 focus:ring-[#0d3542] dark:focus:ring-[#58a6ff] transition-all text-gray-900 dark:text-white rounded-2xl" />
                                                            <span className="absolute left-5 top-1/2 -translate-y-1/2 text-[#0d3542] dark:text-[#58a6ff] font-black text-xl">$</span>
                                                        </div>
                                                    </div>
                                                    <div className="space-y-3">
                                                        <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">PRODUCT GROUP</label>
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
                                                                    className="flex-1 bg-white dark:bg-[#161b22] border-2 border-[#0d3542] dark:border-[#58a6ff] focus:border-[#0d3542] dark:focus:border-[#58a6ff] px-4 py-3 text-[13px] font-black uppercase outline-none transition-all text-gray-900 dark:text-white placeholder:text-gray-300 dark:placeholder:text-[#8b949e]/10 rounded-2xl"
                                                                    placeholder="ENTER GROUP NAME..."
                                                                />
                                                                <button
                                                                    onClick={() => {
                                                                        if (newGroupName.trim()) {
                                                                            setFormData({...formData, category: newGroupName.trim()});
                                                                            setIsCreatingGroup(false);
                                                                            setNewGroupName('');
                                                                        }
                                                                    }}
                                                                    className="px-4 py-3 bg-[#0d3542] dark:bg-[#58a6ff] text-white dark:text-black text-[11px] font-black uppercase tracking-widest rounded-2xl hover:opacity-90 transition-all"
                                                                >
                                                                    <Check size={16} />
                                                                </button>
                                                                <button
                                                                    onClick={() => {
                                                                        setIsCreatingGroup(false);
                                                                        setNewGroupName('');
                                                                    }}
                                                                    className="px-4 py-3 bg-black/5 dark:bg-white/5 text-gray-500 hover:bg-red-500/10 hover:text-red-500 text-[11px] font-black uppercase tracking-widest rounded-2xl transition-all"
                                                                >
                                                                    <X size={16} />
                                                                </button>
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
                                                    </div>
                                                </div>
                                            </section>
                                            <section className="animate-in fade-in slide-in-from-bottom-4 duration-500">
                                                <div className="flex items-center gap-4 mb-10">
                                                    <div className="h-1 w-10 bg-[#0d3542] dark:bg-[#58a6ff] rounded-full" />
                                                    <h3 className="text-xs font-black uppercase tracking-[0.4em] text-[#0d3542] dark:text-[#58a6ff]">Stock</h3>
                                                </div>
                                                <div className="grid grid-cols-1 gap-12">
                                                    <div className="space-y-3">
                                                        <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Current Stock</label>
                                                        <input type="number" value={formData.stock_qty} onChange={e => setFormData({...formData, stock_qty: e.target.value})} className="w-full bg-black/5 dark:bg-white/5 p-5 text-[13px] font-mono font-bold outline-none border border-black/15 dark:border-white/10 focus:border-[#0d3542] dark:focus:border-[#58a6ff] ring-inset focus:ring-1 focus:ring-[#0d3542] dark:focus:ring-[#58a6ff] transition-all text-gray-900 dark:text-white rounded-2xl" />
                                                    </div>
                                                </div>
                                            </section>
                                        </>
                                    )}

                                    {activeTab === 'attributes' && (
                                        <section className="animate-in fade-in slide-in-from-bottom-4 duration-500">
                                            <div className="flex items-center justify-between mb-10">
                                                <div className="flex items-center gap-4">
                                                    <div className="h-1 w-10 bg-[#0d3542] dark:bg-[#58a6ff] rounded-full" />
                                                    <h3 className="text-xs font-black uppercase tracking-[0.4em] text-[#0d3542] dark:text-[#58a6ff]">More Details</h3>
                                                </div>
                                                <Button variant="outline" onClick={() => setFormData({...formData, attributes: [...(formData.attributes || []), { key: '', value: '' }]})} className="h-10 px-4 text-[10px] font-black uppercase tracking-widest border-black/25 dark:border-white/10 text-gray-400 hover:text-[#0d3542] dark:hover:text-[#58a6ff] transition-all rounded-xl">
                                                    <Plus size={14} className="mr-2" /> Add Detail
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
                                                            }} className="w-full bg-black/5 dark:bg-white/5 p-5 text-[11px] font-bold uppercase outline-none border border-black/15 dark:border-white/10 focus:border-[#0d3542] dark:focus:border-[#58a6ff] ring-inset focus:ring-1 focus:ring-[#0d3542] dark:focus:ring-[#58a6ff] transition-all text-gray-900 dark:text-white rounded-2xl" placeholder="E.G. FABRIC" />
                                                        </div>
                                                        <div className="flex-2 space-y-3">
                                                            <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">VALUE</label>
                                                            <input value={attr.value} onChange={e => {
                                                                const newAttrs = [...formData.attributes];
                                                                newAttrs[idx].value = e.target.value.toUpperCase();
                                                                setFormData({...formData, attributes: newAttrs});
                                                            }} className="w-full bg-black/5 dark:bg-white/5 p-5 text-[11px] font-bold uppercase outline-none border border-black/15 dark:border-white/10 focus:border-[#0d3542] dark:focus:border-[#58a6ff] ring-inset focus:ring-1 focus:ring-[#0d3542] dark:focus:ring-[#58a6ff] transition-all text-gray-900 dark:text-white rounded-2xl" placeholder="E.G. SCABAL DIAMOND CHIP" />
                                                        </div>
                                                        <button onClick={() => setFormData({...formData, attributes: formData.attributes.filter((_, i) => i !== idx)})} className="h-15 w-15 flex items-center justify-center text-gray-400 hover:text-white transition-all bg-black/5 dark:bg-white/5 rounded-2xl border border-black/15 dark:border-white/5 hover:bg-rose-500 hover:border-rose-500">
                                                            <Trash2 size={18} />
                                                        </button>
                                                    </div>
                                                ))}
                                            </div>
                                        </section>
                                    )}

                                    {activeTab === 'bulkmatrix' && !editingProduct && (
                                        <MatrixGrid />
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

        </div>
    );
};

export default ProductsPage;

