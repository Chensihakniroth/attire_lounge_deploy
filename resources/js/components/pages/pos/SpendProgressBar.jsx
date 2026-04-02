import React from 'react';
import { motion } from 'framer-motion';
import { Sparkles, Trophy, Star } from 'lucide-react';

const SpendProgressBar = ({ currentSpend, isVip }) => {
    if (isVip) return (
        <div className="p-3 bg-attire-accent/10 border border-attire-accent/20 rounded-xl flex items-center gap-3">
            <Trophy size={16} className="text-attire-accent animate-bounce" />
            <span className="text-[9px] font-bold uppercase tracking-[0.2em] text-attire-accent">
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
        <div className="space-y-3 p-4 bg-black/[0.02] dark:bg-white/[0.02] rounded-2xl border border-black/5 dark:border-white/5">
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                    <Sparkles size={12} className="text-attire-accent" />
                    <span className="text-[9px] font-bold uppercase tracking-widest text-gray-500">VIP Progress</span>
                </div>
                <span className="text-[10px] font-bold text-gray-900 dark:text-white">
                    ${currentSpend.toLocaleString()} / $1,500
                </span>
            </div>

            {/* Progress Bar Container */}
            <div className="relative h-2 bg-black/5 dark:bg-white/10 rounded-full overflow-hidden">
                <motion.div 
                    initial={{ width: 0 }}
                    animate={{ width: `${percentage}%` }}
                    className="absolute inset-y-0 left-0 bg-gradient-to-r from-attire-accent/50 to-attire-accent shadow-[0_0_10px_rgba(212,175,55,0.5)] transition-all duration-1000"
                />
                
                {/* Tier Markers */}
                {tiers.map((tier, idx) => {
                    const markerPos = (tier.threshold / maxThreshold) * 100;
                    const isReached = currentSpend >= tier.threshold;
                    return (
                        <div 
                            key={idx}
                            className="absolute top-0 bottom-0 w-px bg-white/20 z-10"
                            style={{ left: `${markerPos}%` }}
                        >
                            <div className="absolute -top-1 -left-1 w-2 h-2 rounded-full hidden" />
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
