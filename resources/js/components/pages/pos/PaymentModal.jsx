import React, { useState, useEffect } from 'react';
import { 
    X, 
    CreditCard, 
    Banknote, 
    QrCode, 
    Wallet, 
    Check, 
    Loader2, 
    Sparkles, 
    ArrowRightCircle,
    AlertCircle,
} from 'lucide-react';
import axios from 'axios';
import { usePOS } from './POSContext';
import { motion, AnimatePresence } from 'framer-motion';
import ModernModal from '../../common/ModernModal';

const PaymentModal = ({ totals, onClose }) => {
    const { activeTab, clearInvoice, updatePayments } = usePOS();
    const payments = activeTab.payments || [];
    const [currentMethod, setCurrentMethod] = useState('Cash');
    const [amountInput, setAmountInput] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [success, setSuccess] = useState(false);
    const [createdInvoice, setCreatedInvoice] = useState(null);

    const paymentMethods = [
        { name: 'Cash', icon: <Banknote size={20} /> },
        { name: 'Credit', icon: <CreditCard size={20} /> },
        { name: 'Debit', icon: <CreditCard size={20} /> },
        { name: 'Kaq', icon: <QrCode size={20} /> },
        { name: 'QR Code', icon: <QrCode size={20} /> },
        { name: 'Deposit', icon: <Wallet size={20} /> }
    ];

    const currentPaid = payments.reduce((sum, p) => sum + p.amount, 0);
    const remaining = Math.max(0, totals.finalTotal - currentPaid);

    useEffect(() => {
        setAmountInput(remaining.toString());
    }, [remaining]);

    const addPayment = () => {
        const amount = parseFloat(amountInput);
        if (isNaN(amount) || amount <= 0) return;

        // Allow overpayment for Cash only
        const actualAmount = currentMethod === 'Cash' ? amount : Math.min(amount, remaining);
        
        updatePayments([...payments, { method: currentMethod, amount: actualAmount }]);
        setAmountInput('');
    };

    const removePayment = (index) => {
        updatePayments(payments.filter((_, i) => i !== index));
    };

    const handleCheckout = async () => {
        if (currentPaid < totals.finalTotal) {
            setError('Please pay the full amount before checking out.');
            return;
        }

        setLoading(true);
        setError(null);

        try {
            const methodMap = {
                'Cash': 'cash',
                'Credit': 'credit',
                'Debit': 'debit',
                'Kaq': 'khqr',
                'QR Code': 'qr_code',
                'Deposit': 'deposit'
            };

            const discountTypeMap = {
                'none': 'none',
                'percentage': 'percent',
                'price': 'amount'
            };

            const payload = {
                customer_profile_id: activeTab.customer?.id,
                items: activeTab.cartItems.map(item => ({
                    product_id: item.product_id,
                    product_name: item.product_name,
                    product_variant: item.product_variant,
                    product_sku: item.product_sku,
                    is_service: item.is_service,
                    quantity: item.quantity,
                    unit_price: item.unit_price,
                    discount_type: discountTypeMap[item.discount_type] || 'none',
                    discount_value: item.discount_value,
                    gift_wrap: item.gift_wrap
                })),
                payments: payments.map(p => ({
                    method: methodMap[p.method] || p.method.toLowerCase(),
                    amount: p.amount
                })),
                notes: activeTab.notes
            };

            const response = await axios.post('/api/v1/admin/pos/invoices', payload);
            setCreatedInvoice(response.data.data);
            setSuccess(true);
            
            setTimeout(() => {
                clearInvoice();
                onClose();
            }, 5000);
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to process checkout. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <ModernModal isOpen={true} onClose={onClose} maxWidth={success ? "max-w-md" : "max-w-4xl"} showCloseButton={!success}>
             {success ? (
                <div className="text-center space-y-6 p-10">
                    <div className="w-24 h-24 bg-[#0d3542] dark:bg-[#58a6ff] rounded-full flex items-center justify-center mx-auto shadow-none border border-black/5 dark:border-white/5 relative">
                        <Check size={48} className="text-white dark:text-black" />
                        <motion.div 
                            animate={{ scale: [1, 1.2, 1], opacity: [0.3, 0.1, 0.3] }}
                            transition={{ repeat: Infinity, duration: 2 }}
                            className="absolute inset-0 bg-[#0d3542] dark:bg-[#58a6ff] rounded-full -z-10"
                        />
                    </div>
                    <div className="space-y-2">
                        <h2 className="text-2xl font-serif uppercase tracking-[0.3em] text-gray-900 dark:text-[#c9d1d9]">Sale Successful</h2>
                        <p className="text-[10px] text-[#0d3542] dark:text-[#58a6ff] font-bold uppercase tracking-widest">Invoice {createdInvoice?.invoice_number}</p>
                    </div>
                    <p className="text-[12px] text-gray-500 dark:text-[#8b949e]/60 uppercase tracking-widest leading-relaxed">
                        The transaction has been processed. The inventory has been updated and the sale recorded.
                    </p>
                    
                    {totals.productSubtotalForDiscount >= 500 && activeTab.customer && !activeTab.customer.is_vip && (
                        <div className="p-4 bg-[#0d3542]/10 dark:bg-[#58a6ff]/10 border border-[#0d3542]/30 dark:border-[#58a6ff]/30 rounded-2xl flex items-center gap-4 text-left animate-bounce">
                            <Sparkles className="text-[#0d3542] dark:text-[#58a6ff]" size={24} />
                            <div>
                                <p className="text-[10px] font-bold uppercase tracking-widest text-[#0d3542] dark:text-[#58a6ff]">VIP Achievement</p>
                                <p className="text-[9px] text-gray-500 dark:text-[#8b949e] uppercase tracking-widest">Customer automatically upgraded to VIP status!</p>
                            </div>
                        </div>
                    )}

                    <div className="pt-4">
                        <button 
                            onClick={onClose}
                            className="px-8 py-3 bg-black dark:bg-[#161b22] text-white dark:text-[#c9d1d9] text-[10px] font-bold uppercase tracking-widest rounded-xl hover:scale-105 transition-all active:scale-95 border border-black/10 dark:border-[#30363d]"
                        >
                            Close Terminal
                        </button>
                    </div>
                </div>
             ) : (
                <div className="flex flex-col md:flex-row max-h-[90vh]">
                    {/* Left: Summary & Payment Input */}
                    <div className="flex-1 p-8 border-r border-black/5 dark:border-[#30363d] flex flex-col">
                        <div className="flex items-center gap-3 mb-8">
                             <div className="p-2.5 rounded-2xl bg-[#0d3542]/10 dark:bg-[#58a6ff]/10 text-[#0d3542] dark:text-[#58a6ff] border border-[#0d3542]/20 dark:border-[#30363d]">
                                <Wallet size={20} />
                            </div>
                            <h2 className="text-[14px] font-bold uppercase tracking-[0.3em] text-gray-900 dark:text-[#c9d1d9]">Payment Method</h2>
                        </div>

                        <div className="grid grid-cols-3 gap-3 mb-8">
                            {paymentMethods.map(method => (
                                <button
                                    key={method.name}
                                    onClick={() => setCurrentMethod(method.name)}
                                     className={`flex flex-col items-center justify-center gap-3 p-5 rounded-2xl border transition-all ${
                                        currentMethod === method.name 
                                            ? 'bg-[#0d3542] border-[#0d3542] text-white dark:bg-[#58a6ff] dark:border-[#58a6ff] dark:text-black shadow-none scale-105 z-10' 
                                            : 'bg-black/[0.02] dark:bg-[#161b22] border-black/5 dark:border-[#30363d] text-gray-400 dark:text-[#8b949e]/40 hover:border-[#0d3542]/30 dark:hover:border-[#58a6ff]/30'
                                    }`}
                                >
                                    {method.icon}
                                    <span className="text-[9px] font-bold uppercase tracking-widest">{method.name}</span>
                                </button>
                            ))}
                        </div>

                        <div className="space-y-6 mt-auto">
                            <div className="space-y-2">
                                <label className="text-[9px] font-bold uppercase tracking-[0.2em] text-gray-500 ml-1">Payment Amount</label>
                                <div className="relative group">
                                    <span className="absolute left-6 top-1/2 -translate-y-1/2 text-2xl font-bold text-gray-400 dark:text-[#8b949e]/20 group-focus-within:text-[#0d3542] dark:group-focus-within:text-[#58a6ff] transition-colors">$</span>
                                     <input 
                                        type="number"
                                        placeholder="0.00"
                                        className="w-full bg-black/[0.02] dark:bg-[#161b22] border border-black/10 dark:border-[#30363d] rounded-[1.5rem] py-6 pl-14 pr-32 text-3xl font-bold tracking-tighter text-gray-900 dark:text-[#c9d1d9] outline-none focus:border-[#0d3542]/50 dark:focus:border-[#58a6ff]/50 focus:bg-[#fdfdfc] dark:focus:bg-[#0d1117] transition-all"
                                        value={amountInput}
                                        onChange={(e) => setAmountInput(e.target.value)}
                                    />
                                    <button 
                                        onClick={addPayment}
                                        className="absolute right-4 top-1/2 -translate-y-1/2 px-6 py-3 bg-[#0d3542] dark:bg-[#58a6ff] text-white dark:text-black text-[9px] font-bold uppercase tracking-widest rounded-xl hover:scale-105 transition-all shadow-none border border-black/5 dark:border-white/5"
                                    >
                                        Add Payment
                                    </button>
                                </div>
                            </div>

                            {error && (
                                <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-xl flex items-center gap-3 text-red-500 text-[10px] font-bold uppercase tracking-widest animate-shake">
                                    <AlertCircle size={14} />
                                    {error}
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Right: Checkout Summary */}
                    <div className="w-full md:w-[350px] p-8 bg-black/[0.02] dark:bg-[#0d1117]/50 flex flex-col border-l border-black/5 dark:border-[#30363d]">
                        <h3 className="text-[10px] font-bold uppercase tracking-[0.2em] text-gray-500 mb-8">Checkout Summary</h3>
                        
                        <div className="space-y-4 flex-1">
                            <div className="flex justify-between items-center text-[10px] uppercase tracking-widest text-gray-400 dark:text-[#8b949e]/40">
                                <span>Total Payable</span>
                                <span className="font-bold text-gray-900 dark:text-[#c9d1d9]">${totals.finalTotal.toLocaleString()}</span>
                            </div>
                            
                            <div className="h-px bg-black/5 dark:bg-[#30363d]" />
                            
                            <div className="space-y-3">
                                <span className="text-[9px] font-bold uppercase tracking-widest text-gray-500">Payments Applied</span>
                                {payments.length === 0 ? (
                                    <p className="text-[10px] italic text-gray-400 py-4 opacity-50">No payments added yet...</p>
                                ) : (
                                    <div className="space-y-2">
                                        <AnimatePresence mode="popLayout">
                                            {payments.map((p, idx) => (
                                                <motion.div 
                                                    layout
                                                    initial={{ opacity: 0, x: 10 }}
                                                    animate={{ opacity: 1, x: 0 }}
                                                    exit={{ opacity: 0, x: 10 }}
                                                    key={idx} 
                                                    className="flex items-center justify-between p-3 bg-white dark:bg-[#161b22] rounded-xl border border-black/5 dark:border-[#30363d] group"
                                                >
                                                    <div className="flex items-center gap-2">
                                                        <span className="text-[9px] font-bold uppercase text-[#0d3542] dark:text-[#58a6ff]">{p.method}</span>
                                                        <span className="text-[11px] font-bold text-gray-900 dark:text-[#c9d1d9]">${p.amount.toLocaleString()}</span>
                                                    </div>
                                                    <button onClick={() => removePayment(idx)} className="p-1.5 opacity-0 group-hover:opacity-100 text-gray-400 hover:text-red-500 transition-all">
                                                        <X size={12} />
                                                    </button>
                                                </motion.div>
                                            ))}
                                        </AnimatePresence>
                                    </div>
                                )}
                            </div>
                        </div>

                        <div className="pt-8 border-t border-black/5 dark:border-[#30363d] space-y-6">
                            <div className="space-y-1 text-right">
                                <p className="text-[9px] font-bold uppercase tracking-[0.2em] text-gray-400 dark:text-[#8b949e]/40">Remaining Balance</p>
                                <p className={`text-3xl font-bold tracking-tighter ${remaining === 0 ? 'text-green-500' : 'text-gray-900 dark:text-[#c9d1d9]'}`}>
                                    ${remaining.toLocaleString()}
                                </p>
                                {remaining === 0 && <p className="text-[8px] font-bold text-green-500 uppercase tracking-[0.3em]">Fully Paid</p>}
                            </div>

                            <button 
                                disabled={remaining > 0 || loading}
                                onClick={handleCheckout}
                                className={`w-full py-5 rounded-[1.5rem] flex items-center justify-center gap-3 transition-all active:scale-95 shadow-none ${
                                    remaining === 0 && !loading 
                                        ? 'bg-[#0d3542] dark:bg-[#58a6ff] text-white dark:text-black scale-[1.02] border border-[#0d3542]/30 dark:border-[#58a6ff]/30' 
                                        : 'bg-gray-200 dark:bg-[#161b22] text-gray-400 dark:text-[#8b949e]/40 cursor-not-allowed border border-transparent dark:border-[#30363d]'
                                }`}
                            >
                                {loading ? <Loader2 className="animate-spin" size={20} /> : (
                                    <>
                                        <span className="text-[12px] font-bold uppercase tracking-[0.3em]">Complete Order</span>
                                        <ArrowRightCircle size={20} />
                                    </>
                                )}
                            </button>
                        </div>
                    </div>
                </div>
             )}
        </ModernModal>
    );
};

export default PaymentModal;
