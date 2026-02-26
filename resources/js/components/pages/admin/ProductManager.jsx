import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { ShoppingBag, Search, Filter, Loader, Edit2, Trash2, ExternalLink, Plus, Check, X, Star, Tag, Save, AlertCircle, Eye, EyeOff, RefreshCw, LayoutGrid, Grid3X3, Grid2X2 } from 'lucide-react';
import axios from 'axios';
import OptimizedImage from '../../common/OptimizedImage.jsx';
import Skeleton from '../../common/Skeleton.jsx';
import { motion, AnimatePresence } from 'framer-motion';

// Animation Variants for a stable, high-end feel
const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
        opacity: 1,
        transition: {
            staggerChildren: 0.03,
            delayChildren: 0.05
        }
    }
};

const cardVariants = {
    hidden: { opacity: 0, y: 15 },
    visible: { 
        opacity: 1, 
        y: 0, 
        transition: { 
            duration: 0.4, 
            ease: [0.25, 1, 0.5, 1]
        } 
    },
    exit: { 
        opacity: 0,
        y: 10,
        transition: { duration: 0.2 } 
    }
};

const layoutTransition = {
    type: "spring",
    stiffness: 400,
    damping: 35,
    mass: 1
};

const ProductManager = () => {
    const [allProducts, setAllProducts] = useState([]);
    const [collections, setCollections] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedCollection, setSelectedCollection] = useState('all');
    const [editingProduct, setEditingProduct] = useState(null);
    const [gridSize, setGridSize] = useState('large'); // 'large' (3), 'medium' (5), 'small' (7)
    
    const fetchData = useCallback(async (isSilent = false) => {
        if (!isSilent) setLoading(true);
        try {
            const [productsRes, collectionsRes] = await Promise.all([
                axios.get('/api/v1/products', { 
                    params: { 
                        per_page: 500,
                        include_hidden: true
                    } 
                }),
                axios.get('/api/v1/products/collections')
            ]);
            
            if (productsRes.data.success) {
                setAllProducts(productsRes.data.data);
            }
            
            if (collectionsRes.data.success) {
                setCollections(collectionsRes.data.data);
            }
        } catch (error) {
            console.error('Failed to fetch product data:', error);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchData();
    }, [fetchData]);

    const filteredProducts = useMemo(() => {
        return allProducts.filter(product => {
            const matchesSearch = product.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                                 product.slug.toLowerCase().includes(searchTerm.toLowerCase());
            
            const matchesCollection = selectedCollection === 'all' || 
                                     product.collection_slug === selectedCollection;
            
            return matchesSearch && matchesCollection;
        });
    }, [allProducts, searchTerm, selectedCollection]);

    const handleUpdateProduct = (updatedProduct) => {
        setAllProducts(prev => prev.map(p => p.id === updatedProduct.id ? updatedProduct : p));
        setEditingProduct(null);
    };

    const toggleVisibility = async (product) => {
        const nextStatus = !product.is_visible;
        setAllProducts(prev => prev.map(p => 
            p.id === product.id ? { ...p, is_visible: nextStatus } : p
        ));

        try {
            const response = await axios.put(`/api/v1/admin/products/${product.id}`, { is_visible: nextStatus });
            if (!response.data.success) throw new Error('Failed to update');
        } catch (error) {
            console.error('Failed to toggle visibility:', error);
            setAllProducts(prev => prev.map(p => p.id === product.id ? product : p));
            alert('Failed to update product visibility. Reverting...');
        }
    };

    const handleDeleteProduct = async (id) => {
        if (window.confirm('Are you sure you want to permanently delete this product?')) {
            const previousProducts = [...allProducts];
            setAllProducts(prev => prev.filter(p => p.id !== id));
            try {
                await axios.delete(`/api/v1/admin/products/${id}`);
            } catch (error) {
                console.error('Failed to delete product:', error);
                setAllProducts(previousProducts);
                alert('Failed to delete product. Please check your permissions.');
            }
        }
    };

    const gridClasses = {
        large: "grid-cols-1 md:grid-cols-2 xl:grid-cols-3",
        medium: "grid-cols-2 md:grid-cols-3 xl:grid-cols-5",
        small: "grid-cols-3 md:grid-cols-5 xl:grid-cols-7"
    };

    return (
        <div className="space-y-8 pb-20">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 pb-6 border-b border-white/10">
                <div>
                    <h1 className="text-4xl font-serif text-white mb-2">Product Library</h1>
                    <p className="text-attire-silver text-sm">Manage styling house collections and products.</p>
                </div>
                <div className="flex flex-wrap gap-3 items-center">
                    {/* Grid Size Selectors */}
                    <div className="flex bg-white/5 border border-white/10 p-1 rounded-xl mr-2">
                        <button 
                            onClick={() => setGridSize('large')}
                            className={`px-3 py-2 rounded-lg text-[10px] font-bold transition-all ${gridSize === 'large' ? 'bg-white text-black' : 'text-attire-silver hover:text-white'}`}
                            title="Large View (3 Cols)"
                        >
                            3
                        </button>
                        <button 
                            onClick={() => setGridSize('medium')}
                            className={`px-3 py-2 rounded-lg text-[10px] font-bold transition-all ${gridSize === 'medium' ? 'bg-white text-black' : 'text-attire-silver hover:text-white'}`}
                            title="Medium View (5 Cols)"
                        >
                            5
                        </button>
                        <button 
                            onClick={() => setGridSize('small')}
                            className={`px-3 py-2 rounded-lg text-[10px] font-bold transition-all ${gridSize === 'small' ? 'bg-white text-black' : 'text-attire-silver hover:text-white'}`}
                            title="Small View (7 Cols)"
                        >
                            7
                        </button>
                    </div>

                    <button 
                        onClick={() => fetchData(false)}
                        disabled={loading}
                        className="flex items-center gap-2 px-6 py-3 bg-white/5 text-white text-xs font-bold uppercase tracking-widest rounded-xl hover:bg-white/10 transition-all border border-white/10 disabled:opacity-50"
                    >
                        <RefreshCw size={14} className={loading ? 'animate-spin' : ''} />
                        Sync Data
                    </button>
                    <button className="flex items-center gap-2 px-6 py-3 bg-attire-accent text-black text-xs font-bold uppercase tracking-widest rounded-xl hover:bg-white transition-all duration-300">
                        <Plus size={16} /> Add Product
                    </button>
                </div>
            </div>

            <div className="flex flex-col md:flex-row gap-4">
                <div className="relative flex-grow">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-attire-silver/40" size={18} />
                    <input 
                        type="text" 
                        placeholder="Search products..." 
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 pl-12 pr-6 text-white text-sm focus:border-attire-accent/50 focus:bg-white/10 outline-none transition-all placeholder:text-attire-silver/30"
                    />
                </div>
                <div className="relative min-w-[240px]">
                    <Filter className="absolute left-4 top-1/2 -translate-y-1/2 text-attire-silver/40" size={18} />
                    <select 
                        value={selectedCollection}
                        onChange={(e) => setSelectedCollection(e.target.value)}
                        className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 pl-12 pr-10 text-white text-sm focus:border-attire-accent/50 focus:bg-white/10 outline-none appearance-none transition-all cursor-pointer"
                    >
                        <option value="all" className="bg-[#111]">All Collections</option>
                        {collections.map(c => (
                            <option key={c.id} value={c.slug} className="bg-[#111]">{c.name}</option>
                        ))}
                    </select>
                </div>
            </div>

            {loading && allProducts.length === 0 ? (
                <div className={`grid ${gridClasses[gridSize]} gap-4 md:gap-6`}>
                    {[...Array(gridSize === 'small' ? 14 : 6)].map((_, i) => <ProductSkeleton key={i} size={gridSize} />)}
                </div>
            ) : (
                <motion.div 
                    layout
                    transition={layoutTransition}
                    variants={containerVariants}
                    initial="hidden"
                    animate="visible"
                    className={`grid ${gridClasses[gridSize]} gap-4 md:gap-6`}
                >
                    <AnimatePresence mode="popLayout" initial={false}>
                        {filteredProducts.length > 0 ? (
                            filteredProducts.map(product => (
                                <ProductCard 
                                    key={product.id} 
                                    product={product} 
                                    size={gridSize}
                                    onEdit={() => setEditingProduct(product)}
                                    onDelete={() => handleDeleteProduct(product.id)}
                                    onToggleVisibility={() => toggleVisibility(product)}
                                />
                            ))
                        ) : (
                            <motion.div 
                                key="empty"
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                exit={{ opacity: 0 }}
                                className="col-span-full text-center py-32 bg-black/20 rounded-3xl border border-white/5"
                            >
                                <ShoppingBag className="mx-auto text-attire-silver/20 mb-4" size={48} />
                                <p className="text-attire-silver/60">No products match your filters.</p>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </motion.div>
            )}

            <AnimatePresence>
                {editingProduct && (
                    <EditProductModal 
                        product={editingProduct} 
                        onClose={() => setEditingProduct(null)} 
                        onSave={handleUpdateProduct}
                    />
                )}
            </AnimatePresence>
        </div>
    );
};

const ProductCard = ({ product, onEdit, onDelete, onToggleVisibility, size }) => {
    const isCompact = size !== 'large';
    const isSmall = size === 'small';

    return (
        <motion.div 
            layout="position"
            transition={layoutTransition}
            variants={cardVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
            className={`bg-black/20 backdrop-blur-xl border rounded-3xl overflow-hidden group transition-colors duration-500 ${!product.is_visible ? 'border-white/5 opacity-60 grayscale' : 'border-white/10 hover:border-attire-accent/30 shadow-2xl shadow-black/50'}`}
        >
            <div className="aspect-[4/3] relative overflow-hidden">
                <OptimizedImage 
                    src={product.images[0]} 
                    alt={product.name} 
                    containerClassName="w-full h-full"
                    className="w-full h-full group-hover:scale-110 transition-transform duration-1000 object-cover"
                />
                <div className={`absolute ${isSmall ? 'top-2 left-2 gap-1' : 'top-4 left-4 gap-2'} flex z-20`}>
                    {product.is_featured && (
                        <div className={`bg-attire-accent text-black ${isSmall ? 'p-1' : 'p-2'} rounded-full shadow-lg`} title="Featured Product">
                            <Star size={isSmall ? 10 : 12} fill="currentColor" />
                        </div>
                    )}
                    {product.is_new && !isSmall && (
                        <div className="bg-blue-500 text-white px-2 py-1 rounded text-[10px] font-bold uppercase tracking-widest">
                            New
                        </div>
                    )}
                </div>
                
                <div className={`absolute ${isSmall ? 'top-2 right-2' : 'top-4 right-4'} opacity-0 group-hover:opacity-100 transition-all z-20 translate-y-2 group-hover:translate-y-0`}>
                    <button 
                        onClick={(e) => { e.stopPropagation(); onToggleVisibility(); }}
                        className={`${isSmall ? 'p-2' : 'p-3'} rounded-xl backdrop-blur-md border transition-all ${product.is_visible ? 'bg-white/10 border-white/10 text-white hover:bg-white/20' : 'bg-red-500/20 border-red-500/20 text-red-400 hover:bg-red-500/30'}`}
                        title={product.is_visible ? "Hide from Store" : "Show in Store"}
                    >
                        {product.is_visible ? <Eye size={isSmall ? 14 : 16} /> : <EyeOff size={isSmall ? 14 : 16} />}
                    </button>
                </div>

                <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 flex items-end p-4 md:p-6">
                    <div className="flex gap-2 md:gap-3 w-full translate-y-4 group-hover:translate-y-0 transition-transform duration-500">
                        <button 
                            onClick={onEdit}
                            className={`flex-grow flex items-center justify-center gap-2 bg-white text-black ${isSmall ? 'py-2 px-1' : 'py-3'} rounded-xl text-[10px] font-bold uppercase tracking-widest hover:bg-attire-accent transition-colors shadow-xl`}
                        >
                            <Edit2 size={isSmall ? 10 : 12} /> {isSmall ? 'Edit' : 'Edit Details'}
                        </button>
                        {!isSmall && (
                            <button 
                                onClick={onDelete}
                                className="w-12 h-12 flex items-center justify-center bg-red-500/20 text-red-500 rounded-xl hover:bg-red-500 hover:text-white transition-all border border-red-500/20 shadow-xl"
                            >
                                <Trash2 size={16} />
                            </button>
                        )}
                    </div>
                </div>
            </div>
            <div className={`${isSmall ? 'p-3' : 'p-6'}`}>
                <div className="flex justify-between items-start mb-2 gap-2">
                    <h3 className={`${isSmall ? 'text-xs' : 'text-lg'} font-serif group-hover:text-attire-accent transition-colors truncate ${!product.is_visible ? 'text-white/40' : 'text-white'}`}>{product.name}</h3>
                    <span className={`font-mono ${isSmall ? 'text-[10px]' : 'text-sm'} font-medium ${!product.is_visible ? 'text-white/30' : 'text-attire-accent'}`}>${product.price}</span>
                </div>
                {!isSmall && (
                    <div className="flex items-center gap-2 mb-4">
                        <Tag size={12} className={!product.is_visible ? 'text-white/20' : 'text-attire-accent'} />
                        <span className={`text-[10px] uppercase tracking-[0.2em] font-bold ${!product.is_visible ? 'text-white/20' : 'text-attire-silver/60'}`}>{product.collection || 'Elite Collection'}</span>
                    </div>
                )}
                <div className={`flex items-center justify-between ${isSmall ? '' : 'pt-4 border-t border-white/5'}`}>
                    <div className="flex items-center gap-2">
                        <div className={`w-1.5 h-1.5 rounded-full ${!product.is_visible ? 'bg-white/10' : product.availability === 'In Stock' ? 'bg-green-500' : 'bg-red-500'}`} />
                        <span className={`text-[9px] uppercase tracking-[0.2em] font-bold ${!product.is_visible ? 'text-white/20' : 'text-attire-silver/40'}`}>
                            {!product.is_visible ? 'Hidden' : product.availability}
                        </span>
                    </div>
                    {product.is_visible && !isSmall && (
                        <a href={`/product/${product.slug}`} target="_blank" rel="noopener noreferrer" className="text-attire-silver/40 hover:text-white transition-colors p-1">
                            <ExternalLink size={14} />
                        </a>
                    )}
                </div>
            </div>
        </motion.div>
    );
};

const ProductSkeleton = ({ size }) => {
    const isSmall = size === 'small';
    return (
        <div className={`bg-white/5 border border-white/5 rounded-3xl overflow-hidden p-0 ${isSmall ? 'h-[250px]' : 'h-[400px]'}`}>
            <Skeleton className="aspect-[4/3] rounded-none" />
            <div className={`${isSmall ? 'p-3' : 'p-6'} space-y-4`}>
                <div className="flex justify-between">
                    <Skeleton className="h-4 w-2/3" />
                    <Skeleton className="h-4 w-1/4" />
                </div>
                {!isSmall && <Skeleton className="h-3 w-1/2" />}
            </div>
        </div>
    );
};

const EditProductModal = ({ product, onClose, onSave }) => {
    const [formData, setFormData] = useState({
        name: product.name,
        price: product.price,
        description: product.description || '',
        availability: product.availability,
        is_featured: product.is_featured,
        is_new: product.is_new,
        is_visible: product.is_visible !== undefined ? product.is_visible : true,
    });
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState(null);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSaving(true);
        setError(null);
        try {
            const response = await axios.put(`/api/v1/admin/products/${product.id}`, formData);
            if (response.data.success) {
                onSave(response.data.data);
            }
        } catch (err) {
            console.error('Failed to save product:', err);
            setError(err.response?.data?.message || 'Failed to save changes. Please try again.');
        } finally {
            setSaving(false);
        }
    };

    return (
        <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[1000] flex items-center justify-center p-4 md:p-6 bg-black/90 backdrop-blur-xl"
        >
            <motion.div 
                initial={{ scale: 0.95, opacity: 0, y: 20 }}
                animate={{ scale: 1, opacity: 1, y: 0 }}
                exit={{ scale: 0.95, opacity: 0, y: 20 }}
                transition={{ type: "spring", damping: 25, stiffness: 300 }}
                className="bg-[#0a0a0a] border border-white/10 rounded-[2rem] w-full max-w-2xl max-h-[90vh] overflow-y-auto hide-scrollbar shadow-[0_0_100px_rgba(0,0,0,0.8)]"
            >
                <div className="p-8 border-b border-white/5 flex justify-between items-center sticky top-0 bg-[#0a0a0a]/80 backdrop-blur-md z-10">
                    <div>
                        <h2 className="text-2xl font-serif text-white">Edit Product</h2>
                        <p className="text-attire-silver text-xs uppercase tracking-widest mt-1">ID: {product.id} • {product.slug}</p>
                    </div>
                    <button onClick={onClose} className="p-3 hover:bg-white/5 rounded-full transition-colors text-white/40 hover:text-white">
                        <X size={24} />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="p-8 space-y-8">
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

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        <div className="space-y-2">
                            <label className="text-[10px] font-bold text-attire-silver/50 uppercase tracking-[0.2em] ml-1">Product Name</label>
                            <input 
                                type="text" 
                                value={formData.name}
                                onChange={e => setFormData({...formData, name: e.target.value})}
                                className="w-full bg-white/5 border border-white/10 rounded-xl py-4 px-5 text-white focus:border-attire-accent outline-none transition-all placeholder:text-white/10"
                                required
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="text-[10px] font-bold text-attire-silver/50 uppercase tracking-[0.2em] ml-1">Price ($)</label>
                            <input 
                                type="number" 
                                step="0.01"
                                value={formData.price}
                                onChange={e => setFormData({...formData, price: e.target.value})}
                                className="w-full bg-white/5 border border-white/10 rounded-xl py-4 px-5 text-white focus:border-attire-accent outline-none transition-all font-mono"
                                required
                            />
                        </div>
                    </div>

                    <div className="space-y-2">
                        <label className="text-[10px] font-bold text-attire-silver/50 uppercase tracking-[0.2em] ml-1">Description</label>
                        <textarea 
                            value={formData.description}
                            onChange={e => setFormData({...formData, description: e.target.value})}
                            rows={4}
                            className="w-full bg-white/5 border border-white/10 rounded-xl py-4 px-5 text-white focus:border-attire-accent outline-none transition-all resize-none text-sm leading-relaxed"
                        />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        <div className="space-y-2">
                            <label className="text-[10px] font-bold text-attire-silver/50 uppercase tracking-[0.2em] ml-1">Availability</label>
                            <div className="relative">
                                <select 
                                    value={formData.availability}
                                    onChange={e => setFormData({...formData, availability: e.target.value})}
                                    className="w-full bg-white/5 border border-white/10 rounded-xl py-4 px-5 text-white focus:border-attire-accent outline-none transition-all appearance-none cursor-pointer"
                                >
                                    <option value="In Stock" className="bg-[#111]">In Stock</option>
                                    <option value="Low Stock" className="bg-[#111]">Low Stock</option>
                                    <option value="Out of Stock" className="bg-[#111]">Out of Stock</option>
                                </select>
                                <RefreshCw size={14} className="absolute right-4 top-1/2 -translate-y-1/2 text-white/20 pointer-events-none" />
                            </div>
                        </div>
                        
                        <div className="grid grid-cols-2 gap-4 bg-white/5 p-4 rounded-xl border border-white/5">
                            <div className="flex flex-col items-center gap-2">
                                <label className="text-[9px] font-bold text-attire-silver/40 uppercase tracking-widest">Featured</label>
                                <button 
                                    type="button"
                                    onClick={() => setFormData({...formData, is_featured: !formData.is_featured})}
                                    className={`w-10 h-6 rounded-full transition-all duration-300 relative ${formData.is_featured ? 'bg-attire-accent' : 'bg-white/10'}`}
                                >
                                    <div className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-all duration-300 ${formData.is_featured ? 'left-5' : 'left-1'}`} />
                                </button>
                            </div>
                            <div className="flex flex-col items-center gap-2">
                                <label className="text-[9px] font-bold text-attire-silver/40 uppercase tracking-widest">New Arrival</label>
                                <button 
                                    type="button"
                                    onClick={() => setFormData({...formData, is_new: !formData.is_new})}
                                    className={`w-10 h-6 rounded-full transition-all duration-300 relative ${formData.is_new ? 'bg-blue-500' : 'bg-white/10'}`}
                                >
                                    <div className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-all duration-300 ${formData.is_new ? 'left-5' : 'left-1'}`} />
                                </button>
                            </div>
                        </div>
                    </div>

                    <div className="p-6 bg-white/[0.02] rounded-3xl border border-white/10 flex items-center justify-between">
                        <div>
                            <p className="text-sm font-bold text-white uppercase tracking-wider">Store Visibility</p>
                            <p className="text-[10px] text-attire-silver/60 mt-1 uppercase tracking-widest">Toggle visibility in public store</p>
                        </div>
                        <div className="flex items-center gap-4">
                            <span className={`text-[10px] font-bold uppercase tracking-[0.2em] ${formData.is_visible ? 'text-green-400' : 'text-red-400'}`}>
                                {formData.is_visible ? 'Visible' : 'Hidden'}
                            </span>
                            <button 
                                type="button"
                                onClick={() => setFormData({...formData, is_visible: !formData.is_visible})}
                                className={`w-16 h-9 rounded-full transition-all duration-500 relative flex items-center px-1.5 ${formData.is_visible ? 'bg-green-500/20 border border-green-500/30' : 'bg-red-500/20 border border-red-500/30'}`}
                            >
                                <div className={`w-6 h-6 rounded-full flex items-center justify-center transition-all duration-500 shadow-lg ${formData.is_visible ? 'translate-x-7 bg-green-500' : 'translate-x-0 bg-red-500'}`}>
                                    {formData.is_visible ? <Eye size={12} className="text-white" /> : <EyeOff size={12} className="text-white" />}
                                </div>
                            </button>
                        </div>
                    </div>

                    <div className="pt-4 flex gap-4">
                        <button 
                            type="button"
                            onClick={onClose}
                            className="flex-grow py-5 border border-white/10 rounded-2xl text-[10px] font-bold uppercase tracking-[0.4em] text-white/40 hover:text-white hover:bg-white/5 transition-all"
                        >
                            Cancel
                        </button>
                        <button 
                            type="submit"
                            disabled={saving}
                            className="flex-grow py-5 bg-white text-black rounded-2xl text-[10px] font-bold uppercase tracking-[0.4em] hover:bg-attire-accent transition-all flex items-center justify-center gap-3 shadow-xl shadow-white/5"
                        >
                            {saving ? <Loader className="animate-spin" size={16} /> : <Check size={16} />}
                            {saving ? 'Processing...' : 'Commit Changes'}
                        </button>
                    </div>
                </form>
            </motion.div>
        </motion.div>
    );
};

export default ProductManager;
