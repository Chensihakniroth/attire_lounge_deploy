import React from 'react';
import { motion } from 'framer-motion';
import { Tag, Hash, Package, DollarSign } from 'lucide-react';

const ProductRow = ({ product, onClick }) => {
    // Format price
    const formattedPrice = new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'USD',
    }).format(product.price || 0);

    return (
        <motion.div
            layout
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, scale: 0.95 }}
            whileTap={{ scale: 0.98, backgroundColor: 'rgba(245, 168, 28, 0.1)' }}
            onClick={onClick}
            className="group flex items-center gap-4 px-6 py-3.5 bg-white/50 dark:bg-white/[0.03] border border-black/5 dark:border-white/5 hover:border-attire-accent/30 rounded-2xl transition-all cursor-pointer select-none mb-2"
        >
            {/* SKU / Code */}
            <div className="w-32 flex-shrink-0 border-r border-black/5 dark:border-white/5 pr-4">
                <div className="flex items-center gap-2">
                    <Hash size={10} className="text-attire-accent opacity-40 group-hover:opacity-100 transition-opacity" />
                    <span className="text-[10px] font-mono font-black tracking-widest text-attire-accent">
                        {product.sku}
                    </span>
                </div>
                <div className="text-[8px] uppercase tracking-tighter text-gray-400 font-bold mt-0.5">
                    Product Code
                </div>
            </div>

            {/* Product Info */}
            <div className="flex-1 min-w-0 border-r border-black/5 dark:border-white/5 px-2">
                <div className="text-[11px] font-black uppercase tracking-wider text-gray-900 dark:text-white truncate group-hover:text-attire-accent transition-colors">
                    {product.name}
                </div>
                <div className="text-[9px] uppercase tracking-tighter text-gray-400 font-bold flex items-center gap-2 mt-0.5">
                    <span className="truncate">{product.variant || 'Standard'}</span>
                    <span className="opacity-20">|</span>
                    <span className="text-attire-accent/60 italic">{product.tier || 'Standard Tier'}</span>
                </div>
            </div>

            {/* Category */}
            <div className="w-28 hidden md:flex flex-col border-r border-black/5 dark:border-white/5 px-2 flex-shrink-0">
                <div className="text-[9px] font-black uppercase tracking-widest text-gray-400 flex items-center gap-2">
                    <Package size={10} className="opacity-30" />
                    {product.category}
                </div>
                <div className="text-[8px] uppercase tracking-tighter text-gray-400/40 font-bold mt-0.5">
                    Classification
                </div>
            </div>

            {/* Price */}
            <div className="w-24 text-right pl-4">
                <div className="text-xs font-mono font-black text-gray-900 dark:text-white">
                    {formattedPrice}
                </div>
                <div className="text-[8px] uppercase tracking-tighter text-attire-accent font-black mt-0.5">
                    Unit Price
                </div>
            </div>

            {/* Add Indicator */}
            <div className="w-8 flex justify-center opacity-0 group-hover:opacity-100 transition-all">
                <div className="w-6 h-6 rounded-lg bg-attire-accent text-black flex items-center justify-center">
                    <span className="text-[14px] font-black">+</span>
                </div>
            </div>
        </motion.div>
    );
};

export default ProductRow;
