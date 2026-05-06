import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Check, AlertCircle, RefreshCw, ChevronLeft, Plus, Trash2, ImageIcon, Sparkles } from 'lucide-react';
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
                className="w-full bg-black/5 dark:bg-[#0d1117] border border-black/5 dark:border-[#30363d] rounded-xl py-4 px-6 text-gray-900 dark:text-[#c9d1d9] text-sm text-left focus:border-[#0d3542] dark:focus:border-[#58a6ff] outline-none transition-all cursor-pointer flex items-center justify-between group"
            >
                <div className="flex items-center gap-3">
                    <Icon className="text-gray-400 dark:text-[#8b949e]/50 group-hover:text-[#0d3542] dark:group-hover:text-[#58a6ff] transition-colors" size={18} />
                    <span className="truncate">{displayName}</span>
                </div>
                <div className={`transition-transform duration-300 ${isOpen ? 'rotate-180' : ''}`}>
                    <ChevronDown size={16} className="text-gray-300 dark:text-[#8b949e]/30" />
                </div>
            </button>

            {isOpen && (
                <>
                    <div className="fixed inset-0 z-[60]" onClick={() => setIsOpen(false)} />
                    <motion.div
                        initial={{ opacity: 0, y: 10, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        className="absolute top-full left-0 right-0 mt-2 z-[70] bg-white dark:bg-[#161b22] border border-black/5 dark:border-[#30363d] rounded-xl overflow-hidden shadow-none backdrop-blur-xl"
                    >
                        <div className="max-h-60 overflow-y-auto p-2 scrollbar-hide">
                            {options.map((opt, idx) => (
                                <button
                                    key={opt.id}
                                    type="button"
                                    onClick={() => { onChange(opt.id); setIsOpen(false); }}
                                    className={`w-full text-left px-4 py-3 rounded-lg text-xs font-bold uppercase tracking-widest transition-all ${idx > 0 ? 'mt-1' : ''} ${(selected === opt.id) ? 'bg-[#0d3542] dark:bg-[#58a6ff] text-white dark:text-black' : 'text-gray-500 dark:text-[#8b949e] hover:bg-black/5 dark:hover:bg-[#0d1117] hover:text-gray-900 dark:hover:text-[#c9d1d9]'}`}
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

    const compressImage = (file) => {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.readAsDataURL(file);
            reader.onload = (event) => {
                const img = new Image();
                img.src = event.target.result;
                img.onload = () => {
                    const canvas = document.createElement('canvas');
                    const ctx = canvas.getContext('2d');
                    
                    // Increased to 2000px to maintain high resolution for zooming
                    const MAX_WIDTH = 2000;
                    const MAX_HEIGHT = 2000;
                    let width = img.width;
                    let height = img.height;

                    if (width > height) {
                        if (width > MAX_WIDTH) {
                            height *= MAX_WIDTH / width;
                            width = MAX_WIDTH;
                        }
                    } else {
                        if (height > MAX_HEIGHT) {
                            width *= MAX_HEIGHT / height;
                            height = MAX_HEIGHT;
                        }
                    }

                    canvas.width = width;
                    canvas.height = height;

                    // This makes a massive difference for downsampling sharpness in the browser
                    ctx.imageSmoothingEnabled = true;
                    ctx.imageSmoothingQuality = "high";
                    
                    ctx.drawImage(img, 0, 0, width, height);

                    let quality = 0.95; // Start extremely high
                    const targetSize = 800 * 1024; // 800KB max
                    
                    const tryCompress = () => {
                        canvas.toBlob((blob) => {
                            // Don't let quality drop below 0.65 to prevent JPEG artifacts taking over
                            if (blob.size > targetSize && quality > 0.65) {
                                quality -= 0.05; // Drop slower for finer tuning
                                tryCompress();
                            } else {
                                const compressedFile = new File([blob], file.name.replace(/\.[^/.]+$/, "") + ".jpg", {
                                    type: 'image/jpeg',
                                    lastModified: Date.now()
                                });
                                resolve(compressedFile);
                            }
                        }, 'image/jpeg', quality);
                    };
                    
                    tryCompress();
                };
                img.onerror = reject;
            };
            reader.onerror = reject;
        });
    };

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
            for (let i = 0; i < files.length; i++) {
                const originalFile = files[i];
                let fileToUpload = originalFile;
                
                // Compress only if it's an image that's likely large (e.g. over 500kb)
                if (originalFile.type.startsWith('image/') && originalFile.size > 500 * 1024) {
                    try {
                        fileToUpload = await compressImage(originalFile);
                    } catch (e) {
                        console.warn("Compression failed, using original file", e);
                    }
                }
                
                const formDataUpload = new FormData();
                formDataUpload.append('image', fileToUpload);
                if (formData.collection_id) {
                    formDataUpload.append('collection_id', formData.collection_id);
                }

                const response = await axios.post('/api/v1/admin/images/upload', formDataUpload, {
                    headers: { 'Content-Type': 'multipart/form-data' }
                });
                
                if (response.data.url) {
                    uploadedUrls.push(response.data.url);
                }
            }
            
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
        <div className="min-h-screen bg-gray-50 dark:bg-[#0d1117] flex flex-col transition-colors duration-300 font-sans">
            <div className="sticky top-0 z-20 bg-white/80 dark:bg-[#0d1117]/80 backdrop-blur-xl border-b border-black/5 dark:border-[#30363d]">
                <div className="max-w-4xl mx-auto px-6 h-24 flex justify-between items-center">
                    <div className="flex items-center gap-6">
                        <button 
                            onClick={() => navigate('/admin/products')}
                            className="p-3 hover:bg-black/5 dark:hover:bg-white/5 rounded-full transition-all text-gray-400 dark:text-[#8b949e] hover:text-[#0d3542] dark:hover:text-[#58a6ff]"
                        >
                            <ChevronLeft size={24} />
                        </button>
                        <div>
                            <div className="flex items-center gap-2">
                                <h2 className="text-2xl font-serif text-gray-900 dark:text-[#c9d1d9]">Bulk Add Products</h2>
                                <Plus className="text-[#0d3542] dark:text-[#58a6ff] w-5 h-5" />
                            </div>
                            <p className="text-gray-400 dark:text-[#8b949e] text-[10px] uppercase tracking-widest mt-1 opacity-50">
                                1 photo = 1 unique product
                            </p>
                        </div>
                    </div>
                    <div className="flex items-center gap-4">
                        <button 
                            onClick={() => navigate('/admin/products')}
                            className="p-3 hover:bg-black/5 dark:hover:bg-white/5 rounded-full transition-all text-gray-400 dark:text-[#8b949e] hover:text-[#0d3542] dark:hover:text-[#58a6ff]"
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
                        <label className="text-[10px] font-bold text-gray-400 dark:text-[#8b949e]/50 uppercase tracking-[0.2em] ml-1">Base Product Name</label>
                        <input 
                            type="text" 
                            value={formData.base_name}
                            onChange={e => setFormData({...formData, base_name: e.target.value})}
                            className="w-full bg-black/5 dark:bg-[#0d1117] border border-black/5 dark:border-[#30363d] rounded-xl py-3.5 px-6 text-gray-900 dark:text-[#c9d1d9] text-sm focus:border-[#0d3542] dark:focus:border-[#58a6ff] outline-none transition-all placeholder:text-gray-300 dark:placeholder:text-[#8b949e]/30"
                            placeholder="e.g., Ametora (Names will be Ametora, Ametora I, Ametora II...)"
                            required
                        />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                        <div className="space-y-3">
                            <label className="text-[10px] font-bold text-gray-400 dark:text-[#8b949e]/50 uppercase tracking-[0.2em] ml-1">Price ($)</label>
                            <input 
                                type="number" 
                                step="0.01"
                                value={formData.price}
                                onChange={e => setFormData({...formData, price: e.target.value})}
                                className="w-full bg-black/5 dark:bg-[#0d1117] border border-black/5 dark:border-[#30363d] rounded-xl py-3.5 px-6 text-gray-900 dark:text-[#c9d1d9] text-sm focus:border-[#0d3542] dark:focus:border-[#58a6ff] outline-none transition-all font-mono"
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
                        <label className="text-[10px] font-bold text-gray-400 dark:text-[#8b949e]/50 uppercase tracking-[0.2em] ml-1">Description</label>
                        <textarea 
                            value={formData.description}
                            onChange={e => setFormData({...formData, description: e.target.value})}
                            rows={5}
                            className="w-full bg-black/5 dark:bg-[#0d1117] border border-black/5 dark:border-[#30363d] rounded-xl py-3.5 px-6 text-gray-900 dark:text-[#c9d1d9] text-sm focus:border-[#0d3542] dark:focus:border-[#58a6ff] outline-none transition-all resize-none leading-relaxed placeholder:text-gray-300 dark:placeholder:text-[#8b949e]/30"
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
                                <label className={`aspect-square rounded-xl border-2 border-dashed border-black/10 dark:border-[#30363d] flex flex-col items-center justify-center cursor-pointer hover:border-[#0d3542] dark:hover:border-[#58a6ff]/50 hover:bg-black/5 dark:hover:bg-[#161b22] transition-all group ${uploading ? 'pointer-events-none opacity-50' : ''}`}>
                                    <input 
                                        type="file" 
                                        className="hidden" 
                                        accept="image/*"
                                        multiple
                                        onChange={handleMultipleImageUpload}
                                    />
                                    <div className="w-10 h-10 rounded-full bg-black/5 dark:bg-[#0d1117] flex items-center justify-center mb-2 group-hover:scale-110 transition-transform">
                                        <Plus size={20} className="text-gray-400 dark:text-[#8b949e]" />
                                    </div>
                                    <span className="text-[10px] font-bold uppercase tracking-widest text-gray-400 dark:text-[#8b949e]/40 group-hover:text-[#0d3542] dark:group-hover:text-[#58a6ff] transition-colors">Add Photos</span>
                                </label>
                            )}

                            <AnimatePresence mode="popLayout">
                                {uploading && (
                                    <motion.div 
                                        key="uploading-placeholder"
                                        initial={{ opacity: 0, scale: 0.8 }}
                                        animate={{ opacity: 1, scale: 1 }}
                                        exit={{ opacity: 0, scale: 0.8 }}
                                        className="aspect-square rounded-xl border border-[#0d3542]/30 dark:border-[#58a6ff]/30 bg-[#0d3542]/5 dark:bg-[#58a6ff]/5 flex flex-col items-center justify-center gap-2"
                                    >
                                        <Loader2 className="animate-spin" size={16} />
                                        <span className="text-[8px] font-bold uppercase tracking-widest text-[#0d3542] dark:text-[#58a6ff]">Uploading...</span>
                                    </motion.div>
                                )}
                                {formData.images.map((url, idx) => (
                                    <motion.div 
                                        key={url}
                                        layout
                                        initial={{ opacity: 0, scale: 0.8 }}
                                        animate={{ opacity: 1, scale: 1 }}
                                        exit={{ opacity: 0, scale: 0.8 }}
                                        className="aspect-square rounded-xl overflow-hidden border border-black/5 dark:border-[#30363d] relative group"
                                    >
                                        <img src={url} alt="" className="w-full h-full object-cover" />
                                        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                            <button 
                                                type="button"
                                                onClick={() => handleRemoveImage(idx)}
                                                className="w-10 h-10 rounded-full bg-red-500 text-white flex items-center justify-center hover:scale-110 transition-transform shadow-none"
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
                            <label className="text-[10px] font-bold text-gray-400 dark:text-[#8b949e]/50 uppercase tracking-[0.2em] ml-1">Fabric</label>
                            <input 
                                type="text" 
                                value={formData.fabric}
                                onChange={e => setFormData({...formData, fabric: e.target.value})}
                                placeholder="Shared fabric details..."
                                className="w-full bg-black/5 dark:bg-[#0d1117] border border-black/5 dark:border-[#30363d] rounded-xl py-3.5 px-6 text-gray-900 dark:text-[#c9d1d9] text-sm focus:border-[#0d3542] dark:focus:border-[#58a6ff] outline-none transition-all placeholder:text-gray-300 dark:placeholder:text-[#8b949e]/30"
                            />
                        </div>
                        <div className="space-y-3">
                            <label className="text-[10px] font-bold text-gray-400 dark:text-[#8b949e]/50 uppercase tracking-[0.2em] ml-1">Silhouette</label>
                            <input 
                                type="text" 
                                value={formData.silhouette}
                                onChange={e => setFormData({...formData, silhouette: e.target.value})}
                                placeholder="Shared silhouette details..."
                                className="w-full bg-black/5 dark:bg-[#0d1117] border border-black/5 dark:border-[#30363d] rounded-xl py-3.5 px-6 text-gray-900 dark:text-[#c9d1d9] text-sm focus:border-[#0d3542] dark:focus:border-[#58a6ff] outline-none transition-all placeholder:text-gray-300 dark:placeholder:text-[#8b949e]/30"
                            />
                        </div>
                    </div>

                    <div className="space-y-4">
                        <label className="text-[10px] font-bold text-gray-400 dark:text-[#8b949e]/50 uppercase tracking-[0.2em] ml-1">Available Sizes (Applied to all)</label>
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
                                        className={`px-4 py-2 rounded-lg text-[10px] font-bold transition-all border ${isSelected ? 'bg-[#0d3542] dark:bg-[#58a6ff] border-[#0d3542] dark:border-[#58a6ff] text-white dark:text-black' : 'bg-black/5 dark:bg-[#0d1117] border-black/5 dark:border-[#30363d] text-gray-500 dark:text-[#8b949e] hover:text-gray-900 dark:hover:text-[#c9d1d9] hover:bg-black/10 dark:hover:bg-[#161b22]'}`}
                                    >
                                        {size}
                                    </button>
                                );
                            })}
                        </div>
                    </div>

                    <div className="pt-12 pb-24 border-t border-black/5 dark:border-[#30363d] flex gap-6">
                        <button 
                            type="button"
                            onClick={() => navigate('/admin/products')}
                            className="flex-grow py-4 border border-black/5 dark:border-[#30363d] rounded-xl text-[11px] font-bold uppercase tracking-[0.4em] text-gray-400 dark:text-[#8b949e] hover:text-gray-900 dark:hover:text-[#c9d1d9] hover:bg-black/5 dark:hover:bg-[#161b22] transition-all"
                        >
                            Cancel
                        </button>
                        <button 
                            type="submit"
                            disabled={saving || formData.images.length === 0}
                            className="flex-grow py-4 bg-[#0d3542] dark:bg-[#58a6ff] text-white dark:text-black rounded-xl text-[11px] font-black uppercase tracking-[0.2em] hover:opacity-90 transition-all flex items-center justify-center gap-4 shadow-none disabled:opacity-50 disabled:cursor-not-allowed border-none"
                        >
                            {saving ? <Loader2 className="animate-spin" size={16} /> : <Check size={18} />}
                            {saving ? 'Saving Products...' : `Save ${formData.images.length} Products`}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default BulkProductEditor;
