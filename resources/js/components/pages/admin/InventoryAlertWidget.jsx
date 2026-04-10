import React from 'react';
import { Package, AlertTriangle, TrendingDown, ArrowRight, Eye, Edit3 } from 'lucide-react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { useAdmin } from './AdminContext';

const InventoryAlertWidget = () => {
    const { products, productsLoading, outOfStockItems, outOfStockLoading, performanceMode } = useAdmin();

    if (productsLoading || outOfStockLoading) {
        return (
            <div className="h-full bg-[#fdfdfc] dark:bg-[#161b22] rounded-[2.5rem] border border-black/5 dark:border-[#30363d] flex flex-col items-center justify-center gap-4 p-8">
                <div className="w-10 h-10 border-2 border-[#0d3542]/20 dark:border-[#58a6ff]/20 border-t-[#0d3542] dark:border-t-[#58a6ff] rounded-full animate-spin" />
                <div className="w-24 h-2 bg-black/5 dark:bg-white/10 rounded-full animate-pulse" />
            </div>
        );
    }

    const lowStockThreshold = 5;
    
    const lowStockProducts = (products || [])
        .filter(p => p.stock_qty !== undefined && p.stock_qty !== null)
        .filter(p => p.stock_qty <= lowStockThreshold && p.stock_qty > 0)
        .sort((a, b) => a.stock_qty - b.stock_qty)
        .slice(0, 5);

    const outOfStockProducts = (products || [])
        .filter(p => p.stock_qty !== undefined && p.stock_qty !== null)
        .filter(p => p.stock_qty === 0)
        .slice(0, 5);

    const totalAlerts = lowStockProducts.length + outOfStockProducts.length;

    const getStockColor = (qty) => {
        if (qty === 0) return '#ef4444';
        if (qty <= 2) return '#ef4444';
        if (qty <= 5) return '#f59e0b';
        return '#10b981';
    };

    const getStockLabel = (qty) => {
        if (qty === 0) return 'OUT';
        if (qty <= 2) return 'CRITICAL';
        if (qty <= 5) return 'LOW';
        return 'OK';
    };

    return (
        <motion.div 
            initial={performanceMode ? { opacity: 0 } : { opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={performanceMode ? { duration: 0 } : {}}
            className="bg-[#fdfdfc] dark:bg-[#161b22] p-4 rounded-xl border border-black/5 dark:border-[#30363d] shadow-none h-full"
        >
            <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-3">
                    <div className={`p-2.5 rounded-xl ${totalAlerts > 0 ? 'bg-red-500 text-white animate-pulse' : 'bg-[#0d3542] dark:bg-[#58a6ff] text-white dark:text-black'}`}>
                        <Package size={18} />
                    </div>
                    <div>
                        <h3 className="text-sm font-black text-gray-900 dark:text-white uppercase tracking-[0.15em]">Inventory</h3>
                        <p className="text-[9px] text-gray-400 dark:text-[#8b949e]/40 uppercase tracking-widest">Stock Alerts</p>
                    </div>
                </div>
                {totalAlerts > 0 && (
                    <div className="flex items-center gap-1 px-2 py-1 rounded-full bg-red-500/10 text-red-500">
                        <AlertTriangle size={10} />
                        <span className="text-[8px] font-black uppercase tracking-widest">{totalAlerts}</span>
                    </div>
                )}
            </div>

            <div className="space-y-2 max-h-[160px] overflow-y-auto pr-1 custom-scrollbar">
                {outOfStockProducts.length > 0 && (
                    <div className="space-y-2">
                        <p className="text-[8px] font-black uppercase tracking-widest text-red-500 px-2">Out of Stock</p>
                        {outOfStockProducts.map((product) => (
                            <motion.div
                                key={product.id}
                                initial={{ opacity: 0, x: -10 }}
                                animate={{ opacity: 1, x: 0 }}
                                className="flex items-center justify-between p-3 rounded-2xl bg-red-500/5 border border-red-500/20 hover:bg-red-500/10 transition-colors group"
                            >
                                <div className="flex-grow min-w-0">
                                    <p className="text-xs font-black text-gray-900 dark:text-white uppercase tracking-tight truncate">
                                        {product.name}
                                    </p>
                                    <p className="text-[9px] text-gray-400 dark:text-[#8b949e]/40 uppercase tracking-widest">
                                        {product.sku || 'No SKU'}
                                    </p>
                                </div>
                                <div className="flex items-center gap-2">
                                    <span className="text-[9px] font-black uppercase tracking-widest text-red-500">
                                        {getStockLabel(0)}
                                    </span>
                                    <Link 
                                        to={`/admin/products?edit=${product.id}`}
                                        className="p-1.5 rounded-lg bg-red-500/10 text-red-500 hover:bg-red-500/20 transition-colors"
                                    >
                                        <Edit3 size={10} />
                                    </Link>
                                </div>
                            </motion.div>
                        ))}
                    </div>
                )}

                {lowStockProducts.length > 0 && (
                    <div className="space-y-2">
                        <p className="text-[8px] font-black uppercase tracking-widest text-amber-500 px-2">Low Stock</p>
                        {lowStockProducts.map((product) => (
                            <motion.div
                                key={product.id}
                                initial={{ opacity: 0, x: -10 }}
                                animate={{ opacity: 1, x: 0 }}
                                className="flex items-center justify-between p-3 rounded-2xl bg-amber-500/5 border border-amber-500/20 hover:bg-amber-500/10 transition-colors group"
                            >
                                <div className="flex-grow min-w-0">
                                    <p className="text-xs font-black text-gray-900 dark:text-white uppercase tracking-tight truncate">
                                        {product.name}
                                    </p>
                                    <p className="text-[9px] text-gray-400 dark:text-[#8b949e]/40 uppercase tracking-widest">
                                        {product.sku || 'No SKU'}
                                    </p>
                                </div>
                                <div className="flex items-center gap-2">
                                    <span 
                                        className="text-[9px] font-black uppercase tracking-widest px-2 py-1 rounded-lg"
                                        style={{ 
                                            backgroundColor: `${getStockColor(product.stock_qty)}/10`,
                                            color: getStockColor(product.stock_qty)
                                        }}
                                    >
                                        {product.stock_qty}
                                    </span>
                                    <Link 
                                        to={`/admin/products?edit=${product.id}`}
                                        className="p-1.5 rounded-lg bg-amber-500/10 text-amber-500 hover:bg-amber-500/20 transition-colors"
                                    >
                                        <Edit3 size={10} />
                                    </Link>
                                </div>
                            </motion.div>
                        ))}
                    </div>
                )}

                {totalAlerts === 0 && (
                    <div className="flex flex-col items-center justify-center py-8 text-center">
                        <Package size={32} className="text-green-500 mb-2" />
                        <p className="text-[10px] font-black uppercase tracking-widest text-green-500">Stock Levels Healthy</p>
                        <p className="text-[9px] text-gray-400 dark:text-[#8b949e]/40 mt-1">All products are well stocked</p>
                    </div>
                )}
            </div>

            {totalAlerts > 0 && (
                <div className="mt-4 pt-4 border-t border-black/5 dark:border-[#30363d] flex items-center justify-between">
                    <Link 
                        to="/admin/inventory" 
                        className="text-[9px] font-black uppercase tracking-widest text-[#0d3542] dark:text-[#58a6ff] hover:gap-2 transition-all flex items-center gap-1"
                    >
                        Manage Inventory <ArrowRight size={10} />
                    </Link>
                    <span className="text-[9px] font-mono text-gray-400 dark:text-[#8b949e]/40">
                        {totalAlerts} alerts
                    </span>
                </div>
            )}
        </motion.div>
    );
};

export default InventoryAlertWidget;