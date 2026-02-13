import React, { useState, useEffect, useCallback } from 'react';
import { User, Mail, Phone, Gift, AlertTriangle, Loader, CheckCircle, XCircle, Trash2, Package, Eye, EyeOff } from 'lucide-react';
import { useAdmin } from './AdminContext';
import giftOptions from '../../../data/giftOptions';
import api from '../../../api';

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
                            <span className="flex items-center gap-1 hover:text-white transition-colors">
                                <Mail size={12} /> {request.email}
                            </span>
                            <span>•</span>
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

const InventoryItem = ({ item, isOutOfStock, onToggle }) => {
    const [isUpdating, setIsUpdating] = useState(false);

    const handleToggle = async () => {
        setIsUpdating(true);
        try {
            await onToggle(item.id, !isOutOfStock);
        } finally {
            setIsUpdating(false);
        }
    };

    return (
        <div className={`p-4 rounded-2xl border transition-all duration-300 ${
            isOutOfStock ? 'bg-red-500/5 border-red-500/20' : 'bg-green-500/5 border-green-500/20'
        }`}>
            <div className="flex items-center gap-4">
                <div className="h-16 w-16 rounded-xl overflow-hidden border border-white/10">
                    <img src={item.image} alt={item.name} className={`w-full h-full object-cover ${isOutOfStock ? 'grayscale opacity-50' : ''}`} />
                </div>
                <div className="flex-grow">
                    <h4 className="text-sm font-medium text-white">{item.name}</h4>
                    <p className="text-xs text-attire-silver">{item.color || 'Default'}</p>
                </div>
                <button
                    onClick={handleToggle}
                    disabled={isUpdating}
                    className={`flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-bold uppercase tracking-wider transition-all ${
                        isOutOfStock 
                            ? 'bg-red-500/10 text-red-400 border border-red-500/20 hover:bg-red-500/20' 
                            : 'bg-green-500/10 text-green-400 border border-green-500/20 hover:bg-green-500/20'
                    }`}
                >
                    {isUpdating ? <Loader className="animate-spin" size={14} /> : (isOutOfStock ? <><EyeOff size={14} /> Out of Stock</> : <><Eye size={14} /> In Stock</>)}
                </button>
            </div>
        </div>
    );
};

const CustomizeGiftManager = () => {
    const [activeTab, setActiveTab] = useState('requests');
    const [outOfStockItems, setOutOfStockItems] = useState([]);
    const [inventoryLoading, setInventoryLoading] = useState(false);

    const { 
        giftRequests, 
        giftRequestsLoading, 
        fetchGiftRequests, 
        updateGiftRequestStatus, 
        deleteGiftRequest 
    } = useAdmin();

    const fetchInventory = useCallback(async () => {
        setInventoryLoading(true);
        try {
            const items = await api.getOutOfStockItems();
            setOutOfStockItems(items);
        } catch (error) {
            console.error('Failed to fetch inventory:', error);
        } finally {
            setInventoryLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchGiftRequests(); // Use context fetcher
        fetchInventory();
        const intervalId = setInterval(() => {
            fetchGiftRequests(false);
            fetchInventory();
        }, 60000); 
        return () => clearInterval(intervalId);
    }, [fetchGiftRequests, fetchInventory]);

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

    const handleToggleStock = async (itemId, isOutOfStock) => {
        try {
            await api.toggleGiftItemStock(itemId, isOutOfStock);
            setOutOfStockItems(prev => 
                isOutOfStock 
                    ? [...prev, itemId] 
                    : prev.filter(id => id !== itemId)
            );
        } catch (error) {
            console.error('Failed to toggle stock:', error);
        }
    };

    const renderRequests = () => {
        if (giftRequestsLoading && giftRequests.length === 0) {
            return (
                <div className="flex justify-center items-center h-64">
                    <Loader className="animate-spin text-attire-accent" size={48} />
                </div>
            );
        }

        if (giftRequests.length === 0 && !giftRequestsLoading) {
            return (
                <div className="text-center py-20 bg-black/20 rounded-3xl border border-white/5">
                    <div className="w-16 h-16 bg-white/5 rounded-full flex items-center justify-center mx-auto mb-4">
                        <Gift className="text-attire-silver/30" />
                    </div>
                    <p className="text-attire-silver/60">No gift requests found.</p>
                </div>
            );
        }

        return (
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
        );
    };

    const renderInventory = () => {
        if (inventoryLoading && outOfStockItems.length === 0 && Object.keys(giftOptions).length === 0) {
            return (
                <div className="flex justify-center items-center h-64">
                    <Loader className="animate-spin text-attire-accent" size={48} />
                </div>
            );
        }

        return (
            <div className="space-y-12">
                {Object.entries(giftOptions).map(([category, items]) => (
                    <div key={category} className="space-y-6">
                        <div className="flex items-center gap-4">
                            <h3 className="text-xl font-serif text-white uppercase tracking-widest">{category.replace(/([A-Z])/g, ' $1')}</h3>
                            <div className="h-px flex-grow bg-white/10"></div>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                            {items.map(item => (
                                <InventoryItem 
                                    key={item.id} 
                                    item={item} 
                                    isOutOfStock={outOfStockItems.includes(item.id)}
                                    onToggle={handleToggleStock}
                                />
                            ))}
                        </div>
                    </div>
                ))}
            </div>
        );
    };

    return (
        <div className="space-y-8">
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 pb-4 border-b border-white/10">
                <div>
                    <h1 className="text-4xl font-serif text-white mb-2">Gift Management</h1>
                    <p className="text-attire-silver text-sm">Manage customized gift box inquiries and item availability.</p>
                </div>
                
                <div className="flex bg-black/40 p-1 rounded-2xl border border-white/5">
                    <button 
                        onClick={() => setActiveTab('requests')}
                        className={`px-6 py-2.5 rounded-xl text-sm font-semibold transition-all duration-300 flex items-center gap-2 ${
                            activeTab === 'requests' ? 'bg-attire-accent text-black' : 'text-attire-silver hover:text-white'
                        }`}
                    >
                        <Gift size={18} /> Requests
                    </button>
                    <button 
                        onClick={() => setActiveTab('inventory')}
                        className={`px-6 py-2.5 rounded-xl text-sm font-semibold transition-all duration-300 flex items-center gap-2 ${
                            activeTab === 'inventory' ? 'bg-attire-accent text-black' : 'text-attire-silver hover:text-white'
                        }`}
                    >
                        <Package size={18} /> Inventory
                    </button>
                </div>
            </div>

            {activeTab === 'requests' ? renderRequests() : renderInventory()}
        </div>
    );
};

export default CustomizeGiftManager;
