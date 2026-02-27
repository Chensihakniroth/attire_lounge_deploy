import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { X, Check, Loader, AlertCircle, RefreshCw, Eye, EyeOff, ChevronLeft } from 'lucide-react';
import axios from 'axios';
import { useAdmin } from './AdminContext';

const CustomDropdown = ({ selected, options, onChange, icon: Icon = RefreshCw, className = "" }) => {
    const [isOpen, setIsOpen] = useState(false);
    const selectedItem = options.find(o => o.slug === selected || o.name === selected);
    const displayName = selectedItem ? selectedItem.name : 'Select Option';

    return (
        <div className={`relative ${className}`}>
            <button
                type="button"
                onClick={() => setIsOpen(!isOpen)}
                className="w-full bg-white/5 border border-white/10 rounded-2xl py-5 px-6 text-white text-sm text-left focus:border-attire-accent outline-none transition-all cursor-pointer flex items-center justify-between group"
            >
                <div className="flex items-center gap-3">
                    <Icon className="text-attire-silver/40 group-hover:text-attire-accent transition-colors" size={18} />
                    <span className="truncate">{displayName}</span>
                </div>
                <div className={`transition-transform duration-300 ${isOpen ? 'rotate-180' : ''}`}>
                    <Check size={16} className="text-attire-silver/20" />
                </div>
            </button>

            {isOpen && (
                <>
                    <div className="fixed inset-0 z-[60]" onClick={() => setIsOpen(false)} />
                    <motion.div
                        initial={{ opacity: 0, y: 10, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        className="absolute top-full left-0 right-0 mt-2 z-[70] bg-[#0d0d0d] border border-white/10 rounded-2xl overflow-hidden shadow-2xl backdrop-blur-xl"
                    >
                        <div className="max-h-60 overflow-y-auto p-2 attire-scrollbar">
                            {options.map((opt, idx) => (
                                <button
                                    key={opt.slug || opt.name}
                                    type="button"
                                    onClick={() => { onChange(opt.slug || opt.name); setIsOpen(false); }}
                                    className={`w-full text-left px-4 py-3 rounded-xl text-xs font-bold uppercase tracking-widest transition-all ${idx > 0 ? 'mt-1' : ''} ${selected === (opt.slug || opt.name) ? 'bg-attire-accent text-black' : 'text-attire-silver hover:bg-white/5 hover:text-white'}`}
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

const ProductEditor = () => {
    const { productId } = useParams();
    const navigate = useNavigate();
    const { setIsEditing } = useAdmin();
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState(null);
    const [product, setProduct] = useState(null);
    const [formData, setFormData] = useState(null);

    useEffect(() => {
        setIsEditing(true);
        return () => setIsEditing(false);
    }, [setIsEditing]);

    useEffect(() => {
        const fetchProduct = async () => {
            try {
                const response = await axios.get(`/api/v1/products/${productId}`);
                if (response.data.success) {
                    const p = response.data.data;
                    setProduct(p);
                    setFormData({
                        name: p.name,
                        price: p.price,
                        description: p.description || '',
                        availability: p.in_stock ? 'In Stock' : 'Out of Stock',
                        is_featured: p.featured,
                        is_new: p.is_new,
                        is_visible: p.is_visible,
                        fabric: p.fabric || '',
                        silhouette: p.silhouette || '',
                        details: p.details || '',
                        sizing: Array.isArray(p.sizes) ? p.sizes : [],
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
    }, [productId]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSaving(true);
        setError(null);
        try {
            const response = await axios.put(`/api/v1/admin/products/${product.id}`, formData);
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
            <div className="min-h-screen bg-[#050505] flex flex-col items-center justify-center">
                <Loader className="animate-spin text-attire-accent mb-4" size={32} />
                <p className="text-attire-silver text-xs uppercase tracking-widest">Loading Masterpiece...</p>
            </div>
        );
    }

    if (!formData) return null;

    return (
        <div className="min-h-screen bg-[#050505] flex flex-col">
            <div className="sticky top-0 z-20 bg-[#0a0a0a]/80 backdrop-blur-xl border-b border-white/5">
                <div className="max-w-4xl mx-auto px-6 h-24 flex justify-between items-center">
                    <div className="flex items-center gap-6">
                        <button 
                            onClick={() => navigate('/admin/products')}
                            className="p-3 hover:bg-white/5 rounded-full transition-all text-white/40 hover:text-white"
                        >
                            <ChevronLeft size={24} />
                        </button>
                        <div>
                            <h2 className="text-2xl font-serif text-white">Edit Product</h2>
                            <p className="text-attire-silver text-[10px] uppercase tracking-widest mt-1 opacity-50">{product.slug}</p>
                        </div>
                    </div>
                    <div className="flex items-center gap-4">
                        <button 
                            onClick={() => navigate('/admin/products')}
                            className="p-3 hover:bg-white/5 rounded-full transition-all text-white/40 hover:text-white"
                        >
                            <X size={24} />
                        </button>
                    </div>
                </div>
            </div>

            <div className="flex-grow w-full max-w-4xl mx-auto px-6 py-12">
                <form onSubmit={handleSubmit} className="space-y-12">
                    {error && (
                        <motion.div 
                            initial={{ opacity: 0, x: -10 }}
                            animate={{ opacity: 1, x: 0 }}
                            className="p-4 bg-red-500/10 border border-red-500/20 rounded-2xl flex items-center gap-3 text-red-400 text-sm"
                        >
                            <AlertCircle size={18} />
                            <span>{error}</span>
                        </motion.div>
                    )}

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                        <div className="space-y-3">
                            <label className="text-[10px] font-bold text-attire-silver/50 uppercase tracking-[0.2em] ml-1">Product Name</label>
                            <input 
                                type="text" 
                                value={formData.name}
                                onChange={e => setFormData({...formData, name: e.target.value})}
                                className="w-full bg-white/5 border border-white/10 rounded-2xl py-5 px-6 text-white focus:border-attire-accent outline-none transition-all placeholder:text-white/10"
                                required
                            />
                        </div>
                        <div className="space-y-3">
                            <label className="text-[10px] font-bold text-attire-silver/50 uppercase tracking-[0.2em] ml-1">Price ($)</label>
                            <input 
                                type="number" 
                                step="0.01"
                                value={formData.price}
                                onChange={e => setFormData({...formData, price: e.target.value})}
                                className="w-full bg-white/5 border border-white/10 rounded-2xl py-5 px-6 text-white focus:border-attire-accent outline-none transition-all font-mono"
                                required
                            />
                        </div>
                    </div>

                    <div className="space-y-3">
                        <label className="text-[10px] font-bold text-attire-silver/50 uppercase tracking-[0.2em] ml-1">Description</label>
                        <textarea 
                            value={formData.description}
                            onChange={e => setFormData({...formData, description: e.target.value})}
                            rows={5}
                            className="w-full bg-white/5 border border-white/10 rounded-2xl py-5 px-6 text-white focus:border-attire-accent outline-none transition-all resize-none text-sm leading-relaxed"
                        />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                        <div className="space-y-3">
                            <label className="text-[10px] font-bold text-attire-silver/50 uppercase tracking-[0.2em] ml-1">Fabric</label>
                            <input 
                                type="text" 
                                value={formData.fabric}
                                onChange={e => setFormData({...formData, fabric: e.target.value})}
                                placeholder="e.g., Premium Wool Blend"
                                className="w-full bg-white/5 border border-white/10 rounded-2xl py-5 px-6 text-white focus:border-attire-accent outline-none transition-all placeholder:text-white/10"
                            />
                        </div>
                        <div className="space-y-3">
                            <label className="text-[10px] font-bold text-attire-silver/50 uppercase tracking-[0.2em] ml-1">Silhouette</label>
                            <input 
                                type="text" 
                                value={formData.silhouette}
                                onChange={e => setFormData({...formData, silhouette: e.target.value})}
                                placeholder="e.g., Modern Tailored"
                                className="w-full bg-white/5 border border-white/10 rounded-2xl py-5 px-6 text-white focus:border-attire-accent outline-none transition-all placeholder:text-white/10"
                            />
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                        <div className="space-y-3">
                            <label className="text-[10px] font-bold text-attire-silver/50 uppercase tracking-[0.2em] ml-1">Details</label>
                            <input 
                                type="text" 
                                value={formData.details}
                                onChange={e => setFormData({...formData, details: e.target.value})}
                                placeholder="e.g., Hand-Finished"
                                className="w-full bg-white/5 border border-white/10 rounded-2xl py-5 px-6 text-white focus:border-attire-accent outline-none transition-all placeholder:text-white/10"
                            />
                        </div>
                        <div className="space-y-4">
                            <label className="text-[10px] font-bold text-attire-silver/50 uppercase tracking-[0.2em] ml-1">Available Sizes</label>
                            
                            <div className="space-y-6">
                                {/* Alpha Sizes */}
                                <div className="space-y-2">
                                    <p className="text-[8px] uppercase tracking-widest text-white/20 font-bold ml-1">Alpha</p>
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
                                                    className={`px-4 py-2 rounded-xl text-[10px] font-bold transition-all border ${isSelected ? 'bg-attire-accent border-attire-accent text-black' : 'bg-white/5 border-white/10 text-attire-silver hover:text-white hover:bg-white/10'}`}
                                                >
                                                    {size}
                                                </button>
                                            );
                                        })}
                                    </div>
                                </div>

                                {/* Numeric/Suit Sizes */}
                                <div className="space-y-2">
                                    <p className="text-[8px] uppercase tracking-widest text-white/20 font-bold ml-1">Suits / Jackets</p>
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
                                                    className={`px-4 py-2 rounded-xl text-[10px] font-bold transition-all border ${isSelected ? 'bg-attire-accent border-attire-accent text-black' : 'bg-white/5 border-white/10 text-attire-silver hover:text-white hover:bg-white/10'}`}
                                                >
                                                    {size}
                                                </button>
                                            );
                                        })}
                                    </div>
                                </div>

                                {/* Waist Sizes */}
                                <div className="space-y-2">
                                    <p className="text-[8px] uppercase tracking-widest text-white/20 font-bold ml-1">Trousers / Waist</p>
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
                                                    className={`px-4 py-2 rounded-xl text-[10px] font-bold transition-all border ${isSelected ? 'bg-attire-accent border-attire-accent text-black' : 'bg-white/5 border-white/10 text-attire-silver hover:text-white hover:bg-white/10'}`}
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
                            <label className="text-[10px] font-bold text-attire-silver/50 uppercase tracking-[0.2em] ml-1">Availability</label>
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
                        
                        <div className="grid grid-cols-2 gap-6 bg-white/[0.03] p-6 rounded-2xl border border-white/5">
                            <div className="flex flex-col items-center gap-3">
                                <label className="text-[9px] font-bold text-attire-silver/40 uppercase tracking-widest">Featured</label>
                                <button 
                                    type="button"
                                    onClick={() => setFormData({...formData, is_featured: !formData.is_featured})}
                                    className={`w-12 h-7 rounded-full transition-all duration-300 relative ${formData.is_featured ? 'bg-attire-accent' : 'bg-white/10'}`}
                                >
                                    <div className={`absolute top-1 w-5 h-5 bg-white rounded-full transition-all duration-300 shadow-lg ${formData.is_featured ? 'left-6' : 'left-1'}`} />
                                </button>
                            </div>
                            <div className="flex flex-col items-center gap-3">
                                <label className="text-[9px] font-bold text-attire-silver/40 uppercase tracking-widest">New Arrival</label>
                                <button 
                                    type="button"
                                    onClick={() => setFormData({...formData, is_new: !formData.is_new})}
                                    className={`w-12 h-7 rounded-full transition-all duration-300 relative ${formData.is_new ? 'bg-blue-500' : 'bg-white/10'}`}
                                >
                                    <div className={`absolute top-1 w-5 h-5 bg-white rounded-full transition-all duration-300 shadow-lg ${formData.is_new ? 'left-6' : 'left-1'}`} />
                                </button>
                            </div>
                        </div>
                    </div>

                    <div className="p-8 bg-white/[0.02] rounded-3xl border border-white/5 flex items-center justify-between">
                        <div>
                            <p className="text-sm font-bold text-white uppercase tracking-wider">Store Visibility</p>
                            <p className="text-[10px] text-attire-silver/60 mt-1 uppercase tracking-widest">Toggle visibility in public store</p>
                        </div>
                        <div className="flex items-center gap-6">
                            <span className={`text-[10px] font-bold uppercase tracking-[0.2em] ${formData.is_visible ? 'text-green-400' : 'text-red-400'}`}>
                                {formData.is_visible ? 'Visible' : 'Hidden'}
                            </span>
                            <button 
                                type="button"
                                onClick={() => setFormData({...formData, is_visible: !formData.is_visible})}
                                className={`w-20 h-10 rounded-full transition-all duration-500 relative flex items-center px-2 ${formData.is_visible ? 'bg-green-500/20 border border-green-500/30' : 'bg-red-500/20 border border-red-500/30'}`}
                            >
                                <div className={`w-7 h-7 rounded-full flex items-center justify-center transition-all duration-500 shadow-xl ${formData.is_visible ? 'translate-x-9 bg-green-500' : 'translate-x-0 bg-red-500'}`}>
                                    {formData.is_visible ? <Eye size={14} className="text-white" /> : <EyeOff size={14} className="text-white" />}
                                </div>
                            </button>
                        </div>
                    </div>

                    <div className="pt-12 pb-24 border-t border-white/5 flex gap-6">
                        <button 
                            type="button"
                            onClick={() => navigate('/admin/products')}
                            className="flex-grow py-6 border border-white/10 rounded-2xl text-[11px] font-bold uppercase tracking-[0.4em] text-white/40 hover:text-white hover:bg-white/5 transition-all"
                        >
                            Cancel
                        </button>
                        <button 
                            type="submit"
                            disabled={saving}
                            className="flex-grow py-6 bg-white text-black rounded-2xl text-[11px] font-bold uppercase tracking-[0.4em] hover:bg-attire-accent transition-all flex items-center justify-center gap-4 shadow-2xl shadow-white/5"
                        >
                            {saving ? <Loader className="animate-spin" size={18} /> : <Check size={18} />}
                            {saving ? 'Processing...' : 'Commit Changes'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default ProductEditor;
