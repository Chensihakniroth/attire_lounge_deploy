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
        Pending: { label: 'Pending', color: 'text-yellow-400', bg: 'bg-yellow-400/10', border: 'border-yellow-400/20' },
        Completed: { label: 'Completed', color: 'text-green-400', bg: 'bg-green-400/10', border: 'border-green-400/20' },
        Cancelled: { label: 'Cancelled', color: 'text-red-400', bg: 'bg-red-400/10', border: 'border-red-400/20' },
    };
    
    const status = statusConfig[request.status] || statusConfig.Pending;

    return (
        <motion.div 
            layout="position"
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            className="group p-6 rounded-3xl backdrop-blur-xl bg-black/20 border border-white/10 shadow-lg transition-all duration-300 hover:bg-black/30 hover:border-attire-accent/30"
        >
            <div className="flex justify-between items-start pb-4 mb-4 border-b border-white/5">
                <div className="flex items-center gap-4">
                    <div className="h-12 w-12 rounded-full bg-white/5 flex items-center justify-center border border-white/5 group-hover:border-attire-accent/30 transition-colors">
                        <User className="w-5 h-5 text-attire-silver group-hover:text-attire-accent transition-colors" />
                    </div>
                    <div>
                        <h3 className="text-lg font-serif text-white">{request.name}</h3>
                        <div className="flex items-center gap-3 text-xs text-attire-silver/60 mt-1">
                            {request.email && <span className="truncate max-w-[150px]">{request.email} • </span>}
                            <span>{request.phone}</span>
                        </div>
                    </div>
                </div>
                <span className={`px-3 py-1 text-[10px] font-bold uppercase tracking-wider rounded-full border ${status.color} ${status.bg} ${status.border}`}>
                    {request.status}
                </span>
            </div>

            <div className="mt-4 p-4 bg-white/5 rounded-2xl border border-white/5">
                <pre className="whitespace-pre-wrap font-sans text-sm text-attire-cream/90 leading-relaxed pl-4 border-l-2 border-white/10">{request.preferences}</pre>
            </div>

            {request.selected_items && request.selected_items.length > 0 && (
                <div className="mt-4 flex gap-3 overflow-x-auto pb-2 scrollbar-hide">
                    {request.selected_items.map((item, index) => (
                        <div key={index} className="flex-shrink-0">
                            <div className="h-16 w-16 rounded-xl overflow-hidden border border-white/10">
                                <OptimizedImage src={item.image} alt="" className="w-full h-full object-cover" />
                            </div>
                        </div>
                    ))}
                </div>
            )}

            <div className="mt-6 flex justify-end gap-3">
                {request.status === 'Pending' ? (
                    <>
                        <button onClick={() => handleUpdate('Completed')} disabled={isUpdating} className="px-4 py-2 text-xs font-bold uppercase tracking-widest text-green-400 bg-green-400/10 border border-green-400/20 rounded-xl hover:bg-green-400/20 transition-all flex items-center gap-2">
                            <CheckCircle size={14} /> Complete
                        </button>
                        <button onClick={() => handleUpdate('Cancelled')} disabled={isUpdating} className="px-4 py-2 text-xs font-bold uppercase tracking-widest text-red-400 bg-red-400/10 border border-red-400/20 rounded-xl hover:bg-red-400/20 transition-all flex items-center gap-2">
                            <XCircle size={14} /> Cancel
                        </button>
                    </>
                ) : (
                    <button onClick={() => onDelete(request.id)} disabled={isUpdating} className="px-4 py-2 text-xs font-bold uppercase tracking-widest text-attire-silver hover:text-red-400 bg-white/5 border border-white/10 rounded-xl transition-all">
                        <Trash2 size={14} />
                    </button>
                )}
            </div>
        </motion.div>
    );
};

const GiftSkeleton = () => (
    <div className="p-6 rounded-3xl bg-white/5 border border-white/5 space-y-6">
        <div className="flex items-center justify-between border-b border-white/5 pb-4">
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
        updateGiftRequestStatus, 
        deleteGiftRequest 
    } = useAdmin();

    const [visibleCount, setVisibleRows] = useState(6);

    useEffect(() => {
        fetchGiftRequests();
        const intervalId = setInterval(() => fetchGiftRequests(false), 60000); 
        return () => clearInterval(intervalId);
    }, [fetchGiftRequests]);

    const visibleRequests = useMemo(() => {
        return giftRequests.slice(0, visibleCount);
    }, [giftRequests, visibleCount]);

    const hasMore = giftRequests.length > visibleCount;

    if (giftRequestsLoading && giftRequests.length === 0) {
        return (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {[...Array(4)].map((_, i) => <GiftSkeleton key={i} />)}
            </div>
        );
    }

    return (
        <div className="space-y-8 pb-20">
            <div className="pb-4 border-b border-white/10">
                <h1 className="text-4xl font-serif text-white mb-2">Gift Management</h1>
                <p className="text-attire-silver text-sm uppercase tracking-widest">Custom gift box inquiries</p>
            </div>

            {giftRequests.length === 0 ? (
                <div className="text-center py-20 bg-black/20 rounded-3xl border border-white/5">
                    <Gift className="mx-auto text-attire-silver/20 mb-4" size={48} />
                    <p className="text-attire-silver/60 uppercase tracking-widest text-xs">No gift requests found.</p>
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
                                onClick={() => setVisibleRows(v => v + 6)}
                                className="group flex items-center gap-3 px-8 py-4 bg-white/5 hover:bg-white/10 border border-white/10 rounded-2xl transition-all"
                            >
                                <span className="text-[10px] font-bold uppercase tracking-[0.3em] text-white">View More Requests</span>
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
