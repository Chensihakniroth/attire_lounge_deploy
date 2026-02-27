import React, { useState, useEffect, useCallback, useMemo, memo } from 'react';
import { ShoppingBag, Search, Filter, Loader, Edit2, Trash2, ExternalLink, Plus, Check, X, Star, Tag, Save, AlertCircle, Eye, EyeOff, RefreshCw, ChevronDown } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import OptimizedImage from '../../common/OptimizedImage.jsx';
import Skeleton from '../../common/Skeleton.jsx';
import { motion, AnimatePresence } from 'framer-motion';
import { useAdmin } from './AdminContext';

// Animation Variants for a stable, high-end feel
const containerVariants = {
// ... existing containerVariants ...

// ... existing containerVariants ...

    hidden: { opacity: 0 },
    visible: {
        opacity: 1,
        transition: {
            staggerChildren: 0.02,
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
        scale: 0.98,
        transition: { duration: 0.2 } 
    }
};

const layoutTransition = {
    type: "spring",
    stiffness: 500,
    damping: 40,
    mass: 1
};

const CustomDropdown = ({ selected, options, onChange, label, icon: Icon = Filter, className = "" }) => {
    const [isOpen, setIsOpen] = useState(false);
    const selectedItem = options.find(o => o.slug === selected || o.name === selected);
    const displayName = selectedItem ? selectedItem.name : (label || 'Select Option');

    return (
        <div className={`relative ${className}`}>
            <button
                type="button"
                onClick={() => setIsOpen(!isOpen)}
                className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 pl-12 pr-10 text-white text-sm text-left focus:border-attire-accent/50 focus:bg-white/10 outline-none transition-all cursor-pointer flex items-center justify-between group"
            >
                <Icon className="absolute left-4 top-1/2 -translate-y-1/2 text-attire-silver/40 group-hover:text-attire-accent transition-colors" size={18} />
                <span className="truncate">{displayName}</span>
                <ChevronDown size={16} className={`text-attire-silver/40 transition-transform duration-300 ${isOpen ? 'rotate-180' : ''}`} />
            </button>

            <AnimatePresence>
                {isOpen && (
                    <>
                        <div className="fixed inset-0 z-[60]" onClick={() => setIsOpen(false)} />
                        <motion.div
                            initial={{ opacity: 0, y: 10, scale: 0.95 }}
                            animate={{ opacity: 1, y: 0, scale: 1 }}
                            exit={{ opacity: 0, y: 10, scale: 0.95 }}
                            transition={{ duration: 0.2, ease: [0.22, 1, 0.36, 1] }}
                            className="absolute top-full left-0 right-0 mt-2 z-[70] bg-[#0d0d0d] border border-white/10 rounded-2xl overflow-hidden shadow-[0_20px_50px_rgba(0,0,0,0.5)] backdrop-blur-xl"
                        >
                            <div className="max-h-60 overflow-y-auto attire-scrollbar p-2">
                                {options.map((opt, idx) => (
                                    <React.Fragment key={opt.id || opt.slug || idx}>
                                        {idx > 0 && opt.slug === 'all' && <div className="h-px bg-white/5 my-1 mx-2" />}
                                        <button
                                            type="button"
                                            onClick={() => { onChange(opt.slug || opt.name); setIsOpen(false); }}
                                            className={`w-full text-left px-4 py-3 rounded-xl text-xs font-bold uppercase tracking-widest transition-all ${idx > 0 ? 'mt-1' : ''} ${selected === (opt.slug || opt.name) ? 'bg-attire-accent text-black' : 'text-attire-silver hover:bg-white/5 hover:text-white'}`}
                                        >
                                            {opt.name}
                                        </button>
                                    </React.Fragment>
                                ))}
                            </div>
                        </motion.div>
                    </>
                )}
            </AnimatePresence>
        </div>
    );
};

const ProductManager = () => {
    const { setIsEditing } = useAdmin();
    const navigate = useNavigate();
    const [allProducts, setAllProducts] = useState([]);
    const [collections, setCollections] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isFiltering, setIsFiltering] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedCollection, setSelectedCollection] = useState('all');
    const [gridSize, setGridSize] = useState('medium'); // Default to 5 columns ✨
    const [visibleRows, setVisibleRows] = useState(3); // Show only 3 rows initially ✨
    
    const itemsPerRow = {
        large: 3,
        medium: 5,
        small: 7
    };

    const fetchData = useCallback(async (isSilent = false) => {
        if (!isSilent) setLoading(true);
        try {
            const [productsRes, collectionsRes] = await Promise.all([
                axios.get('/api/v1/products', { 
                    params: { 
                        per_page: 1000,
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

    // Handle smooth search transition and reset pagination
    useEffect(() => {
        setVisibleRows(3); // Reset rows on filter change
        if (allProducts.length > 0) {
            setIsFiltering(true);
            const timer = setTimeout(() => setIsFiltering(false), 300);
            return () => clearTimeout(timer);
        }
    }, [searchTerm, selectedCollection, allProducts.length]);

    const filteredProducts = useMemo(() => {
        const term = searchTerm.toLowerCase();
        return allProducts.filter(product => {
            const matchesSearch = !term || 
                                 product.name.toLowerCase().includes(term) || 
                                 product.slug.toLowerCase().includes(term);
            
            const matchesCollection = selectedCollection === 'all' || 
                                     product.collection_slug === selectedCollection;
            
            return matchesSearch && matchesCollection;
        });
    }, [allProducts, searchTerm, selectedCollection]);

    // Paginated subset of filtered products
    const visibleProducts = useMemo(() => {
        return filteredProducts.slice(0, visibleRows * itemsPerRow[gridSize]);
    }, [filteredProducts, visibleRows, gridSize]);

    const hasMore = filteredProducts.length > visibleProducts.length;

    const handleLoadMore = () => {
        setVisibleRows(prev => prev + 3); // Load 3 more rows
    };

    const handleUpdateProduct = useCallback((updatedProduct) => {
        setAllProducts(prev => prev.map(p => p.id === updatedProduct.id ? updatedProduct : p));
        setEditingProduct(null);
    }, []);

    const toggleVisibility = useCallback(async (product) => {
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
            alert('Failed to update product visibility.');
        }
    }, []);

    const handleDeleteProduct = useCallback(async (id) => {
        if (window.confirm('Are you sure you want to permanently delete this product?')) {
            setAllProducts(prev => prev.filter(p => p.id !== id));
            try {
                await axios.delete(`/api/v1/admin/products/${id}`);
            } catch (error) {
                console.error('Failed to delete product:', error);
                fetchData(true);
                alert('Failed to delete product.');
            }
        }
    }, [fetchData]);

    const gridClasses = {
        large: "grid-cols-1 md:grid-cols-2 xl:grid-cols-3",
        medium: "grid-cols-2 md:grid-cols-3 xl:grid-cols-5",
        small: "grid-cols-3 md:grid-cols-5 xl:grid-cols-7"
    };

    return (
        <div className="space-y-8 pb-20">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 pb-6 border-b border-black/5 dark:border-white/10">
                <div>
                    <h1 className="text-4xl font-serif text-gray-900 dark:text-white mb-2">Product Library</h1>
                    <p className="text-gray-500 dark:text-attire-silver text-sm">Manage styling house collections and products.</p>
                </div>
                <div className="flex flex-wrap gap-3 items-center">
                    <div className="flex bg-black/5 dark:bg-white/5 border border-black/5 dark:border-white/10 p-1 rounded-xl mr-2">
                        {['large', 'medium', 'small'].map((size, idx) => (
                            <button 
                                key={size}
                                onClick={() => setGridSize(size)}
                                className={`px-3 py-2 rounded-lg text-[10px] font-bold transition-all ${gridSize === size ? 'bg-white dark:bg-white text-black' : 'text-gray-400 dark:text-attire-silver hover:text-gray-900 dark:hover:text-white'}`}
                            >
                                {[3, 5, 7][idx]}
                            </button>
                        ))}
                    </div>

                    <button 
                        onClick={() => fetchData(false)}
                        disabled={loading}
                        className="flex items-center gap-2 px-6 py-3 bg-black/5 dark:bg-white/5 text-gray-900 dark:text-white text-xs font-bold uppercase tracking-widest rounded-xl hover:bg-black/10 dark:hover:bg-white/10 transition-all border border-black/5 dark:border-white/10 disabled:opacity-50"
                    >
                        <RefreshCw size={14} className={loading ? 'animate-spin' : ''} />
                        Sync
                    </button>
                    <button 
                        onClick={() => navigate('/admin/products/new')}
                        className="flex items-center gap-2 px-6 py-3 bg-attire-accent text-black text-xs font-bold uppercase tracking-widest rounded-xl hover:bg-white dark:hover:bg-white transition-all duration-300"
                    >
                        <Plus size={16} /> Add Product
                    </button>
                </div>
            </div>

            <div className="flex flex-col md:flex-row gap-4">
                <div className="relative flex-grow">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 dark:text-attire-silver/40" size={18} />
                    <input 
                        type="text" 
                        placeholder="Quick search..." 
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full bg-black/5 dark:bg-white/5 border border-black/5 dark:border-white/10 rounded-2xl py-4 pl-12 pr-6 text-gray-900 dark:text-white text-sm focus:border-attire-accent/50 dark:focus:bg-white/10 outline-none transition-all"
                    />
                </div>
                <CustomDropdown 
                    selected={selectedCollection}
                    options={[{ name: 'All Collections', slug: 'all' }, ...collections]}
                    onChange={setSelectedCollection}
                    className="min-w-[240px]"
                />
            </div>

            {loading && allProducts.length === 0 ? (
                <div className={`grid ${gridClasses[gridSize]} gap-4 md:gap-6`}>
                    {[...Array(visibleRows * itemsPerRow[gridSize])].map((_, i) => <ProductSkeleton key={i} size={gridSize} />)}
                </div>
            ) : (
                <div className="relative min-h-[400px]">
                    <AnimatePresence>
                        {isFiltering && (
                            <motion.div 
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                exit={{ opacity: 0 }}
                                className="absolute inset-0 z-30 bg-white/80 dark:bg-[#0a0a0a]/80 flex items-center justify-center rounded-3xl"
                            >
                                <div className="bg-white/60 dark:bg-black/60 p-4 rounded-2xl border border-black/5 dark:border-white/10 flex items-center gap-3 shadow-xl">
                                    <Loader className="animate-spin text-attire-accent" size={20} />
                                    <span className="text-[10px] font-bold uppercase tracking-widest text-gray-900 dark:text-white">Refining Library...</span>
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>

                    <motion.div 
                        layout="position"
                        transition={layoutTransition}
                        variants={containerVariants}
                        initial="hidden"
                        animate="visible"
                        className={`grid ${gridClasses[gridSize]} gap-4 md:gap-6 ${isFiltering ? 'opacity-50 grayscale-[0.5]' : 'opacity-100'} transition-all duration-300`}
                    >
                        <AnimatePresence mode="popLayout" initial={false}>
                            {visibleProducts.length > 0 ? (
                                visibleProducts.map(product => (
                                    <ProductCard 
                                        key={product.id} 
                                        product={product} 
                                        size={gridSize}
                                        onEdit={() => navigate(`/admin/products/${product.slug}/edit`)}
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
                                    className="col-span-full text-center py-32 bg-black/5 dark:bg-black/20 rounded-3xl border border-black/5 dark:border-white/5"
                                >
                                    <ShoppingBag className="mx-auto text-gray-300 dark:text-attire-silver/20 mb-4" size={48} />
                                    <p className="text-gray-500 dark:text-attire-silver/60">No products match your filters.</p>
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </motion.div>

                    {/* Load More Button ✨ */}
                    {hasMore && !isFiltering && (
                        <motion.div 
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="flex justify-center mt-12"
                        >
                            <button 
                                onClick={handleLoadMore}
                                className="group flex items-center gap-3 px-8 py-4 bg-black/5 dark:bg-white/5 hover:bg-black/10 dark:hover:bg-white/10 border border-black/5 dark:border-white/10 rounded-2xl transition-all duration-300"
                            >
                                <span className="text-[10px] font-bold uppercase tracking-[0.3em] text-gray-900 dark:text-white">Show More Products</span>
                                <ChevronDown size={16} className="text-attire-accent group-hover:translate-y-1 transition-transform" />
                            </button>
                        </motion.div>
                    )}
                </div>
            )}
        </div>
    );
};

const ProductCard = memo(({ product, onEdit, onDelete, onToggleVisibility, size }) => {
    const isSmall = size === 'small';

    return (
        <motion.div 
            layout="position"
            transition={layoutTransition}
            variants={cardVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
            className={`bg-white dark:bg-black/20 backdrop-blur-xl border rounded-3xl overflow-hidden group transition-colors duration-500 ${!product.is_visible ? 'border-black/5 dark:border-white/5 opacity-60 grayscale' : 'border-black/5 dark:border-white/10 hover:border-attire-accent/30 shadow-2xl dark:shadow-black/50 shadow-gray-200'}`}
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
                    >
                        {product.is_visible ? <Eye size={isSmall ? 14 : 16} /> : <EyeOff size={14} />}
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
                    <h3 className={`${isSmall ? 'text-xs' : 'text-lg'} font-serif group-hover:text-attire-accent transition-colors truncate ${!product.is_visible ? 'text-gray-400 dark:text-white/40' : 'text-gray-900 dark:text-white'}`}>{product.name}</h3>
                    <span className={`font-mono ${isSmall ? 'text-[10px]' : 'text-sm'} font-medium ${!product.is_visible ? 'text-gray-300 dark:text-white/30' : 'text-attire-accent'}`}>${product.price}</span>
                </div>
                {!isSmall && (
                    <div className="flex items-center gap-2 mb-4">
                        <Tag size={12} className={!product.is_visible ? 'text-gray-300 dark:text-white/20' : 'text-attire-accent'} />
                        <span className={`text-[10px] uppercase tracking-[0.2em] font-bold ${!product.is_visible ? 'text-gray-300 dark:text-white/20' : 'text-gray-500 dark:text-attire-silver/60'}`}>{product.collection || 'Elite Collection'}</span>
                    </div>
                )}
                <div className={`flex items-center justify-between ${isSmall ? '' : 'pt-4 border-t border-black/5 dark:border-white/5'}`}>
                    <div className="flex items-center gap-2">
                        <div className={`w-1.5 h-1.5 rounded-full ${!product.is_visible ? 'bg-gray-200 dark:bg-white/10' : 'bg-green-500'}`} />
                        <span className={`text-[9px] uppercase tracking-[0.2em] font-bold ${!product.is_visible ? 'text-gray-300 dark:text-white/20' : 'text-gray-400 dark:text-attire-silver/40'}`}>
                            {!product.is_visible ? 'Hidden' : product.availability}
                        </span>
                    </div>
                    {product.is_visible && !isSmall && (
                        <a href={`/product/${product.slug}`} target="_blank" rel="noopener noreferrer" className="text-gray-400 dark:text-attire-silver/40 hover:text-gray-900 dark:hover:text-white transition-colors p-1">
                            <ExternalLink size={14} />
                        </a>
                    )}
                </div>
            </div>
        </motion.div>
    );
});

const ProductSkeleton = ({ size }) => {
    const isSmall = size === 'small';
    return (
        <div className={`bg-black/5 dark:bg-white/5 border border-black/5 dark:border-white/5 rounded-3xl overflow-hidden p-0 ${isSmall ? 'h-[250px]' : 'h-[400px]'}`}>
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

export default ProductManager;
