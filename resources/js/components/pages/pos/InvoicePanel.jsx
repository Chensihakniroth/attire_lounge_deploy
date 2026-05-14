import React, { useState, useMemo } from 'react';
import { 
    User, 
    Search, 
    Trash2, 
    Plus, 
    Minus, 
    Percent, 
    DollarSign, 
    Gift,
    Receipt,
    Wallet,
    Info,
    X,
    CreditCard,
    MoreVertical,
    ShoppingBag,
    Tag,
    Edit3,
    Undo2
} from 'lucide-react';
import InlineCustomerSearch from './InlineCustomerSearch';
import PaymentModal from './PaymentModal';
import SpendProgressBar from './SpendProgressBar';
import { usePOS } from './POSContext';
import { useAdmin } from '../admin/AdminContext';
import { motion, AnimatePresence } from 'framer-motion';

const InvoicePanel = () => {
    const { activeOutlet } = useAdmin();
    const { activeTab, clearInvoice, holdInvoice, totals, updateNote, updateCartDiscount } = usePOS();
    const [showPaymentModal, setShowPaymentModal] = useState(false);

    return (
        <div className="flex-1 flex flex-col h-full bg-transparent dark:bg-[#0d1117] border-l border-black/5 dark:border-[#30363d] transition-colors duration-300 font-sans">
            {/* Customer Section */}
            {activeOutlet === 'attire_lounge' && (
                <div className="p-5 border-b border-black/5 dark:border-[#30363d] bg-black/[0.01] dark:bg-white/[0.01]">
                    {!activeTab.customer ? (
                    <div className="space-y-4">
                        <InlineCustomerSearch />
                    </div>
                ) : (
                    <motion.div 
                        initial={{ opacity: 0, scale: 0.98 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="flex items-center gap-4 p-4 bg-background dark:bg-[#161b22] border border-[#0d3542]/20 dark:border-[#30363d] rounded-2xl relative group overflow-hidden shadow-none"
                    >
                        {/* Status Light */}
                        <div className="absolute top-2 right-4 flex items-center gap-1.5 opacity-60">
                             <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                             <span className="text-[8px] font-black uppercase tracking-widest text-emerald-500">Linked</span>
                        </div>

                        <div className="w-12 h-12 rounded-xl bg-attire-accent/10 border border-attire-accent/20 flex items-center justify-center text-attire-accent font-black text-lg">
                            {activeTab.customer.name.charAt(0)}
                        </div>
                        <div className="flex-1 min-w-0">
                            <h4 className="text-[14px] font-black uppercase tracking-widest text-gray-900 dark:text-white truncate">
                                {activeTab.customer.name}
                            </h4>
                            <div className="flex items-center gap-2 mt-0.5">
                                {activeTab.customer.is_vip && (
                                    <span className="px-1.5 py-0.5 bg-black dark:bg-white text-white dark:text-black text-[8px] font-black rounded uppercase tracking-tighter">VIP</span>
                                )}
                                <p className="text-[10px] text-gray-500 dark:text-gray-400 uppercase tracking-widest font-bold truncate">
                                    {activeTab.customer.phone || activeTab.customer.email || 'Customer Hub'}
                                </p>
                            </div>
                        </div>
                        <button 
                            onClick={clearInvoice}
                            className="p-2 hover:bg-red-500/10 text-gray-300 hover:text-red-500 rounded-xl transition-all"
                        >
                            <X size={16} />
                        </button>
                    </motion.div>
                )}

                    <div className="mt-5">
                        <SpendProgressBar 
                            currentSpend={totals.productSubtotal} 
                            isVip={activeTab.customer?.is_vip} 
                        />
                    </div>
                </div>
            )}

            {/* Totals & Checkout */}
            <div className="mt-auto p-6 border-t border-black/5 dark:border-[#30363d] bg-[#0d3542]/5 dark:bg-[#161b22] space-y-6">
                <div className="space-y-3">
                    <div className="flex items-center justify-between text-[11px] font-black uppercase tracking-[0.3em] text-gray-400/80 dark:text-[#8b949e]/80">
                        <span>Product Subtotal</span>
                        <span className="font-mono text-gray-900 dark:text-white text-[14px]">${totals.productSubtotal.toLocaleString()}</span>
                    </div>

                    {/* Manual Discount Input */}
                    {!activeTab.isRefundMode && (
                        <div className="flex items-center gap-2 py-1">
                            <Tag size={12} className="text-gray-400 dark:text-[#8b949e]/40 shrink-0" />
                            <span className="text-[9px] font-black uppercase tracking-[0.2em] text-gray-400 dark:text-[#8b949e]/60 shrink-0">Discount</span>
                            <div className="flex items-center gap-1 ml-auto bg-black/5 dark:bg-[#161b22] rounded-lg border border-transparent hover:border-black/5 dark:hover:border-[#30363d] transition-all p-0.5">
                                <button 
                                    onClick={() => {
                                        const newType = (activeTab.cartDiscount?.type || 'percentage') === 'percentage' ? 'fixed' : 'percentage';
                                        updateCartDiscount(newType, activeTab.cartDiscount?.value || 0);
                                    }}
                                    className={`w-7 h-7 rounded-md flex items-center justify-center text-[12px] font-black transition-all ${
                                        (activeTab.cartDiscount?.value || 0) > 0 
                                            ? 'bg-attire-accent text-black shadow-none' 
                                            : 'bg-black/5 dark:bg-[#0d1117] text-gray-400 dark:text-[#8b949e]/40 hover:text-gray-900 dark:hover:text-[#c9d1d9]'
                                    }`}
                                >
                                    {(activeTab.cartDiscount?.type || 'percentage') === 'percentage' ? '%' : '$'}
                                </button>
                                <input 
                                    type="number"
                                    min="0"
                                    placeholder="0"
                                    value={activeTab.cartDiscount?.value || ''}
                                    onChange={(e) => {
                                        const val = Math.max(0, parseFloat(e.target.value) || 0);
                                        updateCartDiscount(activeTab.cartDiscount?.type || 'percentage', val);
                                    }}
                                    className="w-16 bg-transparent text-right font-black text-[13px] outline-none text-gray-900 dark:text-[#c9d1d9] placeholder:text-gray-300 dark:placeholder:text-[#8b949e]/20 [appearance:textfield]"
                                />
                            </div>
                        </div>
                    )}

                    <AnimatePresence>
                        {totals.manualDiscountAmount > 0 && (
                            <motion.div 
                                initial={{ opacity: 0, height: 0 }}
                                animate={{ opacity: 1, height: 'auto' }}
                                exit={{ opacity: 0, height: 0 }}
                                className="flex items-center justify-between text-[11px] font-black uppercase tracking-[0.2em] text-attire-accent"
                            >
                                <div className="flex items-center gap-2">
                                    <Tag size={14} />
                                    <span>Discount ({totals.cartDiscountType === 'percentage' ? `${totals.cartDiscountValue}%` : `$${totals.cartDiscountValue}`})</span>
                                </div>
                                <span className="font-mono text-[14px]">-${totals.manualDiscountAmount.toLocaleString()}</span>
                            </motion.div>
                        )}
                    </AnimatePresence>

                    <AnimatePresence>
                        {totals.serviceSubtotal > 0 && (
                            <motion.div 
                                initial={{ opacity: 0, height: 0 }}
                                animate={{ opacity: 1, height: 'auto' }}
                                exit={{ opacity: 0, height: 0 }}
                                className="flex items-center justify-between text-[11px] font-black uppercase tracking-[0.2em] text-[#0d3542] dark:text-[#f5a81c]"
                            >
                                <div className="flex items-center gap-2">
                                    <Plus size={14} />
                                    <span>Service Add-ons</span>
                                </div>
                                <span className="font-mono text-[14px]">+${totals.serviceSubtotal.toLocaleString()}</span>
                            </motion.div>
                        )}
                    </AnimatePresence>

                    <div className="h-px bg-black/5 dark:bg-[#30363d]" />

                    <div className="flex items-center justify-between py-1">
                        <div className="space-y-1">
                            <span className="block text-[13px] font-black uppercase tracking-[0.4em] text-gray-900 dark:text-white leading-none">
                                {activeTab.isRefundMode ? 'Refund Amount' : 'Grand Total'}
                            </span>
                            <span className="block text-[9px] text-gray-400 dark:text-[#8b949e]/40 uppercase tracking-widest leading-none font-bold">
                                {activeTab.isRefundMode ? 'Total to Return' : 'Final Total'}
                            </span>
                        </div>
                        <span className={`text-5xl font-black tracking-tighter leading-none font-mono ${activeTab.isRefundMode ? 'text-red-500' : 'text-[#f5a81c]'}`}>
                            ${totals.finalTotal.toLocaleString()}
                        </span>
                    </div>

                    {/* KHR Conversion */}
                    <div className="flex items-center justify-between text-[11px] font-bold uppercase tracking-[0.2em] text-gray-400 dark:text-[#8b949e]/50">
                        <span>៛ Khmer Riel</span>
                        <span className="font-mono text-[13px]">៛{Math.round(totals.finalTotal * 4100).toLocaleString()}</span>
                    </div>

                    <div className={`flex items-center justify-between text-[11px] font-black uppercase tracking-[0.3em] transition-all duration-700 ${totals.changeDue > 0 ? 'text-emerald-500' : 'text-gray-400/30 dark:text-[#8b949e]/20'}`}>
                        <span>{activeTab.isRefundMode ? 'Return Balance' : (totals.changeDue > 0 ? 'Change Due' : 'Awaiting Payment')}</span>
                        <span className="font-mono text-[14px]">${totals.changeDue.toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
                    </div>
                </div>

                {/* Checkout Button */}
                <div className="space-y-4">
                    <motion.button 
                        whileHover={{ scale: activeTab.cartItems.length > 0 ? 1.01 : 1 }}
                        whileTap={{ scale: activeTab.cartItems.length > 0 ? 0.99 : 1 }}
                        disabled={activeTab.cartItems.length === 0}
                        onClick={() => setShowPaymentModal(true)}
                        className={`w-full flex items-center justify-center gap-4 h-16 rounded-2xl text-[13px] font-black uppercase tracking-[0.4em] transition-all relative overflow-hidden group ${
                            activeTab.cartItems.length > 0 
                                ? (activeTab.isRefundMode 
                                    ? 'bg-red-500 text-white shadow-lg shadow-red-500/20' 
                                    : 'bg-gradient-to-r from-[#f5a81c] to-[#d48c0a] text-[#0d1117] shadow-2xl shadow-[#f5a81c]/40') 
                                : 'bg-black/5 dark:bg-[#161b22] text-gray-400 dark:text-[#8b949e]/40 cursor-not-allowed border border-transparent dark:border-[#30363d]'
                        }`}
                    >
                        {activeTab.isRefundMode ? <Undo2 size={18} /> : <Wallet size={18} className="group-hover:scale-110 transition-transform duration-500" />}
                        {activeTab.isRefundMode ? 'Process Refund' : 'Checkout'}
                        {activeTab.cartItems.length > 0 && !activeTab.isRefundMode && (
                            <div className="absolute inset-0 bg-white/10 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                        )}
                    </motion.button>

                    {/* Note Input */}
                    <div className="relative group px-1">
                        <input 
                            type="text" 
                            placeholder="Add note..."
                            className="w-full bg-transparent border-b border-black/5 dark:border-white/5 py-3 text-[11px] font-black text-gray-500 dark:text-[#c9d1d9] uppercase tracking-[0.15em] outline-none focus:border-[#f5a81c] transition-all placeholder:text-gray-300 dark:placeholder:text-[#8b949e]/20"
                            value={activeTab.note || ''}
                            onChange={(e) => updateNote(e.target.value)}
                        />
                        <Edit3 size={14} className="absolute right-1 top-1/2 -translate-y-1/2 text-gray-400 opacity-20 group-focus-within:text-[#f5a81c] transition-colors" />
                    </div>
                </div>
            </div>

            <AnimatePresence>
                {showPaymentModal && <PaymentModal totals={totals} onClose={() => setShowPaymentModal(false)} />}
            </AnimatePresence>
        </div>
    );
};

export default InvoicePanel;
