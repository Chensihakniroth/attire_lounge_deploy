import React, { useState } from 'react';
import {
    DollarSign,
    Target,
    Activity,
    TrendingUp,
    Pencil,
    Check,
    X,
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAdmin } from './AdminContext';
import { useQuery } from '@tanstack/react-query';
import API from '../../../api';

const GOALS_KEY = 'attire_earning_goals';

const defaultGoals = {
    daily: 5000,
    weekly: 35000,
    monthly: 150000,
};

function loadGoals() {
    try {
        const raw = localStorage.getItem(GOALS_KEY);
        if (raw) return { ...defaultGoals, ...JSON.parse(raw) };
    } catch (_) {}
    return { ...defaultGoals };
}

const DailySummaryWidget = () => {
    const { performanceMode } = useAdmin();
    const [isEditingGoals, setIsEditingGoals] = useState(false);
    const [goals, setGoals] = useState(loadGoals);
    const [draft, setDraft] = useState({ ...goals });

    const todayStr = new Date().toISOString().split('T')[0];
    const { data: reportData, isLoading } = useQuery({
        queryKey: ['sales-report-daily', todayStr],
        queryFn: () => API.getDailySalesReport(todayStr),
        refetchInterval: 30000,
    });

    if (isLoading) {
        return (
            <div className="h-full min-h-[300px] flex items-center justify-center">
                <div className="w-4 h-4 border-2 border-indigo-500/30 border-t-indigo-500 rounded-full animate-spin" />
            </div>
        );
    }

    const { stats = {} } = reportData || {};
    const total_revenue = stats.total_revenue || 0;
    const invoice_count = stats.total_invoices || 0;
    const net_revenue = stats.net_revenue || 0;

    const goalRows = [
        {
            id: 'daily',
            label: 'Day',
            target: goals.daily,
            current: net_revenue,
            color: 'from-indigo-500 to-blue-400',
        },
        {
            id: 'weekly',
            label: 'Week',
            target: goals.weekly,
            current: net_revenue * 7 * 0.8,
            color: 'from-emerald-500 to-teal-400',
        },
        {
            id: 'monthly',
            label: 'Month',
            target: goals.monthly,
            current: net_revenue * 30 * 0.6,
            color: 'from-blue-600 to-indigo-400',
        },
    ];

    const saveGoals = () => {
        const parsed = {
            daily: Math.max(1, parseInt(draft.daily) || defaultGoals.daily),
            weekly: Math.max(1, parseInt(draft.weekly) || defaultGoals.weekly),
            monthly: Math.max(
                1,
                parseInt(draft.monthly) || defaultGoals.monthly
            ),
        };
        setGoals(parsed);
        localStorage.setItem(GOALS_KEY, JSON.stringify(parsed));
        setIsEditingGoals(false);
    };

    const cancelEdit = () => {
        setDraft({ ...goals });
        setIsEditingGoals(false);
    };

    return (
        <motion.div
            initial={performanceMode ? { opacity: 0 } : { opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="h-full flex flex-col pt-2"
        >
            {/* Header Section */}
            <div className="flex items-center justify-between mb-10">
                <div className="flex items-center gap-5">
                    <div className="relative group">
                        <div className="w-12 h-12 rounded-2xl bg-indigo-500/10 flex items-center justify-center text-indigo-500 group-hover:scale-110 transition-transform duration-500">
                            <DollarSign size={20} strokeWidth={2.5} />
                        </div>
                        <div className="absolute -inset-1 bg-indigo-500/20 blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-500 rounded-full" />
                    </div>
                    <div>
                        <h3 className="text-sm font-black text-gray-900 dark:text-white uppercase tracking-[0.1em] leading-none mb-1">
                            Earnings
                        </h3>
                        <p className="text-[10px] text-gray-400 dark:text-[#8b949e]/40 uppercase tracking-[0.3em] font-black">
                            Daily Stats
                        </p>
                    </div>
                </div>
                <div className="flex flex-col items-end">
                    <span className="text-[10px] font-black text-gray-400 dark:text-[#8b949e]/30 uppercase tracking-[0.2em] mb-1">
                        Profit
                    </span>
                    <div className="text-xl font-black text-[#0d3542] dark:text-[#58a6ff] tabular-nums tracking-tighter">
                        ${parseFloat(net_revenue).toLocaleString()}
                    </div>
                </div>
            </div>

            {/* Metrics Grid */}
            <div className="grid grid-cols-2 gap-4 mb-10">
                <div className="relative overflow-hidden p-5 rounded-[2rem] bg-[#fdfdfc] dark:bg-white/[0.02] border border-black/5 dark:border-white/5 group hover:border-[#0d3542]/20 dark:hover:border-[#58a6ff]/20 transition-all duration-500">
                    <div className="relative z-10">
                        <p className="text-[10px] font-black text-gray-400 dark:text-[#8b949e]/30 uppercase tracking-[0.3em] mb-2.5 group-hover:text-[#0d3542] dark:group-hover:text-[#58a6ff] transition-colors">
                            Sales
                        </p>
                        <div className="flex items-baseline gap-1">
                            <span className="text-2xl font-black tracking-tighter text-[#0d3542] dark:text-[#58a6ff]">
                                ${Math.floor(total_revenue).toLocaleString()}
                            </span>
                            <span className="text-[10px] font-black text-gray-300 dark:text-gray-700 font-mono uppercase tracking-widest">
                                USD
                            </span>
                        </div>
                    </div>
                </div>

                <div className="relative overflow-hidden p-5 rounded-[2rem] bg-[#fdfdfc] dark:bg-white/[0.02] border border-black/5 dark:border-white/5 group hover:border-emerald-500/20 transition-all duration-500">
                    <div className="relative z-10">
                        <p className="text-[10px] font-black text-gray-400 dark:text-[#8b949e]/30 uppercase tracking-[0.3em] mb-2.5 group-hover:text-emerald-500 transition-colors">
                            Orders
                        </p>
                        <div className="flex items-baseline gap-2">
                            <span className="text-2xl font-black tracking-tighter text-emerald-600 dark:text-emerald-400">
                                {invoice_count}
                            </span>
                        </div>
                    </div>
                </div>
            </div>

            {/* Goals Section */}
            <div className="space-y-6 flex-grow">
                <div className="flex items-center justify-between mb-1">
                    <div className="flex items-center gap-3">
                        <div className="p-1.5 rounded-lg bg-black/[0.03] dark:bg-white/[0.03]">
                            <Target
                                size={12}
                                className="text-[#0d3542] dark:text-[#58a6ff]"
                            />
                        </div>
                        <span className="text-[10px] font-black uppercase tracking-[0.3em] text-gray-400 dark:text-white/10">
                            Projected Goals
                        </span>
                    </div>
                    <div className="flex items-center gap-2">
                        {isEditingGoals ? (
                            <>
                                <button
                                    onClick={saveGoals}
                                    className="flex items-center gap-1 px-2 py-1 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-500 hover:bg-emerald-500 hover:text-white transition-all"
                                >
                                    <Check size={10} />
                                    <span className="text-[8px] font-black uppercase tracking-widest">
                                        Save
                                    </span>
                                </button>
                                <button
                                    onClick={cancelEdit}
                                    className="flex items-center gap-1 px-2 py-1 rounded-lg bg-black/5 dark:bg-white/5 border border-black/10 dark:border-white/10 text-gray-400 hover:text-red-500 transition-all"
                                >
                                    <X size={10} />
                                </button>
                            </>
                        ) : (
                            <button
                                onClick={() => {
                                    setDraft({ ...goals });
                                    setIsEditingGoals(true);
                                }}
                                title="Set earning goals"
                                className="flex items-center gap-1.5 px-2 py-1 rounded-lg bg-black/[0.03] dark:bg-white/[0.03] border border-black/5 dark:border-white/5 text-gray-400 hover:text-[#0d3542] dark:hover:text-[#58a6ff] hover:border-[#0d3542]/20 dark:hover:border-[#58a6ff]/20 transition-all"
                            >
                                <Pencil size={9} />
                                <span className="text-[8px] font-black uppercase tracking-widest">
                                    Set Goals
                                </span>
                            </button>
                        )}
                    </div>
                </div>

                <AnimatePresence>
                    {isEditingGoals && (
                        <motion.div
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: 'auto' }}
                            exit={{ opacity: 0, height: 0 }}
                            className="overflow-hidden"
                        >
                            <div className="p-4 rounded-2xl bg-[#0d3542]/5 dark:bg-[#58a6ff]/5 border border-[#0d3542]/10 dark:border-[#58a6ff]/10 space-y-3 mb-4">
                                <p className="text-[9px] font-black text-[#0d3542] dark:text-[#58a6ff] uppercase tracking-[0.25em] mb-3">
                                    Set Target ($)
                                </p>
                                {[
                                    { key: 'daily', label: 'Day Goal' },
                                    { key: 'weekly', label: 'Week Goal' },
                                    { key: 'monthly', label: 'Month Goal' },
                                ].map(({ key, label }) => (
                                    <div
                                        key={key}
                                        className="flex items-center gap-3"
                                    >
                                        <span className="text-[9px] font-black uppercase tracking-widest text-gray-400 dark:text-white/30 w-20 shrink-0">
                                            {label}
                                        </span>
                                        <div className="relative flex-1">
                                            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-[11px] font-black text-gray-400 dark:text-white/30">
                                                $
                                            </span>
                                            <input
                                                type="number"
                                                value={draft[key]}
                                                onChange={(e) =>
                                                    setDraft((prev) => ({
                                                        ...prev,
                                                        [key]: e.target.value,
                                                    }))
                                                }
                                                onKeyDown={(e) => {
                                                    if (e.key === 'Enter')
                                                        saveGoals();
                                                    if (e.key === 'Escape')
                                                        cancelEdit();
                                                }}
                                                className="w-full bg-white dark:bg-black/30 border border-[#0d3542]/15 dark:border-[#58a6ff]/15 focus:border-[#0d3542] dark:focus:border-[#58a6ff] rounded-xl pl-6 pr-3 py-2 text-[12px] font-black font-mono text-gray-900 dark:text-white outline-none transition-all [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                                                placeholder="0"
                                                min="1"
                                            />
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>

                {goalRows.map((goal) => {
                    const percentage =
                        goal.target > 0
                            ? Math.min(100, (goal.current / goal.target) * 100)
                            : 0;
                    return (
                        <div key={goal.id} className="space-y-2.5 group">
                            <div className="flex items-center justify-between px-1">
                                <div className="flex items-center gap-3">
                                    <span className="text-[10px] font-black text-gray-900 dark:text-white uppercase tracking-wider group-hover:translate-x-1 transition-transform duration-300">
                                        {goal.label}
                                    </span>
                                </div>
                                <div className="flex items-center gap-3">
                                    <span className="text-[9px] font-mono font-black text-gray-400 dark:text-gray-600">
                                        / ${(goal.target / 1000).toFixed(0)}k
                                    </span>
                                    <span className="text-[9px] font-mono font-black text-[#0d3542] dark:text-[#58a6ff]">
                                        ${Math.round(goal.current / 1000)}k
                                    </span>
                                    <div className="w-8 text-right">
                                        <span
                                            className={`text-[9px] font-mono font-bold ${percentage >= 80 ? 'text-emerald-500' : 'text-gray-400'}`}
                                        >
                                            {Math.round(percentage)}%
                                        </span>
                                    </div>
                                </div>
                            </div>

                            <div className="relative h-1.5 bg-black/[0.05] dark:bg-white/[0.05] rounded-full overflow-hidden p-[1px]">
                                <motion.div
                                    initial={{ width: 0 }}
                                    animate={{ width: `${percentage}%` }}
                                    transition={{
                                        duration: 1.5,
                                        ease: [0.33, 1, 0.68, 1],
                                    }}
                                    className={`relative h-full rounded-full bg-gradient-to-r ${goal.color} opacity-90 shadow-[0_0_8px_rgba(79,70,229,0.3)]`}
                                >
                                    <div className="absolute inset-0 bg-[linear-gradient(45deg,transparent_25%,rgba(255,255,255,0.2)_50%,transparent_75%)] bg-[length:200%_100%] animate-shimmer" />
                                </motion.div>
                            </div>
                        </div>
                    );
                })}
            </div>

            <div className="mt-8 pt-6 border-t border-black/5 dark:border-white/5 flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <div className="flex -space-x-1.5">
                        {[1, 2, 3].map((i) => (
                            <div
                                key={i}
                                className="w-5 h-5 rounded-full border-2 border-[#fdfdfc] dark:border-[#161b22] bg-gray-100 dark:bg-[#1c2128] overflow-hidden"
                            >
                                <Activity
                                    size={10}
                                    className="w-full h-full p-1 text-gray-400"
                                />
                            </div>
                        ))}
                    </div>
                    <span className="text-[9px] font-black uppercase tracking-[0.2em] text-gray-400">
                        Active
                    </span>
                </div>
                <div className="flex items-center gap-1.5 px-2 py-1 bg-black/[0.03] dark:bg-white/[0.03] rounded-lg border border-black/5 dark:border-white/5">
                    <TrendingUp size={10} className="text-indigo-500" />
                    <span className="text-[9px] font-black text-indigo-500 uppercase tracking-widest">
                        +4.2%
                    </span>
                </div>
            </div>
        </motion.div>
    );
};

export default DailySummaryWidget;
