import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, Globe, AlertCircle, Check, Filter, ExternalLink, Edit3, Save, X, ChevronLeft, ChevronRight } from 'lucide-react';
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
    const [currentPage, setCurrentPage] = useState(1);
    const ITEMS_PER_PAGE = 15;

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

    // Reset page on filter/search/tab change
    useEffect(() => {
        setCurrentPage(1);
    }, [search, filter, activeTab]);

    // Pagination
    const totalPages = Math.max(1, Math.ceil(filteredItems.length / ITEMS_PER_PAGE));
    const paginatedItems = filteredItems.slice(
        (currentPage - 1) * ITEMS_PER_PAGE,
        currentPage * ITEMS_PER_PAGE
    );
    const pageRange = (() => {
        const range = [];
        const maxVisible = 5;
        let start = Math.max(1, currentPage - Math.floor(maxVisible / 2));
        let end = Math.min(totalPages, start + maxVisible - 1);
        if (end - start + 1 < maxVisible) start = Math.max(1, end - maxVisible + 1);
        for (let i = start; i <= end; i++) range.push(i);
        return range;
    })();

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
        <div className="p-8 space-y-8 font-sans">
            {/* Header Area */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div>
                    <h1 className="text-2xl font-serif text-gray-900 dark:text-[#c9d1d9] uppercase tracking-[0.2em] mb-1">
                        SEO Matrix
                    </h1>
                    <p className="text-sm text-gray-500 dark:text-[#8b949e]/60 uppercase tracking-widest">
                        Digital Index & Search Optimization
                    </p>
                </div>

                <div className="flex bg-black/[0.03] dark:bg-[#0d1117] p-1 rounded-lg border border-black/5 dark:border-[#30363d]">
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
            <div className="flex flex-col md:flex-row gap-4 items-center bg-white dark:bg-[#161b22] p-4 rounded-xl border border-black/5 dark:border-[#30363d] shadow-none">
                <div className="relative flex-1 w-full group">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-[#0d3542] dark:group-focus-within:text-[#58a6ff] transition-colors" size={18} />
                    <input 
                        type="text"
                        placeholder={`Search ${activeTab}...`}
                        value={search}
                        onChange={e => setSearch(e.target.value)}
                        className="w-full bg-black/[0.02] dark:bg-[#0d1117] border border-black/5 dark:border-[#30363d] rounded-lg py-3 pl-12 pr-4 text-sm font-bold uppercase tracking-widest outline-none focus:border-[#0d3542]/50 dark:focus:border-[#58a6ff]/50 transition-all placeholder:text-gray-400 dark:placeholder:text-[#8b949e]/20"
                    />
                </div>
                <div className="relative w-full md:w-64 group">
                    <Filter className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-[#0d3542] dark:group-focus-within:text-[#58a6ff] transition-colors" size={18} />
                    <select 
                        value={filter}
                        onChange={e => setFilter(e.target.value)}
                        className="w-full bg-black/[0.02] dark:bg-[#0d1117] border border-black/5 dark:border-[#30363d] rounded-lg py-3 pl-12 pr-10 text-[11px] font-bold uppercase tracking-widest text-gray-600 dark:text-[#8b949e] focus:border-[#0d3542]/50 dark:focus:border-[#58a6ff]/50 outline-none appearance-none transition-all cursor-pointer"
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
                    <>
                    {paginatedItems.map(item => (
                        <motion.div 
                            key={item.id}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            className={`group p-6 bg-white dark:bg-[#161b22] border rounded-xl transition-all duration-300 shadow-none ${editId === item.id ? 'border-[#0d3542] dark:border-[#58a6ff] scale-[1.01]' : 'border-black/5 dark:border-[#30363d] hover:border-black/10 dark:hover:border-[#30363d]'}`}
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
                                                    <label className="text-[11.5px] font-bold text-gray-500 uppercase tracking-widest">Matrix Title</label>
                                                    <span className={`text-[11px] font-bold ${editData.meta_title.length > 60 ? 'text-rose-500' : 'text-[#0d3542]/60 dark:text-[#58a6ff]/60'}`}>
                                                        {editData.meta_title.length}/60
                                                    </span>
                                                </div>
                                                <input 
                                                    autoFocus
                                                    type="text"
                                                    value={editData.meta_title}
                                                    onChange={e => setEditData({...editData, meta_title: e.target.value})}
                                                    className="w-full bg-black/5 dark:bg-[#0d1117] border border-black/5 dark:border-[#30363d] rounded-lg py-3 px-4 text-sm font-bold text-gray-900 dark:text-white focus:border-[#0d3542] dark:focus:border-[#58a6ff] outline-none"
                                                />
                                            </div>
                                            <div className="space-y-2">
                                                <div className="flex justify-between items-center">
                                                    <label className="text-[11.5px] font-bold text-gray-500 uppercase tracking-widest">Matrix Discovery Description</label>
                                                    <span className={`text-[11px] font-bold ${editData.meta_description.length > 160 ? 'text-rose-500' : 'text-[#0d3542]/60 dark:text-[#58a6ff]/60'}`}>
                                                        {editData.meta_description.length}/160
                                                    </span>
                                                </div>
                                                <textarea 
                                                    rows={3}
                                                    value={editData.meta_description}
                                                    onChange={e => setEditData({...editData, meta_description: e.target.value})}
                                                    className="w-full bg-black/5 dark:bg-[#0d1117] border border-black/5 dark:border-[#30363d] rounded-lg py-3 px-4 text-sm font-bold text-gray-900 dark:text-white focus:border-[#0d3542] dark:focus:border-[#58a6ff] outline-none resize-none leading-relaxed"
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
                                            className="flex items-center gap-2 bg-black/5 dark:bg-[#0d1117] text-gray-600 dark:text-[#8b949e] px-4 py-2.5 rounded-lg text-xs font-bold uppercase tracking-widest transition-all hover:bg-black/10 dark:hover:bg-[#30363d] hover:text-gray-900 dark:hover:text-white"
                                        >
                                            <Edit3 size={14} />
                                            Optimize
                                        </button>
                                    )}
                                </div>
                            </div>
                        </motion.div>
                    ))}

                    {/* Pagination Controls */}
                    {totalPages > 1 && (
                        <div className="flex items-center justify-between mt-6 px-2">
                            <p className="text-[10px] font-bold uppercase tracking-widest text-gray-400 dark:text-[#8b949e]/50 tabular-nums">
                                {((currentPage - 1) * ITEMS_PER_PAGE) + 1}–{Math.min(currentPage * ITEMS_PER_PAGE, filteredItems.length)} of {filteredItems.length}
                            </p>
                            <div className="flex items-center gap-1">
                                <button
                                    onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                                    disabled={currentPage === 1}
                                    className="p-2 rounded-lg text-gray-400 dark:text-[#8b949e] hover:bg-black/5 dark:hover:bg-[#1c2128] hover:text-gray-900 dark:hover:text-white disabled:opacity-30 disabled:pointer-events-none transition-all"
                                >
                                    <ChevronLeft size={16} />
                                </button>
                                {pageRange[0] > 1 && (
                                    <>
                                        <button onClick={() => setCurrentPage(1)} className="w-8 h-8 rounded-lg text-[10px] font-bold text-gray-500 dark:text-[#8b949e] hover:bg-black/5 dark:hover:bg-[#1c2128] transition-all">1</button>
                                        {pageRange[0] > 2 && <span className="text-[10px] text-gray-300 dark:text-[#8b949e]/30 px-0.5">…</span>}
                                    </>
                                )}
                                {pageRange.map(p => (
                                    <button
                                        key={p}
                                        onClick={() => setCurrentPage(p)}
                                        className={`w-8 h-8 rounded-lg text-[10px] font-bold transition-all ${
                                            p === currentPage
                                                ? 'bg-[#0d3542] dark:bg-[#58a6ff] text-white dark:text-black'
                                                : 'text-gray-500 dark:text-[#8b949e] hover:bg-black/5 dark:hover:bg-[#1c2128]'
                                        }`}
                                    >
                                        {p}
                                    </button>
                                ))}
                                {pageRange[pageRange.length - 1] < totalPages && (
                                    <>
                                        {pageRange[pageRange.length - 1] < totalPages - 1 && <span className="text-[10px] text-gray-300 dark:text-[#8b949e]/30 px-0.5">…</span>}
                                        <button onClick={() => setCurrentPage(totalPages)} className="w-8 h-8 rounded-lg text-[10px] font-bold text-gray-500 dark:text-[#8b949e] hover:bg-black/5 dark:hover:bg-[#1c2128] transition-all">{totalPages}</button>
                                    </>
                                )}
                                <button
                                    onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                                    disabled={currentPage === totalPages}
                                    className="p-2 rounded-lg text-gray-400 dark:text-[#8b949e] hover:bg-black/5 dark:hover:bg-[#1c2128] hover:text-gray-900 dark:hover:text-white disabled:opacity-30 disabled:pointer-events-none transition-all"
                                >
                                    <ChevronRight size={16} />
                                </button>
                            </div>
                        </div>
                    )}
                    </>
                )}
            </div>
        </div>
    );
};

export default SEOManager;
