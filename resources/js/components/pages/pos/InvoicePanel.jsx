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
    Tag
} from 'lucide-react';
import { usePOS } from './POSContext';
import { motion, AnimatePresence } from 'framer-motion';
import CartItem from './CartItem';
import CustomerSearch from './CustomerSearch';
import PaymentModal from './PaymentModal';
import SpendProgressBar from './SpendProgressBar';
import TierDiscountBadge from './TierDiscountBadge';

const InvoicePanel = () => {
    const { activeTab, clearInvoice, holdInvoice } = usePOS();
    const [showCustomerSearch, setShowCustomerSearch] = useState(false);
    const [showPaymentModal, setShowPaymentModal] = useState(false);

    // Calculate Totals
    const totals = useMemo(() => {
        let subtotal = 0;
        let productSubtotalForDiscount = 0;
        
        activeTab.cartItems.forEach(item => {
            const itemTotal = item.unit_price * item.quantity;
            let finalPrice = itemTotal;

            if (item.discount_type === 'percentage') {
                finalPrice = itemTotal * (1 - item.discount_value / 100);
            } else if (item.discount_type === 'price') {
                finalPrice = itemTotal - item.discount_value;
            }

            subtotal += Math.max(0, finalPrice);
            
            // Only non-services count towards spend-tier discounts
            if (!item.is_service) {
                productSubtotalForDiscount += item.unit_price * item.quantity;
            }
        });

        // Spend-tier discount logic
        let tierDiscountPercent = 0;
        if (productSubtotalForDiscount >= 1500) tierDiscountPercent = 15;
        else if (productSubtotalForDiscount >= 1000) tierDiscountPercent = 10;
        else if (productSubtotalForDiscount >= 500) tierDiscountPercent = 8;

        const tierDiscountAmount = subtotal * (tierDiscountPercent / 100);
        const finalTotal = subtotal - tierDiscountAmount;

        return {
            subtotal,
            productSubtotalForDiscount,
            tierDiscountPercent,
            tierDiscountAmount,
            finalTotal
        };
    }, [activeTab.cartItems]);

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
                        className="w-full flex items-center justify-center gap-3 py-4 border-2 border-dashed border-black/5 dark:border-white/10 rounded-2xl hover:border-attire-accent/50 hover:bg-attire-accent/5 transition-all group"
                    >
                        <User className="text-gray-400 group-hover:text-attire-accent" size={18} />
                        <span className="text-[10px] font-bold uppercase tracking-widest text-gray-400 group-hover:text-attire-accent">
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

            {/* Cart Items Area */}
            <div className="flex-1 overflow-y-auto no-scrollbar p-4">
                <div className="flex items-center justify-between mb-4">
                    <h3 className="text-[10px] font-bold uppercase tracking-[0.2em] text-gray-500 dark:text-gray-400">
                        Current Order ({activeTab.cartItems.length})
                    </h3>
                </div>

                {activeTab.cartItems.length === 0 ? (
                    <div className="h-full flex flex-col items-center justify-center text-center p-12 opacity-30">
                        <ShoppingBag size={48} className="mb-4 text-gray-400" />
                        <p className="text-[10px] font-bold uppercase tracking-widest">Empty Cart</p>
                        <p className="text-[8px] mt-1 uppercase tracking-widest">Start scanning or select products</p>
                    </div>
                ) : (
                    <div className="space-y-3">
                        <AnimatePresence mode="popLayout">
                            {activeTab.cartItems.map((item) => (
                                <CartItem key={item.product_id} item={item} />
                            ))}
                        </AnimatePresence>
                    </div>
                )}
            </div>

            {/* Summary & Checkout Section */}
            <div className="p-6 border-t border-black/5 dark:border-white/5 bg-black/[0.02] dark:bg-white/[0.02] space-y-4">
                {/* Visual Summary */}
                <TierDiscountBadge 
                    discountPercent={totals.tierDiscountPercent} 
                    amount={totals.tierDiscountAmount} 
                />

                {/* Summary Rows */}
                <div className="space-y-2">
                    <div className="flex items-center justify-between text-[10px] uppercase tracking-widest text-gray-500">
                        <span>Items Subtotal</span>
                        <span className="font-bold text-gray-900 dark:text-white">${totals.subtotal.toLocaleString()}</span>
                    </div>

                    {totals.tierDiscountAmount > 0 && (
                        <motion.div 
                            initial={{ opacity: 0, x: -10 }}
                            animate={{ opacity: 1, x: 0 }}
                            className="flex items-center justify-between text-[10px] uppercase tracking-widest text-attire-accent font-bold"
                        >
                            <div className="flex items-center gap-2">
                                <Tag size={12} />
                                <span>Spend Tier Discount ({totals.tierDiscountPercent}%)</span>
                            </div>
                            <span>-${totals.tierDiscountAmount.toLocaleString()}</span>
                        </motion.div>
                    )}

                    <div className="h-px bg-black/5 dark:bg-white/5 my-2" />

                    <div className="flex items-center justify-between">
                        <span className="text-[12px] font-bold uppercase tracking-[0.2em] text-gray-900 dark:text-white">Total Amount</span>
                        <span className="text-2xl font-bold text-attire-accent tracking-tighter">
                            ${totals.finalTotal.toLocaleString()}
                        </span>
                    </div>
                </div>

                {/* Main Action Buttons */}
                <div className="grid grid-cols-2 gap-3">
                    <button 
                        onClick={holdInvoice}
                        className="flex items-center justify-center gap-2 py-4 px-4 bg-black/5 dark:bg-white/5 rounded-2xl text-[10px] font-bold uppercase tracking-widest text-gray-500 dark:text-gray-400 hover:bg-black/10 dark:hover:bg-white/10 transition-all active:scale-95 border border-black/5 dark:border-white/10"
                    >
                        <Receipt size={16} />
                        Hold
                    </button>
                    <button 
                        disabled={activeTab.cartItems.length === 0}
                        onClick={() => setShowPaymentModal(true)}
                        className={`flex items-center justify-center gap-3 py-4 px-4 rounded-2xl text-[11px] font-bold uppercase tracking-widest transition-all active:scale-95 shadow-xl ${
                            activeTab.cartItems.length > 0 
                                ? 'bg-attire-accent text-black shadow-attire-accent/20 hover:scale-[1.02]' 
                                : 'bg-gray-200 dark:bg-white/5 text-gray-400 cursor-not-allowed grayscale'
                        }`}
                    >
                        <Wallet size={18} />
                        Checkout
                    </button>
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
