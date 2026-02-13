import React, { useState, useEffect, useCallback } from 'react';
import { User, Mail, Phone, Gift, Loader, CheckCircle, XCircle, Trash2 } from 'lucide-react';
import { useAdmin } from './AdminContext';

const GiftRequestCard = ({ request, onUpdate, onDelete }) => {
    const [isUpdating, setIsUpdating] = useState(false);

    const handleUpdate = async (status) => {
        setIsUpdating(true);
        await onUpdate(request.id, status);
        setIsUpdating(false);
    };

    const handleDelete = async () => {
        if (window.confirm('Are you sure you want to permanently delete this request?')) {
            setIsUpdating(true);
            await onDelete(request.id);
        }
    };
    
    const statusConfig = {
        Pending: { label: 'Pending', color: 'text-yellow-400', bg: 'bg-yellow-400/10', border: 'border-yellow-400/20' },
        Reviewed: { label: 'Reviewed', color: 'text-blue-400', bg: 'bg-blue-400/10', border: 'border-blue-400/20' },
        Completed: { label: 'Completed', color: 'text-green-400', bg: 'bg-green-400/10', border: 'border-green-400/20' },
        Cancelled: { label: 'Cancelled', color: 'text-red-400', bg: 'bg-red-400/10', border: 'border-red-400/20' },
    };
    
    const status = statusConfig[request.status] || statusConfig.Pending;

    return (
        <div 
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
                            {request.email && (
                                <>
                                    <span className="flex items-center gap-1 hover:text-white transition-colors">
                                        <Mail size={12} /> {request.email}
                                    </span>
                                    <span>•</span>
                                </>
                            )}
                            <span className="flex items-center gap-1 hover:text-white transition-colors">
                                <Phone size={12} /> {request.phone}
                            </span>
                        </div>
                    </div>
                </div>
                <span className={`px-3 py-1 text-[10px] font-bold uppercase tracking-wider rounded-full border ${status.color} ${status.bg} ${status.border}`}>
                    {request.status}
                </span>
            </div>

            <div className="mt-4 p-4 bg-white/5 rounded-2xl border border-white/5">
                <div className="flex items-center gap-2 mb-3">
                    <Gift className="w-4 h-4 text-attire-accent" />
                    <p className="text-xs font-bold text-attire-silver/50 uppercase tracking-widest">Customization Details</p>
                </div>
                <pre className="whitespace-pre-wrap font-sans text-sm text-attire-cream/90 leading-relaxed pl-6 border-l-2 border-white/10 ml-2">{request.preferences}</pre>
            </div>

            {request.selected_items && request.selected_items.length > 0 && (
                <div className="mt-4 p-4 bg-white/5 rounded-2xl border border-white/5">
                    <p className="text-xs font-bold text-attire-silver/50 uppercase tracking-widest mb-3">Selected Visuals</p>
                    <div className="flex gap-4 overflow-x-auto pb-2 [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
                        {request.selected_items.map((item, index) => (
                            <div key={index} className="flex flex-col items-center min-w-[80px]">
                                <div className="h-20 w-20 rounded-xl overflow-hidden border border-white/10 mb-2 relative group/img">
                                    <img 
                                        src={item.image} 
                                        alt={item.name} 
                                        className="w-full h-full object-cover transition-transform duration-500 group-hover/img:scale-110"
                                    />
                                </div>
                                <p className="text-[10px] text-attire-silver text-center uppercase tracking-wide">{item.type}</p>
                                <p className="text-[10px] text-white text-center font-medium truncate w-full">{item.color || item.name}</p>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            <div className="mt-6 flex items-center justify-end gap-3 opacity-80 group-hover:opacity-100 transition-opacity">
                {request.status === 'Pending' && (
                    <>
                        <button 
                            onClick={() => handleUpdate('Completed')} 
                            disabled={isUpdating} 
                            className="px-4 py-2 text-xs font-bold uppercase tracking-widest text-green-400 bg-green-400/10 border border-green-400/20 rounded-xl hover:bg-green-400/20 disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center gap-2"
                        >
                            <CheckCircle size={14} /> Complete
                        </button>
                        <button 
                            onClick={() => handleUpdate('Cancelled')} 
                            disabled={isUpdating} 
                            className="px-4 py-2 text-xs font-bold uppercase tracking-widest text-red-400 bg-red-400/10 border border-red-400/20 rounded-xl hover:bg-red-400/20 disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center gap-2"
                        >
                            <XCircle size={14} /> Cancel
                        </button>
                    </>
                )}
                {(request.status === 'Completed' || request.status === 'Cancelled') && (
                    <button 
                        onClick={handleDelete} 
                        disabled={isUpdating} 
                        className="px-4 py-2 text-xs font-bold uppercase tracking-widest text-attire-silver hover:text-red-400 bg-white/5 hover:bg-red-500/10 border border-white/10 hover:border-red-500/30 rounded-xl disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center gap-2"
                    >
                        <Trash2 size={14} /> Delete
                    </button>
                )}
            </div>
        </div>
    );
};

const CustomizeGiftManager = () => {
    const { 
        giftRequests, 
        giftRequestsLoading, 
        fetchGiftRequests, 
        updateGiftRequestStatus, 
        deleteGiftRequest 
    } = useAdmin();

    useEffect(() => {
        fetchGiftRequests(); // Use context fetcher
        const intervalId = setInterval(() => {
            fetchGiftRequests(false);
        }, 60000); 
        return () => clearInterval(intervalId);
    }, [fetchGiftRequests]);

    const handleUpdate = useCallback(async (id, status) => {
        try {
            await updateGiftRequestStatus(id, status);
        } catch (err) {
            console.error('Failed to update status:', err);
        }
    }, [updateGiftRequestStatus]);

    const handleDelete = useCallback(async (id) => {
        try {
            await deleteGiftRequest(id);
        } catch (err) {
            console.error('Failed to delete request:', err);
        }
    }, [deleteGiftRequest]);

    if (giftRequestsLoading && giftRequests.length === 0) {
        return (
            <div className="flex justify-center items-center h-64">
                <Loader className="animate-spin text-attire-accent" size={48} />
            </div>
        );
    }

    return (
        <div className="space-y-8">
            <div className="pb-4 border-b border-white/10">
                <h1 className="text-4xl font-serif text-white mb-2">Gift Management</h1>
                <p className="text-attire-silver text-sm">Manage customized gift box inquiries.</p>
            </div>

            {giftRequests.length === 0 ? (
                <div className="text-center py-20 bg-black/20 rounded-3xl border border-white/5">
                    <div className="w-16 h-16 bg-white/5 rounded-full flex items-center justify-center mx-auto mb-4">
                        <Gift className="text-attire-silver/30" />
                    </div>
                    <p className="text-attire-silver/60">No gift requests found.</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {giftRequests.map(request => (
                        <GiftRequestCard 
                            key={request.id} 
                            request={request} 
                            onUpdate={handleUpdate}
                            onDelete={handleDelete}
                        />
                    ))}
                </div>
            )}
        </div>
    );
};

export default CustomizeGiftManager;
