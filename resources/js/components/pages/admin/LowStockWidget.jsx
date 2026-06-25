import React from 'react';
import { AlertTriangle, Package } from 'lucide-react';
import { motion } from 'framer-motion';
import { useAdmin } from './AdminContext';

const LowStockWidget = ({ stats = {} }) => {
    const { performanceMode } = useAdmin();
    const lowStockProducts = stats.low_stock_products || [];
    const displayProducts = lowStockProducts.slice(0, 10);

    const getBadgeColor = (qty) => {
        if (qty <= 2) return 'bg-red-500/10 text-red-500 border-red-500/20';
        return 'bg-orange-500/10 text-orange-500 border-orange-500/20';
    };

    return (
        <motion.div
            initial={performanceMode ? { opacity: 0 } : { opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="h-full flex flex-col pt-2"
        >
            {/* Header Section */}
            <div className="flex items-center justify-between mb-10">
                <div className="flex items-center gap-5">
                    <div className="relative group">
                        <div className="w-12 h-12 rounded-2xl bg-red-500/10 flex items-center justify-center text-red-500 group-hover:scale-110 transition-transform duration-500">
                            <AlertTriangle size={20} strokeWidth={2.5} />
                        </div>
                        <div className="absolute -inset-1 bg-red-500/20 blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-500 rounded-full" />
                    </div>
                    <div>
                        <h3 className="text-sm font-black text-gray-900 dark:text-white uppercase tracking-[0.1em] leading-none mb-1">
                            Low Stock
                        </h3>
                        <p className="text-[10px] text-gray-400 dark:text-[#8b949e]/40 uppercase tracking-[0.3em] font-black">
                            Alerts
                        </p>
                    </div>
                </div>
                <div className="flex flex-col items-end">
                    <span className="text-[10px] font-black text-gray-400 dark:text-[#8b949e]/30 uppercase tracking-[0.2em] mb-1">
                        Items
                    </span>
                    <div className="text-xl font-black text-red-500 tabular-nums tracking-tighter">
                        {lowStockProducts.length}
                    </div>
                </div>
            </div>

            {/* Product List */}
            <div className="flex-grow space-y-3 overflow-y-auto">
                {displayProducts.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-12 text-gray-400 dark:text-[#8b949e]/40">
                        <Package size={32} strokeWidth={1.5} className="mb-3 opacity-40" />
                        <p className="text-[10px] font-black uppercase tracking-[0.2em]">
                            All Stocked
                        </p>
                    </div>
                ) : (
                    displayProducts.map((product) => (
                        <a
                            key={product.id}
                            href={`/admin/pos-products?search=${encodeURIComponent(product.sku)}`}
                            className="flex items-center gap-4 p-4 rounded-2xl bg-[#fdfdfc] dark:bg-white/[0.02] border border-black/5 dark:border-white/5 hover:border-red-500/20 dark:hover:border-red-500/20 transition-all duration-300 group"
                        >
                            <div className="w-10 h-10 rounded-xl bg-black/[0.03] dark:bg-white/[0.03] flex items-center justify-center text-gray-400 dark:text-[#8b949e]/40 group-hover:text-red-500 group-hover:bg-red-500/10 transition-all duration-300 shrink-0">
                                <Package size={16} strokeWidth={2} />
                            </div>
                            <div className="flex-grow min-w-0">
                                <p className="text-[11px] font-black text-gray-900 dark:text-white truncate uppercase tracking-wide">
                                    {product.name}
                                    {product.variant && (
                                        <span className="text-gray-400 dark:text-[#8b949e]/40 font-black">
                                            {' '}
                                            · {product.variant}
                                        </span>
                                    )}
                                </p>
                                <p className="text-[9px] text-gray-400 dark:text-[#8b949e]/30 uppercase tracking-[0.2em] font-black mt-1">
                                    {product.category}
                                </p>
                            </div>
                            <span
                                className={`px-3 py-1.5 rounded-xl text-[10px] font-black border tabular-nums tracking-wider shrink-0 ${getBadgeColor(
                                    product.stock_qty
                                )}`}
                            >
                                {product.stock_qty}
                            </span>
                        </a>
                    ))
                )}
            </div>

            {/* Footer */}
            {displayProducts.length > 0 && (
                <div className="mt-6 pt-5 border-t border-black/5 dark:border-white/5 flex items-center justify-between">
                    <span className="text-[9px] font-black uppercase tracking-[0.2em] text-gray-400">
                        Showing {displayProducts.length} of {lowStockProducts.length}
                    </span>
                    <a
                        href="/admin/pos-products"
                        className="text-[9px] font-black text-red-500 uppercase tracking-widest hover:text-red-400 transition-colors"
                    >
                        View All →
                    </a>
                </div>
            )}
        </motion.div>
    );
};

export default LowStockWidget;
