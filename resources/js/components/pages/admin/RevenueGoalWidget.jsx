import React from 'react';
import { Target, TrendingUp, TrendingDown, DollarSign, Calendar, BarChart3 } from 'lucide-react';
import { motion } from 'framer-motion';
import { useAdmin } from './AdminContext';

const RevenueGoalWidget = ({ stats, loading }) => {
    const { performanceMode } = useAdmin();
    
    if (loading) {
        return (
            <div className="h-full bg-[#fdfdfc] dark:bg-[#161b22] rounded-[2.5rem] border border-black/5 dark:border-[#30363d] flex flex-col items-center justify-center gap-4 p-8">
                <div className="w-16 h-2 bg-black/5 dark:bg-white/10 rounded-full animate-pulse" />
                <div className="w-32 h-2 bg-black/5 dark:bg-white/10 rounded-full animate-pulse" />
            </div>
        );
    }

    const dailyData = stats?.pos_summary || { total_revenue: 0, invoice_count: 0 };
    const currentRevenue = dailyData.total_revenue || 0;
    
    const goals = [
        { id: 'daily', label: 'Daily Target', target: 5000, current: currentRevenue, period: 'Today' },
        { id: 'weekly', label: 'Weekly Target', target: 35000, current: currentRevenue * 7, period: 'This Week' },
        { id: 'monthly', label: 'Monthly Target', target: 150000, current: currentRevenue * 30, period: 'This Month' },
    ];

    const getProgressColor = (percentage) => {
        if (percentage >= 100) return '#10b981';
        if (percentage >= 70) return '#0d3542';
        if (percentage >= 40) return '#f59e0b';
        return '#ef4444';
    };

    return (
        <motion.div 
            initial={performanceMode ? { opacity: 0 } : { opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={performanceMode ? { duration: 0 } : {}}
            className="bg-[#fdfdfc] dark:bg-[#161b22] p-4 rounded-xl border border-black/5 dark:border-[#30363d] shadow-none h-full"
        >
            <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                    <div className="p-2.5 bg-[#0d3542] dark:bg-[#58a6ff] text-white dark:text-black rounded-xl">
                        <Target size={18} />
                    </div>
                    <div>
                        <h3 className="text-sm font-black text-gray-900 dark:text-white uppercase tracking-[0.15em]">Goals</h3>
                        <p className="text-[9px] text-gray-400 dark:text-[#8b949e]/40 uppercase tracking-widest">Revenue Progress</p>
                    </div>
                </div>
            </div>

            <div className="space-y-5">
                {goals.map((goal) => {
                    const percentage = Math.min(100, (goal.current / goal.target) * 100);
                    const isComplete = percentage >= 100;
                    
                    return (
                        <div key={goal.id} className="space-y-2">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                    {goal.id === 'daily' && <Calendar size={10} className="text-gray-400" />}
                                    {goal.id === 'weekly' && <BarChart3 size={10} className="text-gray-400" />}
                                    {goal.id === 'monthly' && <Target size={10} className="text-gray-400" />}
                                    <span className="text-[10px] font-black text-gray-900 dark:text-white uppercase tracking-wider">
                                        {goal.label}
                                    </span>
                                </div>
                                <div className="flex items-center gap-1.5">
                                    {isComplete ? (
                                        <TrendingUp size={10} className="text-green-500" />
                                    ) : (
                                        <TrendingDown size={10} className="text-amber-500" />
                                    )}
                                    <span 
                                        className="text-[10px] font-mono font-black"
                                        style={{ color: getProgressColor(percentage) }}
                                    >
                                        {Math.round(percentage)}%
                                    </span>
                                </div>
                            </div>
                            
                            <div className="relative h-2.5 bg-black/5 dark:bg-white/5 rounded-full overflow-hidden">
                                <motion.div 
                                    initial={{ width: 0 }}
                                    animate={{ width: `${percentage}%` }}
                                    transition={{ duration: performanceMode ? 0 : 0.8, ease: 'easeOut' }}
                                    className="absolute inset-y-0 left-0 rounded-full"
                                    style={{ backgroundColor: getProgressColor(percentage) }}
                                />
                            </div>
                            
                            <div className="flex items-center justify-between">
                                <span className="text-[9px] font-mono text-gray-400 dark:text-[#8b949e]/40">
                                    ${parseFloat(goal.current).toLocaleString()}
                                </span>
                                <span className="text-[9px] font-mono text-gray-400 dark:text-[#8b949e]/40">
                                    / ${goal.target.toLocaleString()}
                                </span>
                            </div>
                        </div>
                    );
                })}
            </div>

            <div className="mt-6 pt-4 border-t border-black/5 dark:border-[#30363d]">
                <div className="flex items-center justify-between">
                    <span className="text-[9px] font-black uppercase tracking-widest text-gray-400 dark:text-[#8b949e]/40">
                        Today's Revenue
                    </span>
                    <span className="text-lg font-black text-[#0d3542] dark:text-[#58a6ff]">
                        ${parseFloat(currentRevenue).toLocaleString()}
                    </span>
                </div>
            </div>
        </motion.div>
    );
};

export default RevenueGoalWidget;