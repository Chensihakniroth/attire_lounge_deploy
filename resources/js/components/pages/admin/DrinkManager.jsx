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
    Coffee,
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

const DrinkRow = React.memo(
    ({
        drink,
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
        const d = drink;
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
export default function DrinkManager() {
    const queryClient = useQueryClient();
    const { activeOutlet, performanceMode, OUTLET_CONFIG } = useAdmin();

    // State
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isBulkModalOpen, setIsBulkModalOpen] = useState(false);
    const [editingDrink, setEditingDrink] = useState(null);
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
            setEditingDrink(null);
            setFormData({
                sku: '',
                name: '',
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
             const res = await axios.get('/api/v1/admin/pos/products', {
                 params,
                 headers: { 'X-Active-Outlet': activeOutlet },
             });
             return res.data;
         },
         staleTime: 1000 * 15,
         placeholderData: keepPreviousData,
     });

    // Prefetch for inactive outlets to make switching instant
    useEffect(() => {
        const otherOutlets = Object.keys(
            OUTLET_CONFIG || { attire_lounge: 1, caffeine: 1, kravat: 1 }
        ).filter((o) => o !== activeOutlet);
        otherOutlets.forEach((outlet) => {
            queryClient.prefetchQuery({
                queryKey: [
                    'admin-drinks',
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

    const drinks = data?.data || [];
    const meta = data?.meta || {};

    const categories = useMemo(() => {
        const cats = new Set(drinks.map((d) => d.category).filter(Boolean));
        let baseCategories = [];
        // Prepend beverage-specific categories only for caffeine outlet
        if (activeOutlet === 'caffeine') {
            baseCategories = ['Espresso', 'Cold', 'Tea', 'Blend'];
        }
        return [...baseCategories, ...Array.from(cats)]
            .filter((v, i, a) => a.indexOf(v) === i)
            .sort();
    }, [drinks, activeOutlet]);

    const stats = useMemo(
        () => ({
            total: drinks.length,
            lowStock: drinks.filter(
                (d) => d.stock_qty <= 5 && d.stock_qty > 0 && !d.is_service
            ).length,
            outOfStock: drinks.filter((d) => d.stock_qty <= 0 && !d.is_service)
                .length,
            unlimited: drinks.filter((d) => d.is_service).length,
        }),
        [drinks]
    );

    const filteredDrinks = useMemo(() => {
        let result = drinks;
        if (filters.search) {
            const s = filters.search.toLowerCase();
            result = result.filter(
                (d) =>
                    d.name.toLowerCase().includes(s) ||
                    (d.sku && d.sku.toLowerCase().includes(s)) ||
                    (d.category && d.category.toLowerCase().includes(s))
            );
        }
        if (filters.category)
            result = result.filter((d) => d.category === filters.category);
        if (filters.stockStatus === 'low')
            result = result.filter(
                (d) => d.stock_qty <= 5 && d.stock_qty > 0 && !d.is_service
            );
        if (filters.stockStatus === 'out')
            result = result.filter((d) => d.stock_qty <= 0 && !d.is_service);
        return result;
    }, [drinks, filters]);

    const groupedByCategory = useMemo(() => {
        const groups = {};
        filteredDrinks.forEach(d => {
            const cat = d.category || 'Uncategorized';
            if (!groups[cat]) groups[cat] = { name: cat, items: [] };
            groups[cat].items.push(d);
        });
        return Object.values(groups).sort((a, b) => a.name.localeCompare(b.name));
    }, [filteredDrinks]);

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



            if (editingDrink) {
                return axios.put(
                    `/api/v1/admin/pos/products/${editingDrink.id}`,
                    data
                );
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
                detail =
                    ': ' +
                    Object.values(errors)
                        .map((e) => e.join(', '))
                        .join(' | ');
            }
            console.error('Validation Errors:', errors);
            setToast({
                message:
                    (err.response?.data?.message || 'Failed to save drink.') +
                    detail,
                type: 'error',
            });
        },
    });

    const deleteMutation = useMutation({
        mutationFn: async (id) =>
            axios.delete(`/api/v1/admin/pos/products/${id}`),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['admin-drinks'] });
            queryClient.invalidateQueries({ queryKey: ['admin-stats'] });
            setToast({
                message: 'Drink deleted successfully!',
                type: 'success',
            });
            setSelectedIds(new Set());
        },
        onError: (err) => {
            setToast({
                message:
                    err.response?.data?.message || 'Failed to delete drink.',
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
            queryClient.invalidateQueries({ queryKey: ['admin-drinks'] });
            queryClient.invalidateQueries({ queryKey: ['admin-stats'] });
            setToast({
                message: 'Selected drinks deactivated.',
                type: 'success',
            });
            setSelectedIds(new Set());
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
            queryClient.invalidateQueries({ queryKey: ['admin-drinks'] });
            queryClient.invalidateQueries({ queryKey: ['admin-stats'] });
            setToast({ message: 'Selected drinks restored.', type: 'success' });
            setSelectedIds(new Set());
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
            queryClient.invalidateQueries({ queryKey: ['admin-drinks'] });
            queryClient.invalidateQueries({ queryKey: ['admin-stats'] });
            setToast({
                message: `${ids.length} drink(s) permanently deleted.`,
                type: 'success',
            });
            setSelectedIds(new Set());
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
            queryClient.invalidateQueries({ queryKey: ['admin-drinks'] });
            queryClient.invalidateQueries({ queryKey: ['admin-stats'] });
            setQuickEditField(null);
        },
    });

    // Handlers
    const toggleSelect = useCallback((id) => {
        setSelectedIds((prev) => {
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
            setSelectedIds(new Set(filteredDrinks.map((d) => d.id)));
        }
    };

    const handleBulkDeactivate = () => {
        if (!window.confirm(`Deactivate ${selectedIds.size} selected drinks?`))
            return;
        bulkDeactivateMutation.mutate(Array.from(selectedIds));
    };

    const handleBulkRestore = () => {
        if (!window.confirm(`Restore ${selectedIds.size} selected drinks?`))
            return;
        bulkRestoreMutation.mutate(Array.from(selectedIds));
    };

    const handleBulkDelete = () => {
        if (
            !window.confirm(
                `⚠️ PERMANENTLY DELETE ${selectedIds.size} selected drink(s)?\n\nThis action cannot be undone. The products will be removed from the database forever.`
            )
        )
            return;
        bulkDeleteMutation.mutate(Array.from(selectedIds));
    };

    const handleBulkEditOpen = () => {
        const ids = Array.from(selectedIds);
        if (ids.length === 0) return;
        const firstDrink = filteredDrinks.find((d) => ids.includes(d.id));
        if (firstDrink) {
            setEditingDrink(firstDrink);
            setFormData({
                sku: firstDrink.sku || '',
                name: firstDrink.name || '',
                price: firstDrink.price || '',
                stock_qty: firstDrink.stock_qty || '',
                category: firstDrink.category || '',
                is_active: firstDrink.is_active ?? true,
                is_service: firstDrink.is_service || false,
                image_path: firstDrink.image_path || '',
            });
            setIsModalOpen(true);
        }
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
                if (
                    document.activeElement.tagName === 'INPUT' ||
                    document.activeElement.tagName === 'TEXTAREA'
                )
                    return;
                e.preventDefault();
                setFocusedId((prev) => {
                    const idx = filteredDrinks.findIndex((d) => d.id === prev);
                    if (idx === -1) return filteredDrinks[0]?.id;
                    return filteredDrinks[
                        Math.min(idx + 1, filteredDrinks.length - 1)
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
                    const idx = filteredDrinks.findIndex((d) => d.id === prev);
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
                if (
                    focusedId &&
                    document.activeElement.tagName !== 'INPUT' &&
                    !quickEditField
                ) {
                    e.preventDefault();
                    const drink = filteredDrinks.find(
                        (d) => d.id === focusedId
                    );
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
                if (isModalOpen) {
                    closeModal();
                    return;
                }
                if (quickEditField) {
                    setQuickEditField(null);
                    return;
                }
                if (selectedIds.size > 0) {
                    setSelectedIds(new Set());
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
        filteredDrinks,
        focusedId,
        quickEditField,
        toggleSelect,
        isModalOpen,
        closeModal,
        selectedIds,
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
                        Menu
                    </h1>
                    <p className="text-sm text-gray-500 dark:text-[#8b949e]/60 mt-1 uppercase tracking-widest font-medium">
                        Manage beverage inventory, prices, and categories
                    </p>
                </div>

                <div className="flex items-center gap-3">
                    <button
                        onClick={() => {
                            setEditingDrink(null);
                            setFormData({
                                sku: '',
                                name: '',
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
                        <Plus size={14} /> New Drink
                    </button>
                </div>
            </div>

            {/* Quick Stats */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                {[
                    {
                        label: 'Total Drinks',
                        value: stats.total,
                        icon: <Coffee size={20} />,
                        color: 'text-[#0d3542] dark:text-[#58a6ff]',
                    },
                    {
                        label: 'Active Items',
                        value: stats.total - stats.outOfStock,
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
            <div className="flex flex-col md:flex-row gap-4 items-center bg-white dark:bg-[#161b22] p-4 rounded-xl border border-black/5 dark:border-[#30363d] shadow-none">
                <div className="relative flex-1 w-full group">
                    <Search
                        size={18}
                        className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-[#0d3542] dark:group-focus-within:text-[#58a6ff] transition-colors"
                    />
                    <input
                        id="search-drinks"
                        type="text"
                        placeholder="Search drinks... (/)"
                        value={filters.search}
                        onChange={(e) =>
                            setFilters((f) => ({
                                ...f,
                                search: e.target.value,
                            }))
                        }
                        className="w-full bg-black/[0.02] dark:bg-[#0d1117] border border-black/5 dark:border-[#30363d] rounded-lg py-3 pl-12 pr-4 text-sm font-bold uppercase tracking-widest outline-none focus:border-[#0d3542]/50 dark:focus:border-[#58a6ff]/50 transition-all placeholder:text-gray-400 dark:placeholder:text-[#8b949e]/20"
                    />
                </div>
                <div className="flex gap-2 w-full md:w-auto overflow-x-auto pb-1 md:pb-0 hide-scrollbar">
                    <select
                        value={filters.category}
                        onChange={(e) =>
                            setFilters((f) => ({
                                ...f,
                                category: e.target.value,
                            }))
                        }
                        className="px-4 py-3 bg-white dark:bg-[#0d1117] border border-black/5 dark:border-[#30363d] rounded-lg text-xs font-bold uppercase tracking-widest text-gray-500 dark:text-[#8b949e] hover:text-[#0d3542] dark:hover:text-[#58a6ff] transition-all outline-none"
                    >
                        <option value="">All Categories</option>
                        {categories.map((cat) => (
                            <option key={cat} value={cat}>
                                {cat}
                            </option>
                        ))}
                    </select>

                    <select
                        value={filters.stockStatus}
                        onChange={(e) =>
                            setFilters((f) => ({
                                ...f,
                                stockStatus: e.target.value,
                            }))
                        }
                        className="px-4 py-3 bg-white dark:bg-[#0d1117] border border-black/5 dark:border-[#30363d] rounded-lg text-xs font-bold uppercase tracking-widest text-gray-500 dark:text-[#8b949e] hover:text-[#0d3542] dark:hover:text-[#58a6ff] transition-all outline-none"
                    >
                        <option value="">All Stock</option>
                        <option value="low">Low Stock</option>
                        <option value="out">Out of Stock</option>
                    </select>

                    <select
                        value={filters.status}
                        onChange={(e) =>
                            setFilters((f) => ({
                                ...f,
                                status: e.target.value,
                            }))
                        }
                        className="px-4 py-3 bg-white dark:bg-[#0d1117] border border-black/5 dark:border-[#30363d] rounded-lg text-xs font-bold uppercase tracking-widest text-gray-500 dark:text-[#8b949e] hover:text-[#0d3542] dark:hover:text-[#58a6ff] transition-all outline-none"
                    >
                        <option value="active">Active</option>
                        <option value="inactive">Archived</option>
                        <option value="all">All Status</option>
                    </select>
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
                                    className={`w-5 h-5 rounded-md border flex items-center justify-center transition-all mx-auto ${selectedIds.size === filteredDrinks.length && filteredDrinks.length > 0 ? 'bg-[#0d3542] dark:bg-[#58a6ff] border-[#0d3542] dark:border-[#58a6ff]' : 'bg-black/5 dark:bg-[#0d1117] border-black/10 dark:border-[#30363d] hover:border-[#0d3542]/40'}`}
                                >
                                    {selectedIds.size ===
                                        filteredDrinks.length &&
                                        filteredDrinks.length > 0 && (
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
                                Beverage
                            </th>
                            <th className="w-40 px-6 py-5 text-center text-xs font-bold uppercase tracking-[0.2em] text-gray-500 dark:text-[#8b949e]/40 whitespace-nowrap">
                                Category
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
                        {isLoading && drinks.length === 0 ? (
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
                        ) : filteredDrinks.length === 0 ? (
                            <tr>
                                <td
                                    colSpan="7"
                                    className="px-6 py-20 text-center opacity-40"
                                >
                                    <Coffee
                                        size={48}
                                        className="mx-auto mb-4 text-gray-400"
                                    />
                                    <h3 className="text-sm font-bold uppercase tracking-widest text-gray-900 dark:text-white mb-1">
                                        No Drinks Found
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
                                                        const newSet = new Set(selectedIds);
                                                        const allSelected = group.items.every(d => newSet.has(d.id));
                                                        group.items.forEach(d => {
                                                            if (allSelected) newSet.delete(d.id);
                                                            else newSet.add(d.id);
                                                        });
                                                        setSelectedIds(newSet);
                                                    }}
                                                    className={`w-5 h-5 rounded-md border-2 flex items-center justify-center transition-all shrink-0 ${
                                                        group.items.every(d => selectedIds.has(d.id))
                                                            ? 'bg-[#0d3542] dark:bg-[#58a6ff] border-[#0d3542] dark:border-[#58a6ff]'
                                                            : 'border-black/25 dark:border-[#30363d]'
                                                    }`}
                                                >
                                                    {group.items.every(d => selectedIds.has(d.id)) && <Check size={12} className="text-white dark:text-black" />}
                                                </button>
                                                <div className="h-1 w-8 bg-[#0d3542] dark:bg-[#58a6ff] rounded-full" />
                                                <span className="text-[11px] font-black uppercase tracking-[0.25em] text-[#0d3542] dark:text-[#58a6ff]">{group.name}</span>
                                                <span className="px-2 py-0.5 bg-black/10 dark:bg-white/10 text-[9px] font-black text-gray-500 dark:text-white/40 uppercase tracking-widest rounded">{group.items.length} items</span>
                                            </div>
                                        </td>
                                    </tr>
                                    {group.items.map((d) => (
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
                    Showing {filteredDrinks.length} of{' '}
                    {meta.total || drinks.length} drinks
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
                title={editingDrink ? 'Edit Drink' : 'New Drink'}
                icon={Coffee}
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
                                    Drink Image
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
                                    placeholder="Latte, Mocha..."
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
                            {editingDrink && (
                                <button
                                    type="button"
                                    onClick={() => {
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
                                            if (result.isConfirmed) {
                                                deleteMutation.mutate(editingDrink.id);
                                                closeModal();
                                            }
                                        });
                                    }}
                                    className="px-4 py-3 rounded-xl text-gray-500 hover:text-red-500 hover:bg-red-500/10 transition-colors border border-transparent"
                                    title="Delete Drink"
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
                                {editingDrink ? 'Save Changes' : 'Create Drink'}
                            </button>
                        </div>
                    </form>
                </div>
            </ModernModal>

            {/* --- Floating Command Bar --- */}
            <AnimatePresence>
                {selectedIds.size > 0 && (
                    <motion.div initial={{ y: 50, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: 50, opacity: 0 }} className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50">
                        <div className="bg-[#fdfdfc] dark:bg-[#111] rounded-xl px-6 h-14 flex items-center gap-6 shadow-xl border border-[#0d3542]/20 dark:border-[#58a6ff]/20 ring-1 ring-inset ring-white/10 dark:ring-black/10 transition-all duration-300">
                            <div className="flex items-center gap-3 pr-6 border-r border-black/10 dark:border-white/10">
                                <div className="bg-[#0d3542] dark:bg-[#58a6ff] text-white dark:text-black text-[10px] font-black h-6 w-6 rounded-md flex items-center justify-center shadow-lg">{selectedIds.size}</div>
                                <span className="text-[#0d3542] dark:text-[#58a6ff] text-[10px] font-black uppercase tracking-[0.2em] whitespace-nowrap">Selected</span>
                            </div>
                            <div className="flex items-center gap-6">
                                <button onClick={() => setIsBulkModalOpen(true)} className="flex items-center gap-2 text-gray-500 dark:text-white/40 hover:text-[#0d3542] dark:hover:text-[#58a6ff] transition-colors group">
                                    <Command size={12} className="group-hover:scale-110 transition-transform" />
                                    <span className="text-[9px] font-black uppercase tracking-[0.2em]">Bulk Edit</span>
                                </button>
                                <div className="w-px h-4 bg-black/10 dark:bg-white/10" />
                                <button onClick={() => setSelectedIds(new Set())} className="text-gray-400 dark:text-white/20 hover:text-[#0d3542] dark:hover:text-[#58a6ff] text-[9px] font-black uppercase tracking-[0.2em]">Clear</button>
                            </div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* --- Bulk Action Modal --- */}
            <AnimatePresence>
                {isBulkModalOpen && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 z-[100] flex items-center justify-center bg-black/40 dark:bg-black/60 backdrop-blur-sm p-4"
                    >
                        <motion.div
                            initial={{ scale: 0.95, opacity: 0, y: 20 }}
                            animate={{ scale: 1, opacity: 1, y: 0 }}
                            exit={{ scale: 0.95, opacity: 0, y: 20 }}
                            className="bg-[#fdfdfc] dark:bg-[#161b22] w-full max-w-md rounded-2xl shadow-2xl border border-black/10 dark:border-[#30363d] overflow-hidden"
                        >
                            <div className="flex items-center justify-between p-6 border-b border-black/5 dark:border-[#30363d]/50">
                                <h2 className="text-[14px] font-black text-gray-900 dark:text-[#c9d1d9] uppercase tracking-widest flex items-center gap-3">
                                    <Command size={16} className="text-[#0d3542] dark:text-[#58a6ff]" />
                                    Bulk Actions
                                </h2>
                                <button onClick={() => setIsBulkModalOpen(false)} className="text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors">
                                    <X size={18} />
                                </button>
                            </div>
                            <div className="p-6 space-y-6">
                                <p className="text-sm text-gray-500 dark:text-[#8b949e]">
                                    Perform actions on <span className="font-bold text-gray-900 dark:text-white">{selectedIds.size}</span> selected drink{selectedIds.size > 1 ? 's' : ''}.
                                </p>
                                <div className="grid grid-cols-2 gap-3">
                                    {/* ── Edit ── */}
                                    <button
                                        onClick={() => {
                                            handleBulkEditOpen();
                                            setIsBulkModalOpen(false);
                                        }}
                                        className="flex flex-col items-center justify-center gap-3 p-4 rounded-xl border border-black/10 dark:border-[#30363d] bg-black/5 dark:bg-white/5 hover:bg-[#0d3542]/10 dark:hover:bg-[#58a6ff]/10 hover:border-[#0d3542]/30 dark:hover:border-[#58a6ff]/30 hover:text-[#0d3542] dark:hover:text-[#58a6ff] transition-all text-gray-600 dark:text-[#8b949e] group"
                                    >
                                        <Edit size={20} className="group-hover:scale-110 transition-transform" />
                                        <span className="text-[10px] font-black uppercase tracking-widest">Edit</span>
                                    </button>
                                    {/* ── Deactivate ── */}
                                    <button
                                        onClick={() => {
                                            handleBulkDeactivate();
                                            setIsBulkModalOpen(false);
                                        }}
                                        className="flex flex-col items-center justify-center gap-3 p-4 rounded-xl border border-black/10 dark:border-[#30363d] bg-black/5 dark:bg-white/5 hover:bg-amber-500/10 hover:border-amber-500/30 hover:text-amber-500 transition-all text-gray-600 dark:text-[#8b949e] group"
                                    >
                                        <Archive size={20} className="group-hover:scale-110 transition-transform" />
                                        <span className="text-[10px] font-black uppercase tracking-widest">Deactivate</span>
                                    </button>
                                    {/* ── Restore ── */}
                                    <button
                                        onClick={() => {
                                            handleBulkRestore();
                                            setIsBulkModalOpen(false);
                                        }}
                                        className="flex flex-col items-center justify-center gap-3 p-4 rounded-xl border border-black/10 dark:border-[#30363d] bg-black/5 dark:bg-white/5 hover:bg-emerald-500/10 hover:border-emerald-500/30 hover:text-emerald-500 transition-all text-gray-600 dark:text-[#8b949e] group"
                                    >
                                        <RefreshCw size={20} className="group-hover:scale-110 transition-transform" />
                                        <span className="text-[10px] font-black uppercase tracking-widest">Restore</span>
                                    </button>
                                    {/* ── Delete (permanent) ── */}
                                    <button
                                        onClick={() => {
                                            handleBulkDelete();
                                            setIsBulkModalOpen(false);
                                        }}
                                        className="flex flex-col items-center justify-center gap-3 p-4 rounded-xl border border-red-200/60 dark:border-red-900/40 bg-red-50/50 dark:bg-red-900/10 hover:bg-red-500/20 hover:border-red-500/50 hover:text-red-600 dark:hover:text-red-400 transition-all text-red-400 dark:text-red-500/60 group"
                                    >
                                        <AlertTriangle size={20} className="group-hover:scale-110 transition-transform" />
                                        <span className="text-[10px] font-black uppercase tracking-widest">Delete</span>
                                    </button>
                                </div>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}
