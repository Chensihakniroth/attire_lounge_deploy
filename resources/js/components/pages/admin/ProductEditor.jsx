import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Check, AlertCircle, RefreshCw, Eye, EyeOff, ChevronLeft, ChevronDown, Plus, Trash2, ImageIcon, Star, Zap, Package, Search as SearchIcon, GripVertical, ArrowUp } from 'lucide-react';
import { LumaSpin } from '../../ui/luma-spin';
import axios from 'axios';
import { useAdmin } from './AdminContext';
import { Section, Field, inputBase } from './common/FormPrimitives';

/* ─── Custom Dropdown ─────────────────────────────────────────────────── */
const CustomDropdown = ({ selected, options, onChange, icon: Icon = RefreshCw, className = "", label = "Select Option" }) => {
    const [isOpen, setIsOpen] = useState(false);
    const selectedItem = options.find(o => o.slug === selected || o.name === selected || o.id === selected);
    const displayName = selectedItem ? selectedItem.name : label;

    return (
        <div className={`relative ${className}`}>
            <button
                type="button"
                onClick={() => setIsOpen(!isOpen)}
                className="w-full bg-black/5 dark:bg-[#0d1117] border border-black/5 dark:border-[#30363d] rounded-xl py-3.5 px-4 text-gray-900 dark:text-[#c9d1d9] text-sm text-left focus:border-[#0d3542] dark:focus:border-[#58a6ff] outline-none transition-all cursor-pointer flex items-center justify-between group"
            >
                <div className="flex items-center gap-2.5">
                    <Icon className="text-gray-400 dark:text-[#8b949e]/40 group-hover:text-[#0d3542] dark:group-hover:text-[#58a6ff] transition-colors" size={16} />
                    <span className="truncate">{displayName}</span>
                </div>
                <div className={`transition-transform duration-300 ${isOpen ? 'rotate-180' : ''}`}>
                    <ChevronDown size={14} className="text-gray-300 dark:text-[#8b949e]/20" />
                </div>
            </button>

            <AnimatePresence>
                {isOpen && (
                    <>
                        <div className="fixed inset-0 z-[60]" onClick={() => setIsOpen(false)} />
                        <motion.div
                            initial={{ opacity: 0, y: 8, scale: 0.96 }}
                            animate={{ opacity: 1, y: 0, scale: 1 }}
                            exit={{ opacity: 0, y: 8, scale: 0.96 }}
                            transition={{ duration: 0.15, ease: [0.22, 1, 0.36, 1] }}
                            className="absolute top-full left-0 right-0 mt-1.5 z-[70] bg-white dark:bg-[#161b22] border border-black/5 dark:border-[#30363d] rounded-xl overflow-hidden"
                        >
                            <div className="max-h-60 overflow-y-auto p-1.5 attire-scrollbar">
                                {options.map((opt, idx) => (
                                    <button
                                        key={opt.id || opt.slug || opt.name}
                                        type="button"
                                        onClick={() => { onChange(opt.id || opt.slug || opt.name); setIsOpen(false); }}
                                        className={`w-full text-left px-3.5 py-2.5 rounded-lg text-xs font-bold uppercase tracking-widest transition-all ${idx > 0 ? 'mt-0.5' : ''} ${(selected === opt.id || selected === opt.slug || selected === opt.name) ? 'bg-[#0d3542] dark:bg-[#58a6ff] text-white dark:text-black' : 'text-gray-500 dark:text-[#8b949e] hover:bg-black/5 dark:hover:bg-[#0d1117] hover:text-gray-900 dark:hover:text-[#c9d1d9]'}`}
                                    >
                                        {opt.name}
                                    </button>
                                ))}
                            </div>
                        </motion.div>
                    </>
                )}
            </AnimatePresence>
        </div>
    );
};

/* ─── Toggle Switch ───────────────────────────────────────────────────── */
const Toggle = ({ label, checked, onChange, color = 'teal' }) => {
    const colors = {
        teal: { bg: 'bg-[#0d3542] dark:bg-[#58a6ff]', off: 'bg-black/10 dark:bg-black/40' },
        green: { bg: 'bg-emerald-500', off: 'bg-black/10 dark:bg-black/40' },
        red: { bg: 'bg-red-500', off: 'bg-black/10 dark:bg-black/40' },
    };
    const c = colors[color] || colors.teal;

    return (
        <button
            type="button"
            onClick={onChange}
            className="flex items-center justify-between gap-3 w-full group"
        >
            <span className="text-[10px] font-bold text-gray-500 dark:text-[#8b949e] uppercase tracking-widest group-hover:text-gray-900 dark:group-hover:text-white transition-colors">{label}</span>
            <div className={`w-10 h-6 rounded-full transition-all duration-300 relative shrink-0 ${checked ? c.bg : c.off}`}>
                <div className={`absolute top-0.5 w-5 h-5 bg-white rounded-full transition-all duration-300 ${checked ? 'left-[18px]' : 'left-0.5'}`} />
            </div>
        </button>
    );
};

/* ═══════════════════════════════════════════════════════════════════════ */
/*  PRODUCT EDITOR                                                        */
/* ═══════════════════════════════════════════════════════════════════════ */
const ProductEditor = ({ isNew = false }) => {
    const { productId } = useParams();
    const navigate = useNavigate();
    const { setIsEditing } = useAdmin();
    const [loading, setLoading] = useState(!isNew);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState(null);
    const [success, setSuccess] = useState(false);
    const [product, setProduct] = useState(null);
    const formRef = useRef(null);

    const [formData, setFormData] = useState({
        name: '',
        slug: '',
        price: '',
        description: '',
        availability: 'In Stock',
        is_featured: false,
        is_new: true,
        is_visible: true,
        fabric: '',
        silhouette: '',
        details: '',
        sizing: [],
        category_id: '',
        collection_id: '',
        images: [],
        meta_title: '',
        meta_description: ''
    });

    const [categories, setCategories] = useState([]);
    const [collections, setCollections] = useState([]);
    const [uploading, setUploading] = useState(false);

    const updateField = (key, value) => setFormData(prev => ({ ...prev, [key]: value }));

    useEffect(() => {
        setIsEditing(true);
        return () => setIsEditing(false);
    }, [setIsEditing]);

    /* ─── Image Upload ────────────────────────────────────────────── */
    const handleImageUpload = async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        if (!formData.collection_id) {
            if (!window.confirm("No collection selected. The image will be uploaded to the general assets folder. Continue?")) {
                return;
            }
        }

        setUploading(true);
        const formDataUpload = new FormData();
        formDataUpload.append('image', file);
        if (formData.collection_id) {
            formDataUpload.append('collection_id', formData.collection_id);
        }

        try {
            const response = await axios.post('/api/v1/admin/images/upload', formDataUpload, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });
            
            if (response.data.url) {
                setFormData(prev => {
                    const newData = { ...prev };
                    newData.images = [...prev.images, response.data.url];
                    
                    if (!newData.slug && isNew) {
                        newData.slug = response.data.filename;
                    }
                    
                    return newData;
                });
            }
        } catch (err) {
            console.error("Upload Failed:", err);
            setError('Failed to upload image. Please try again.');
        } finally {
            setUploading(false);
        }
    };

    const handleRemoveImage = (indexToRemove) => {
        setFormData(prev => ({
            ...prev,
            images: prev.images.filter((_, index) => index !== indexToRemove)
        }));
    };

    /* ─── Fetch Metadata ──────────────────────────────────────────── */
    useEffect(() => {
        const fetchMetadata = async () => {
            try {
                const [catsRes, collsRes] = await Promise.all([
                    axios.get('/api/v1/products/categories'),
                    axios.get('/api/v1/products/collections')
                ]);
                
                if (catsRes.data && catsRes.data.success) {
                    const data = catsRes.data.data || [];
                    const formatted = data.map(c => {
                        if (typeof c === 'object') return { name: c.name, id: c.id };
                        return { name: c, id: c };
                    });
                    setCategories(formatted);
                }
                
                if (collsRes.data && collsRes.data.success) {
                    const data = collsRes.data.data || [];
                    setCollections(data.map(c => ({ name: c.name, id: c.id })));
                }
            } catch (err) {
                console.error('Failed to fetch metadata:', err);
            }
        };

        fetchMetadata();

        if (!isNew && productId) {
            const fetchProduct = async () => {
                try {
                    const response = await axios.get(`/api/v1/products/${productId}`);
                    if (response.data.success) {
                        const p = response.data.data;
                        setProduct(p);
                        setFormData({
                            name: p.name,
                            slug: p.slug || '',
                            price: p.price,
                            description: p.description || '',
                            availability: p.availability || (p.in_stock ? 'In Stock' : 'Out of Stock'),
                            is_featured: p.featured,
                            is_new: p.is_new,
                            is_visible: p.is_visible,
                            fabric: p.fabric || '',
                            silhouette: p.silhouette || '',
                            details: p.details || '',
                            sizing: Array.isArray(p.sizes) ? p.sizes : [],
                            category_id: p.category_id || '',
                            collection_id: p.collection_id || '',
                            images: Array.isArray(p.images) ? p.images : [],
                            meta_title: p.meta_title || '',
                            meta_description: p.meta_description || ''
                        });
                    }
                } catch (err) {
                    console.error('Failed to fetch product:', err);
                    setError('Failed to load product details.');
                } finally {
                    setLoading(false);
                }
            };
            fetchProduct();
        }
    }, [productId, isNew]);

    /* ─── Submit ──────────────────────────────────────────────────── */
    const handleSubmit = async (e) => {
        e.preventDefault();
        
        if (!formData.category_id) {
            setError("Please select a category for this masterpiece.");
            return;
        }

        setSaving(true);
        setError(null);
        setSuccess(false);
        try {
            const url = isNew ? '/api/v1/admin/products' : `/api/v1/admin/products/${product.id}`;
            const method = isNew ? 'post' : 'put';
            
            const response = await axios[method](url, formData);
            if (response.data.success) {
                setSuccess(true);
                setTimeout(() => navigate('/admin/products'), 600);
            }
        } catch (err) {
            console.error('Failed to save product:', err);
            setError(err.response?.data?.message || 'Failed to save changes. Please try again.');
        } finally {
            setSaving(false);
        }
    };

    /* ─── Size Toggle Helper ──────────────────────────────────────── */
    const toggleSize = (size) => {
        setFormData(prev => ({
            ...prev,
            sizing: prev.sizing.includes(size)
                ? prev.sizing.filter(s => s !== size)
                : [...prev.sizing, size]
        }));
    };

    const SizeButton = ({ size }) => {
        const isSelected = formData.sizing.includes(size);
        return (
            <button
                type="button"
                onClick={() => toggleSize(size)}
                className={`px-3 py-1.5 rounded-lg text-[10px] font-bold transition-all border ${isSelected ? 'bg-[#0d3542] dark:bg-[#58a6ff] border-[#0d3542] dark:border-[#58a6ff] text-white dark:text-black' : 'bg-black/5 dark:bg-[#0d1117] border-black/5 dark:border-[#30363d] text-gray-500 dark:text-[#8b949e] hover:text-gray-900 dark:hover:text-white hover:border-gray-300 dark:hover:border-[#58a6ff]/30'}`}
            >
                {size}
            </button>
        );
    };

    /* ─── Loading ─────────────────────────────────────────────────── */
    if (loading) {
        return (
            <div className="min-h-screen bg-[#fdfdfc] dark:bg-[#0d1117] flex flex-col items-center justify-center space-y-6">
                <LumaSpin size="lg" />
                <p className="text-gray-500 dark:text-[#8b949e] text-[11px] font-black uppercase tracking-[0.4em] animate-pulse">Preparing Canvas...</p>
            </div>
        );
    }

    /* ═══ RENDER ══════════════════════════════════════════════════════ */
    return (
        <div className="min-h-screen bg-[#fdfdfc] dark:bg-[#0d1117] flex flex-col transition-colors duration-300">
            {/* ─── Sticky Header ───────────────────────────────────────── */}
            <div className="sticky top-0 z-20 bg-white/80 dark:bg-[#161b22]/80 backdrop-blur-xl border-b border-black/5 dark:border-[#30363d]">
                <div className="max-w-6xl mx-auto px-6 h-16 flex justify-between items-center">
                    <div className="flex items-center gap-4">
                        <button 
                            onClick={() => navigate('/admin/products')}
                            className="p-2 hover:bg-black/5 dark:hover:bg-white/5 rounded-xl transition-all text-gray-400 dark:text-[#8b949e]/40 hover:text-gray-900 dark:hover:text-white"
                        >
                            <ChevronLeft size={20} />
                        </button>

                        {/* Mini thumbnail in header (edit mode only) */}
                        {!isNew && formData.images.length > 0 && (
                            <div className="w-9 h-9 rounded-lg overflow-hidden border border-black/5 dark:border-[#30363d] shrink-0">
                                <img src={formData.images[0]} alt="" className="w-full h-full object-cover" />
                            </div>
                        )}

                        <div>
                            <h2 className="text-sm font-bold text-gray-900 dark:text-[#c9d1d9] uppercase tracking-wider">
                                {isNew ? 'New Masterpiece' : (formData.name || 'Edit Product')}
                            </h2>
                            <p className="text-[9px] text-gray-400 dark:text-[#8b949e]/40 uppercase tracking-widest font-mono">
                                {isNew ? 'Creating...' : formData.slug}
                            </p>
                        </div>
                    </div>

                    <div className="flex items-center gap-2">
                        {/* Visibility badge */}
                        <div className={`hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[9px] font-bold uppercase tracking-widest ${formData.is_visible ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400' : 'bg-red-500/10 text-red-600 dark:text-red-400'}`}>
                            <div className={`w-1.5 h-1.5 rounded-full ${formData.is_visible ? 'bg-emerald-500' : 'bg-red-500'}`} />
                            {formData.is_visible ? 'Visible' : 'Hidden'}
                        </div>

                        <button 
                            onClick={() => navigate('/admin/products')}
                            className="p-2 hover:bg-black/5 dark:hover:bg-white/5 rounded-xl transition-all text-gray-400 dark:text-[#8b949e]/40 hover:text-gray-900 dark:hover:text-white"
                        >
                            <X size={20} />
                        </button>
                    </div>
                </div>
            </div>

            {/* ─── Toast Notifications ─────────────────────────────────── */}
            <AnimatePresence>
                {error && (
                    <motion.div 
                        initial={{ opacity: 0, y: -20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -20 }}
                        className="sticky top-16 z-10 mx-auto max-w-6xl px-6 pt-3"
                    >
                        <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-xl flex items-center gap-3 text-red-600 dark:text-red-400 text-sm">
                            <AlertCircle size={16} />
                            <span className="flex-1 text-xs">{error}</span>
                            <button type="button" onClick={() => setError(null)} className="p-1 hover:bg-red-500/10 rounded-lg"><X size={14} /></button>
                        </div>
                    </motion.div>
                )}
                {success && (
                    <motion.div 
                        initial={{ opacity: 0, y: -20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -20 }}
                        className="sticky top-16 z-10 mx-auto max-w-6xl px-6 pt-3"
                    >
                        <div className="p-3 bg-emerald-500/10 border border-emerald-500/20 rounded-xl flex items-center gap-3 text-emerald-600 dark:text-emerald-400 text-xs font-bold uppercase tracking-widest">
                            <Check size={16} />
                            Saved successfully! Redirecting...
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* ─── Main Content (2‑Panel) ──────────────────────────────── */}
            <div className="flex-grow w-full max-w-6xl mx-auto px-6 py-8">
                <form ref={formRef} onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-[1fr_340px] gap-6 items-start">

                    {/* ═══ LEFT COLUMN ═══════════════════════════════════ */}
                    <div className="space-y-6">

                        {/* ── Identity ──────────────────────────────────── */}
                        <Section title="Identity" subtitle="Name, slug & pricing" icon={Package}>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <Field label="Product Name">
                                    <input type="text" value={formData.name}
                                        onChange={e => updateField('name', e.target.value)}
                                        className={inputBase} placeholder="Enter masterpiece name" required />
                                </Field>
                                <Field label="Slug">
                                    <input type="text" value={formData.slug}
                                        onChange={e => updateField('slug', e.target.value)}
                                        className={`${inputBase} font-mono`} placeholder="unique-identifier" required />
                                </Field>
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-4">
                                <Field label="Price ($)">
                                    <input type="number" step="0.01" value={formData.price}
                                        onChange={e => updateField('price', e.target.value)}
                                        className={`${inputBase} font-mono`} placeholder="0.00" required />
                                </Field>
                                <Field label="Availability">
                                    <CustomDropdown
                                        selected={formData.availability}
                                        options={[
                                            { name: 'In Stock', slug: 'In Stock' },
                                            { name: 'Low Stock', slug: 'Low Stock' },
                                            { name: 'Out of Stock', slug: 'Out of Stock' }
                                        ]}
                                        onChange={val => updateField('availability', val)}
                                        icon={RefreshCw}
                                    />
                                </Field>
                            </div>
                        </Section>

                        {/* ── Description ──────────────────────────────── */}
                        <Section title="Description" subtitle="Tell the story" icon={AlertCircle}>
                            <Field label="Description">
                                <textarea value={formData.description}
                                    onChange={e => updateField('description', e.target.value)}
                                    rows={4}
                                    className={`${inputBase} resize-none leading-relaxed`}
                                    placeholder="Describe the silhouette and essence..." />
                            </Field>
                        </Section>

                        {/* ── Product Imagery ─────────────────────────── */}
                        <Section title="Product Imagery" subtitle={`${formData.images.length} image${formData.images.length !== 1 ? 's' : ''} added`} icon={ImageIcon} accent>
                            <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-3">
                                {/* Upload Button */}
                                <label className={`aspect-square rounded-xl border-2 border-dashed border-black/10 dark:border-[#30363d] flex flex-col items-center justify-center cursor-pointer hover:border-[#0d3542]/50 dark:hover:border-[#58a6ff]/50 hover:bg-black/5 dark:hover:bg-[#161b22] transition-all group ${uploading ? 'pointer-events-none opacity-50' : ''}`}>
                                    <input type="file" className="hidden" accept="image/*" onChange={handleImageUpload} />
                                    <Plus size={18} className="text-gray-400 dark:text-[#8b949e] group-hover:text-[#0d3542] dark:group-hover:text-[#58a6ff] transition-colors mb-1" />
                                    <span className="text-[8px] font-bold uppercase tracking-widest text-gray-400 dark:text-[#8b949e]/40 group-hover:text-[#0d3542] dark:group-hover:text-[#58a6ff] transition-colors">Add</span>
                                </label>

                                <AnimatePresence mode="popLayout">
                                    {uploading && (
                                        <motion.div key="uploading" initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.8 }}
                                            className="aspect-square rounded-xl border border-[#0d3542]/30 dark:border-[#58a6ff]/30 bg-[#0d3542]/5 dark:bg-[#58a6ff]/5 flex flex-col items-center justify-center gap-1.5">
                                            <Loader2 className="animate-spin" size={16} />
                                            <span className="text-[7px] font-bold uppercase tracking-widest text-[#0d3542] dark:text-[#58a6ff]">Uploading</span>
                                        </motion.div>
                                    )}
                                    {formData.images.map((url, idx) => (
                                        <motion.div key={url} layout initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.8 }}
                                            className="aspect-square rounded-xl overflow-hidden border border-black/5 dark:border-white/10 relative group">
                                            <img src={url} alt="" className="w-full h-full object-cover" />
                                            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                                                <button type="button" onClick={() => handleRemoveImage(idx)}
                                                    className="w-8 h-8 rounded-full bg-red-500 text-white flex items-center justify-center hover:scale-110 transition-transform">
                                                    <Trash2 size={14} />
                                                </button>
                                            </div>
                                            {idx === 0 && (
                                                <div className="absolute top-1.5 left-1.5 px-1.5 py-0.5 bg-[#0d3542] dark:bg-[#58a6ff] text-white dark:text-black text-[7px] font-black uppercase tracking-widest rounded">Cover</div>
                                            )}
                                        </motion.div>
                                    ))}
                                </AnimatePresence>
                            </div>
                            {formData.images.length === 0 && !uploading && (
                                <div className="mt-3 flex items-center gap-2 p-3 bg-black/5 dark:bg-[#0d1117] rounded-xl border border-black/5 dark:border-[#30363d] opacity-60">
                                    <ImageIcon size={14} className="text-gray-400 dark:text-[#8b949e] shrink-0" />
                                    <p className="text-[9px] font-bold uppercase tracking-widest text-gray-400 dark:text-[#8b949e]/40">Visual presence builds desire. Add at least one photo.</p>
                                </div>
                            )}
                        </Section>

                        {/* ── Material & Craft ────────────────────────── */}
                        <Section title="Material & Craft" subtitle="Fabric, silhouette, details" icon={Star}>
                            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                                <Field label="Fabric">
                                    <input type="text" value={formData.fabric}
                                        onChange={e => updateField('fabric', e.target.value)}
                                        className={inputBase} placeholder="Premium Wool Blend" />
                                </Field>
                                <Field label="Silhouette">
                                    <input type="text" value={formData.silhouette}
                                        onChange={e => updateField('silhouette', e.target.value)}
                                        className={inputBase} placeholder="Modern Tailored" />
                                </Field>
                                <Field label="Details">
                                    <input type="text" value={formData.details}
                                        onChange={e => updateField('details', e.target.value)}
                                        className={inputBase} placeholder="Hand-Finished" />
                                </Field>
                            </div>
                        </Section>

                        {/* ── Sizing ──────────────────────────────────── */}
                        <Section title="Sizing" subtitle={`${formData.sizing.length} size${formData.sizing.length !== 1 ? 's' : ''} selected`} icon={Zap}>
                            <div className="space-y-4">
                                <div className="space-y-1.5">
                                    <p className="text-[8px] uppercase tracking-widest text-gray-300 dark:text-white/20 font-bold ml-0.5">Alpha</p>
                                    <div className="flex flex-wrap gap-1.5">
                                        {['XS', 'S', 'M', 'L', 'XL', 'XXL', 'One Size'].map(s => <SizeButton key={s} size={s} />)}
                                    </div>
                                </div>
                                <div className="space-y-1.5">
                                    <p className="text-[8px] uppercase tracking-widest text-gray-300 dark:text-white/20 font-bold ml-0.5">Suits / Jackets</p>
                                    <div className="flex flex-wrap gap-1.5">
                                        {['44', '46', '48', '50', '52', '54', '56', '58', '40R', '42R', '44R'].map(s => <SizeButton key={s} size={s} />)}
                                    </div>
                                </div>
                                <div className="space-y-1.5">
                                    <p className="text-[8px] uppercase tracking-widest text-gray-300 dark:text-white/20 font-bold ml-0.5">Trousers / Waist</p>
                                    <div className="flex flex-wrap gap-1.5">
                                        {['28', '30', '32', '34', '36', '38'].map(s => <SizeButton key={s} size={s} />)}
                                    </div>
                                </div>
                            </div>
                        </Section>

                        {/* ── SEO ─────────────────────────────────────── */}
                        <Section title="Search Engine Optimization" subtitle="Control search appearance" icon={Eye} accent>
                            <div className="space-y-4">
                                <Field label="Meta Title" charCount={formData.meta_title.length} maxChars={60}>
                                    <input type="text" value={formData.meta_title}
                                        onChange={e => updateField('meta_title', e.target.value)}
                                        placeholder={formData.name || "Default: Product Name | Attire Lounge"}
                                        className={`${inputBase} bg-white dark:bg-[#0d1117]`} />
                                </Field>
                                <Field label="Meta Description" charCount={formData.meta_description.length} maxChars={160}>
                                    <textarea value={formData.meta_description}
                                        onChange={e => updateField('meta_description', e.target.value)}
                                        rows={2}
                                        className={`${inputBase} bg-white dark:bg-[#0d1117] resize-none leading-relaxed`}
                                        placeholder="Briefly summarize for search engines..." />
                                </Field>

                                {/* Google Preview */}
                                <div className="mt-2 p-4 bg-white dark:bg-[#0d1117] rounded-xl border border-black/5 dark:border-[#30363d]">
                                    <p className="text-[8px] font-bold text-gray-300 dark:text-[#8b949e]/20 uppercase tracking-[0.2em] mb-2">Google Preview</p>
                                    <p className="text-[#1a0dab] dark:text-[#8ab4f8] text-sm font-medium truncate">
                                        {formData.meta_title || formData.name || "Product Name"} | Attire Lounge
                                    </p>
                                    <p className="text-[#006621] dark:text-[#3fb34f] text-xs truncate">
                                        attirelounge.com/shop/{formData.slug || 'product'}
                                    </p>
                                    <p className="text-[#4d5156] dark:text-[#bdc1c6] text-xs line-clamp-2 leading-relaxed mt-0.5">
                                        {formData.meta_description || formData.description || "The piece that defines contemporary elegance..."}
                                    </p>
                                </div>
                            </div>
                        </Section>
                    </div>

                    {/* ═══ RIGHT SIDEBAR ═════════════════════════════════ */}
                    <div className="lg:sticky lg:top-[80px] space-y-5">

                        {/* ── Classification ──────────────────────────── */}
                        <Section title="Classification" icon={Package}>
                            <div className="space-y-4">
                                <Field label="Category">
                                    <CustomDropdown
                                        selected={formData.category_id}
                                        options={categories}
                                        onChange={val => updateField('category_id', val)}
                                        icon={ImageIcon}
                                        label="Select a Category"
                                    />
                                </Field>
                                <Field label="Collection">
                                    <CustomDropdown
                                        selected={formData.collection_id}
                                        options={collections}
                                        onChange={val => updateField('collection_id', val)}
                                        icon={ImageIcon}
                                        label="Select a Collection"
                                    />
                                </Field>
                            </div>
                        </Section>

                        {/* ── Flags ────────────────────────────────────── */}
                        <Section title="Flags" icon={Star}>
                            <div className="space-y-3">
                                <Toggle label="Featured" checked={formData.is_featured} onChange={() => updateField('is_featured', !formData.is_featured)} />
                                <div className="h-px bg-black/5 dark:bg-white/5" />
                                <Toggle label="New Arrival" checked={formData.is_new} onChange={() => updateField('is_new', !formData.is_new)} color="teal" />
                            </div>
                        </Section>

                        {/* ── Visibility ───────────────────────────────── */}
                        <div className={`rounded-2xl border p-5 transition-colors ${formData.is_visible ? 'border-emerald-500/20 bg-emerald-500/[0.03]' : 'border-red-500/20 bg-red-500/[0.03]'}`}>
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-xs font-bold text-gray-900 dark:text-[#c9d1d9] uppercase tracking-wider">Visibility</p>
                                    <p className="text-[9px] text-gray-400 dark:text-[#8b949e]/60 mt-0.5 uppercase tracking-widest">Store listing</p>
                                </div>
                                <button 
                                    type="button"
                                    onClick={() => updateField('is_visible', !formData.is_visible)}
                                    className={`w-14 h-8 rounded-full transition-all duration-500 relative flex items-center px-1 ${formData.is_visible ? 'bg-emerald-500/20 border border-emerald-500/30' : 'bg-red-500/20 border border-red-500/30'}`}
                                >
                                    <div className={`w-6 h-6 rounded-full flex items-center justify-center transition-all duration-500 ${formData.is_visible ? 'translate-x-6 bg-emerald-500' : 'translate-x-0 bg-red-500'}`}>
                                        {formData.is_visible ? <Check size={12} className="text-white" /> : <X size={12} className="text-white" />}
                                    </div>
                                </button>
                            </div>
                        </div>

                        {/* ── Actions ──────────────────────────────────── */}
                        <div className="space-y-2.5 pt-2">
                            <button type="submit" disabled={saving}
                                className="w-full py-4 bg-[#0d3542] dark:bg-[#58a6ff] text-white dark:text-black rounded-xl text-[11px] font-bold uppercase tracking-[0.3em] hover:bg-black dark:hover:bg-white transition-all flex items-center justify-center gap-3 disabled:opacity-50">
                                {saving ? <Loader2 className="animate-spin" size={16} /> : <Check size={16} />}
                                {saving ? 'Processing...' : (isNew ? 'Create Masterpiece' : 'Commit Changes')}
                            </button>
                            <button type="button" onClick={() => navigate('/admin/products')}
                                className="w-full py-3 border border-black/5 dark:border-[#30363d] rounded-xl text-[10px] font-bold uppercase tracking-[0.3em] text-gray-400 dark:text-[#8b949e]/50 hover:text-gray-900 dark:hover:text-white hover:bg-black/5 dark:hover:bg-[#161b22] transition-all">
                                Cancel
                            </button>
                        </div>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default ProductEditor;
