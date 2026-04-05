import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, Globe, AlertCircle, Check, Filter, ExternalLink, Edit3, Save, X } from 'lucide-react';
import { LumaSpin } from '@/components/ui/luma-spin';
import axios from 'axios';
import { useAdmin } from './AdminContext';

const SEOManager = () => {
    const { products, collections, fetchProducts, fetchCollections } = useAdmin();
    const [activeTab, setActiveTab] = useState('products'); // 'products' or 'collections'
    const [search, setSearch] = useState('');
    const [filter, setFilter] = useState('all'); // 'all', 'missing', 'long', 'short'
    const [loading, setLoading] = useState(false);
    const [editId, setEditId] = useState(null);
    const [editData, setEditData] = useState({ meta_title: '', meta_description: '' });
    const [saving, setSaving] = useState(false);
    const [success, setSuccess] = useState(null);

    useEffect(() => {
        setLoading(true);
        Promise.all([fetchProducts(), fetchCollections()]).finally(() => setLoading(false));
    }, [fetchProducts, fetchCollections]);

    const items = activeTab === 'products' ? products : collections;
    
    const filteredItems = items.filter(item => {
        const matchesSearch = item.name.toLowerCase().includes(search.toLowerCase()) || 
                             (item.slug && item.slug.toLowerCase().includes(search.toLowerCase()));
        
        if (!matchesSearch) return false;

        if (filter === 'missing') return !item.meta_title || !item.meta_description;
        if (filter === 'long') return (item.meta_title?.length > 60) || (item.meta_description?.length > 160);
        if (filter === 'short') return (item.meta_title?.length < 30) || (item.meta_description?.length < 70);
        
        return true;
    });

    const startEditing = (item) => {
        setEditId(item.id);
        setEditData({
            meta_title: item.meta_title || '',
            meta_description: item.meta_description || ''
        });
    };

    const saveEdit = async (id) => {
        setSaving(true);
        try {
            const url = activeTab === 'products' ? `/api/v1/admin/products/${id}` : `/api/v1/admin/collections/${id}`;
            const res = await axios.put(url, editData);
            if (res.data.success) {
                setSuccess(id);
                setTimeout(() => setSuccess(null), 3000);
                activeTab === 'products' ? fetchProducts() : fetchCollections();
                setEditId(null);
            }
        } catch (err) {
            console.error('Failed to save SEO:', err);
        } finally {
            setSaving(false);
        }
    };

    return (
        <div className="space-y-8 pb-24">
            {/* Header Area */}
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 pb-6 border-b border-black/5 dark:border-white/10">
                <div>
                    <div className="flex items-center gap-3 mb-2">
                        <div className="w-10 h-10 rounded-2xl bg-[#0d3542]/10 flex items-center justify-center">
                            <Globe className="text-[#0d3542] dark:text-[#58a6ff]" size={20} />
                        </div>
                        <h1 className="text-4xl font-serif text-gray-900 dark:text-white">SEO Matrix</h1>
                    </div>
                    <p className="text-gray-400 dark:text-attire-silver/50 text-[11.5px] uppercase tracking-[0.3em] font-black">
                        Digital Index & Search Optimization
                    </p>
                </div>

                <div className="flex bg-black/[0.03] dark:bg-white/[0.03] p-1 rounded-2xl border border-black/5 dark:border-white/5">
                    <button 
                        onClick={() => setActiveTab('products')}
                        className={`px-6 py-2 rounded-xl text-xs font-bold uppercase tracking-widest transition-all ${activeTab === 'products' ? 'bg-[#0d3542] dark:bg-[#58a6ff] text-white dark:text-black' : 'text-gray-400 hover:text-gray-600 dark:hover:text-white/60'}`}
                    >
                        Products
                    </button>
                    <button 
                        onClick={() => setActiveTab('collections')}
                        className={`px-6 py-2 rounded-xl text-xs font-bold uppercase tracking-widest transition-all ${activeTab === 'collections' ? 'bg-[#0d3542] dark:bg-[#58a6ff] text-white dark:text-black' : 'text-gray-400 hover:text-gray-600 dark:hover:text-white/60'}`}
                    >
                        Collections
                    </button>
                </div>
            </div>

            {/* Toolbar */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="md:col-span-2 relative">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                    <input 
                        type="text"
                        placeholder={`Search ${activeTab}...`}
                        value={search}
                        onChange={e => setSearch(e.target.value)}
                        className="w-full bg-white dark:bg-[#161b22] border border-black/5 dark:border-white/10 rounded-2xl py-4 pl-12 pr-6 text-[15.5px] text-gray-900 dark:text-white focus:border-[#0d3542] dark:focus:border-[#58a6ff] outline-none transition-all placeholder:text-gray-400 dark:placeholder:text-white/20 font-medium"
                    />
                </div>
                <div className="relative">
                    <Filter className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                    <select 
                        value={filter}
                        onChange={e => setFilter(e.target.value)}
                        className="w-full bg-white dark:bg-[#161b22] border border-black/5 dark:border-white/10 rounded-2xl py-4 pl-12 pr-10 text-[12.5px] font-black uppercase tracking-[0.2em] text-gray-600 dark:text-attire-silver/70 focus:border-[#0d3542] dark:focus:border-[#58a6ff] outline-none appearance-none transition-all cursor-pointer"
                    >
                        <option value="all">All Content</option>
                        <option value="missing">Missing Metadata</option>
                        <option value="long">Too Long (Red)</option>
                        <option value="short">Short/Thin</option>
                    </select>
                </div>
            </div>

            {/* List */}
            <div className="space-y-4">
                {loading ? (
                    <div className="py-24 flex flex-col items-center justify-center">
                        <LumaSpin size="lg" className="mb-4" />
                        <p className="text-xs uppercase tracking-widest font-black text-gray-400">Indexing Digital Repository...</p>
                    </div>
                ) : filteredItems.length === 0 ? (
                    <div className="py-24 text-center bg-black/[0.02] dark:bg-white/[0.02] rounded-[2rem] border border-dashed border-black/5 dark:border-white/10">
                        <AlertCircle className="mx-auto text-gray-300 mb-4" size={32} />
                        <p className="text-gray-400 dark:text-attire-silver/30 text-xs uppercase tracking-widest">No matching assets found.</p>
                    </div>
                ) : (
                    filteredItems.map(item => (
                        <motion.div 
                            key={item.id}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            className={`group p-6 bg-white dark:bg-[#161b22] border rounded-3xl transition-all duration-300 shadow-none ${editId === item.id ? 'border-[#0d3542] dark:border-[#58a6ff] scale-[1.01]' : 'border-black/5 dark:border-white/5 hover:border-black/10 dark:hover:border-white/10'}`}
                        >
                            <div className="flex flex-col lg:flex-row gap-8">
                                {/* Item Info */}
                                <div className="lg:w-1/4">
                                    <h3 className="font-serif text-xl text-gray-900 dark:text-white mb-1.5 truncate">{item.name}</h3>
                                    <div className="flex items-center gap-3">
                                        <span className="text-[13px] font-mono text-gray-400 dark:text-attire-silver/30 font-bold">/{item.slug}</span>
                                        <a href={`/shop/product/${item.slug}`} target="_blank" rel="noreferrer" className="text-[#0d3542]/40 dark:text-[#58a6ff]/40 hover:text-[#0d3542] dark:hover:text-[#58a6ff] transition-colors">
                                            <ExternalLink size={14} />
                                        </a>
                                    </div>
                                    
                                    <div className="mt-4 flex flex-wrap gap-2">
                                        {!item.meta_title && <span className="px-2 py-0.5 bg-red-500/10 text-red-500 text-[11.5px] font-bold uppercase tracking-widest rounded-md">Missing Title</span>}
                                        {!item.meta_description && <span className="px-2 py-0.5 bg-[#0d3542]/10 dark:bg-[#58a6ff]/10 text-[#0d3542] dark:text-[#58a6ff] text-[11.5px] font-bold uppercase tracking-widest rounded-md">Missing Desc</span>}
                                        {success === item.id && <span className="px-2 py-0.5 bg-emerald-500/10 text-emerald-500 text-[11.5px] font-bold uppercase tracking-widest rounded-md flex items-center gap-1"><Check size={8}/> Optimized</span>}
                                    </div>
                                </div>

                                {/* SEO Fields */}
                                <div className="flex-grow space-y-4">
                                    {editId === item.id ? (
                                        <div className="space-y-4 animate-in fade-in slide-in-from-top-2 duration-300">
                                            <div className="space-y-2">
                                                <div className="flex justify-between items-center">
                                                    <label className="text-[11.5px] font-black text-gray-400 uppercase tracking-[0.2em]">Matrix Title</label>
                                                    <span className={`text-[11.5px] font-black ${editData.meta_title.length > 60 ? 'text-rose-500' : 'text-[#0d3542]/40 dark:text-[#58a6ff]/40'}`}>
                                                        {editData.meta_title.length}/60
                                                    </span>
                                                </div>
                                                <input 
                                                    autoFocus
                                                    type="text"
                                                    value={editData.meta_title}
                                                    onChange={e => setEditData({...editData, meta_title: e.target.value})}
                                                    className="w-full bg-black/5 dark:bg-white/5 border border-black/5 dark:border-white/10 rounded-xl py-4 px-5 text-[16px] font-black text-gray-900 dark:text-white focus:border-[#0d3542] dark:focus:border-[#58a6ff] outline-none"
                                                />
                                            </div>
                                            <div className="space-y-2">
                                                <div className="flex justify-between items-center">
                                                    <label className="text-[11.5px] font-black text-gray-400 uppercase tracking-[0.2em]">Matrix Discovery Description</label>
                                                    <span className={`text-[11.5px] font-black ${editData.meta_description.length > 160 ? 'text-rose-500' : 'text-[#0d3542]/40 dark:text-[#58a6ff]/40'}`}>
                                                        {editData.meta_description.length}/160
                                                    </span>
                                                </div>
                                                <textarea 
                                                    rows={3}
                                                    value={editData.meta_description}
                                                    onChange={e => setEditData({...editData, meta_description: e.target.value})}
                                                    className="w-full bg-black/5 dark:bg-white/5 border border-black/5 dark:border-white/10 rounded-xl py-4 px-5 text-[16px] font-black text-gray-900 dark:text-white focus:border-[#0d3542] dark:focus:border-[#58a6ff] outline-none resize-none leading-relaxed"
                                                />
                                            </div>
                                        </div>
                                    ) : (
                                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 opacity-80 group-hover:opacity-100 transition-opacity">
                                            <div className="space-y-1.5">
                                                <p className="text-[11.5px] font-black text-gray-400 uppercase tracking-[0.2em]">Matrix Title</p>
                                                <p className={`text-[15.5px] font-medium ${!item.meta_title ? 'text-gray-300 dark:text-white/10 italic' : 'text-gray-700 dark:text-white/80'}`}>
                                                    {item.meta_title || 'Not specified'}
                                                </p>
                                            </div>
                                            <div className="space-y-1.5">
                                                <p className="text-[11.5px] font-black text-gray-400 uppercase tracking-[0.2em]">Discovery Description</p>
                                                <p className={`text-[15.5px] font-medium line-clamp-2 leading-relaxed ${!item.meta_description ? 'text-gray-300 dark:text-white/10 italic' : 'text-gray-700 dark:text-white/80'}`}>
                                                    {item.meta_description || 'Not specified'}
                                                </p>
                                            </div>
                                        </div>
                                    )}
                                </div>

                                {/* Actions */}
                                <div className="lg:w-48 flex items-start justify-end gap-2">
                                    {editId === item.id ? (
                                        <>
                                            <button 
                                                onClick={() => setEditId(null)}
                                                className="p-3 text-gray-400 hover:text-gray-600 dark:hover:text-white transition-colors"
                                            >
                                                <X size={18} />
                                            </button>
                                            <button 
                                                onClick={() => saveEdit(item.id)}
                                                disabled={saving}
                                                className="flex items-center gap-2 bg-[#0d3542] dark:bg-[#58a6ff] text-white dark:text-black px-5 py-3 rounded-2xl text-xs font-bold uppercase tracking-widest transition-all hover:scale-105 active:scale-95 disabled:opacity-50"
                                            >
                                                {saving ? <LumaSpin size="sm" /> : <Save size={14} />}
                                                Save
                                            </button>
                                        </>
                                    ) : (
                                        <button 
                                            onClick={() => startEditing(item)}
                                            className="flex items-center gap-2 bg-black/5 dark:bg-white/5 text-gray-600 dark:text-attire-silver/60 px-5 py-3 rounded-2xl text-xs font-bold uppercase tracking-widest transition-all hover:bg-black/10 dark:hover:bg-white/10 hover:text-gray-900 dark:hover:text-white"
                                        >
                                            <Edit3 size={14} />
                                            Optimize
                                        </button>
                                    )}
                                </div>
                            </div>
                        </motion.div>
                    ))
                )}
            </div>
        </div>
    );
};

export default SEOManager;
