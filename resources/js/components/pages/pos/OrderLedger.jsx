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
    Hash,
    Undo2
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { usePOS } from './POSContext';

const OrderLedger = ({ onSearchClick }) => {
    const { activeTab, updateQty, removeItem, addItem, updateItemDiscount, selectAllRefundItems } = usePOS();
    const isRefund = activeTab.isRefundMode;

    return (
        <div className={`flex-1 flex flex-col overflow-hidden h-full bg-background dark:bg-[#0d1117] transition-all duration-500 ${isRefund ? 'ring-inset ring-2 ring-red-500/20' : ''}`}>

            {/* Header Area */}
            <div className={`p-4 bg-background dark:bg-[#0d1117] border-b border-black/5 dark:border-[#30363d] sticky top-0 z-20 transition-all duration-300`}>
                {isRefund ? (
                    <div className="flex items-center justify-between gap-4 p-1">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-xl bg-red-500/10 flex items-center justify-center text-red-500">
                                <Undo2 size={20} />
                            </div>
                            <div>
                                <h4 className="text-[11px] font-black uppercase tracking-[0.2em] text-gray-900 dark:text-white">Refund Selection</h4>
                                <p className="text-[9px] text-gray-500 uppercase tracking-widest font-bold">Pick items to return from Invoice #{activeTab.originalInvoice?.invoice_number}</p>
                            </div>
                        </div>
                        
                        <button 
                            onClick={selectAllRefundItems}
                            className="flex items-center gap-2 px-6 py-3 rounded-xl bg-red-500 text-white text-[10px] font-black uppercase tracking-[0.2em] hover:bg-red-600 transition-all shadow-lg shadow-red-500/20 active:scale-95"
                        >
                            <Plus size={14} className="rotate-45" /> Select All Items
                        </button>
                    </div>
                ) : (
                    <div className="relative group w-full">
                        <Search className="absolute left-6 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-[#0d3542] dark:group-focus-within:text-[#58a6ff] transition-colors" size={20} />
                        <input 
                            type="text" 
                            placeholder="Scan or Search product SKU..."
                            className="w-full bg-black/[0.02] dark:bg-[#161b22] border-2 border-transparent hover:border-[#0d3542]/20 dark:hover:border-[#30363d] rounded-xl py-4 pl-14 pr-20 text-[13px] font-black uppercase tracking-[0.2em] outline-none focus:border-[#0d3542]/50 dark:focus:border-[#58a6ff]/50 focus:bg-background dark:focus:bg-[#0d1117] transition-all shadow-none animate-in fade-in duration-500 placeholder:text-gray-400 dark:placeholder:text-[#8b949e]/20"
                        />
                        <button 
                            onClick={onSearchClick}
                            className="absolute right-3 top-1/2 -translate-y-1/2 p-2.5 rounded-xl bg-[#0d3542]/10 dark:bg-[#58a6ff]/10 text-[#0d3542] dark:text-[#58a6ff] hover:bg-[#0d3542] dark:hover:bg-[#58a6ff] hover:text-white dark:hover:text-[#0d1117] transition-all flex items-center justify-center group/btn shadow-lg shadow-black/5"
                            title="Open Product Catalog"
                        >
                            <Search size={18} className="transition-transform group-hover/btn:scale-110" />
                        </button>
                    </div>
                )}
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
                                <th className="px-4 py-5 text-[11px] font-black uppercase tracking-[0.25em] text-gray-400 dark:text-[#8b949e]/40 w-40 text-center">Qty / Balance</th>
                                <th className="px-4 py-5 text-[11px] font-black uppercase tracking-[0.25em] text-gray-400 dark:text-[#8b949e]/40 w-28 text-right">Unit Price</th>
                                <th className="px-4 py-5 text-[11px] font-black uppercase tracking-[0.25em] text-gray-400 dark:text-[#8b949e]/40 w-[180px] text-left">Disc. Override</th>
                                <th className="px-4 py-5 text-[11px] font-black uppercase tracking-[0.25em] text-gray-400 dark:text-[#8b949e]/40 w-32 text-right">Total</th>
                                <th className="px-6 py-5 text-[11px] font-black uppercase tracking-[0.25em] text-gray-400 dark:text-[#8b949e]/40 w-16 text-center"></th>
                            </tr>
                        </thead>
                        <tbody className="text-[13px] font-bold text-gray-700 dark:text-white/80">
                            <AnimatePresence mode="popLayout">
                                {activeTab.cartItems
                                    .filter(item => !item.is_service)
                                    .map((item, index) => {
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
                                                animate={{ opacity: item.is_fully_refunded ? 0.4 : 1, y: 0 }}
                                                exit={{ opacity: 0, x: -20 }}
                                                key={item.cart_item_id}
                                                className={`group border-b border-black/5 dark:border-white/[0.02] hover:bg-black/[0.02] dark:hover:bg-white/[0.01] transition-all ${item.is_fully_refunded ? 'bg-black/5 dark:bg-white/5 grayscale pointer-events-none' : ''}`}
                                            >
                                                <td className="pl-6 pr-2 py-4 font-mono text-[12px] text-gray-400/50 dark:text-[#8b949e]/40">{String(index + 1).padStart(2, '0')}</td>
                                                <td className="px-4 py-4 font-mono text-[13px] font-black text-[#0d3542] dark:text-[#58a6ff] tracking-tighter uppercase truncate">{item.product_sku || 'N/A'}</td>
                                                <td className="px-4 py-4">
                                                    <div className="flex flex-col gap-0.5">
                                                        <div className="flex items-center gap-2">
                                                            <span className="uppercase text-[16px] font-black leading-tight tracking-[0.02em] text-gray-900 dark:text-[#c9d1d9] group-hover:text-[#0d3542] dark:group-hover:text-[#58a6ff] transition-colors">{item.product_name}</span>
                                                            {item.is_fully_refunded && (
                                                                <span className="text-[8px] px-2 py-0.5 bg-red-500 text-white rounded-md font-black uppercase tracking-widest">Fully Refunded</span>
                                                            )}
                                                            {!item.is_fully_refunded && item.past_refunded_qty > 0 && (
                                                                <span className="text-[8px] px-2 py-0.5 bg-orange-500/10 text-orange-500 border border-orange-500/20 rounded-md font-black uppercase tracking-widest">
                                                                    {item.past_refunded_qty} Units Returned
                                                                </span>
                                                            )}
                                                        </div>
                                                        <div className="flex items-center gap-2">
                                                            {item.gift_wrap && <span className="text-[9px] px-2 py-0.5 bg-[#0d3542]/10 dark:bg-[#58a6ff]/10 text-[#0d3542] dark:text-[#58a6ff] rounded-md font-black uppercase tracking-widest border border-[#0d3542]/20 dark:border-[#58a6ff]/20">Gift Wrap</span>}
                                                            {item.total_original_qty > 0 && (
                                                                <span className="text-[9px] text-gray-400 font-bold uppercase tracking-widest">
                                                                    Original Order: {item.total_original_qty} units
                                                                </span>
                                                            )}
                                                        </div>
                                                    </div>
                                                </td>
                                                <td className="px-4 py-4">
                                                    <div className="flex items-center justify-center bg-black/5 dark:bg-[#161b22] rounded-xl border border-transparent p-0.5 w-32 mx-auto group-hover:border-black/5 dark:group-hover:border-[#30363d] transition-all">
                                                        <button 
                                                            onClick={() => updateQty(item.cart_item_id, -1)}
                                                            className="p-2 hover:text-red-500 hover:bg-red-500/10 rounded-lg transition-all"
                                                        >
                                                            <Minus size={14} />
                                                        </button>
                                                        <span className="flex-1 text-center font-black text-[16px] text-gray-900 dark:text-[#c9d1d9]">{item.quantity}</span>
                                                        <button 
                                                            onClick={() => updateQty(item.cart_item_id, 1)}
                                                            className="p-2 hover:text-[#0d3542] dark:hover:text-[#58a6ff] hover:bg-[#0d3542]/10 dark:hover:bg-[#58a6ff]/10 rounded-lg transition-all"
                                                        >
                                                            <Plus size={14} />
                                                        </button>
                                                    </div>
                                                </td>
                                                <td className="px-4 py-4 text-right font-mono text-[14px] font-bold opacity-40 group-hover:opacity-100 dark:text-[#8b949e] group-hover:dark:text-[#c9d1d9] transition-opacity whitespace-nowrap">${parseFloat(item.unit_price).toLocaleString()}</td>
                                                <td className="px-4 py-4">
                                                    <div className="flex items-center justify-start gap-1 p-1 bg-black/5 dark:bg-[#161b22] rounded-xl border border-transparent hover:border-black/5 dark:hover:border-[#30363d] transition-all w-fit">
                                                        <button 
                                                            onClick={() => {
                                                                const newType = item.discount_type === 'percentage' ? 'price' : 'percentage';
                                                                updateItemDiscount(item.cart_item_id, newType, item.discount_value);
                                                            }}
                                                            className={`w-8 h-8 rounded-lg flex items-center justify-start pl-2.5 text-[14px] font-black transition-all ${hasDiscount ? 'bg-[#0d3542] dark:bg-[#58a6ff] text-white dark:text-black shadow-none' : 'bg-black/5 dark:bg-[#0d1117] text-gray-400 dark:text-[#8b949e]/40 hover:text-gray-900 dark:hover:text-[#c9d1d9]'}`}
                                                        >
                                                            {item.discount_type === 'percentage' ? '%' : '$'}
                                                        </button>
                                                        <input 
                                                            type="number"
                                                            min="0"
                                                            placeholder="0"
                                                            value={item.discount_value || ''}
                                                            onChange={(e) => {
                                                                const val = Math.max(0, parseFloat(e.target.value) || 0);
                                                                updateItemDiscount(item.cart_item_id, item.discount_type || 'percentage', val);
                                                            }}
                                                            className={`w-14 bg-transparent text-left font-black text-[15px] outline-none transition-colors ml-1 [appearance:textfield] ${hasDiscount ? 'text-gray-900 dark:text-[#c9d1d9]' : 'text-gray-400 dark:text-[#8b949e]/40 focus:text-gray-900 dark:focus:text-[#c9d1d9]'}`}
                                                        />
                                                    </div>
                                                </td>
                                                <td className="px-4 py-4 text-right font-black text-gray-900 dark:text-[#c9d1d9] text-[18px] border-l border-black/5 dark:border-[#30363d] tracking-tighter whitespace-nowrap">
                                                    ${finalTotal.toLocaleString()}
                                                </td>
                                                <td className="px-6 py-4 text-center">
                                                    <button 
                                                        onClick={() => removeItem(item.cart_item_id)}
                                                        className="p-2.5 text-gray-200 dark:text-[#8b949e]/40 hover:text-red-500 hover:bg-red-500/10 rounded-xl transition-all opacity-0 group-hover:opacity-100"
                                                    >
                                                        <Trash2 size={16} />
                                                    </button>
                                                </td>
                                            </motion.tr>
                                        );
                                    })}

                                {/* Service Add-ons Section Divider */}
                                {activeTab.cartItems.some(i => i.is_service) && (
                                    <tr className="bg-black/2 dark:bg-white/2 border-y border-black/10 dark:border-white/10">
                                        <td colSpan={8} className="px-6 py-2.5 text-[10px] font-black uppercase tracking-[0.4em] text-[#0d3542] dark:text-[#58a6ff]">Add-on Services</td>
                                    </tr>
                                )}

                                {activeTab.cartItems
                                    .filter(item => item.is_service)
                                    .map((item, index) => (
                                        <motion.tr 
                                            layout
                                            initial={{ opacity: 0, scale: 0.98 }}
                                            animate={{ opacity: 1, scale: 1 }}
                                            key={item.cart_item_id}
                                            className="group border-b border-black/5 dark:border-white/2 hover:bg-blue-500/2 transition-all"
                                        >
                                            <td className="pl-6 pr-2 py-4 font-mono text-[10px] text-blue-500/30">ADD</td>
                                            <td className="px-4 py-4 font-mono text-[13px] font-black text-blue-500/60 tracking-tighter uppercase truncate">{item.product_sku || 'N/A'}</td>
                                            <td className="px-4 py-4">
                                                <div className="flex flex-col">
                                                    <span className="uppercase text-[16px] font-black leading-tight tracking-[0.02em] text-gray-900 dark:text-[#c9d1d9] group-hover:text-blue-400 transition-colors">{item.product_name}</span>
                                                    <span className="text-[8px] font-black uppercase tracking-widest text-blue-400/60">+ Service Add-on</span>
                                                </div>
                                            </td>
                                            <td className="px-4 py-4 text-center">
                                                <div className="inline-flex px-3 py-1 bg-black/5 dark:bg-white/5 rounded-lg font-black text-[13px] text-gray-400">1</div>
                                            </td>
                                            <td className="px-4 py-4 text-right font-mono text-[14px] font-bold text-gray-400">${parseFloat(item.unit_price).toLocaleString()}</td>
                                            <td className="px-4 py-4">
                                                <div className="text-[9px] font-black uppercase tracking-widest text-gray-400 italic">Fixed Price</div>
                                            </td>
                                            <td className="px-4 py-4 text-right font-black text-gray-900 dark:text-[#c9d1d9] text-[18px] border-l border-black/5 dark:border-[#30363d] tracking-tighter">
                                                ${parseFloat(item.unit_price).toLocaleString()}
                                            </td>
                                            <td className="px-6 py-4 text-center">
                                                <button 
                                                    onClick={() => removeItem(item.cart_item_id)}
                                                    className="p-2.5 text-gray-200 dark:text-[#8b949e]/40 hover:text-red-500 hover:bg-red-500/10 rounded-xl transition-all opacity-0 group-hover:opacity-100"
                                                >
                                                    <Trash2 size={16} />
                                                </button>
                                            </td>
                                        </motion.tr>
                                    ))}
                            </AnimatePresence>
                        </tbody>
                    </table>
                )}
            </div>
        </div>
    );
};

export default OrderLedger;
