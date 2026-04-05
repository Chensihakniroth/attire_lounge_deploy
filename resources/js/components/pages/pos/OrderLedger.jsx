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
        <div className="flex-1 flex flex-col overflow-hidden h-full bg-background dark:bg-[#0d1117]">
            {/* Header Area */}
            <div className="p-4 bg-background dark:bg-[#0d1117] border-b border-black/5 dark:border-[#30363d] sticky top-0 z-20 transition-all duration-300">
                <div className="relative group w-full">
                    <Search className="absolute left-6 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-[#0d3542] dark:group-focus-within:text-[#58a6ff] transition-colors" size={20} />
                    <input 
                        type="text" 
                        readOnly
                        onClick={onSearchClick}
                        onFocus={onSearchClick}
                        placeholder="Search product..."
                        className="w-full bg-black/[0.02] dark:bg-[#161b22] border-2 border-transparent hover:border-[#0d3542]/20 dark:hover:border-[#30363d] rounded-xl py-4 pl-14 pr-20 text-[13px] font-black uppercase tracking-[0.2em] outline-none focus:border-[#0d3542]/50 dark:focus:border-[#58a6ff]/50 focus:bg-background dark:focus:bg-[#0d1117] transition-all cursor-pointer shadow-none animate-in fade-in duration-500 placeholder:text-gray-400 dark:placeholder:text-[#8b949e]/20"
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

                            <img 
                                src="https://bucket-production-4ca0.up.railway.app/product-assets/uploads/asset/ALO.png" 
                                alt="Attire Lounge Official" 
                                className="w-64 h-auto relative z-10 brightness-110 opacity-80 cursor-default"
                            />
                        </motion.div>
                    </div>
                ) : (
                    <table className="w-full text-left border-collapse">
                        <thead className="sticky top-0 z-10 bg-[#0d3542]/5 dark:bg-[#161b22] border-b border-black/5 dark:border-[#30363d] shadow-none">
                            <tr>
                                <th className="pl-6 pr-2 py-5 text-[11px] font-black uppercase tracking-[0.25em] text-gray-400 dark:text-[#8b949e]/40 w-12">#</th>
                                <th className="px-4 py-5 text-[11px] font-black uppercase tracking-[0.25em] text-gray-400 dark:text-[#8b949e]/40 w-36">SKU</th>
                                <th className="px-4 py-5 text-[11px] font-black uppercase tracking-[0.25em] text-gray-400 dark:text-[#8b949e]/40">Product Name</th>
                                <th className="px-4 py-5 text-[11px] font-black uppercase tracking-[0.25em] text-gray-400 dark:text-[#8b949e]/40 w-40 text-center">Quantity</th>
                                <th className="px-4 py-5 text-[11px] font-black uppercase tracking-[0.25em] text-gray-400 dark:text-[#8b949e]/40 w-28 text-right">Unit Price</th>
                                <th className="px-4 py-5 text-[11px] font-black uppercase tracking-[0.25em] text-gray-400 dark:text-[#8b949e]/40 w-[180px] text-left">Disc. Override</th>
                                <th className="px-4 py-5 text-[11px] font-black uppercase tracking-[0.25em] text-gray-400 dark:text-[#8b949e]/40 w-32 text-right">Total</th>
                                <th className="px-6 py-5 text-[11px] font-black uppercase tracking-[0.25em] text-gray-400 dark:text-[#8b949e]/40 w-16 text-center"></th>
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
                                            className="group border-b border-black/5 dark:border-white/[0.02] hover:bg-black/[0.02] dark:hover:bg-white/[0.01] transition-all"
                                        >
                                            <td className="pl-6 pr-2 py-4 font-mono text-[12px] text-gray-400/50">{String(index + 1).padStart(2, '0')}</td>
                                            <td className="px-4 py-4 font-mono text-[13px] font-black text-[#0d3542] dark:text-[#58a6ff] tracking-tighter uppercase truncate">{item.product_sku || 'N/A'}</td>
                                            <td className="px-4 py-4">
                                                <div className="flex flex-col gap-0.5">
                                                    <span className="uppercase text-[16px] font-black leading-tight tracking-[0.02em] text-gray-900 dark:text-[#c9d1d9] group-hover:text-[#0d3542] dark:group-hover:text-[#58a6ff] transition-colors">{item.product_name}</span>
                                                    <div className="flex items-center gap-2">
                                                        {item.is_service && <span className="text-[9px] px-2 py-0.5 bg-blue-500/10 text-blue-400 dark:text-blue-300 rounded-md font-black uppercase tracking-widest border border-blue-400/20">Service</span>}
                                                        {item.gift_wrap && <span className="text-[9px] px-2 py-0.5 bg-[#0d3542]/10 dark:bg-[#58a6ff]/10 text-[#0d3542] dark:text-[#58a6ff] rounded-md font-black uppercase tracking-widest border border-[#0d3542]/20 dark:border-[#58a6ff]/20">Gift Wrap</span>}
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-4 py-4">
                                                <div className="flex items-center justify-center bg-black/5 dark:bg-[#161b22] rounded-xl border border-transparent p-0.5 w-32 mx-auto group-hover:border-black/5 dark:group-hover:border-[#30363d] transition-all">
                                                    <button 
                                                        onClick={() => updateQty(item.product_id, -1)}
                                                        className="p-2 hover:text-red-500 hover:bg-red-500/10 rounded-lg transition-all"
                                                    >
                                                        <Minus size={14} />
                                                    </button>
                                                    <span className="flex-1 text-center font-black text-[16px] text-gray-900 dark:text-[#c9d1d9]">{item.quantity}</span>
                                                    <button 
                                                        onClick={() => updateQty(item.product_id, 1)}
                                                        className="p-2 hover:text-[#0d3542] dark:hover:text-[#58a6ff] hover:bg-[#0d3542]/10 dark:hover:bg-[#58a6ff]/10 rounded-lg transition-all"
                                                    >
                                                        <Plus size={14} />
                                                    </button>
                                                </div>
                                            </td>
                                            <td className="px-4 py-4 text-right font-mono text-[14px] font-bold opacity-40 group-hover:opacity-100 dark:text-[#8b949e] group-hover:dark:text-[#c9d1d9] transition-opacity whitespace-nowrap">${parseFloat(item.unit_price).toLocaleString()}</td>
                                            <td className="px-4 py-4">
                                                <div className="flex items-center justify-start gap-1 p-1 bg-black/5 dark:bg-[#161b22] rounded-xl border border-transparent hover:border-black/5 dark:hover:border-[#30363d] transition-all w-fit">
                                                    {/* Mode Toggle Button */}
                                                    <button 
                                                        onClick={() => {
                                                            const newType = item.discount_type === 'percentage' ? 'price' : 'percentage';
                                                            updateItemDiscount(item.product_id, newType, item.discount_value);
                                                        }}
                                                        className={`w-8 h-8 rounded-lg flex items-center justify-start pl-2.5 text-[14px] font-black transition-all ${hasDiscount ? 'bg-[#0d3542] dark:bg-[#58a6ff] text-white dark:text-black shadow-none' : 'bg-black/5 dark:bg-[#0d1117] text-gray-400 dark:text-[#8b949e]/40 hover:text-gray-900 dark:hover:text-[#c9d1d9]'}`}
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
                                                        className={`w-14 bg-transparent text-left font-black text-[15px] outline-none transition-colors ml-1 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none ${hasDiscount ? 'text-gray-900 dark:text-[#c9d1d9]' : 'text-gray-400 dark:text-[#8b949e]/20 focus:text-gray-900 dark:focus:text-[#c9d1d9]'}`}
                                                    />
                                                </div>
                                            </td>
                                            <td className="px-4 py-4 text-right font-black text-gray-900 dark:text-[#c9d1d9] text-[18px] border-l border-black/5 dark:border-[#30363d] tracking-tighter whitespace-nowrap">
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
