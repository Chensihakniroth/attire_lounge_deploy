import React from 'react';
import { motion } from 'framer-motion';
import { Sparkles, Trophy, Star } from 'lucide-react';

const SpendProgressBar = ({ currentSpend, isVip }) => {
    if (isVip) return (
        <div className="p-3 bg-[#0d3542]/10 dark:bg-[#58a6ff]/10 border border-[#0d3542]/20 dark:border-[#30363d] rounded-xl flex items-center gap-3">
            <Trophy size={16} className="text-[#0d3542] dark:text-[#58a6ff] animate-bounce" />
            <span className="text-[9px] font-bold uppercase tracking-[0.2em] text-[#0d3542] dark:text-[#58a6ff]">
                Loyal VIP Member · 15% Max Tier Ready
            </span>
        </div>
    );

    const tiers = [
        { label: '8% OFF', threshold: 500 },
        { label: '10% OFF', threshold: 1000 },
        { label: '15% OFF', threshold: 1500 }
    ];

    const maxThreshold = 1500;
    const percentage = Math.min(100, (currentSpend / maxThreshold) * 100);

    return (
        <div className="space-y-3 p-4 bg-black/[0.01] dark:bg-[#161b22] rounded-2xl border border-black/5 dark:border-[#30363d]">
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                    <Sparkles size={14} className="text-attire-accent" />
                    <span className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-500">VIP Progress</span>
                </div>
                <div className="px-3 py-1 bg-black/5 dark:bg-white/5 rounded-lg border border-black/5 dark:border-white/10">
                    <span className="text-[11px] font-mono font-black text-gray-900 dark:text-white">
                        ${currentSpend.toLocaleString()} <span className="opacity-30">/</span> $1,500
                    </span>
                </div>
            </div>

            {/* Progress Bar Container */}
            <div className="relative h-2 bg-black/5 dark:bg-white/10 rounded-full overflow-hidden">
                <motion.div 
                    initial={{ width: 0 }}
                    animate={{ width: `${percentage}%` }}
                    className="absolute inset-y-0 left-0 bg-gradient-to-r from-[#0d3542]/50 to-[#0d3542] dark:from-[#58a6ff]/50 dark:to-[#58a6ff] transition-all duration-1000 shadow-none border-r border-[#0d3542] dark:border-[#58a6ff]"
                />
                
                {/* Tier Markers */}
                {tiers.map((tier, idx) => {
                    const markerPos = (tier.threshold / maxThreshold) * 100;
                    const isReached = currentSpend >= tier.threshold;
                    return (
                        <div 
                            key={idx}
                            className={`absolute top-0 bottom-0 w-1 z-10 transition-colors ${isReached ? 'bg-white' : 'bg-white/20'}`}
                            style={{ left: `${markerPos}%` }}
                        >
                            <div className={`absolute -top-1 -left-1.5 w-4 h-4 rounded-sm border-2 border-[#0a0a0a] transition-all flex items-center justify-center ${isReached ? 'bg-teal-500 scale-110 shadow-none border-white/40' : 'bg-gray-800 border-white/5'}`}>
                                <div className="w-1 h-1 bg-white rounded-full" />
                            </div>
                        </div>
                    );
                })}
            </div>

            {/* Labels */}
            <div className="flex justify-between px-1">
                {tiers.map((tier, idx) => {
                    const isReached = currentSpend >= tier.threshold;
                    return (
                        <div key={idx} className="flex flex-col items-center">
                            <span className={`text-[7px] font-bold uppercase transition-colors ${isReached ? 'text-attire-accent' : 'text-gray-400'}`}>
                                {tier.label}
                            </span>
                            <span className="text-[6px] text-gray-500 opacity-50">${tier.threshold}</span>
                        </div>
                    );
                })}
            </div>

            {currentSpend >= 500 && !isVip && (
                <p className="text-[8px] text-attire-accent font-bold uppercase tracking-widest text-center animate-pulse">
                    Next goal: Automate VIP Status!
                </p>
            )}
        </div>
    );
};

export default SpendProgressBar;
