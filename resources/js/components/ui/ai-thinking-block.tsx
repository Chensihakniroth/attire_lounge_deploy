import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { ThinkingOrb, OrbState } from './thinking-orb';

export interface LiveToolCall {
    name: string;
    args?: any;
    status: 'running' | 'completed' | 'failed';
    duration_ms?: number;
    summary?: string;
    tool_call_id?: string;
}

export interface AIThinkingBlockProps {
    outletName?: string;
    thinkingText?: string;
    liveTools?: LiveToolCall[];
    state?: OrbState;
    className?: string;
}

export function AIThinkingBlock({
    outletName = "Attire Lounge",
    thinkingText,
    liveTools = [],
    state = "working",
    className = ""
}: AIThinkingBlockProps) {
    const [timer, setTimer] = useState(0);
    const [orbState, setOrbState] = useState<OrbState>(state);

    useEffect(() => {
        setOrbState(state);
    }, [state]);

    useEffect(() => {
        const states: OrbState[] = ['searching', 'solving', 'working', 'composing'];
        const interval = setInterval(() => {
            setTimer((prev) => {
                const next = prev + 1;
                if (next > 1 && next % 3 === 0) {
                    const idx = Math.floor(next / 3) % states.length;
                    setOrbState(states[idx]);
                }
                return next;
            });
        }, 1000);
        return () => clearInterval(interval);
    }, []);

    // Determine current status message
    const activeTool = liveTools.find((t) => t.status === 'running');
    let displayStatus = `${outletName} Is Working…`;
    if (activeTool) {
        displayStatus = `${outletName} Is Executing ${activeTool.name}…`;
    } else if (thinkingText && thinkingText.length < 50) {
        displayStatus = thinkingText;
    } else {
        displayStatus = `${outletName} Is ${orbState.charAt(0).toUpperCase() + orbState.slice(1)}…`;
    }

    return (
        <motion.div
            initial={{ opacity: 0, y: 3 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -3, transition: { duration: 0.15 } }}
            className={`inline-flex items-center gap-2.5 py-1 ${className}`}
        >
            {/* Minimal Orb */}
            <div className="relative flex h-5 w-5 shrink-0 items-center justify-center">
                <ThinkingOrb state={orbState} size={20} theme="auto" />
            </div>

            {/* Clean Status Label */}
            <p className="text-[13px] font-semibold text-foreground dark:text-white truncate">
                {displayStatus}
            </p>

            {/* Timer Badge */}
            <span className="rounded-md bg-muted dark:bg-white/10 px-2 py-0.5 font-mono text-[11px] font-medium text-muted-foreground dark:text-white/70">
                {timer}s
            </span>
        </motion.div>
    );
}

export default AIThinkingBlock;
