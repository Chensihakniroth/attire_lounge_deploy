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
import { usePOS } from './POSContext';
import { motion, AnimatePresence } from 'framer-motion';
import CartItem from './CartItem';
import CustomerSearch from './CustomerSearch';
import PaymentModal from './PaymentModal';
import SpendProgressBar from './SpendProgressBar';
import TierDiscountBadge from './TierDiscountBadge';

const InvoicePanel = () => {
    const { activeTab, clearInvoice, holdInvoice, totals, updateNote } = usePOS();
    const [showCustomerSearch, setShowCustomerSearch] = useState(false);
    const [showPaymentModal, setShowPaymentModal] = useState(false);

    return (
        <div className="flex-1 flex flex-col h-full bg-white dark:bg-[#0a0a0a] border-l border-black/5 dark:border-white/5 transition-colors duration-300">
            {/* Customer Section */}
            <div className="p-4 border-b border-black/5 dark:border-white/5 bg-black/[0.01] dark:bg-white/[0.01]">
                <div className="flex items-center justify-between mb-2">
                    <h3 className="text-[10px] font-bold uppercase tracking-[0.2em] text-gray-500 dark:text-gray-400">
                        Customer
                    </h3>
                    {activeTab.customer && (
                        <button 
                            onClick={clearInvoice}
                            className="p-1 hover:bg-red-500/10 text-red-400 rounded-lg transition-all"
                            title="Clear Invoice"
                        >
                            <Trash2 size={12} />
                        </button>
                    )}
                </div>

                {!activeTab.customer ? (
                    <button 
                        onClick={() => setShowCustomerSearch(true)}
                        className="w-full flex flex-col items-center justify-center gap-3 py-8 border-2 border-dashed border-black/10 dark:border-white/10 rounded-[2rem] hover:border-attire-accent/50 hover:bg-attire-accent/5 transition-all group bg-black/[0.01] dark:bg-white/[0.01]"
                    >
                        <div className="p-3 rounded-2xl bg-black/5 dark:bg-white/5 text-gray-400 group-hover:text-attire-accent group-hover:bg-attire-accent/10 transition-all">
                            <User size={24} />
                        </div>
                        <span className="text-[11px] font-black uppercase tracking-[0.2em] text-gray-400 group-hover:text-attire-accent">
                            Attach Customer
                        </span>
                    </button>
                ) : (
                    <div className="flex items-center gap-4 p-3 bg-attire-accent/5 border border-attire-accent/20 rounded-2xl relative group overflow-hidden">
                        <div className="w-10 h-10 rounded-xl bg-attire-accent/10 border border-attire-accent/20 flex items-center justify-center text-attire-accent font-bold text-lg">
                            {activeTab.customer.name.charAt(0)}
                        </div>
                        <div className="flex-1">
                            <h4 className="text-[11px] font-bold uppercase tracking-wider text-gray-900 dark:text-white">
                                {activeTab.customer.name}
                                {activeTab.customer.is_vip && (
                                    <span className="ml-2 px-1.5 py-0.5 bg-attire-accent text-black text-[7px] font-bold rounded">VIP</span>
                                )}
                            </h4>
                            <p className="text-[9px] text-gray-500 dark:text-gray-400 uppercase tracking-widest">
                                {activeTab.customer.phone || activeTab.customer.email || 'No Contact'}
                            </p>
                        </div>
                        <button 
                            onClick={() => setShowCustomerSearch(true)}
                            className="p-2 hover:bg-black/5 dark:hover:bg-white/5 rounded-lg text-gray-400 hover:text-attire-accent transition-all"
                        >
                            <Search size={14} />
                        </button>
                    </div>
                )}

                <div className="mt-4">
                    <SpendProgressBar 
                        currentSpend={totals.productSubtotalForDiscount} 
                        isVip={activeTab.customer?.is_vip} 
                    />
                </div>
            </div>

            {/* Removed Cart Area - Moved to Left Column OrderLedger */}


            {/* Summary & Checkout Section */}
            <div className="p-6 border-t border-black/5 dark:border-white/5 bg-black/[0.02] dark:bg-white/[0.02] space-y-6">
                {/* Summary Rows */}
                <div className="space-y-3">
                    <div className="flex items-center justify-between text-[11px] font-bold uppercase tracking-widest text-gray-500">
                        <span>Subtotal ({activeTab.cartItems.length} items)</span>
                        <span className="text-gray-900 dark:text-white">${totals.subtotal.toLocaleString()}</span>
                    </div>

                    {totals.tierDiscountAmount > 0 && (
                        <motion.div 
                            initial={{ opacity: 0, x: -10 }}
                            animate={{ opacity: 1, x: 0 }}
                            className="flex items-center justify-between text-[11px] font-black uppercase tracking-widest text-attire-accent"
                        >
                            <div className="flex items-center gap-2">
                                <Tag size={14} />
                                <span>Discount ({totals.tierDiscountPercent}%)</span>
                            </div>
                            <span>-${totals.tierDiscountAmount.toLocaleString()}</span>
                        </motion.div>
                    )}

                    <div className="h-px bg-black/5 dark:bg-white/5 my-2" />

                    <div className="flex items-center justify-between py-2">
                        <span className="text-[14px] font-black uppercase tracking-[0.2em] text-gray-900 dark:text-white leading-none">Grand Total</span>
                        <span className="text-3xl font-black text-attire-accent tracking-tighter leading-none">
                            ${totals.finalTotal.toLocaleString()}
                        </span>
                    </div>

                    <div className="flex items-center justify-between text-[11px] font-bold uppercase tracking-widest text-gray-400">
                        <span>Cash Return</span>
                        <span className="font-mono text-white/40">$0.00</span>
                    </div>
                </div>

                {/* Checkout Bottom Section */}
                <div className="space-y-4">
                    <button 
                        disabled={activeTab.cartItems.length === 0}
                        onClick={() => setShowPaymentModal(true)}
                        className={`w-full flex items-center justify-center gap-3 py-5 rounded-[1.5rem] text-[13px] font-black uppercase tracking-[0.3em] transition-all active:scale-95 shadow-2xl ${
                            activeTab.cartItems.length > 0 
                                ? 'bg-attire-accent text-black shadow-attire-accent/20 hover:scale-[1.02]' 
                                : 'bg-gray-200 dark:bg-white/5 text-gray-400 cursor-not-allowed grayscale'
                        }`}
                    >
                        <Wallet size={20} />
                        Process Payment
                    </button>

                    {/* Note Field */}
                    <div className="relative group">
                        <input 
                            type="text" 
                            placeholder="Leave a note..."
                            className="w-full bg-black/20 dark:bg-white/[0.03] border border-black/10 dark:border-white/10 rounded-xl py-3 pl-4 pr-10 text-[11px] font-bold text-gray-400 outline-none focus:border-attire-accent/30 transition-all italic"
                            value={activeTab.note || ''}
                            onChange={(e) => updateNote(e.target.value)}
                        />
                        <Edit3 size={14} className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 opacity-40 group-hover:opacity-100 transition-opacity" />
                    </div>
                </div>
            </div>

            {/* Modals */}
            <AnimatePresence>
                {showCustomerSearch && <CustomerSearch onClose={() => setShowCustomerSearch(false)} />}
                {showPaymentModal && <PaymentModal totals={totals} onClose={() => setShowPaymentModal(false)} />}
            </AnimatePresence>
        </div>
    );
};

export default InvoicePanel;
