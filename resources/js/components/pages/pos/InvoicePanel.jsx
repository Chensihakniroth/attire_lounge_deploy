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
    Edit3
} from 'lucide-react';
import InlineCustomerSearch from './InlineCustomerSearch';
import PaymentModal from './PaymentModal';
import SpendProgressBar from './SpendProgressBar';
import TierDiscountBadge from './TierDiscountBadge';
import { usePOS } from './POSContext';
import { motion, AnimatePresence } from 'framer-motion';

const InvoicePanel = () => {
    const { activeTab, clearInvoice, holdInvoice, totals, updateNote } = usePOS();
    const [showPaymentModal, setShowPaymentModal] = useState(false);

    return (
        <div className="flex-1 flex flex-col h-full bg-white dark:bg-[#0a0a0a] border-l border-black/5 dark:border-white/5 transition-colors duration-300 font-sans">
            {/* Customer Section */}
            <div className="p-5 border-b border-black/5 dark:border-white/5 bg-black/[0.01] dark:bg-white/[0.01]">
                {!activeTab.customer ? (
                    <div className="space-y-4">
                        <InlineCustomerSearch />
                    </div>
                ) : (
                    <motion.div 
                        initial={{ opacity: 0, scale: 0.98 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="flex items-center gap-4 p-4 bg-white dark:bg-white/[0.03] border border-attire-accent/20 rounded-2xl relative group overflow-hidden shadow-sm"
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
                        currentSpend={totals.productSubtotalForDiscount} 
                        isVip={activeTab.customer?.is_vip} 
                    />
                </div>
            </div>

            {/* Totals & Checkout */}
            <div className="mt-auto p-6 border-t border-black/5 dark:border-white/5 bg-gray-50/30 dark:bg-white/[0.01] space-y-6">
                <div className="space-y-3">
                    <div className="flex items-center justify-between text-[11px] font-black uppercase tracking-[0.3em] text-gray-400/80">
                        <span>Subtotal ({activeTab.cartItems.length} items)</span>
                        <span className="font-mono text-gray-900 dark:text-white text-[14px]">${totals.subtotal.toLocaleString()}</span>
                    </div>

                    <AnimatePresence>
                        {totals.tierDiscountAmount > 0 && (
                            <motion.div 
                                initial={{ opacity: 0, height: 0 }}
                                animate={{ opacity: 1, height: 'auto' }}
                                exit={{ opacity: 0, height: 0 }}
                                className="flex items-center justify-between text-[11px] font-black uppercase tracking-[0.2em] text-attire-accent"
                            >
                                <div className="flex items-center gap-2">
                                    <Tag size={14} />
                                    <span>Discount ({totals.tierDiscountPercent}%)</span>
                                </div>
                                <span className="font-mono text-[14px]">-${totals.tierDiscountAmount.toLocaleString()}</span>
                            </motion.div>
                        )}
                    </AnimatePresence>

                    <div className="h-px bg-black/5 dark:bg-white/5" />

                    <div className="flex items-center justify-between py-1">
                        <div className="space-y-1">
                            <span className="block text-[13px] font-black uppercase tracking-[0.4em] text-gray-900 dark:text-white leading-none">Grand Total</span>
                            <span className="block text-[9px] text-gray-400 uppercase tracking-widest leading-none font-bold">Final Total</span>
                        </div>
                        <span className="text-5xl font-black text-attire-accent tracking-tighter leading-none font-mono">
                            ${totals.finalTotal.toLocaleString()}
                        </span>
                    </div>

                    <div className={`flex items-center justify-between text-[11px] font-black uppercase tracking-[0.3em] transition-all duration-700 ${totals.changeDue > 0 ? 'text-emerald-500' : 'text-gray-400/30'}`}>
                        <span>{totals.changeDue > 0 ? 'Change Due' : 'Awaiting Payment'}</span>
                        <span className="font-mono text-[14px]">${totals.changeDue.toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
                    </div>
                </div>

                {/* Checkout Button */}
                <div className="space-y-4">
                    <motion.button 
                        whileHover={{ scale: 1.01, backgroundColor: activeTab.cartItems.length > 0 ? '#00C4B4' : '' }}
                        whileTap={{ scale: 0.99 }}
                        disabled={activeTab.cartItems.length === 0}
                        onClick={() => setShowPaymentModal(true)}
                        className={`w-full flex items-center justify-center gap-4 h-16 rounded-2xl text-[13px] font-black uppercase tracking-[0.4em] transition-all relative overflow-hidden group ${
                            activeTab.cartItems.length > 0 
                                ? 'bg-[#00C4B4] text-black border-2 border-black/10 shadow-lg' 
                                : 'bg-gray-100 dark:bg-white/5 text-gray-400 cursor-not-allowed grayscale'
                        }`}
                    >
                        <Wallet size={18} className="group-hover:scale-110 transition-transform" />
                        Checkout
                        {activeTab.cartItems.length > 0 && (
                            <div className="absolute inset-0 bg-white/20 opacity-0 group-hover:opacity-100 transition-opacity" />
                        )}
                    </motion.button>

                    {/* Note Input */}
                    <div className="relative group px-1">
                        <input 
                            type="text" 
                            placeholder="Add note..."
                            className="w-full bg-transparent border-b border-black/5 dark:border-white/5 py-3 text-[11px] font-black text-gray-500 uppercase tracking-[0.15em] outline-none focus:border-attire-accent transition-all placeholder:text-gray-300 dark:placeholder:text-white/10"
                            value={activeTab.note || ''}
                            onChange={(e) => updateNote(e.target.value)}
                        />
                        <Edit3 size={14} className="absolute right-1 top-1/2 -translate-y-1/2 text-gray-400 opacity-20 group-focus-within:text-attire-accent transition-colors" />
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
