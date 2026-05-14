import React, { useState, useEffect, useCallback, useMemo, memo, useTransition } from 'react';
import { ShoppingBag, Search, Filter, Edit2, Trash2, ExternalLink, Plus, FolderPlus, Check, X, Star, Tag, Save, AlertCircle, Eye, EyeOff, ChevronDown, ChevronLeft, ChevronRight, Sparkles, Loader2 } from 'lucide-react';
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
    const [currentPage, setCurrentPage] = useState(1);
    const ITEMS_PER_PAGE = 25;

    const containerVariants = useMemo(() => getContainerVariants(performanceMode), [performanceMode]);
    const layoutTransition = useMemo(() => getLayoutTransition(performanceMode), [performanceMode]);
    const cardVariants = useMemo(() => getCardVariants(performanceMode), [performanceMode]);

    const { data: allProducts = [], isLoading: loading } = useQuery({
        queryKey: ['admin-products'],
        queryFn: async () => {
            const { data } = await axios.get('/api/v1/products', { 
                params: { 
                    per_page: 1000,
                    include_hidden: true
                } 
            });
            return data.data;
        },
        staleTime: 2 * 60 * 1000,
    });

    const fetchData = useCallback((invalidate = true) => {
        if (invalidate) {
            queryClient.invalidateQueries({ queryKey: ['admin-products'] });
        }
    }, [queryClient]);

    const handleEdit = useCallback((slug) => {
        navigate(`/admin/products/${slug}/edit`);
    }, [navigate]);

    // Reset to page 1 on filter change
    useEffect(() => {
        setCurrentPage(1);
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

    // Pagination computed values
    const totalPages = Math.max(1, Math.ceil(filteredProducts.length / ITEMS_PER_PAGE));
    const visibleProducts = useMemo(() => {
        const start = (currentPage - 1) * ITEMS_PER_PAGE;
        return filteredProducts.slice(start, start + ITEMS_PER_PAGE);
    }, [filteredProducts, currentPage]);

    // Generate page range for pagination buttons
    const pageRange = useMemo(() => {
        const range = [];
        const maxVisible = 5;
        let start = Math.max(1, currentPage - Math.floor(maxVisible / 2));
        let end = Math.min(totalPages, start + maxVisible - 1);
        if (end - start + 1 < maxVisible) start = Math.max(1, end - maxVisible + 1);
        for (let i = start; i <= end; i++) range.push(i);
        return range;
    }, [currentPage, totalPages]);

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
            
            try {
                const token = localStorage.getItem('admin_token') || sessionStorage.getItem('admin_token');
                const response = await axios.delete(`/api/v1/admin/products/${id}`, {
                    headers: { 'Authorization': `Bearer ${token}` }
                });
                
                if (response.data.success) {
                    queryClient.invalidateQueries(['admin-products']);
                } else {
                    throw new Error(response.data.message || 'Unknown error');
                }
            } catch (error) {
                console.error("Deletion Failed!", error);
                alert('Failed to delete product: ' + (error.response?.data?.message || error.message));
            }
        }
    }, [queryClient]);

    return (
        <div className="space-y-4 pb-20 font-sans">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 pb-6 border-b border-black/5 dark:border-[#30363d]">
                <div>
                    <h1 className="text-4xl font-serif text-gray-900 dark:text-[#c9d1d9] mb-2">Product Library</h1>
                    <p className="text-gray-500 dark:text-[#8b949e] text-sm">Manage styling house collections and products.</p>
                </div>
                <div className="flex flex-wrap gap-3 items-center">
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

            <div className="flex flex-col md:flex-row gap-4 pb-4">
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
                            <Loader2 className="animate-spin" size={16} />
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
                                    <Loader2 className="animate-spin" size={16} />
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
                        className={`border border-black/5 dark:border-[#30363d] rounded-3xl bg-white/50 dark:bg-[#161b22]/50 overflow-hidden ${isFiltering ? 'opacity-50' : 'opacity-100'} transition-all duration-300`}
                    >
                        {/* Table Header (Cyber-Bespoke Grid Setup) */}
                        <div className="hidden md:grid md:grid-cols-[48px_minmax(150px,1fr)_80px_110px_80px_80px_140px] md:gap-4 md:items-center px-6 py-4 border-b border-black/5 dark:border-[#30363d] text-[10px] font-bold uppercase tracking-widest text-gray-500 dark:text-[#8b949e]">
                            <div className="opacity-50">Ref</div>
                            <div className="opacity-50">Product Name</div>
                            <div className="text-center opacity-50">Rank</div>
                            <div className="opacity-50">Collection</div>
                            <div className="text-right opacity-50">Price</div>
                            <div className="text-right opacity-50">State</div>
                            <div className="text-right pr-2 opacity-50">Actions</div>
                        </div>

                        <AnimatePresence mode="popLayout" initial={false}>
                            {visibleProducts.length > 0 ? (
                                visibleProducts.map(product => (
                                    <ProductCard 
                                        key={product.id} 
                                        product={product} 
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
                                    className="p-16 text-center border-b border-black/5 dark:border-[#30363d]"
                                >
                                    <ShoppingBag className="mx-auto text-gray-300 dark:text-[#8b949e]/20 mb-4" size={48} />
                                    <p className="text-xs font-bold uppercase tracking-widest text-gray-400 dark:text-[#8b949e]/60">No products match your filters</p>
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </motion.div>

                    {/* Pagination Controls ✨ */}
                    {totalPages > 1 && !isFiltering && (
                        <div className="flex items-center justify-between mt-6 px-2">
                            <p className="text-[10px] font-bold uppercase tracking-widest text-gray-400 dark:text-[#8b949e]/50 tabular-nums">
                                {((currentPage - 1) * ITEMS_PER_PAGE) + 1}–{Math.min(currentPage * ITEMS_PER_PAGE, filteredProducts.length)} of {filteredProducts.length}
                            </p>
                            <div className="flex items-center gap-1">
                                <button
                                    onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                                    disabled={currentPage === 1}
                                    className="p-2 rounded-lg text-gray-400 dark:text-[#8b949e] hover:bg-black/5 dark:hover:bg-[#1c2128] hover:text-gray-900 dark:hover:text-white disabled:opacity-30 disabled:pointer-events-none transition-all"
                                >
                                    <ChevronLeft size={16} />
                                </button>
                                {pageRange[0] > 1 && (
                                    <>
                                        <button onClick={() => setCurrentPage(1)} className="w-8 h-8 rounded-lg text-[10px] font-bold text-gray-500 dark:text-[#8b949e] hover:bg-black/5 dark:hover:bg-[#1c2128] transition-all">1</button>
                                        {pageRange[0] > 2 && <span className="text-[10px] text-gray-300 dark:text-[#8b949e]/30 px-0.5">…</span>}
                                    </>
                                )}
                                {pageRange.map(p => (
                                    <button
                                        key={p}
                                        onClick={() => setCurrentPage(p)}
                                        className={`w-8 h-8 rounded-lg text-[10px] font-bold transition-all ${
                                            p === currentPage
                                                ? 'bg-[#0d3542] dark:bg-[#58a6ff] text-white dark:text-black'
                                                : 'text-gray-500 dark:text-[#8b949e] hover:bg-black/5 dark:hover:bg-[#1c2128]'
                                        }`}
                                    >
                                        {p}
                                    </button>
                                ))}
                                {pageRange[pageRange.length - 1] < totalPages && (
                                    <>
                                        {pageRange[pageRange.length - 1] < totalPages - 1 && <span className="text-[10px] text-gray-300 dark:text-[#8b949e]/30 px-0.5">…</span>}
                                        <button onClick={() => setCurrentPage(totalPages)} className="w-8 h-8 rounded-lg text-[10px] font-bold text-gray-500 dark:text-[#8b949e] hover:bg-black/5 dark:hover:bg-[#1c2128] transition-all">{totalPages}</button>
                                    </>
                                )}
                                <button
                                    onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                                    disabled={currentPage === totalPages}
                                    className="p-2 rounded-lg text-gray-400 dark:text-[#8b949e] hover:bg-black/5 dark:hover:bg-[#1c2128] hover:text-gray-900 dark:hover:text-white disabled:opacity-30 disabled:pointer-events-none transition-all"
                                >
                                    <ChevronRight size={16} />
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};

const ProductCard = memo(React.forwardRef(({ product, onEdit, onDelete, onToggleVisibility }, ref) => {
    const { performanceMode } = useAdmin();
    
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
            className={`group flex flex-col md:grid md:grid-cols-[48px_minmax(150px,1fr)_80px_110px_80px_80px_140px] px-5 py-4 md:px-6 md:py-3 md:items-center bg-white dark:bg-[#161b22] border-b border-black/5 dark:border-[#30363d] hover:bg-black/[0.02] dark:hover:bg-[#1c2128] transition-colors gap-3 md:gap-4 last:border-0 ${!product.is_visible ? 'opacity-60 grayscale' : ''}`}
        >
            {/* --- MOBILE TOP ROW / DESKTOP DIRECT ITEMS --- */}
            <div className="flex items-center gap-3 md:contents">
                {/* THUMBNAIL */}
                <div className={`relative shrink-0 w-12 h-12 overflow-hidden rounded-xl border border-black/5 dark:border-[#30363d] bg-black/5 dark:bg-white/5 transition-all duration-500`}>
                    <OptimizedImage 
                        src={product.images[0]} 
                        alt={product.name} 
                        containerClassName="w-full h-full"
                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                    />
                </div>

                {/* DESIGNATION */}
                <div className="flex-1 min-w-0 flex flex-col justify-center">
                    <h3 className={`font-serif text-sm truncate transition-colors ${!product.is_visible ? 'text-gray-500 dark:text-[#8b949e]/60' : 'text-gray-900 dark:text-[#c9d1d9] group-hover:text-[#0d3542] dark:group-hover:text-[#58a6ff]'}`}>
                        {product.name}
                    </h3>
                    <p className="font-mono text-[9px] uppercase tracking-widest text-gray-400 dark:text-[#8b949e]/40 truncate mt-0.5">
                        {product.slug}
                    </p>
                </div>

                {/* MOBILE PRICE (Visible only on mobile, hides on md) */}
                <div className="md:hidden font-mono text-sm font-bold text-gray-900 dark:text-[#c9d1d9] shrink-0">
                    ${product.price}
                </div>
            </div>

            {/* --- MOBILE MIDDLE BITS / DESKTOP COLUMNS --- */}
            <div className="flex items-center flex-wrap gap-2 md:contents mt-1 md:mt-0">
                {/* RANK/FEAT */}
                <div className="flex items-center justify-start md:justify-center">
                    {product.is_featured ? (
                        <span className="text-[9px] px-2 py-1 rounded-md border border-[#0d3542]/20 dark:border-[#58a6ff]/20 text-[#0d3542] dark:text-[#58a6ff] uppercase tracking-widest bg-[#0d3542]/5 dark:bg-[#58a6ff]/5 font-bold">
                            Featured
                        </span>
                    ) : (
                        <span className="hidden md:inline text-[10px] text-gray-300 dark:text-[#8b949e]/20">-</span>
                    )}
                </div>

                {/* CLASS */}
                <div className="flex items-center justify-start">
                    <span className="text-[9px] md:text-[10px] font-bold uppercase tracking-widest px-2 md:px-3 py-1 rounded-lg bg-black/5 dark:bg-[#1c2128] text-gray-600 dark:text-[#8b949e] border border-black/5 dark:border-[#30363d] truncate max-w-[150px] md:max-w-full">
                        {product.collection || 'Default'}
                    </span>
                </div>

                {/* DESKTOP VALUE */}
                <div className="hidden md:block font-mono text-sm text-right text-gray-900 dark:text-[#c9d1d9]">
                    ${product.price}
                </div>

                {/* STATUS */}
                <div className="flex items-center justify-start md:justify-end gap-1.5 shrink-0 ml-auto md:ml-0">
                    <div className={`w-1.5 h-1.5 rounded-full ${product.is_visible ? 'bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]' : 'bg-red-500'}`} />
                    <span className="text-[9px] md:text-[10px] font-bold uppercase tracking-widest opacity-70 text-gray-700 dark:text-[#c9d1d9]">
                        {product.is_visible ? (product.availability || 'Active') : 'Hidden'}
                    </span>
                </div>
            </div>

            {/* CMD (ACTIONS) */}
            <div className="flex items-center justify-between md:justify-end gap-1.5 pt-3 md:pt-0 mt-1 md:mt-0 border-t border-black/5 dark:border-[#30363d] md:border-t-0 md:opacity-0 md:group-hover:opacity-100 transition-opacity duration-300 shrink-0">
                <button 
                    onClick={(e) => { e.stopPropagation(); onToggleVisibility(product.id, product.is_visible); }}
                    className={`flex-1 md:flex-none flex justify-center items-center gap-2 p-2.5 md:p-2 rounded-xl transition-all border border-black/5 dark:border-[#30363d] md:border-transparent ${product.is_visible ? 'text-gray-500 hover:bg-black/5 dark:hover:bg-[#1c2128] hover:text-gray-900 dark:hover:text-white' : 'text-gray-500 hover:bg-black/5 dark:hover:bg-[#1c2128] hover:text-gray-900 dark:hover:text-white'}`}
                    title="Toggle Visibility"
                >
                    {product.is_visible ? <Eye size={16} className="md:w-3.5 md:h-3.5" /> : <EyeOff size={16} className="md:w-3.5 md:h-3.5" />}
                    <span className="md:hidden text-[10px] font-bold uppercase tracking-widest">{product.is_visible ? 'Hide' : 'Show'}</span>
                </button>
                <button 
                    onClick={(e) => { e.stopPropagation(); onEdit(product.slug); }}
                    className="flex-1 md:flex-none flex justify-center items-center gap-2 p-2.5 md:p-2 rounded-xl text-gray-500 hover:bg-[#0d3542]/10 dark:hover:bg-[#58a6ff]/10 hover:text-[#0d3542] dark:hover:text-[#58a6ff] transition-all border border-black/5 dark:border-[#30363d] md:border-transparent"
                    title="Modify"
                >
                    <Edit2 size={16} className="md:w-3.5 md:h-3.5" />
                    <span className="md:hidden text-[10px] font-bold uppercase tracking-widest">Edit</span>
                </button>
                {product.is_visible && (
                    <a href={`/product/${product.slug}`} target="_blank" rel="noopener noreferrer" className="flex-1 md:flex-none flex justify-center items-center gap-2 p-2.5 md:p-2 rounded-xl text-gray-500 hover:bg-black/5 dark:hover:bg-[#1c2128] hover:text-gray-900 dark:hover:text-[#c9d1d9] transition-all border border-black/5 dark:border-[#30363d] md:border-transparent hidden sm:flex md:block">
                        <ExternalLink size={16} className="md:w-3.5 md:h-3.5" />
                        <span className="md:hidden text-[10px] font-bold uppercase tracking-widest">View</span>
                    </a>
                )}
                <button 
                    onClick={(e) => { e.stopPropagation(); onDelete(product.id); }}
                    className="flex-none p-2.5 md:p-2 rounded-xl text-gray-500 hover:bg-red-500/10 hover:text-red-500 transition-all border border-black/5 dark:border-[#30363d] md:border-transparent ml-2 md:ml-0"
                    title="Purge"
                >
                    <Trash2 size={16} className="md:w-3.5 md:h-3.5" />
                </button>
            </div>
        </motion.div>
    );
}));

// LoadingState removed in favor of LumaSpin

export default ProductManager;
