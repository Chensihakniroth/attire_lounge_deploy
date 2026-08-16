import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { User, Mail, Phone, Gift, CheckCircle, XCircle, Trash2, ChevronDown, Loader2, Plus, X, Search } from 'lucide-react';
import { LumaSpin } from '@/components/ui/luma-spin';
import { useAdmin } from './AdminContext';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import axios from 'axios';
import OptimizedImage from '../../common/OptimizedImage.jsx';
import { motion, AnimatePresence } from 'framer-motion';
import { useToast } from '@/components/ui/toast';

/* ------------------------------------------------------------------ */
/*  Product Picker Modal                                               */
/* ------------------------------------------------------------------ */
const ProductPickerModal = ({ isOpen, onClose, onSelect, existingIds }) => {
    const [search, setSearch] = useState('');
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(false);

    const fetchProducts = useCallback(async () => {
        setLoading(true);
        try {
            const { data } = await axios.get('/api/v1/products', {
                params: { per_page: 100, include_hidden: true, search }
            });
            setProducts(data.data || []);
        } catch { /* ignore */ }
        finally { setLoading(false); }
    }, [search]);

    useEffect(() => {
        if (isOpen) fetchProducts();
    }, [isOpen, fetchProducts]);

    const filtered = useMemo(() => {
        if (!existingIds?.length) return products;
        return products.filter(p => !existingIds.includes(p.id));
    }, [products, existingIds]);

    return (
        <div className="fixed inset-0 z-[110] flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onClose} />
            <div className="relative bg-white dark:bg-[#161b22] border border-black/10 dark:border-[#30363d] rounded-2xl p-5 max-w-lg w-full shadow-2xl max-h-[80vh] flex flex-col">
                <div className="flex items-center justify-between mb-4">
                    <h3 className="text-sm font-bold text-gray-900 dark:text-[#c9d1d9]">Add Product</h3>
                    <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-black/5 dark:hover:bg-white/5 text-gray-400">
                        <X size={16} />
                    </button>
                </div>
                <div className="relative mb-3">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={14} />
                    <input
                        type="text"
                        placeholder="Search products..."
                        value={search}
                        onChange={e => setSearch(e.target.value)}
                        className="w-full h-9 bg-black/[0.02] dark:bg-white/[0.02] border border-black/[0.06] dark:border-white/[0.06] rounded-lg pl-9 pr-3 text-[12px] text-gray-900 dark:text-[#c9d1d9] outline-none focus:border-[#0d3542]/40 dark:focus:border-[#58a6ff]/40"
                    />
                </div>
                <div className="flex-1 overflow-y-auto space-y-1.5 min-h-0">
                    {loading ? (
                        <div className="py-8 flex justify-center"><LumaSpin size="md" /></div>
                    ) : filtered.length === 0 ? (
                        <p className="text-[10px] text-gray-400 text-center py-8 uppercase tracking-widest">No products available</p>
                    ) : (
                        filtered.map(product => (
                            <button
                                key={product.id}
                                onClick={() => onSelect(product)}
                                className="w-full flex items-center gap-3 p-2.5 rounded-lg hover:bg-black/[0.03] dark:hover:bg-white/[0.03] transition-colors text-left"
                            >
                                <div className="w-10 h-10 rounded-lg overflow-hidden border border-black/5 dark:border-[#30363d] shrink-0 bg-black/5 dark:bg-white/5">
                                    {product.images?.[0] ? (
                                        <OptimizedImage src={product.images[0]} alt={product.name} containerClassName="w-full h-full" className="w-full h-full object-cover" />
                                    ) : (
                                        <div className="w-full h-full flex items-center justify-center text-gray-300 dark:text-[#8b949e]/30">
                                            <Gift size={14} />
                                        </div>
                                    )}
                                </div>
                                <div className="flex-1 min-w-0">
                                    <p className="text-[12px] font-medium text-gray-900 dark:text-[#c9d1d9] truncate">{product.name}</p>
                                    <p className="text-[10px] text-gray-400 font-mono">${product.price}</p>
                                </div>
                                <Plus size={14} className="text-gray-400 shrink-0" />
                            </button>
                        ))
                    )}
                </div>
            </div>
        </div>
    );
};

/* ------------------------------------------------------------------ */
/*  Gift Request Card                                                  */
/* ------------------------------------------------------------------ */
const GiftRequestCard = React.forwardRef(({ request, onUpdate, onDelete, onRefresh }, ref) => {
    const [isUpdating, setIsUpdating] = useState(false);
    const [showPicker, setShowPicker] = useState(false);
    const { toast } = useToast();

    const handleUpdate = async (status) => {
        setIsUpdating(true);
        await onUpdate(request.id, status);
        setIsUpdating(false);
    };

    const handleAddItem = async (product) => {
        try {
            await axios.post(`/api/v1/admin/gift-requests/${request.id}/items`, { product_id: product.id });
            onRefresh();
            setShowPicker(false);
            toast.success('Item added');
        } catch (err) {
            toast.error(err.response?.data?.message || 'Failed to add item.');
        }
    };

    const handleRemoveItem = async (productId) => {
        try {
            await axios.delete(`/api/v1/admin/gift-requests/${request.id}/items`, { data: { product_id: productId } });
            onRefresh();
            toast.success('Item removed');
        } catch (err) {
            toast.error('Failed to remove item.');
        }
    };

    const statusConfig = {
        Pending: { color: 'text-amber-600 dark:text-amber-400', bg: 'bg-amber-400/10', border: 'border-amber-400/20' },
        Completed: { color: 'text-emerald-600 dark:text-emerald-400', bg: 'bg-emerald-400/10', border: 'border-emerald-400/20' },
        Cancelled: { color: 'text-rose-600 dark:text-rose-400', bg: 'bg-rose-400/10', border: 'border-rose-400/20' },
    };

    const status = statusConfig[request.status] || statusConfig.Pending;
    const selectedItems = request.selected_items || [];

    return (
        <>
            <div
                ref={ref}
                className="group p-5 rounded-xl bg-white dark:bg-[#161b22] border border-black/[0.06] dark:border-[#30363d] transition-all hover:border-[#0d3542]/15 dark:hover:border-[#58a6ff]/15"
            >
                {/* Header */}
                <div className="flex justify-between items-start pb-3 mb-4 border-b border-black/[0.04] dark:border-white/[0.04]">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-lg bg-black/[0.03] dark:bg-white/[0.03] flex items-center justify-center border border-black/[0.04] dark:border-white/[0.04]">
                            <Gift size={16} className="text-gray-400 dark:text-[#8b949e]/40" />
                        </div>
                        <div>
                            <h3 className="text-[14px] font-bold text-gray-900 dark:text-[#c9d1d9]">
                                {request.recipient_title}. {request.recipient_name}
                            </h3>
                            <p className="text-[10px] text-gray-400 dark:text-[#8b949e]/50 mt-0.5">
                                {new Date(request.created_at).toLocaleDateString()}
                            </p>
                        </div>
                    </div>
                    <span className={`px-2 py-1 text-[9px] font-bold uppercase tracking-widest rounded-md border ${status.color} ${status.bg} ${status.border}`}>
                        {request.status}
                    </span>
                </div>

                {/* Sender & Recipient */}
                <div className="grid grid-cols-2 gap-3 mb-4">
                    <div className="bg-black/[0.02] dark:bg-white/[0.02] p-3 rounded-lg border border-black/[0.04] dark:border-white/[0.04]">
                        <p className="text-[9px] font-bold text-gray-400 dark:text-[#8b949e]/40 uppercase tracking-widest mb-1.5">Sender</p>
                        <p className="text-[12px] font-bold text-gray-900 dark:text-[#c9d1d9]">{request.name}</p>
                        <p className="text-[10px] text-gray-500 dark:text-[#8b949e] mt-0.5">{request.phone}</p>
                    </div>
                    <div className="bg-black/[0.02] dark:bg-white/[0.02] p-3 rounded-lg border border-black/[0.04] dark:border-white/[0.04]">
                        <p className="text-[9px] font-bold text-gray-400 dark:text-[#8b949e]/40 uppercase tracking-widest mb-1.5">Recipient</p>
                        <p className="text-[12px] font-bold text-gray-900 dark:text-[#c9d1d9]">{request.recipient_title}. {request.recipient_name}</p>
                        {request.recipient_phone && <p className="text-[10px] text-gray-500 dark:text-[#8b949e] mt-0.5">{request.recipient_phone}</p>}
                    </div>
                </div>

                {/* Selected Items */}
                <div className="mb-4">
                    <div className="flex items-center justify-between mb-2">
                        <p className="text-[9px] font-bold text-gray-400 dark:text-[#8b949e]/40 uppercase tracking-widest">
                            Selected Items ({selectedItems.length})
                        </p>
                        <button
                            onClick={() => setShowPicker(true)}
                            className="h-7 px-3 text-[9px] font-bold uppercase tracking-widest text-white dark:text-black bg-[#0d3542] dark:bg-[#58a6ff] rounded-lg hover:opacity-90 transition-all flex items-center gap-1.5 active:scale-95"
                        >
                            <Plus size={11} /> Add Product
                        </button>
                    </div>
                    {selectedItems.length > 0 ? (
                        <div className="flex gap-2 overflow-x-auto pb-2 no-scrollbar">
                            {selectedItems.map((item, index) => (
                                <div key={index} className="flex-shrink-0 text-center relative group/item">
                                    <div className="w-14 h-14 rounded-lg overflow-hidden border border-black/[0.06] dark:border-[#30363d] mx-auto">
                                        {item.image ? (
                                            <OptimizedImage src={item.image} alt={item.name} containerClassName="w-full h-full" className="w-full h-full object-cover" />
                                        ) : (
                                            <div className="w-full h-full flex items-center justify-center bg-black/[0.02] dark:bg-white/[0.02] text-gray-300 dark:text-[#8b949e]/20">
                                                <Gift size={12} />
                                            </div>
                                        )}
                                    </div>
                                    <p className="text-[9px] mt-1.5 text-gray-500 dark:text-[#8b949e] truncate max-w-[60px]">{item.name}</p>
                                    <button
                                        onClick={() => handleRemoveItem(item.id)}
                                        className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-red-500 text-white flex items-center justify-center opacity-0 group-hover/item:opacity-100 transition-opacity"
                                    >
                                        <X size={8} />
                                    </button>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <button
                            onClick={() => setShowPicker(true)}
                            className="w-full py-3 border border-dashed border-black/[0.08] dark:border-white/[0.08] rounded-lg text-[10px] font-bold text-gray-400 dark:text-[#8b949e]/30 hover:border-[#0d3542]/30 dark:hover:border-[#58a6ff]/30 hover:text-[#0d3542] dark:hover:text-[#58a6ff] transition-all flex items-center justify-center gap-1.5 uppercase tracking-widest"
                        >
                            <Plus size={12} /> Add Product
                        </button>
                    )}
                </div>

                {/* Preferences */}
                {request.preferences && (
                    <div className="mb-4 p-3 bg-black/[0.02] dark:bg-white/[0.02] rounded-lg border border-black/[0.04] dark:border-white/[0.04]">
                        <p className="text-[9px] font-bold text-gray-400 dark:text-[#8b949e]/40 uppercase tracking-widest mb-1">Notes</p>
                        <p className="text-[11px] text-gray-600 dark:text-[#8b949e] leading-relaxed">{request.preferences}</p>
                    </div>
                )}

                {/* Actions */}
                <div className="flex justify-end gap-2 pt-4 border-t border-black/[0.04] dark:border-white/[0.04]">
                    {request.status === 'Pending' && (
                        <>
                            <button
                                onClick={() => handleUpdate('Completed')}
                                disabled={isUpdating}
                                className="h-8 px-3 text-[9px] font-bold uppercase tracking-widest text-emerald-600 dark:text-emerald-400 bg-emerald-400/10 border border-emerald-400/20 rounded-lg hover:bg-emerald-400/20 transition-all flex items-center gap-1.5 disabled:opacity-50"
                            >
                                {isUpdating ? <Loader2 className="animate-spin" size={12} /> : <CheckCircle size={12} />}
                                Complete
                            </button>
                            <button
                                onClick={() => handleUpdate('Cancelled')}
                                disabled={isUpdating}
                                className="h-8 px-3 text-[9px] font-bold uppercase tracking-widest text-rose-600 dark:text-rose-400 bg-rose-400/10 border border-rose-400/20 rounded-lg hover:bg-rose-400/20 transition-all flex items-center gap-1.5 disabled:opacity-50"
                            >
                                {isUpdating ? <Loader2 className="animate-spin" size={12} /> : <XCircle size={12} />}
                                Cancel
                            </button>
                        </>
                    )}
                    <button
                        onClick={() => onDelete(request.id)}
                        className="h-8 px-2 text-gray-400 dark:text-[#8b949e] hover:text-rose-500 hover:bg-rose-500/5 rounded-lg transition-all flex items-center"
                        title="Delete"
                    >
                        <Trash2 size={13} />
                    </button>
                </div>
            </div>

            {/* Product Picker */}
            <ProductPickerModal
                isOpen={showPicker}
                onClose={() => setShowPicker(false)}
                onSelect={handleAddItem}
                existingIds={selectedItems.map(i => i.id)}
            />
        </>
    );
});

/* ------------------------------------------------------------------ */
/*  Loading                                                            */
/* ------------------------------------------------------------------ */
const LoadingState = () => (
    <div className="py-24 flex flex-col items-center justify-center gap-3">
        <LumaSpin size="lg" />
        <p className="text-[10px] font-bold uppercase tracking-[0.3em] text-gray-400 dark:text-[#8b949e]/40">
            Loading gift requests…
        </p>
    </div>
);

/* ------------------------------------------------------------------ */
/*  Main Component                                                      */
/* ------------------------------------------------------------------ */
const CustomizeGiftManager = () => {
    const [giftPage, setGiftPage] = useState(1);
    const queryClient = useQueryClient();

    const { data: giftRequestsData, isLoading: giftRequestsLoading } = useQuery({
        queryKey: ['admin-gift-requests', giftPage],
        queryFn: async () => {
            const { data } = await axios.get(`/api/v1/gift-requests?page=${giftPage}`);
            return data;
        },
        staleTime: 60 * 1000,
    });

    const giftRequests = giftRequestsData?.data || (Array.isArray(giftRequestsData) ? giftRequestsData : []);
    const giftRequestsPagination = {
        currentPage: giftRequestsData?.current_page || 1,
        lastPage: giftRequestsData?.last_page || 1,
        total: giftRequestsData?.total || 0
    };

    const updateGiftRequestStatus = async (id, status) => {
        try {
            await axios.patch(`/api/v1/admin/gift-requests/${id}/status`, { status });
            queryClient.invalidateQueries({ queryKey: ['admin-gift-requests'] });
            queryClient.invalidateQueries({ queryKey: ['admin-stats'] });
        } catch (err) {
            console.error('Failed to update gift status:', err);
            throw err;
        }
    };

    const deleteGiftRequest = async (id) => {
        try {
            await axios.delete(`/api/v1/admin/gift-requests/${id}`);
            queryClient.invalidateQueries({ queryKey: ['admin-gift-requests'] });
            queryClient.invalidateQueries({ queryKey: ['admin-stats'] });
        } catch (err) {
            console.error('Failed to delete gift request:', err);
            throw err;
        }
    };

    const refreshRequests = () => {
        queryClient.invalidateQueries({ queryKey: ['admin-gift-requests'] });
    };

    const [visibleCount, setVisibleRows] = useState(6);

    const visibleRequests = useMemo(() => {
        return (giftRequests || []).slice(0, visibleCount);
    }, [giftRequests, visibleCount]);

    const hasMore = visibleCount < giftRequests.length || giftRequestsPagination.currentPage < giftRequestsPagination.lastPage;

    const handleLoadMore = async () => {
        if (visibleCount < giftRequests.length) {
            setVisibleRows(v => v + 6);
        } else {
            if (giftRequestsPagination.currentPage < giftRequestsPagination.lastPage) {
                setGiftPage(prev => prev + 1);
                setVisibleRows(v => v + 6);
            }
        }
    };

    return (
        <div className="space-y-6 pb-16 max-w-[1100px] mx-auto px-4 sm:px-6 mt-4">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
                <div>
                    <h1 className="text-2xl sm:text-3xl font-serif text-gray-900 dark:text-[#c9d1d9] tracking-tight">
                        Gift Management
                    </h1>
                    <p className="text-[10px] text-gray-400 dark:text-[#8b949e]/50 font-bold uppercase tracking-[0.3em] mt-1">
                        {giftRequestsPagination.total} total requests
                    </p>
                </div>
            </div>

            {/* Content */}
            {giftRequestsLoading && giftRequests.length === 0 ? (
                <LoadingState />
            ) : giftRequests.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-20 bg-white dark:bg-[#161b22] rounded-xl border border-black/[0.06] dark:border-[#30363d]">
                    <Gift size={32} className="text-gray-300 dark:text-[#8b949e]/30 mb-3" />
                    <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-gray-400 dark:text-[#8b949e]/40">No gift requests found</p>
                </div>
            ) : (
                <div className="space-y-6">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                        {visibleRequests.map(request => (
                            <GiftRequestCard
                                key={request.id}
                                request={request}
                                onUpdate={updateGiftRequestStatus}
                                onDelete={deleteGiftRequest}
                                onRefresh={refreshRequests}
                            />
                        ))}
                    </div>

                    {hasMore && (
                        <div className="flex justify-center pt-4">
                            <button
                                onClick={handleLoadMore}
                                className="flex items-center gap-2 px-6 py-3 bg-white dark:bg-[#161b22] border border-black/[0.06] dark:border-[#30363d] rounded-lg hover:bg-black/[0.02] dark:hover:bg-white/[0.02] transition-all"
                            >
                                <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-gray-500 dark:text-[#8b949e]">Load More</span>
                                <ChevronDown size={14} className="text-[#0d3542] dark:text-[#58a6ff]" />
                            </button>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};

export default CustomizeGiftManager;
