import React from 'react';
import { motion } from 'framer-motion';
import { Sparkles, ShieldCheck } from 'lucide-react';

const SpendProgressBar = ({ currentSpend, isVip }) => {
    if (isVip) return (
        <div className="flex items-center gap-3 px-4 py-3 rounded-xl bg-[#0d3542]/8 dark:bg-[#58a6ff]/8 border border-[#0d3542]/15 dark:border-[#58a6ff]/15">
            <ShieldCheck size={14} className="text-[#0d3542] dark:text-[#58a6ff] shrink-0" />
            <span className="text-[9px] font-black uppercase tracking-[0.2em] text-[#0d3542] dark:text-[#58a6ff]">
                Platinum VIP · 15% Discount Active
            </span>
        </div>
    );

    const tiers = [
        { label: '8%', threshold: 500 },
        { label: '10%', threshold: 1000 },
        { label: '15%', threshold: 1500 }
    ];

    const maxThreshold = 1500;
    const percentage = Math.min(100, (currentSpend / maxThreshold) * 100);
    const nextTier = tiers.find(t => currentSpend < t.threshold);

    return (
        <div className="space-y-3 px-1">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                    <Sparkles size={11} className="text-attire-accent" />
                    <span className="text-[9px] font-black uppercase tracking-[0.2em] text-gray-400 dark:text-[#8b949e]/60">VIP Progress</span>
                </div>
                <span className="text-[10px] font-mono font-bold text-gray-900 dark:text-white">
                    ${currentSpend.toLocaleString()} <span className="text-gray-300 dark:text-[#8b949e]/30">/ $1,500</span>
                </span>
            </div>

            {/* Track */}
            <div className="relative h-2 bg-black/5 dark:bg-white/5 rounded-full overflow-hidden">
                <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${percentage}%` }}
                    transition={{ duration: 0.8, ease: 'easeOut' }}
                    className="absolute inset-y-0 left-0 bg-attire-accent dark:bg-[#58a6ff] rounded-full"
                />
                {/* Tier markers */}
                {tiers.map((tier, i) => (
                    <div
                        key={i}
                        className={`absolute top-1/2 -translate-y-1/2 w-1.5 h-1.5 rounded-full border-2 transition-colors duration-300 ${
                            currentSpend >= tier.threshold
                                ? 'bg-attire-accent dark:bg-[#58a6ff] border-attire-accent dark:border-[#58a6ff]'
                                : 'bg-white dark:bg-[#0d1117] border-gray-300 dark:border-[#30363d]'
                        }`}
                        style={{ left: `${(tier.threshold / maxThreshold) * 100}%`, transform: 'translate(-50%, -50%)' }}
                    />
                ))}
            </div>

            {/* Tier labels */}
            <div className="relative h-4">
                {tiers.map((tier, i) => (
                    <span
                        key={i}
                        className={`absolute text-[7px] font-black uppercase tracking-wider transition-colors duration-300 ${
                            currentSpend >= tier.threshold
                                ? 'text-attire-accent dark:text-[#58a6ff]'
                                : 'text-gray-300 dark:text-[#8b949e]/25'
                        }`}
                        style={{ left: `${(tier.threshold / maxThreshold) * 100}%`, transform: 'translateX(-50%)' }}
                    >
                        {tier.label} · ${tier.threshold}
                    </span>
                ))}
            </div>

            {/* Next tier hint */}
            {nextTier && currentSpend > 0 && (
                <p className="text-[8px] font-bold text-gray-400 dark:text-[#8b949e]/40 uppercase tracking-widest text-center">
                    ${(nextTier.threshold - currentSpend).toLocaleString()} to {nextTier.label} tier
                </p>
            )}
        </div>
    );
};

export default SpendProgressBar;
