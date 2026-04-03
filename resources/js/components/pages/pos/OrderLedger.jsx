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
    const { activeTab, updateQty, removeItem, addItem } = usePOS();

    return (
        <div className="flex-1 flex flex-col overflow-hidden h-full bg-[#f8f8f8] dark:bg-[#050505]">
            <div className="p-4 bg-white/80 dark:bg-[#0a0a0a]/80 border-b border-black/5 dark:border-white/5 backdrop-blur-xl sticky top-0 z-20">
                <div className="relative group w-full">
                    <Search className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-attire-accent transition-colors" size={20} />
                    <input 
                        type="text" 
                        readOnly
                        onClick={onSearchClick}
                        onFocus={onSearchClick}
                        placeholder="Search product code or name..."
                        className="w-full bg-black/[0.04] dark:bg-white/[0.04] border border-black/10 dark:border-white/10 rounded-2xl py-5 pl-14 pr-16 text-[13px] font-bold uppercase tracking-widest outline-none focus:border-attire-accent/50 focus:bg-white dark:focus:bg-black transition-all cursor-pointer shadow-inner"
                    />
                    <div className="absolute right-5 top-1/2 -translate-y-1/2 flex items-center gap-3">
                        <div className="flex items-center gap-1.5 px-2 py-1 rounded bg-black/5 dark:bg-white/10 border border-black/5 dark:border-white/20">
                            <span className="text-[9px] font-black text-gray-500 uppercase tracking-tighter">ESC</span>
                        </div>
                        <Keyboard size={18} className="text-gray-400 opacity-60" />
                    </div>
                </div>
            </div>

            {/* Active Order Ledger */}
            <div className="flex-1 overflow-y-auto attire-scrollbar p-0">
                {activeTab.cartItems.length === 0 ? (
                    <div className="h-full flex flex-col items-center justify-center text-center p-12 opacity-30">
                        <div className="w-24 h-24 rounded-[2.5rem] bg-black/5 dark:bg-white/5 flex items-center justify-center mb-6">
                            <ShoppingBag size={40} className="text-gray-400" />
                        </div>
                        <h3 className="text-[14px] font-black uppercase tracking-[0.3em] mb-2 dark:text-white">Empty Order</h3>
                        <p className="text-[10px] uppercase tracking-widest text-gray-500">Scan items or use search to build invoice</p>
                        <button 
                            onClick={onSearchClick}
                            className="mt-8 flex items-center gap-2 px-6 py-3 bg-black/5 dark:bg-white/5 rounded-xl border border-black/10 dark:border-white/10 text-[9px] font-black uppercase tracking-widest hover:bg-attire-accent hover:text-black transition-all group"
                        >
                            Open Browser <ArrowRight size={12} className="group-hover:translate-x-1 transition-transform" />
                        </button>
                    </div>
                ) : (
                    <table className="w-full text-left border-collapse">
                        <thead className="sticky top-0 z-10 bg-gray-50 dark:bg-[#111] border-b border-black/10 dark:border-white/10 shadow-sm">
                            <tr>
                                <th className="pl-6 pr-2 py-4 text-[9px] font-black uppercase tracking-widest text-gray-400 w-12">#</th>
                                <th className="px-4 py-4 text-[9px] font-black uppercase tracking-widest text-gray-400 w-32">SKU / Code</th>
                                <th className="px-4 py-4 text-[9px] font-black uppercase tracking-widest text-gray-400">Description</th>
                                <th className="px-4 py-4 text-[9px] font-black uppercase tracking-widest text-gray-400 w-32 text-center">Quantity</th>
                                <th className="px-4 py-4 text-[9px] font-black uppercase tracking-widest text-gray-400 w-24 text-right">Unit</th>
                                <th className="px-4 py-4 text-[9px] font-black uppercase tracking-widest text-gray-400 w-24 text-right">Disc.</th>
                                <th className="px-4 py-4 text-[9px] font-black uppercase tracking-widest text-gray-400 w-24 text-right">Total</th>
                                <th className="px-6 py-4 text-[9px] font-black uppercase tracking-widest text-gray-400 w-16 text-center"></th>
                            </tr>
                        </thead>
                        <tbody className="text-[12px] font-bold text-gray-700 dark:text-white/80">
                            <AnimatePresence mode="popLayout">
                                {activeTab.cartItems.map((item, index) => {
                                    const rowTotal = (item.unit_price * item.quantity);
                                    const discountAmount = item.discount_type === 'percentage' 
                                        ? (rowTotal * (item.discount_value / 100))
                                        : (item.discount_type === 'price' ? item.discount_value : 0);
                                    const finalTotal = Math.max(0, rowTotal - discountAmount);

                                    return (
                                        <motion.tr 
                                            layout
                                            initial={{ opacity: 0, y: 10 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            exit={{ opacity: 0, x: -20 }}
                                            key={item.product_id}
                                            className="group border-b border-black/5 dark:border-white/[0.03] hover:bg-white dark:hover:bg-white/[0.02] transition-colors"
                                        >
                                            <td className="pl-6 pr-2 py-5 font-mono text-[10px] text-gray-400">{index + 1}</td>
                                            <td className="px-4 py-5 font-mono text-[11px] text-attire-accent tracking-tighter uppercase">{item.product_sku}</td>
                                            <td className="px-4 py-5">
                                                <div className="flex flex-col gap-0.5">
                                                    <span className="uppercase text-[12px] font-black leading-tight">{item.product_name}</span>
                                                    <div className="flex items-center gap-2">
                                                        {item.is_service && <span className="text-[8px] px-1 py-0.5 bg-blue-500/10 text-blue-400 rounded-sm">Service</span>}
                                                        {item.gift_wrap && <span className="text-[8px] px-1 py-0.5 bg-attire-accent/10 text-attire-accent rounded-sm">Gift Wrap</span>}
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-4 py-5">
                                                <div className="flex items-center justify-center bg-black/5 dark:bg-white/5 rounded-xl border border-black/5 dark:border-white/10 p-1 w-24 mx-auto group-hover:bg-white dark:group-hover:bg-black transition-all">
                                                    <button 
                                                        onClick={() => updateQty(item.product_id, -1)}
                                                        className="p-1 hover:text-red-400 transition-colors"
                                                    >
                                                        <Minus size={12} />
                                                    </button>
                                                    <span className="flex-1 text-center font-black text-[12px]">{item.quantity}</span>
                                                    <button 
                                                        onClick={() => updateQty(item.product_id, 1)}
                                                        className="p-1 hover:text-attire-accent transition-colors"
                                                    >
                                                        <Plus size={12} />
                                                    </button>
                                                </div>
                                            </td>
                                            <td className="px-4 py-5 text-right font-mono text-[11px] opacity-60">${parseFloat(item.unit_price).toLocaleString()}</td>
                                            <td className="px-4 py-5 text-right">
                                                <span className={`text-[10px] font-black ${discountAmount > 0 ? 'text-red-400' : 'text-gray-400 opacity-20'}`}>
                                                    {discountAmount > 0 ? `-$${discountAmount.toLocaleString()}` : '$0.00'}
                                                </span>
                                            </td>
                                            <td className="px-4 py-5 text-right font-black text-gray-900 dark:text-white text-[13px] border-l border-black/5 dark:border-white/5">
                                                ${finalTotal.toLocaleString()}
                                            </td>
                                            <td className="px-6 py-5 text-center">
                                                <button 
                                                    onClick={() => removeItem(item.product_id)}
                                                    className="p-2 text-gray-300 hover:text-red-500 hover:bg-red-500/10 rounded-lg transition-all opacity-0 group-hover:opacity-100"
                                                >
                                                    <Trash2 size={14} />
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
