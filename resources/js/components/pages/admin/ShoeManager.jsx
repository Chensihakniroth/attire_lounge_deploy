import React, {
    useState,
    useMemo,
    useCallback,
    useEffect,
    useRef,
} from 'react';
import {
    useQuery,
    useMutation,
    useQueryClient,
    keepPreviousData,
} from '@tanstack/react-query';
import axios from 'axios';
import { motion, AnimatePresence } from 'framer-motion';
import {
    X,
    Plus,
    Edit,
    Trash2,
    Hash,
    DollarSign,
    Layers,
    Check,
    CheckCircle,
    ChevronDown,
    Archive,
    ChevronLeft,
    ChevronRight,
    Search,
    Package,
    Download,
    Upload,
    Tag,
    Command,
    AlertCircle,
    ArrowUp,
    ArrowDown,
    Keyboard,
    Save,
    Box,
    Eye,
    FolderPlus,
    Footprints,
    GlassWater,
    Droplets,
    Flame,
    IceCream2,
    Wine,
    Beer,
    RefreshCw,
    AlertTriangle,
    Cookie,
    Milk,
    Star,
    Award,
    Zap,
    Filter,
    BarChart3,
    TrendingUp,
    Info,
    MoreVertical,
    Loader2,
    Rows,
    ClipboardList,
} from 'lucide-react';
import { LumaSpin } from '@/components/ui/luma-spin';
import { Button } from '@/components/ui/button';
import { formatPrice } from '@/helpers/format';
import { useAdmin } from './AdminContext';
import { Section, Field, inputBase, SidebarSection } from './common/FormPrimitives';
import Swal from 'sweetalert2';
import ModernModal from '../../common/ModernModal';

/* ─── Category Icons Map ──────────────────────────────────── */
const CATEGORY_ICONS = {
    Espresso: Flame,
    Cold: IceCream2,
    Tea: GlassWater,
    Blend: Droplets,
    Coffee: Footprints,
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
const getCatIcon = (cat) => CATEGORY_ICONS[cat] || Footprints;

/* ─── Category Color Map ──────────────────────────────────── */
const CATEGORY_COLORS = {
    Loafers: {
        bg: 'bg-amber-500/10',
        border: 'border-amber-500/20',
        text: 'text-amber-600 dark:text-amber-400',
        fill: 'fill-amber-500',
    },
    Slippers: {
        bg: 'bg-green-500/10',
        border: 'border-green-500/20',
        text: 'text-green-600 dark:text-green-400',
        fill: 'fill-green-500',
    },
    Formal: {
        bg: 'bg-purple-500/10',
        border: 'border-purple-500/20',
        text: 'text-purple-600 dark:text-purple-400',
        fill: 'fill-purple-500',
    },
    Boots: {
        bg: 'bg-orange-500/10',
        border: 'border-orange-500/20',
        text: 'text-orange-600 dark:text-orange-400',
        fill: 'fill-orange-500',
    },
    Sneakers: {
        bg: 'bg-cyan-500/10',
        border: 'border-cyan-500/20',
        text: 'text-cyan-600 dark:text-cyan-400',
        fill: 'fill-cyan-500',
    },
    Accessories: {
        bg: 'bg-rose-500/10',
        border: 'border-rose-500/20',
        text: 'text-rose-600 dark:text-rose-400',
        fill: 'fill-rose-500',
    },
    'Shoe Care': {
        bg: 'bg-blue-500/10',
        border: 'border-blue-500/20',
        text: 'text-blue-600 dark:text-blue-400',
        fill: 'fill-blue-500',
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

const BespokeSelect = ({
    value,
    options,
    onChange,
    onAction,
    placeholder = 'Select...',
    className = '',
    direction = 'down',
}) => {
    const [isOpen, setIsOpen] = useState(false);
    const [calculatedDirection, setCalculatedDirection] = useState(direction);
    const containerRef = useRef(null);

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (
                containerRef.current &&
                !containerRef.current.contains(event.target)
            ) {
                setIsOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () =>
            document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    useEffect(() => {
        if (isOpen && containerRef.current) {
            const rect = containerRef.current.getBoundingClientRect();
            const spaceBelow = window.innerHeight - rect.bottom;
            if (spaceBelow < 300) setCalculatedDirection('up');
            else setCalculatedDirection('down');
        }
    }, [isOpen]);

    return (
        <div ref={containerRef} className={`relative ${className}`}>
            <button
                type="button"
                onClick={() => setIsOpen(!isOpen)}
                className="w-full bg-black/5 dark:bg-white/5 p-4 text-[11px] font-black outline-none border border-black/15 dark:border-white/10 focus:border-[#0d3542] dark:focus:border-[#58a6ff] transition-all uppercase text-gray-900 dark:text-white flex items-center justify-between rounded-xl group"
            >
                <span
                    className={
                        !value
                            ? 'text-gray-400 dark:text-white/10 truncate'
                            : 'truncate'
                    }
                >
                    {value || placeholder}
                </span>
                <ChevronDown
                    size={14}
                    className={`text-[#0d3542] dark:text-[#58a6ff] shrink-0 transition-transform duration-300 ${isOpen ? 'rotate-180' : ''}`}
                />
            </button>
            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{
                            opacity: 0,
                            y: calculatedDirection === 'up' ? 10 : -10,
                            scale: 0.95,
                        }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{
                            opacity: 0,
                            y: calculatedDirection === 'up' ? 10 : -10,
                            scale: 0.95,
                        }}
                        transition={{ duration: 0.2, ease: 'easeOut' }}
                        className={`absolute z-100 min-w-full w-max max-w-[300px] mt-2 bg-white dark:bg-[#161b22] border-2 border-black/15 dark:border-[#30363d] shadow-2xl rounded-2xl overflow-hidden py-2 ${calculatedDirection === 'up' ? 'bottom-full mb-2' : ''}`}
                    >
                        <div className="max-h-75 overflow-y-auto attire-scrollbar">
                            {options.map((option, i) => {
                                if (!option) return null;
                                const isString = typeof option === 'string';
                                const label = isString ? option : option.label;
                                const val = isString ? option : option.value;
                                const isAction = !isString && option.isAction;

                                return (
                                    <button
                                        key={i}
                                        type="button"
                                        onClick={() => {
                                            if (isAction && onAction) {
                                                onAction(val);
                                            } else {
                                                onChange(val);
                                                setIsOpen(false);
                                            }
                                        }}
                                        className={`w-full px-5 py-4 text-left text-[11px] font-black uppercase tracking-widest transition-colors flex items-center justify-between group
                                            ${
                                                val === value
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

const FilterDropdown = ({
    label,
    icon: Icon,
    value,
    options,
    onChange,
    className = "",
}) => {
    const [isOpen, setIsOpen] = useState(false);
    const containerRef = useRef(null);

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (containerRef.current && !containerRef.current.contains(event.target)) {
                setIsOpen(false);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    const selectedOption = options.find((opt) => opt.value === value);

    return (
        <div ref={containerRef} className={`relative ${className}`}>
            <button
                type="button"
                onClick={() => setIsOpen(!isOpen)}
                className={`flex items-center gap-2 px-4 py-2.5 rounded-xl border transition-all text-[11px] font-black uppercase tracking-widest whitespace-nowrap
                    ${isOpen
                        ? "bg-[#0d3542] dark:bg-[#58a6ff] text-white dark:text-black border-transparent shadow-lg scale-[1.02]"
                        : "bg-black/[0.02] dark:bg-[#0d1117] border-black/5 dark:border-[#30363d] text-gray-500 dark:text-[#8b949e] hover:border-[#0d3542]/30 dark:hover:border-[#58a6ff]/30 hover:text-[#0d3542] dark:hover:text-[#58a6ff]"
                    }`}
            >
                <Icon size={14} className={isOpen ? "text-white dark:text-black" : "text-gray-400"} />
                <span>{selectedOption ? selectedOption.label : label}</span>
                <ChevronDown
                    size={14}
                    className={`transition-transform duration-300 ${isOpen ? "rotate-180" : "opacity-40"}`}
                />
            </button>

            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ opacity: 0, y: -10, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: -10, scale: 0.95 }}
                        transition={{ duration: 0.15, ease: "easeOut" }}
                        className="absolute right-0 md:left-0 z-[100] mt-2 min-w-[200px] bg-white dark:bg-[#161b22] border-2 border-black/15 dark:border-[#30363d] shadow-2xl rounded-2xl overflow-hidden py-2"
                    >
                        <div className="max-h-80 overflow-y-auto attire-scrollbar">
                            {options.map((option, i) => (
                                <button
                                    key={i}
                                    type="button"
                                    onClick={() => {
                                        onChange(option.value);
                                        setIsOpen(false);
                                    }}
                                    className={`w-full px-5 py-3.5 text-left text-[10px] font-black uppercase tracking-widest transition-all flex items-center justify-between group
                                        ${option.value === value
                                            ? "bg-[#0d3542]/5 dark:bg-[#58a6ff]/10 text-[#0d3542] dark:text-[#58a6ff]"
                                            : "text-gray-600 dark:text-[#8b949e] hover:bg-black/5 dark:hover:bg-white/5 hover:text-gray-900 dark:hover:text-white"
                                        }`}
                                >
                                    <span>{option.label}</span>
                                    {option.value === value && <Check size={14} />}
                                </button>
                            ))}
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
            {prefix && (
                <span className="text-[14px] font-black text-[#0d3542] dark:text-[#58a6ff] mr-2">
                    {prefix}
                </span>
            )}
            <input
                ref={inputRef}
                value={val}
                onChange={(e) => setVal(e.target.value)}
                onKeyDown={handleKeyDown}
                onBlur={onClose}
                className="flex-1 bg-transparent border-none outline-none text-[15.5px] font-black text-gray-900 dark:text-white"
            />
            <div className="flex items-center gap-1 ml-2">
                <div className="px-2 py-1 bg-black/5 dark:bg-white/5 border border-black/25 dark:border-white/10 rounded text-[10px] font-black uppercase text-[#0d3542] dark:text-[#58a6ff]">
                    Enter: Save
                </div>
            </div>
        </div>
    );
};

const ShoeRow = React.memo(
    ({
        shoe,
        isSelected,
        isFocused,
        quickEditField,
        onToggleSelect,
        onFocus,
        onEdit,
        onQuickEdit,
        onUpdateField,
        performanceMode,
    }) => {
        const d = shoe;
        const CatIcon = getCatIcon(d.category);
        const colorScheme = getCategoryColor(d.category);
        const isOut = d.stock_qty <= 0 && !d.is_service;

        return (
            <React.Fragment>
                <tr
                    id={`row-${d.id}`}
                    onClick={(e) => {
                        e.stopPropagation();
                        onFocus(isFocused ? null : d.id);
                    }}
                    onDoubleClick={(e) => {
                        e.stopPropagation();
                        onEdit(d);
                    }}
                    className={`group cursor-pointer border-b border-black/15 dark:border-[#30363d] ${isSelected ? 'bg-[#0d3542]/5 dark:bg-[#58a6ff]/5' : performanceMode ? '' : 'hover:bg-black/[0.01] dark:hover:bg-white/[0.02]'} ${isFocused ? 'bg-black/[0.03] dark:bg-white/[0.04]' : ''}`}
                >
                    <td className="px-4 py-3 text-center relative">
                        {isFocused && (
                            <div className="absolute left-0 top-0 bottom-0 w-1 bg-[#0d3542] dark:bg-[#58a6ff]" />
                        )}
                        <button
                            onClick={(e) => {
                                e.stopPropagation();
                                onToggleSelect(d.id);
                            }}
                            className={`w-5 h-5 rounded-md border-2 flex items-center justify-center ${performanceMode ? '' : 'transition-all'} mx-auto ${isSelected ? 'bg-[#0d3542] dark:bg-[#58a6ff] border-[#0d3542] dark:border-[#58a6ff]' : `border-black/25 dark:border-[#30363d] ${performanceMode ? '' : 'group-hover:border-[#0d3542]/40 dark:group-hover:border-[#58a6ff]/40'}`}`}
                        >
                            {isSelected && (
                                <Check
                                    size={12}
                                    className="text-white dark:text-black"
                                />
                            )}
                        </button>
                    </td>
                    <td className="px-4 py-3 text-center border-l-2 border-black/15 dark:border-[#30363d]">
                        <div className="flex items-center justify-center gap-2">
                            <div
                                className={`w-2 h-2 rounded-full ring-2 ${!d.is_active ? 'bg-gray-500 ring-gray-500/30' : d.stock_qty > 0 || d.is_service ? 'bg-emerald-500 ring-emerald-500/30' : 'bg-red-500 ring-red-500/30'}`}
                            />
                        </div>
                    </td>
                    <td className="px-5 py-3 font-mono font-black tracking-tighter text-[#0d3542] dark:text-[#58a6ff] uppercase text-[12px] border-l-2 border-black/15 dark:border-[#30363d] text-center">
                        {d.sku || '—'}
                    </td>
                    <td className="px-6 py-3 border-l-2 border-black/15 dark:border-[#30363d] overflow-hidden">
                        <div className="flex items-center gap-3 leading-tight truncate">
                            <div
                                className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${colorScheme.bg} border ${colorScheme.border}`}
                            >
                                {d.image_path ? (
                                    <img
                                        src={d.image_path}
                                        alt={d.name}
                                        className="w-full h-full object-cover rounded-lg"
                                    />
                                ) : (
                                    <CatIcon
                                        size={14}
                                        className={colorScheme.text}
                                    />
                                )}
                            </div>
                            <span
                                className={`font-black uppercase tracking-wider ${performanceMode ? '' : 'group-hover:text-[#0d3542] dark:group-hover:text-[#58a6ff] transition-colors'} text-[14px] truncate flex items-center gap-2 ${!d.is_active ? 'text-gray-400 opacity-50 line-through' : 'text-gray-900 dark:text-[#c9d1d9]'}`}
                            >
                                {d.name}
                                {!d.is_active && (
                                    <span className="text-[9px] px-1.5 py-0.5 rounded-sm bg-gray-500/10 text-gray-500 uppercase tracking-widest no-underline">
                                        Archived
                                    </span>
                                )}
                            </span>
                        </div>
                    </td>
                    <td className="px-5 py-3 border-l-2 border-black/15 dark:border-[#30363d] text-center">
                        <span
                            className={`inline-block max-w-[100px] truncate px-2 py-0.5 ${colorScheme.bg} text-[9px] font-black ${colorScheme.text} rounded-md uppercase tracking-[0.2em] border ${colorScheme.border} whitespace-nowrap`}
                            title={d.category}
                        >
                            {d.category}
                        </span>
                    </td>
                    <td className="px-5 py-3 border-l-2 border-black/15 dark:border-[#30363d] text-center">
                        <span className="text-[11px] font-black text-gray-900 dark:text-white uppercase">
                            {d.variant || '—'}
                        </span>
                    </td>
                    <td
                        className={`px-6 py-3 text-right font-mono font-black relative text-[20px] border-l-2 border-black/15 dark:border-[#30363d] ${isOut ? 'text-red-500' : 'text-emerald-600 dark:text-emerald-400'}`}
                    >
                        {isFocused && quickEditField === 'stock' ? (
                            <QuickEditCell
                                value={d.stock_qty}
                                onSave={(val) =>
                                    onUpdateField(d.id, { stock_qty: val })
                                }
                                onClose={() => onQuickEdit(null)}
                            />
                        ) : (
                            <div className="flex items-center justify-end gap-1">
                                <span className="drop-shadow-sm">
                                    {d.is_service ? '∞' : d.stock_qty}
                                </span>
                                {!d.is_service && (
                                    <Box size={14} className="opacity-60" />
                                )}
                            </div>
                        )}
                    </td>
                    <td className="px-8 py-3 text-center font-mono font-black text-gray-900 dark:text-[#c9d1d9] text-[16px] relative border-l-2 border-black/15 dark:border-[#30363d]">
                        {isFocused && quickEditField === 'price' ? (
                            <QuickEditCell
                                value={d.price}
                                prefix="$"
                                onSave={(val) =>
                                    onUpdateField(d.id, { price: val })
                                }
                                onClose={() => onQuickEdit(null)}
                            />
                        ) : (
                            formatPrice(d.price)
                        )}
                    </td>
                </tr>
            </React.Fragment>
        );
    }
);

/* ─── Main Component ──────────────────────────────────────── */
export default function ShoeManager() {
    const queryClient = useQueryClient();
    const { activeOutlet, performanceMode, OUTLET_CONFIG, stats: apiStats } = useAdmin();

    // State
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isBulkEditOpen, setIsBulkEditOpen] = useState(false);
    const [bulkProducts, setBulkProducts] = useState([]);
    const [bulkBatchCategory, setBulkBatchCategory] = useState('');
    const [bulkBatchPriceType, setBulkBatchPriceType] = useState('set'); // 'set', 'fixed_inc', 'fixed_dec', 'percent_inc', 'percent_dec'
    const [bulkBatchPriceVal, setBulkBatchPriceVal] = useState('');
    const [bulkBatchStockVal, setBulkBatchStockVal] = useState('');
    const [editingShoe, setEditingShoe] = useState(null);
    const [isSaving, setIsSaving] = useState(false);
    const [page, setPage] = useState(1);
    const [isCreatingCategory, setIsCreatingCategory] = useState(false);
    const [newCategoryName, setNewCategoryName] = useState('');
    const [filters, setFilters] = useState({
        search: '',
        category: '',
        status: 'active',
        stockStatus: '',
    });

    // High Performance Matrix State
    const [selectedShoesMap, setSelectedShoesMap] = useState({});
    const [focusedId, setFocusedId] = useState(null);
    const [quickEditField, setQuickEditField] = useState(null);

    const [formData, setFormData] = useState({
        sku: '',
        name: '',
        variant: '',
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
            const response = await axios.post(
                '/api/v1/admin/images/upload',
                formDataUpload,
                {
                    headers: { 'Content-Type': 'multipart/form-data' },
                }
            );
            setFormData((prev) => ({ ...prev, image_path: response.data.url }));
        } catch (err) {
            console.error('Upload Failed:', err);
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
            setEditingShoe(null);
            setFormData({
                sku: '',
                name: '',
                variant: '',
                price: '',
                stock_qty: '',
                category: '',
                is_active: true,
                is_service: false,
                image_path: '',
            });
            setIsCreatingCategory(false);
            setNewCategoryName('');
        }, 200);
    }, []);

    // API Query
     const { data, isLoading } = useQuery({
         queryKey: ['admin-shoes', page, filters, activeOutlet],
         queryFn: async () => {
             const params = {
                 page,
                 status: filters.status,
                 category: filters.category,
                 search: filters.search,
                 stock_status: filters.stockStatus,
                 outlet: activeOutlet,
             };
             const res = await axios.get('/api/v1/admin/pos/products', {
                 params,
                 headers: { 'X-Active-Outlet': activeOutlet },
             });
             return res.data;
         },
         staleTime: 1000 * 15,
         placeholderData: keepPreviousData,
     });

    // Reset page and filters when outlet changes to maintain consistency
    useEffect(() => {
        setPage(1);
        setFilters(f => ({ ...f, category: '', stockStatus: '' }));
        setSelectedShoesMap({});
        setFocusedId(null);
    }, [activeOutlet]);

    // Prefetch for inactive outlets to make switching instant
    useEffect(() => {
        const otherOutlets = Object.keys(
            OUTLET_CONFIG || { attire_lounge: 1, caffeine: 1, kravat: 1 }
        ).filter((o) => o !== activeOutlet);
        otherOutlets.forEach((outlet) => {
            queryClient.prefetchQuery({
                queryKey: [
                    'admin-shoes',
                    1,
                    {
                        status: 'active',
                        category: '',
                        search: '',
                        stockStatus: '',
                    },
                    outlet,
                ],
                queryFn: async () => {
                    const params = {
                        page: 1,
                        status: 'active',
                        category: '',
                        search: '',
                        stockStatus: '',
                        outlet,
                    };
                    const res = await axios.get('/api/v1/admin/pos/products', {
                        params,
                        headers: { 'X-Active-Outlet': outlet },
                    });
                    return res.data;
                },
                staleTime: 5 * 60 * 1000,
            });
        });
    }, [activeOutlet, queryClient, OUTLET_CONFIG]);

    // Independent category fetching to prevent filter list shrinking
    const { data: categoryData } = useQuery({
        queryKey: ['admin-shoe-categories', activeOutlet],
        queryFn: async () => {
            const res = await axios.get('/api/v1/admin/pos/products/categories', {
                headers: { 'X-Active-Outlet': activeOutlet },
            });
            return res.data;
        },
        staleTime: 1000 * 60 * 5, // 5 minutes
    });

    const categories = useMemo(() => {
        const remoteCats = categoryData || [];
        let baseCategories = [];
        if (activeOutlet === 'nile') {
            baseCategories = ['Loafers', 'Slippers', 'Formal', 'Boots', 'Sneakers', 'Accessories'];
        }
        return [...baseCategories, ...remoteCats]
            .filter((v, i, a) => a.indexOf(v) === i)
            .sort();
    }, [categoryData, activeOutlet]);

    const shoes = data?.data || [];
    const meta = data?.meta || data || {};

    const stats = useMemo(
        () => ({
            total: apiStats?.pos_products ?? (meta.total || shoes.length),
            active: apiStats?.pos_active_products ?? (meta.total || shoes.length),
            lowStock: apiStats?.low_stock ?? shoes.filter(
                (d) => d.stock_qty <= 5 && d.stock_qty > 0 && !d.is_service
            ).length,
            outOfStock: apiStats?.out_of_stock ?? shoes.filter((d) => d.stock_qty <= 0 && !d.is_service)
                .length,
            unlimited: shoes.filter((d) => d.is_service).length,
        }),
        [shoes, meta.total, apiStats]
    );

    // Grouping should happen on the API results directly to maintain pagination integrity
    const groupedByCategory = useMemo(() => {
        const groups = {};
        shoes.forEach(d => {
            const cat = d.category || 'Uncategorized';
            if (!groups[cat]) groups[cat] = { name: cat, items: [] };
            groups[cat].items.push(d);
        });
        return Object.values(groups).sort((a, b) => a.name.localeCompare(b.name));
    }, [shoes]);

    // Mutations
    const mutation = useMutation({
        mutationFn: async (payload) => {
            const data = { ...payload };

            // Clean up fields that aren't in the backend validation schema
            delete data.status; // Not a validated field
            delete data.outlet; // Sent via header, not body

            // Clean up empty optional fields to prevent Laravel validation 422s
            if (!data.sku) delete data.sku;
            if (data.image_path === '') data.image_path = null;
            if (
                data.price === '' ||
                data.price === null ||
                data.price === undefined
            )
                delete data.price;
            if (
                data.stock_qty === '' ||
                data.stock_qty === null ||
                data.stock_qty === undefined
            )
                data.stock_qty = 0;
            if (data.category === '') delete data.category;



            if (editingShoe) {
                return axios.put(
                    `/api/v1/admin/pos/products/${editingShoe.id}`,
                    data
                );
            }
            return axios.post('/api/v1/admin/pos/products', data);
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['admin-shoes'] });
            queryClient.invalidateQueries({ queryKey: ['admin-stats'] });
            closeModal();
            setToast({ message: `Shoe saved successfully!`, type: 'success' });
        },
        onError: (err) => {
            setIsSaving(false);
            const errors = err.response?.data?.errors;
            let detail = '';
            if (errors) {
                detail =
                    ': ' +
                    Object.values(errors)
                        .map((e) => e.join(', '))
                        .join(' | ');
            }
            console.error('Validation Errors:', errors);
            setToast({
                message:
                    (err.response?.data?.message || 'Failed to save shoe.') +
                    detail,
                type: 'error',
            });
        },
    });

    const deleteMutation = useMutation({
        mutationFn: async (id) =>
            axios.delete(`/api/v1/admin/pos/products/${id}`),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['admin-shoes'] });
            queryClient.invalidateQueries({ queryKey: ['admin-stats'] });
            setToast({
                message: 'Shoe deleted successfully!',
                type: 'success',
            });
            setSelectedShoesMap({});
        },
        onError: (err) => {
            setToast({
                message:
                    err.response?.data?.message || 'Failed to delete shoe.',
                type: 'error',
            });
        },
    });

    const bulkDeactivateMutation = useMutation({
        mutationFn: (ids) =>
            axios.post('/api/v1/admin/pos/products/bulk-deactivate', {
                product_ids: ids,
            }),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['admin-shoes'] });
            queryClient.invalidateQueries({ queryKey: ['admin-stats'] });
            setToast({
                message: 'Selected shoes deactivated.',
                type: 'success',
            });
            setSelectedShoesMap({});
        },
        onError: (err) => {
            setToast({
                message: err.response?.data?.message || 'Failed to deactivate.',
                type: 'error',
            });
        },
    });

    const bulkRestoreMutation = useMutation({
        mutationFn: (ids) =>
            axios.post('/api/v1/admin/pos/products/bulk-restore', {
                product_ids: ids,
            }),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['admin-shoes'] });
            queryClient.invalidateQueries({ queryKey: ['admin-stats'] });
            setToast({ message: 'Selected shoes restored.', type: 'success' });
            setSelectedShoesMap({});
        },
        onError: (err) => {
            setToast({
                message: err.response?.data?.message || 'Failed to restore.',
                type: 'error',
            });
        },
    });

    const bulkDeleteMutation = useMutation({
        mutationFn: (ids) =>
            axios.post('/api/v1/admin/pos/products/bulk-delete', {
                product_ids: ids,
            }),
        onSuccess: (_, ids) => {
            queryClient.invalidateQueries({ queryKey: ['admin-shoes'] });
            queryClient.invalidateQueries({ queryKey: ['admin-stats'] });
            setToast({
                message: `${ids.length} shoe(s) permanently deleted.`,
                type: 'success',
            });
            setSelectedShoesMap({});
        },
        onError: (err) => {
            setToast({
                message: err.response?.data?.message || 'Failed to delete.',
                type: 'error',
            });
        },
    });

    const updateMutation = useMutation({
        mutationFn: ({ id, data }) =>
            axios.put(`/api/v1/admin/pos/products/${id}`, {
                ...data,
                outlet: activeOutlet,
            }),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['admin-shoes'] });
            queryClient.invalidateQueries({ queryKey: ['admin-stats'] });
            setQuickEditField(null);
        },
    });

    // Handlers
    // Selection state helpers
    const selectedCount = useMemo(() => Object.keys(selectedShoesMap).length, [selectedShoesMap]);

    const toggleSelect = useCallback((shoeOrId) => {
        setSelectedShoesMap((prev) => {
            const next = { ...prev };
            const id = typeof shoeOrId === 'object' ? shoeOrId.id : shoeOrId;
            if (next[id]) {
                delete next[id];
            } else {
                const shoe = typeof shoeOrId === 'object' ? shoeOrId : shoes.find(d => d.id === id);
                if (shoe) {
                    next[id] = shoe;
                }
            }
            return next;
        });
    }, [shoes]);

    const handleSelectAll = () => {
        const allOnPageSelected = shoes.length > 0 && shoes.every(d => !!selectedShoesMap[d.id]);
        setSelectedShoesMap((prev) => {
            const next = { ...prev };
            shoes.forEach(d => {
                if (allOnPageSelected) {
                    delete next[d.id];
                } else {
                    next[d.id] = d;
                }
            });
            return next;
        });
    };

    const handleBulkDeactivate = () => {
        const ids = Object.keys(selectedShoesMap).map(Number);
        if (ids.length === 0) return;
        if (!window.confirm(`Deactivate ${ids.length} selected shoes?`))
            return;
        bulkDeactivateMutation.mutate(ids);
    };

    const handleBulkRestore = () => {
        const ids = Object.keys(selectedShoesMap).map(Number);
        if (ids.length === 0) return;
        if (!window.confirm(`Restore ${ids.length} selected shoes?`))
            return;
        bulkRestoreMutation.mutate(ids);
    };

    const handleBulkDelete = () => {
        const ids = Object.keys(selectedShoesMap).map(Number);
        if (ids.length === 0) return;
        if (
            !window.confirm(
                `⚠️ PERMANENTLY DELETE ${ids.length} selected shoe(s)?\n\nThis action cannot be undone. The products will be removed from the database forever.`
            )
        )
            return;
        bulkDeleteMutation.mutate(ids);
    };

    const bulkUpdateProductsMutation = useMutation({
        mutationFn: async (updatedProducts) => {
            const payload = {
                products: updatedProducts.map((p) => ({
                    id: p.id,
                    sku: p.sku || '',
                    name: p.name || '',
                    price: p.price !== '' ? parseFloat(p.price) : null,
                    stock_qty: p.is_service ? 0 : (p.stock_qty !== '' ? parseInt(p.stock_qty, 10) : 0),
                    category: p.category || '',
                    is_active: p.is_active,
                    is_service: p.is_service,
                }))
            };
            return axios.post('/api/v1/admin/pos/products/bulk-update', payload, {
                headers: { 'X-Active-Outlet': activeOutlet },
            });
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['admin-shoes'] });
            queryClient.invalidateQueries({ queryKey: ['admin-stats'] });
            setIsBulkEditOpen(false);
            setSelectedShoesMap({});
            setToast({ message: 'Shoes bulk updated successfully!', type: 'success' });
        },
        onError: (err) => {
            const errors = err.response?.data?.errors;
            let detail = '';
            if (errors) {
                detail = ': ' + Object.values(errors).map((e) => e.join(', ')).join(' | ');
            }
            setToast({
                message: (err.response?.data?.message || 'Failed to update shoes.') + detail,
                type: 'error',
            });
        }
    });

    // ─── Bulk Add state ───────────────────────────────────────────────────────
    const [isBulkAddOpen, setIsBulkAddOpen] = useState(false);
    const [bulkAddProducts, setBulkAddProducts] = useState([]);
    const [bulkAddDefaultCategory, setBulkAddDefaultCategory] = useState('');
    const [bulkAddDefaultPrice, setBulkAddDefaultPrice] = useState('');
    const [bulkAddDefaultStock, setBulkAddDefaultStock] = useState('');
    const [bulkAddDefaultService, setBulkAddDefaultService] = useState(false);

    const bulkAddProductsMutation = useMutation({
        mutationFn: async (products) => {
            const payload = {
                products: products.map((p) => ({
                    sku: p.sku || '',
                    name: p.name || '',
                    price: p.price !== '' && p.price !== null ? parseFloat(p.price) : null,
                    stock_qty: p.is_service ? 00 : (p.stock_qty !== '' && p.stock_qty !== null ? parseInt(p.stock_qty, 10) : 0),
                    category: p.category || '',
                    is_active: true,
                    is_service: p.is_service || false,
                }))
            };
            return axios.post('/api/v1/admin/pos/products/bulk-create', payload, {
                headers: { 'X-Active-Outlet': activeOutlet },
            });
        },
        onSuccess: (res) => {
            queryClient.invalidateQueries({ queryKey: ['admin-shoes'] });
            queryClient.invalidateQueries({ queryKey: ['admin-stats'] });
            setIsBulkAddOpen(false);
            setBulkAddProducts([]);
            setToast({ message: `Successfully created ${bulkAddProducts.length} products!`, type: 'success' });
        },
        onError: (err) => {
            const errors = err.response?.data?.errors;
            let detail = '';
            if (errors) {
                detail = ': ' + Object.values(errors).map((e) => e.join(', ')).join(' | ');
            }
            setToast({
                message: (err.response?.data?.message || 'Failed to create products.') + detail,
                type: 'error',
            });
        }
    });

    const openBulkAdd = () => {
        setBulkAddDefaultCategory('');
        setBulkAddDefaultPrice('');
        setBulkAddDefaultStock('');
        setBulkAddDefaultService(false);
        setBulkAddProducts([
            { tempId: 1, sku: '', name: '', price: '', stock_qty: '', category: '', is_service: false },
        ]);
        setIsBulkAddOpen(true);
    };

    const addBulkAddRow = () => {
        const maxId = bulkAddProducts.reduce((max, p) => Math.max(max, p.tempId), 0);
        setBulkAddProducts((prev) => [
            ...prev,
            { tempId: maxId + 1, sku: '', name: '', price: '', stock_qty: '', category: '', is_service: false },
        ]);
    };

    const removeBulkAddRow = (tempId) => {
        setBulkAddProducts((prev) => prev.filter((p) => p.tempId !== tempId));
    };

    const applyBulkAddDefaults = () => {
        setBulkAddProducts((prev) =>
            prev.map((p) => ({
                ...p,
                category: bulkAddDefaultCategory || p.category,
                price: bulkAddDefaultPrice !== '' ? bulkAddDefaultPrice : p.price,
                stock_qty: bulkAddDefaultStock !== '' ? bulkAddDefaultStock : p.stock_qty,
                is_service: bulkAddDefaultService,
            }))
        );
        setToast({ message: 'Defaults applied to all rows.', type: 'success' });
    };

    const handleBulkEditOpen = () => {
        const stored = Object.values(selectedShoesMap);
        if (stored.length === 0) return;
        const selectedShoes = stored.map((d) => ({
            id: d.id,
            sku: d.sku || '',
            name: d.name || '',
            price: d.price ?? '',
            stock_qty: d.stock_qty ?? 0,
            category: d.category || '',
            is_active: d.is_active ?? true,
            is_service: d.is_service ?? false,
            image_path: d.image_path || '',
        }));
        setBulkProducts(selectedShoes);
        setBulkBatchCategory('');
        setBulkBatchPriceType('set');
        setBulkBatchPriceVal('');
        setBulkBatchStockVal('');
        setIsBulkEditOpen(true);
    };

    const applyCategoryToAll = () => {
        if (!bulkBatchCategory) return;
        setBulkProducts((prev) =>
            prev.map((p) => ({ ...p, category: bulkBatchCategory }))
        );
        setToast({ message: `Applied category "${bulkBatchCategory}" to all rows.`, type: 'success' });
    };

    const applyPriceToAll = () => {
        const val = parseFloat(bulkBatchPriceVal);
        if (isNaN(val)) return;

        setBulkProducts((prev) =>
            prev.map((p) => {
                let newPrice = parseFloat(p.price);
                if (isNaN(newPrice)) newPrice = 0;

                switch (bulkBatchPriceType) {
                    case 'set':
                        newPrice = val;
                        break;
                    case 'fixed_inc':
                        newPrice = newPrice + val;
                        break;
                    case 'fixed_dec':
                        newPrice = Math.max(0, newPrice - val);
                        break;
                    case 'percent_inc':
                        newPrice = newPrice * (1 + val / 100);
                        break;
                    case 'percent_dec':
                        newPrice = Math.max(0, newPrice * (1 - val / 100));
                        break;
                }
                return { ...p, price: parseFloat(newPrice.toFixed(2)) };
            })
        );
        setToast({ message: 'Applied price updates to all rows.', type: 'success' });
    };

    const applyStockToAll = () => {
        const val = parseInt(bulkBatchStockVal, 10);
        if (isNaN(val)) return;

        setBulkProducts((prev) =>
            prev.map((p) => {
                if (p.is_service) return p;
                return { ...p, stock_qty: Math.max(0, val) };
            })
        );
        setToast({ message: `Set stock quantity to ${val} for all products.`, type: 'success' });
    };

    const applyServiceStateToAll = (val) => {
        setBulkProducts((prev) =>
            prev.map((p) => ({
                ...p,
                is_service: val,
                stock_qty: val ? '' : (p.stock_qty || 0),
            }))
        );
        setToast({ message: `Marked all selected items as ${val ? 'Services' : 'Products'}.`, type: 'success' });
    };

    const applyActiveStateToAll = (val) => {
        setBulkProducts((prev) =>
            prev.map((p) => ({ ...p, is_active: val }))
        );
        setToast({ message: `Marked all selected items as ${val ? 'Active' : 'Archived'}.`, type: 'success' });
    };

    // Keyboard Navigation
    useEffect(() => {
        const handleKeyDown = (e) => {
            if (e.key === '/' && document.activeElement.tagName !== 'INPUT') {
                e.preventDefault();
                document.getElementById('search-shoes')?.focus();
            }

            if (shoes.length === 0) return;

            if (e.key === 'ArrowDown') {
                if (
                    document.activeElement.tagName === 'INPUT' ||
                    document.activeElement.tagName === 'TEXTAREA'
                )
                    return;
                e.preventDefault();
                setFocusedId((prev) => {
                    const idx = shoes.findIndex((d) => d.id === prev);
                    if (idx === -1) return shoes[0]?.id;
                    return shoes[
                        Math.min(idx + 1, shoes.length - 1)
                    ]?.id;
                });
            }
            if (e.key === 'ArrowUp') {
                if (
                    document.activeElement.tagName === 'INPUT' ||
                    document.activeElement.tagName === 'TEXTAREA'
                )
                    return;
                e.preventDefault();
                setFocusedId((prev) => {
                    const idx = shoes.findIndex((d) => d.id === prev);
                    if (idx <= 0) return shoes[0]?.id;
                    return shoes[idx - 1]?.id;
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
                if (
                    focusedId &&
                    document.activeElement.tagName !== 'INPUT' &&
                    !quickEditField
                ) {
                    e.preventDefault();
                    const shoe = shoes.find(
                        (d) => d.id === focusedId
                    );
                    if (shoe) {
                        setEditingShoe(shoe);
                        setFormData({
                            sku: shoe.sku || '',
                            name: shoe.name || '',
                            variant: shoe.variant || '',
                            price: shoe.price || '',
                            stock_qty: shoe.stock_qty || '',
                            category: shoe.category || '',
                            is_active: shoe.is_active ?? true,
                            is_service: shoe.is_service || false,
                            image_path: shoe.image_path || '',
                        });
                        setIsModalOpen(true);
                    }
                }
            }
            if (e.key === 'Escape') {
                if (isModalOpen) {
                    closeModal();
                    return;
                }
                if (quickEditField) {
                    setQuickEditField(null);
                    return;
                }
                if (selectedCount > 0) {
                    setSelectedShoesMap({});
                    return;
                }
                if (focusedId) {
                    setFocusedId(null);
                    return;
                }
            }
        };

        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [
        shoes,
        focusedId,
        quickEditField,
        toggleSelect,
        isModalOpen,
        closeModal,
        selectedShoesMap,
        selectedCount,
    ]);

    // UI Render Matrix
    return (
        <div className="p-8 space-y-8 font-sans bg-[#fdfdfc] dark:bg-[#010409] min-h-screen text-gray-900 dark:text-[#c9d1d9]">
            {toast && (
                <div className="fixed top-6 right-6 z-50 animate-in slide-in-from-top-4 fade-in">
                    <div
                        className={`px-6 py-4 rounded-xl border flex items-center gap-3 font-bold text-[11px] uppercase tracking-widest shadow-2xl ${toast.type === 'error' ? 'bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-900/50 text-red-600 dark:text-red-400' : 'bg-emerald-50 dark:bg-emerald-900/20 border-emerald-200 dark:border-emerald-900/50 text-emerald-600 dark:text-emerald-400'}`}
                    >
                        {toast.type === 'error' ? (
                            <AlertCircle size={16} />
                        ) : (
                            <Check size={16} />
                        )}
                        {toast.message}
                    </div>
                </div>
            )}

            {/* Header Section */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div>
                    <h1 className="text-2xl font-serif text-gray-900 dark:text-[#c9d1d9] uppercase tracking-[0.2em]">
                        {activeOutlet === 'attire_lounge'
                            ? 'Lounge'
                            : activeOutlet}{' '}
                        Collection
                    </h1>
                    <p className="text-sm text-gray-500 dark:text-[#8b949e]/60 mt-1 uppercase tracking-widest font-medium">
                        Manage shoe inventory, prices, and categories
                    </p>
                </div>

                <div className="flex items-center gap-3">
                    <button
                        onClick={() => {
                            setEditingShoe(null);
                            setFormData({
                                sku: '',
                                name: '',
                                variant: '',
                                price: '',
                                stock_qty: '',
                                category: '',
                                is_active: true,
                                is_service: false,
                                image_path: '',
                            });
                            setIsModalOpen(true);
                        }}
                        className="flex items-center gap-2 px-4 py-2 bg-[#0d3542] dark:bg-[#58a6ff] text-white dark:text-black rounded-xl text-xs font-bold uppercase tracking-widest hover:scale-105 transition-all shadow-none border border-transparent"
                    >
                        <Plus size={14} /> New Shoe
                    </button>
                    <button
                        onClick={openBulkAdd}
                        className="flex items-center gap-2 px-4 py-2 bg-white dark:bg-[#161b22] border border-black/10 dark:border-[#30363d] text-gray-700 dark:text-[#c9d1d9] rounded-xl text-xs font-bold uppercase tracking-widest hover:border-[#0d3542]/40 dark:hover:border-[#58a6ff]/40 hover:text-[#0d3542] dark:hover:text-[#58a6ff] transition-all"
                    >
                        <ClipboardList size={14} /> Bulk Add
                    </button>
                </div>
            </div>

            {/* Quick Stats */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                {[
                    {
                        label: 'ALL SHOES',
                        value: stats.total,
                        icon: <Footprints size={20} />,
                        color: 'text-[#0d3542] dark:text-[#58a6ff]',
                    },
                    {
                        label: 'Active Shoes',
                        value: stats.active,
                        icon: <CheckCircle size={20} />,
                        color: 'text-green-500',
                    },
                    {
                        label: 'Low Stock',
                        value: stats.lowStock,
                        icon: <AlertCircle size={20} />,
                        color: 'text-amber-500',
                    },
                    {
                        label: 'Out of Stock',
                        value: stats.outOfStock,
                        icon: <AlertCircle size={20} />,
                        color: 'text-red-500',
                    },
                ].map((stat, idx) => (
                    <div
                        key={idx}
                        className="p-6 bg-white dark:bg-[#161b22] border border-black/5 dark:border-[#30363d] rounded-xl shadow-none relative overflow-hidden group"
                    >
                        <div className="flex items-center justify-between relative z-10">
                            <div className="space-y-1">
                                <p className="text-xs font-bold text-gray-500 dark:text-[#8b949e]/40 uppercase tracking-widest">
                                    {stat.label}
                                </p>
                                <p
                                    className={`text-2xl font-bold tracking-tighter ${stat.color}`}
                                >
                                    {stat.value}
                                </p>
                            </div>
                            <div
                                className={`p-4 rounded-lg bg-black/[0.03] dark:bg-[#0d1117] ${stat.color} group-hover:scale-110 transition-transform border border-black/5 dark:border-[#30363d]`}
                            >
                                {stat.icon}
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            {/* Filter Bar */}
            <div className="relative z-20 flex flex-col md:flex-row gap-4 items-center bg-white dark:bg-[#161b22] p-4 rounded-xl border border-black/5 dark:border-[#30363d] shadow-none">
                <div className="relative flex-1 w-full group">
                    <Search
                        size={18}
                        className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-[#0d3542] dark:group-focus-within:text-[#58a6ff] transition-colors"
                    />
                    <input
                        id="search-shoes"
                        type="text"
                        placeholder="Search shoes... (/)"
                        value={filters.search}
                        onChange={(e) => {
                            setFilters((f) => ({
                                ...f,
                                search: e.target.value,
                            }));
                            setPage(1);
                        }}
                        className="w-full bg-black/[0.02] dark:bg-[#0d1117] border border-black/5 dark:border-[#30363d] rounded-lg py-3 pl-12 pr-4 text-sm font-bold uppercase tracking-widest outline-none focus:border-[#0d3542]/50 dark:focus:border-[#58a6ff]/50 transition-all placeholder:text-gray-400 dark:placeholder:text-[#8b949e]/20"
                    />
                </div>
                <div className="flex flex-wrap gap-2 w-full md:w-auto pb-1 md:pb-0">
                    <FilterDropdown
                        label="All Categories"
                        icon={Layers}
                        value={filters.category}
                        options={['', ...categories].map(cat => ({
                            label: cat || 'All Categories',
                            value: cat
                        }))}
                        onChange={(val) => {
                            setFilters(f => ({ ...f, category: val }));
                            setPage(1);
                        }}
                    />

                    <FilterDropdown
                        label="All Stock"
                        icon={Package}
                        value={filters.stockStatus}
                        options={[
                            { label: 'All Stock', value: '' },
                            { label: 'Low Stock', value: 'low' },
                            { label: 'Out of Stock', value: 'out' }
                        ]}
                        onChange={(val) => {
                            setFilters(f => ({ ...f, stockStatus: val }));
                            setPage(1);
                        }}
                    />

                    <FilterDropdown
                        label="Active Status"
                        icon={CheckCircle}
                        value={filters.status}
                        options={[
                            { label: 'Active', value: 'active' },
                            { label: 'Archived', value: 'inactive' },
                            { label: 'All Status', value: 'all' }
                        ]}
                        onChange={(val) => {
                            setFilters(f => ({ ...f, status: val }));
                            setPage(1);
                        }}
                    />
                </div>
            </div>

            {/* Table Area */}
            <div className="bg-white dark:bg-[#161b22] border border-black/5 dark:border-[#30363d] rounded-xl shadow-none overflow-hidden min-h-[400px]">
                <table className="w-full text-left border-collapse table-fixed">
                    <thead>
                        <tr className="bg-black/[0.02] dark:bg-[#0d1117] border-b border-black/5 dark:border-[#30363d]">
                            <th className="w-16 px-6 py-5 text-center">
                                <button
                                    onClick={handleSelectAll}
                                    className={`w-5 h-5 rounded-md border flex items-center justify-center transition-all mx-auto ${shoes.length > 0 && shoes.every(d => !!selectedShoesMap[d.id]) ? 'bg-[#0d3542] dark:bg-[#58a6ff] border-[#0d3542] dark:border-[#58a6ff]' : 'bg-black/5 dark:bg-[#0d1117] border-black/10 dark:border-[#30363d] hover:border-[#0d3542]/40'}`}
                                >
                                    {shoes.length > 0 &&
                                        shoes.every(d => !!selectedShoesMap[d.id]) && (
                                            <Check
                                                size={12}
                                                className="text-white dark:text-black"
                                            />
                                        )}
                                </button>
                            </th>
                            <th className="w-16 px-6 py-5 text-center text-xs font-bold uppercase tracking-[0.2em] text-gray-500 dark:text-[#8b949e]/40 whitespace-nowrap">
                                STS
                            </th>
                            <th className="w-32 px-6 py-5 text-center text-xs font-bold uppercase tracking-[0.2em] text-gray-500 dark:text-[#8b949e]/40 whitespace-nowrap">
                                SKU
                            </th>
                            <th className="w-auto px-6 py-5 text-left text-xs font-bold uppercase tracking-[0.2em] text-gray-500 dark:text-[#8b949e]/40 whitespace-nowrap">
                                Shoe
                            </th>
                            <th className="w-40 px-6 py-5 text-center text-xs font-bold uppercase tracking-[0.2em] text-gray-500 dark:text-[#8b949e]/40 whitespace-nowrap">
                                Category
                            </th>
                            <th className="w-24 px-6 py-5 text-center text-xs font-bold uppercase tracking-[0.2em] text-gray-500 dark:text-[#8b949e]/40 whitespace-nowrap">
                                Size
                            </th>
                            <th className="w-32 px-6 py-5 text-right text-xs font-bold uppercase tracking-[0.2em] text-gray-500 dark:text-[#8b949e]/40 whitespace-nowrap">
                                Stock
                            </th>
                            <th className="w-32 px-6 py-5 text-center text-xs font-bold uppercase tracking-[0.2em] text-gray-500 dark:text-[#8b949e]/40 whitespace-nowrap">
                                Price
                            </th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-black/5 dark:divide-[#30363d]">
                        {isLoading && shoes.length === 0 ? (
                            Array.from({ length: 8 }).map((_, i) => (
                                <tr key={i} className="animate-pulse">
                                    <td className="px-6 py-4 text-center">
                                        <div className="w-5 h-5 rounded bg-gray-200 dark:bg-white/5 mx-auto" />
                                    </td>
                                    <td className="px-6 py-4 text-center">
                                        <div className="w-2 h-2 rounded-full bg-gray-200 dark:bg-white/5 mx-auto" />
                                    </td>
                                    <td className="px-6 py-4 text-center">
                                        <div
                                            className="h-4 w-16 mx-auto rounded bg-gray-200 dark:bg-white/5"
                                            style={{
                                                animationDelay: `${i * 80}ms`,
                                            }}
                                        />
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="flex items-center gap-3">
                                            <div className="w-10 h-10 rounded-lg bg-gray-200 dark:bg-white/5" />
                                            <div
                                                className={`h-4 rounded bg-gray-200 dark:bg-white/5`}
                                                style={{
                                                    width: `${100 + Math.random() * 120}px`,
                                                    animationDelay: `${i * 80 + 20}ms`,
                                                }}
                                            />
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 text-center">
                                        <div
                                            className="h-5 w-20 mx-auto rounded-lg bg-gray-200 dark:bg-white/5"
                                            style={{
                                                animationDelay: `${i * 80 + 40}ms`,
                                            }}
                                        />
                                    </td>
                                    <td className="px-6 py-4 text-right">
                                        <div
                                            className="h-4 w-10 ml-auto rounded bg-gray-200 dark:bg-white/5"
                                            style={{
                                                animationDelay: `${i * 80 + 60}ms`,
                                            }}
                                        />
                                    </td>
                                    <td className="px-6 py-4 text-center">
                                        <div
                                            className="h-4 w-14 mx-auto rounded bg-gray-200 dark:bg-white/5"
                                            style={{
                                                animationDelay: `${i * 80 + 80}ms`,
                                            }}
                                        />
                                    </td>
                                </tr>
                            ))
                        ) : shoes.length === 0 ? (
                            <tr>
                                <td
                                    colSpan="7"
                                    className="px-6 py-20 text-center opacity-40"
                                >
                                    <Footprints
                                        size={48}
                                        className="mx-auto mb-4 text-gray-400"
                                    />
                                    <h3 className="text-sm font-bold uppercase tracking-widest text-gray-900 dark:text-white mb-1">
                                        No Shoes Found
                                    </h3>
                                    <p className="text-xs text-gray-500 uppercase tracking-widest">
                                        Try adjusting your search or filters.
                                    </p>
                                </td>
                            </tr>
                        ) : (
                            groupedByCategory.map((group) => (
                                <React.Fragment key={group.name}>
                                    <tr className="bg-[#0d3542]/5 dark:bg-[#58a6ff]/5 border-b border-[#0d3542]/20 dark:border-[#58a6ff]/20">
                                        <td colSpan="7" className="px-6 py-3.5">
                                            <div className="flex items-center gap-3">
                                                <button
                                                    onClick={() => {
                                                        setSelectedShoesMap((prev) => {
                                                            const next = { ...prev };
                                                            const allSelected = group.items.every(d => !!next[d.id]);
                                                            group.items.forEach(d => {
                                                                if (allSelected) delete next[d.id];
                                                                else next[d.id] = d;
                                                            });
                                                            return next;
                                                        });
                                                    }}
                                                    className={`w-5 h-5 rounded-md border-2 flex items-center justify-center transition-all shrink-0 ${
                                                        group.items.every(d => !!selectedShoesMap[d.id])
                                                            ? 'bg-[#0d3542] dark:bg-[#58a6ff] border-[#0d3542] dark:border-[#58a6ff]'
                                                            : 'border-black/25 dark:border-[#30363d]'
                                                    }`}
                                                >
                                                     {group.items.every(d => !!selectedShoesMap[d.id]) && <Check size={12} className="text-white dark:text-black" />}
                                                </button>
                                                <div className="h-1 w-8 bg-[#0d3542] dark:bg-[#58a6ff] rounded-full" />
                                                <span className="text-[11px] font-black uppercase tracking-[0.25em] text-[#0d3542] dark:text-[#58a6ff]">{group.name}</span>
                                                <span className="px-2 py-0.5 bg-black/10 dark:bg-white/10 text-[9px] font-black text-gray-500 dark:text-white/40 uppercase tracking-widest rounded">{group.items.length} items</span>
                                            </div>
                                        </td>
                                    </tr>
                                    {group.items.map((d) => (
                                        <ShoeRow
                                            key={d.id}
                                            shoe={d}
                                            isSelected={!!selectedShoesMap[d.id]}
                                            isFocused={focusedId === d.id}
                                            quickEditField={quickEditField}
                                            onToggleSelect={toggleSelect}
                                            onFocus={setFocusedId}
                                            onEdit={(shoe) => {
                                                setEditingShoe(shoe);
                                                setFormData({
                                                    sku: shoe.sku || '',
                                                    name: shoe.name || '',
                                                    price: shoe.price || '',
                                                    stock_qty: shoe.stock_qty || '',
                                                    category: shoe.category || '',
                                                    is_active: shoe.is_active ?? true,
                                                    is_service: shoe.is_service || false,
                                                    image_path: shoe.image_path || '',
                                                });
                                                setIsModalOpen(true);
                                            }}
                                            onQuickEdit={setQuickEditField}
                                            onUpdateField={(id, data) =>
                                                updateMutation.mutate({ id, data })
                                            }
                                            performanceMode={performanceMode}
                                        />
                                    ))}
                                </React.Fragment>
                            ))
                        )}
                    </tbody>
                </table>
            </div>

            {/* Pagination Controls */}
            <div className="flex items-center justify-between pb-10">
                <p className="text-xs font-bold text-gray-500 dark:text-[#8b949e]/40 uppercase tracking-widest">
                    Showing {shoes.length} of{' '}
                    {meta.total || shoes.length} shoes
                </p>
                <div className="flex items-center gap-2">
                    <button
                        disabled={page === 1}
                        onClick={() => setPage((p) => Math.max(1, p - 1))}
                        className="p-2 rounded-xl border border-black/5 dark:border-[#30363d] text-gray-400 hover:text-[#0d3542] dark:hover:text-[#58a6ff] transition-all disabled:opacity-30"
                    >
                        <ChevronLeft size={16} />
                    </button>
                    <button
                        disabled={!meta.last_page || page >= meta.last_page}
                        onClick={() => setPage((p) => p + 1)}
                        className="p-2 rounded-xl border border-black/5 dark:border-[#30363d] text-gray-400 hover:text-[#0d3542] dark:hover:text-[#58a6ff] transition-all disabled:opacity-30"
                    >
                        <ChevronRight size={16} />
                    </button>
                </div>
            </div>

            {/* Editing Form Modal */}
            <ModernModal
                isOpen={isModalOpen}
                onClose={closeModal}
                title={editingShoe ? 'Edit Shoe' : 'New Shoe'}
                icon={Footprints}
                overflowVisible={true}
            >
                <div className="p-6 font-sans">
                    <form
                        onSubmit={(e) => {
                            e.preventDefault();
                            setIsSaving(true);
                            mutation.mutate(formData);
                        }}
                        className="space-y-6"
                    >
                        {/* Image Uploader */}
                        <div className="flex items-center gap-4 p-4 bg-white dark:bg-[#161b22] border border-black/5 dark:border-[#30363d] rounded-xl shadow-sm">
                            <label
                                className={`w-20 h-20 shrink-0 rounded-xl border border-dashed border-black/10 dark:border-[#30363d] bg-black/[0.02] dark:bg-[#0d1117] flex flex-col items-center justify-center cursor-pointer hover:border-[#0d3542]/50 dark:hover:border-[#58a6ff]/50 transition-all group overflow-hidden relative ${uploading ? 'pointer-events-none opacity-50' : ''}`}
                            >
                                <input
                                    type="file"
                                    className="hidden"
                                    accept="image/*"
                                    onChange={handleImageUpload}
                                />
                                {formData.image_path ? (
                                    <img
                                        src={formData.image_path}
                                        alt="Preview"
                                        className="w-full h-full object-cover"
                                    />
                                ) : uploading ? (
                                    <Loader2
                                        size={20}
                                        className="animate-spin text-[#0d3542] dark:text-[#58a6ff]"
                                    />
                                ) : (
                                    <Upload
                                        size={20}
                                        className="text-gray-400 dark:text-[#8b949e] group-hover:text-[#0d3542] dark:group-hover:text-[#58a6ff] transition-colors mb-1"
                                    />
                                )}
                            </label>
                            <div className="flex-1">
                                <h4 className="text-[12px] font-bold uppercase tracking-widest text-gray-900 dark:text-white mb-1">
                                    Shoe Image
                                </h4>
                                <p className="text-[11px] font-medium text-gray-500 dark:text-[#8b949e]">
                                    Upload a high-quality picture for the POS
                                    menu (Optional).
                                </p>
                                {formData.image_path && (
                                    <button
                                        type="button"
                                        onClick={() =>
                                            setFormData((f) => ({
                                                ...f,
                                                image_path: '',
                                            }))
                                        }
                                        className="mt-2 text-[10px] font-bold uppercase tracking-widest text-red-500 hover:text-red-600 transition-colors"
                                    >
                                        Remove Image
                                    </button>
                                )}
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-1.5 col-span-2">
                                <label className="block text-[10px] font-bold text-gray-500 dark:text-[#8b949e]/80 uppercase tracking-[0.15em] ml-0.5">
                                    Name
                                </label>
                                <input
                                    required
                                    value={formData.name}
                                    onChange={(e) =>
                                        setFormData((f) => ({
                                            ...f,
                                            name: e.target.value,
                                        }))
                                    }
                                    className="w-full bg-white dark:bg-[#0d1117] text-gray-900 dark:text-white px-4 py-3 rounded-xl border border-black/5 dark:border-[#30363d] focus:border-[#0d3542] dark:focus:border-[#58a6ff] outline-none text-sm font-bold tracking-wide transition-colors"
                                    placeholder="Penny Loafer, Chelsea Boot..."
                                />
                            </div>
                            <div className="space-y-1.5">
                                <label className="block text-[10px] font-bold text-gray-500 dark:text-[#8b949e]/80 uppercase tracking-[0.15em] ml-0.5">
                                    Category
                                </label>
                                {isCreatingCategory ? (
                                    <div className="flex gap-2">
                                        <input
                                            type="text"
                                            value={newCategoryName}
                                            onChange={(e) =>
                                                setNewCategoryName(
                                                    e.target.value.toUpperCase()
                                                )
                                            }
                                            onKeyDown={(e) => {
                                                if (
                                                    e.key === 'Enter' &&
                                                    newCategoryName.trim()
                                                ) {
                                                    setFormData({
                                                        ...formData,
                                                        category:
                                                            newCategoryName.trim(),
                                                    });
                                                    setIsCreatingCategory(
                                                        false
                                                    );
                                                    setNewCategoryName('');
                                                    e.preventDefault();
                                                }
                                                if (e.key === 'Escape') {
                                                    setIsCreatingCategory(
                                                        false
                                                    );
                                                    setNewCategoryName('');
                                                    e.preventDefault();
                                                }
                                            }}
                                            autoFocus
                                            className="flex-1 min-w-0 w-full bg-white dark:bg-[#0d1117] text-gray-900 dark:text-white px-4 py-3 rounded-xl border border-black/5 dark:border-[#30363d] focus:border-[#0d3542] dark:focus:border-[#58a6ff] outline-none text-sm font-bold tracking-wide transition-colors"
                                            placeholder="ENTER CATEGORY..."
                                        />
                                        <button
                                            type="button"
                                            onClick={() => {
                                                if (newCategoryName.trim()) {
                                                    setFormData({
                                                        ...formData,
                                                        category:
                                                            newCategoryName.trim(),
                                                    });
                                                    setIsCreatingCategory(
                                                        false
                                                    );
                                                    setNewCategoryName('');
                                                }
                                            }}
                                            className="px-3 py-3 bg-[#0d3542] dark:bg-[#58a6ff] text-white dark:text-black rounded-xl hover:opacity-90 transition-all"
                                        >
                                            <Check size={16} />
                                        </button>
                                        <button
                                            type="button"
                                            onClick={() => {
                                                setIsCreatingCategory(false);
                                                setNewCategoryName('');
                                            }}
                                            className="px-3 py-3 bg-black/5 dark:bg-white/5 text-gray-500 hover:bg-red-500/10 hover:text-red-500 rounded-xl transition-all"
                                        >
                                            <X size={16} />
                                        </button>
                                    </div>
                                ) : (
                                    <BespokeSelect
                                        value={formData.category}
                                        options={[
                                            ...categories,
                                            {
                                                label: '+ Create New Category',
                                                value: 'NEW_CATEGORY',
                                                isAction: true,
                                            },
                                        ]}
                                        onChange={(val) =>
                                            setFormData({
                                                ...formData,
                                                category: val,
                                            })
                                        }
                                        onAction={() =>
                                            setIsCreatingCategory(true)
                                        }
                                        placeholder="Select Category"
                                    />
                                )}{' '}
                            </div>
                            <div className="space-y-1.5">
                                <label className="block text-[10px] font-bold text-gray-500 dark:text-[#8b949e]/80 uppercase tracking-[0.15em] ml-0.5">
                                    Size
                                </label>
                                <input
                                    value={formData.variant}
                                    onChange={(e) =>
                                        setFormData((f) => ({
                                            ...f,
                                            variant: e.target.value,
                                        }))
                                    }
                                    className="w-full bg-white dark:bg-[#0d1117] text-gray-900 dark:text-white px-4 py-3 rounded-xl border border-black/5 dark:border-[#30363d] focus:border-[#0d3542] dark:focus:border-[#58a6ff] outline-none text-sm font-bold tracking-wide transition-colors"
                                    placeholder="38, 39, 40, 41, 42..."
                                />
                            </div>
                            <div className="space-y-1.5">
                                <label className="block text-[10px] font-bold text-gray-500 dark:text-[#8b949e]/80 uppercase tracking-[0.15em] ml-0.5">
                                    Price
                                </label>
                                <input
                                    type="number"
                                    step="0.01"
                                    required
                                    value={formData.price}
                                    onChange={(e) =>
                                        setFormData((f) => ({
                                            ...f,
                                            price: e.target.value,
                                        }))
                                    }
                                    className="w-full bg-white dark:bg-[#0d1117] text-gray-900 dark:text-white px-4 py-3 rounded-xl border border-black/5 dark:border-[#30363d] focus:border-[#0d3542] dark:focus:border-[#58a6ff] outline-none text-sm font-bold tracking-wide transition-colors"
                                    placeholder="0.00"
                                />
                            </div>
                            <div className="space-y-1.5">
                                <label className="block text-[10px] font-bold text-gray-500 dark:text-[#8b949e]/80 uppercase tracking-[0.15em] ml-0.5">
                                    Stock
                                </label>
                                <input
                                    type="number"
                                    disabled={formData.is_service}
                                    value={formData.stock_qty}
                                    onChange={(e) =>
                                        setFormData((f) => ({
                                            ...f,
                                            stock_qty: e.target.value,
                                        }))
                                    }
                                    className="w-full bg-white dark:bg-[#0d1117] text-gray-900 dark:text-white px-4 py-3 rounded-xl border border-black/5 dark:border-[#30363d] focus:border-[#0d3542] dark:focus:border-[#58a6ff] outline-none text-sm font-bold tracking-wide transition-colors disabled:opacity-50"
                                    placeholder={
                                        formData.is_service ? '∞' : '0'
                                    }
                                />
                            </div>
                            <div className="space-y-1.5">
                                <label className="block text-[10px] font-bold text-gray-500 dark:text-[#8b949e]/80 uppercase tracking-[0.15em] ml-0.5">
                                    SKU (Optional)
                                </label>
                                <input
                                    value={formData.sku}
                                    onChange={(e) =>
                                        setFormData((f) => ({
                                            ...f,
                                            sku: e.target.value,
                                        }))
                                    }
                                    className="w-full bg-white dark:bg-[#0d1117] text-gray-900 dark:text-white px-4 py-3 rounded-xl border border-black/5 dark:border-[#30363d] focus:border-[#0d3542] dark:focus:border-[#58a6ff] outline-none text-sm font-bold tracking-wide transition-colors"
                                    placeholder="Auto-gen if empty"
                                />
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div className="p-4 bg-white dark:bg-[#161b22] border border-black/5 dark:border-[#30363d] rounded-xl shadow-sm">
                                <label className="flex items-center gap-4 cursor-pointer">
                                    <input
                                        type="checkbox"
                                        checked={formData.is_active}
                                        onChange={(e) =>
                                            setFormData((f) => ({
                                                ...f,
                                                is_active: e.target.checked,
                                            }))
                                        }
                                        className="w-4 h-4 text-[#0d3542] dark:text-[#58a6ff] bg-white border-gray-300 rounded focus:ring-[#0d3542] dark:focus:ring-[#58a6ff]"
                                    />
                                    <div>
                                        <span className="text-xs font-bold uppercase tracking-widest text-gray-900 dark:text-white">
                                            Active Product
                                        </span>
                                        <p className="text-[10px] font-medium text-gray-500 uppercase tracking-widest mt-0.5">
                                            Uncheck to archive
                                        </p>
                                    </div>
                                </label>
                            </div>
                            <div className="p-4 bg-white dark:bg-[#161b22] border border-black/5 dark:border-[#30363d] rounded-xl shadow-sm">
                                <label className="flex items-center gap-4 cursor-pointer">
                                    <input
                                        type="checkbox"
                                        checked={formData.is_service}
                                        onChange={(e) =>
                                            setFormData((f) => ({
                                                ...f,
                                                is_service: e.target.checked,
                                                stock_qty: e.target.checked
                                                    ? ''
                                                    : f.stock_qty,
                                            }))
                                        }
                                        className="w-4 h-4 text-[#0d3542] dark:text-[#58a6ff] bg-white border-gray-300 rounded focus:ring-[#0d3542] dark:focus:ring-[#58a6ff]"
                                    />
                                    <div>
                                        <span className="text-xs font-bold uppercase tracking-widest text-gray-900 dark:text-white">
                                            Service Item
                                        </span>
                                        <p className="text-[10px] font-medium text-gray-500 uppercase tracking-widest mt-0.5">
                                            Does not track stock
                                        </p>
                                    </div>
                                </label>
                            </div>
                        </div>

                        <div className="flex gap-3 pt-4 border-t border-black/5 dark:border-[#30363d]">
                            {editingShoe && (
                                <button
                                    type="button"
                                    onClick={() => {
                                        Swal.fire({
                                            title: 'Delete this shoe?',
                                            text: 'This action cannot be undone.',
                                            icon: 'warning',
                                            showCancelButton: true,
                                            confirmButtonColor: '#ef4444',
                                            cancelButtonColor: '#6b7280',
                                            confirmButtonText: 'Yes, delete it',
                                            background: document.documentElement.classList.contains('dark') ? '#161b22' : '#fff',
                                            color: document.documentElement.classList.contains('dark') ? '#c9d1d9' : '#111',
                                        }).then((result) => {
                                            if (result.isConfirmed) {
                                                deleteMutation.mutate(editingShoe.id);
                                                closeModal();
                                            }
                                        });
                                    }}
                                    className="px-4 py-3 rounded-xl text-gray-500 hover:text-red-500 hover:bg-red-500/10 transition-colors border border-transparent"
                                    title="Delete Shoe"
                                >
                                    <Trash2 size={16} />
                                </button>
                            )}
                            <button
                                type="button"
                                onClick={closeModal}
                                className="flex-1 py-3 rounded-xl text-[11px] font-bold uppercase tracking-widest border border-black/10 dark:border-[#30363d] hover:bg-black/5 dark:hover:bg-white/5 transition-colors"
                            >
                                Cancel
                            </button>
                            <button
                                type="submit"
                                disabled={isSaving}
                                className="flex-[2] py-3 bg-[#0d3542] dark:bg-[#58a6ff] text-white dark:text-black rounded-xl text-[11px] font-bold uppercase tracking-widest hover:opacity-90 transition-opacity disabled:opacity-50 flex items-center justify-center gap-2 shadow-none"
                            >
                                {isSaving ? (
                                    <Loader2 className="animate-spin" size={16} />
                                ) : (
                                    <Save size={16} />
                                )}
                                {editingShoe ? 'Save Changes' : 'Create Shoe'}
                            </button>
                        </div>
                    </form>
                </div>
            </ModernModal>

            {/* --- Floating Command Bar --- */}
            <AnimatePresence>
                {selectedCount > 0 && (
                    <motion.div initial={{ y: 50, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: 50, opacity: 0 }} className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50">
                        <div className="bg-[#fdfdfc] dark:bg-[#111] rounded-xl px-6 h-14 flex items-center gap-4 shadow-xl border border-[#0d3542]/20 dark:border-[#58a6ff]/20 ring-1 ring-inset ring-white/10 dark:ring-black/10 transition-all duration-300">
                            <div className="flex items-center gap-2 pr-4 border-r border-black/10 dark:border-white/10">
                                <div className="bg-[#0d3542] dark:bg-[#58a6ff] text-white dark:text-black text-[10px] font-black h-6 w-6 rounded-md flex items-center justify-center shadow-lg">{selectedCount}</div>
                                <span className="text-[#0d3542] dark:text-[#58a6ff] text-[10px] font-black uppercase tracking-[0.2em] whitespace-nowrap hidden sm:inline">Selected</span>
                            </div>
                            <div className="flex items-center gap-4">
                                <button onClick={handleBulkEditOpen} className="flex items-center gap-1.5 text-gray-500 dark:text-white/40 hover:text-[#0d3542] dark:hover:text-[#58a6ff] transition-colors group">
                                    <Edit size={12} className="group-hover:scale-110 transition-transform" />
                                    <span className="text-[9px] font-black uppercase tracking-[0.2em]">Bulk Edit</span>
                                </button>
                                <div className="w-px h-4 bg-black/10 dark:bg-white/10" />
                                <button onClick={handleBulkDeactivate} className="flex items-center gap-1.5 text-gray-500 dark:text-white/40 hover:text-amber-500 transition-colors group">
                                    <Archive size={12} className="group-hover:scale-110 transition-transform" />
                                    <span className="text-[9px] font-black uppercase tracking-[0.2em]">Deactivate</span>
                                </button>
                                <div className="w-px h-4 bg-black/10 dark:bg-white/10" />
                                <button onClick={handleBulkRestore} className="flex items-center gap-1.5 text-gray-500 dark:text-white/40 hover:text-emerald-500 transition-colors group">
                                    <RefreshCw size={12} className="group-hover:scale-110 transition-transform" />
                                    <span className="text-[9px] font-black uppercase tracking-[0.2em]">Restore</span>
                                </button>
                                <div className="w-px h-4 bg-black/10 dark:bg-white/10" />
                                <button onClick={handleBulkDelete} className="flex items-center gap-1.5 text-gray-500 dark:text-white/40 hover:text-red-500 transition-colors group">
                                    <Trash2 size={12} className="group-hover:scale-110 transition-transform" />
                                    <span className="text-[9px] font-black uppercase tracking-[0.2em]">Delete</span>
                                </button>
                                <div className="w-px h-4 bg-black/10 dark:bg-white/10" />
                                <button onClick={() => setSelectedShoesMap({})} className="text-gray-400 dark:text-white/20 hover:text-gray-900 dark:hover:text-white text-[9px] font-black uppercase tracking-[0.2em]">Clear</button>
                            </div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* --- Bulk Edit Spreadsheet Modal --- */}
            <ModernModal
                isOpen={isBulkEditOpen}
                onClose={() => setIsBulkEditOpen(false)}
                title={`Bulk Edit ${bulkProducts.length} Shoes`}
                maxWidth="max-w-7xl"
                overflowVisible={true}
            >
                <div className="p-6 space-y-6 max-h-[85vh] flex flex-col font-sans">
                    {/* --- Batch Apply Card (Top) --- */}
                    <div className="bg-black/[0.02] dark:bg-[#0d1117] border border-black/5 dark:border-[#30363d] rounded-xl p-4 shrink-0">
                        <h4 className="text-[10px] font-black uppercase tracking-[0.2em] text-[#0d3542] dark:text-[#58a6ff] mb-3 flex items-center gap-2">
                            <Command size={12} />
                            Quick-Apply to All Rows
                        </h4>
                        <div className="grid grid-cols-1 md:grid-cols-5 gap-4 items-end">
                            {/* Category Batch */}
                            <div className="space-y-1 col-span-1 md:col-span-2">
                                <label className="block text-[9px] font-bold text-gray-500 uppercase tracking-widest">
                                    Category
                                </label>
                                <div className="flex items-center bg-white dark:bg-[#161b22] rounded-xl border border-black/10 dark:border-[#30363d] focus-within:border-[#0d3542] dark:focus-within:border-[#58a6ff] overflow-hidden">
                                    <select
                                        value={bulkBatchCategory}
                                        onChange={(e) => setBulkBatchCategory(e.target.value)}
                                        className="flex-1 min-w-0 bg-transparent text-gray-900 dark:text-white px-3 py-2 text-xs font-bold uppercase tracking-wider outline-none border-none cursor-pointer focus:ring-0 focus:outline-none"
                                    >
                                        <option value="">Select Category...</option>
                                        {categories.map((cat, idx) => (
                                            <option key={idx} value={cat}>
                                                {cat}
                                            </option>
                                        ))}
                                    </select>
                                    <button
                                        type="button"
                                        onClick={applyCategoryToAll}
                                        className="px-3 py-2 bg-[#0d3542] dark:bg-[#58a6ff] text-white dark:text-black hover:opacity-90 shrink-0 h-full border-l border-black/10 dark:border-[#30363d] transition-all cursor-pointer flex items-center justify-center"
                                        title="Apply Category to All"
                                    >
                                        <Check size={16} strokeWidth={3} />
                                    </button>
                                </div>
                            </div>

                            {/* Price Batch */}
                            <div className="space-y-1 col-span-1 md:col-span-2">
                                <label className="block text-[9px] font-bold text-gray-500 uppercase tracking-widest">
                                    Price Change
                                </label>
                                <div className="flex items-center bg-white dark:bg-[#161b22] rounded-xl border border-black/10 dark:border-[#30363d] focus-within:border-[#0d3542] dark:focus-within:border-[#58a6ff] overflow-hidden">
                                    <select
                                        value={bulkBatchPriceType}
                                        onChange={(e) => setBulkBatchPriceType(e.target.value)}
                                        className="w-1/3 min-w-[100px] bg-transparent text-gray-900 dark:text-white px-3 py-2 text-xs font-bold uppercase tracking-wider outline-none border-none border-r border-black/10 dark:border-[#30363d] cursor-pointer focus:ring-0 focus:outline-none"
                                    >
                                        <option value="set">Set to $</option>
                                        <option value="fixed_inc">Increase by $</option>
                                        <option value="fixed_dec">Decrease by $</option>
                                        <option value="percent_inc">Increase by %</option>
                                        <option value="percent_dec">Decrease by %</option>
                                    </select>
                                    <input
                                        type="number"
                                        step="0.01"
                                        placeholder="0.00"
                                        value={bulkBatchPriceVal}
                                        onChange={(e) => setBulkBatchPriceVal(e.target.value)}
                                        className="flex-1 bg-transparent text-gray-900 dark:text-white px-3 py-2 text-xs font-bold outline-none border-none focus:ring-0 focus:outline-none"
                                    />
                                    <button
                                        type="button"
                                        onClick={applyPriceToAll}
                                        className="px-3 py-2 bg-[#0d3542] dark:bg-[#58a6ff] text-white dark:text-black hover:opacity-90 shrink-0 h-full border-l border-black/10 dark:border-[#30363d] transition-all cursor-pointer flex items-center justify-center"
                                        title="Apply Price to All"
                                    >
                                        <Check size={16} strokeWidth={3} />
                                    </button>
                                </div>
                            </div>

                            {/* Stock Batch */}
                            <div className="space-y-1">
                                <label className="block text-[9px] font-bold text-gray-500 uppercase tracking-widest">
                                    Stock Level
                                </label>
                                <div className="flex items-center bg-white dark:bg-[#161b22] rounded-xl border border-black/10 dark:border-[#30363d] focus-within:border-[#0d3542] dark:focus-within:border-[#58a6ff] overflow-hidden">
                                    <input
                                        type="number"
                                        placeholder="Reset Qty"
                                        value={bulkBatchStockVal}
                                        onChange={(e) => setBulkBatchStockVal(e.target.value)}
                                        className="flex-1 bg-transparent text-gray-900 dark:text-white px-3 py-2 text-xs font-bold outline-none border-none focus:ring-0 focus:outline-none"
                                    />
                                    <button
                                        type="button"
                                        onClick={applyStockToAll}
                                        className="px-3 py-2 bg-[#0d3542] dark:bg-[#58a6ff] text-white dark:text-black hover:opacity-90 shrink-0 h-full border-l border-black/10 dark:border-[#30363d] transition-all cursor-pointer flex items-center justify-center"
                                        title="Apply Stock to All"
                                    >
                                        <Check size={16} strokeWidth={3} />
                                    </button>
                                </div>
                            </div>
                        </div>

                        {/* Additional Quick Status Toggles */}
                        <div className="flex flex-wrap gap-3 mt-4 pt-3 border-t border-black/5 dark:border-[#30363d]/40">
                            <span className="text-[9px] font-bold text-gray-500 uppercase tracking-widest mr-2 flex items-center">Status Shortcuts:</span>
                            <button
                                type="button"
                                onClick={() => applyActiveStateToAll(true)}
                                className="px-3 py-1.5 bg-green-500/10 hover:bg-green-500/20 text-green-600 dark:text-green-400 border border-green-500/20 rounded-lg text-[10px] font-bold uppercase tracking-wider"
                            >
                                Activate All
                            </button>
                            <button
                                type="button"
                                onClick={() => applyActiveStateToAll(false)}
                                className="px-3 py-1.5 bg-gray-500/10 hover:bg-gray-500/20 text-gray-600 dark:text-gray-400 border border-gray-500/20 rounded-lg text-[10px] font-bold uppercase tracking-wider"
                            >
                                Archive All
                            </button>
                            <button
                                type="button"
                                onClick={() => applyServiceStateToAll(true)}
                                className="px-3 py-1.5 bg-blue-500/10 hover:bg-blue-500/20 text-blue-600 dark:text-blue-400 border border-blue-500/20 rounded-lg text-[10px] font-bold uppercase tracking-wider"
                            >
                                Set All as Service (No Stock)
                            </button>
                            <button
                                type="button"
                                onClick={() => applyServiceStateToAll(false)}
                                className="px-3 py-1.5 bg-amber-500/10 hover:bg-amber-500/20 text-amber-600 dark:text-amber-400 border border-amber-500/20 rounded-lg text-[10px] font-bold uppercase tracking-wider"
                            >
                                Set All as Product (Stock Enabled)
                            </button>
                        </div>
                    </div>

                    {/* --- Spreadsheet Table (Middle) --- */}
                    <div className="flex-1 overflow-auto border border-black/5 dark:border-[#30363d] rounded-xl attire-scrollbar">
                        <table className="w-full text-left border-collapse table-fixed">
                            <thead className="sticky top-0 z-30 bg-gray-50 dark:bg-[#0d1117] border-b border-black/10 dark:border-[#30363d]">
                                <tr>
                                    <th className="w-1/4 px-4 py-3 text-xs font-bold uppercase tracking-widest text-gray-500 dark:text-[#8b949e]/40">Shoe</th>
                                    <th className="w-1/6 px-4 py-3 text-xs font-bold uppercase tracking-widest text-gray-500 dark:text-[#8b949e]/40">SKU</th>
                                    <th className="w-1/6 px-4 py-3 text-xs font-bold uppercase tracking-widest text-gray-500 dark:text-[#8b949e]/40">Category</th>
                                    <th className="w-1/8 px-4 py-3 text-xs font-bold uppercase tracking-widest text-gray-500 dark:text-[#8b949e]/40 text-center">Stock</th>
                                    <th className="w-1/8 px-4 py-3 text-xs font-bold uppercase tracking-widest text-gray-500 dark:text-[#8b949e]/40 text-center">Price ($)</th>
                                    <th className="w-28 px-4 py-3 text-xs font-bold uppercase tracking-widest text-gray-500 dark:text-[#8b949e]/40 text-center">Service?</th>
                                    <th className="w-24 px-4 py-3 text-xs font-bold uppercase tracking-widest text-gray-500 dark:text-[#8b949e]/40 text-center">Active?</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-black/5 dark:divide-[#30363d]">
                                {bulkProducts.map((p, idx) => {
                                    const colorScheme = getCategoryColor(p.category);
                                    return (
                                        <tr key={p.id} className="hover:bg-black/[0.01] dark:hover:bg-white/[0.02]">
                                            {/* Name & Icon */}
                                            <td className="px-4 py-2">
                                                <div className="flex items-center gap-2 truncate">
                                                    <div className={`w-6 h-6 rounded flex items-center justify-center shrink-0 ${colorScheme.bg} border ${colorScheme.border}`}>
                                                        {p.image_path ? (
                                                            <img src={p.image_path} alt={p.name} className="w-full h-full object-cover rounded" />
                                                        ) : (
                                                            React.createElement(getCatIcon(p.category), { size: 12, className: colorScheme.text })
                                                        )}
                                                    </div>
                                                    <span className="font-bold text-xs uppercase tracking-wider text-gray-900 dark:text-[#c9d1d9] truncate">
                                                        {p.name}
                                                    </span>
                                                </div>
                                            </td>

                                            {/* SKU */}
                                            <td className="px-4 py-2">
                                                <input
                                                    type="text"
                                                    value={p.sku}
                                                    onChange={(e) => {
                                                        const val = e.target.value;
                                                        setBulkProducts((prev) =>
                                                            prev.map((item, i) => (i === idx ? { ...item, sku: val } : item))
                                                        );
                                                    }}
                                                    className="w-full bg-white dark:bg-[#161b22] text-gray-900 dark:text-white px-2 py-1 rounded-lg border border-black/10 dark:border-[#30363d] text-xs font-semibold focus:border-[#0d3542] dark:focus:border-[#58a6ff] outline-none"
                                                />
                                            </td>

                                            {/* Category */}
                                            <td className="px-4 py-2">
                                                <select
                                                    value={p.category}
                                                    onChange={async (e) => {
                                                        const val = e.target.value;
                                                        if (val === 'NEW_CATEGORY') {
                                                            const { value: newCat } = await Swal.fire({
                                                                title: 'Create New Category',
                                                                input: 'text',
                                                                inputPlaceholder: 'Enter category name...',
                                                                showCancelButton: true,
                                                                background: document.documentElement.classList.contains('dark') ? '#161b22' : '#fff',
                                                                color: document.documentElement.classList.contains('dark') ? '#c9d1d9' : '#111',
                                                                inputValidator: (value) => {
                                                                    if (!value) return 'You need to write something!';
                                                                }
                                                            });
                                                            if (newCat) {
                                                                const formattedNewCat = newCat.trim().toUpperCase();
                                                                // Dynamically add to products
                                                                setBulkProducts((prev) =>
                                                                    prev.map((item, i) => (i === idx ? { ...item, category: formattedNewCat } : item))
                                                                );
                                                            }
                                                        } else {
                                                            setBulkProducts((prev) =>
                                                                    prev.map((item, i) => (i === idx ? { ...item, category: val } : item))
                                                            );
                                                        }
                                                    }}
                                                    className="w-full bg-white dark:bg-[#161b22] text-gray-900 dark:text-white px-2 py-1 rounded-lg border border-black/10 dark:border-[#30363d] text-xs font-semibold uppercase tracking-wider outline-none"
                                                >
                                                    {categories.map((cat, cIdx) => (
                                                        <option key={cIdx} value={cat}>
                                                            {cat}
                                                        </option>
                                                    ))}
                                                    <option value="NEW_CATEGORY">+ Create New...</option>
                                                </select>
                                            </td>

                                            {/* Stock */}
                                            <td className="px-4 py-2">
                                                <input
                                                    type="number"
                                                    disabled={p.is_service}
                                                    value={p.is_service ? '' : p.stock_qty}
                                                    placeholder={p.is_service ? '∞' : '0'}
                                                    onChange={(e) => {
                                                        const val = e.target.value;
                                                        setBulkProducts((prev) =>
                                                            prev.map((item, i) => (i === idx ? { ...item, stock_qty: val } : item))
                                                        );
                                                    }}
                                                    className="w-full bg-white dark:bg-[#161b22] text-gray-900 dark:text-white px-2 py-1 rounded-lg border border-black/10 dark:border-[#30363d] text-xs text-center font-bold outline-none disabled:opacity-40"
                                                />
                                            </td>

                                            {/* Price */}
                                            <td className="px-4 py-2">
                                                <input
                                                    type="number"
                                                    step="0.01"
                                                    value={p.price}
                                                    onChange={(e) => {
                                                        const val = e.target.value;
                                                        setBulkProducts((prev) =>
                                                            prev.map((item, i) => (i === idx ? { ...item, price: val } : item))
                                                        );
                                                    }}
                                                    className="w-full bg-white dark:bg-[#161b22] text-gray-900 dark:text-white px-2 py-1 rounded-lg border border-black/10 dark:border-[#30363d] text-xs text-center font-bold outline-none"
                                                />
                                            </td>

                                            {/* Service */}
                                            <td className="px-4 py-2 text-center">
                                                <input
                                                    type="checkbox"
                                                    checked={p.is_service}
                                                    onChange={(e) => {
                                                        const checked = e.target.checked;
                                                        setBulkProducts((prev) =>
                                                            prev.map((item, i) =>
                                                                i === idx
                                                                    ? { ...item, is_service: checked, stock_qty: checked ? '' : (item.stock_qty || 0) }
                                                                    : item
                                                            )
                                                        );
                                                    }}
                                                    className="w-4 h-4 text-[#0d3542] dark:text-[#58a6ff] bg-white border-gray-300 rounded focus:ring-[#0d3542] dark:focus:ring-[#58a6ff]"
                                                />
                                            </td>

                                            {/* Active */}
                                            <td className="px-4 py-2 text-center">
                                                <input
                                                    type="checkbox"
                                                    checked={p.is_active}
                                                    onChange={(e) => {
                                                        const checked = e.target.checked;
                                                        setBulkProducts((prev) =>
                                                            prev.map((item, i) => (i === idx ? { ...item, is_active: checked } : item))
                                                        );
                                                    }}
                                                    className="w-4 h-4 text-[#0d3542] dark:text-[#58a6ff] bg-white border-gray-300 rounded focus:ring-[#0d3542] dark:focus:ring-[#58a6ff]"
                                                />
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>

                    {/* --- Footer Buttons (Bottom) --- */}
                    <div className="flex justify-end gap-3 pt-4 border-t border-black/5 dark:border-[#30363d] shrink-0">
                        <button
                            type="button"
                            onClick={() => setIsBulkEditOpen(false)}
                            className="px-5 py-2.5 rounded-xl text-xs font-bold uppercase tracking-widest border border-black/10 dark:border-[#30363d] hover:bg-black/5 dark:hover:bg-white/5 transition-colors"
                        >
                            Cancel
                        </button>
                        <button
                            type="button"
                            disabled={bulkUpdateProductsMutation.isPending}
                            onClick={() => bulkUpdateProductsMutation.mutate(bulkProducts)}
                            className="px-6 py-2.5 bg-[#0d3542] dark:bg-[#58a6ff] text-white dark:text-black rounded-xl text-xs font-bold uppercase tracking-widest hover:opacity-90 disabled:opacity-50 flex items-center gap-2 shadow-none"
                        >
                            {bulkUpdateProductsMutation.isPending ? (
                                <Loader2 size={14} className="animate-spin" />
                            ) : (
                                <Save size={14} />
                            )}
                            Save Changes ({bulkProducts.length} items)
                        </button>
                    </div>
                </div>
            </ModernModal>

            {/* --- Bulk Add Spreadsheet Modal --- */}
            <ModernModal
                isOpen={isBulkAddOpen}
                onClose={() => { setIsBulkAddOpen(false); setBulkAddProducts([]); }}
                title={`Bulk Add Products`}
                icon={ClipboardList}
                maxWidth="max-w-7xl"
                overflowVisible={true}
            >
                <div className="p-6 space-y-6 max-h-[85vh] flex flex-col font-sans">
                    {/* --- Defaults Card (Top) --- */}
                    <div className="bg-black/[0.02] dark:bg-[#0d1117] border border-black/5 dark:border-[#30363d] rounded-xl p-4 shrink-0">
                        <h4 className="text-[10px] font-black uppercase tracking-[0.2em] text-[#0d3542] dark:text-[#58a6ff] mb-3 flex items-center gap-2">
                            <Command size={12} />
                            Default Values (Apply to All Rows)
                        </h4>
                        <div className="grid grid-cols-1 md:grid-cols-5 gap-4 items-end">
                            {/* Category Default */}
                            <div className="space-y-1 col-span-1 md:col-span-2">
                                <label className="block text-[9px] font-bold text-gray-500 uppercase tracking-widest">
                                    Category
                                </label>
                                <select
                                    value={bulkAddDefaultCategory}
                                    onChange={(e) => setBulkAddDefaultCategory(e.target.value)}
                                    className="w-full bg-white dark:bg-[#161b22] text-gray-900 dark:text-white px-3 py-2 rounded-xl border border-black/10 dark:border-[#30363d] text-xs font-bold uppercase tracking-wider outline-none cursor-pointer focus:border-[#0d3542] dark:focus:border-[#58a6ff]"
                                >
                                    <option value="">Select Category...</option>
                                    {categories.map((cat, idx) => (
                                        <option key={idx} value={cat}>{cat}</option>
                                    ))}
                                </select>
                            </div>

                            {/* Price Default */}
                            <div className="space-y-1">
                                <label className="block text-[9px] font-bold text-gray-500 uppercase tracking-widest">
                                    Price ($)
                                </label>
                                <input
                                    type="number"
                                    step="0.01"
                                    placeholder="0.00"
                                    value={bulkAddDefaultPrice}
                                    onChange={(e) => setBulkAddDefaultPrice(e.target.value)}
                                    className="w-full bg-white dark:bg-[#161b22] text-gray-900 dark:text-white px-3 py-2 rounded-xl border border-black/10 dark:border-[#30363d] text-xs font-bold outline-none focus:border-[#0d3542] dark:focus:border-[#58a6ff]"
                                />
                            </div>

                            {/* Stock Default */}
                            <div className="space-y-1">
                                <label className="block text-[9px] font-bold text-gray-500 uppercase tracking-widest">
                                    Stock Qty
                                </label>
                                <input
                                    type="number"
                                    placeholder="0"
                                    value={bulkAddDefaultStock}
                                    onChange={(e) => setBulkAddDefaultStock(e.target.value)}
                                    className="w-full bg-white dark:bg-[#161b22] text-gray-900 dark:text-white px-3 py-2 rounded-xl border border-black/10 dark:border-[#30363d] text-xs font-bold outline-none focus:border-[#0d3542] dark:focus:border-[#58a6ff]"
                                />
                            </div>

                            {/* Apply Button */}
                            <div className="space-y-1">
                                <label className="block text-[9px] font-bold text-transparent uppercase tracking-widest">
                                    Apply
                                </label>
                                <button
                                    type="button"
                                    onClick={applyBulkAddDefaults}
                                    className="w-full px-3 py-2 bg-[#0d3542] dark:bg-[#58a6ff] text-white dark:text-black rounded-xl text-xs font-bold uppercase tracking-widest hover:opacity-90 transition-all flex items-center justify-center gap-1.5"
                                >
                                    <Check size={14} strokeWidth={3} /> Apply to All
                                </button>
                            </div>
                        </div>

                        {/* Service Toggle */}
                        <div className="flex flex-wrap gap-3 mt-4 pt-3 border-t border-black/5 dark:border-[#30363d]/40">
                            <span className="text-[9px] font-bold text-gray-500 uppercase tracking-widest mr-2 flex items-center">Quick Set:</span>
                            <button
                                type="button"
                                onClick={() => {
                                    setBulkAddDefaultService(false);
                                    setBulkAddProducts((prev) => prev.map((p) => ({ ...p, is_service: false })));
                                }}
                                className="px-3 py-1.5 bg-amber-500/10 hover:bg-amber-500/20 text-amber-600 dark:text-amber-400 border border-amber-500/20 rounded-lg text-[10px] font-bold uppercase tracking-wider"
                            >
                                All Products (Stock Enabled)
                            </button>
                            <button
                                type="button"
                                onClick={() => {
                                    setBulkAddDefaultService(true);
                                    setBulkAddProducts((prev) => prev.map((p) => ({ ...p, is_service: true, stock_qty: '' })));
                                }}
                                className="px-3 py-1.5 bg-blue-500/10 hover:bg-blue-500/20 text-blue-600 dark:text-blue-400 border border-blue-500/20 rounded-lg text-[10px] font-bold uppercase tracking-wider"
                            >
                                All Services (No Stock)
                            </button>
                        </div>
                    </div>

                    {/* --- Spreadsheet Table (Middle) --- */}
                    <div className="flex-1 overflow-auto border border-black/5 dark:border-[#30363d] rounded-xl attire-scrollbar">
                        <table className="w-full text-left border-collapse table-fixed">
                            <thead className="sticky top-0 z-30 bg-gray-50 dark:bg-[#0d1117] border-b border-black/10 dark:border-[#30363d]">
                                <tr>
                                    <th className="w-8 px-3 py-3 text-xs font-bold uppercase tracking-widest text-gray-500 dark:text-[#8b949e]/40 text-center">#</th>
                                    <th className="w-1/4 px-4 py-3 text-xs font-bold uppercase tracking-widest text-gray-500 dark:text-[#8b949e]/40">Name</th>
                                    <th className="w-1/6 px-4 py-3 text-xs font-bold uppercase tracking-widest text-gray-500 dark:text-[#8b949e]/40">SKU</th>
                                    <th className="w-1/6 px-4 py-3 text-xs font-bold uppercase tracking-widest text-gray-500 dark:text-[#8b949e]/40">Category</th>
                                    <th className="w-20 px-4 py-3 text-xs font-bold uppercase tracking-widest text-gray-500 dark:text-[#8b949e]/40 text-center">Stock</th>
                                    <th className="w-24 px-4 py-3 text-xs font-bold uppercase tracking-widest text-gray-500 dark:text-[#8b949e]/40 text-center">Price ($)</th>
                                    <th className="w-20 px-4 py-3 text-xs font-bold uppercase tracking-widest text-gray-500 dark:text-[#8b949e]/40 text-center">Service</th>
                                    <th className="w-12 px-2 py-3"></th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-black/5 dark:divide-[#30363d]">
                                {bulkAddProducts.map((p, idx) => {
                                    const colorScheme = getCategoryColor(p.category);
                                    return (
                                        <tr key={p.tempId} className="hover:bg-black/[0.01] dark:hover:bg-white/[0.02]">
                                            {/* Row Number */}
                                            <td className="px-3 py-2 text-center">
                                                <span className="text-[10px] font-black text-gray-400 dark:text-[#8b949e]/40">{idx + 1}</span>
                                            </td>

                                            {/* Name */}
                                            <td className="px-4 py-2">
                                                <input
                                                    type="text"
                                                    value={p.name}
                                                    onChange={(e) => {
                                                        const val = e.target.value;
                                                        setBulkAddProducts((prev) =>
                                                            prev.map((item) => (item.tempId === p.tempId ? { ...item, name: val } : item))
                                                        );
                                                    }}
                                                    placeholder="Product name..."
                                                    className="w-full bg-white dark:bg-[#161b22] text-gray-900 dark:text-white px-2 py-1 rounded-lg border border-black/10 dark:border-[#30363d] text-xs font-bold outline-none focus:border-[#0d3542] dark:focus:border-[#58a6ff] placeholder:text-gray-400 placeholder:font-medium placeholder:normal-case"
                                                />
                                            </td>

                                            {/* SKU */}
                                            <td className="px-4 py-2">
                                                <input
                                                    type="text"
                                                    value={p.sku}
                                                    onChange={(e) => {
                                                        const val = e.target.value;
                                                        setBulkAddProducts((prev) =>
                                                            prev.map((item) => (item.tempId === p.tempId ? { ...item, sku: val } : item))
                                                        );
                                                    }}
                                                    placeholder="SKU"
                                                    className="w-full bg-white dark:bg-[#161b22] text-gray-900 dark:text-white px-2 py-1 rounded-lg border border-black/10 dark:border-[#30363d] text-xs font-semibold outline-none focus:border-[#0d3542] dark:focus:border-[#58a6ff] placeholder:text-gray-400 placeholder:font-medium placeholder:normal-case"
                                                />
                                            </td>

                                            {/* Category */}
                                            <td className="px-4 py-2">
                                                <select
                                                    value={p.category}
                                                    onChange={(e) => {
                                                        const val = e.target.value;
                                                        setBulkAddProducts((prev) =>
                                                            prev.map((item) => (item.tempId === p.tempId ? { ...item, category: val } : item))
                                                        );
                                                    }}
                                                    className="w-full bg-white dark:bg-[#161b22] text-gray-900 dark:text-white px-2 py-1 rounded-lg border border-black/10 dark:border-[#30363d] text-xs font-semibold uppercase tracking-wider outline-none focus:border-[#0d3542] dark:focus:border-[#58a6ff]"
                                                >
                                                    <option value="">—</option>
                                                    {categories.map((cat, cIdx) => (
                                                        <option key={cIdx} value={cat}>{cat}</option>
                                                    ))}
                                                </select>
                                            </td>

                                            {/* Stock */}
                                            <td className="px-4 py-2">
                                                <input
                                                    type="number"
                                                    disabled={p.is_service}
                                                    value={p.is_service ? '' : p.stock_qty}
                                                    placeholder={p.is_service ? '∞' : '0'}
                                                    onChange={(e) => {
                                                        const val = e.target.value;
                                                        setBulkAddProducts((prev) =>
                                                            prev.map((item) => (item.tempId === p.tempId ? { ...item, stock_qty: val } : item))
                                                        );
                                                    }}
                                                    className="w-full bg-white dark:bg-[#161b22] text-gray-900 dark:text-white px-2 py-1 rounded-lg border border-black/10 dark:border-[#30363d] text-xs text-center font-bold outline-none focus:border-[#0d3542] dark:focus:border-[#58a6ff] disabled:opacity-40"
                                                />
                                            </td>

                                            {/* Price */}
                                            <td className="px-4 py-2">
                                                <input
                                                    type="number"
                                                    step="0.01"
                                                    value={p.price}
                                                    onChange={(e) => {
                                                        const val = e.target.value;
                                                        setBulkAddProducts((prev) =>
                                                            prev.map((item) => (item.tempId === p.tempId ? { ...item, price: val } : item))
                                                        );
                                                    }}
                                                    placeholder="0.00"
                                                    className="w-full bg-white dark:bg-[#161b22] text-gray-900 dark:text-white px-2 py-1 rounded-lg border border-black/10 dark:border-[#30363d] text-xs text-center font-bold outline-none focus:border-[#0d3542] dark:focus:border-[#58a6ff] placeholder:text-gray-400 placeholder:font-medium"
                                                />
                                            </td>

                                            {/* Service */}
                                            <td className="px-4 py-2 text-center">
                                                <input
                                                    type="checkbox"
                                                    checked={p.is_service}
                                                    onChange={(e) => {
                                                        const checked = e.target.checked;
                                                        setBulkAddProducts((prev) =>
                                                            prev.map((item) =>
                                                                item.tempId === p.tempId
                                                                    ? { ...item, is_service: checked, stock_qty: checked ? '' : (item.stock_qty || 0) }
                                                                    : item
                                                            )
                                                        );
                                                    }}
                                                    className="w-4 h-4 text-[#0d3542] dark:text-[#58a6ff] bg-white border-gray-300 rounded focus:ring-[#0d3542] dark:focus:ring-[#58a6ff]"
                                                />
                                            </td>

                                            {/* Remove Row */}
                                            <td className="px-2 py-2 text-center">
                                                <button
                                                    type="button"
                                                    onClick={() => removeBulkAddRow(p.tempId)}
                                                    className="p-1 rounded-lg text-gray-300 dark:text-white/20 hover:text-red-500 hover:bg-red-500/10 transition-all"
                                                    title="Remove row"
                                                >
                                                    <X size={14} />
                                                </button>
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>

                    {/* --- Add Row + Footer Buttons --- */}
                    <div className="flex items-center justify-between pt-4 border-t border-black/5 dark:border-[#30363d] shrink-0">
                        <button
                            type="button"
                            onClick={addBulkAddRow}
                            className="flex items-center gap-2 px-4 py-2.5 bg-black/[0.03] dark:bg-white/[0.03] border border-black/10 dark:border-[#30363d] rounded-xl text-xs font-bold uppercase tracking-widest text-gray-600 dark:text-[#8b949e] hover:border-[#0d3542]/40 dark:hover:border-[#58a6ff]/40 hover:text-[#0d3542] dark:hover:text-[#58a6ff] transition-all"
                        >
                            <Plus size={14} /> Add Row
                        </button>
                        <div className="flex gap-3">
                            <button
                                type="button"
                                onClick={() => { setIsBulkAddOpen(false); setBulkAddProducts([]); }}
                                className="px-5 py-2.5 rounded-xl text-xs font-bold uppercase tracking-widest border border-black/10 dark:border-[#30363d] hover:bg-black/5 dark:hover:bg-white/5 transition-colors"
                            >
                                Cancel
                            </button>
                            <button
                                type="button"
                                disabled={bulkAddProductsMutation.isPending || bulkAddProducts.length === 0}
                                onClick={() => {
                                    const hasNames = bulkAddProducts.some((p) => p.name.trim());
                                    if (!hasNames) {
                                        setToast({ message: 'At least one product must have a name.', type: 'error' });
                                        return;
                                    }
                                    const productsToSend = bulkAddProducts.filter((p) => p.name.trim());
                                    bulkAddProductsMutation.mutate(productsToSend);
                                }}
                                className="px-6 py-2.5 bg-[#0d3542] dark:bg-[#58a6ff] text-white dark:text-black rounded-xl text-xs font-bold uppercase tracking-widest hover:opacity-90 disabled:opacity-50 flex items-center gap-2 shadow-none"
                            >
                                {bulkAddProductsMutation.isPending ? (
                                    <Loader2 size={14} className="animate-spin" />
                                ) : (
                                    <Save size={14} />
                                )}
                                Create {bulkAddProducts.filter((p) => p.name.trim()).length} Products
                            </button>
                        </div>
                    </div>
                </div>
            </ModernModal>
        </div>
    );
}
