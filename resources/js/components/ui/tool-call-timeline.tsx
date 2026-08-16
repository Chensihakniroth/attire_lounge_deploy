import React, { useState } from 'react';
import {
    ChevronDown,
    ChevronUp,
    Check,
    Database,
    Search,
    ShoppingBag,
    Receipt,
    Users,
    AlertTriangle,
    Calendar,
    Tag,
    Gift,
    Scissors,
    TrendingUp,
    Bell,
    Activity,
    Mail,
    Wrench,
    Sparkles,
    CheckCircle2,
    Clock,
    Terminal,
    ArrowRight
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export interface ToolCallItem {
    name: string;
    args?: Record<string, any>;
    status?: 'running' | 'completed' | 'failed';
    duration?: string;
}

export interface ToolCallTimelineProps {
    tools: (string | ToolCallItem)[];
    isLive?: boolean;
    defaultExpanded?: boolean;
    className?: string;
}

/**
 * Returns descriptive metadata and icons for each business tool
 */
function getToolMeta(toolName: string) {
    const raw = (toolName || '').toLowerCase().trim();
    
    if (raw.includes('product') || raw.includes('stock')) {
        return {
            title: raw.replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase()),
            domain: 'Inventory & Products',
            icon: ShoppingBag,
            color: 'text-amber-500 dark:text-amber-400',
            bgColor: 'bg-amber-500/10 dark:bg-amber-500/15',
            borderColor: 'border-amber-500/30'
        };
    }
    if (raw.includes('order') || raw.includes('invoice') || raw.includes('sales') || raw.includes('refund')) {
        return {
            title: raw.replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase()),
            domain: 'Orders & Transactions',
            icon: Receipt,
            color: 'text-emerald-500 dark:text-emerald-400',
            bgColor: 'bg-emerald-500/10 dark:bg-emerald-500/15',
            borderColor: 'border-emerald-500/30'
        };
    }
    if (raw.includes('appointment') || raw.includes('booking') || raw.includes('schedule')) {
        return {
            title: raw.replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase()),
            domain: 'Fittings & Appointments',
            icon: Calendar,
            color: 'text-blue-500 dark:text-blue-400',
            bgColor: 'bg-blue-500/10 dark:bg-blue-500/15',
            borderColor: 'border-blue-500/30'
        };
    }
    if (raw.includes('customer') || raw.includes('client')) {
        return {
            title: raw.replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase()),
            domain: 'Customer CRM',
            icon: Users,
            color: 'text-indigo-500 dark:text-indigo-400',
            bgColor: 'bg-indigo-500/10 dark:bg-indigo-500/15',
            borderColor: 'border-indigo-500/30'
        };
    }
    if (raw.includes('altering') || raw.includes('tailor')) {
        return {
            title: raw.replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase()),
            domain: 'Bespoke Tailoring',
            icon: Scissors,
            color: 'text-purple-500 dark:text-purple-400',
            bgColor: 'bg-purple-500/10 dark:bg-purple-500/15',
            borderColor: 'border-purple-500/30'
        };
    }
    if (raw.includes('gift')) {
        return {
            title: raw.replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase()),
            domain: 'Gift Registry',
            icon: Gift,
            color: 'text-pink-500 dark:text-pink-400',
            bgColor: 'bg-pink-500/10 dark:bg-pink-500/15',
            borderColor: 'border-pink-500/30'
        };
    }
    if (raw.includes('target') || raw.includes('stat') || raw.includes('pulse')) {
        return {
            title: raw.replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase()),
            domain: 'Analytics & KPIs',
            icon: TrendingUp,
            color: 'text-cyan-500 dark:text-cyan-400',
            bgColor: 'bg-cyan-500/10 dark:bg-cyan-500/15',
            borderColor: 'border-cyan-500/30'
        };
    }
    if (raw.includes('promo')) {
        return {
            title: raw.replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase()),
            domain: 'Promotions & Discounts',
            icon: Tag,
            color: 'text-orange-500 dark:text-orange-400',
            bgColor: 'bg-orange-500/10 dark:bg-orange-500/15',
            borderColor: 'border-orange-500/30'
        };
    }
    if (raw.includes('newsletter') || raw.includes('subscriber')) {
        return {
            title: raw.replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase()),
            domain: 'Audience & Newsletter',
            icon: Mail,
            color: 'text-teal-500 dark:text-teal-400',
            bgColor: 'bg-teal-500/10 dark:bg-teal-500/15',
            borderColor: 'border-teal-500/30'
        };
    }

    return {
        title: raw.replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase()) || 'System Query',
        domain: 'Data Operation',
        icon: Database,
        color: 'text-primary dark:text-primary',
        bgColor: 'bg-primary/10',
        borderColor: 'border-primary/30'
    };
}

/**
 * Claude-style collapsible tool execution timeline
 */
export function ToolCallTimeline({
    tools = [],
    isLive = false,
    defaultExpanded = true,
    className = ''
}: ToolCallTimelineProps) {
    const [isExpanded, setIsExpanded] = useState(defaultExpanded);

    if (!tools || tools.length === 0) return null;

    const normalizedTools: ToolCallItem[] = tools.map((t) => {
        if (typeof t === 'string') {
            return { name: t, status: 'completed' };
        }
        return { ...t, status: t.status || 'completed' };
    });

    const uniqueDomains = Array.from(
        new Set(normalizedTools.map((t) => getToolMeta(t.name).domain))
    );

    return (
        <div className={`mt-0 mb-3 w-full max-w-2xl rounded-2xl border border-border/80 dark:border-white/10 bg-card/60 dark:bg-[#161b22]/70 backdrop-blur-md overflow-hidden shadow-sm ${className}`}>
            {/* Claude-Style Accordion Header */}
            <button
                type="button"
                onClick={() => setIsExpanded(!isExpanded)}
                className="w-full flex items-center justify-between px-3.5 py-2.5 text-left transition-colors hover:bg-muted/50 dark:hover:bg-white/5 active:bg-muted/70"
            >
                <div className="flex items-center gap-2.5 min-w-0">
                    <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-lg bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 shadow-xs">
                        <Terminal size={12} className="stroke-[2.5]" />
                    </div>

                    <div className="flex items-center gap-2 min-w-0">
                        <span className="text-[12.5px] font-semibold text-foreground/90 dark:text-white/90">
                            {isLive ? 'Executing Tools & Queries' : `Ran ${normalizedTools.length} ${normalizedTools.length === 1 ? 'tool' : 'tools'}`}
                        </span>

                        <span className="hidden sm:inline-block text-[11px] text-muted-foreground dark:text-white/50">
                            • {uniqueDomains.slice(0, 2).join(', ')}
                        </span>
                    </div>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                    <span className="rounded-full bg-muted/80 dark:bg-white/10 px-2 py-0.5 text-[10px] font-semibold font-mono text-muted-foreground dark:text-white/70">
                        {normalizedTools.length} {normalizedTools.length === 1 ? 'call' : 'calls'}
                    </span>
                    <div className="p-1 rounded-md text-muted-foreground hover:text-foreground dark:text-white/60 dark:hover:text-white">
                        {isExpanded ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
                    </div>
                </div>
            </button>

            {/* Timeline Body */}
            <AnimatePresence>
                {isExpanded && (
                    <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        transition={{ duration: 0.2, ease: 'easeInOut' }}
                        className="border-t border-border/60 dark:border-white/10 bg-muted/20 dark:bg-[#0d1117]/60 px-4 py-3"
                    >
                        <div className="relative pl-6 space-y-4 before:absolute before:left-2.5 before:top-2 before:bottom-2 before:w-[1.5px] before:bg-border dark:before:bg-white/15">
                            {normalizedTools.map((tool, idx) => {
                                const meta = getToolMeta(tool.name);
                                const Icon = meta.icon;
                                const isLast = idx === normalizedTools.length - 1;

                                return (
                                    <motion.div
                                        key={idx}
                                        initial={{ opacity: 0, x: -6 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        transition={{ delay: idx * 0.04 }}
                                        className="relative flex items-start justify-between gap-3 text-xs"
                                    >
                                        {/* Timeline Node Icon / Dot */}
                                        <div
                                            className={`absolute -left-6 top-0.5 flex h-5 w-5 items-center justify-center rounded-full border bg-background dark:bg-[#161b22] shadow-xs ${
                                                tool.status === 'running'
                                                    ? 'border-primary text-primary animate-pulse'
                                                    : 'border-emerald-500/40 text-emerald-500 dark:text-emerald-400'
                                            }`}
                                        >
                                            {tool.status === 'running' ? (
                                                <div className="h-1.5 w-1.5 rounded-full bg-primary animate-ping" />
                                            ) : (
                                                <Check size={11} className="stroke-[3]" />
                                            )}
                                        </div>

                                        {/* Step Info */}
                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-center gap-2 flex-wrap">
                                                <span className="font-semibold text-foreground/95 dark:text-white/95 text-[12.5px]">
                                                    {meta.title}
                                                </span>
                                                <span className="rounded-md bg-muted/60 dark:bg-white/10 px-1.5 py-0.5 font-mono text-[10px] text-muted-foreground dark:text-white/60">
                                                    {tool.name}
                                                </span>
                                            </div>

                                            <p className="text-[11px] text-muted-foreground dark:text-white/50 mt-0.5">
                                                Domain: <span className="font-medium text-foreground/80 dark:text-white/80">{meta.domain}</span>
                                            </p>
                                        </div>

                                        {/* Status Chip */}
                                        <div className="shrink-0 flex items-center gap-1.5">
                                            <span className="inline-flex items-center gap-1 rounded-full bg-emerald-500/10 dark:bg-emerald-500/15 border border-emerald-500/20 px-2 py-0.5 text-[10.5px] font-medium text-emerald-600 dark:text-emerald-400">
                                                <CheckCircle2 size={10} />
                                                Done
                                            </span>
                                        </div>
                                    </motion.div>
                                );
                            })}
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}

export default ToolCallTimeline;
