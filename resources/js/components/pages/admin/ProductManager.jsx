import React, { useState, useEffect, useCallback, useMemo, memo } from 'react';
import { ShoppingBag, Search, Edit2, Trash2, ExternalLink, Plus, FolderPlus, Star, Eye, EyeOff, ChevronLeft, ChevronRight, AlertTriangle, Loader2 } from 'lucide-react';
import { LumaSpin } from '@/components/ui/luma-spin';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import OptimizedImage from '../../common/OptimizedImage.jsx';
import { useAdmin } from './AdminContext';
import { useQuery, useQueryClient } from '@tanstack/react-query';

/* ------------------------------------------------------------------ */
/*  Delete Confirmation Modal                                          */
/* ------------------------------------------------------------------ */
const DeleteModal = ({ productName, onConfirm, onCancel, isDeleting }) => (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
        <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onCancel} />
        <div className="relative bg-white dark:bg-[#161b22] border border-black/10 dark:border-[#30363d] rounded-2xl p-6 max-w-sm w-full shadow-2xl">
            <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-xl bg-red-500/10 flex items-center justify-center">
                    <AlertTriangle size={20} className="text-red-500" />
                </div>
                <div>
                    <h3 className="text-sm font-bold text-gray-900 dark:text-[#c9d1d9]">Delete Product</h3>
                    <p className="text-xs text-gray-500 dark:text-[#8b949e]">This action cannot be undone</p>
                </div>
            </div>
            <p className="text-sm text-gray-700 dark:text-[#c9d1d9] mb-6">
                Are you sure you want to permanently delete <strong>"{productName}"</strong>? All associated images will also be removed.
            </p>
            <div className="flex gap-3">
                <button
                    onClick={onCancel}
                    disabled={isDeleting}
                    className="flex-1 px-4 py-2.5 text-xs font-bold uppercase tracking-widest rounded-xl border border-black/10 dark:border-[#30363d] text-gray-700 dark:text-[#c9d1d9] hover:bg-black/5 dark:hover:bg-white/5 transition-all disabled:opacity-50"
                >
                    Cancel
                </button>
                <button
                    onClick={onConfirm}
                    disabled={isDeleting}
                    className="flex-1 px-4 py-2.5 text-xs font-bold uppercase tracking-widest rounded-xl bg-red-500 text-white hover:bg-red-600 transition-all disabled:opacity-50 flex items-center justify-center gap-2"
                >
                    {isDeleting ? <Loader2 size={14} className="animate-spin" /> : <Trash2 size={14} />}
                    {isDeleting ? 'Deleting...' : 'Delete'}
                </button>
            </div>
        </div>
    </div>
);

/* ------------------------------------------------------------------ */
/*  Custom Dropdown (simplified, no framer-motion)                      */
/* ------------------------------------------------------------------ */
const CustomDropdown = ({ selected, options, onChange, label, icon: FilterIcon = Search, className = '' }) => {
    const [isOpen, setIsOpen] = useState(false);
    const selectedItem = options.find(o => o.slug === selected || o.name === selected);
    const displayName = selectedItem ? selectedItem.name : (label || 'Select Option');

    return (
        <div className={`relative ${className}`}>
            <button
                type="button"
                onClick={() => setIsOpen(!isOpen)}
                className="w-full bg-white dark:bg-[#161b22] border border-black/10 dark:border-[#30363d] rounded-xl py-3 pl-10 pr-4 text-gray-900 dark:text-[#c9d1d9] text-sm text-left focus:border-[#0d3542] dark:focus:border-[#58a6ff] outline-none transition-all cursor-pointer flex items-center justify-between"
            >
                <FilterIcon className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 dark:text-[#8b949e]" size={16} />
                <span className="truncate">{displayName}</span>
                <ChevronLeft size={14} className={`text-gray-400 transition-transform duration-200 ${isOpen ? '-rotate-90' : ''}`} />
            </button>

            {isOpen && (
                <>
                    <div className="fixed inset-0 z-[60]" onClick={() => setIsOpen(false)} />
                    <div className="absolute top-full left-0 right-0 mt-1 z-[70] bg-white dark:bg-[#161b22] border border-black/10 dark:border-[#30363d] rounded-xl overflow-hidden shadow-xl max-h-56 overflow-y-auto">
                        {options.map((opt, idx) => (
                            <button
                                key={opt.id || opt.slug || idx}
                                type="button"
                                onClick={() => { onChange(opt.slug || opt.name); setIsOpen(false); }}
                                className={`w-full text-left px-4 py-2.5 text-sm transition-colors ${
                                    idx > 0 && opt.slug === 'all' ? 'border-t border-black/5 dark:border-white/5' : ''
                                } ${
                                    selected === (opt.slug || opt.name)
                                        ? 'bg-[#0d3542] dark:bg-[#58a6ff] text-white dark:text-black font-semibold'
                                        : 'text-gray-600 dark:text-[#8b949e] hover:bg-black/5 dark:hover:bg-white/5'
                                }`}
                            >
                                {opt.name}
                            </button>
                        ))}
                    </div>
                </>
            )}
        </div>
    );
};

/* ------------------------------------------------------------------ */
/*  Product Card Row                                                   */
/* ------------------------------------------------------------------ */
const ProductRow = memo(({ product, onEdit, onDelete, onToggleVisibility, isToggling }) => {
    return (
        <div className={`group flex items-center gap-4 px-5 py-3 border-b border-black/5 dark:border-[#30363d] hover:bg-black/[0.02] dark:hover:bg-white/[0.02] transition-colors ${!product.is_visible ? 'opacity-50' : ''}`}>
            {/* Thumbnail */}
            <div className="shrink-0 w-10 h-10 rounded-lg overflow-hidden border border-black/5 dark:border-[#30363d] bg-black/5 dark:bg-white/5">
                {product.images && product.images.length > 0 ? (
                    <OptimizedImage
                        src={product.images[0]}
                        alt={product.name}
                        containerClassName="w-full h-full"
                        className="w-full h-full object-cover"
                    />
                ) : (
                    <div className="w-full h-full flex items-center justify-center text-gray-300 dark:text-[#8b949e]/30">
                        <ShoppingBag size={16} />
                    </div>
                )}
            </div>

            {/* Name + Slug */}
            <div className="flex-1 min-w-0">
                <h3 className="text-sm font-medium text-gray-900 dark:text-[#c9d1d9] truncate">{product.name}</h3>
                <p className="text-[10px] font-mono text-gray-400 dark:text-[#8b949e]/50 truncate mt-0.5">{product.slug}</p>
            </div>

            {/* Collection badge */}
            <div className="hidden sm:block shrink-0">
                <span className="text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-md bg-black/5 dark:bg-white/5 text-gray-500 dark:text-[#8b949e] border border-black/5 dark:border-[#30363d]">
                    {product.collection || 'Default'}
                </span>
            </div>

            {/* Price */}
            <div className="hidden md:block shrink-0 w-20 text-right">
                <span className="text-sm font-mono text-gray-900 dark:text-[#c9d1d9]">${product.price}</span>
            </div>

            {/* Featured */}
            <div className="hidden md:block shrink-0 w-16 text-center">
                {product.is_featured ? (
                    <Star size={14} className="mx-auto text-amber-500 fill-amber-500" />
                ) : (
                    <span className="text-gray-300 dark:text-[#8b949e]/30">—</span>
                )}
            </div>

            {/* Visibility Status */}
            <div className="shrink-0 flex items-center gap-1.5 w-20">
                <div className={`w-2 h-2 rounded-full shrink-0 ${product.is_visible ? 'bg-emerald-500' : 'bg-red-400'}`} />
                <span className="text-[10px] font-bold uppercase tracking-wider text-gray-500 dark:text-[#8b949e]">
                    {product.is_visible ? 'Live' : 'Hidden'}
                </span>
            </div>

            {/* Actions */}
            <div className="shrink-0 flex items-center gap-1 opacity-60 group-hover:opacity-100 transition-opacity">
                <button
                    onClick={() => onToggleVisibility(product.id, product.is_visible)}
                    disabled={isToggling}
                    className="p-2 rounded-lg text-gray-400 hover:bg-black/5 dark:hover:bg-white/5 hover:text-gray-900 dark:hover:text-white transition-all disabled:opacity-50"
                    title={product.is_visible ? 'Hide product' : 'Show product'}
                >
                    {isToggling ? <Loader2 size={14} className="animate-spin" /> : product.is_visible ? <Eye size={14} /> : <EyeOff size={14} />}
                </button>
                <button
                    onClick={() => onEdit(product.slug)}
                    className="p-2 rounded-lg text-gray-400 hover:bg-black/5 dark:hover:bg-white/5 hover:text-[#0d3542] dark:hover:text-[#58a6ff] transition-all"
                    title="Edit product"
                >
                    <Edit2 size={14} />
                </button>
                {product.is_visible && (
                    <a
                        href={`/product/${product.slug}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="p-2 rounded-lg text-gray-400 hover:bg-black/5 dark:hover:bg-white/5 hover:text-gray-900 dark:hover:text-white transition-all"
                        title="View on storefront"
                    >
                        <ExternalLink size={14} />
                    </a>
                )}
                <button
                    onClick={() => onDelete(product)}
                    className="p-2 rounded-lg text-gray-400 hover:bg-red-500/10 hover:text-red-500 transition-all"
                    title="Delete product"
                >
                    <Trash2 size={14} />
                </button>
            </div>
        </div>
    );
});

/* ------------------------------------------------------------------ */
/*  Main Component                                                     */
/* ------------------------------------------------------------------ */
const ProductManager = () => {
    const queryClient = useQueryClient();
    const { collections } = useAdmin();
    const navigate = useNavigate();
    const [searchInput, setSearchInput] = useState('');
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedCollection, setSelectedCollection] = useState('all');
    const [currentPage, setCurrentPage] = useState(1);
    const [deletingProduct, setDeletingProduct] = useState(null);
    const [isDeleting, setIsDeleting] = useState(false);
    const [togglingId, setTogglingId] = useState(null);
    const ITEMS_PER_PAGE = 30;

    /* ---- Data Fetch ---- */
    const { data: allProducts = [], isLoading: loading } = useQuery({
        queryKey: ['admin-products'],
        queryFn: async () => {
            const { data } = await axios.get('/api/v1/products', {
                params: { per_page: 1000, include_hidden: true }
            });
            return data.data;
        },
        staleTime: 2 * 60 * 1000,
    });

    /* ---- Debounced Search ---- */
    useEffect(() => {
        const timer = setTimeout(() => setSearchTerm(searchInput), 300);
        return () => clearTimeout(timer);
    }, [searchInput]);

    useEffect(() => { setCurrentPage(1); }, [searchTerm, selectedCollection]);

    /* ---- Filtering ---- */
    const filteredProducts = useMemo(() => {
        const term = searchTerm.toLowerCase();
        return allProducts.filter(product => {
            const matchesSearch = !term || product.name.toLowerCase().includes(term) || product.slug.toLowerCase().includes(term);
            const matchesCollection = selectedCollection === 'all' || product.collection_slug === selectedCollection;
            return matchesSearch && matchesCollection;
        });
    }, [allProducts, searchTerm, selectedCollection]);

    /* ---- Pagination ---- */
    const totalPages = Math.max(1, Math.ceil(filteredProducts.length / ITEMS_PER_PAGE));
    const visibleProducts = useMemo(() => {
        const start = (currentPage - 1) * ITEMS_PER_PAGE;
        return filteredProducts.slice(start, start + ITEMS_PER_PAGE);
    }, [filteredProducts, currentPage]);

    const pageRange = useMemo(() => {
        const range = [];
        const maxVisible = 5;
        let start = Math.max(1, currentPage - Math.floor(maxVisible / 2));
        let end = Math.min(totalPages, start + maxVisible - 1);
        if (end - start + 1 < maxVisible) start = Math.max(1, end - maxVisible + 1);
        for (let i = start; i <= end; i++) range.push(i);
        return range;
    }, [currentPage, totalPages]);

    /* ---- Handlers ---- */
    const handleEdit = useCallback((slug) => {
        navigate(`/admin/products/${slug}/edit`);
    }, [navigate]);

    const toggleVisibility = useCallback(async (productId, currentVisibility) => {
        const nextStatus = !currentVisibility;
        setTogglingId(productId);

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
            queryClient.invalidateQueries(['admin-products']);
            alert('Failed to update product visibility.');
        } finally {
            setTogglingId(null);
        }
    }, [queryClient]);

    const handleDeleteProduct = useCallback(async () => {
        if (!deletingProduct) return;
        setIsDeleting(true);
        try {
            const token = localStorage.getItem('admin_token') || sessionStorage.getItem('admin_token');
            const response = await axios.delete(`/api/v1/admin/products/${deletingProduct.id}`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (response.data.success) {
                queryClient.invalidateQueries(['admin-products']);
            } else {
                throw new Error(response.data.message || 'Unknown error');
            }
        } catch (error) {
            console.error('Deletion failed!', error);
            alert('Failed to delete product: ' + (error.response?.data?.message || error.message));
        } finally {
            setIsDeleting(false);
            setDeletingProduct(null);
        }
    }, [deletingProduct, queryClient]);

    /* ---- Render ---- */
    return (
        <div className="space-y-6 pb-20">
            {/* Delete Modal */}
            {deletingProduct && (
                <DeleteModal
                    productName={deletingProduct.name}
                    onConfirm={handleDeleteProduct}
                    onCancel={() => { setDeletingProduct(null); setIsDeleting(false); }}
                    isDeleting={isDeleting}
                />
            )}

            {/* Header */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                    <h1 className="text-2xl font-serif text-gray-900 dark:text-[#c9d1d9]">Product Library</h1>
                    <p className="text-xs text-gray-500 dark:text-[#8b949e] mt-1">{filteredProducts.length} product{filteredProducts.length !== 1 ? 's' : ''} total</p>
                </div>
                <div className="flex gap-2">
                    <button
                        onClick={() => navigate('/admin/collections')}
                        className="flex items-center gap-2 px-4 py-2 text-xs font-bold uppercase tracking-widest rounded-lg border border-black/10 dark:border-[#30363d] text-gray-700 dark:text-[#c9d1d9] hover:bg-black/5 dark:hover:bg-white/5 transition-all"
                    >
                        <FolderPlus size={14} /> Collections
                    </button>
                    <button
                        onClick={() => navigate('/admin/products/bulk')}
                        className="flex items-center gap-2 px-4 py-2 text-xs font-bold uppercase tracking-widest rounded-lg border border-black/10 dark:border-[#30363d] text-gray-700 dark:text-[#c9d1d9] hover:bg-black/5 dark:hover:bg-white/5 transition-all"
                    >
                        <Plus size={14} /> Bulk Upload
                    </button>
                    <button
                        onClick={() => navigate('/admin/products/new')}
                        className="flex items-center gap-2 px-4 py-2 text-xs font-bold uppercase tracking-widest rounded-lg bg-[#0d3542] dark:bg-[#58a6ff] text-white dark:text-black hover:bg-black dark:hover:bg-white transition-all"
                    >
                        <Plus size={14} /> New Product
                    </button>
                </div>
            </div>

            {/* Filters */}
            <div className="flex flex-col sm:flex-row gap-3">
                <div className="relative flex-grow">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 dark:text-[#8b949e]" size={16} />
                    <input
                        type="text"
                        placeholder="Search by name or slug..."
                        value={searchInput}
                        onChange={(e) => setSearchInput(e.target.value)}
                        className="w-full bg-white dark:bg-[#161b22] border border-black/10 dark:border-[#30363d] rounded-xl py-2.5 pl-10 pr-4 text-sm text-gray-900 dark:text-[#c9d1d9] focus:border-[#0d3542] dark:focus:border-[#58a6ff] outline-none transition-all"
                    />
                </div>
                <CustomDropdown
                    selected={selectedCollection}
                    options={[{ name: 'All Collections', slug: 'all' }, ...collections]}
                    onChange={setSelectedCollection}
                    className="sm:w-56"
                    icon={Search}
                />
            </div>

            {/* Loading State */}
            {loading && allProducts.length === 0 ? (
                <div className="py-32 flex flex-col items-center justify-center gap-3">
                    <LumaSpin size="lg" />
                    <p className="text-[10px] font-bold uppercase tracking-[0.3em] text-gray-400 dark:text-[#8b949e]/50">Loading products...</p>
                </div>
            ) : (
                <>
                    {/* Table Header */}
                    <div className="hidden md:flex items-center gap-4 px-5 py-2.5 text-[10px] font-bold uppercase tracking-widest text-gray-400 dark:text-[#8b949e] border-b border-black/5 dark:border-[#30363d]">
                        <div className="w-10" />
                        <div className="flex-1">Product</div>
                        <div className="hidden sm:block w-24">Collection</div>
                        <div className="w-20 text-right">Price</div>
                        <div className="w-16 text-center">Featured</div>
                        <div className="w-20">Status</div>
                        <div className="w-28 text-right">Actions</div>
                    </div>

                    {/* Product List */}
                    <div className="border border-black/5 dark:border-[#30363d] rounded-2xl overflow-hidden bg-white dark:bg-[#161b22]">
                        {visibleProducts.length > 0 ? (
                            visibleProducts.map(product => (
                                <ProductRow
                                    key={product.id}
                                    product={product}
                                    onEdit={handleEdit}
                                    onDelete={setDeletingProduct}
                                    onToggleVisibility={toggleVisibility}
                                    isToggling={togglingId === product.id}
                                />
                            ))
                        ) : (
                            <div className="py-16 text-center">
                                <ShoppingBag className="mx-auto text-gray-300 dark:text-[#8b949e]/20 mb-3" size={36} />
                                <p className="text-xs font-bold uppercase tracking-widest text-gray-400 dark:text-[#8b949e]/50">
                                    {searchTerm || selectedCollection !== 'all' ? 'No products match your filters' : 'No products yet — create your first one'}
                                </p>
                            </div>
                        )}
                    </div>

                    {/* Pagination */}
                    {totalPages > 1 && (
                        <div className="flex items-center justify-between">
                            <p className="text-[10px] font-bold uppercase tracking-widest text-gray-400 dark:text-[#8b949e]/50 tabular-nums">
                                {((currentPage - 1) * ITEMS_PER_PAGE) + 1}–{Math.min(currentPage * ITEMS_PER_PAGE, filteredProducts.length)} of {filteredProducts.length}
                            </p>
                            <div className="flex items-center gap-1">
                                <button
                                    onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                                    disabled={currentPage === 1}
                                    className="p-1.5 rounded-lg text-gray-400 dark:text-[#8b949e] hover:bg-black/5 dark:hover:bg-white/5 hover:text-gray-900 dark:hover:text-white disabled:opacity-30 disabled:pointer-events-none transition-all"
                                >
                                    <ChevronLeft size={14} />
                                </button>
                                {pageRange[0] > 1 && (
                                    <>
                                        <button onClick={() => setCurrentPage(1)} className="w-7 h-7 rounded-lg text-[10px] font-bold text-gray-500 dark:text-[#8b949e] hover:bg-black/5 dark:hover:bg-white/5 transition-all">1</button>
                                        {pageRange[0] > 2 && <span className="text-[10px] text-gray-300 dark:text-[#8b949e]/30 px-0.5">…</span>}
                                    </>
                                )}
                                {pageRange.map(p => (
                                    <button
                                        key={p}
                                        onClick={() => setCurrentPage(p)}
                                        className={`w-7 h-7 rounded-lg text-[10px] font-bold transition-all ${
                                            p === currentPage
                                                ? 'bg-[#0d3542] dark:bg-[#58a6ff] text-white dark:text-black'
                                                : 'text-gray-500 dark:text-[#8b949e] hover:bg-black/5 dark:hover:bg-white/5'
                                        }`}
                                    >
                                        {p}
                                    </button>
                                ))}
                                {pageRange[pageRange.length - 1] < totalPages && (
                                    <>
                                        {pageRange[pageRange.length - 1] < totalPages - 1 && <span className="text-[10px] text-gray-300 dark:text-[#8b949e]/30 px-0.5">…</span>}
                                        <button onClick={() => setCurrentPage(totalPages)} className="w-7 h-7 rounded-lg text-[10px] font-bold text-gray-500 dark:text-[#8b949e] hover:bg-black/5 dark:hover:bg-white/5 transition-all">{totalPages}</button>
                                    </>
                                )}
                                <button
                                    onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                                    disabled={currentPage === totalPages}
                                    className="p-1.5 rounded-lg text-gray-400 dark:text-[#8b949e] hover:bg-black/5 dark:hover:bg-white/5 hover:text-gray-900 dark:hover:text-white disabled:opacity-30 disabled:pointer-events-none transition-all"
                                >
                                    <ChevronRight size={14} />
                                </button>
                            </div>
                        </div>
                    )}
                </>
            )}
        </div>
    );
};

export default ProductManager;
