import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Plus,
    Edit2,
    Trash2,
    X,
    Check,
    Loader,
    Image as ImageIcon,
    Upload,
    AlertCircle,
} from 'lucide-react';
import axios from 'axios';
import { useAdmin } from './AdminContext';
import OptimizedImage from '../../common/OptimizedImage.jsx';
import { useQueryClient } from '@tanstack/react-query';

const DEFAULT_FORM = {
    name: '',
    slug: '',
    description: '',
    year: new Date().getFullYear(),
    image: '',
    is_active: true,
    is_new: false,
    sort_order: 0,
    meta_title: '',
    meta_description: '',
};

const Toggle = ({ value, onChange, color = 'bg-green-500' }) => (
    <button
        type="button"
        onClick={() => onChange(!value)}
        className={`w-10 h-5 rounded-full transition-all relative flex-shrink-0 ${value ? color : 'bg-gray-200 dark:bg-white/10'}`}
    >
        <div
            className={`absolute top-0.5 w-4 h-4 bg-white rounded-full shadow transition-all ${value ? 'left-5' : 'left-0.5'}`}
        />
    </button>
);

const CollectionManager = () => {
    const queryClient = useQueryClient();
    const { collections, fetchCollections, collectionsLoading } = useAdmin();
    const [showModal, setShowModal] = useState(false);
    const [editingId, setEditingId] = useState(null);
    const [saving, setSaving] = useState(false);
    const [uploading, setUploading] = useState(false);
    const [error, setError] = useState(null);
    const [formData, setFormData] = useState(DEFAULT_FORM);

    useEffect(() => {
        fetchCollections();
    }, [fetchCollections]);

    const openModal = (collection = null) => {
        setError(null);
        if (collection) {
            setEditingId(collection.id);
            setFormData({
                name: collection.name,
                slug: collection.slug,
                description: collection.description || '',
                year: collection.year,
                image: collection.image_url || '',
                is_active: collection.is_active,
                is_new: collection.is_new,
                sort_order: collection.sort_order || 0,
                meta_title: collection.meta_title || '',
                meta_description: collection.meta_description || '',
            });
        } else {
            setEditingId(null);
            setFormData({
                ...DEFAULT_FORM,
                sort_order: collections.length,
                is_new: true,
            });
        }
        setShowModal(true);
    };

    const closeModal = () => {
        setShowModal(false);
        setEditingId(null);
        setError(null);
    };

    const handleNameChange = (val) => {
        setFormData((prev) => ({
            ...prev,
            name: val,
            slug: !editingId
                ? val
                      .toLowerCase()
                      .replace(/ /g, '-')
                      .replace(/[^\w-]/g, '')
                : prev.slug,
        }));
    };

    const handleImageUpload = async (e) => {
        const file = e.target.files[0];
        if (!file) return;
        setUploading(true);
        const data = new FormData();
        data.append('image', file);
        if (editingId) data.append('collection_id', editingId);
        try {
            const res = await axios.post('/api/v1/admin/images/upload', data, {
                headers: { 'Content-Type': 'multipart/form-data' },
            });
            if (res.data.url)
                setFormData((prev) => ({ ...prev, image: res.data.url }));
        } catch {
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
            const url = editingId
                ? `/api/v1/admin/collections/${editingId}`
                : '/api/v1/admin/collections';
            const method = editingId ? 'patch' : 'post';
            const res = await axios[method](url, formData);
            if (res.data.success) {
                queryClient.invalidateQueries();
                closeModal();
            }
        } catch (err) {
            setError(
                err.response?.data?.message || 'Failed to save collection.'
            );
        } finally {
            setSaving(false);
        }
    };

    const handleDelete = async (id, name) => {
        if (
            !window.confirm(
                `Delete "${name}"? This will fail if it has products.`
            )
        )
            return;
        try {
            const res = await axios.delete(`/api/v1/admin/collections/${id}`);
            if (res.data.success) queryClient.invalidateQueries();
        } catch (err) {
            alert(
                err.response?.data?.message || 'Failed to delete collection.'
            );
        }
    };

    return (
        <div className="space-y-8 pb-24">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-black/5 dark:border-white/10">
                <div>
                    <h1 className="text-4xl font-serif text-gray-900 dark:text-white mb-1">
                        Collections
                    </h1>
                    <p className="text-gray-400 dark:text-attire-silver/50 text-xs uppercase tracking-widest">
                        {collections.length} active{' '}
                        {collections.length === 1
                            ? 'collection'
                            : 'collections'}
                    </p>
                </div>
                <motion.button
                    whileTap={{ scale: 0.95 }}
                    onClick={() => openModal()}
                    className="flex items-center gap-2 bg-attire-accent text-black rounded-2xl py-3 px-6 text-[10px] font-bold uppercase tracking-widest hover:bg-white transition-all"
                >
                    <Plus size={14} /> New Collection
                </motion.button>
            </div>

            {/* Collection Grid */}
            {collectionsLoading && collections.length === 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {[...Array(3)].map((_, i) => (
                        <div
                            key={i}
                            className="h-72 rounded-3xl bg-black/5 dark:bg-white/5 animate-pulse"
                        />
                    ))}
                </div>
            ) : collections.length === 0 ? (
                <div className="text-center py-24 text-gray-400 dark:text-attire-silver/30 text-sm">
                    No collections yet. Create your first one!
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    <AnimatePresence>
                        {collections.map((col, idx) => (
                            <motion.div
                                key={col.id}
                                layout
                                initial={{ opacity: 0, scale: 0.95 }}
                                animate={{ opacity: 1, scale: 1 }}
                                exit={{ opacity: 0, scale: 0.95 }}
                                transition={{ delay: idx * 0.04 }}
                                className="group relative h-72 rounded-3xl overflow-hidden border border-black/5 dark:border-white/10 hover:border-attire-accent/30 shadow-xl shadow-black/5 transition-all duration-500"
                            >
                                {/* Image */}
                                <div className="absolute inset-0">
                                    {col.image_url ? (
                                        <OptimizedImage
                                            src={col.image_url}
                                            alt={col.name}
                                            containerClassName="w-full h-full"
                                            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-1000"
                                        />
                                    ) : (
                                        <div className="w-full h-full flex items-center justify-center bg-black/5 dark:bg-white/5">
                                            <ImageIcon
                                                size={40}
                                                className="text-gray-300 dark:text-white/10"
                                            />
                                        </div>
                                    )}
                                    <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent" />
                                </div>

                                {/* Status Badges */}
                                <div className="absolute top-4 left-4 flex gap-2 z-10">
                                    {col.is_new && (
                                        <span className="px-2.5 py-1 bg-attire-accent text-black text-[8px] font-black uppercase tracking-widest rounded-full">
                                            New
                                        </span>
                                    )}
                                    {!col.is_active && (
                                        <span className="px-2.5 py-1 bg-red-500 text-white text-[8px] font-black uppercase tracking-widest rounded-full">
                                            Hidden
                                        </span>
                                    )}
                                </div>

                                {/* Action Buttons */}
                                <div className="absolute top-4 right-4 flex gap-2 z-10 opacity-0 group-hover:opacity-100 transition-all translate-y-1 group-hover:translate-y-0 pointer-events-none group-hover:pointer-events-auto">
                                    <button
                                        onClick={() => openModal(col)}
                                        className="p-2.5 bg-white/10 backdrop-blur-md border border-white/20 text-white rounded-xl hover:bg-white hover:text-black transition-all"
                                    >
                                        <Edit2 size={14} />
                                    </button>
                                    <button
                                        onClick={() =>
                                            handleDelete(col.id, col.name)
                                        }
                                        className="p-2.5 bg-red-500/20 backdrop-blur-md border border-red-500/30 text-red-400 rounded-xl hover:bg-red-500 hover:text-white transition-all"
                                    >
                                        <Trash2 size={14} />
                                    </button>
                                </div>

                                {/* Content */}
                                <div className="absolute inset-x-0 bottom-0 p-6 z-10">
                                    <span className="text-attire-accent text-[9px] font-bold uppercase tracking-[0.3em] mb-1 block">
                                        {col.year}
                                    </span>
                                    <h3 className="text-2xl font-serif text-white mb-1">
                                        {col.name}
                                    </h3>
                                    {col.description && (
                                        <p className="text-white/50 text-xs line-clamp-1 group-hover:text-white/70 transition-colors">
                                            {col.description}
                                        </p>
                                    )}
                                </div>
                            </motion.div>
                        ))}
                    </AnimatePresence>
                </div>
            )}

            {/* Modal */}
            {typeof document !== 'undefined' &&
                createPortal(
                    <AnimatePresence>
                        {showModal && (
                            <div className="fixed inset-0 z-[99999] flex items-center justify-center p-6">
                                <motion.div
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    exit={{ opacity: 0 }}
                                    onClick={closeModal}
                                    className="absolute inset-0 bg-black/40 backdrop-blur-xl"
                                />
                                <motion.div
                                    initial={{ opacity: 0, scale: 0.96, y: 20 }}
                                    animate={{ opacity: 1, scale: 1, y: 0 }}
                                    exit={{ opacity: 0, scale: 0.96, y: 20 }}
                                    className="relative w-full max-w-2xl bg-white dark:bg-[#0d0d0d] border border-black/5 dark:border-white/10 rounded-[2rem] overflow-hidden shadow-2xl z-[10000]"
                                >
                                    {/* Modal Header */}
                                    <div className="px-8 pt-8 pb-6 flex justify-between items-center border-b border-black/5 dark:border-white/5">
                                        <div>
                                            <h2 className="text-xl font-serif text-gray-900 dark:text-white">
                                                {editingId
                                                    ? 'Edit Collection'
                                                    : 'New Collection'}
                                            </h2>
                                            {editingId && (
                                                <p className="text-[10px] text-gray-400 uppercase tracking-widest mt-1 font-mono">
                                                    {formData.slug}
                                                </p>
                                            )}
                                        </div>
                                        <button
                                            onClick={closeModal}
                                            className="p-2.5 bg-black/5 dark:bg-white/5 rounded-full text-gray-400 hover:text-gray-900 dark:hover:text-white transition-all"
                                        >
                                            <X size={18} />
                                        </button>
                                    </div>

                                    <form
                                        onSubmit={handleSubmit}
                                        className="p-8"
                                    >
                                        <div className="flex gap-6">
                                            {/* Image Uploader */}
                                            <div className="flex-shrink-0">
                                                <label className="text-[9px] font-bold text-gray-400 uppercase tracking-widest block mb-2">
                                                    Cover
                                                </label>
                                                <label className="relative w-28 h-36 rounded-2xl overflow-hidden block cursor-pointer bg-black/5 dark:bg-white/5 border border-black/5 dark:border-white/10 group">
                                                    <input
                                                        type="file"
                                                        className="hidden"
                                                        accept="image/*"
                                                        onChange={
                                                            handleImageUpload
                                                        }
                                                    />
                                                    {formData.image ? (
                                                        <img
                                                            src={formData.image}
                                                            alt="Preview"
                                                            className="w-full h-full object-cover"
                                                        />
                                                    ) : (
                                                        <div className="w-full h-full flex items-center justify-center text-gray-300 dark:text-white/20">
                                                            <ImageIcon
                                                                size={28}
                                                            />
                                                        </div>
                                                    )}
                                                    <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-all flex items-center justify-center text-white">
                                                        {uploading ? (
                                                            <Loader
                                                                className="animate-spin"
                                                                size={18}
                                                            />
                                                        ) : (
                                                            <Upload size={18} />
                                                        )}
                                                    </div>
                                                </label>
                                            </div>

                                            {/* Right Fields */}
                                            <div className="flex-1 space-y-4">
                                                <div className="grid grid-cols-2 gap-4">
                                                    <div className="col-span-2 space-y-1.5">
                                                        <label className="text-[9px] font-bold text-gray-400 uppercase tracking-widest">
                                                            Name
                                                        </label>
                                                        <input
                                                            type="text"
                                                            required
                                                            value={
                                                                formData.name
                                                            }
                                                            onChange={(e) =>
                                                                handleNameChange(
                                                                    e.target
                                                                        .value
                                                                )
                                                            }
                                                            className="w-full bg-black/5 dark:bg-white/5 border border-black/5 dark:border-white/10 rounded-xl py-3 px-4 text-gray-900 dark:text-white text-sm focus:border-attire-accent outline-none transition-all"
                                                            placeholder="e.g. Summer Essentials"
                                                        />
                                                    </div>
                                                    <div className="space-y-1.5">
                                                        <label className="text-[9px] font-bold text-gray-400 uppercase tracking-widest">
                                                            Slug
                                                        </label>
                                                        <input
                                                            type="text"
                                                            required
                                                            value={
                                                                formData.slug
                                                            }
                                                            onChange={(e) =>
                                                                setFormData(
                                                                    (p) => ({
                                                                        ...p,
                                                                        slug: e
                                                                            .target
                                                                            .value,
                                                                    })
                                                                )
                                                            }
                                                            className="w-full bg-black/5 dark:bg-white/5 border border-black/5 dark:border-white/10 rounded-xl py-3 px-4 text-gray-900 dark:text-white/60 text-sm focus:border-attire-accent outline-none transition-all font-mono"
                                                        />
                                                    </div>
                                                    <div className="space-y-1.5">
                                                        <label className="text-[9px] font-bold text-gray-400 uppercase tracking-widest">
                                                            Year
                                                        </label>
                                                        <input
                                                            type="number"
                                                            required
                                                            value={
                                                                formData.year
                                                            }
                                                            onChange={(e) =>
                                                                setFormData(
                                                                    (p) => ({
                                                                        ...p,
                                                                        year: e
                                                                            .target
                                                                            .value,
                                                                    })
                                                                )
                                                            }
                                                            className="w-full bg-black/5 dark:bg-white/5 border border-black/5 dark:border-white/10 rounded-xl py-3 px-4 text-gray-900 dark:text-white text-sm focus:border-attire-accent outline-none transition-all font-mono"
                                                        />
                                                    </div>
                                                </div>
                                                <div className="space-y-1.5">
                                                    <label className="text-[9px] font-bold text-gray-400 uppercase tracking-widest">
                                                        Description
                                                    </label>
                                                    <textarea
                                                        rows={2}
                                                        value={formData.description}
                                                        onChange={(e) =>
                                                            setFormData((p) => ({
                                                                ...p,
                                                                description: e.target.value,
                                                            }))
                                                        }
                                                        className="w-full bg-black/5 dark:bg-white/5 border border-black/5 dark:border-white/10 rounded-xl py-3 px-4 text-gray-900 dark:text-white text-sm focus:border-attire-accent outline-none transition-all resize-none leading-relaxed"
                                                        placeholder="A brief description of this collection..."
                                                    />
                                                </div>

                                                <div className="grid grid-cols-2 gap-4 pt-2 border-t border-black/5 dark:border-white/5">
                                                    <div className="space-y-1.5">
                                                        <label className="text-[9px] font-bold text-gray-400 uppercase tracking-widest">
                                                            SEO Title
                                                        </label>
                                                        <input
                                                            type="text"
                                                            value={formData.meta_title}
                                                            onChange={(e) => setFormData(p => ({ ...p, meta_title: e.target.value }))}
                                                            className="w-full bg-black/5 dark:bg-white/5 border border-black/5 dark:border-white/10 rounded-xl py-3 px-4 text-gray-900 dark:text-white text-sm focus:border-attire-accent outline-none transition-all"
                                                            placeholder={formData.name + " | Collection"}
                                                        />
                                                    </div>
                                                    <div className="space-y-1.5">
                                                        <label className="text-[9px] font-bold text-gray-400 uppercase tracking-widest">
                                                            SEO Description
                                                        </label>
                                                        <textarea
                                                            rows={1}
                                                            value={formData.meta_description}
                                                            onChange={(e) => setFormData(p => ({ ...p, meta_description: e.target.value }))}
                                                            className="w-full bg-black/5 dark:bg-white/5 border border-black/5 dark:border-white/10 rounded-xl py-3 px-4 text-gray-900 dark:text-white text-sm focus:border-attire-accent outline-none transition-all resize-none leading-relaxed"
                                                            placeholder="Search engine snippet..."
                                                        />
                                                    </div>
                                                </div>
                                            </div>
                                        </div>

                                        {/* Toggles */}
                                        <div className="mt-6 grid grid-cols-2 gap-3">
                                            {[
                                                {
                                                    key: 'is_active',
                                                    label: 'Visible in Store',
                                                    sub: 'Show to customers',
                                                    color: 'bg-green-500',
                                                },
                                                {
                                                    key: 'is_new',
                                                    label: 'New Arrival Badge',
                                                    sub: 'Display "New" label',
                                                    color: 'bg-attire-accent',
                                                },
                                            ].map(
                                                ({
                                                    key,
                                                    label,
                                                    sub,
                                                    color,
                                                }) => (
                                                    <div
                                                        key={key}
                                                        className="flex items-center justify-between p-4 bg-black/[0.02] dark:bg-white/[0.02] rounded-2xl border border-black/5 dark:border-white/5"
                                                    >
                                                        <div>
                                                            <p className="text-[10px] font-bold text-gray-900 dark:text-white uppercase tracking-wider">
                                                                {label}
                                                            </p>
                                                            <p className="text-[9px] text-gray-400 mt-0.5">
                                                                {sub}
                                                            </p>
                                                        </div>
                                                        <Toggle
                                                            value={
                                                                formData[key]
                                                            }
                                                            onChange={(v) =>
                                                                setFormData(
                                                                    (p) => ({
                                                                        ...p,
                                                                        [key]: v,
                                                                    })
                                                                )
                                                            }
                                                            color={color}
                                                        />
                                                    </div>
                                                )
                                            )}
                                        </div>

                                        {/* Error */}
                                        {error && (
                                            <div className="mt-4 flex items-center gap-2 p-3 bg-red-500/10 border border-red-500/20 rounded-xl text-red-400 text-xs">
                                                <AlertCircle size={12} />
                                                <span>{error}</span>
                                            </div>
                                        )}

                                        {/* Actions */}
                                        <div className="mt-6 flex gap-3">
                                            <button
                                                type="button"
                                                onClick={closeModal}
                                                className="flex-grow py-3.5 border border-black/5 dark:border-white/10 rounded-xl text-[10px] font-bold uppercase tracking-widest text-gray-400 hover:text-gray-900 dark:hover:text-white transition-all"
                                            >
                                                Cancel
                                            </button>
                                            <button
                                                type="submit"
                                                disabled={saving || uploading}
                                                className="flex-grow py-3.5 bg-black dark:bg-white text-white dark:text-black rounded-xl text-[10px] font-bold uppercase tracking-widest hover:bg-attire-accent dark:hover:bg-attire-accent transition-all flex items-center justify-center gap-2 disabled:opacity-50"
                                            >
                                                {saving ? (
                                                    <Loader
                                                        className="animate-spin"
                                                        size={12}
                                                    />
                                                ) : (
                                                    <Check size={12} />
                                                )}
                                                {saving
                                                    ? 'Saving...'
                                                    : editingId
                                                      ? 'Save Changes'
                                                      : 'Create Collection'}
                                            </button>
                                        </div>
                                    </form>
                                </motion.div>
                            </div>
                        )}
                    </AnimatePresence>,
                    document.body
                )}
        </div>
    );
};

export default CollectionManager;
