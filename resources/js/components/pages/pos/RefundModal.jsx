import React, { useState, useEffect } from 'react';
import { 
    X, 
    CheckCircle, 
    AlertCircle, 
    Loader2, 
    Undo2, 
    Box
} from 'lucide-react';
import axios from 'axios';
import { motion, AnimatePresence } from 'framer-motion';
import ModernModal from '../../common/ModernModal';

const RefundModal = ({ invoice, onClose, onRefundSuccess }) => {
    const [selectedItems, setSelectedItems] = useState([]);
    const [refundAmount, setRefundAmount] = useState(0);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [success, setSuccess] = useState(false);

    useEffect(() => {
        // Calculate refund amount based on selected items
        const total = selectedItems.reduce((sum, item) => {
            const itemTotal = item.unit_price * item.quantity;
            let finalPrice = itemTotal;
            if (item.discount_type === 'percentage') {
                finalPrice = itemTotal * (1 - item.discount_value / 100);
            } else if (item.discount_type === 'price') {
                finalPrice = itemTotal - item.discount_value;
            }
            return sum + Math.max(0, finalPrice);
        }, 0);
        
        setRefundAmount(total);
    }, [selectedItems]);

    const toggleItem = (item) => {
        const isSelected = selectedItems.find(i => i.id === item.id);
        if (isSelected) {
            setSelectedItems(selectedItems.filter(i => i.id !== item.id));
        } else {
            setSelectedItems([...selectedItems, item]);
        }
    };

    const handleRefund = async (type) => {
        setLoading(true);
        setError(null);
        try {
            const payload = {
                invoice_id: invoice.id,
                type: type, // 'full' or 'partial'
                items: type === 'partial' ? selectedItems.map(i => ({ id: i.id })) : []
            };

            await axios.post('/api/v1/admin/pos/refunds', payload);
            setSuccess(true);
            setTimeout(() => {
                onRefundSuccess();
                onClose();
            }, 3000);
        } catch (err) {
            setError(err.response?.data?.message || 'Refund failed. Please check the quantities.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <ModernModal isOpen={true} onClose={onClose} maxWidth={success ? "max-w-md" : "max-w-2xl"} showCloseButton={!success}>
             {success ? (
                <div className="text-center py-12 px-8 space-y-6">
                    <div className="w-20 h-20 bg-green-500 rounded-full flex items-center justify-center mx-auto shadow-none border border-green-400 relative">
                        <CheckCircle size={40} className="text-white" />
                        <motion.div 
                            animate={{ scale: [1, 1.2, 1], opacity: [0.3, 0.1, 0.3] }}
                            transition={{ repeat: Infinity, duration: 2 }}
                            className="absolute inset-0 bg-green-500 rounded-full -z-10"
                        />
                    </div>
                    <div className="space-y-2">
                        <h2 className="text-xl font-serif uppercase tracking-[0.3em] text-gray-900 dark:text-white">Refund Successful</h2>
                        <p className="text-[10px] text-gray-400 uppercase tracking-widest">Inventory updated and balance restored.</p>
                    </div>
                </div>
             ) : (
                <div className="flex flex-col max-h-[85vh]">
                    {/* Header */}
                    <div className="p-8 border-b border-black/5 dark:border-white/10 flex items-center gap-4 bg-black/[0.01] dark:bg-white/[0.01]">
                        <div className="p-3 rounded-2xl bg-red-500/10 border border-red-500/20 text-red-500">
                            <Undo2 size={24} />
                        </div>
                        <div>
                            <h2 className="text-[14px] font-bold uppercase tracking-[0.3em] text-gray-900 dark:text-white leading-none mb-1">
                                Refund Management
                            </h2>
                            <p className="text-[9px] text-gray-500 uppercase tracking-widest">Invoice {invoice.invoice_number} · {new Date(invoice.created_at).toLocaleDateString()}</p>
                        </div>
                    </div>

                    {/* Items List */}
                    <div className="flex-1 overflow-y-auto no-scrollbar p-8 space-y-4">
                        <h3 className="text-[10px] font-bold uppercase tracking-[0.2em] text-gray-500 mb-2">Select items to refund</h3>
                        <div className="space-y-2">
                            {invoice.items.map((item) => {
                                const isSelected = selectedItems.find(i => i.id === item.id);
                                const alreadyRefunded = (item.refunded_quantity || 0) >= item.quantity;
                                
                                return (
                                    <button
                                        key={item.id}
                                        disabled={alreadyRefunded}
                                        onClick={() => toggleItem(item)}
                                        className={`w-full flex items-center gap-4 p-4 rounded-2xl border transition-all text-left ${
                                            alreadyRefunded ? 'opacity-40 grayscale pointer-events-none' :
                                            isSelected 
                                                ? 'bg-red-500/5 border-red-500/30' 
                                                : 'bg-black/[0.02] dark:bg-[#1a1a1a]/40 border-black/5 dark:border-white/5 hover:border-red-500/20'
                                        }`}
                                    >
                                        <div className={`p-2 rounded-xl transition-colors ${isSelected ? 'bg-red-500 text-white' : 'bg-black/5 dark:bg-white/5 text-gray-400'}`}>
                                            <Box size={16} />
                                        </div>
                                        <div className="flex-1">
                                            <h4 className="text-[11px] font-bold uppercase tracking-wider text-gray-900 dark:text-white">
                                                {item.product_name}
                                            </h4>
                                            <p className="text-[9px] text-gray-500 uppercase tracking-widest">Qty: {item.quantity} {alreadyRefunded && '(Refunded)'}</p>
                                        </div>
                                        <div className="text-right">
                                            <p className="text-[11px] font-bold text-gray-900 dark:text-white">${parseFloat(item.unit_price).toLocaleString()}</p>
                                            {item.discount_value > 0 && <p className="text-[8px] text-red-500 font-bold">-{item.discount_type === 'percentage' ? `${item.discount_value}%` : `$${item.discount_value}`}</p>}
                                        </div>
                                    </button>
                                );
                            })}
                        </div>
                    </div>

                    {/* Footer Actions */}
                    <div className="p-8 border-t border-black/5 dark:border-white/10 bg-black/[0.02] dark:bg-white/[0.02] space-y-6">
                        {error && (
                            <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-xl flex items-center gap-3 text-red-500 text-[10px] font-bold uppercase tracking-widest animate-shake">
                                <AlertCircle size={14} /> {error}
                            </div>
                        )}

                        <div className="flex items-center justify-between px-2">
                            <div className="space-y-1">
                                <p className="text-[9px] font-bold uppercase tracking-widest text-gray-500">Refund Amount</p>
                                <p className="text-2xl font-bold tracking-tighter text-red-500">${refundAmount.toLocaleString()}</p>
                            </div>
                            <div className="flex gap-3">
                                <button 
                                    onClick={() => handleRefund('full')}
                                    disabled={loading}
                                    className="px-6 py-3 bg-black dark:bg-white/10 text-white dark:text-white text-[10px] font-bold uppercase tracking-widest rounded-xl hover:bg-black/80 transition-all active:scale-95 border border-black/10 dark:border-white/10"
                                >
                                    Full Refund
                                </button>
                                <button 
                                    onClick={() => handleRefund('partial')}
                                    disabled={loading || selectedItems.length === 0}
                                    className={`px-8 py-3 rounded-xl text-[10px] font-bold uppercase tracking-widest transition-all active:scale-95 shadow-none ${
                                        selectedItems.length > 0 
                                            ? 'bg-red-500 text-white border border-red-400 hover:scale-[1.02]' 
                                            : 'bg-gray-200 dark:bg-white/5 text-gray-400 cursor-not-allowed'
                                    }`}
                                >
                                    {loading ? <Loader2 className="animate-spin" size={16} /> : 'Process Partial'}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
             )}
        </ModernModal>
    );
};

export default RefundModal;
