import React, { useState } from 'react';
import { 
    Trash2, 
    Plus, 
    Minus, 
    Tag, 
    Gift, 
    ChevronDown, 
    ChevronUp,
    Percent,
    DollarSign
} from 'lucide-react';
import { usePOS } from './POSContext';
import { motion, AnimatePresence } from 'framer-motion';

const CartItem = ({ item }) => {
    const { updateQty, removeItem, updateItemDiscount, toggleGiftWrap } = usePOS();
    const [isMenuOpen, setIsMenuOpen] = useState(false);

    const discountAmount = item.discount_type === 'percentage' 
        ? (item.unit_price * item.quantity * (item.discount_value / 100))
        : (item.discount_type === 'price' ? item.discount_value : 0);

    const finalPrice = Math.max(0, (item.unit_price * item.quantity) - discountAmount);

    return (
        <motion.div
            layout
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className={`group bg-background dark:bg-white/[0.03] border border-black/15 dark:border-white/10 rounded-2xl p-3 transition-all hover:bg-background/80 dark:hover:bg-white/[0.05] relative ${isMenuOpen ? 'ring-1 ring-attire-accent/30 shadow-none' : 'shadow-none'}`}
        >
            <div className="flex items-start gap-3">
                {/* Quantity Controls */}
                <div className="flex flex-col items-center gap-1 bg-black/[0.03] dark:bg-white/[0.03] rounded-xl p-1 border border-black/15 dark:border-white/10 flex-shrink-0 group-hover:bg-background dark:group-hover:bg-black transition-colors">
                    <button 
                        onClick={() => updateQty(item.product_id, 1)}
                        className="p-1 hover:text-attire-accent transition-colors active:scale-110"
                    >
                        <Plus size={10} />
                    </button>
                    <span className="text-[10px] font-bold text-gray-900 dark:text-white group-hover:scale-110 transition-transform">
                        {item.quantity}
                    </span>
                    <button 
                        onClick={() => updateQty(item.product_id, -1)}
                        className="p-1 hover:text-red-400 transition-colors active:scale-110"
                    >
                        <Minus size={10} />
                    </button>
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0 pr-8">
                    <div className="flex items-center gap-2 mb-0.5">
                        <span className="text-[7px] font-bold uppercase tracking-widest text-gray-400">
                            {item.product_sku || 'NO SKU'}
                        </span>
                        {item.is_service && (
                            <span className="px-1 py-0.5 bg-blue-500/10 text-blue-400 text-[6px] font-bold rounded-sm uppercase tracking-tighter">Service</span>
                        )}
                        {item.gift_wrap && (
                            <span className="px-1 py-0.5 bg-attire-accent text-black text-[6px] font-bold rounded-sm uppercase tracking-tighter animate-pulse flex items-center gap-1">
                                <Gift size={6} /> Gift Wrapped
                            </span>
                        )}
                    </div>
                    
                    <h4 className="text-[10px] font-bold uppercase tracking-wider text-gray-900 dark:text-white line-clamp-1 group-hover:text-attire-accent transition-colors">
                        {item.product_name}
                    </h4>
                    
                    <div className="flex items-center gap-3 mt-1">
                        <div className="flex flex-col">
                            <span className="text-[11px] font-bold text-gray-900 dark:text-white">
                                ${finalPrice.toLocaleString()}
                            </span>
                            {discountAmount > 0 && (
                                <span className="text-[8px] text-gray-400 line-through">
                                    ${(item.unit_price * item.quantity).toLocaleString()}
                                </span>
                            )}
                        </div>
                        {item.discount_value > 0 && (
                            <span className="text-[8px] font-bold uppercase tracking-widest text-attire-accent">
                                -{item.discount_type === 'percentage' ? `${item.discount_value}%` : `$${item.discount_value}`}
                            </span>
                        )}
                    </div>
                </div>

                {/* Remove Button (Top corner) */}
                <button 
                    onClick={() => removeItem(item.product_id)}
                    className="absolute top-2 right-2 p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-500/10 rounded-lg transition-all opacity-0 group-hover:opacity-100"
                >
                    <Trash2 size={12} />
                </button>

                {/* More Options Trigger */}
                <button 
                    onClick={() => setIsMenuOpen(!isMenuOpen)}
                    className={`absolute bottom-2 right-2 p-1 rounded-lg transition-all ${isMenuOpen ? 'bg-attire-accent text-black' : 'text-gray-400 hover:text-white hover:bg-white/10'}`}
                >
                    {isMenuOpen ? <ChevronUp size={12} /> : <ChevronDown size={12} />}
                </button>
            </div>

            {/* Expanded Menu for Item Specific Controls */}
            <AnimatePresence>
                {isMenuOpen && (
                    <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        className="overflow-hidden bg-black/5 dark:bg-white/[0.02] mt-3 rounded-xl border-t border-black/15 dark:border-white/10"
                    >
                        <div className="p-3 grid grid-cols-2 gap-3">
                            {/* Discount Controls */}
                            <div className="space-y-2">
                                <span className="text-[8px] font-bold uppercase tracking-widest text-gray-500 dark:text-gray-400 flex items-center gap-1">
                                    <Tag size={8} /> Item Discount
                                </span>
                                <div className="flex items-center bg-background dark:bg-black rounded-lg border border-black/15 dark:border-white/10 overflow-hidden">
                                    <button 
                                        onClick={() => updateItemDiscount(item.product_id, item.discount_type === 'percentage' ? 'none' : 'percentage', item.discount_value)}
                                        className={`p-2 transition-colors ${item.discount_type === 'percentage' ? 'bg-attire-accent text-black' : 'text-gray-400'}`}
                                    >
                                        <Percent size={10} />
                                    </button>
                                    <button 
                                        onClick={() => updateItemDiscount(item.product_id, item.discount_type === 'price' ? 'none' : 'price', item.discount_value)}
                                        className={`p-2 transition-colors border-l border-black/5 dark:border-white/10 ${item.discount_type === 'price' ? 'bg-attire-accent text-black' : 'text-gray-400'}`}
                                    >
                                        <DollarSign size={10} />
                                    </button>
                                    <input 
                                        type="number"
                                        placeholder="0"
                                        className="w-full bg-transparent border-none outline-none text-[10px] font-bold px-2 text-center"
                                        value={item.discount_value || ''}
                                        onChange={(e) => updateItemDiscount(item.product_id, item.discount_type, e.target.value)}
                                    />
                                </div>
                            </div>

                            {/* Options Control */}
                            <div className="space-y-2">
                                <span className="text-[8px] font-bold uppercase tracking-widest text-gray-500 dark:text-gray-400 flex items-center gap-1">
                                    <Gift size={8} /> Options
                                </span>
                                {!item.is_accessory ? (
                                    <div className="p-2 text-[8px] uppercase tracking-widest text-gray-400 italic">No options available</div>
                                ) : (
                                    <button 
                                        onClick={() => toggleGiftWrap(item.product_id)}
                                        className={`w-full flex items-center justify-center gap-2 py-2 px-3 rounded-lg border transition-all text-[9px] font-bold uppercase tracking-widest ${
                                            item.gift_wrap 
                                                ? 'bg-attire-accent border-attire-accent text-black shadow-none' 
                                                : 'bg-background dark:bg-black border-black/15 dark:border-white/10 text-gray-400'
                                        }`}
                                    >
                                        <Gift size={10} />
                                        Gift Wrap
                                    </button>
                                )}
                            </div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </motion.div>
    );
};

export default CartItem;
