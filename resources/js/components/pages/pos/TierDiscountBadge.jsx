import React from 'react';
import { motion } from 'framer-motion';
import { Sparkles, Tag, ChevronRight } from 'lucide-react';

const TierDiscountBadge = ({ discountPercent, amount }) => {
    if (discountPercent === 0) return null;

    return (
        <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            className="flex items-center gap-3 p-3 bg-[#0d3542]/10 dark:bg-[#58a6ff]/10 border border-[#0d3542]/30 dark:border-[#30363d] rounded-2xl relative overflow-hidden group shadow-none transition-all"
        >
            <div className="p-2 rounded-xl bg-[#0d3542] dark:bg-[#58a6ff] text-white dark:text-black scale-110 shadow-none border border-black/5 dark:border-white/5">
                <Sparkles size={14} className="animate-spin-slow" />
            </div>
            <div className="flex-1">
                <div className="flex items-center gap-2">
                    <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#0d3542] dark:text-[#58a6ff]">
                        Tier Discount Active
                    </span>
                    <span className="px-1.5 py-0.5 rounded-xl bg-[#0d3542] dark:bg-[#58a6ff] text-white dark:text-black text-[8px] font-bold">
                        -{discountPercent}%
                    </span>
                </div>
                <p className="text-[9px] text-gray-500 dark:text-[#8b949e] uppercase tracking-widest mt-0.5">
                    Total Savings: <span className="text-[#0d3542] dark:text-[#c9d1d9] font-bold">${amount.toLocaleString()}</span>
                </p>
            </div>

            {/* Background Glow */}

        </motion.div>
    );
};

export default TierDiscountBadge;
