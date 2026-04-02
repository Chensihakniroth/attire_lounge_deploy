import React from 'react';
import { motion } from 'framer-motion';
import { Sparkles, Tag, ChevronRight } from 'lucide-react';

const TierDiscountBadge = ({ discountPercent, amount }) => {
    if (discountPercent === 0) return null;

    return (
        <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            className="flex items-center gap-3 p-3 bg-attire-accent/10 border border-attire-accent/30 rounded-2xl relative overflow-hidden group shadow-lg shadow-attire-accent/5 transition-all"
        >
            <div className="p-2 rounded-xl bg-attire-accent text-black scale-110 shadow-lg shadow-attire-accent/20">
                <Sparkles size={14} className="animate-spin-slow" />
            </div>
            <div className="flex-1">
                <div className="flex items-center gap-2">
                    <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-attire-accent">
                        Tier Discount Active
                    </span>
                    <span className="px-1.5 py-0.5 rounded-full bg-attire-accent text-black text-[8px] font-bold">
                        -{discountPercent}%
                    </span>
                </div>
                <p className="text-[9px] text-gray-500 dark:text-gray-400 uppercase tracking-widest mt-0.5">
                    Total Savings: <span className="text-white font-bold">${amount.toLocaleString()}</span>
                </p>
            </div>

            {/* Background Glow */}
            <div className="absolute top-0 right-0 w-16 h-16 bg-attire-accent/5 blur-2xl rounded-full -mr-8 -mt-8" />
        </motion.div>
    );
};

export default TierDiscountBadge;
