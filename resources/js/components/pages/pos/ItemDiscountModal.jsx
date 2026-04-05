import React, { useState, useEffect } from 'react';
import { Tag, X, Check, Trash2, Percent, DollarSign } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import ModernModal from '../../common/ModernModal';

const ItemDiscountModal = ({ isOpen, onClose, item, onApply }) => {
    const [discountType, setDiscountType] = useState(item?.discount_type === 'percentage' ? 'percentage' : (item?.discount_type === 'price' ? 'price' : 'percentage'));
    const [discountValue, setDiscountValue] = useState(item?.discount_value || 0);

    // Sync with item if it changes (e.g. initial load)
    useEffect(() => {
        if (item) {
            setDiscountType(item.discount_type === 'price' ? 'price' : 'percentage');
            setDiscountValue(item.discount_value || 0);
        }
    }, [item, isOpen]);

    if (!item) return null;

    const originalPrice = item.unit_price * item.quantity;
    const discountAmount = discountType === 'percentage' 
        ? (originalPrice * (parseFloat(discountValue || 0) / 100))
        : parseFloat(discountValue || 0);
    const finalPrice = Math.max(0, originalPrice - discountAmount);

    const handleApply = () => {
        onApply(item.product_id, discountType, parseFloat(discountValue) || 0);
        onClose();
    };

    const handleClear = () => {
        onApply(item.product_id, 'none', 0);
        onClose();
    };

    return (
        <ModernModal 
            isOpen={isOpen} 
            onClose={onClose} 
            title="Manual Item Discount"
            maxWidth="max-w-md"
        >
            <div className="p-8 space-y-8 font-sans">
                {/* Product Teaser */}
                <div className="p-5 rounded-2xl bg-black/[0.02] dark:bg-white/[0.02] border border-black/5 dark:border-white/5">
                    <div className="flex items-center justify-between mb-1">
                        <span className="text-[10px] font-black uppercase tracking-[0.3em] text-gray-400">Apply to Item</span>
                        <span className="text-[10px] font-black uppercase tracking-widest text-attire-accent">{item.product_sku}</span>
                    </div>
                    <h4 className="text-[18px] font-black uppercase text-gray-900 dark:text-white leading-tight">{item.product_name}</h4>
                </div>

                {/* Discount Type Selector */}
                <div className="space-y-3">
                    <label className="text-[11px] font-black uppercase tracking-[0.4em] text-gray-400 pl-1">Discount Type</label>
                    <div className="grid grid-cols-2 gap-3">
                        <button 
                            onClick={() => setDiscountType('percentage')}
                            className={`flex items-center justify-center gap-3 py-4 rounded-2xl border-2 transition-all ${discountType === 'percentage' ? 'bg-attire-accent border-attire-accent text-black' : 'bg-transparent border-black/5 dark:border-white/10 text-gray-400 hover:border-black/20 dark:hover:border-white/20'}`}
                        >
                            <Percent size={18} fill={discountType === 'percentage' ? 'currentColor' : 'none'} />
                            <span className="text-[13px] font-black uppercase tracking-widest">Percentage</span>
                        </button>
                        <button 
                            onClick={() => setDiscountType('price')}
                            className={`flex items-center justify-center gap-3 py-4 rounded-2xl border-2 transition-all ${discountType === 'price' ? 'bg-attire-accent border-attire-accent text-black' : 'bg-transparent border-black/5 dark:border-white/10 text-gray-400 hover:border-black/20 dark:hover:border-white/20'}`}
                        >
                            <DollarSign size={18} fill={discountType === 'price' ? 'currentColor' : 'none'} />
                            <span className="text-[13px] font-black uppercase tracking-widest">Fixed Amount</span>
                        </button>
                    </div>
                </div>

                {/* Value Input */}
                <div className="space-y-3">
                    <label className="text-[11px] font-black uppercase tracking-[0.4em] text-gray-400 pl-1">Discount Value</label>
                    <div className="relative group">
                        <div className="absolute left-6 top-1/2 -translate-y-1/2 text-attire-accent opacity-40 group-focus-within:opacity-100 transition-opacity">
                            {discountType === 'percentage' ? <Percent size={24} /> : <DollarSign size={24} />}
                        </div>
                        <input 
                            type="number" 
                            autoFocus
                            placeholder="0.00"
                            value={discountValue || ''}
                            onChange={(e) => setDiscountValue(e.target.value)}
                            className="w-full bg-black/[0.04] dark:bg-white/[0.04] border-2 border-transparent focus:border-attire-accent/30 rounded-2xl py-6 pl-16 pr-8 text-[32px] font-black font-mono text-gray-900 dark:text-white outline-none transition-all"
                        />
                    </div>
                </div>

                {/* Calculation Preview */}
                <div className="grid grid-cols-2 gap-4">
                    <div className="p-4 rounded-xl bg-black/[0.02] dark:bg-white/[0.02] border border-black/5 dark:border-white/5">
                        <span className="text-[10px] font-black uppercase tracking-widest text-gray-400 block mb-1">MSRP Total</span>
                        <span className="text-[18px] font-mono font-bold text-gray-500 line-through">${originalPrice.toLocaleString()}</span>
                    </div>
                    <div className="p-4 rounded-xl bg-attire-accent/5 border border-attire-accent/20">
                        <span className="text-[10px] font-black uppercase tracking-widest text-attire-accent block mb-1">Final Price</span>
                        <span className="text-[20px] font-mono font-black text-gray-900 dark:text-white">${finalPrice.toLocaleString()}</span>
                    </div>
                </div>

                {/* Actions */}
                <div className="flex gap-3 pt-4">
                    <button 
                        onClick={handleClear}
                        className="flex-1 flex items-center justify-center gap-2 py-5 rounded-2xl border-2 border-red-500/10 text-red-500 hover:bg-red-500/5 transition-all text-[12px] font-black uppercase tracking-widest"
                    >
                        <Trash2 size={18} /> Clear Discount
                    </button>
                    <button 
                        onClick={handleApply}
                        className="flex-[2] flex items-center justify-center gap-2 py-5 rounded-2xl bg-black dark:bg-white text-white dark:text-black shadow-none border border-black/10 dark:border-white/10 hover:scale-[1.02] active:scale-[0.98] transition-all text-[12px] font-black uppercase tracking-widest"
                    >
                        <Check size={18} /> Apply Discount
                    </button>
                </div>
            </div>
        </ModernModal>
    );
};

export default ItemDiscountModal;
