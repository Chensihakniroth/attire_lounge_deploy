import React, { useState, useEffect } from 'react';
import { Package, AlertTriangle, CheckCircle, XCircle } from 'lucide-react';
import { LumaSpin } from '../../ui/luma-spin';
import giftOptions from '../../../data/giftOptions';
import api from '../../../api';
import OptimizedImage from '../../common/OptimizedImage.jsx';
import { motion } from 'framer-motion';
import { useAdmin } from './AdminContext';

const InventoryManager = () => {
    const { outOfStockItems, outOfStockLoading: loading, fetchOutOfStockItems } = useAdmin();
    const [updatingItems, setUpdatingItems] = useState(new Set());

    useEffect(() => {
        fetchOutOfStockItems();
    }, [fetchOutOfStockItems]);

    const toggleStock = async (id) => {
        if (updatingItems.has(id)) return;
        
        const isCurrentlyOutOfStock = outOfStockItems.includes(id);
        const nextStatus = !isCurrentlyOutOfStock;

        setUpdatingItems(prev => new Set(prev).add(id));
        try {
            await api.toggleGiftItemStock(id, nextStatus);
            // We don't manually update state here because the WebSocket event will trigger fetchOutOfStockItems() ✨
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
            <h2 className="text-xl font-serif text-gray-900 dark:text-[#c9d1d9] border-b border-black/5 dark:border-[#30363d] pb-2">{title}</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                {items.map(item => {
                    const isOutOfStock = outOfStockItems.includes(item.id);
                    const isUpdating = updatingItems.has(item.id);
                    return (
                        <motion.div 
                            layout="position"
                            key={item.id}
                            onClick={() => toggleStock(item.id)}
                            className={`p-4 rounded-2xl border transition-all duration-300 cursor-pointer group hover:scale-[1.02] active:scale-[0.98] ${
                                isOutOfStock 
                                    ? 'bg-red-500/5 border-red-500/20 hover:border-red-500/40' 
                                    : 'bg-white dark:bg-[#161b22] border-black/5 dark:border-[#30363d] hover:border-[#0d3542]/30 dark:hover:border-[#58a6ff]/30 shadow-none'
                            } ${isUpdating ? 'opacity-70 pointer-events-none' : ''}`}
                        >
                            <div className="flex items-center gap-4">
                                <div className="h-16 w-16 rounded-xl overflow-hidden border border-black/5 dark:border-[#30363d] flex-shrink-0">
                                    <OptimizedImage 
                                        src={item.image} 
                                        alt={item.name} 
                                        containerClassName="w-full h-full"
                                        className={`w-full h-full ${isOutOfStock ? 'grayscale opacity-50' : ''}`} 
                                    />
                                </div>
                                <div className="flex-grow min-w-0">
                                    <h3 className="text-sm font-medium text-gray-900 dark:text-[#c9d1d9] truncate group-hover:text-[#0d3542] dark:group-hover:text-[#58a6ff] transition-colors">{item.name}</h3>
                                    <p className="text-xs text-gray-500 dark:text-[#8b949e]">{item.color || 'Default'}</p>
                                </div>
                                <div
                                    className={`flex-shrink-0 p-2 rounded-full transition-colors ${
                                        isOutOfStock 
                                            ? 'bg-red-500/20 text-red-600 dark:text-red-400 group-hover:bg-red-500/30' 
                                            : 'bg-green-500/20 text-green-600 dark:text-green-400 group-hover:bg-green-500/30'
                                    }`}
                                >
                                    {isUpdating ? <LumaSpin size="sm" /> : (isOutOfStock ? <XCircle size={20} /> : <CheckCircle size={20} />)}
                                </div>
                            </div>
                        </motion.div>
                    );
                })}
            </div>
        </section>
    );

    if (loading) {
        return (
            <div className="flex flex-col items-center justify-center py-48 space-y-4">
                <LumaSpin size="xl" />
                <p className="text-[10px] font-black uppercase tracking-[0.4em] text-gray-400 dark:text-[#8b949e]/40">Scanning Inventory...</p>
            </div>
        );
    }

    return (
        <div className="space-y-8 pb-20">
            <div className="pb-4 border-b border-black/5 dark:border-[#30363d]">
                <h1 className="text-4xl font-serif text-gray-900 dark:text-[#c9d1d9] mb-2">Inventory</h1>
                <p className="text-gray-500 dark:text-[#8b949e] text-sm uppercase tracking-widest">Manage gift item availability</p>
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
