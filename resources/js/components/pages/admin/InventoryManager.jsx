import React, { useState, useEffect } from 'react';
import { Package, AlertTriangle, CheckCircle, XCircle, Loader } from 'lucide-react';
import giftOptions from '../../../data/giftOptions';
import api from '../../../api';

const InventoryManager = () => {
    const [outOfStockItems, setOutOfStockItems] = useState([]);
    const [loading, setLoading] = useState(true);
    const [updatingItems, setUpdatingItems] = useState(new Set());

    const fetchInventory = async () => {
        try {
            const items = await api.getOutOfStockItems();
            setOutOfStockItems(items);
        } catch (error) {
            console.error('Failed to fetch inventory:', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchInventory();
    }, []);

    const toggleStock = async (id) => {
        if (updatingItems.has(id)) return;
        
        const isCurrentlyOutOfStock = outOfStockItems.includes(id);
        const nextStatus = !isCurrentlyOutOfStock;

        setUpdatingItems(prev => new Set(prev).add(id));
        try {
            await api.toggleGiftItemStock(id, nextStatus);
            setOutOfStockItems(prev => 
                nextStatus 
                    ? [...prev, id] 
                    : prev.filter(item => item !== id)
            );
        } catch (error) {
            console.error('Failed to toggle stock:', error);
        } finally {
            setUpdatingItems(prev => {
                const next = new Set(prev);
                next.delete(id);
                return next;
            });
        }
    };

    const renderSection = (title, items) => (
        <section className="space-y-4">
            <h2 className="text-xl font-serif text-white border-b border-white/10 pb-2">{title}</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                {items.map(item => {
                    const isOutOfStock = outOfStockItems.includes(item.id);
                    const isUpdating = updatingItems.has(item.id);
                    return (
                        <div 
                            key={item.id}
                            onClick={() => toggleStock(item.id)}
                            className={`p-4 rounded-2xl border transition-all duration-300 cursor-pointer group hover:scale-[1.02] active:scale-[0.98] ${
                                isOutOfStock 
                                    ? 'bg-red-500/5 border-red-500/20 hover:border-red-500/40' 
                                    : 'bg-black/20 border-white/10 hover:border-attire-accent/30'
                            } ${isUpdating ? 'opacity-70 pointer-events-none' : ''}`}
                        >
                            <div className="flex items-center gap-4">
                                <div className="h-16 w-16 rounded-xl overflow-hidden border border-white/10 flex-shrink-0">
                                    <img src={item.image} alt={item.name} className={`w-full h-full object-cover ${isOutOfStock ? 'grayscale opacity-50' : ''}`} />
                                </div>
                                <div className="flex-grow min-w-0">
                                    <h3 className="text-sm font-medium text-white truncate group-hover:text-attire-accent transition-colors">{item.name}</h3>
                                    <p className="text-xs text-attire-silver">{item.color || 'Default'}</p>
                                </div>
                                <div
                                    className={`flex-shrink-0 p-2 rounded-full transition-colors ${
                                        isOutOfStock 
                                            ? 'bg-red-500/20 text-red-400 group-hover:bg-red-500/30' 
                                            : 'bg-green-500/20 text-green-400 group-hover:bg-green-500/30'
                                    }`}
                                >
                                    {isUpdating ? <Loader className="animate-spin" size={20} /> : (isOutOfStock ? <XCircle size={20} /> : <CheckCircle size={20} />)}
                                </div>
                            </div>
                            <div className="mt-3 flex items-center justify-between">
                                <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded transition-colors ${
                                    isOutOfStock 
                                        ? 'bg-red-500/20 text-red-400' 
                                        : 'bg-green-500/20 text-green-400'
                                }`}>
                                    {isOutOfStock ? 'Out of Stock' : 'In Stock'}
                                </span>
                            </div>
                        </div>
                    );
                })}
            </div>
        </section>
    );

    if (loading) {
        return (
            <div className="flex justify-center items-center h-64">
                <Loader className="animate-spin text-attire-accent" size={48} />
            </div>
        );
    }

    return (
        <div className="space-y-8">
            <div className="pb-4 border-b border-white/10">
                <h1 className="text-4xl font-serif text-white mb-2">Inventory Management</h1>
                <p className="text-attire-silver text-sm">Toggle product availability for the Custom Gift Box curate page.</p>
            </div>

            <div className="bg-blue-500/10 border border-blue-500/20 rounded-2xl p-4 flex items-start gap-4 mb-8">
                <Package className="text-blue-400 flex-shrink-0 mt-1" size={20} />
                <div>
                    <h4 className="text-sm font-bold text-blue-400 uppercase tracking-wider">Sync Active</h4>
                    <p className="text-xs text-attire-silver leading-relaxed">
                        Changes made here are saved to the backend and will immediately affect all users visiting the Customize Gift Page.
                    </p>
                </div>
            </div>

            <div className="space-y-12">
                {renderSection('Ties', giftOptions.ties)}
                {renderSection('Pocket Squares', giftOptions.pocketSquares)}
                {renderSection('Gift Boxes', giftOptions.boxes)}
            </div>
        </div>
    );
};

export default InventoryManager;
