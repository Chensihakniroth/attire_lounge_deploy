import React, { useState, useEffect, useMemo, useRef } from 'react';
import { Package, AlertTriangle, CheckCircle, XCircle, Download, Plus, Pencil, Trash2, X, Upload } from 'lucide-react';
import { LumaSpin } from '../../ui/luma-spin';
import giftOptionsFallback from '../../../data/giftOptions';
import axios from 'axios';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import OptimizedImage from '../../common/OptimizedImage.jsx';
import { motion } from 'framer-motion';
import { useAdmin } from './AdminContext';
import { downloadCSV } from '@/utils/csvExport';
import { useToast } from '@/components/ui/toast';

const CATEGORIES = [
    { key: 'ties', label: 'Ties' },
    { key: 'pocket_squares', label: 'Pocket Squares' },
    { key: 'boxes', label: 'Gift Boxes' },
];

const EMPTY_FORM = { id: null, name: '', category: 'ties', color: '', price: '', image: '' };

const GiftItemModal = ({ open, onClose, form, setForm, onSubmit, saving }) => {
    const { toast } = useToast();
    const fileRef = useRef(null);
    const [uploading, setUploading] = useState(false);

    if (!open) return null;

    const set = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }));

    const handleFile = async (e) => {
        const file = e.target.files?.[0];
        if (!file) return;
        const body = new FormData();
        body.append('image', file);
        setUploading(true);
        try {
            const { data } = await axios.post('/api/v1/admin/images/upload', body, {
                headers: { 'Content-Type': 'multipart/form-data' },
            });
            setForm((f) => ({ ...f, image: data.url }));
            toast.success('Image uploaded');
        } catch (err) {
            toast.error(err.response?.data?.message || 'Image upload failed');
        } finally {
            setUploading(false);
            if (fileRef.current) fileRef.current.value = '';
        }
    };

    const inputCls =
        'w-full bg-white dark:bg-[#161b22] border border-black/[0.08] dark:border-[#30363d] rounded-lg px-3 py-2 text-sm text-gray-900 dark:text-[#c9d1d9] outline-none focus:border-[#0d3542]/50 dark:focus:border-[#58a6ff]/50 transition-colors';

    return (
        <div className="fixed inset-0 z-[120] flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />
            <div className="relative w-full max-w-md bg-white dark:bg-[#0d1117] border border-black/[0.08] dark:border-[#30363d] rounded-2xl shadow-2xl overflow-hidden">
                <div className="flex items-center justify-between px-5 py-4 border-b border-black/[0.06] dark:border-[#30363d]">
                    <h3 className="text-sm font-bold uppercase tracking-widest text-gray-900 dark:text-[#c9d1d9]">
                        {form.id ? 'Edit Item' : 'Add Item'}
                    </h3>
                    <button onClick={onClose} className="text-gray-400 hover:text-gray-700 dark:hover:text-[#c9d1d9] transition-colors">
                        <X size={16} />
                    </button>
                </div>

                <form
                    onSubmit={(e) => { e.preventDefault(); onSubmit(); }}
                    className="p-5 space-y-4 max-h-[70vh] overflow-y-auto"
                >
                    <div className="space-y-1.5">
                        <label className="text-[10px] font-bold uppercase tracking-widest text-gray-500 dark:text-[#8b949e]">Category</label>
                        <select value={form.category} onChange={set('category')} className={inputCls} required>
                            {CATEGORIES.map((c) => (
                                <option key={c.key} value={c.key}>{c.label}</option>
                            ))}
                        </select>
                    </div>

                    <div className="space-y-1.5">
                        <label className="text-[10px] font-bold uppercase tracking-widest text-gray-500 dark:text-[#8b949e]">Name</label>
                        <input value={form.name} onChange={set('name')} className={inputCls} placeholder="Hand-roll Silk Tie" required />
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                        <div className="space-y-1.5">
                            <label className="text-[10px] font-bold uppercase tracking-widest text-gray-500 dark:text-[#8b949e]">Color</label>
                            <input value={form.color} onChange={set('color')} className={inputCls} placeholder="Brown" />
                        </div>
                        <div className="space-y-1.5">
                            <label className="text-[10px] font-bold uppercase tracking-widest text-gray-500 dark:text-[#8b949e]">Price ($)</label>
                            <input type="number" step="0.01" min="0" value={form.price} onChange={set('price')} className={inputCls} placeholder="69" required />
                        </div>
                    </div>

                    <div className="space-y-1.5">
                        <label className="text-[10px] font-bold uppercase tracking-widest text-gray-500 dark:text-[#8b949e]">Image</label>
                        <div className="flex items-center gap-3">
                            <div className="h-16 w-16 rounded-xl overflow-hidden border border-black/[0.08] dark:border-[#30363d] flex-shrink-0 bg-black/[0.02] dark:bg-white/[0.02] flex items-center justify-center">
                                {form.image ? (
                                    <img src={form.image} alt="" className="w-full h-full object-cover" />
                                ) : (
                                    <span className="text-[9px] text-gray-400 uppercase">None</span>
                                )}
                            </div>
                            <button
                                type="button"
                                onClick={() => fileRef.current?.click()}
                                disabled={uploading}
                                className="h-8 px-3 rounded-lg border border-black/[0.08] dark:border-white/[0.08] text-[10px] font-bold uppercase tracking-widest text-gray-600 dark:text-[#8b949e] hover:border-[#0d3542]/40 dark:hover:border-[#58a6ff]/40 hover:text-[#0d3542] dark:hover:text-[#58a6ff] transition-all flex items-center gap-2 disabled:opacity-50"
                            >
                                <Upload size={12} />
                                {uploading ? 'Uploading...' : 'Upload'}
                            </button>
                            {form.image && (
                                <button
                                    type="button"
                                    onClick={() => setForm((f) => ({ ...f, image: '' }))}
                                    className="text-[10px] font-bold uppercase tracking-widest text-rose-500 hover:text-rose-400 transition-colors"
                                >
                                    Clear
                                </button>
                            )}
                        </div>
                        <input value={form.image} onChange={set('image')} className={inputCls} placeholder="…or paste an image URL" />
                        <input ref={fileRef} type="file" accept="image/*" onChange={handleFile} className="hidden" />
                    </div>

                    <div className="flex justify-end gap-2 pt-2">
                        <button
                            type="button"
                            onClick={onClose}
                            className="h-9 px-4 rounded-lg border border-black/[0.08] dark:border-white/[0.08] text-[10px] font-bold uppercase tracking-widest text-gray-600 dark:text-[#8b949e] hover:border-[#0d3542]/40 dark:hover:border-[#58a6ff]/40 transition-all"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={saving}
                            className="h-9 px-4 rounded-lg text-[10px] font-bold uppercase tracking-widest text-white dark:text-black bg-[#0d3542] dark:bg-[#58a6ff] hover:opacity-90 transition-all disabled:opacity-50"
                        >
                            {saving ? 'Saving...' : form.id ? 'Save Changes' : 'Add Item'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

const InventoryManager = () => {
    const { activeOutlet } = useAdmin();
    const { toast } = useToast();
    const queryClient = useQueryClient();
    const [modalOpen, setModalOpen] = useState(false);
    const [form, setForm] = useState(EMPTY_FORM);

    const { data: outOfStockItems = [], isLoading: loading } = useQuery({
        queryKey: ['outOfStockItems', activeOutlet],
        queryFn: async () => {
            const { data } = await axios.get('/api/v1/gift-items/out-of-stock', { headers: { 'X-Active-Outlet': activeOutlet } });
            return Array.isArray(data) ? data : [];
        },
        staleTime: 2 * 60 * 1000,
    });

    // Catalog is DB-backed now. Fall back to the legacy static list if the
    // API is unreachable so the page never renders empty.
    const { data: catalog, isLoading: catalogLoading } = useQuery({
        queryKey: ['giftItems'],
        queryFn: async () => {
            const { data } = await axios.get('/api/v1/admin/gift-items');
            return data;
        },
        retry: 1,
        staleTime: 5 * 60 * 1000,
    });

    const sections = useMemo(() => {
        const src = catalog || giftOptionsFallback;
        return CATEGORIES.map((c) => ({ ...c, items: src[c.key] || [] }));
    }, [catalog]);

    const invalidateCatalog = () => {
        queryClient.invalidateQueries({ queryKey: ['giftItems'] });
        queryClient.invalidateQueries({ queryKey: ['giftItemsPublic'] });
    };

    const saveMutation = useMutation({
        mutationFn: async (payload) => {
            if (payload.id) return axios.put(`/api/v1/admin/gift-items/${payload.id}`, payload);
            return axios.post('/api/v1/admin/gift-items', payload);
        },
        onSuccess: (_, payload) => {
            invalidateCatalog();
            setModalOpen(false);
            setForm(EMPTY_FORM);
            toast.success(payload.id ? 'Item updated' : 'Item added');
        },
        onError: (err) => toast.error(err.response?.data?.message || err.response?.data?.errors?.name?.[0] || 'Failed to save item'),
    });

    const deleteMutation = useMutation({
        mutationFn: async (itemId) => axios.delete(`/api/v1/admin/gift-items/${itemId}`),
        onSuccess: () => {
            invalidateCatalog();
            toast.success('Item removed');
        },
        onError: () => toast.error('Failed to remove item'),
    });

    const openAdd = () => { setForm(EMPTY_FORM); setModalOpen(true); };

    const openEdit = (item, category) => {
        setForm({
            id: item.id,
            name: item.name || '',
            category,
            color: item.color || '',
            price: item.price != null ? String(item.price) : '',
            image: item.image || '',
        });
        setModalOpen(true);
    };

    const handleSubmit = () => {
        const payload = {
            name: form.name.trim(),
            category: form.category,
            color: form.color.trim() || null,
            price: parseFloat(form.price) || 0,
            image: form.image.trim() || null,
        };
        if (form.id) payload.id = form.id;
        saveMutation.mutate(payload);
    };

    const handleDelete = (item) => {
        if (!window.confirm(`Remove "${item.name}" from the catalog? It will no longer be selectable on the gift page.`)) return;
        deleteMutation.mutate(item.id);
    };

    const toggleStockMutation = useMutation({
        mutationFn: async ({ id, is_out_of_stock }) => {
            await axios.post('/api/v1/admin/gift-items/toggle-stock', {
                item_id: id,
                is_out_of_stock
            });
        },
        onMutate: async ({ id, is_out_of_stock }) => {
            await queryClient.cancelQueries({ queryKey: ['outOfStockItems', activeOutlet] });
            const previousItems = queryClient.getQueryData(['outOfStockItems', activeOutlet]);

            queryClient.setQueryData(['outOfStockItems', activeOutlet], (old) => {
                const safeOld = Array.isArray(old) ? old : [];
                return is_out_of_stock
                    ? [...safeOld, id]
                    : safeOld.filter(itemId => itemId !== id);
            });

            return { previousItems };
        },
        onError: (err, variables, context) => {
            console.error('Failed to toggle stock:', err);
            queryClient.setQueryData(['outOfStockItems', activeOutlet], context?.previousItems);
        }
    });

    const toggleStock = (id) => {
        const isCurrentlyOutOfStock = outOfStockItems.includes(id);
        toggleStockMutation.mutate({ id, is_out_of_stock: !isCurrentlyOutOfStock });
    };

    const renderSection = (title, categoryKey, items) => (
        <section className="space-y-4">
            <div className="flex items-center justify-between border-b border-black/5 dark:border-[#30363d] pb-2">
                <h2 className="text-xl font-serif text-gray-900 dark:text-[#c9d1d9]">{title}</h2>
                <span className="text-[10px] font-bold uppercase tracking-widest text-gray-400 dark:text-[#8b949e]/60">
                    {items.length} item{items.length === 1 ? '' : 's'}
                </span>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                {items.map(item => {
                    const isOutOfStock = outOfStockItems.includes(item.id);
                    return (
                        <motion.div
                            layout="position"
                            key={item.id}
                            onClick={() => toggleStock(item.id)}
                            className={`p-4 rounded-2xl border transition-all duration-300 cursor-pointer group hover:scale-[1.02] active:scale-[0.98] ${
                                isOutOfStock
                                    ? 'bg-red-500/5 border-red-500/20 hover:border-red-500/40'
                                    : 'bg-white dark:bg-[#161b22] border-black/5 dark:border-[#30363d] hover:border-[#0d3542]/30 dark:hover:border-[#58a6ff]/30 shadow-none'
                            }`}
                        >
                            <div className="flex items-center gap-4">
                                <div className="h-16 w-16 rounded-xl overflow-hidden border border-black/5 dark:border-[#30363d] flex-shrink-0">
                                    <OptimizedImage
                                        src={item.image}
                                        alt={item.name}
                                        containerClassName="w-full h-full"
                                        className={`w-full h-full ${isOutOfStock ? 'grayscale opacity-50' : ''}`}
                                    />
                                </div>
                                <div className="flex-grow min-w-0">
                                    <h3 className="text-sm font-medium text-gray-900 dark:text-[#c9d1d9] truncate group-hover:text-[#0d3542] dark:group-hover:text-[#58a6ff] transition-colors">{item.name}</h3>
                                    <p className="text-xs text-gray-500 dark:text-[#8b949e]">
                                        {item.color || 'Default'}
                                        {item.price != null && <span> · ${Number(item.price).toFixed(2).replace(/\.00$/, '')}</span>}
                                    </p>
                                </div>
                                <div
                                    className={`flex-shrink-0 p-2 rounded-full transition-colors ${
                                        isOutOfStock
                                            ? 'bg-red-500/20 text-red-600 dark:text-red-400 group-hover:bg-red-500/30'
                                            : 'bg-green-500/20 text-green-600 dark:text-green-400 group-hover:bg-green-500/30'
                                    }`}
                                >
                                    {isOutOfStock ? <XCircle size={20} /> : <CheckCircle size={20} />}
                                </div>
                            </div>
                            <div
                                className="flex items-center justify-end gap-1 mt-3 pt-3 border-t border-black/[0.05] dark:border-[#30363d] opacity-0 group-hover:opacity-100 transition-opacity"
                                onClick={(e) => e.stopPropagation()}
                            >
                                <button
                                    onClick={() => openEdit(item, categoryKey)}
                                    title="Edit item"
                                    className="h-7 px-2.5 rounded-lg border border-black/[0.08] dark:border-white/[0.08] text-gray-500 dark:text-[#8b949e] hover:border-[#0d3542]/40 dark:hover:border-[#58a6ff]/40 hover:text-[#0d3542] dark:hover:text-[#58a6ff] transition-all flex items-center gap-1 text-[9px] font-bold uppercase tracking-widest"
                                >
                                    <Pencil size={11} /> Edit
                                </button>
                                <button
                                    onClick={() => handleDelete(item)}
                                    title="Remove item"
                                    className="h-7 px-2.5 rounded-lg border border-rose-500/20 text-rose-500 dark:text-rose-400 hover:bg-rose-500/10 transition-all flex items-center gap-1 text-[9px] font-bold uppercase tracking-widest"
                                >
                                    <Trash2 size={11} /> Remove
                                </button>
                            </div>
                        </motion.div>
                    );
                })}
                {items.length === 0 && (
                    <p className="col-span-full text-sm text-gray-400 dark:text-[#8b949e]/50 py-6">
                        No items yet — use “Add Item” to create one.
                    </p>
                )}
            </div>
        </section>
    );

    /* ---- Export ---- */
    const handleExport = () => {
        const rows = [];
        rows.push(['ATTIRE LOUNGE — GIFT INVENTORY']);
        rows.push(['Exported', new Date().toLocaleString()]);
        rows.push([]);
        rows.push(['Section', 'Item', 'Color', 'Price', 'Status']);
        sections.forEach(({ label, items }) => {
            (items || []).forEach(item => {
                const out = outOfStockItems.includes(item.id);
                rows.push([label, item.name || '', item.color || '', item.price ?? '', out ? 'OUT OF STOCK' : 'IN STOCK']);
            });
        });
        downloadCSV(rows, `gift-inventory-${new Date().toISOString().split('T')[0]}.csv`);
    };

    if (loading || catalogLoading) {
        return (
            <div className="flex flex-col items-center justify-center py-48 space-y-4">
                <LumaSpin size="xl" />
                <p className="text-[10px] font-black uppercase tracking-[0.4em] text-gray-400 dark:text-[#8b949e]/40">Scanning Inventory...</p>
            </div>
        );
    }

    return (
        <div className="space-y-8 pb-20">
            <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-3 pb-4 border-b border-black/5 dark:border-[#30363d]">
                <div>
                    <h1 className="text-4xl font-serif text-gray-900 dark:text-[#c9d1d9] mb-2">Inventory</h1>
                    <p className="text-gray-500 dark:text-[#8b949e] text-sm uppercase tracking-widest">
                        Manage gift items &amp; availability
                    </p>
                </div>
                <div className="flex items-center gap-2 w-fit">
                    <button
                        onClick={openAdd}
                        className="h-9 px-4 bg-[#0d3542] dark:bg-[#58a6ff] text-white dark:text-black rounded-lg text-[10px] font-bold uppercase tracking-widest hover:opacity-90 active:scale-[0.97] transition-all flex items-center gap-2"
                    >
                        <Plus size={14} />
                        Add Item
                    </button>
                    <button
                        onClick={handleExport}
                        className="h-9 px-4 bg-black/[0.03] dark:bg-white/[0.04] border border-black/[0.08] dark:border-white/[0.08] text-gray-600 dark:text-[#8b949e] rounded-lg text-[10px] font-bold uppercase tracking-widest hover:border-[#0d3542]/40 dark:hover:border-[#58a6ff]/40 hover:text-[#0d3542] dark:hover:text-[#58a6ff] active:scale-[0.97] transition-all flex items-center gap-2"
                    >
                        <Download size={14} />
                        Export
                    </button>
                </div>
            </div>

            <div className="space-y-12">
                {sections.map(({ key, label, items }) => renderSection(label, key, items))}
            </div>

            <GiftItemModal
                open={modalOpen}
                onClose={() => { setModalOpen(false); setForm(EMPTY_FORM); }}
                form={form}
                setForm={setForm}
                onSubmit={handleSubmit}
                saving={saveMutation.isPending}
            />
        </div>
    );
};

export default InventoryManager;
