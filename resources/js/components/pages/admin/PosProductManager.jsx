import React, { useState, useEffect, useMemo, useRef } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import axios from 'axios';
import { motion, AnimatePresence } from 'framer-motion';
import { 
    X, Plus, Edit, Trash2, 
    Hash, DollarSign, Layers, Check, 
    ChevronDown, Archive, ChevronLeft, ChevronRight, Search, Package,
    Download, Upload, Tag, 
    Command, AlertCircle,
    ArrowUp, ArrowDown, Keyboard, Save, Box, Eye, FolderPlus, Loader2, Printer
} from 'lucide-react';
import { LumaSpin } from '@/components/ui/luma-spin';
import Barcode from 'react-barcode';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { formatPrice } from '@/helpers/format';
import { useAdmin } from './AdminContext';
import { Section, Field, inputBase, SidebarSection } from './common/FormPrimitives';
import BespokeSelect from './pos/BespokeSelect';
import QuickEditCell from './pos/QuickEditCell';
import BarcodePrintModal from './pos/BarcodePrintModal';
const ProductRow = React.memo(({ 
    product, isSelected, isFocused, quickEditField, 
    onToggleSelect, onFocus, onEdit, onDelete, onQuickEdit, onUpdateField,
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
                        {Array.isArray(p.parsed_attributes) && p.parsed_attributes.length > 0 ? (
                            p.parsed_attributes.map((attr, idx) => {
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
    const { performanceMode, activeOutlet } = useAdmin();
    const [view, setView] = useState('list'); // 'list' | 'form'

    // Browser History Integration for Back Button
    useEffect(() => {
        const handlePopState = (event) => {
            if (event.state && event.state.view) {
                setView(event.state.view);
            } else {
                setView('list');
            }
        };

        window.addEventListener('popstate', handlePopState);
        // Push initial state
        if (!window.history.state || !window.history.state.view) {
            window.history.replaceState({ view: 'list' }, '');
        }

        return () => window.removeEventListener('popstate', handlePopState);
    }, []);

    const navigateToView = (newView) => {
        setView(newView);
        if (window.history.state?.view !== newView) {
            window.history.pushState({ view: newView }, '');
        }
    };

    const [selectedProductsMap, setSelectedProductsMap] = useState(new Map());
    const selectedIds = useMemo(() => new Set(selectedProductsMap.keys()), [selectedProductsMap]);
    const [focusedId, setFocusedId] = useState(null);
    const [quickEditField, setQuickEditField] = useState(null); // 'price' | 'stock' | null
    const [isSaving, setIsSaving] = useState(false);
    const [barcodePrintProducts, setBarcodePrintProducts] = useState([]);
    const [currentPage, setCurrentPage] = useState(1);
    const [currentGroupPage, setCurrentGroupPage] = useState(1);
    const pageSize = 200;
    const itemsPerGroupPage = 20;

    // Sidebar Filter States
    const [filters, setFilters] = useState({
        code: '',
        nameBarcode: '',
        attribute: '',
        group: 'ALL GROUPS',
        stockStatus: 'all' // 'all' | 'in' | 'out' | 'low'
    });
    
    // Local State for text inputs (prevents rapid keystrokes from re-rendering the whole table)
    const [localFilters, setLocalFilters] = useState({
        code: '',
        nameBarcode: '',
        attribute: ''
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
    
    // Sync local text inputs to main filters after user stops typing
    useEffect(() => {
        const timer = setTimeout(() => {
            setFilters(prev => ({
                ...prev,
                code: localFilters.code,
                nameBarcode: localFilters.nameBarcode,
                attribute: localFilters.attribute
            }));
        }, 400); // 400ms debounce for typing
        return () => clearTimeout(timer);
    }, [localFilters]);

    // When main filters change, trigger API fetch
    useEffect(() => {
        const timer = setTimeout(() => {
            setDebouncedFilters(filters);
            setCurrentPage(1);
            setCurrentGroupPage(1);
        }, 150); // Fast debounce for dropdown clicks
        return () => clearTimeout(timer);
    }, [filters]);

    // --- Data Fetching ---
    const { data: productsData, isLoading, isError, error } = useQuery({
        queryKey: ['admin-pos-products', activeOutlet, debouncedFilters.nameBarcode, debouncedFilters.code, debouncedFilters.attribute, debouncedFilters.group, currentPage],
        retry: 1,
        staleTime: 2 * 60 * 1000,
        queryFn: async () => {
            const { data } = await axios.get('/api/v1/admin/pos/products', {
                params: { 
                    type: 'all',
                    name: debouncedFilters.nameBarcode,
                    code: debouncedFilters.code,
                    attribute: debouncedFilters.attribute,
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

    const products = useMemo(() => {
        let list = productsData?.data || [];
        
        // Apply Stock Status Filter
        if (filters.stockStatus === 'in') {
            list = list.filter(p => (p.stock_qty || 0) > 0);
        } else if (filters.stockStatus === 'out') {
            list = list.filter(p => (p.stock_qty || 0) <= 0);
        } else if (filters.stockStatus === 'low') {
            list = list.filter(p => (p.stock_qty || 0) > 0 && (p.stock_qty || 0) <= (p.min_stock || 5));
        }
        
        return list;
    }, [productsData, filters.stockStatus]);

    const groupedProducts = useMemo(() => {
        const SIZE_ORDER = ['XXS', 'XS', 'S', 'M', 'L', 'XL', 'XXL', 'XXXL'];
        const groups = {};

        products.forEach(p => {
            const baseName = (p.name || '').trim().toUpperCase();
            if (!groups[baseName]) {
                groups[baseName] = { name: baseName, items: [] };
            }
            groups[baseName].items.push(p);
        });

        // Pre-compute sort keys ONCE per item instead of inside the comparator (O(n log n) -> O(n))
        Object.values(groups).forEach(group => {
            const keyed = group.items.map(p => {
                const attrs = Array.isArray(p.parsed_attributes) ? p.parsed_attributes : [];
                const color = attrs.find(a => a.key?.toUpperCase() === 'COLOR')?.value?.toUpperCase() || '';
                const size  = attrs.find(a => a.key?.toUpperCase() === 'SIZE')?.value?.toUpperCase() || '';
                const sizeIdx = SIZE_ORDER.indexOf(size);
                const sizeNum = parseInt(size);
                return { p, color, size, sizeIdx, sizeNum };
            });

            keyed.sort((a, b) => {
                if (a.color !== b.color) return a.color.localeCompare(b.color);
                if (a.sizeIdx !== -1 && b.sizeIdx !== -1) return a.sizeIdx - b.sizeIdx;
                if (a.sizeIdx !== -1) return -1;
                if (b.sizeIdx !== -1) return 1;
                if (!isNaN(a.sizeNum) && !isNaN(b.sizeNum)) return a.sizeNum - b.sizeNum;
                return a.size.localeCompare(b.size);
            });

            group.items = keyed.map(k => k.p);
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
        Array.from(selectedProductsMap.values()),
    [selectedProductsMap]);

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
        onError: (err) => {
            setIsSaving(false);
            alert('Save failed: ' + (err.response?.data?.message || err.message));
        }
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
            setSelectedProductsMap(new Map());
            setIsBulkDialogOpen(false);
        }
    });

    const bulkArchiveMutation = useMutation({
        mutationFn: (data) => axios.post('/api/v1/admin/pos/products/bulk-deactivate', data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['admin-pos-products'] });
            setSelectedProductsMap(new Map());
            setIsBulkDialogOpen(false);
        }
    });

    const deleteMutation = useMutation({
        mutationFn: (id) => axios.delete(`/api/v1/admin/pos/products/${id}`),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['admin-pos-products'] });
            if (view === 'form') navigateToView('list');
        },
        onError: (err) => {
            alert('Delete failed: ' + (err.response?.data?.message || err.message));
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
                if (selectedIds.size > 0) handleBulkEditClick();
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
                        setSelectedProductsMap(new Map());
                        // Clear both local (visual) and debounced filters
                        setLocalFilters({ code: '', nameBarcode: '', attribute: '' });
                        setFilters(prev => ({ ...prev, nameBarcode: '', code: '', attribute: '' }));
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
        setSelectedProductsMap(prev => {
            const next = new Map(prev);
            if (next.has(id)) {
                next.delete(id);
            } else {
                const product = products.find(p => p.id === id);
                if (product) next.set(id, product);
            }
            return next;
        });
    };

    const handleSelectAll = (e) => {
        const allCurrentSelected = products.length > 0 && products.every(p => selectedProductsMap.has(p.id));
        setSelectedProductsMap(prev => {
            const next = new Map(prev);
            if (allCurrentSelected) {
                products.forEach(p => next.delete(p.id));
            } else {
                products.forEach(p => next.set(p.id, p));
            }
            return next;
        });
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

    const handleBulkEditClick = () => {
        if (selectedIds.size === 0) return;
        
        const selectedProds = products.filter(p => selectedIds.has(p.id));
        if (selectedProds.length === 0) return;
        
        const firstProductName = (selectedProds[0].name || '').trim().toUpperCase();
        const allSameGroup = selectedProds.every(p => (p.name || '').trim().toUpperCase() === firstProductName);
        
        if (allSameGroup && selectedProds.length > 1) {
            // Use the existing Add Product form with pre-loaded data
            setEditingProduct(null);
            setFormData({
                sku: selectedProds[0].sku?.substring(0, 5) || '',
                name: firstProductName,
                price: '',
                stock_qty: '',
                category: selectedProds[0].category || '',
                is_service: false,
                barcode: '',
                status: 'available',
                min_stock: '0',
                max_stock: '99999',
                watch_threshold: false,
                variant: '',
                attributes: []
            });
            
            // Extract attribute dimensions from selected products
            const primaryAttrs = new Set();
            const secondaryAttrs = new Set();
            const editData = {};
            
            let foundPrimaryKey = null;
            let foundSecondaryKey = null;

            selectedProds.forEach(p => {
                let primary = '';
                let secondary = '';
                
                if (Array.isArray(p.parsed_attributes) && p.parsed_attributes.length > 0) {
                    // Extract from explicit attributes if available
                    if (p.parsed_attributes[0]) {
                        primary = (p.parsed_attributes[0].value || '').trim().toUpperCase();
                        if (!foundPrimaryKey && p.parsed_attributes[0].key) foundPrimaryKey = p.parsed_attributes[0].key.toUpperCase();
                    }
                    if (p.parsed_attributes[1]) {
                        secondary = (p.parsed_attributes[1].value || '').trim().toUpperCase();
                        if (!foundSecondaryKey && p.parsed_attributes[1].key) foundSecondaryKey = p.parsed_attributes[1].key.toUpperCase();
                    }
                } else {
                    // Fallback: split variant string by '-' to keep phrases like 'ONE SIZE' or 'LIGHT BLUE' intact
                    const variant = (p.variant || '').trim();
                    const parts = variant.split('-')
                        .map(v => v.trim().toUpperCase())
                        .filter(Boolean);
                    
                    if (parts.length >= 2) {
                        primary = parts[0];
                        secondary = parts[1];
                    } else if (parts.length === 1) {
                        primary = parts[0];
                    }
                }
                
                if (primary) primaryAttrs.add(primary);
                if (secondary) secondaryAttrs.add(secondary);
                
                // Build key for matrix data
                if (primary && secondary) {
                    editData[`${primary}-${secondary}`] = parseInt(p.stock_qty || p.stock || 0);
                } else if (primary) {
                    // Single attribute — key format: "VALUE-QTY" (no secondary column)
                    editData[`${primary}-QTY`] = parseInt(p.stock_qty || p.stock || 0);
                }
            });
            
            // Determine attribute labels
            const primaryVals = Array.from(primaryAttrs);
            const secondaryVals = Array.from(secondaryAttrs);
            
            let primaryKey = foundPrimaryKey || 'ATTRIBUTE';
            let secondaryKey = foundSecondaryKey || '';
            
            const sizeOrder = ['XXS', 'XS', 'S', 'M', 'L', 'XL', 'XXL', 'XXXL', '3XL', '4XL', '5XL', 'ONE SIZE', 'OS'];
            const looksLikeSize = (vals) => vals.some(v => sizeOrder.includes(v) || !isNaN(parseInt(v)));
            
            if (!foundPrimaryKey && secondaryVals.length > 0) {
                // Two dimensions — guess labels if not found in attributes
                primaryKey = looksLikeSize(primaryVals) ? 'SIZE' : 'COLOR';
                secondaryKey = looksLikeSize(secondaryVals) ? 'SIZE' : 'COLOR';
                if (primaryKey === secondaryKey) secondaryKey = 'VARIANT';
            } else if (!foundPrimaryKey && primaryVals.length > 0) {
                // Single dimension guess
                primaryKey = looksLikeSize(primaryVals) ? 'SIZE' : 'ATTRIBUTE';
            }
            
            const sortAttrValues = (vals) => vals.sort((a, b) => {
                const aIdx = sizeOrder.indexOf(a);
                const bIdx = sizeOrder.indexOf(b);
                if (aIdx !== -1 && bIdx !== -1) return aIdx - bIdx;
                if (aIdx !== -1) return -1;
                if (bIdx !== -1) return 1;
                const aNum = parseInt(a);
                const bNum = parseInt(b);
                if (!isNaN(aNum) && !isNaN(bNum)) return aNum - bNum;
                return a.localeCompare(b);
            });
            
            setMatrixConfig({
                primaryKey: primaryKey,
                primaryValues: sortAttrValues(primaryVals).join(', '),
                secondaryKey: secondaryKey || 'SIZE',
                secondaryValues: secondaryVals.length > 0 ? sortAttrValues(secondaryVals).join(', ') : ''
            });
            setMatrixData(editData);
            
            navigateToView('form');
        } else {
            alert('Cannot bulk edit products from different groups in the matrix grid.');
        }
    };

    const handleDeleteClick = (product) => {
        if (!window.confirm(`Delete "${product.name}${product.variant ? ' ' + product.variant : ''}"?\n\nThis action cannot be undone.`)) return;
        deleteMutation.mutate(product.id);
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
            attributes: Array.isArray(product.parsed_attributes) ? product.parsed_attributes : []
        });
        navigateToView('form');
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
        navigateToView('form');
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
            queryClient.invalidateQueries(['admin-pos-products']);
        } catch (err) {
            console.error('Import failed:', err);
            alert('Import failed: ' + (err.response?.data?.message || err.message));
        } finally {
            if (fileInputRef.current) fileInputRef.current.value = '';
        }
    };
    const handlePrintLabels = (productList) => {
        if (!productList || productList.length === 0) return;
        setBarcodePrintProducts(productList);
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
        navigateToView('form');
    };

    const handleSubmit = (e) => {
        if (e) e.preventDefault();
        setIsSaving(true);

        // --- Check if Matrix Grid has data (works regardless of activeTab) ---
        const pVals = (matrixConfig.primaryValues || '').split(',').map(v => v.trim()).filter(Boolean);
        const sVals = (matrixConfig.secondaryValues || '').split(',').map(v => v.trim()).filter(Boolean);
        const hasMatrixEntries = Object.values(matrixData).some(v => parseInt(v) > 0);

        if (hasMatrixEntries && pVals.length > 0 && !editingProduct) {
            // --- Matrix Grid submission (1D or 2D) ---
            const products = [];
            const baseSku = formData.sku || formData.name.substring(0, 5).replace(/\s+/g, '').toUpperCase();

            if (sVals.length > 0) {
                // 2D grid: primary × secondary
                pVals.forEach(p => {
                    sVals.forEach(s => {
                        const qty = parseInt(matrixData[`${p}-${s}`] || 0);
                        if (qty > 0) {
                            products.push({
                                sku: `${baseSku}-${p.toUpperCase()}-${s.toUpperCase()}`,
                                name: formData.name,
                                price: formData.price,
                                stock_qty: qty,
                                category: formData.category,
                                is_service: formData.is_service || false,
                                variant: `-${p.toUpperCase()} -${s.toUpperCase()}`,
                            });
                        }
                    });
                });
            } else {
                // 1D grid: primary only (single attribute products)
                pVals.forEach(p => {
                    const qty = parseInt(matrixData[`${p}-QTY`] || 0);
                    if (qty > 0) {
                        products.push({
                            sku: `${baseSku}-${p.toUpperCase()}`,
                            name: formData.name,
                            price: formData.price,
                            stock_qty: qty,
                            category: formData.category,
                            is_service: formData.is_service || false,
                            variant: `-${p.toUpperCase()}`,
                        });
                    }
                });
            }

            if (products.length === 0) {
                alert('Please enter quantities in the matrix.');
                setIsSaving(false);
                return;
            }

            bulkStoreMutation.mutate({ products });
            return;
        }

        // --- Single product submission ---
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

    // --- Matrix Grid (render function, NOT a component — prevents focus loss) ---
    const matrixPresets = {
        sizes: 'S, M, L, XL, XXL',
        numbers: '28, 30, 32, 34, 36, 38',
        colors: 'BLACK, WHITE, NAVY, GREY, BEIGE'
    };

    const applyMatrixPreset = (key, val) => {
        setMatrixConfig(prev => ({ ...prev, [key]: val }));
    };

    const updateMatrixQty = (p, s, qty) => {
        setMatrixData(prev => ({ ...prev, [`${p}-${s}`]: qty }));
    };

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

    const renderMatrixGrid = () => {
        const pVals = (matrixConfig.primaryValues || '').split(',').map(v => v.trim()).filter(Boolean);
        const sVals = (matrixConfig.secondaryValues || '').split(',').map(v => v.trim()).filter(Boolean);
        const is1D = pVals.length > 0 && sVals.length === 0;
        const is2D = pVals.length > 0 && sVals.length > 0;

        const totalToCreate = Object.values(matrixData).filter(v => parseInt(v) > 0).length;

        return (
            <div className="space-y-16 animate-in fade-in slide-in-from-bottom-4 duration-500">
                {/* Configuration Area */}
                <div className="grid grid-cols-2 gap-16">
                    {/* Primary Attribute */}
                    <div className="space-y-6">
                        <div className="flex items-center justify-between px-1">
                            <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Primary (e.g. SIZE)</label>
                            <div className="flex gap-2">
                                <button type="button" onClick={() => applyMatrixPreset('primaryValues', matrixPresets.colors)} className="text-[9px] font-black text-[#0d3542] dark:text-[#58a6ff] hover:underline uppercase tracking-tighter">Colors</button>
                                <span className="text-gray-300">|</span>
                                <button type="button" onClick={() => applyMatrixPreset('primaryValues', matrixPresets.sizes)} className="text-[9px] font-black text-[#0d3542] dark:text-[#58a6ff] hover:underline uppercase tracking-tighter">Sizes</button>
                            </div>
                        </div>
                        <input 
                            value={matrixConfig.primaryKey} 
                            onChange={e => setMatrixConfig(prev => ({...prev, primaryKey: e.target.value.toUpperCase()}))} 
                            className="w-full bg-black/5 dark:bg-white/5 p-5 text-[13px] font-black outline-none border border-black/15 dark:border-white/10 focus:border-[#0d3542] dark:focus:border-[#58a6ff] rounded-2xl transition-all" 
                            placeholder="ATTRIBUTE NAME"
                        />
                        <textarea 
                            placeholder="Enter values separated by commas..." 
                            value={matrixConfig.primaryValues} 
                            onChange={e => setMatrixConfig(prev => ({...prev, primaryValues: e.target.value}))} 
                            className="w-full bg-black/5 dark:bg-white/5 p-5 text-[13px] font-bold outline-none border border-black/15 dark:border-white/10 focus:border-[#0d3542] dark:focus:border-[#58a6ff] rounded-2xl min-h-24 attire-scrollbar uppercase" 
                        />
                    </div>

                    {/* Secondary Attribute (Optional) */}
                    <div className="space-y-6">
                        <div className="flex items-center justify-between px-1">
                            <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Secondary — Optional (e.g. COLOR)</label>
                            <div className="flex gap-2">
                                <button type="button" onClick={() => applyMatrixPreset('secondaryValues', matrixPresets.sizes)} className="text-[9px] font-black text-[#0d3542] dark:text-[#58a6ff] hover:underline uppercase tracking-tighter">Sizes</button>
                                <span className="text-gray-300">|</span>
                                <button type="button" onClick={() => applyMatrixPreset('secondaryValues', matrixPresets.numbers)} className="text-[9px] font-black text-[#0d3542] dark:text-[#58a6ff] hover:underline uppercase tracking-tighter">Numbers</button>
                            </div>
                        </div>
                        <input 
                            value={matrixConfig.secondaryKey} 
                            onChange={e => setMatrixConfig(prev => ({...prev, secondaryKey: e.target.value.toUpperCase()}))} 
                            className="w-full bg-black/5 dark:bg-white/5 p-5 text-[13px] font-black outline-none border border-black/15 dark:border-white/10 focus:border-[#0d3542] dark:focus:border-[#58a6ff] rounded-2xl transition-all" 
                            placeholder="ATTRIBUTE NAME"
                        />
                        <textarea 
                            placeholder="Leave empty for single-attribute grid..." 
                            value={matrixConfig.secondaryValues} 
                            onChange={e => setMatrixConfig(prev => ({...prev, secondaryValues: e.target.value}))} 
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
                        {formData.name || 'PRODUCT'} {is2D ? `- [${matrixConfig.primaryKey}] - [${matrixConfig.secondaryKey}]` : is1D ? `- [${matrixConfig.primaryKey}]` : '- [VALUE1] - [VALUE2]'} → <span className="text-[#0d3542] dark:text-[#58a6ff] font-bold">
                            {(formData.sku || (formData.name || 'PROD').substring(0, 5)).toUpperCase()}-{pVals[0] || 'VAL1'}{is2D ? `-${sVals[0] || 'VAL2'}` : ''}
                        </span>
                    </p>
                </div>

                {/* The Matrix Grid — 2D (rows × columns) */}
                {is2D ? (
                    <div className="space-y-6 animate-in zoom-in-95 duration-500">
                        <div className="flex items-center gap-4">
                            <div className="h-1 w-10 bg-[#0d3542] dark:bg-[#58a6ff] rounded-full" />
                            <h3 className="text-xs font-black uppercase tracking-[0.4em] text-[#0d3542] dark:bg-[#58a6ff]">Stock Grid</h3>
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
                                                        onChange={e => updateMatrixQty(p, s, e.target.value)}
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
                ) : is1D ? (
                    /* The Matrix Grid — 1D (single attribute, flat list) */
                    <div className="space-y-6 animate-in zoom-in-95 duration-500">
                        <div className="flex items-center gap-4">
                            <div className="h-1 w-10 bg-[#0d3542] dark:bg-[#58a6ff] rounded-full" />
                            <h3 className="text-xs font-black uppercase tracking-[0.4em] text-[#0d3542] dark:text-[#58a6ff]">Stock List</h3>
                            <span className="text-[9px] font-bold text-gray-400 uppercase tracking-widest ml-2">Single attribute mode</span>
                        </div>
                        
                        <div className="overflow-x-auto border-2 border-black/15 dark:border-white/5 rounded-[2rem] bg-white dark:bg-[#0d1117] shadow-xl">
                            <table className="w-full border-collapse">
                                <thead>
                                    <tr>
                                        <th className="p-6 border-b-2 border-r-2 border-black/15 dark:border-white/10 text-[9px] font-black uppercase tracking-[0.2em] text-gray-400 bg-black/[0.02] dark:bg-white/[0.02] sticky left-0 z-10 min-w-40">
                                            {matrixConfig.primaryKey}
                                        </th>
                                        <th className="p-6 border-b-2 border-black/15 dark:border-white/10 text-[11px] font-black uppercase tracking-[0.1em] text-[#0d3542] dark:text-[#58a6ff] min-w-36">
                                            QTY
                                        </th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {pVals.map((p, rIdx) => (
                                        <tr key={p} className="group">
                                            <td className="p-6 border-r-2 border-black/15 dark:border-white/10 text-[11px] font-black uppercase tracking-wider text-[#0d3542] dark:text-[#58a6ff] bg-black/[0.01] dark:bg-white/[0.01] group-hover:bg-black/[0.03] dark:group-hover:bg-white/[0.03] transition-colors sticky left-0 z-10">
                                                {p}
                                            </td>
                                            <td className="p-2 border-b border-black/15 dark:border-white/5 group-hover:bg-black/[0.01] dark:group-hover:bg-white/[0.01] transition-colors">
                                                <input 
                                                    type="number" 
                                                    data-pos={`${rIdx}-0`}
                                                    value={matrixData[`${p}-QTY`] || ''} 
                                                    onChange={e => updateMatrixQty(p, 'QTY', e.target.value)}
                                                    onKeyDown={e => handleGridKeyDown(e, rIdx, 0)}
                                                    className="w-full bg-black/5 dark:bg-white/5 border-2 border-transparent p-4 text-center font-mono font-black text-lg rounded-xl focus:border-[#0d3542] dark:focus:border-[#58a6ff] focus:bg-white dark:focus:bg-[#161b22] outline-none transition-all placeholder:text-gray-300 dark:placeholder:text-white/5 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                                                    placeholder="0"
                                                />
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                        <div className="flex items-center justify-center gap-6">
                            <div className="flex items-center gap-2">
                                <Keyboard size={14} className="text-gray-400" />
                                <span className="text-[9px] font-bold text-gray-400 uppercase tracking-widest">Use arrow keys to navigate</span>
                            </div>
                            <div className="w-1.5 h-1.5 rounded-full bg-gray-200" />
                            <span className="text-[9px] font-bold text-gray-400 uppercase tracking-widest">Only entries with stock will be created</span>
                        </div>
                    </div>
                ) : (
                    <div className="py-20 text-center border-2 border-dashed border-black/15 dark:border-white/5 rounded-[3rem] bg-black/[0.01] dark:bg-white/[0.01]">
                        <Layers size={40} className="mx-auto text-gray-300 mb-4 opacity-20" />
                        <p className="text-[11px] font-black text-gray-400 uppercase tracking-[0.3em]">Enter primary attribute values to unlock the grid</p>
                    </div>
                )}
            </div>
        );
    };

    return (
        <div className="flex flex-row w-full h-full bg-background dark:bg-[#111111] font-sans selection:bg-[#0d3542]/20 relative text-gray-900 dark:text-white transition-colors duration-300">
            
            {/* --- Persistent Sidebar Filter Hub --- */}
            <div className="w-[280px] shrink-0 flex flex-col p-0 border-r-2 border-black/15 dark:border-[#30363d] bg-[#fdfdfc] dark:bg-[#0d1117] transition-colors sticky top-0 h-screen z-50 overflow-hidden">
                <div className="p-5 border-b-2 border-black/15 dark:border-[#30363d] bg-[#fdfdfc] dark:bg-[#0d1117]">
                    <div className="space-y-3">
                        <Button 
                            onClick={handleAddClick}
                            className="w-full bg-[#0d3542] dark:bg-[#58a6ff] text-white dark:text-black hover:opacity-90 text-[10px] font-black uppercase tracking-[0.2em] h-11 shadow-none rounded-xl"
                        >
                            <Plus size={14} className="mr-2" /> Add Product
                        </Button>
                        <div className="flex gap-2">
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
                                className="flex-1 h-10 border border-black/15 dark:border-[#30363d] text-[9px] font-black uppercase tracking-widest text-gray-400 dark:text-[#8b949e] hover:bg-black/5 dark:hover:bg-white/5 rounded-xl transition-all"
                            >
                                <Download size={12} className="mr-1.5" /> Export
                            </Button>
                            <Button 
                                onClick={() => fileInputRef.current?.click()}
                                variant="outline" 
                                className="flex-1 h-10 border border-black/15 dark:border-[#30363d] text-[9px] font-black uppercase tracking-widest text-gray-400 dark:text-[#8b949e] hover:bg-black/5 dark:hover:bg-white/5 rounded-xl transition-all"
                            >
                                <Upload size={12} className="mr-1.5" /> Import
                            </Button>
                        </div>
                    </div>
                </div>

                <div className="flex-1 overflow-y-hidden">
                    <SidebarSection title="Search" icon={Search}>
                        <div className="space-y-3">
                            <div className="group relative">
                                <input 
                                    type="text"
                                    value={localFilters.code}
                                    onChange={e => setLocalFilters({...localFilters, code: e.target.value.toUpperCase()})}
                                    className="w-full bg-white dark:bg-[#161b22] border-2 border-black/15 dark:border-[#30363d] focus:border-[#0d3542] dark:focus:border-[#58a6ff] pl-10 pr-4 py-3 text-[12px] font-bold tracking-widest outline-none transition-all uppercase text-gray-900 dark:text-white placeholder:text-gray-300 dark:placeholder:text-[#8b949e]/10 rounded-xl"
                                    placeholder="CODE..."
                                />
                                <Hash size={12} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
                            </div>
                            <div className="group relative">
                                <input 
                                    id="filter-name"
                                    type="text"
                                    value={localFilters.nameBarcode}
                                    onChange={e => setLocalFilters({...localFilters, nameBarcode: e.target.value})}
                                    className="w-full bg-white dark:bg-[#161b22] border-2 border-black/15 dark:border-[#30363d] focus:border-[#0d3542] dark:focus:border-[#58a6ff] pl-10 pr-4 py-3 text-[12px] font-bold outline-none transition-all uppercase text-gray-900 dark:text-white placeholder:text-gray-300 dark:placeholder:text-[#8b949e]/10 rounded-xl"
                                    placeholder="NAME..."
                                />
                                <Tag size={12} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
                            </div>
                            <div className="group relative">
                                <input 
                                    type="text"
                                    value={localFilters.attribute}
                                    onChange={e => setLocalFilters({...localFilters, attribute: e.target.value.toUpperCase()})}
                                    className="w-full bg-white dark:bg-[#161b22] border-2 border-black/15 dark:border-[#30363d] focus:border-[#0d3542] dark:focus:border-[#58a6ff] pl-10 pr-4 py-3 text-[12px] font-bold outline-none transition-all uppercase text-gray-900 dark:text-white placeholder:text-gray-300 dark:placeholder:text-[#8b949e]/10 rounded-xl"
                                    placeholder="ATTR..."
                                />
                                <Layers size={12} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
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

                    <SidebarSection title="Stock Status" icon={Package}>
                        <BespokeSelect 
                            value={filters.stockStatus === 'all' ? 'ALL STOCK' : 
                                   filters.stockStatus === 'in' ? 'IN STOCK' : 
                                   filters.stockStatus === 'out' ? 'OUT OF STOCK' : 'LOW STOCK'}
                            options={[
                                { label: 'ALL STOCK', value: 'all' },
                                { label: 'IN STOCK', value: 'in' },
                                { label: 'OUT OF STOCK', value: 'out' },
                                { label: 'LOW STOCK', value: 'low' }
                            ]}
                            onChange={val => setFilters({...filters, stockStatus: val})}
                            direction="up"
                        />
                    </SidebarSection>
                </div>
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
                                                                                        const isGroupSelected = group.items.every(p => selectedProductsMap.has(p.id));
                                                                                        setSelectedProductsMap(prev => {
                                                                                            const next = new Map(prev);
                                                                                            group.items.forEach(p => {
                                                                                                if (isGroupSelected) next.delete(p.id);
                                                                                                else next.set(p.id, p);
                                                                                            });
                                                                                            return next;
                                                                                        });
                                                                                    }}
                                                                                    className={`w-5 h-5 rounded-md border-2 flex items-center justify-center transition-all ${group.items.every(p => selectedIds.has(p.id)) ? 'bg-[#0d3542] dark:bg-[#58a6ff] border-[#0d3542] dark:border-[#58a6ff]' : 'border-black/25 dark:border-[#30363d]'}`}
                                                                                >
                                                                                    {group.items.every(p => selectedIds.has(p.id)) && <Check size={12} className="text-white dark:text-black" />}
                                                                                </button>
                                                                                <div className="h-1 w-8 bg-[#0d3542] dark:bg-[#58a6ff] rounded-full" />
                                                                                <span className="text-[12px] font-black uppercase tracking-[0.3em] text-[#0d3542] dark:text-[#58a6ff]">{group.name}</span>
                                                                                <span className="px-2 py-0.5 bg-black/10 dark:bg-white/10 text-[9px] font-black text-gray-500 dark:text-white/40 uppercase tracking-widest rounded">{group.items.length} variants</span>
                                                                            </div>
                                                                            <div className="flex items-center gap-2">
                                                                                <button 
                                                                                    onClick={() => handlePrintLabels(group.items)}
                                                                                    className="flex items-center gap-2 px-3 py-1.5 bg-black/5 dark:bg-white/5 text-gray-500 dark:text-white/40 hover:text-[#0d3542] dark:hover:text-[#58a6ff] text-[9px] font-black uppercase tracking-widest rounded-lg hover:bg-[#0d3542]/10 dark:hover:bg-[#58a6ff]/10 transition-all border border-black/10 dark:border-white/10"
                                                                                    title="Print barcode labels for this group"
                                                                                >
                                                                                    <Printer size={12} /> Print Labels
                                                                                </button>
                                                                                <button 
                                                                                    onClick={() => handleAddSimilar(group)}
                                                                                    className="flex items-center gap-2 px-3 py-1.5 bg-[#0d3542] dark:bg-[#58a6ff] text-white dark:text-black text-[9px] font-black uppercase tracking-widest rounded-lg hover:opacity-90 transition-all"
                                                                                >
                                                                                    <Plus size={12} /> Add Similar
                                                                                </button>
                                                                            </div>
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
                                                                        onDelete={handleDeleteClick}
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
                                        onClick={() => window.history.back()}
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
                                    {editingProduct && (
                                        <Button
                                            variant="outline"
                                            onClick={() => handleDeleteClick(editingProduct)}
                                            disabled={deleteMutation.isPending}
                                            className="h-12 px-6 text-[11px] font-black uppercase tracking-[0.2em] border-red-500/30 text-red-500 hover:bg-red-500 hover:text-white hover:border-red-500 rounded-xl transition-all"
                                        >
                                            <Trash2 size={14} className="mr-2" />
                                            DELETE
                                        </Button>
                                    )}
                                    <Button onClick={handleSubmit} disabled={isSaving} className="h-12 px-10 bg-[#0d3542] dark:bg-[#58a6ff] text-white dark:text-black text-[11px] font-black uppercase tracking-[0.2em] shadow-lg ring-1 ring-inset ring-white/10 dark:ring-black/10 hover:opacity-90 transition-all rounded-xl">
                                        {isSaving ? <Loader2 className="animate-spin mr-2" size={16} /> : <Save size={14} className="mr-2" />}
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
                                            {renderMatrixGrid()}
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

                                    <Section title="Status & Visibility" icon={Eye}>
                                        <div className="space-y-3">
                                            <div className="p-4 bg-white dark:bg-[#161b22] border border-black/5 dark:border-[#30363d] rounded-xl shadow-sm">
                                                <label className="flex items-center gap-3 cursor-pointer">
                                                    <input type="checkbox" checked={formData.is_active} onChange={e => setFormData(f => ({ ...f, is_active: e.target.checked }))} className="w-4 h-4 text-[#0d3542] dark:text-[#58a6ff] bg-white border-gray-300 rounded focus:ring-[#0d3542] dark:focus:ring-[#58a6ff]" />
                                                    <div>
                                                        <span className="text-xs font-bold uppercase tracking-widest text-gray-900 dark:text-white">Active Product</span>
                                                        <p className="text-[10px] font-medium text-gray-500 uppercase tracking-widest mt-0.5">Uncheck to archive</p>
                                                    </div>
                                                </label>
                                            </div>
                                            <div className="p-4 bg-white dark:bg-[#161b22] border border-black/5 dark:border-[#30363d] rounded-xl shadow-sm">
                                                <label className="flex items-center gap-3 cursor-pointer">
                                                    <input type="checkbox" checked={formData.is_service} onChange={e => setFormData(f => ({ ...f, is_service: e.target.checked, stock_qty: e.target.checked ? '' : f.stock_qty }))} className="w-4 h-4 text-[#0d3542] dark:text-[#58a6ff] bg-white border-gray-300 rounded focus:ring-[#0d3542] dark:focus:ring-[#58a6ff]" />
                                                    <div>
                                                        <span className="text-xs font-bold uppercase tracking-widest text-gray-900 dark:text-white">Service Item</span>
                                                        <p className="text-[10px] font-medium text-gray-500 uppercase tracking-widest mt-0.5">Does not track stock</p>
                                                    </div>
                                                </label>
                                            </div>
                                        </div>
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
                    <motion.div initial={{ y: 50, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: 50, opacity: 0 }} className="fixed bottom-6 left-1/2 -translate-x-1/2 z-80">
                        <div className="bg-[#fdfdfc] dark:bg-[#111] rounded-xl px-6 h-14 flex items-center gap-6 shadow-xl border border-[#0d3542]/20 dark:border-[#58a6ff]/20 ring-1 ring-inset ring-white/10 dark:ring-black/10 transition-all duration-300">
                            <div className="flex items-center gap-3 pr-6 border-r border-black/10 dark:border-white/10">
                                <div className="bg-[#0d3542] dark:bg-[#58a6ff] text-white dark:text-black text-[10px] font-black h-6 w-6 rounded-md flex items-center justify-center shadow-lg">{selectedIds.size}</div>
                                <span className="text-[#0d3542] dark:text-[#58a6ff] text-[10px] font-black uppercase tracking-[0.2em] whitespace-nowrap">Selected</span>
                            </div>
                            <div className="flex items-center gap-6">
                                <button onClick={handleBulkEditClick} className="flex items-center gap-2 text-gray-500 dark:text-white/40 hover:text-[#0d3542] dark:hover:text-[#58a6ff] transition-colors group">
                                    <Command size={12} className="group-hover:scale-110 transition-transform" />
                                    <span className="text-[9px] font-black uppercase tracking-[0.2em]">Bulk Edit</span>
                                </button>
                                <div className="w-px h-4 bg-black/10 dark:bg-white/10" />
                                <button onClick={() => handlePrintLabels(selectedProducts)} className="flex items-center gap-2 text-gray-500 dark:text-white/40 hover:text-[#0d3542] dark:hover:text-[#58a6ff] transition-colors group">
                                    <Printer size={12} className="group-hover:scale-110 transition-transform" />
                                    <span className="text-[9px] font-black uppercase tracking-[0.2em]">Print Labels</span>
                                </button>
                                <div className="w-px h-4 bg-black/10 dark:bg-white/10" />
                                <button
                                    onClick={() => {
                                        const count = selectedIds.size;
                                        if (!window.confirm(`Delete ${count} selected product${count > 1 ? 's' : ''}?\n\nThis action cannot be undone.`)) return;
                                        Promise.all(
                                            Array.from(selectedIds).map(id => axios.delete(`/api/v1/admin/pos/products/${id}`))
                                        ).then(() => {
                                            queryClient.invalidateQueries({ queryKey: ['admin-pos-products'] });
                                            setSelectedProductsMap(new Map());
                                        }).catch(err => alert('Delete failed: ' + (err.response?.data?.message || err.message)));
                                    }}
                                    className="flex items-center gap-2 text-red-400 hover:text-red-500 transition-colors group"
                                >
                                    <Trash2 size={12} className="group-hover:scale-110 transition-transform" />
                                    <span className="text-[9px] font-black uppercase tracking-[0.2em]">Delete</span>
                                </button>
                                <div className="w-px h-4 bg-black/10 dark:bg-white/10" />
                                <button onClick={() => setSelectedProductsMap(new Map())} className="text-gray-400 dark:text-white/20 hover:text-[#0d3542] dark:hover:text-[#58a6ff] text-[9px] font-black uppercase tracking-[0.2em]">Clear</button>
                            </div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            <AnimatePresence>
                {barcodePrintProducts.length > 0 && (
                    <BarcodePrintModal 
                        products={barcodePrintProducts} 
                        onClose={() => setBarcodePrintProducts([])} 
                        formatPrice={formatPrice} 
                    />
                )}
            </AnimatePresence>

        </div>
    );
};

export default ProductsPage;
