import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Check, Loader, AlertCircle, RefreshCw, Eye, EyeOff, ChevronLeft, ChevronDown, Plus, Trash2, ImageIcon } from 'lucide-react';
import axios from 'axios';
import { useAdmin } from './AdminContext';

const CustomDropdown = ({ selected, options, onChange, icon: Icon = RefreshCw, className = "", label = "Select Option" }) => {
    const [isOpen, setIsOpen] = useState(false);
    const selectedItem = options.find(o => o.slug === selected || o.name === selected || o.id === selected);
    const displayName = selectedItem ? selectedItem.name : label;

    return (
        <div className={`relative ${className}`}>
            <button
                type="button"
                onClick={() => setIsOpen(!isOpen)}
                className="w-full bg-black/5 dark:bg-white/5 border border-black/5 dark:border-white/10 rounded-2xl py-5 px-6 text-gray-900 dark:text-white text-sm text-left focus:border-attire-accent outline-none transition-all cursor-pointer flex items-center justify-between group"
            >
                <div className="flex items-center gap-3">
                    <Icon className="text-gray-400 dark:text-attire-silver/40 group-hover:text-attire-accent transition-colors" size={18} />
                    <span className="truncate">{displayName}</span>
                </div>
                <div className={`transition-transform duration-300 ${isOpen ? 'rotate-180' : ''}`}>
                    <ChevronDown size={16} className="text-gray-300 dark:text-attire-silver/20" />
                </div>
            </button>

            {isOpen && (
                <>
                    <div className="fixed inset-0 z-[60]" onClick={() => setIsOpen(false)} />
                    <motion.div
                        initial={{ opacity: 0, y: 10, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        className="absolute top-full left-0 right-0 mt-2 z-[70] bg-white dark:bg-[#0d0d0d] border border-black/5 dark:border-white/10 rounded-2xl overflow-hidden shadow-2xl backdrop-blur-xl"
                    >
                        <div className="max-h-60 overflow-y-auto p-2 attire-scrollbar">
                            {options.map((opt, idx) => (
                                <button
                                    key={opt.id || opt.slug || opt.name}
                                    type="button"
                                    onClick={() => { onChange(opt.id || opt.slug || opt.name); setIsOpen(false); }}
                                    className={`w-full text-left px-4 py-3 rounded-xl text-xs font-bold uppercase tracking-widest transition-all ${idx > 0 ? 'mt-1' : ''} ${(selected === opt.id || selected === opt.slug || selected === opt.name) ? 'bg-attire-accent text-black' : 'text-gray-500 dark:text-attire-silver hover:bg-black/5 dark:hover:bg-white/5 hover:text-gray-900 dark:hover:text-white'}`}
                                >
                                    {opt.name}
                                </button>
                            ))}
                        </div>
                    </motion.div>
                </>
            )}
        </div>
    );
};

const ProductEditor = ({ isNew = false }) => {
    const { productId } = useParams();
    const navigate = useNavigate();
    const { setIsEditing } = useAdmin();
    const [loading, setLoading] = useState(!isNew);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState(null);
    const [product, setProduct] = useState(null);
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
        images: []
    });

    const [categories, setCategories] = useState([]);
    const [collections, setCollections] = useState([]);
    const [uploading, setUploading] = useState(false);

    useEffect(() => {
        setIsEditing(true);
        return () => setIsEditing(false);
    }, [setIsEditing]);

    const handleImageUpload = async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        // Visual organization is key! 
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
                console.log("========================================");
                console.log("MinIO Upload Successful! (ﾉ´ヮ`)ﾉ*:･ﾟ✧");
                console.log("Public URL:", response.data.url);
                console.log("Suggested Slug:", response.data.filename);
                console.log("========================================");
                
                setFormData(prev => {
                    const newData = { ...prev };
                    newData.images = [...prev.images, response.data.url];
                    
                    // If slug is empty, helpfully fill it from the image name! ✨
                    if (!newData.slug && isNew) {
                        newData.slug = response.data.filename;
                    }
                    
                    return newData;
                });
            }
        } catch (err) {
            console.error("========================================");
            console.error("MinIO Upload Failed! (｡>﹏<｡)");
            console.error("Error Detail:", err.response?.data || err.message);
            console.error("========================================");
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

    useEffect(() => {
        const fetchMetadata = async () => {
            try {
                console.log("Fetching metadata for dropdowns...");
                const [catsRes, collsRes] = await Promise.all([
                    axios.get('/api/v1/products/categories'),
                    axios.get('/api/v1/products/collections')
                ]);
                
                console.log("Raw Categories Response:", catsRes.data);
                console.log("Raw Collections Response:", collsRes.data);

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
                            images: Array.isArray(p.images) ? p.images : []
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

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        if (!formData.category_id) {
            setError("Please select a category for this masterpiece.");
            return;
        }

        setSaving(true);
        setError(null);
        try {
            const url = isNew ? '/api/v1/admin/products' : `/api/v1/admin/products/${product.id}`;
            const method = isNew ? 'post' : 'put';
            
            const response = await axios[method](url, formData);
            if (response.data.success) {
                navigate('/admin/products');
            }
        } catch (err) {
            console.error('Failed to save product:', err);
            setError(err.response?.data?.message || 'Failed to save changes. Please try again.');
        } finally {
            setSaving(false);
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-gray-50 dark:bg-[#050505] flex flex-col items-center justify-center">
                <Loader className="animate-spin text-attire-accent mb-4" size={32} />
                <p className="text-gray-500 dark:text-attire-silver text-xs uppercase tracking-widest">Preparing Canvas...</p>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-[#050505] flex flex-col transition-colors duration-300">
            <div className="sticky top-0 z-20 bg-white/80 dark:bg-[#0a0a0a]/80 backdrop-blur-xl border-b border-black/5 dark:border-white/5">
                <div className="max-w-4xl mx-auto px-6 h-24 flex justify-between items-center">
                    <div className="flex items-center gap-6">
                        <button 
                            onClick={() => navigate('/admin/products')}
                            className="p-3 hover:bg-black/5 dark:hover:bg-white/5 rounded-full transition-all text-gray-400 dark:text-white/40 hover:text-gray-900 dark:hover:text-white"
                        >
                            <ChevronLeft size={24} />
                        </button>
                        <div>
                            <h2 className="text-2xl font-serif text-gray-900 dark:text-white">{isNew ? 'New Masterpiece' : 'Edit Product'}</h2>
                            <p className="text-gray-400 dark:text-attire-silver text-[10px] uppercase tracking-widest mt-1 opacity-50">
                                {isNew ? 'Creating in repository' : formData.slug}
                            </p>
                        </div>
                    </div>
                    <div className="flex items-center gap-4">
                        <button 
                            onClick={() => navigate('/admin/products')}
                            className="p-3 hover:bg-black/5 dark:hover:bg-white/5 rounded-full transition-all text-gray-400 dark:text-white/40 hover:text-gray-900 dark:hover:text-white"
                        >
                            <X size={24} />
                        </button>
                    </div>
                </div>
            </div>

            <div className="flex-grow w-full max-w-4xl mx-auto px-6 py-12">
                <form onSubmit={handleSubmit} className="space-y-12">
                    <AnimatePresence>
                        {error && (
                            <motion.div 
                                initial={{ opacity: 0, x: -10 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: 10 }}
                                className="p-4 bg-red-500/10 border border-red-500/20 rounded-2xl flex items-center gap-3 text-red-600 dark:text-red-400 text-sm"
                            >
                                <AlertCircle size={18} />
                                <span>{error}</span>
                            </motion.div>
                        )}
                    </AnimatePresence>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                        <div className="space-y-3">
                            <label className="text-[10px] font-bold text-gray-400 dark:text-attire-silver/50 uppercase tracking-[0.2em] ml-1">Product Name</label>
                            <input 
                                type="text" 
                                value={formData.name}
                                onChange={e => setFormData({...formData, name: e.target.value})}
                                className="w-full bg-black/5 dark:bg-white/5 border border-black/5 dark:border-white/10 rounded-2xl py-5 px-6 text-gray-900 dark:text-white focus:border-attire-accent outline-none transition-all placeholder:text-gray-300 dark:placeholder:text-white/10"
                                placeholder="Enter masterpiece name"
                                required
                            />
                        </div>
                        <div className="space-y-3">
                            <label className="text-[10px] font-bold text-gray-400 dark:text-attire-silver/50 uppercase tracking-[0.2em] ml-1">Product Slug</label>
                            <input 
                                type="text" 
                                value={formData.slug}
                                onChange={e => setFormData({...formData, slug: e.target.value})}
                                className="w-full bg-black/5 dark:bg-white/5 border border-black/5 dark:border-white/10 rounded-2xl py-5 px-6 text-gray-900 dark:text-white focus:border-attire-accent outline-none transition-all placeholder:text-gray-300 dark:placeholder:text-white/10 font-mono"
                                placeholder="unique-product-identifier"
                                required
                            />
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                        <div className="space-y-3">
                            <label className="text-[10px] font-bold text-gray-400 dark:text-attire-silver/50 uppercase tracking-[0.2em] ml-1">Price ($)</label>
                            <input 
                                type="number" 
                                step="0.01"
                                value={formData.price}
                                onChange={e => setFormData({...formData, price: e.target.value})}
                                className="w-full bg-black/5 dark:bg-white/5 border border-black/5 dark:border-white/10 rounded-2xl py-5 px-6 text-gray-900 dark:text-white focus:border-attire-accent outline-none transition-all font-mono"
                                placeholder="0.00"
                                required
                            />
                        </div>
                        <div className="space-y-3">
                            <label className="text-[10px] font-bold text-gray-400 dark:text-attire-silver/50 uppercase tracking-[0.2em] ml-1">Availability</label>
                            <CustomDropdown 
                                selected={formData.availability}
                                options={[
                                    { name: 'In Stock', slug: 'In Stock' },
                                    { name: 'Low Stock', slug: 'Low Stock' },
                                    { name: 'Out of Stock', slug: 'Out of Stock' }
                                ]}
                                onChange={val => setFormData({...formData, availability: val})}
                                icon={RefreshCw}
                            />
                        </div>
                    </div>

                    <div className="space-y-3">
                        <label className="text-[10px] font-bold text-gray-400 dark:text-attire-silver/50 uppercase tracking-[0.2em] ml-1">Description</label>
                        <textarea 
                            value={formData.description}
                            onChange={e => setFormData({...formData, description: e.target.value})}
                            rows={5}
                            className="w-full bg-black/5 dark:bg-white/5 border border-black/5 dark:border-white/10 rounded-2xl py-5 px-6 text-gray-900 dark:text-white focus:border-attire-accent outline-none transition-all resize-none text-sm leading-relaxed"
                            placeholder="Describe the silhouette and essence..."
                        />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                        <div className="space-y-3">
                            <label className="text-[10px] font-bold text-gray-400 dark:text-attire-silver/50 uppercase tracking-[0.2em] ml-1">Category</label>
                            <CustomDropdown 
                                selected={formData.category_id}
                                options={categories}
                                onChange={val => setFormData({...formData, category_id: val})}
                                icon={ImageIcon}
                                label="Select a Category"
                            />
                        </div>
                        <div className="space-y-3">
                            <label className="text-[10px] font-bold text-gray-400 dark:text-attire-silver/50 uppercase tracking-[0.2em] ml-1">Collection</label>
                            <CustomDropdown 
                                selected={formData.collection_id}
                                options={collections}
                                onChange={val => setFormData({...formData, collection_id: val})}
                                icon={ImageIcon}
                                label="Select a Collection"
                            />
                        </div>
                    </div>

                    <div className="space-y-6">
                        <div className="flex items-center justify-between ml-1">
                            <label className="text-[10px] font-bold text-gray-400 dark:text-attire-silver/50 uppercase tracking-[0.2em]">Product Imagery</label>
                            <span className="text-[9px] text-gray-400 dark:text-attire-silver/30 font-bold uppercase tracking-widest">{formData.images.length} Images Added</span>
                        </div>
                        
                        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                            {/* Upload Button */}
                            <label className={`aspect-square rounded-2xl border-2 border-dashed border-black/10 dark:border-white/10 flex flex-col items-center justify-center cursor-pointer hover:border-attire-accent/50 hover:bg-black/5 dark:hover:bg-white/5 transition-all group ${uploading ? 'pointer-events-none opacity-50' : ''}`}>
                                <input 
                                    type="file" 
                                    className="hidden" 
                                    accept="image/*"
                                    onChange={handleImageUpload}
                                />
                                <div className="w-10 h-10 rounded-full bg-black/5 dark:bg-white/5 flex items-center justify-center mb-2 group-hover:scale-110 transition-transform">
                                    <Plus size={20} className="text-gray-400 dark:text-attire-silver" />
                                </div>
                                <span className="text-[10px] font-bold uppercase tracking-widest text-gray-400 dark:text-attire-silver/40 group-hover:text-attire-accent transition-colors">Add Photo</span>
                            </label>

                            {/* Image Previews & Loading States */}
                            <AnimatePresence mode="popLayout">
                                {uploading && (
                                    <motion.div 
                                        key="uploading-placeholder"
                                        initial={{ opacity: 0, scale: 0.8 }}
                                        animate={{ opacity: 1, scale: 1 }}
                                        exit={{ opacity: 0, scale: 0.8 }}
                                        className="aspect-square rounded-2xl border border-attire-accent/30 bg-attire-accent/5 flex flex-col items-center justify-center gap-2"
                                    >
                                        <Loader className="animate-spin text-attire-accent" size={24} />
                                        <span className="text-[8px] font-bold uppercase tracking-widest text-attire-accent">Uploading...</span>
                                    </motion.div>
                                )}
                                {formData.images.map((url, idx) => (
                                    <motion.div 
                                        key={url}
                                        layout
                                        initial={{ opacity: 0, scale: 0.8 }}
                                        animate={{ opacity: 1, scale: 1 }}
                                        exit={{ opacity: 0, scale: 0.8 }}
                                        className="aspect-square rounded-2xl overflow-hidden border border-black/5 dark:border-white/10 relative group"
                                    >
                                        <img src={url} alt="" className="w-full h-full object-cover" />
                                        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                            <button 
                                                type="button"
                                                onClick={() => handleRemoveImage(idx)}
                                                className="w-10 h-10 rounded-full bg-red-500 text-white flex items-center justify-center hover:scale-110 transition-transform shadow-xl"
                                            >
                                                <Trash2 size={18} />
                                            </button>
                                        </div>
                                        {idx === 0 && (
                                            <div className="absolute top-2 left-2 px-2 py-0.5 bg-attire-accent text-black text-[8px] font-black uppercase tracking-widest rounded-md shadow-lg">
                                                Cover
                                            </div>
                                        )}
                                    </motion.div>
                                ))}
                            </AnimatePresence>
                        </div>
                        {formData.images.length === 0 && !uploading && (
                            <div className="flex items-center gap-3 p-4 bg-black/5 dark:bg-white/5 rounded-2xl border border-black/5 dark:border-white/5 opacity-50">
                                <ImageIcon size={16} className="text-gray-400 dark:text-attire-silver" />
                                <p className="text-[10px] font-bold uppercase tracking-widest text-gray-400 dark:text-attire-silver/40 italic">Visual presence builds desire. Please add at least one masterpiece photo.</p>
                            </div>
                        )}
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                        <div className="space-y-3">
                            <label className="text-[10px] font-bold text-gray-400 dark:text-attire-silver/50 uppercase tracking-[0.2em] ml-1">Fabric</label>
                            <input 
                                type="text" 
                                value={formData.fabric}
                                onChange={e => setFormData({...formData, fabric: e.target.value})}
                                placeholder="e.g., Premium Wool Blend"
                                className="w-full bg-black/5 dark:bg-white/5 border border-black/5 dark:border-white/10 rounded-2xl py-5 px-6 text-gray-900 dark:text-white focus:border-attire-accent outline-none transition-all placeholder:text-gray-300 dark:placeholder:text-white/10"
                            />
                        </div>
                        <div className="space-y-3">
                            <label className="text-[10px] font-bold text-gray-400 dark:text-attire-silver/50 uppercase tracking-[0.2em] ml-1">Silhouette</label>
                            <input 
                                type="text" 
                                value={formData.silhouette}
                                onChange={e => setFormData({...formData, silhouette: e.target.value})}
                                placeholder="e.g., Modern Tailored"
                                className="w-full bg-black/5 dark:bg-white/5 border border-black/5 dark:border-white/10 rounded-2xl py-5 px-6 text-gray-900 dark:text-white focus:border-attire-accent outline-none transition-all placeholder:text-gray-300 dark:placeholder:text-white/10"
                            />
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                        <div className="space-y-3">
                            <label className="text-[10px] font-bold text-gray-400 dark:text-attire-silver/50 uppercase tracking-[0.2em] ml-1">Details</label>
                            <input 
                                type="text" 
                                value={formData.details}
                                onChange={e => setFormData({...formData, details: e.target.value})}
                                placeholder="e.g., Hand-Finished"
                                className="w-full bg-black/5 dark:bg-white/5 border border-black/5 dark:border-white/10 rounded-2xl py-5 px-6 text-gray-900 dark:text-white focus:border-attire-accent outline-none transition-all placeholder:text-gray-300 dark:placeholder:text-white/10"
                            />
                        </div>
                        <div className="space-y-4">
                            <label className="text-[10px] font-bold text-gray-400 dark:text-attire-silver/50 uppercase tracking-[0.2em] ml-1">Available Sizes</label>
                            
                            <div className="space-y-6">
                                {/* Alpha Sizes */}
                                <div className="space-y-2">
                                    <p className="text-[8px] uppercase tracking-widest text-gray-300 dark:text-white/20 font-bold ml-1">Alpha</p>
                                    <div className="flex flex-wrap gap-2">
                                        {['XS', 'S', 'M', 'L', 'XL', 'XXL', 'One Size'].map(size => {
                                            const isSelected = formData.sizing.includes(size);
                                            return (
                                                <button
                                                    key={size}
                                                    type="button"
                                                    onClick={() => {
                                                        const newSizing = isSelected
                                                            ? formData.sizing.filter(s => s !== size)
                                                            : [...formData.sizing, size];
                                                        setFormData({ ...formData, sizing: newSizing });
                                                    }}
                                                    className={`px-4 py-2 rounded-xl text-[10px] font-bold transition-all border ${isSelected ? 'bg-attire-accent border-attire-accent text-black' : 'bg-black/5 dark:bg-white/5 border-black/5 dark:border-white/10 text-gray-500 dark:text-attire-silver hover:text-gray-900 dark:hover:text-white hover:bg-black/10 dark:hover:bg-white/10'}`}
                                                >
                                                    {size}
                                                </button>
                                            );
                                        })}
                                    </div>
                                </div>

                                {/* Numeric/Suit Sizes */}
                                <div className="space-y-2">
                                    <p className="text-[8px] uppercase tracking-widest text-gray-300 dark:text-white/20 font-bold ml-1">Suits / Jackets</p>
                                    <div className="flex flex-wrap gap-2">
                                        {['44', '46', '48', '50', '52', '54', '56', '58', '40R', '42R', '44R'].map(size => {
                                            const isSelected = formData.sizing.includes(size);
                                            return (
                                                <button
                                                    key={size}
                                                    type="button"
                                                    onClick={() => {
                                                        const newSizing = isSelected
                                                            ? formData.sizing.filter(s => s !== size)
                                                            : [...formData.sizing, size].sort();
                                                        setFormData({ ...formData, sizing: newSizing });
                                                    }}
                                                    className={`px-4 py-2 rounded-xl text-[10px] font-bold transition-all border ${isSelected ? 'bg-attire-accent border-attire-accent text-black' : 'bg-black/5 dark:bg-white/5 border-black/5 dark:border-white/10 text-gray-500 dark:text-attire-silver hover:text-gray-900 dark:hover:text-white hover:bg-black/10 dark:hover:bg-white/10'}`}
                                                >
                                                    {size}
                                                </button>
                                            );
                                        })}
                                    </div>
                                </div>

                                {/* Waist Sizes */}
                                <div className="space-y-2">
                                    <p className="text-[8px] uppercase tracking-widest text-gray-300 dark:text-white/20 font-bold ml-1">Trousers / Waist</p>
                                    <div className="flex flex-wrap gap-2">
                                        {['28', '30', '32', '34', '36', '38'].map(size => {
                                            const isSelected = formData.sizing.includes(size);
                                            return (
                                                <button
                                                    key={size}
                                                    type="button"
                                                    onClick={() => {
                                                        const newSizing = isSelected
                                                            ? formData.sizing.filter(s => s !== size)
                                                            : [...formData.sizing, size].sort();
                                                        setFormData({ ...formData, sizing: newSizing });
                                                    }}
                                                    className={`px-4 py-2 rounded-xl text-[10px] font-bold transition-all border ${isSelected ? 'bg-attire-accent border-attire-accent text-black' : 'bg-black/5 dark:bg-white/5 border-black/5 dark:border-white/10 text-gray-500 dark:text-attire-silver hover:text-gray-900 dark:hover:text-white hover:bg-black/10 dark:hover:bg-white/10'}`}
                                                >
                                                    {size}
                                                </button>
                                            );
                                        })}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                        <div className="space-y-3">
                            <label className="text-[10px] font-bold text-gray-400 dark:text-attire-silver/50 uppercase tracking-[0.2em] ml-1">Availability</label>
                            <CustomDropdown 
                                selected={formData.availability}
                                options={[
                                    { name: 'In Stock', slug: 'In Stock' },
                                    { name: 'Low Stock', slug: 'Low Stock' },
                                    { name: 'Out of Stock', slug: 'Out of Stock' }
                                ]}
                                onChange={val => setFormData({...formData, availability: val})}
                                icon={RefreshCw}
                            />
                        </div>
                        
                        <div className="grid grid-cols-2 gap-6 bg-black/[0.03] dark:bg-white/[0.03] p-6 rounded-2xl border border-black/5 dark:border-white/5">
                            <div className="flex flex-col items-center gap-3">
                                <label className="text-[9px] font-bold text-gray-400 dark:text-attire-silver/40 uppercase tracking-widest">Featured</label>
                                <button 
                                    type="button"
                                    onClick={() => setFormData({...formData, is_featured: !formData.is_featured})}
                                    className={`w-12 h-7 rounded-full transition-all duration-300 relative ${formData.is_featured ? 'bg-attire-accent' : 'bg-black/10 dark:bg-white/10'}`}
                                >
                                    <div className={`absolute top-1 w-5 h-5 bg-white rounded-full transition-all duration-300 shadow-lg ${formData.is_featured ? 'left-6' : 'left-1'}`} />
                                </button>
                            </div>
                            <div className="flex flex-col items-center gap-3">
                                <label className="text-[9px] font-bold text-gray-400 dark:text-attire-silver/40 uppercase tracking-widest">New Arrival</label>
                                <button 
                                    type="button"
                                    onClick={() => setFormData({...formData, is_new: !formData.is_new})}
                                    className={`w-12 h-7 rounded-full transition-all duration-300 relative ${formData.is_new ? 'bg-blue-500' : 'bg-black/10 dark:bg-white/10'}`}
                                >
                                    <div className={`absolute top-1 w-5 h-5 bg-white rounded-full transition-all duration-300 shadow-lg ${formData.is_new ? 'left-6' : 'left-1'}`} />
                                </button>
                            </div>
                        </div>
                    </div>

                    <div className="p-8 bg-black/[0.02] dark:bg-white/[0.02] rounded-3xl border border-black/5 dark:border-white/5 flex items-center justify-between">
                        <div>
                            <p className="text-sm font-bold text-gray-900 dark:text-white uppercase tracking-wider">Store Visibility</p>
                            <p className="text-[10px] text-gray-400 dark:text-attire-silver/60 mt-1 uppercase tracking-widest">Toggle visibility in public store</p>
                        </div>
                        <div className="flex items-center gap-6">
                            <span className={`text-[10px] font-bold uppercase tracking-[0.2em] ${formData.is_visible ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>
                                {formData.is_visible ? 'Visible' : 'Hidden'}
                            </span>
                            <button 
                                type="button"
                                onClick={() => setFormData({...formData, is_visible: !formData.is_visible})}
                                className={`w-20 h-10 rounded-full transition-all duration-500 relative flex items-center px-2 ${formData.is_visible ? 'bg-green-500/20 border border-green-500/30' : 'bg-red-500/20 border border-red-500/30'}`}
                            >
                                <div className={`w-7 h-7 rounded-full flex items-center justify-center transition-all duration-500 shadow-xl ${formData.is_visible ? 'translate-x-9 bg-green-500' : 'translate-x-0 bg-red-500'}`}>
                                    {formData.is_visible ? <Check size={14} className="text-white" /> : <X size={14} className="text-white" />}
                                </div>
                            </button>
                        </div>
                    </div>

                    <div className="pt-12 pb-24 border-t border-black/5 dark:border-white/5 flex gap-6">
                        <button 
                            type="button"
                            onClick={() => navigate('/admin/products')}
                            className="flex-grow py-6 border border-black/5 dark:border-white/10 rounded-2xl text-[11px] font-bold uppercase tracking-[0.4em] text-gray-400 dark:text-white/40 hover:text-gray-900 dark:hover:text-white hover:bg-black/5 dark:hover:bg-white/5 transition-all"
                        >
                            Cancel
                        </button>
                        <button 
                            type="submit"
                            disabled={saving}
                            className="flex-grow py-6 bg-gray-900 dark:bg-white text-white dark:text-black rounded-2xl text-[11px] font-bold uppercase tracking-[0.4em] hover:bg-attire-accent dark:hover:bg-attire-accent transition-all flex items-center justify-center gap-4 shadow-2xl shadow-black/5"
                        >
                            {saving ? <Loader className="animate-spin" size={18} /> : <Check size={18} />}
                            {saving ? 'Processing...' : (isNew ? 'Create Masterpiece' : 'Commit Changes')}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default ProductEditor;


