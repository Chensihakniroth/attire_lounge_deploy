import React, { useState, useMemo, useCallback } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import axios from 'axios';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Plus, Edit, Trash2, DollarSign, Check, ChevronLeft, ChevronRight, Search, Package, Save, Coffee, GlassWater, AlertTriangle, Droplets, Flame, IceCream2, Image as ImageIcon, Upload } from 'lucide-react';
import { LumaSpin } from '@/components/ui/luma-spin';
import { Button } from '@/components/ui/button';
import { formatPrice } from '@/helpers/format';
import { useAdmin } from './AdminContext';
import Swal from 'sweetalert2';
import ModernModal from '../../common/ModernModal';

/* ─── Category Icons Map ──────────────────────────────────── */
const CATEGORY_ICONS = { Espresso: Flame, Cold: IceCream2, Tea: GlassWater, Blend: Droplets };
const getCatIcon = (cat) => CATEGORY_ICONS[cat] || Coffee;

/* ─── Animations ──────────────────────────────────────────── */
const stagger = { hidden: { opacity: 0 }, visible: { opacity: 1, transition: { staggerChildren: 0.04 } } };
const cardAnim = { hidden: { opacity: 0, y: 12 }, visible: { opacity: 1, y: 0, transition: { duration: 0.35, ease: [0.25, 1, 0.5, 1] } }, exit: { opacity: 0, scale: 0.97, transition: { duration: 0.2 } } };
const swalTheme = () => ({ background: document.documentElement.classList.contains('dark') ? '#161b22' : '#fdfdfc', color: document.documentElement.classList.contains('dark') ? '#c9d1d9' : '#0d3542', confirmButtonColor: '#0d3542' });

/* ─── Drink Card ──────────────────────────────────────────── */
const DrinkCard = React.memo(({ drink, onEdit, onDelete }) => {
    const CatIcon = getCatIcon(drink.category);
    const isLow = drink.stock_qty <= 5 && drink.stock_qty > 0;
    const isOut = drink.stock_qty <= 0 && !drink.is_service;

    return (
        <motion.div variants={cardAnim} layout className={`group relative bg-[#fdfdfc] dark:bg-[#161b22] border rounded-[2rem] overflow-hidden transition-all duration-500 hover:shadow-lg dark:hover:shadow-black/40 ${isOut ? 'border-red-500/20 opacity-60' : 'border-black/5 dark:border-[#30363d] hover:border-[#0d3542]/30 dark:hover:border-[#58a6ff]/30'}`}>
            {/* Status Ribbon */}
            {isOut && (
                <div className="absolute top-4 right-4 z-10 flex items-center gap-1.5 px-3 py-1.5 bg-red-500/10 border border-red-500/20 rounded-full">
                    <AlertTriangle size={10} className="text-red-500" />
                    <span className="text-[8px] font-black uppercase tracking-[0.2em] text-red-500">Depleted</span>
                </div>
            )}
            {isLow && !isOut && (
                <div className="absolute top-4 right-4 z-10 flex items-center gap-1.5 px-3 py-1.5 bg-amber-500/10 border border-amber-500/20 rounded-full">
                    <AlertTriangle size={10} className="text-amber-500" />
                    <span className="text-[8px] font-black uppercase tracking-[0.2em] text-amber-500">Low</span>
                </div>
            )}
            {drink.is_service && (
                <div className="absolute top-4 right-4 z-10 flex items-center gap-1.5 px-3 py-1.5 bg-[#0d3542]/5 dark:bg-[#58a6ff]/5 border border-[#0d3542]/10 dark:border-[#58a6ff]/10 rounded-full">
                    <Droplets size={10} className="text-[#0d3542] dark:text-[#58a6ff]" />
                    <span className="text-[8px] font-black uppercase tracking-[0.2em] text-[#0d3542] dark:text-[#58a6ff]">Unlimited</span>
                </div>
            )}

            <div className="p-6 pb-4">
                {/* Category Icon / Image */}
                {drink.image_path ? (
                    <div className="w-full h-32 rounded-2xl mb-5 overflow-hidden border border-[#0d3542]/10 dark:border-[#58a6ff]/10">
                        <img src={drink.image_path} alt={drink.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                    </div>
                ) : (
                    <div className="w-12 h-12 rounded-2xl bg-[#0d3542]/5 dark:bg-[#58a6ff]/5 border border-[#0d3542]/10 dark:border-[#58a6ff]/10 flex items-center justify-center mb-5 group-hover:scale-110 transition-transform duration-500">
                        <CatIcon size={20} className="text-[#0d3542] dark:text-[#58a6ff]" />
                    </div>
                )}

                {/* Name & SKU */}
                <h3 className="text-[15px] font-serif text-gray-900 dark:text-white leading-tight group-hover:text-[#0d3542] dark:group-hover:text-[#58a6ff] transition-colors">{drink.name}</h3>
                <p className="text-[9px] font-mono font-bold uppercase tracking-[0.2em] text-gray-400 dark:text-[#8b949e]/40 mt-1">{drink.sku || '—'}</p>

                {/* Category Pill */}
                {drink.category && (
                    <div className="mt-4 inline-flex items-center gap-1.5 px-3 py-1.5 bg-black/[0.03] dark:bg-white/[0.03] border border-black/5 dark:border-white/5 rounded-full">
                        <span className="text-[9px] font-black uppercase tracking-[0.15em] text-gray-500 dark:text-[#8b949e]">{drink.category}</span>
                    </div>
                )}
            </div>

            {/* Footer */}
            <div className="px-6 py-4 border-t border-black/5 dark:border-[#30363d]/50 flex items-center justify-between bg-black/[0.01] dark:bg-white/[0.01]">
                <div className="flex items-center gap-4">
                    <span className="text-lg font-serif text-gray-900 dark:text-white">{formatPrice(drink.price)}</span>
                    {!drink.is_service && (
                        <span className={`text-[10px] font-mono font-black px-2.5 py-1 rounded-lg border ${isOut ? 'bg-red-500/5 border-red-500/20 text-red-500' : isLow ? 'bg-amber-500/5 border-amber-500/20 text-amber-600' : 'bg-black/[0.02] dark:bg-white/[0.02] border-black/5 dark:border-white/5 text-gray-500 dark:text-[#8b949e]'}`}>
                            {drink.stock_qty} units
                        </span>
                    )}
                </div>
                <div className="flex gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                    <button onClick={() => onEdit(drink)} className="p-2 rounded-xl hover:bg-[#0d3542]/10 dark:hover:bg-[#58a6ff]/10 text-gray-400 hover:text-[#0d3542] dark:hover:text-[#58a6ff] transition-all" title="Edit"><Edit size={14} /></button>
                    <button onClick={() => onDelete(drink)} className="p-2 rounded-xl hover:bg-red-500/10 text-gray-400 hover:text-red-500 transition-all" title="Delete"><Trash2 size={14} /></button>
                </div>
            </div>
        </motion.div>
    );
});

/* ─── Main Component ──────────────────────────────────────── */
export default function DrinkManager() {
    const queryClient = useQueryClient();
    const { activeOutlet, performanceMode, OUTLET_CONFIG } = useAdmin();
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingDrink, setEditingDrink] = useState(null);
    const [isSaving, setIsSaving] = useState(false);
    const [page, setPage] = useState(1);
    const [filters, setFilters] = useState({ search: '', category: '', status: 'available' });
    const [formData, setFormData] = useState({ sku: '', name: '', price: '', stock_qty: '', category: '', status: 'available', is_service: false, image_path: '' });
    const [uploading, setUploading] = useState(false);

    const { data, isLoading } = useQuery({
        queryKey: ['admin-drinks', page, filters, activeOutlet],
        queryFn: async () => {
            const params = { page, sort_by: 'created_at', sort_order: 'desc', status: filters.status, ...filters };
            const res = await axios.get('/api/v1/admin/pos/products', { params });
            return res.data;
        },
        keepPreviousData: true
    });

    const drinks = data?.data || [];
    const meta = data?.meta || {};

    const categories = useMemo(() => {
        const cats = new Set(drinks.map(d => d.category).filter(Boolean));
        return Array.from(cats).sort();
    }, [drinks]);

    const filteredDrinks = useMemo(() => {
        let result = drinks;
        if (filters.search) {
            const s = filters.search.toLowerCase();
            result = result.filter(d => d.name.toLowerCase().includes(s) || (d.sku && d.sku.toLowerCase().includes(s)));
        }
        if (filters.category) result = result.filter(d => d.category === filters.category);
        return result;
    }, [drinks, filters.search, filters.category]);

    const stats = useMemo(() => ({
        total: drinks.length,
        lowStock: drinks.filter(d => d.stock_qty <= 5 && d.stock_qty > 0 && !d.is_service).length,
        outOfStock: drinks.filter(d => d.stock_qty <= 0 && !d.is_service).length
    }), [drinks]);

    const mutation = useMutation({
        mutationFn: async (payload) => editingDrink ? axios.put(`/api/v1/admin/pos/products/${editingDrink.id}`, payload) : axios.post('/api/v1/admin/pos/products', payload),
        onSuccess: () => { queryClient.invalidateQueries(['admin-drinks']); setIsModalOpen(false); setIsSaving(false); setEditingDrink(null); },
        onError: (err) => { setIsSaving(false); Swal.fire({ icon: 'error', title: 'Protocol Failed', text: err.response?.data?.message || 'Failed to save.', ...swalTheme() }); }
    });

    const deleteMutation = useMutation({
        mutationFn: async (id) => axios.delete(`/api/v1/admin/pos/products/${id}`),
        onSuccess: () => queryClient.invalidateQueries(['admin-drinks'])
    });

    const openCreate = useCallback(() => {
        setEditingDrink(null);
        setFormData({ sku: '', name: '', price: '', stock_qty: '', category: '', status: 'available', is_service: false, image_path: '' });
        setIsModalOpen(true);
    }, []);

    const openEdit = useCallback((drink) => {
        setEditingDrink(drink);
        setFormData({ sku: drink.sku || '', name: drink.name || '', price: drink.price || '', stock_qty: drink.stock_qty || '', category: drink.category || '', status: drink.status || 'available', is_service: drink.is_service || false, image_path: drink.image_path || '' });
        setIsModalOpen(true);
    }, []);

    const handleDelete = useCallback(async (drink) => {
        const result = await Swal.fire({ title: 'Revoke Item', text: `Remove "${drink.name}" permanently?`, icon: 'warning', showCancelButton: true, confirmButtonColor: '#ef4444', cancelButtonColor: 'transparent', confirmButtonText: 'DELETE', cancelButtonText: 'CANCEL', ...swalTheme(), customClass: { confirmButton: 'px-8 py-3 rounded-xl text-xs font-black uppercase tracking-widest', cancelButton: 'px-8 py-3 rounded-xl text-xs font-black uppercase tracking-widest text-gray-400' } });
        if (result.isConfirmed) deleteMutation.mutate(drink.id);
    }, [deleteMutation]);

    const handleSubmit = (e) => { e.preventDefault(); setIsSaving(true); mutation.mutate(formData); };

    const handleImageUpload = async (e) => {
        const file = e.target.files[0];
        if (!file) return;
        setUploading(true);
        const data = new FormData();
        data.append('image', file);
        data.append('disk', 'public');
        try {
            const res = await axios.post('/api/v1/admin/images/upload', data, {
                headers: { 'Content-Type': 'multipart/form-data' },
            });
            if (res.data.url) setFormData((prev) => ({ ...prev, image_path: res.data.url }));
        } catch (err) {
            Swal.fire({ icon: 'error', title: 'Upload Failed', text: 'Could not upload image.', ...swalTheme() });
        } finally {
            setUploading(false);
        }
    };

    const outletData = OUTLET_CONFIG?.[activeOutlet] || { label: 'Attire Lounge' };
    const outletLabel = outletData.label;
    const displayTitle = activeOutlet === 'caffeine' || activeOutlet === 'kravat' ? `${outletLabel} Menu` : 'Beverage Terminal';
    
    const inputCls = "w-full bg-black/5 dark:bg-[#0d1117] border-2 border-black/5 dark:border-white/5 rounded-2xl py-4 px-5 text-gray-900 dark:text-white text-sm focus:border-[#0d3542] dark:focus:border-[#58a6ff] focus:bg-white dark:focus:bg-[#111] outline-none transition-all placeholder:text-gray-300 dark:placeholder:text-white/10";

    return (
        <div className="w-full space-y-10 pb-24">
            {/* ── Header ────────────────────────────────── */}
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-8 bg-[#fdfdfc] dark:bg-[#161b22] p-8 lg:p-10 rounded-[2.5rem] border border-black/5 dark:border-[#30363d] shadow-sm">
                <div className="flex items-center gap-5">
                    <div className="p-4 bg-[#0d3542] dark:bg-[#58a6ff] text-white dark:text-black rounded-3xl shadow-lg shadow-[#0d3542]/10 dark:shadow-[#58a6ff]/10">
                        <Coffee size={28} />
                    </div>
                    <div>
                        <h1 className="text-3xl font-serif text-gray-900 dark:text-white tracking-tight">{displayTitle}</h1>
                        <p className="text-xs font-black text-gray-400 dark:text-[#8b949e]/40 uppercase tracking-[0.3em] mt-1">{outletLabel} Operations</p>
                    </div>
                </div>
                <div className="flex flex-col sm:flex-row gap-3">
                    <div className="relative group">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 dark:text-white/20 group-focus-within:text-[#0d3542] dark:group-focus-within:text-[#58a6ff] transition-colors" />
                        <input type="text" placeholder="SEARCH MENU..." value={filters.search} onChange={e => setFilters(p => ({ ...p, search: e.target.value }))} className="w-full sm:w-56 bg-black/5 dark:bg-[#0d1117] border-2 border-black/5 dark:border-white/5 rounded-2xl py-3.5 pl-11 pr-4 text-[11px] font-black tracking-widest text-gray-900 dark:text-white focus:outline-none focus:border-[#0d3542]/20 dark:focus:border-[#58a6ff]/20 transition-all uppercase placeholder:text-gray-300 dark:placeholder:text-white/5" />
                    </div>
                    <Button onClick={openCreate} className="bg-[#0d3542] dark:bg-[#58a6ff] text-white dark:text-black rounded-2xl py-6 px-8 text-xs font-black uppercase tracking-[0.2em] hover:opacity-90 transition-all shadow-xl shadow-[#0d3542]/10 dark:shadow-[#58a6ff]/10">
                        <Plus size={16} className="mr-2" /> New Drink
                    </Button>
                </div>
            </div>

            {/* ── Stats Strip ───────────────────────────── */}
            <div className="grid grid-cols-3 gap-4">
                {[{ label: 'Total Items', value: stats.total, color: 'text-[#0d3542] dark:text-[#58a6ff]' }, { label: 'Low Stock', value: stats.lowStock, color: 'text-amber-500' }, { label: 'Out of Stock', value: stats.outOfStock, color: 'text-red-500' }].map(s => (
                    <div key={s.label} className="bg-[#fdfdfc] dark:bg-[#161b22] border border-black/5 dark:border-[#30363d] rounded-2xl p-5 text-center">
                        <p className="text-2xl font-serif tracking-tight"><span className={s.color}>{s.value}</span></p>
                        <p className="text-[9px] font-black text-gray-400 dark:text-[#8b949e]/40 uppercase tracking-[0.25em] mt-1">{s.label}</p>
                    </div>
                ))}
            </div>

            {/* ── Category Filter ────────────────────────── */}
            {categories.length > 0 && (
                <div className="flex flex-wrap gap-2 px-1">
                    <button onClick={() => setFilters(p => ({ ...p, category: '' }))} className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${!filters.category ? 'bg-[#0d3542] dark:bg-[#58a6ff] text-white dark:text-black' : 'bg-black/5 dark:bg-white/5 text-gray-500 hover:text-gray-900 dark:hover:text-white'}`}>All</button>
                    {categories.map(c => (
                        <button key={c} onClick={() => setFilters(p => ({ ...p, category: c }))} className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${filters.category === c ? 'bg-[#0d3542] dark:bg-[#58a6ff] text-white dark:text-black' : 'bg-black/5 dark:bg-white/5 text-gray-500 hover:text-gray-900 dark:hover:text-white'}`}>{c}</button>
                    ))}
                </div>
            )}

            {/* ── Grid ───────────────────────────────────── */}
            {isLoading ? (
                <div className="flex justify-center py-32"><LumaSpin size="lg" /></div>
            ) : filteredDrinks.length === 0 ? (
                <div className="py-24 text-center border-2 border-dashed border-black/5 dark:border-white/5 rounded-[2.5rem]">
                    <Coffee size={40} className="mx-auto text-gray-300 dark:text-[#8b949e]/20 mb-4" />
                    <p className="text-[10px] font-black uppercase tracking-[0.3em] text-gray-400 dark:text-[#8b949e]/40">No beverages found</p>
                </div>
            ) : (
                <motion.div variants={stagger} initial="hidden" animate="visible" className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
                    <AnimatePresence mode="popLayout">
                        {filteredDrinks.map(d => <DrinkCard key={d.id} drink={d} onEdit={openEdit} onDelete={handleDelete} />)}
                    </AnimatePresence>
                </motion.div>
            )}

            {/* ── Pagination ─────────────────────────────── */}
            {meta.last_page > 1 && (
                <div className="flex justify-between items-center px-2">
                    <span className="text-[10px] font-bold uppercase tracking-widest text-gray-400 tabular-nums">{meta.from}–{meta.to} of {meta.total}</span>
                    <div className="flex gap-1.5">
                        <button disabled={page === 1} onClick={() => setPage(p => p - 1)} className="p-2 rounded-lg text-gray-400 hover:bg-black/5 dark:hover:bg-[#1c2128] disabled:opacity-30 transition-all"><ChevronLeft size={16} /></button>
                        <button disabled={page === meta.last_page} onClick={() => setPage(p => p + 1)} className="p-2 rounded-lg text-gray-400 hover:bg-black/5 dark:hover:bg-[#1c2128] disabled:opacity-30 transition-all"><ChevronRight size={16} /></button>
                    </div>
                </div>
            )}

            {/* ── Creation/Edit Modal ─────────────────────── */}
            <ModernModal isOpen={isModalOpen} onClose={() => { setIsModalOpen(false); setEditingDrink(null); }} maxWidth="max-w-xl" showCloseButton={false}>
                <div className="px-8 py-6 border-b border-black/5 dark:border-white/5 bg-black/[0.02] dark:bg-white/[0.02] flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <div className="p-3 bg-[#0d3542]/10 dark:bg-[#58a6ff]/10 rounded-2xl text-[#0d3542] dark:text-[#58a6ff]">
                            {editingDrink ? <Edit size={22} /> : <Plus size={22} />}
                        </div>
                        <div>
                            <h3 className="text-lg font-serif text-gray-900 dark:text-white">{editingDrink ? 'Edit Drink' : 'New Drink'}</h3>
                            <p className="text-[10px] font-black text-gray-400 dark:text-[#8b949e]/40 uppercase tracking-widest mt-0.5">{outletLabel} Menu</p>
                        </div>
                    </div>
                    <button onClick={() => { setIsModalOpen(false); setEditingDrink(null); }} className="p-2 hover:bg-black/5 dark:hover:bg-white/10 rounded-full transition-colors text-gray-400"><X size={20} /></button>
                </div>

                <form onSubmit={handleSubmit} className="p-8 space-y-6">
                    <div className="flex gap-6">
                        {/* Image Uploader */}
                        <div className="flex-shrink-0">
                            <label className="text-[10px] font-black text-gray-400 dark:text-[#8b949e]/40 uppercase tracking-[0.2em] ml-1 block mb-1.5">Image</label>
                            <label className="relative w-28 h-28 rounded-2xl overflow-hidden block cursor-pointer bg-black/5 dark:bg-[#0d1117] border border-black/5 dark:border-[#30363d] group hover:border-[#0d3542]/50 dark:hover:border-[#58a6ff]/50 transition-colors">
                                <input type="file" className="hidden" accept="image/*" onChange={handleImageUpload} />
                                {formData.image_path ? (
                                    <img src={formData.image_path} alt="Preview" className="w-full h-full object-cover" />
                                ) : (
                                    <div className="w-full h-full flex items-center justify-center text-gray-300 dark:text-white/20">
                                        <ImageIcon size={28} />
                                    </div>
                                )}
                                <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-all flex items-center justify-center text-white">
                                    {uploading ? <LumaSpin className="animate-spin" size="sm" /> : <Upload size={18} />}
                                </div>
                            </label>
                        </div>

                        {/* Right Fields */}
                        <div className="flex-1 space-y-6">
                            <div className="space-y-2">
                                <label className="block text-[10px] font-black text-gray-400 dark:text-[#8b949e]/40 uppercase tracking-[0.2em] ml-1">Drink Name</label>
                                <input required value={formData.name} onChange={e => setFormData(f => ({ ...f, name: e.target.value }))} className={inputCls} placeholder="e.g. Iced Latte" />
                            </div>

                            <div className="grid grid-cols-2 gap-5">
                                <div className="space-y-2">
                                    <label className="block text-[10px] font-black text-gray-400 dark:text-[#8b949e]/40 uppercase tracking-[0.2em] ml-1">Price</label>
                                    <div className="relative">
                                        <DollarSign size={14} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
                                        <input required type="number" step="0.01" value={formData.price} onChange={e => setFormData(f => ({ ...f, price: e.target.value }))} className={`${inputCls} pl-10`} placeholder="0.00" />
                                    </div>
                                </div>
                                <div className="space-y-2">
                                    <label className="block text-[10px] font-black text-gray-400 dark:text-[#8b949e]/40 uppercase tracking-[0.2em] ml-1">Category</label>
                                    <input value={formData.category} onChange={e => setFormData(f => ({ ...f, category: e.target.value }))} className={inputCls} placeholder="e.g. Espresso" />
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-5">
                        <div className="space-y-2">
                            <label className="block text-[10px] font-black text-gray-400 dark:text-[#8b949e]/40 uppercase tracking-[0.2em] ml-1">Stock Qty</label>
                            <input type="number" value={formData.stock_qty} onChange={e => setFormData(f => ({ ...f, stock_qty: e.target.value }))} className={inputCls} placeholder="0" />
                        </div>
                        <div className="space-y-2">
                            <label className="block text-[10px] font-black text-gray-400 dark:text-[#8b949e]/40 uppercase tracking-[0.2em] ml-1">SKU (Optional)</label>
                            <input value={formData.sku} onChange={e => setFormData(f => ({ ...f, sku: e.target.value }))} className={inputCls} placeholder="Auto-generated" />
                        </div>
                    </div>

                    <label className="flex items-center gap-3 p-4 bg-black/[0.02] dark:bg-white/[0.02] border border-black/5 dark:border-white/5 rounded-2xl cursor-pointer hover:bg-black/[0.04] dark:hover:bg-white/[0.04] transition-colors">
                        <div className={`w-5 h-5 rounded-lg border-2 flex items-center justify-center transition-all ${formData.is_service ? 'bg-[#0d3542] dark:bg-[#58a6ff] border-[#0d3542] dark:border-[#58a6ff]' : 'border-gray-300 dark:border-[#30363d]'}`}>
                            {formData.is_service && <Check size={12} className="text-white dark:text-black" />}
                        </div>
                        <input type="checkbox" className="sr-only" checked={formData.is_service} onChange={e => setFormData(f => ({ ...f, is_service: e.target.checked }))} />
                        <div>
                            <span className="text-sm font-bold text-gray-700 dark:text-gray-300">Service / Unlimited</span>
                            <p className="text-[9px] font-bold text-gray-400 dark:text-[#8b949e]/40 uppercase tracking-widest mt-0.5">No stock tracking</p>
                        </div>
                    </label>

                    <div className="pt-2 flex gap-3">
                        <Button variant="outline" type="button" onClick={() => { setIsModalOpen(false); setEditingDrink(null); }} className="flex-1 py-6 rounded-2xl text-[11px] font-black uppercase tracking-[0.15em] border-2 border-black/10 dark:border-[#30363d] text-gray-400">Cancel</Button>
                        <Button type="submit" disabled={isSaving || uploading} className="flex-[2] py-6 bg-[#0d3542] dark:bg-[#58a6ff] text-white dark:text-black rounded-2xl text-[11px] font-black uppercase tracking-[0.15em] hover:opacity-90 transition-all shadow-xl shadow-[#0d3542]/10 dark:shadow-[#58a6ff]/10">
                            {isSaving ? <LumaSpin size={16} /> : <><Save size={14} className="mr-2" /> {editingDrink ? 'Update' : 'Create'} Drink</>}
                        </Button>
                    </div>
                </form>
            </ModernModal>
        </div>
    );
}
