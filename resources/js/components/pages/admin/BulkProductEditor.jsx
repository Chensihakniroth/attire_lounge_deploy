import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Check, Loader, AlertCircle, RefreshCw, ChevronLeft, Plus, Trash2, ImageIcon, Sparkles } from 'lucide-react';
import axios from 'axios';
import { useAdmin } from './AdminContext';

const CustomDropdown = ({ selected, options, onChange, icon: Icon = RefreshCw, className = "", label = "Select Option" }) => {
    const [isOpen, setIsOpen] = useState(false);
    const selectedItem = options.find(o => o.id === selected || o.name === selected);
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
                                    key={opt.id}
                                    type="button"
                                    onClick={() => { onChange(opt.id); setIsOpen(false); }}
                                    className={`w-full text-left px-4 py-3 rounded-xl text-xs font-bold uppercase tracking-widest transition-all ${idx > 0 ? 'mt-1' : ''} ${(selected === opt.id) ? 'bg-attire-accent text-black' : 'text-gray-500 dark:text-attire-silver hover:bg-black/5 dark:hover:bg-white/5 hover:text-gray-900 dark:hover:text-white'}`}
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

const ChevronDown = ({ size, className }) => (
    <svg 
        width={size} 
        height={size} 
        viewBox="0 0 24 24" 
        fill="none" 
        stroke="currentColor" 
        strokeWidth="2" 
        strokeLinecap="round" 
        strokeLinejoin="round" 
        className={className}
    >
        <path d="m6 9 6 6 6-6"/>
    </svg>
);

const BulkProductEditor = () => {
    const navigate = useNavigate();
    const { setIsEditing } = useAdmin();
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState(null);
    const [formData, setFormData] = useState({
        base_name: '',
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

    const handleMultipleImageUpload = async (e) => {
        const files = Array.from(e.target.files);
        if (files.length === 0) return;

        if (formData.images.length + files.length > 10) {
            alert("Maximum 10 products can be uploaded at once.");
            return;
        }

        if (!formData.collection_id) {
            if (!window.confirm("No collection selected. The images will be uploaded to the general assets folder. Continue?")) {
                return;
            }
        }

        setUploading(true);
        const uploadedUrls = [];

        try {
            console.log("========================================");
            console.log(`🚀 Bulk Upload Sequence Initiated: ${files.length} masterpieces`);
            console.log("========================================");
            
            for (let i = 0; i < files.length; i++) {
                const file = files[i];
                const count = i + 1;
                console.log(`📸 [${count}/${files.length}] Processing: ${file.name}`);
                
                const formDataUpload = new FormData();
                formDataUpload.append('image', file);
                if (formData.collection_id) {
                    formDataUpload.append('collection_id', formData.collection_id);
                }

                console.log(`📡 [${count}/${files.length}] Uploading to storage...`);
                const response = await axios.post('/api/v1/admin/images/upload', formDataUpload, {
                    headers: { 'Content-Type': 'multipart/form-data' }
                });
                
                if (response.data.url) {
                    console.log(`✅ [${count}/${files.length}] Success! Masterpiece URL: ${response.data.url}`);
                    uploadedUrls.push(response.data.url);
                } else {
                    console.warn(`⚠️ [${count}/${files.length}] Warning: Upload successful but no URL returned.`);
                }
            }
            
            console.log("========================================");
            console.log(`✨ Process Complete! ${uploadedUrls.length} masterpieces ready.`);
            console.log("========================================");
            
            setFormData(prev => ({
                ...prev,
                images: [...prev.images, ...uploadedUrls]
            }));
        } catch (err) {
            console.error("❌ Bulk Upload Failed at Step:", uploadedUrls.length + 1);
            console.error("Error Detail:", err.response?.data || err.message);
            setError('Failed to upload some images. Please check the console for details.');
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
                const [catsRes, collsRes] = await Promise.all([
                    axios.get('/api/v1/products/categories'),
                    axios.get('/api/v1/products/collections')
                ]);
                
                if (catsRes.data?.success) {
                    setCategories(catsRes.data.data.map(c => typeof c === 'object' ? { name: c.name, id: c.id } : { name: c, id: c }));
                }
                if (collsRes.data?.success) {
                    setCollections(collsRes.data.data.map(c => ({ name: c.name, id: c.id })));
                }
            } catch (err) {
                console.error('Failed to fetch metadata:', err);
            }
        };
        fetchMetadata();
    }, []);

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        if (!formData.category_id) {
            setError("Please select a category.");
            return;
        }

        if (formData.images.length === 0) {
            setError("Please upload at least one masterpiece photo.");
            return;
        }

        setSaving(true);
        setError(null);
        try {
            const response = await axios.post('/api/v1/admin/products/bulk', formData);
            if (response.data.success) {
                navigate('/admin/products');
            }
        } catch (err) {
            console.error('Failed to save bulk products:', err);
            setError(err.response?.data?.message || 'Failed to create masterpieces. Please try again.');
        } finally {
            setSaving(false);
        }
    };

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
                            <div className="flex items-center gap-2">
                                <h2 className="text-2xl font-serif text-gray-900 dark:text-white">Bulk Masterpiece Creation</h2>
                                <Sparkles className="text-attire-accent w-5 h-5" />
                            </div>
                            <p className="text-gray-400 dark:text-attire-silver text-[10px] uppercase tracking-widest mt-1 opacity-50">
                                1 photo = 1 unique product
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

                    <div className="space-y-3">
                        <label className="text-[10px] font-bold text-gray-400 dark:text-attire-silver/50 uppercase tracking-[0.2em] ml-1">Base Product Name</label>
                        <input 
                            type="text" 
                            value={formData.base_name}
                            onChange={e => setFormData({...formData, base_name: e.target.value})}
                            className="w-full bg-black/5 dark:bg-white/5 border border-black/5 dark:border-white/10 rounded-2xl py-5 px-6 text-gray-900 dark:text-white focus:border-attire-accent outline-none transition-all placeholder:text-gray-300 dark:placeholder:text-white/10"
                            placeholder="e.g., Ametora (Names will be Ametora, Ametora I, Ametora II...)"
                            required
                        />
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
                            placeholder="Shared description for all products in this batch..."
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
                            <label className="text-[10px] font-bold text-gray-400 dark:text-attire-silver/50 uppercase tracking-[0.2em]">Imagery (1 Photo = 1 Product)</label>
                            <span className="text-[9px] text-gray-400 dark:text-attire-silver/30 font-bold uppercase tracking-widest">{formData.images.length}/10 Products</span>
                        </div>
                        
                        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-4">
                            {formData.images.length < 10 && (
                                <label className={`aspect-square rounded-2xl border-2 border-dashed border-black/10 dark:border-white/10 flex flex-col items-center justify-center cursor-pointer hover:border-attire-accent/50 hover:bg-black/5 dark:hover:bg-white/5 transition-all group ${uploading ? 'pointer-events-none opacity-50' : ''}`}>
                                    <input 
                                        type="file" 
                                        className="hidden" 
                                        accept="image/*"
                                        multiple
                                        onChange={handleMultipleImageUpload}
                                    />
                                    <div className="w-10 h-10 rounded-full bg-black/5 dark:bg-white/5 flex items-center justify-center mb-2 group-hover:scale-110 transition-transform">
                                        <Plus size={20} className="text-gray-400 dark:text-attire-silver" />
                                    </div>
                                    <span className="text-[10px] font-bold uppercase tracking-widest text-gray-400 dark:text-attire-silver/40 group-hover:text-attire-accent transition-colors">Add Photos</span>
                                </label>
                            )}

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
                                        <div className="absolute bottom-2 left-2 right-2 px-2 py-1 bg-black/60 backdrop-blur-md text-white text-[8px] font-bold uppercase tracking-widest rounded-md border border-white/10 text-center">
                                            Product {idx + 1}
                                        </div>
                                    </motion.div>
                                ))}
                            </AnimatePresence>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                        <div className="space-y-3">
                            <label className="text-[10px] font-bold text-gray-400 dark:text-attire-silver/50 uppercase tracking-[0.2em] ml-1">Fabric</label>
                            <input 
                                type="text" 
                                value={formData.fabric}
                                onChange={e => setFormData({...formData, fabric: e.target.value})}
                                placeholder="Shared fabric details..."
                                className="w-full bg-black/5 dark:bg-white/5 border border-black/5 dark:border-white/10 rounded-2xl py-5 px-6 text-gray-900 dark:text-white focus:border-attire-accent outline-none transition-all placeholder:text-gray-300 dark:placeholder:text-white/10"
                            />
                        </div>
                        <div className="space-y-3">
                            <label className="text-[10px] font-bold text-gray-400 dark:text-attire-silver/50 uppercase tracking-[0.2em] ml-1">Silhouette</label>
                            <input 
                                type="text" 
                                value={formData.silhouette}
                                onChange={e => setFormData({...formData, silhouette: e.target.value})}
                                placeholder="Shared silhouette details..."
                                className="w-full bg-black/5 dark:bg-white/5 border border-black/5 dark:border-white/10 rounded-2xl py-5 px-6 text-gray-900 dark:text-white focus:border-attire-accent outline-none transition-all placeholder:text-gray-300 dark:placeholder:text-white/10"
                            />
                        </div>
                    </div>

                    <div className="space-y-4">
                        <label className="text-[10px] font-bold text-gray-400 dark:text-attire-silver/50 uppercase tracking-[0.2em] ml-1">Available Sizes (Applied to all)</label>
                        <div className="flex flex-wrap gap-2">
                            {['XS', 'S', 'M', 'L', 'XL', 'XXL', '28', '30', '32', '34', '36', '38', '44', '46', '48', '50', '52', '54', '56'].map(size => {
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
                            disabled={saving || formData.images.length === 0}
                            className="flex-grow py-6 bg-gray-900 dark:bg-white text-white dark:text-black rounded-2xl text-[11px] font-bold uppercase tracking-[0.4em] hover:bg-attire-accent dark:hover:bg-attire-accent transition-all flex items-center justify-center gap-4 shadow-2xl shadow-black/5 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {saving ? <Loader className="animate-spin" size={18} /> : <Check size={18} />}
                            {saving ? 'Creating Masterpieces...' : `Launch ${formData.images.length} Products`}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default BulkProductEditor;
