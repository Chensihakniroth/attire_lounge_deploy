import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { User, Mail, Phone, Gift, Loader, CheckCircle, XCircle, Trash2, ChevronDown } from 'lucide-react';
import { useAdmin } from './AdminContext';
import OptimizedImage from '../../common/OptimizedImage.jsx';
import Skeleton from '../../common/Skeleton.jsx';
import { motion, AnimatePresence } from 'framer-motion';

const GiftRequestCard = ({ request, onUpdate, onDelete }) => {
    const [isUpdating, setIsUpdating] = useState(false);

    const handleUpdate = async (status) => {
        setIsUpdating(true);
        await onUpdate(request.id, status);
        setIsUpdating(false);
    };

    const statusConfig = {
        Pending: { label: 'Pending', color: 'text-yellow-600 dark:text-yellow-400', bg: 'bg-yellow-400/10', border: 'border-yellow-400/20' },
        Completed: { label: 'Completed', color: 'text-green-600 dark:text-green-400', bg: 'bg-green-400/10', border: 'border-green-400/20' },
        Cancelled: { label: 'Cancelled', color: 'text-red-600 dark:text-red-400', bg: 'bg-red-400/10', border: 'border-red-400/20' },
    };
    
    const status = statusConfig[request.status] || statusConfig.Pending;

    return (
        <motion.div 
            layout="position"
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            className="group p-6 rounded-3xl backdrop-blur-xl bg-white dark:bg-black/20 border border-black/5 dark:border-white/10 shadow-lg dark:shadow-none transition-all duration-300 hover:bg-gray-50 dark:hover:bg-black/30 hover:border-black/10 dark:hover:border-attire-accent/30"
        >
            <div className="flex justify-between items-start pb-4 mb-6 border-b border-black/5 dark:border-white/5">
                <div className="flex items-center gap-4">
                     <div className="h-12 w-12 rounded-full bg-black/5 dark:bg-white/5 flex items-center justify-center border border-black/5 dark:border-white/5 group-hover:border-attire-accent/30 transition-colors">
                        <Gift className="w-5 h-5 text-gray-400 dark:text-attire-silver group-hover:text-attire-accent transition-colors" />
                    </div>
                    <div>
                        <h3 className="text-lg font-serif text-gray-900 dark:text-white">Gift for {request.recipient_title}. {request.recipient_name}</h3>
                        <p className="text-xs text-gray-500 dark:text-attire-silver/60 mt-1">Requested on {new Date(request.created_at).toLocaleDateString()}</p>
                    </div>
                </div>
                 <span className={`px-3 py-1 text-[10px] font-bold uppercase tracking-wider rounded-full border ${status.color} ${status.bg} ${status.border}`}>
                    {request.status}
                </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                {/* Sender Info */}
                <div className="bg-black/5 dark:bg-white/5 p-4 rounded-2xl border border-black/5 dark:border-white/5">
                    <h4 className="font-semibold text-sm text-gray-500 dark:text-attire-silver/80 mb-3 uppercase tracking-widest">Sender</h4>
                    <div className="space-y-2 text-sm">
                        <p><strong className="font-semibold text-gray-700 dark:text-white">{request.name}</strong> {request.sender_age && `(Age: ${request.sender_age})`}</p>
                        {request.email && <p className="text-gray-600 dark:text-attire-silver">{request.email}</p>}
                        <p className="text-gray-600 dark:text-attire-silver">{request.phone}</p>
                    </div>
                </div>
                {/* Recipient Info */}
                <div className="bg-black/5 dark:bg-white/5 p-4 rounded-2xl border border-black/5 dark:border-white/5">
                    <h4 className="font-semibold text-sm text-gray-500 dark:text-attire-silver/80 mb-3 uppercase tracking-widest">Recipient</h4>
                    <div className="space-y-2 text-sm">
                        <p><strong className="font-semibold text-gray-700 dark:text-white">{request.recipient_title}. {request.recipient_name}</strong></p>
                        {request.recipient_email && <p className="text-gray-600 dark:text-attire-silver">{request.recipient_email}</p>}
                        {request.recipient_phone && <p className="text-gray-600 dark:text-attire-silver">{request.recipient_phone}</p>}
                    </div>
                </div>
            </div>

            {request.selected_items && request.selected_items.length > 0 && (
                <div className="mb-4">
                    <h4 className="font-semibold text-sm text-gray-500 dark:text-attire-silver/80 mb-3 uppercase tracking-widest">Selected Items</h4>
                    <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-hide">
                        {request.selected_items.map((item, index) => (
                            <div key={index} className="flex-shrink-0 text-center">
                                <div className="h-20 w-20 rounded-xl overflow-hidden border border-black/5 dark:border-white/10 mx-auto">
                                    <OptimizedImage src={item.image} alt={item.name} className="w-full h-full object-cover" />
                                </div>
                                <p className="text-xs mt-2 text-gray-600 dark:text-attire-silver/80">{item.name}</p>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {request.preferences && (
                 <div className="mt-4 p-4 bg-black/5 dark:bg-white/5 rounded-2xl border border-black/5 dark:border-white/5">
                    <h4 className="font-semibold text-sm text-gray-500 dark:text-attire-silver/80 mb-2 uppercase tracking-widest">Preferences & Note</h4>
                    <pre className="whitespace-pre-wrap font-sans text-sm text-gray-700 dark:text-attire-cream/90 leading-relaxed">{request.preferences}</pre>
                </div>
            )}


            <div className="mt-6 flex justify-end gap-3 border-t border-black/5 dark:border-white/5 pt-6">
                {request.status === 'Pending' ? (
                    <>
                        <button onClick={() => handleUpdate('Completed')} disabled={isUpdating} className="px-4 py-2 text-xs font-bold uppercase tracking-widest text-green-600 dark:text-green-400 bg-green-400/10 border border-green-400/20 rounded-xl hover:bg-green-400/20 transition-all flex items-center gap-2" title="Mark as Completed">
                            <CheckCircle size={14} /> Complete
                        </button>
                        <button onClick={() => handleUpdate('Cancelled')} disabled={isUpdating} className="px-4 py-2 text-xs font-bold uppercase tracking-widest text-red-600 dark:text-red-400 bg-red-400/10 border border-red-400/20 rounded-xl hover:bg-red-400/20 transition-all flex items-center gap-2" title="Mark as Cancelled">
                            <XCircle size={14} /> Cancel
                        </button>
                    </>
                ) : (
                    <button onClick={() => onDelete(request.id)} disabled={isUpdating} className="px-4 py-2 text-xs font-bold uppercase tracking-widest text-gray-400 dark:text-attire-silver hover:text-red-600 dark:hover:text-red-400 bg-black/5 dark:bg-white/5 border border-black/5 dark:border-white/10 rounded-xl transition-all" title="Delete record">
                        <Trash2 size={14} />
                    </button>
                )}
            </div>
        </motion.div>
    );
};

const GiftSkeleton = () => (
    <div className="p-6 rounded-3xl bg-white dark:bg-white/5 border border-black/5 dark:border-white/5 shadow-lg dark:shadow-none space-y-6">
        <div className="flex items-center justify-between border-b border-black/5 dark:border-white/5 pb-4">
            <div className="flex items-center gap-4">
                <Skeleton className="h-12 w-12 rounded-full" />
                <div className="space-y-2">
                    <Skeleton className="h-5 w-24" />
                    <Skeleton className="h-3 w-32" />
                </div>
            </div>
            <Skeleton className="h-6 w-20 rounded-full" />
        </div>
        <Skeleton className="h-24 w-full rounded-2xl" />
        <div className="flex justify-end gap-3 pt-2">
            <Skeleton className="h-10 w-24 rounded-xl" />
            <Skeleton className="h-10 w-24 rounded-xl" />
        </div>
    </div>
);

const CustomizeGiftManager = () => {
    const { 
        giftRequests, 
        giftRequestsLoading, 
        fetchGiftRequests, 
        loadMoreGiftRequests,
        giftRequestsPagination,
        updateGiftRequestStatus, 
        deleteGiftRequest 
    } = useAdmin();

    const [visibleCount, setVisibleRows] = useState(6);

    useEffect(() => {
        fetchGiftRequests(1);
        const intervalId = setInterval(() => fetchGiftRequests(1, false), 60000); 
        return () => clearInterval(intervalId);
    }, [fetchGiftRequests]);

    const visibleRequests = useMemo(() => {
        return (giftRequests || []).slice(0, visibleCount);
    }, [giftRequests, visibleCount]);

    const hasMore = visibleCount < giftRequests.length || giftRequestsPagination.currentPage < giftRequestsPagination.lastPage;

    const handleLoadMore = async () => {
        if (visibleCount < giftRequests.length) {
            setVisibleRows(v => v + 6);
        } else {
            await loadMoreGiftRequests();
            setVisibleRows(v => v + 6);
        }
    };

    return (
        <div className="space-y-8 pb-20">
            <div className="flex justify-between items-end pb-4 border-b border-black/5 dark:border-white/10">
                <div>
                    <h1 className="text-4xl font-serif text-gray-900 dark:text-white mb-2">Gift Management</h1>
                    <p className="text-gray-500 dark:text-attire-silver text-sm uppercase tracking-widest">Custom gift box inquiries</p>
                </div>
            </div>

            {giftRequestsLoading && giftRequests.length === 0 ? (
                 <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {[...Array(4)].map((_, i) => <Skeleton key={i} className="h-64 w-full rounded-3xl" />)}
                </div>
            ) : giftRequests.length === 0 ? (
                <div className="text-center py-20 bg-black/5 dark:bg-black/20 rounded-3xl border border-black/5 dark:border-white/5">
                    <Gift className="mx-auto text-gray-300 dark:text-attire-silver/20 mb-4" size={48} />
                    <p className="text-gray-500 dark:text-attire-silver/60 uppercase tracking-widest text-xs">No gift requests found.</p>
                </div>
            ) : (
                <div className="space-y-8">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        <AnimatePresence mode="popLayout">
                            {visibleRequests.map(request => (
                                <GiftRequestCard 
                                    key={request.id} 
                                    request={request} 
                                    onUpdate={updateGiftRequestStatus}
                                    onDelete={deleteGiftRequest}
                                />
                            ))}
                        </AnimatePresence>
                    </div>

                    {hasMore && (
                        <div className="flex justify-center mt-12">
                            <button 
                                onClick={handleLoadMore}
                                className="group flex items-center gap-3 px-8 py-4 bg-black/5 dark:bg-white/5 hover:bg-black/10 dark:hover:bg-white/10 border border-black/5 dark:border-white/10 rounded-2xl transition-all"
                            >
                                <span className="text-[10px] font-bold uppercase tracking-[0.3em] text-gray-900 dark:text-white">View More Requests</span>
                                <ChevronDown size={16} className="text-attire-accent group-hover:translate-y-1 transition-transform" />
                            </button>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};

export default CustomizeGiftManager;
