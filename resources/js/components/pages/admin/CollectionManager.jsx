import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Edit2, Trash2, X, Check, Loader, Sparkles, Image as ImageIcon, LayoutGrid, ToggleLeft, ToggleRight, ArrowLeft, RefreshCw, AlertCircle, Upload } from 'lucide-react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { useAdmin } from './AdminContext';
import OptimizedImage from '../../common/OptimizedImage.jsx';

const CollectionManager = () => {
    const { setIsEditing, collections, fetchCollections, collectionsLoading } = useAdmin();
    const navigate = useNavigate();
    const [editingId, setEditingId] = useState(null);
    const [isAdding, setIsAdding] = useState(false);
    const [saving, setSaving] = useState(false);
    const [uploading, setUploading] = useState(false);
    const [error, setError] = useState(null);

    const [formData, setFormData] = useState({
        name: '',
        slug: '',
        description: '',
        year: new Date().getFullYear(),
        image: '',
        is_active: true,
        is_new: false,
        sort_order: 0
    });

    useEffect(() => {
        const isCurrentlyEditing = !!(isAdding || editingId);
        setIsEditing(isCurrentlyEditing);
        // We don't clear it on unmount here to avoid flicker, AdminLayout handles it
    }, [isAdding, editingId, setIsEditing]);

    useEffect(() => {
        fetchCollections();
    }, [fetchCollections]);

    const handleEdit = (collection) => {
        setEditingId(collection.id);
        setFormData({
            name: collection.name,
            slug: collection.slug,
            description: collection.description || '',
            year: collection.year,
            image: collection.image_url,
            is_active: collection.is_active,
            is_new: collection.is_new,
            sort_order: collection.sort_order || 0
        });
        setIsAdding(false);
    };

    const handleAdd = () => {
        setIsAdding(true);
        setEditingId(null);
        setFormData({
            name: '',
            slug: '',
            description: '',
            year: new Date().getFullYear(),
            image: '',
            is_active: true,
            is_new: true,
            sort_order: collections.length
        });
    };

    const handleCancel = () => {
        setEditingId(null);
        setIsAdding(false);
        setError(null);
    };

    const handleImageUpload = async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        setUploading(true);
        const uploadData = new FormData();
        uploadData.append('image', file);
        // We don't have a collection ID yet if adding, but the controller handles nullable collection_id
        if (editingId) {
            uploadData.append('collection_id', editingId);
        }

        try {
            const response = await axios.post('/api/v1/admin/images/upload', uploadData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });
            if (response.data.url) {
                setFormData(prev => ({ ...prev, image: response.data.url }));
            }
        } catch (err) {
            console.error('Image upload failed:', err);
            setError('Failed to upload image.');
        } finally {
            setUploading(false);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSaving(true);
        setError(null);

        try {
            const url = isAdding ? '/api/v1/admin/collections' : `/api/v1/admin/collections/${editingId}`;
            const method = isAdding ? 'post' : 'patch';
            
            const response = await axios[method](url, formData);
            if (response.data.success) {
                await fetchCollections();
                handleCancel();
            }
        } catch (err) {
            console.error('Failed to save collection:', err);
            setError(err.response?.data?.message || 'Failed to save collection.');
        } finally {
            setSaving(false);
        }
    };

    const handleDelete = async (id, name) => {
        if (window.confirm(`Are you sure you want to delete "${name}"? This will fail if it contains products. (｡>﹏<｡)`)) {
            try {
                const response = await axios.delete(`/api/v1/admin/collections/${id}`);
                if (response.data.success) {
                    fetchCollections();
                }
            } catch (err) {
                console.error('Failed to delete collection:', err);
                alert(err.response?.data?.message || 'Failed to delete collection.');
            }
        }
    };

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-[#050505] flex flex-col transition-colors duration-300">
            {/* Header */}
            <div className="sticky top-0 z-30 bg-white/80 dark:bg-[#0a0a0a]/80 backdrop-blur-xl border-b border-black/5 dark:border-white/5">
                <div className="max-w-7xl mx-auto px-6 h-24 flex justify-between items-center">
                    <div className="flex items-center gap-6">
                        <button 
                            onClick={() => navigate('/admin/products')}
                            className="p-3 hover:bg-black/5 dark:hover:bg-white/5 rounded-full transition-all text-gray-400 dark:text-white/40 hover:text-gray-900 dark:hover:text-white"
                        >
                            <ArrowLeft size={24} />
                        </button>
                        <div>
                            <h2 className="text-2xl font-serif text-gray-900 dark:text-white">Collection Management</h2>
                            <p className="text-gray-400 dark:text-attire-silver text-[10px] uppercase tracking-widest mt-1 opacity-50">
                                Curator Panel (｡♥‿♥｡)
                            </p>
                        </div>
                    </div>
                    <div className="flex items-center gap-4">
                        <button 
                            onClick={handleAdd}
                            disabled={isAdding || editingId}
                            className="flex items-center gap-2 px-6 py-3 bg-attire-accent text-black text-xs font-bold uppercase tracking-widest rounded-xl hover:bg-white transition-all duration-300 disabled:opacity-50"
                        >
                            <Plus size={16} /> New Collection
                        </button>
                    </div>
                </div>
            </div>

            <main className="max-w-7xl w-full mx-auto px-6 py-12">
                {/* Editor Section */}
                <AnimatePresence mode="wait">
                    {(isAdding || editingId) && (
                        <motion.div
                            initial={{ opacity: 0, y: -20 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -20 }}
                            className="mb-16 bg-white dark:bg-[#0d0d0d] border border-black/5 dark:border-white/10 rounded-3xl overflow-hidden shadow-2xl"
                        >
                            <div className="p-8 border-b border-black/5 dark:border-white/5 bg-black/[0.02] dark:bg-white/[0.02] flex justify-between items-center">
                                <h3 className="text-xl font-serif text-gray-900 dark:text-white">
                                    {isAdding ? 'Assemble New Collection' : `Refining ${formData.name}`}
                                </h3>
                                <button onClick={handleCancel} className="p-2 hover:bg-black/5 dark:hover:bg-white/5 rounded-full text-gray-400 transition-all">
                                    <X size={20} />
                                </button>
                            </div>

                            <form onSubmit={handleSubmit} className="p-8 space-y-8">
                                {error && (
                                    <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-2xl flex items-center gap-3 text-red-500 text-xs">
                                        <AlertCircle size={14} />
                                        <span>{error}</span>
                                    </div>
                                )}

                                <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
                                    {/* Image Upload Area */}
                                    <div className="space-y-4">
                                        <label className="text-[10px] font-bold text-gray-400 dark:text-attire-silver/50 uppercase tracking-widest ml-1">Collection Visual</label>
                                        <div className="relative aspect-[4/5] rounded-3xl overflow-hidden bg-black/5 dark:bg-white/5 border border-black/5 dark:border-white/10 group">
                                            {formData.image ? (
                                                <img src={formData.image} alt="Preview" className="w-full h-full object-cover" />
                                            ) : (
                                                <div className="w-full h-full flex flex-col items-center justify-center text-gray-300 dark:text-white/10">
                                                    <ImageIcon size={48} />
                                                    <p className="mt-4 text-[10px] uppercase tracking-widest">No Image</p>
                                                </div>
                                            )}
                                            
                                            <label className="absolute inset-0 bg-black/60 backdrop-blur-sm opacity-0 group-hover:opacity-100 transition-all cursor-pointer flex flex-col items-center justify-center text-white gap-2">
                                                <input type="file" className="hidden" accept="image/*" onChange={handleImageUpload} />
                                                {uploading ? (
                                                    <Loader className="animate-spin" size={24} />
                                                ) : (
                                                    <Upload size={24} />
                                                )}
                                                <span className="text-[10px] font-bold uppercase tracking-widest">Replace Photo</span>
                                            </label>
                                        </div>
                                    </div>

                                    {/* Form Fields */}
                                    <div className="lg:col-span-2 space-y-6">
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                            <div className="space-y-2">
                                                <label className="text-[10px] font-bold text-gray-400 dark:text-attire-silver/50 uppercase tracking-widest ml-1">Collection Name</label>
                                                <input 
                                                    type="text" 
                                                    required
                                                    value={formData.name}
                                                    onChange={e => {
                                                        const val = e.target.value;
                                                        setFormData(prev => ({ 
                                                            ...prev, 
                                                            name: val,
                                                            slug: isAdding ? val.toLowerCase().replace(/ /g, '-').replace(/[^\w-]/g, '') : prev.slug
                                                        }));
                                                    }}
                                                    className="w-full bg-black/5 dark:bg-white/5 border border-black/5 dark:border-white/10 rounded-2xl py-4 px-6 text-gray-900 dark:text-white text-sm focus:border-attire-accent outline-none transition-all"
                                                />
                                            </div>
                                            <div className="space-y-2">
                                                <label className="text-[10px] font-bold text-gray-400 dark:text-attire-silver/50 uppercase tracking-widest ml-1">Slug</label>
                                                <input 
                                                    type="text" 
                                                    required
                                                    value={formData.slug}
                                                    onChange={e => setFormData({ ...formData, slug: e.target.value })}
                                                    className="w-full bg-black/5 dark:bg-white/5 border border-black/5 dark:border-white/10 rounded-2xl py-4 px-6 text-gray-900 dark:text-white/50 text-sm focus:border-attire-accent outline-none transition-all font-mono"
                                                />
                                            </div>
                                        </div>

                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                            <div className="space-y-2">
                                                <label className="text-[10px] font-bold text-gray-400 dark:text-attire-silver/50 uppercase tracking-widest ml-1">Year</label>
                                                <input 
                                                    type="number" 
                                                    required
                                                    value={formData.year}
                                                    onChange={e => setFormData({ ...formData, year: e.target.value })}
                                                    className="w-full bg-black/5 dark:bg-white/5 border border-black/5 dark:border-white/10 rounded-2xl py-4 px-6 text-gray-900 dark:text-white text-sm focus:border-attire-accent outline-none transition-all font-mono"
                                                />
                                            </div>
                                            <div className="space-y-2">
                                                <label className="text-[10px] font-bold text-gray-400 dark:text-attire-silver/50 uppercase tracking-widest ml-1">Sort Order</label>
                                                <input 
                                                    type="number" 
                                                    value={formData.sort_order}
                                                    onChange={e => setFormData({ ...formData, sort_order: e.target.value })}
                                                    className="w-full bg-black/5 dark:bg-white/5 border border-black/5 dark:border-white/10 rounded-2xl py-4 px-6 text-gray-900 dark:text-white text-sm focus:border-attire-accent outline-none transition-all font-mono"
                                                />
                                            </div>
                                        </div>

                                        <div className="space-y-2">
                                            <label className="text-[10px] font-bold text-gray-400 dark:text-attire-silver/50 uppercase tracking-widest ml-1">Essence / Description</label>
                                            <textarea 
                                                rows={3}
                                                value={formData.description}
                                                onChange={e => setFormData({ ...formData, description: e.target.value })}
                                                className="w-full bg-black/5 dark:bg-white/5 border border-black/5 dark:border-white/10 rounded-2xl py-4 px-6 text-gray-900 dark:text-white text-sm focus:border-attire-accent outline-none transition-all resize-none leading-relaxed"
                                                placeholder="Describe the curation..."
                                            />
                                        </div>

                                        <div className="grid grid-cols-2 gap-6">
                                            <div className="p-6 bg-black/[0.02] dark:bg-white/[0.02] rounded-2xl border border-black/5 dark:border-white/5 flex items-center justify-between">
                                                <div>
                                                    <p className="text-[10px] font-bold text-gray-900 dark:text-white uppercase tracking-widest">Active Status</p>
                                                    <p className="text-[8px] text-gray-400 uppercase tracking-widest mt-1">Show in store</p>
                                                </div>
                                                <button 
                                                    type="button"
                                                    onClick={() => setFormData(prev => ({ ...prev, is_active: !prev.is_active }))}
                                                    className={`w-12 h-6 rounded-full transition-all relative ${formData.is_active ? 'bg-green-500' : 'bg-gray-300 dark:bg-white/10'}`}
                                                >
                                                    <div className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-all ${formData.is_active ? 'left-7' : 'left-1'}`} />
                                                </button>
                                            </div>

                                            <div className="p-6 bg-black/[0.02] dark:bg-white/[0.02] rounded-2xl border border-black/5 dark:border-white/5 flex items-center justify-between">
                                                <div>
                                                    <p className="text-[10px] font-bold text-gray-900 dark:text-white uppercase tracking-widest">New Badge</p>
                                                    <p className="text-[8px] text-gray-400 uppercase tracking-widest mt-1">Corner indicator</p>
                                                </div>
                                                <button 
                                                    type="button"
                                                    onClick={() => setFormData(prev => ({ ...prev, is_new: !prev.is_new }))}
                                                    className={`w-12 h-6 rounded-full transition-all relative ${formData.is_new ? 'bg-attire-accent' : 'bg-gray-300 dark:bg-white/10'}`}
                                                >
                                                    <div className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-all ${formData.is_new ? 'left-7' : 'left-1'}`} />
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                <div className="pt-8 flex gap-4">
                                    <button 
                                        type="button"
                                        onClick={handleCancel}
                                        className="flex-grow py-5 border border-black/5 dark:border-white/10 rounded-2xl text-[11px] font-bold uppercase tracking-[0.3em] text-gray-400 hover:text-gray-900 dark:hover:text-white transition-all"
                                    >
                                        Dismiss
                                    </button>
                                    <button 
                                        type="submit"
                                        disabled={saving || uploading}
                                        className="flex-grow py-5 bg-black dark:bg-white text-white dark:text-black rounded-2xl text-[11px] font-bold uppercase tracking-[0.3em] hover:bg-attire-accent transition-all flex items-center justify-center gap-3 disabled:opacity-50"
                                    >
                                        {saving ? <Loader className="animate-spin" size={16} /> : <Check size={16} />}
                                        {saving ? 'Committing...' : 'Publish Collection'}
                                    </button>
                                </div>
                            </form>
                        </motion.div>
                    )}
                </AnimatePresence>

                {/* Collections List */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {collectionsLoading && collections.length === 0 ? (
                        [...Array(3)].map((_, i) => (
                            <div key={i} className="h-96 rounded-3xl bg-black/5 dark:bg-white/5 animate-pulse" />
                        ))
                    ) : (
                        collections.map((col, idx) => (
                            <motion.div
                                key={col.id}
                                layout
                                initial={{ opacity: 0, scale: 0.9 }}
                                animate={{ opacity: 1, scale: 1 }}
                                transition={{ delay: idx * 0.05 }}
                                className={`group relative h-[28rem] rounded-3xl overflow-hidden border transition-all duration-500 ${editingId === col.id ? 'border-attire-accent ring-4 ring-attire-accent/10' : 'border-black/5 dark:border-white/10 hover:border-attire-accent/30 shadow-2xl shadow-black/5'}`}
                            >
                                {/* Visual */}
                                <div className="absolute inset-0">
                                    <OptimizedImage
                                        src={col.image_url}
                                        alt={col.name}
                                        containerClassName="w-full h-full"
                                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-1000"
                                    />
                                    <div className="absolute inset-0 bg-gradient-to-t from-black via-black/20 to-transparent" />
                                </div>

                                {/* Status Badges */}
                                <div className="absolute top-6 left-6 flex flex-col gap-2 z-20">
                                    {col.is_new && (
                                        <div className="px-3 py-1 bg-attire-accent text-black text-[9px] font-black uppercase tracking-[0.2em] rounded-full shadow-lg">
                                            New Arrival
                                        </div>
                                    )}
                                    {!col.is_active && (
                                        <div className="px-3 py-1 bg-red-500 text-white text-[9px] font-black uppercase tracking-[0.2em] rounded-full shadow-lg">
                                            Hidden
                                        </div>
                                    )}
                                </div>

                                {/* Actions Overlay */}
                                <div className="absolute top-6 right-6 flex gap-2 z-20 opacity-0 group-hover:opacity-100 transition-all translate-x-4 group-hover:translate-x-0 pointer-events-none group-hover:pointer-events-auto">
                                    <button 
                                        onClick={(e) => { e.preventDefault(); e.stopPropagation(); handleEdit(col); }}
                                        className="p-3 bg-white/10 backdrop-blur-md border border-white/20 text-white rounded-xl hover:bg-white hover:text-black transition-all cursor-pointer pointer-events-auto"
                                    >
                                        <Edit2 size={18} />
                                    </button>
                                    <button 
                                        onClick={(e) => { e.preventDefault(); e.stopPropagation(); handleDelete(col.id, col.name); }}
                                        className="p-3 bg-red-500/20 backdrop-blur-md border border-red-500/30 text-red-400 rounded-xl hover:bg-red-500 hover:text-white transition-all cursor-pointer pointer-events-auto"
                                    >
                                        <Trash2 size={18} />
                                    </button>
                                </div>

                                {/* Content */}
                                <div className="absolute inset-x-0 bottom-0 p-8 z-10">
                                    <div className="flex items-end justify-between mb-4">
                                        <div>
                                            <span className="text-attire-accent text-[10px] font-bold uppercase tracking-[0.3em] mb-2 block">{col.year} Collection</span>
                                            <h3 className="text-3xl font-serif text-white">{col.name}</h3>
                                        </div>
                                        <div className="w-12 h-12 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center text-white/40">
                                            <span className="text-xs font-mono">#{col.sort_order}</span>
                                        </div>
                                    </div>
                                    <p className="text-white/60 text-sm font-light leading-relaxed line-clamp-2 mb-6 group-hover:text-white/90 transition-colors">
                                        {col.description}
                                    </p>
                                    <div className="h-1 w-full bg-white/10 rounded-full overflow-hidden">
                                        <motion.div 
                                            initial={{ width: 0 }}
                                            whileInView={{ width: '100%' }}
                                            className="h-full bg-attire-accent"
                                        />
                                    </div>
                                </div>
                            </motion.div>
                        ))
                    )}
                </div>
            </main>
        </div>
    );
};

export default CollectionManager;
