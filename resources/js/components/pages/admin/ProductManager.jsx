import React, { useState, useEffect, useCallback, useMemo, memo, useTransition } from 'react';
import { ShoppingBag, Search, Filter, Edit2, Trash2, ExternalLink, Plus, FolderPlus, Check, X, Star, Tag, Save, AlertCircle, Eye, EyeOff, ChevronDown, Sparkles } from 'lucide-react';
import { LumaSpin } from '@/components/ui/luma-spin';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import OptimizedImage from '../../common/OptimizedImage.jsx';
import { motion, AnimatePresence } from 'framer-motion';
import { useAdmin } from './AdminContext';
import { useQuery, useQueryClient } from '@tanstack/react-query';

// Animation Variants for a stable, high-end feel
const getContainerVariants = (performanceMode) => ({
    hidden: { opacity: 0 },
    visible: {
        opacity: 1,
        transition: performanceMode 
            ? { duration: 0 }
            : {
                staggerChildren: 0.02,
                delayChildren: 0.05
            }
    }
});

const getCardVariants = (performanceMode) => ({
    hidden: { opacity: 0, y: performanceMode ? 0 : 15 },
    visible: { 
        opacity: 1, 
        y: 0, 
        transition: performanceMode 
            ? { duration: 0 }
            : { 
                duration: 0.4, 
                ease: [0.25, 1, 0.5, 1]
            } 
    },
    exit: { 
        opacity: 0,
        scale: performanceMode ? 1 : 0.98,
        transition: { duration: performanceMode ? 0 : 0.2 } 
    }
});

const getLayoutTransition = (performanceMode) => performanceMode ? { duration: 0 } : {
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
                className="w-full bg-black/5 dark:bg-[#161b22] border border-black/5 dark:border-[#30363d] rounded-2xl py-4 pl-12 pr-10 text-gray-900 dark:text-[#c9d1d9] text-sm text-left focus:border-[#0d3542] dark:focus:border-[#58a6ff] outline-none transition-all cursor-pointer flex items-center justify-between group"
            >
                <Icon className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 dark:text-[#8b949e]/40 group-hover:text-[#0d3542] dark:group-hover:text-[#58a6ff] transition-colors" size={18} />
                <span className="truncate">{displayName}</span>
                <ChevronDown size={16} className={`text-gray-400 dark:text-[#8b949e]/40 transition-transform duration-300 ${isOpen ? 'rotate-180' : ''}`} />
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
                            className="absolute top-full left-0 right-0 mt-2 z-[70] bg-white dark:bg-[#161b22] border border-black/5 dark:border-[#30363d] rounded-2xl overflow-hidden"
                        >
                            <div className="max-h-60 overflow-y-auto attire-scrollbar p-2">
                                {options.map((opt, idx) => (
                                    <React.Fragment key={opt.id || opt.slug || idx}>
                                        {idx > 0 && opt.slug === 'all' && <div className="h-px bg-black/5 dark:bg-white/5 my-1 mx-2" />}
                                        <button
                                            type="button"
                                            onClick={() => { onChange(opt.slug || opt.name); setIsOpen(false); }}
                                            className={`w-full text-left px-4 py-3 rounded-xl text-xs font-bold uppercase tracking-widest transition-all ${idx > 0 ? 'mt-1' : ''} ${selected === (opt.slug || opt.name) ? 'bg-[#0d3542] dark:bg-[#58a6ff] text-white dark:text-black' : 'text-gray-500 dark:text-[#8b949e] hover:bg-black/5 dark:hover:bg-white/5 hover:text-gray-900 dark:hover:text-white'}`}
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
    const queryClient = useQueryClient();
    const { setIsEditing, showCollections, setShowCollections, collections, fetchCollections, performanceMode } = useAdmin();
    const navigate = useNavigate();
    const [isPending, startTransition] = useTransition();
    const [isFiltering, setIsFiltering] = useState(false);
    const [searchInput, setSearchInput] = useState('');
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedCollection, setSelectedCollection] = useState('all');
    const [gridSize, setGridSize] = useState('medium'); // Default to 5 columns ✨
    const [visibleRows, setVisibleRows] = useState(3); // Show only 3 rows initially ✨

    const containerVariants = useMemo(() => getContainerVariants(performanceMode), [performanceMode]);
    const layoutTransition = useMemo(() => getLayoutTransition(performanceMode), [performanceMode]);
    const cardVariants = useMemo(() => getCardVariants(performanceMode), [performanceMode]);
    
    const itemsPerRow = useMemo(() => ({
        large: 3,
        medium: 5,
        small: 7
    }), []);

    const { data: allProducts = [], isLoading: loading } = useQuery({
        queryKey: ['admin-products'],
        queryFn: async () => {
            const { data } = await axios.get('/api/v1/products', { 
                params: { 
                    per_page: 1000,
                    include_hidden: true
                } 
            });
            // Also refresh global collections if needed ✨
            fetchCollections();
            return data.data;
        }
    });

    const fetchData = useCallback((invalidate = true) => {
        if (invalidate) {
            queryClient.invalidateQueries({ queryKey: ['admin-products'] });
        }
    }, [queryClient]);

    useEffect(() => {
        // Initial fetch handled by useQuery, but we refresh collections ✨
        fetchCollections();
    }, [fetchCollections]);

    const handleEdit = useCallback((slug) => {
        navigate(`/admin/products/${slug}/edit`);
    }, [navigate]);

    // Handle smooth search transition and reset pagination
    useEffect(() => {
        setVisibleRows(3); // Reset rows on filter change
    }, [searchTerm, selectedCollection]);

    // Handle debounced search transition
    useEffect(() => {
        const timer = setTimeout(() => {
            startTransition(() => {
                setSearchTerm(searchInput);
            });
        }, 300);
        return () => clearTimeout(timer);
    }, [searchInput]);

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

    const handleLoadMore = useCallback(() => {
        setVisibleRows(prev => prev + 3); // Load 3 more rows
    }, []);

    const toggleVisibility = useCallback(async (productId, currentVisibility) => {
        const nextStatus = !currentVisibility;
        
        // Local Optimistic Update via Query Cache
        queryClient.setQueryData(['admin-products'], oldData => {
            if (!oldData) return oldData;
            return oldData.map(p => p.id === productId ? { ...p, is_visible: nextStatus } : p);
        });

        try {
            const token = localStorage.getItem('admin_token') || sessionStorage.getItem('admin_token');
            const response = await axios.put(`/api/v1/admin/products/${productId}`, 
                { is_visible: nextStatus },
                { headers: { 'Authorization': `Bearer ${token}` } }
            );
            if (!response.data.success) throw new Error('Failed to update');
        } catch (error) {
            console.error('Failed to toggle visibility:', error);
            // Rollback on error
            queryClient.invalidateQueries(['admin-products']);
            alert('Failed to update product visibility.');
        }
    }, [queryClient]);

    const handleDeleteProduct = useCallback(async (id) => {
        if (window.confirm('Are you sure you want to permanently delete this product? This will also remove all associated images from MinIO.')) {
            console.log(`Initiating permanent deletion for Product ID: ${id}`);
            
            try {
                const token = localStorage.getItem('admin_token') || sessionStorage.getItem('admin_token');
                const response = await axios.delete(`/api/v1/admin/products/${id}`, {
                    headers: { 'Authorization': `Bearer ${token}` }
                });
                
                if (response.data.success) {
                    queryClient.invalidateQueries(['admin-products']);
                    console.log("Deletion Successful!");
                } else {
                    throw new Error(response.data.message || 'Unknown error');
                }
            } catch (error) {
                console.error("Deletion Failed!", error);
                alert('Failed to delete product: ' + (error.response?.data?.message || error.message));
            }
        }
    }, [queryClient]);

    const gridClasses = {
        large: "grid-cols-1 md:grid-cols-2 xl:grid-cols-3",
        medium: "grid-cols-2 md:grid-cols-3 xl:grid-cols-5",
        small: "grid-cols-3 md:grid-cols-5 xl:grid-cols-7"
    };

    return (
        <div className="space-y-8 pb-20">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 pb-6 border-b border-black/5 dark:border-[#30363d]">
                <div>
                    <h1 className="text-4xl font-serif text-gray-900 dark:text-[#c9d1d9] mb-2">Product Library</h1>
                    <p className="text-gray-500 dark:text-[#8b949e] text-sm">Manage styling house collections and products.</p>
                </div>
                <div className="flex flex-wrap gap-3 items-center">
                    <div className="flex bg-black/5 dark:bg-[#161b22] border border-black/5 dark:border-[#30363d] p-1 rounded-xl mr-2">
                        {['large', 'medium', 'small'].map((size, idx) => (
                            <button 
                                key={size}
                                onClick={() => setGridSize(size)}
                                className={`px-3 py-2 rounded-lg text-[10px] font-bold transition-all ${gridSize === size ? 'bg-white dark:bg-[#0d3542] text-black dark:text-white' : 'text-gray-400 dark:text-[#8b949e] hover:text-gray-900 dark:hover:text-white'}`}
                            >
                                {[3, 5, 7][idx]}
                            </button>
                        ))}
                    </div>

                    <button 
                        onClick={() => fetchData(false)}
                        disabled={loading}
                        className="flex items-center gap-2 px-6 py-3 bg-black/5 dark:bg-[#161b22] text-gray-900 dark:text-[#c9d1d9] text-xs font-bold uppercase tracking-widest rounded-xl hover:bg-black/10 dark:hover:bg-[#1c2128] transition-all border border-black/5 dark:border-[#30363d] disabled:opacity-50"
                    >
                        {loading ? <LumaSpin size="sm" /> : <LumaSpin size="sm" className="opacity-0 group-hover:opacity-100 transition-opacity" style={{ animation: 'none' }} />}
                        Sync
                    </button>
                    <button 
                        onClick={() => navigate('/admin/collections')}
                        className="flex items-center gap-2 px-6 py-3 bg-white/5 dark:bg-[#161b22] text-gray-900 dark:text-[#c9d1d9] text-xs font-bold uppercase tracking-widest rounded-xl hover:bg-black/10 dark:hover:bg-[#1c2128] transition-all border border-black/5 dark:border-[#30363d]"
                    >
                        <FolderPlus size={16} /> Manage Collections
                    </button>
                    <button 
                        onClick={() => navigate('/admin/products/bulk')}
                        className="flex items-center gap-2 px-6 py-3 bg-black/5 dark:bg-[#161b22] text-gray-900 dark:text-[#c9d1d9] text-xs font-bold uppercase tracking-widest rounded-xl hover:bg-black/10 dark:hover:bg-[#1c2128] transition-all border border-black/5 dark:border-[#30363d]"
                    >
                        <Sparkles size={16} className="text-[#0d3542] dark:text-[#58a6ff]" /> Bulk Upload
                    </button>
                    <button 
                        onClick={() => navigate('/admin/products/new')}
                        className="flex items-center gap-2 px-6 py-3 bg-[#0d3542] dark:bg-[#58a6ff] text-white dark:text-black text-xs font-bold uppercase tracking-widest rounded-xl hover:bg-black dark:hover:bg-white transition-all duration-300"
                    >
                        <Plus size={16} /> Add Product
                    </button>
                </div>
            </div>

            <div className="flex flex-col md:flex-row gap-4">
                <div className="relative flex-grow">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 dark:text-[#8b949e]/40" size={18} />
                    <input 
                        type="text" 
                        placeholder="Quick search products..." 
                        value={searchInput}
                        onChange={(e) => setSearchInput(e.target.value)}
                        className="w-full bg-black/5 dark:bg-[#161b22] border border-black/5 dark:border-[#30363d] rounded-2xl py-4 pl-12 pr-6 text-gray-900 dark:text-[#c9d1d9] text-sm focus:border-[#0d3542] dark:focus:border-[#58a6ff] outline-none transition-all"
                    />
                    {(isPending || isFiltering) && (
                        <div className="absolute right-4 top-1/2 -translate-y-1/2">
                            <LumaSpin size="sm" />
                        </div>
                    )}
                </div>
                <CustomDropdown 
                    selected={selectedCollection}
                    options={[{ name: 'All Collections', slug: 'all' }, ...collections]}
                    onChange={setSelectedCollection}
                    className="min-w-[240px]"
                />
            </div>

            {loading && allProducts.length === 0 ? (
                <div className="py-48 flex flex-col items-center justify-center space-y-4">
                    <LumaSpin size="xl" />
                    <p className="text-[10px] font-black uppercase tracking-[0.4em] text-gray-400 dark:text-[#8b949e]/40">Syncing Catalog...</p>
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
                                <div className="bg-white/60 dark:bg-black/60 p-4 rounded-2xl border border-black/5 dark:border-white/10 flex items-center gap-3">
                                    <LumaSpin size="sm" />
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
                                        onEdit={handleEdit}
                                        onDelete={handleDeleteProduct}
                                        onToggleVisibility={toggleVisibility}
                                    />
                                ))
                            ) : (
                                <motion.div 
                                    key="empty"
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    exit={{ opacity: 0 }}
                                    className="col-span-full text-center py-32 bg-black/5 dark:bg-[#161b22] rounded-3xl border border-black/5 dark:border-[#30363d]"
                                >
                                    <ShoppingBag className="mx-auto text-gray-300 dark:text-[#8b949e]/20 mb-4" size={48} />
                                    <p className="text-gray-500 dark:text-[#8b949e]/60">No products match your filters.</p>
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
                                className="group flex items-center gap-3 px-8 py-4 bg-black/5 dark:bg-[#161b22] hover:bg-black/10 dark:hover:bg-[#1c2128] border border-black/5 dark:border-[#30363d] rounded-2xl transition-all duration-300"
                            >
                                <span className="text-[10px] font-bold uppercase tracking-[0.3em] text-gray-900 dark:text-white">Show More Products</span>
                                <ChevronDown size={16} className="text-[#0d3542] dark:text-[#58a6ff] group-hover:translate-y-1 transition-transform" />
                            </button>
                        </motion.div>
                    )}
                </div>
            )}
        </div>
    );
};

const ProductCard = memo(React.forwardRef(({ product, onEdit, onDelete, onToggleVisibility, size }, ref) => {
    const { performanceMode } = useAdmin();
    const isSmall = size === 'small';
    
    const cardVariants = useMemo(() => getCardVariants(performanceMode), [performanceMode]);
    const layoutTransition = useMemo(() => getLayoutTransition(performanceMode), [performanceMode]);


    return (
        <motion.div 
            ref={ref}
            layout="position"
            transition={layoutTransition}
            variants={cardVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
            className={`bg-white dark:bg-[#161b22] border rounded-3xl overflow-hidden group transition-colors duration-500 shadow-none ${!product.is_visible ? 'border-black/5 dark:border-[#30363d] opacity-60 grayscale' : 'border-black/5 dark:border-[#30363d] hover:border-[#0d3542]/30 dark:hover:border-[#58a6ff]/30'}`}
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
                        <div className={`bg-[#0d3542] dark:bg-[#58a6ff] text-white dark:text-black ${isSmall ? 'p-1' : 'p-2'} rounded-full`} title="Featured Product">
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
                        onClick={(e) => { e.stopPropagation(); onToggleVisibility(product.id, product.is_visible); }}
                        className={`${isSmall ? 'p-2' : 'p-3'} rounded-xl transition-all ${product.is_visible ? 'bg-black/20 border-white/10 text-white hover:bg-black/40' : 'bg-red-500/20 border-red-500/20 text-red-400 hover:bg-red-500/30'}`}
                    >
                        {product.is_visible ? <Eye size={isSmall ? 14 : 16} /> : <EyeOff size={14} />}
                    </button>
                </div>

                <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 flex items-end p-4 md:p-6">
                    <div className="flex gap-2 md:gap-3 w-full translate-y-4 group-hover:translate-y-0 transition-transform duration-500">
                        <button 
                            onClick={(e) => { e.stopPropagation(); onEdit(product.slug); }}
                            className={`flex-grow flex items-center justify-center gap-2 bg-white text-black ${isSmall ? 'py-2 px-1' : 'py-3'} rounded-xl text-[10px] font-bold uppercase tracking-widest hover:bg-[#58a6ff] transition-colors`}
                        >
                            <Edit2 size={isSmall ? 10 : 12} /> {isSmall ? 'Edit' : 'Edit Details'}
                        </button>
                        {!isSmall && (
                            <button 
                                onClick={(e) => { e.stopPropagation(); onDelete(product.id); }}
                                className="w-12 h-12 flex items-center justify-center bg-red-500/20 text-red-500 rounded-xl hover:bg-red-500 hover:text-white transition-all border border-red-500/20"
                            >
                                <Trash2 size={16} />
                            </button>
                        )}
                    </div>
                </div>
            </div>
            <div className={`${isSmall ? 'p-3' : 'p-6'}`}>
                <div className="flex justify-between items-start mb-2 gap-2">
                    <h3 className={`${isSmall ? 'text-xs' : 'text-lg'} font-serif group-hover:text-[#0d3542] dark:group-hover:text-[#58a6ff] transition-colors truncate ${!product.is_visible ? 'text-gray-400 dark:text-[#8b949e]/40' : 'text-gray-900 dark:text-[#c9d1d9]'}`}>{product.name}</h3>
                    <span className={`font-mono ${isSmall ? 'text-[10px]' : 'text-sm'} font-medium ${!product.is_visible ? 'text-gray-300 dark:text-white/30' : 'text-[#0d3542] dark:text-[#58a6ff]'}`}>${product.price}</span>
                </div>
                {!isSmall && (
                    <div className="flex items-center gap-2 mb-4">
                        <Tag size={12} className={!product.is_visible ? 'text-gray-300 dark:text-white/20' : 'text-[#0d3542] dark:text-[#58a6ff]'} />
                        <span className={`text-[10px] uppercase tracking-[0.2em] font-bold ${!product.is_visible ? 'text-gray-300 dark:text-white/20' : 'text-gray-500 dark:text-[#8b949e]/60'}`}>{product.collection || 'Elite Collection'}</span>
                    </div>
                )}
                <div className={`flex items-center justify-between ${isSmall ? '' : 'pt-4 border-t border-black/5 dark:border-white/5'}`}>
                    <div className="flex items-center gap-2">
                        <div className={`w-1.5 h-1.5 rounded-full ${!product.is_visible ? 'bg-gray-200 dark:bg-white/10' : 'bg-green-500'}`} />
                        <span className={`text-[9px] uppercase tracking-[0.2em] font-bold ${!product.is_visible ? 'text-gray-300 dark:text-white/20' : 'text-gray-400 dark:text-[#8b949e]/40'}`}>
                            {!product.is_visible ? 'Hidden' : product.availability}
                        </span>
                    </div>
                    {product.is_visible && !isSmall && (
                        <a href={`/product/${product.slug}`} target="_blank" rel="noopener noreferrer" className="text-gray-400 dark:text-[#8b949e]/40 hover:text-gray-900 dark:hover:text-[#c9d1d9] transition-colors p-1">
                            <ExternalLink size={14} />
                        </a>
                    )}
                </div>
            </div>
        </motion.div>
    );
}));

// LoadingState removed in favor of LumaSpin

export default ProductManager;
