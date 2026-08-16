import React, { useEffect, useState } from 'react';
import { RefreshCw, ChevronDown, ChevronUp } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const DEFAULT_THINKING_PROSE = `First, I need to evaluate the operational context and identify the specific business domains involved in this query. I should inspect the relevant data tables, verify outlet access permissions, and prepare the appropriate query parameters. Once the schema and filtering criteria are confirmed, I will retrieve the live records from the database, aggregate the key metrics, and structure a clear executive response.`;

export function AIThinkingBlock({
    outletName = "Attire AI",
    thinkingText = DEFAULT_THINKING_PROSE,
    onToggle,
    className = ""
}) {
    const [timer, setTimer] = useState(0);
    const [isExpanded, setIsExpanded] = useState(true);

    const handleToggle = () => {
        setIsExpanded((prev) => {
            const next = !prev;
            if (onToggle) {
                setTimeout(onToggle, 50);
                setTimeout(onToggle, 220);
            }
            return next;
        });
    };

    // Live timer
    useEffect(() => {
        const interval = setInterval(() => {
            setTimer((prev) => prev + 1);
        }, 1000);
        return () => clearInterval(interval);
    }, []);

    return (
        <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -6, transition: { duration: 0.15 } }}
            className={`w-full max-w-xl flex flex-col rounded-2xl border border-border/70 dark:border-white/10 bg-card/90 dark:bg-[#161b22]/90 backdrop-blur-2xl p-3.5 shadow-xl shadow-black/5 dark:shadow-black/25 ${className}`}
        >
            {/* Header / Status Bar */}
            <div className="flex items-center justify-between gap-2 px-1">
                <div className="flex items-center gap-2.5">
                    <div className="relative flex h-5 w-5 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
                        <RefreshCw size={12} className="animate-spin text-primary" />
                    </div>
                    
                    <p className="text-[13px] font-semibold text-foreground dark:text-white">
                        {outletName} is thinking
                    </p>

                    <span className="rounded-md bg-muted dark:bg-white/5 px-2 py-0.5 font-mono text-[11px] font-medium text-muted-foreground dark:text-white/60">
                        {timer}s
                    </span>
                </div>

                <button
                    type="button"
                    onClick={handleToggle}
                    className="p-1 rounded-lg text-muted-foreground hover:text-foreground dark:text-white/50 dark:hover:text-white hover:bg-muted dark:hover:bg-white/10 transition-colors"
                    title={isExpanded ? "Collapse thought trace" : "Expand thought trace"}
                >
                    {isExpanded ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
                </button>
            </div>

            {/* Collapsible Scrolling Thought Trace (Pure GPU Hardware Transform) */}
            <AnimatePresence>
                {isExpanded && (
                    <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: "auto" }}
                        exit={{ opacity: 0, height: 0 }}
                        transition={{ duration: 0.2 }}
                        className="relative mt-2.5 overflow-hidden rounded-xl border border-border/50 dark:border-white/5 bg-muted/50 dark:bg-[#0d1117]/80"
                    >
                        {/* Top fade gradient */}
                        <div className="pointer-events-none absolute top-0 left-0 right-0 h-10 bg-gradient-to-b from-muted/95 dark:from-[#0d1117] to-transparent z-10" />

                        {/* Bottom fade gradient */}
                        <div className="pointer-events-none absolute bottom-0 left-0 right-0 h-10 bg-gradient-to-t from-muted/95 dark:from-[#0d1117] to-transparent z-10" />

                        {/* Infinite CSS Marquee Container */}
                        <div className="h-[125px] overflow-hidden px-4 py-2 text-[13px] leading-relaxed text-muted-foreground/90 dark:text-white/80 select-none">
                            <div className="thinking-marquee-track">
                                <div className="py-2">
                                    <p className="whitespace-pre-wrap">{thinkingText}</p>
                                </div>
                                <div className="py-2">
                                    <p className="whitespace-pre-wrap">{thinkingText}</p>
                                </div>
                            </div>
                        </div>

                        <style>{`
                            @keyframes thinkingMarquee {
                                0% {
                                    transform: translate3d(0, 0, 0);
                                }
                                100% {
                                    transform: translate3d(0, -50%, 0);
                                }
                            }
                            .thinking-marquee-track {
                                display: flex;
                                flex-direction: column;
                                animation: thinkingMarquee 26s linear infinite;
                                will-change: transform;
                            }
                        `}</style>
                    </motion.div>
                )}
            </AnimatePresence>
        </motion.div>
    );
}

export default AIThinkingBlock;
