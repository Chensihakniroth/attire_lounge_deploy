import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import axios from 'axios';
import { motion, AnimatePresence } from 'framer-motion';
import { 
    Package, Search, X, MoreVertical, Plus, Edit, Trash2, 
    Smartphone, Hash, Tag, DollarSign, Layers, Check, 
    AlertCircle, Loader, Filter, ChevronDown, Archive, Scissors
} from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

// Helper for formatting price
const formatPrice = (price) => {
    return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'USD',
    }).format(price || 0);
};

const ProductRow = React.memo(({ product, onEdit, onDelete }) => {
    return (
        <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="px-6 py-4 border-b border-black/5 dark:border-white/5 hover:bg-black/[0.02] dark:hover:bg-white/[0.02] transition-colors group cursor-default"
            style={{
                display: 'grid',
                gridTemplateColumns: '40px 140px 220px 140px 140px 120px 100px 120px 1fr 60px',
                columnGap: '10px',
                alignItems: 'center',
            }}
        >
            <div className="flex justify-center">
                <input
                    type="checkbox"
                    className="w-3.5 h-3.5 rounded border-black/20 dark:border-white/20 bg-transparent accent-attire-accent"
                />
            </div>

            <div className="flex items-center gap-2 border-r border-black/5 dark:border-white/5 px-2 h-full font-mono text-[10px] text-attire-accent font-bold tracking-widest">
                <Hash size={10} className="opacity-30" />
                {product.sku}
            </div>

            <div className="flex flex-col gap-0.5 border-r border-black/5 dark:border-white/5 px-2 h-full justify-center overflow-hidden">
                <span className="text-sm font-serif text-attire-charcoal dark:text-white truncate">
                    {product.name}
                </span>
                <span className="text-[9px] uppercase tracking-tighter text-gray-400 font-bold overflow-hidden truncate">
                    {product.variant || 'Standard Variant'}
                </span>
            </div>

            <div className="px-2 border-r border-black/5 dark:border-white/5 h-full flex items-center">
                <div className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-lg text-[9px] font-black uppercase tracking-widest bg-black/5 dark:bg-white/5 border border-black/5 dark:border-white/5 text-gray-500 dark:text-white/40">
                    <Layers size={10} />
                    {product.category}
                </div>
            </div>

            <div className="px-2 border-r border-black/5 dark:border-white/5 h-full flex items-center">
                <span className="text-sm font-mono font-bold text-gray-900 dark:text-white">
                    {formatPrice(product.price)}
                </span>
            </div>

            <div className="px-2 border-r border-black/5 dark:border-white/5 h-full flex items-center">
                <div className={`text-[10px] font-bold font-mono px-2 py-1 rounded border ${
                    product.stock_qty <= 5 
                    ? 'text-red-500 bg-red-500/10 border-red-500/20' 
                    : 'text-emerald-500 bg-emerald-500/10 border-emerald-500/20'
                }`}>
                    {product.stock_qty} Units
                </div>
            </div>

            <div className="px-2 border-r border-black/5 dark:border-white/5 h-full flex items-center">
                <div className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-lg text-[9px] font-black uppercase tracking-widest border ${
                    product.is_service 
                    ? 'bg-blue-500/10 text-blue-500 border-blue-500/20' 
                    : 'bg-amber-500/10 text-amber-500 border-amber-500/20'
                }`}>
                    {product.is_service ? <Scissors size={10} /> : <Package size={10} />}
                    {product.is_service ? 'Service' : 'Product'}
                </div>
            </div>

            <div className="px-2 border-r border-black/5 dark:border-white/5 h-full flex items-center shrink-0 overflow-hidden">
                <span className="text-[10px] font-bold text-gray-400 dark:text-white/30 truncate">
                    Tier: {product.tier || 'None'}
                </span>
            </div>

            <div className="px-2 h-full flex items-center overflow-hidden italic text-[10px] text-gray-400 dark:text-white/20">
                {product.description || 'No description provided'}
            </div>

            <div className="flex items-center justify-center gap-2 px-2">
                <button 
                    onClick={() => onEdit(product)}
                    className="p-1.5 hover:bg-attire-accent/10 text-gray-400 hover:text-attire-accent rounded-lg transition-colors"
                >
                    <Edit size={14} />
                </button>
                <button 
                    onClick={() => onDelete(product.id)}
                    className="p-1.5 hover:bg-red-500/10 text-gray-400 hover:text-red-500 rounded-lg transition-colors"
                >
                    <Trash2 size={14} />
                </button>
            </div>
        </motion.div>
    );
});

export default function PosProductManager() {
    const queryClient = useQueryClient();
    const [searchQuery, setSearchQuery] = useState('');
    const [typeFilter, setTypeFilter] = useState('all');
    const [categoryFilter, setCategoryFilter] = useState('');
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingProduct, setEditingProduct] = useState(null);
    const [isSaving, setIsSaving] = useState(false);

    const [formData, setFormData] = useState({
        sku: '',
        name: '',
        variant: '',
        price: '',
        category: '',
        is_service: false,
        stock_qty: 0,
        tier: '',
        description: ''
    });

    // Fetch Products
    const { data: productsData, isLoading } = useQuery({
        queryKey: ['admin-pos-products', searchQuery, typeFilter, categoryFilter],
        queryFn: async () => {
            const { data } = await axios.get('/api/v1/admin/pos/products', {
                params: { 
                    search: searchQuery, 
                    type: typeFilter,
                    category: categoryFilter,
                    per_page: 50 
                }
            });
            return data;
        }
    });

    // Fetch Categories
    const { data: categories } = useQuery({
        queryKey: ['pos-categories'],
        queryFn: async () => {
            const { data } = await axios.get('/api/v1/admin/pos/products/categories');
            return data;
        }
    });

    const products = productsData?.data || [];

    // Mutations
    const saveMutation = useMutation({
        mutationFn: async (data) => {
            if (editingProduct) {
                return axios.put(`/api/v1/admin/pos/products/${editingProduct.id}`, data);
            }
            return axios.post('/api/v1/admin/pos/products', data);
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['admin-pos-products'] });
            queryClient.invalidateQueries({ queryKey: ['pos-categories'] });
            setIsModalOpen(false);
            setEditingProduct(null);
            setIsSaving(false);
        },
        onError: () => setIsSaving(false)
    });

    const deleteMutation = useMutation({
        mutationFn: async (id) => axios.delete(`/api/v1/admin/pos/products/${id}`),
        onSuccess: () => queryClient.invalidateQueries({ queryKey: ['admin-pos-products'] })
    });

    const handleOpenModal = (product = null) => {
        if (product) {
            setEditingProduct(product);
            setFormData({
                sku: product.sku,
                name: product.name,
                variant: product.variant || '',
                price: product.price,
                category: product.category,
                is_service: !!product.is_service,
                stock_qty: product.stock_qty || 0,
                tier: product.tier || '',
                description: product.description || ''
            });
        } else {
            setEditingProduct(null);
            setFormData({
                sku: '',
                name: '',
                variant: '',
                price: '',
                category: '',
                is_service: false,
                stock_qty: 0,
                tier: '',
                description: ''
            });
        }
        setIsModalOpen(true);
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        setIsSaving(true);
        saveMutation.mutate(formData);
    };

    if (isLoading) {
        return (
            <div className="h-96 flex items-center justify-center">
                <Loader className="animate-spin text-attire-accent" size={32} />
            </div>
        );
    }

    return (
        <div className="w-full font-sans pb-20">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-10">
                <div>
                    <h1 className="text-4xl font-serif text-attire-charcoal dark:text-white tracking-tight flex items-center gap-4">
                        <div className="p-3 bg-attire-accent/10 rounded-2xl border border-attire-accent/20 shadow-sm">
                            <Package className="w-8 h-8 text-attire-accent" />
                        </div>
                        POS Catalog Manager
                    </h1>
                    <div className="flex items-center gap-3 mt-4">
                        <span className="w-8 h-px bg-attire-accent/40" />
                        <p className="text-gray-400 dark:text-white/40 text-[10px] font-black uppercase tracking-[0.4em]">
                            Inventory & Service Management
                        </p>
                    </div>
                </div>

                <div className="flex items-center gap-3 flex-wrap">
                    <div className="relative group">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 dark:text-white/40 group-focus-within:text-attire-accent transition-colors" />
                        <input
                            type="text"
                            placeholder="Search catalog..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="bg-black/5 dark:bg-white/5 border border-black/10 dark:border-white/10 rounded-xl py-2.5 pl-10 pr-10 text-attire-charcoal dark:text-white text-sm outline-none focus:border-attire-accent/50 transition-all font-mono tracking-widest text-[11px] w-48 lg:w-64"
                        />
                    </div>

                    <select 
                        value={typeFilter}
                        onChange={(e) => setTypeFilter(e.target.value)}
                        className="bg-black/5 dark:bg-white/5 border border-black/10 dark:border-white/10 rounded-xl px-4 py-2.5 text-[11px] font-black uppercase tracking-widest text-gray-500 outline-none focus:border-attire-accent/50 cursor-pointer"
                    >
                        <option value="all">All Types</option>
                        <option value="products">Physical Products</option>
                        <option value="services">Services</option>
                    </select>

                    <Button 
                        onClick={() => handleOpenModal()}
                        className="bg-attire-accent text-black hover:bg-attire-accent/90 rounded-xl px-6 py-2.5 h-auto text-[11px] font-black uppercase tracking-widest flex items-center gap-2"
                    >
                        <Plus size={16} /> Add New Entry
                    </Button>
                </div>
            </div>

            {/* Table Header */}
            <div className="bg-white dark:bg-black/20 rounded-[2rem] border border-black/5 dark:border-white/10 overflow-hidden shadow-sm">
                <div
                    className="px-6 py-4 text-[10px] font-black uppercase tracking-[0.2em] text-gray-400 dark:text-white/40 bg-black/[0.02] dark:bg-white/[0.02] border-b border-black/5 dark:border-white/10"
                    style={{
                        display: 'grid',
                        gridTemplateColumns: '40px 140px 220px 140px 140px 120px 100px 120px 1fr 60px',
                        columnGap: '10px',
                    }}
                >
                    <div className="flex justify-center border-r border-black/5 dark:border-white/5 pr-2">
                        <input type="checkbox" className="w-3.5 h-3.5 rounded" />
                    </div>
                    <div className="px-2 border-r border-black/5 dark:border-white/5 flex items-center gap-1.5"><Tag size={12} className="opacity-50" />SKU</div>
                    <div className="px-2 border-r border-black/5 dark:border-white/5 flex items-center gap-1.5"><Package size={12} className="opacity-50" />Product Info</div>
                    <div className="px-2 border-r border-black/5 dark:border-white/5 flex items-center gap-1.5"><Layers size={12} className="opacity-50" />Category</div>
                    <div className="px-2 border-r border-black/5 dark:border-white/5 flex items-center gap-1.5"><DollarSign size={12} className="opacity-50" />Price</div>
                    <div className="px-2 border-r border-black/5 dark:border-white/5 flex items-center gap-1.5"><Archive size={12} className="opacity-50" />Stock</div>
                    <div className="px-2 border-r border-black/5 dark:border-white/5 flex items-center gap-1.5"><Scissors size={12} className="opacity-50" />Type</div>
                    <div className="px-2 border-r border-black/5 dark:border-white/5 flex items-center gap-1.5">Tier</div>
                    <div className="px-2 flex items-center gap-1.5">Description</div>
                    <div className="px-2 flex justify-center"><MoreVertical size={12} className="opacity-50" /></div>
                </div>

                {/* Table Body */}
                <div className="min-h-[400px]">
                    <AnimatePresence mode="popLayout">
                        {products.length === 0 ? (
                            <div className="py-20 text-center text-gray-500 font-mono text-xs uppercase tracking-widest">
                                No products found in catalog
                            </div>
                        ) : (
                            products.map(product => (
                                <ProductRow 
                                    key={product.id} 
                                    product={product} 
                                    onEdit={handleOpenModal}
                                    onDelete={(id) => {
                                        if (confirm('Deactivate this product?')) {
                                            deleteMutation.mutate(id);
                                        }
                                    }}
                                />
                            ))
                        )}
                    </AnimatePresence>
                </div>
            </div>

            {/* Modal */}
            <AnimatePresence>
                {isModalOpen && (
                    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-6">
                        <motion.div 
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="absolute inset-0 bg-black/80 backdrop-blur-sm"
                            onClick={() => setIsModalOpen(false)}
                        />
                        <motion.div 
                            initial={{ opacity: 0, scale: 0.95, y: 20 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.95, y: 20 }}
                            className="relative w-full max-w-2xl bg-white dark:bg-[#0d0d0d] border border-black/10 dark:border-white/10 rounded-[2.5rem] shadow-2xl overflow-hidden"
                        >
                            <div className="p-8 border-b border-black/5 dark:border-white/5 flex justify-between items-center bg-black/[0.02] dark:bg-white/[0.02]">
                                <h2 className="text-2xl font-serif text-gray-900 dark:text-white">
                                    {editingProduct ? 'Edit Entry' : 'New Entry'}
                                </h2>
                                <button onClick={() => setIsModalOpen(false)} className="p-2 bg-black/5 dark:bg-white/10 rounded-full text-gray-400">
                                    <X size={20} />
                                </button>
                            </div>

                            <form onSubmit={handleSubmit} className="p-8 space-y-6">
                                <div className="grid grid-cols-2 gap-6">
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">SKU / Code</label>
                                        <input 
                                            required
                                            value={formData.sku}
                                            onChange={e => setFormData({...formData, sku: e.target.value.toUpperCase()})}
                                            className="w-full bg-black/5 dark:bg-white/5 border border-black/10 dark:border-white/10 rounded-2xl py-4 px-6 text-sm font-mono tracking-widest"
                                            placeholder="SKU-XXX"
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Price (USD)</label>
                                        <input 
                                            required
                                            type="number"
                                            step="0.01"
                                            value={formData.price}
                                            onChange={e => setFormData({...formData, price: e.target.value})}
                                            className="w-full bg-black/5 dark:bg-white/5 border border-black/10 dark:border-white/10 rounded-2xl py-4 px-6 text-sm font-mono"
                                            placeholder="0.00"
                                        />
                                    </div>
                                    <div className="space-y-2 col-span-2">
                                        <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Name</label>
                                        <input 
                                            required
                                            value={formData.name}
                                            onChange={e => setFormData({...formData, name: e.target.value})}
                                            className="w-full bg-black/5 dark:bg-white/5 border border-black/10 dark:border-white/10 rounded-2xl py-4 px-6 text-sm"
                                            placeholder="Product Name"
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Variant</label>
                                        <input 
                                            value={formData.variant}
                                            onChange={e => setFormData({...formData, variant: e.target.value})}
                                            className="w-full bg-black/5 dark:bg-white/5 border border-black/10 dark:border-white/10 rounded-2xl py-4 px-6 text-sm"
                                            placeholder="Red, Premium, etc."
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Category</label>
                                        <input 
                                            required
                                            value={formData.category}
                                            onChange={e => setFormData({...formData, category: e.target.value})}
                                            className="w-full bg-black/5 dark:bg-white/5 border border-black/10 dark:border-white/10 rounded-2xl py-4 px-6 text-sm"
                                            placeholder="Category"
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Stock Quantity</label>
                                        <input 
                                            type="number"
                                            value={formData.stock_qty}
                                            onChange={e => setFormData({...formData, stock_qty: e.target.value})}
                                            className="w-full bg-black/5 dark:bg-white/5 border border-black/10 dark:border-white/10 rounded-2xl py-4 px-6 text-sm font-mono"
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Rarity / Tier</label>
                                        <select 
                                            value={formData.tier}
                                            onChange={e => setFormData({...formData, tier: e.target.value})}
                                            className="w-full bg-black/5 dark:bg-white/5 border border-black/10 dark:border-white/10 rounded-2xl py-4 px-6 text-sm appearance-none outline-none"
                                        >
                                            <option value="">No Tier</option>
                                            <option value="Standard">Standard</option>
                                            <option value="Premium">Premium</option>
                                            <option value="Designer">Designer</option>
                                            <option value="Ultimate">Ultimate</option>
                                        </select>
                                    </div>
                                    <div className="col-span-2 flex items-center gap-4 py-2 border-t border-black/5 dark:border-white/5">
                                        <div className="flex items-center gap-3">
                                            <input 
                                                type="checkbox"
                                                id="is_service"
                                                checked={formData.is_service}
                                                onChange={e => setFormData({...formData, is_service: e.target.checked})}
                                                className="w-4 h-4 rounded accent-attire-accent cursor-pointer"
                                            />
                                            <label htmlFor="is_service" className="text-xs font-bold uppercase tracking-widest cursor-pointer select-none">Mark as Service Accessory</label>
                                        </div>
                                    </div>
                                </div>

                                <div className="pt-6 flex gap-4 mt-auto">
                                    <button 
                                        type="button" 
                                        onClick={() => setIsModalOpen(false)}
                                        className="flex-grow py-4 border border-black/10 dark:border-white/10 rounded-2xl text-[11px] font-black uppercase tracking-widest text-gray-400 hover:text-white hover:bg-white/5 transition-all"
                                    >
                                        Cancel
                                    </button>
                                    <button 
                                        type="submit" 
                                        disabled={isSaving}
                                        className="flex-grow py-4 bg-attire-accent text-black rounded-2xl text-[11px] font-black uppercase tracking-widest hover:bg-white transition-all flex items-center justify-center gap-3 disabled:opacity-50 shadow-lg shadow-attire-accent/10"
                                    >
                                        {isSaving ? <Loader size={16} className="animate-spin" /> : <Check size={16} />}
                                        {isSaving ? 'Processing...' : 'Sync Catalog Entry'}
                                    </button>
                                </div>
                            </form>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </div>
    );
}
