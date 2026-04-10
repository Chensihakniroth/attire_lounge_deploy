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
        <div className="space-y-4 py-2 px-1">
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                    <Sparkles size={12} className="text-attire-accent" />
                    <span className="text-[9px] font-black uppercase tracking-[0.2em] text-gray-400">VIP Progress</span>
                </div>
                <span className="text-[10px] font-mono font-bold text-gray-900 dark:text-white">
                    ${currentSpend.toLocaleString()} <span className="opacity-20">/</span> $1,500
                </span>
            </div>

            <div className="relative pt-2 pb-4">
                {/* Progress Bar Track */}
                <div className="h-1 bg-black/5 dark:bg-white/5 rounded-full" />
                
                {/* Active Progress */}
                <motion.div 
                    initial={{ width: 0 }}
                    animate={{ width: `${percentage}%` }}
                    className="absolute top-2 left-0 h-1 bg-attire-accent rounded-full shadow-[0_0_10px_rgba(0,196,180,0.3)]"
                />
                
                {/* Tier Markers */}
                {tiers.map((tier, idx) => {
                    const markerPos = (tier.threshold / maxThreshold) * 100;
                    const isReached = currentSpend >= tier.threshold;
                    return (
                        <div 
                            key={idx}
                            className="absolute top-1/2 -translate-y-1/2 flex flex-col items-center"
                            style={{ left: `${markerPos}%` }}
                        >
                            <div className={`w-1.5 h-1.5 rounded-full transition-all duration-500 scale-125 ${
                                isReached ? 'bg-attire-accent' : 'bg-gray-300 dark:bg-[#30363d]'
                            }`} />
                            
                            <div className="absolute top-4 flex flex-col items-center whitespace-nowrap">
                                <span className={`text-[8px] font-black tracking-tighter transition-colors ${
                                    isReached ? 'text-attire-accent' : 'text-gray-400'
                                }`}>
                                    {tier.label}
                                </span>
                                <span className="text-[6px] text-gray-300 dark:text-[#8b949e]/30 uppercase font-black">${tier.threshold}</span>
                            </div>
                        </div>
                    );
                })}
            </div>

            {currentSpend >= 500 && !isVip && (
                <div className="pt-2 text-center">
                    <span className="text-[8px] text-attire-accent font-black uppercase tracking-[0.1em] opacity-80">
                        Approaching VIP Status
                    </span>
                </div>
            )}
        </div>
    );
};

export default SpendProgressBar;
