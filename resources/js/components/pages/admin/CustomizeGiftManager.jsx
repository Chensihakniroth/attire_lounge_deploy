import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { User, Mail, Phone, Gift, CheckCircle, XCircle, Trash2, ChevronDown } from 'lucide-react';
import { LumaSpin } from '@/components/ui/luma-spin';
import { useAdmin } from './AdminContext';
import OptimizedImage from '../../common/OptimizedImage.jsx';
import { motion, AnimatePresence } from 'framer-motion';

const GiftRequestCard = React.forwardRef(({ request, onUpdate, onDelete }, ref) => {
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
        <div 
            ref={ref}
            className="group p-6 rounded-xl bg-white dark:bg-[#161b22] border border-black/5 dark:border-[#30363d] transition-all duration-300 hover:border-black/10 dark:hover:border-[#58a6ff]/30 shadow-none"
        >
            <div className="flex justify-between items-start pb-4 mb-6 border-b border-black/5 dark:border-[#30363d]">
                <div className="flex items-center gap-4">
                     <div className="h-12 w-12 rounded-full bg-black/5 dark:bg-[#0d1117] flex items-center justify-center border border-black/5 dark:border-[#30363d] group-hover:border-[#0d3542] dark:group-hover:border-[#58a6ff]/30 transition-colors">
                        <Gift className="w-5 h-5 text-gray-400 dark:text-[#8b949e] group-hover:text-[#0d3542] dark:group-hover:text-[#58a6ff] transition-colors" />
                    </div>
                    <div>
                        <h3 className="text-lg font-serif text-gray-900 dark:text-[#c9d1d9]">Gift for {request.recipient_title}. {request.recipient_name}</h3>
                        <p className="text-xs text-gray-500 dark:text-[#8b949e] mt-1">Requested on {new Date(request.created_at).toLocaleDateString()}</p>
                    </div>
                </div>
                 <span className={`px-3 py-1 text-[10px] font-bold uppercase tracking-wider rounded-full border ${status.color} ${status.bg} ${status.border}`}>
                    {request.status}
                </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                {/* Sender Info */}
                <div className="bg-black/5 dark:bg-[#0d1117] p-4 rounded-xl border border-black/5 dark:border-[#30363d]">
                    <h4 className="font-semibold text-[10px] text-gray-500 dark:text-[#8b949e] mb-3 uppercase tracking-[0.2em]">Sender</h4>
                    <div className="space-y-2 text-sm">
                        <p><strong className="font-semibold text-gray-700 dark:text-[#c9d1d9]">{request.name}</strong> {request.sender_age && `(Age: ${request.sender_age})`}</p>
                        {request.email && <p className="text-gray-600 dark:text-[#8b949e]">{request.email}</p>}
                        <p className="text-gray-600 dark:text-[#8b949e]">{request.phone}</p>
                    </div>
                </div>
                {/* Recipient Info */}
                <div className="bg-black/5 dark:bg-[#0d1117] p-4 rounded-xl border border-black/5 dark:border-[#30363d]">
                    <h4 className="font-semibold text-[10px] text-gray-500 dark:text-[#8b949e] mb-3 uppercase tracking-[0.2em]">Recipient</h4>
                    <div className="space-y-2 text-sm">
                        <p><strong className="font-semibold text-gray-700 dark:text-[#c9d1d9]">{request.recipient_title}. {request.recipient_name}</strong></p>
                        {request.recipient_email && <p className="text-gray-600 dark:text-[#8b949e]">{request.recipient_email}</p>}
                        {request.recipient_phone && <p className="text-gray-600 dark:text-[#8b949e]">{request.recipient_phone}</p>}
                    </div>
                </div>
            </div>

            {request.selected_items && request.selected_items.length > 0 && (
                <div className="mb-4">
                    <h4 className="font-semibold text-[10px] text-gray-500 dark:text-[#8b949e] mb-3 uppercase tracking-[0.2em]">Selected Items</h4>
                    <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-hide">
                        {request.selected_items.map((item, index) => (
                            <div key={index} className="flex-shrink-0 text-center">
                                <div className="h-20 w-20 rounded-lg overflow-hidden border border-black/5 dark:border-[#30363d] mx-auto">
                                    <OptimizedImage src={item.image} alt={item.name} className="w-full h-full object-cover" />
                                </div>
                                <p className="text-xs mt-2 text-gray-600 dark:text-[#8b949e]">{item.name}</p>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {request.preferences && (
                 <div className="mt-4 p-4 bg-black/5 dark:bg-[#0d1117] rounded-xl border border-black/5 dark:border-[#30363d]">
                    <h4 className="font-semibold text-[10px] text-gray-500 dark:text-[#8b949e] mb-2 uppercase tracking-[0.2em]">Preferences & Note</h4>
                    <pre className="whitespace-pre-wrap font-sans text-[11px] font-mono text-gray-700 dark:text-[#c9d1d9] leading-relaxed">{request.preferences}</pre>
                </div>
            )}


            <div className="mt-6 flex justify-end gap-3 border-t border-black/5 dark:border-[#30363d] pt-6">
                {request.status === 'Pending' ? (
                    <>
                        <button onClick={() => handleUpdate('Completed')} disabled={isUpdating} className="px-4 py-2 text-[10px] font-black uppercase tracking-[0.2em] text-green-600 dark:text-green-400 bg-green-400/10 border border-green-400/20 rounded-lg hover:bg-green-400/20 transition-all flex items-center gap-2" title="Mark as Completed">
                            {isUpdating ? <LumaSpin size="sm" /> : <CheckCircle size={14} />} Complete
                        </button>
                        <button onClick={() => handleUpdate('Cancelled')} disabled={isUpdating} className="px-4 py-2 text-[10px] font-black uppercase tracking-[0.2em] text-red-600 dark:text-red-400 bg-red-400/10 border border-red-400/20 rounded-lg hover:bg-red-400/20 transition-all flex items-center gap-2" title="Mark as Cancelled">
                            {isUpdating ? <LumaSpin size="sm" /> : <XCircle size={14} />} Cancel
                        </button>
                    </>
                ) : (
                    <button onClick={() => onDelete(request.id)} disabled={isUpdating} className="px-4 py-2 text-[10px] font-black uppercase tracking-[0.2em] text-gray-400 dark:text-[#8b949e] hover:text-red-600 dark:hover:text-red-400 bg-black/5 dark:bg-[#0d1117] border border-black/5 dark:border-[#30363d] rounded-lg transition-all" title="Delete record">
                        <Trash2 size={14} />
                    </button>
                )}
            </div>
        </div>
    );
});

const LoadingState = () => (
    <div className="col-span-full py-32 flex flex-col items-center justify-center space-y-4">
        <LumaSpin size="xl" />
        <p className="text-[10px] font-black uppercase tracking-[0.4em] text-gray-400 dark:text-[#8b949e]/40">Gathering Gift Tokens...</p>
    </div>
);

const CustomizeGiftManager = () => {
    const { 
        giftRequests, 
        giftRequestsLoading, 
        loadMoreGiftRequests,
        giftRequestsPagination,
        updateGiftRequestStatus, 
        deleteGiftRequest 
    } = useAdmin();

    const [visibleCount, setVisibleRows] = useState(6);

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
        <div className="space-y-8 pb-20 font-sans">
            <div className="flex justify-between items-end pb-6 border-b border-black/5 dark:border-[#30363d]">
                <div>
                    <h1 className="text-4xl font-serif text-gray-900 dark:text-[#c9d1d9] mb-2">Gift Management</h1>
                    <p className="text-gray-500 dark:text-[#8b949e] text-sm">Custom gift box inquiries</p>
                </div>
            </div>

            {giftRequestsLoading && giftRequests.length === 0 ? (
                 <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    <LoadingState />
                </div>
            ) : giftRequests.length === 0 ? (
                <div className="text-center py-20 bg-black/5 dark:bg-[#161b22] rounded-xl border border-black/5 dark:border-[#30363d]">
                    <Gift className="mx-auto text-gray-300 dark:text-[#8b949e]/30 mb-4" size={48} />
                    <p className="text-gray-500 dark:text-[#8b949e]/60 uppercase tracking-widest text-xs">No gift requests found.</p>
                </div>
            ) : (
                <div className="space-y-8">
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                            {visibleRequests.map(request => (
                                <GiftRequestCard 
                                    key={request.id} 
                                    request={request} 
                                    onUpdate={updateGiftRequestStatus}
                                    onDelete={deleteGiftRequest}
                                />
                            ))}
                        </div>

                    {hasMore && (
                        <div className="flex justify-center mt-12">
                            <button 
                                onClick={handleLoadMore}
                                className="group flex items-center gap-3 px-8 py-4 bg-black/5 dark:bg-[#161b22] hover:bg-black/10 dark:hover:bg-[#30363d]/50 border border-black/5 dark:border-[#30363d] rounded-xl transition-all"
                            >
                                <span className="text-[10px] font-bold uppercase tracking-[0.3em] text-gray-900 dark:text-[#c9d1d9]">View More Requests</span>
                                <ChevronDown size={16} className="text-[#0d3542] dark:text-[#58a6ff] group-hover:translate-y-1 transition-transform" />
                            </button>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};

export default CustomizeGiftManager;
