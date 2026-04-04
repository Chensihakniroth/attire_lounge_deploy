import React from 'react';
import { 
    Search, 
    Keyboard, 
    Trash2, 
    Plus, 
    Minus, 
    ShoppingBag, 
    ArrowRight,
    Tag,
    Gift,
    Hash
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { usePOS } from './POSContext';

const OrderLedger = ({ onSearchClick }) => {
    const { activeTab, updateQty, removeItem, addItem, updateItemDiscount } = usePOS();

    return (
        <div className="flex-1 flex flex-col overflow-hidden h-full bg-[#f8f8f8] dark:bg-[#050505]">
            {/* Header Area */}
            <div className="p-4 bg-white/80 dark:bg-[#0a0a0a]/80 border-b border-black/5 dark:border-white/5 backdrop-blur-xl sticky top-0 z-20 transition-all duration-300">
                <div className="relative group w-full">
                    <Search className="absolute left-6 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-attire-accent transition-colors" size={20} />
                    <input 
                        type="text" 
                        readOnly
                        onClick={onSearchClick}
                        onFocus={onSearchClick}
                        placeholder="Search product..."
                        className="w-full bg-black/[0.04] dark:bg-white/[0.04] border-2 border-transparent hover:border-black/5 dark:hover:border-white/5 rounded-xl py-4 pl-14 pr-20 text-[13px] font-black uppercase tracking-[0.2em] outline-none focus:border-attire-accent/50 focus:bg-white dark:focus:bg-black transition-all cursor-pointer shadow-inner animate-in fade-in duration-500"
                    />
                    <div className="absolute right-5 top-1/2 -translate-y-1/2 flex items-center gap-3">
                        <div className="flex items-center gap-1.5 px-2 py-1 rounded bg-black/5 dark:bg-white/10 border border-black/5 dark:border-white/20">
                            <span className="text-[9px] font-black text-gray-500 uppercase tracking-tighter">ESC</span>
                        </div>
                        <Keyboard size={18} className="text-gray-400 opacity-40" />
                    </div>
                </div>
            </div>

            {/* Active Order Ledger */}
            <div className="flex-1 overflow-y-auto attire-scrollbar p-0">
                {activeTab.cartItems.length === 0 ? (
                    <div className="h-full flex flex-col items-center justify-center text-center p-12">
                        <motion.div 
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ duration: 1.5, ease: "easeOut" }}
                            className="relative"
                        >
                            <div className="absolute inset-0 bg-attire-accent/10 blur-[100px] rounded-full scale-150" />
                            <img 
                                src="https://bucket-production-4ca0.up.railway.app/product-assets/uploads/asset/ALO.png" 
                                alt="Attire Lounge Official" 
                                className="w-64 h-auto relative z-10 brightness-110 opacity-80 cursor-default"
                            />
                        </motion.div>
                    </div>
                ) : (
                    <table className="w-full text-left border-collapse">
                        <thead className="sticky top-0 z-10 bg-gray-50/90 dark:bg-[#0a0a0a]/90 backdrop-blur-xl border-b border-black/5 dark:border-white/5 shadow-sm">
                            <tr>
                                <th className="pl-6 pr-2 py-5 text-[11px] font-black uppercase tracking-[0.25em] text-gray-400 w-12">#</th>
                                <th className="px-4 py-5 text-[11px] font-black uppercase tracking-[0.25em] text-gray-400 w-36">SKU</th>
                                <th className="px-4 py-5 text-[11px] font-black uppercase tracking-[0.25em] text-gray-400">Product Name</th>
                                <th className="px-4 py-5 text-[11px] font-black uppercase tracking-[0.25em] text-gray-400 w-40 text-center">Quantity</th>
                                <th className="px-4 py-5 text-[11px] font-black uppercase tracking-[0.25em] text-gray-400 w-28 text-right">Unit Price</th>
                                <th className="px-4 py-5 text-[11px] font-black uppercase tracking-[0.25em] text-gray-400 w-[180px] text-left">Disc. Override</th>
                                <th className="px-4 py-5 text-[11px] font-black uppercase tracking-[0.25em] text-gray-400 w-32 text-right">Total</th>
                                <th className="px-6 py-5 text-[11px] font-black uppercase tracking-[0.25em] text-gray-400 w-16 text-center"></th>
                            </tr>
                        </thead>
                        <tbody className="text-[13px] font-bold text-gray-700 dark:text-white/80">
                            <AnimatePresence mode="popLayout">
                                {activeTab.cartItems.map((item, index) => {
                                    const rowTotal = (item.unit_price * item.quantity);
                                    const discountAmount = item.discount_type === 'percentage' 
                                        ? (rowTotal * (item.discount_value / 100))
                                        : (item.discount_type === 'price' ? item.discount_value : 0);
                                    const finalTotal = Math.max(0, rowTotal - discountAmount);
                                    const hasDiscount = item.discount_value > 0;

                                    return (
                                        <motion.tr 
                                            layout
                                            initial={{ opacity: 0, y: 5 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            exit={{ opacity: 0, x: -20 }}
                                            key={item.product_id}
                                            className="group border-b border-black/5 dark:border-white/[0.02] hover:bg-white dark:hover:bg-white/[0.01] transition-all"
                                        >
                                            <td className="pl-6 pr-2 py-4 font-mono text-[12px] text-gray-400/50">{String(index + 1).padStart(2, '0')}</td>
                                            <td className="px-4 py-4 font-mono text-[13px] font-black text-attire-accent tracking-tighter uppercase truncate">{item.product_sku || 'N/A'}</td>
                                            <td className="px-4 py-4">
                                                <div className="flex flex-col gap-0.5">
                                                    <span className="uppercase text-[16px] font-black leading-tight tracking-[0.02em] text-gray-900 dark:text-white group-hover:text-attire-accent transition-colors">{item.product_name}</span>
                                                    <div className="flex items-center gap-2">
                                                        {item.is_service && <span className="text-[9px] px-2 py-0.5 bg-blue-500/10 text-blue-400 rounded-md font-black uppercase tracking-widest border border-blue-400/20">Service</span>}
                                                        {item.gift_wrap && <span className="text-[9px] px-2 py-0.5 bg-attire-accent/10 text-attire-accent rounded-md font-black uppercase tracking-widest border border-attire-accent/20">Gift Wrap</span>}
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-4 py-4">
                                                <div className="flex items-center justify-center bg-black/5 dark:bg-white/5 rounded-xl border border-transparent p-0.5 w-32 mx-auto group-hover:border-black/5 dark:group-hover:border-white/5 transition-all">
                                                    <button 
                                                        onClick={() => updateQty(item.product_id, -1)}
                                                        className="p-2 hover:text-red-500 hover:bg-red-500/10 rounded-lg transition-all"
                                                    >
                                                        <Minus size={14} />
                                                    </button>
                                                    <span className="flex-1 text-center font-black text-[16px] text-gray-900 dark:text-white">{item.quantity}</span>
                                                    <button 
                                                        onClick={() => updateQty(item.product_id, 1)}
                                                        className="p-2 hover:text-attire-accent hover:bg-attire-accent/10 rounded-lg transition-all"
                                                    >
                                                        <Plus size={14} />
                                                    </button>
                                                </div>
                                            </td>
                                            <td className="px-4 py-4 text-right font-mono text-[14px] font-bold opacity-40 group-hover:opacity-100 transition-opacity whitespace-nowrap">${parseFloat(item.unit_price).toLocaleString()}</td>
                                            <td className="px-4 py-4">
                                                <div className="flex items-center justify-start gap-1 p-1 bg-black/5 dark:bg-white/5 rounded-xl border border-transparent hover:border-black/5 dark:hover:border-white/10 transition-all w-fit">
                                                    {/* Mode Toggle Button */}
                                                    <button 
                                                        onClick={() => {
                                                            const newType = item.discount_type === 'percentage' ? 'price' : 'percentage';
                                                            updateItemDiscount(item.product_id, newType, item.discount_value);
                                                        }}
                                                        className={`w-8 h-8 rounded-lg flex items-center justify-start pl-2.5 text-[14px] font-black transition-all ${hasDiscount ? 'bg-attire-accent text-black shadow-lg shadow-attire-accent/20' : 'bg-black/5 dark:bg-white/10 text-gray-400 hover:text-gray-900 dark:hover:text-white'}`}
                                                    >
                                                        {item.discount_type === 'percentage' ? '%' : '$'}
                                                    </button>
                                                    
                                                    {/* Numeric Input */}
                                                    <input 
                                                        type="number"
                                                        min="0"
                                                        placeholder="0"
                                                        value={item.discount_value || ''}
                                                        onChange={(e) => {
                                                            const val = Math.max(0, parseFloat(e.target.value) || 0);
                                                            updateItemDiscount(item.product_id, item.discount_type || 'percentage', val);
                                                        }}
                                                        className={`w-14 bg-transparent text-left font-black text-[15px] outline-none transition-colors ml-1 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none ${hasDiscount ? 'text-gray-900 dark:text-white' : 'text-gray-400 focus:text-gray-900 dark:focus:text-white'}`}
                                                    />
                                                </div>
                                            </td>
                                            <td className="px-4 py-4 text-right font-black text-gray-900 dark:text-white text-[18px] border-l border-black/5 dark:border-white/5 tracking-tighter whitespace-nowrap">
                                                ${finalTotal.toLocaleString()}
                                            </td>
                                            <td className="px-6 py-4 text-center">
                                                <button 
                                                    onClick={() => removeItem(item.product_id)}
                                                    className="p-2.5 text-gray-200 dark:text-white/10 hover:text-red-500 hover:bg-red-500/10 rounded-xl transition-all opacity-0 group-hover:opacity-100"
                                                >
                                                    <Trash2 size={16} />
                                                </button>
                                            </td>
                                        </motion.tr>
                                    );
                                })}
                            </AnimatePresence>
                        </tbody>
                    </table>
                )}
            </div>
        </div>
    );
};

export default OrderLedger;
