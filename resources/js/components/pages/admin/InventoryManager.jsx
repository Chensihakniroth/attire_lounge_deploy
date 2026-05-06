import React, { useState, useEffect } from 'react';
import { Package, AlertTriangle, CheckCircle, XCircle } from 'lucide-react';
import { LumaSpin } from '../../ui/luma-spin';
import giftOptions from '../../../data/giftOptions';
import axios from 'axios';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import OptimizedImage from '../../common/OptimizedImage.jsx';
import { motion } from 'framer-motion';
import { useAdmin } from './AdminContext';

const InventoryManager = () => {
    const { activeOutlet } = useAdmin();
    const queryClient = useQueryClient();
    
    const { data: outOfStockItems = [], isLoading: loading } = useQuery({
        queryKey: ['outOfStockItems', activeOutlet],
        queryFn: async () => {
            const { data } = await axios.get('/api/v1/gift-items/out-of-stock', { headers: { 'X-Active-Outlet': activeOutlet } });
            return Array.isArray(data) ? data : [];
        },
        staleTime: 2 * 60 * 1000,
    });

    const toggleStockMutation = useMutation({
        mutationFn: async ({ id, is_out_of_stock }) => {
            await axios.post('/api/v1/admin/gift-items/toggle-stock', {
                item_id: id,
                is_out_of_stock
            });
        },
        onMutate: async ({ id, is_out_of_stock }) => {
            await queryClient.cancelQueries({ queryKey: ['outOfStockItems', activeOutlet] });
            const previousItems = queryClient.getQueryData(['outOfStockItems', activeOutlet]);
            
            queryClient.setQueryData(['outOfStockItems', activeOutlet], (old) => {
                const safeOld = Array.isArray(old) ? old : [];
                return is_out_of_stock 
                    ? [...safeOld, id] 
                    : safeOld.filter(itemId => itemId !== id);
            });
            
            return { previousItems };
        },
        onError: (err, variables, context) => {
            console.error('Failed to toggle stock:', err);
            queryClient.setQueryData(['outOfStockItems', activeOutlet], context?.previousItems);
        }
    });

    const toggleStock = (id) => {
        const isCurrentlyOutOfStock = outOfStockItems.includes(id);
        toggleStockMutation.mutate({ id, is_out_of_stock: !isCurrentlyOutOfStock });
    };

    const renderSection = (title, items) => (
        <section className="space-y-4">
            <h2 className="text-xl font-serif text-gray-900 dark:text-[#c9d1d9] border-b border-black/5 dark:border-[#30363d] pb-2">{title}</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                {items.map(item => {
                    const isOutOfStock = outOfStockItems.includes(item.id);
                    return (
                        <motion.div 
                            layout="position"
                            key={item.id}
                            onClick={() => toggleStock(item.id)}
                            className={`p-4 rounded-2xl border transition-all duration-300 cursor-pointer group hover:scale-[1.02] active:scale-[0.98] ${
                                isOutOfStock 
                                    ? 'bg-red-500/5 border-red-500/20 hover:border-red-500/40' 
                                    : 'bg-white dark:bg-[#161b22] border-black/5 dark:border-[#30363d] hover:border-[#0d3542]/30 dark:hover:border-[#58a6ff]/30 shadow-none'
                            }`}
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
                                    {isOutOfStock ? <XCircle size={20} /> : <CheckCircle size={20} />}
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
