import React from 'react';
import { 
    DollarSign, 
    TrendingUp, 
    TrendingDown, 
    ShoppingBag, 
    CreditCard, 
    Wallet,
    ArrowUpRight
} from 'lucide-react';
import { motion } from 'framer-motion';
import { useAdmin } from './AdminContext';
import { LumaSpin } from "@/components/ui/luma-spin";

const DailySummaryWidget = ({ stats, loading }) => {
    const { performanceMode } = useAdmin();
    if (loading) {
        return (
            <div className="h-64 bg-[#fdfdfc] dark:bg-[#161b22] rounded-[2.5rem] border border-black/5 dark:border-[#30363d] flex flex-col items-center justify-center gap-4">
                <LumaSpin size="lg" />
                <p className="text-[10px] font-black uppercase tracking-[0.4em] text-gray-400 dark:text-[#8b949e]/40">Syncing Ledger...</p>
            </div>
        );
    }

    const dailyData = stats?.pos_summary || {
        total_revenue: 0,
        invoice_count: 0,
        total_refunds: 0
    };

    const netRevenue = dailyData.total_revenue - dailyData.total_refunds;
    const avgOrder = dailyData.invoice_count > 0 ? dailyData.total_revenue / dailyData.invoice_count : 0;

    return (
        <motion.div 
            initial={performanceMode ? { opacity: 0 } : { opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={performanceMode ? { duration: 0 } : {}}
            className="bg-[#fdfdfc] dark:bg-[#161b22] p-10 rounded-[3rem] border border-black/5 dark:border-[#30363d] shadow-none"
        >
            <div className="flex items-center justify-between mb-10">
                <div className="flex items-center gap-5">
                    <div className="p-4 bg-[#0d3542] dark:bg-[#58a6ff] text-white dark:text-black rounded-2xl">
                        <DollarSign size={24} />
                    </div>
                    <div>
                        <h3 className="text-2xl font-serif text-gray-900 dark:text-[#c9d1d9] tracking-tight">Sales</h3>
                        <p className="text-[11px] font-black text-gray-400 dark:text-[#8b949e]/40 uppercase tracking-[0.2em] mt-1">Logs</p>
                    </div>
                </div>
                <div className="flex items-center gap-1.5 px-4 py-2 bg-green-500/10 text-green-500 rounded-full text-[10px] font-black uppercase tracking-widest border border-green-500/20">
                    <TrendingUp size={12} /> +14%
                </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                <div className="p-6 bg-black/[0.01] dark:bg-[#0d1117] rounded-3xl border border-black/[0.04] dark:border-[#30363d] shadow-none">
                    <p className="text-[10px] font-black text-gray-400 dark:text-[#8b949e]/40 uppercase tracking-widest mb-2">Gross</p>
                    <p className="text-3xl font-black tracking-tight text-gray-900 dark:text-[#c9d1d9]">${parseFloat(dailyData.total_revenue).toLocaleString()}</p>
                </div>
                <div className="p-6 bg-black/[0.01] dark:bg-[#0d1117] rounded-3xl border border-black/[0.04] dark:border-[#30363d] shadow-none">
                    <p className="text-[10px] font-black text-gray-400 dark:text-[#8b949e]/40 uppercase tracking-widest mb-2">Net</p>
                    <p className="text-3xl font-black tracking-tight text-[#0d3542] dark:text-[#58a6ff]">${parseFloat(netRevenue).toLocaleString()}</p>
                </div>
                <div className="p-6 bg-black/[0.01] dark:bg-[#0d1117] rounded-3xl border border-black/[0.04] dark:border-[#30363d] shadow-none">
                    <p className="text-[10px] font-black text-gray-400 dark:text-[#8b949e]/40 uppercase tracking-widest mb-2">Average</p>
                    <p className="text-2xl font-black tracking-tight text-gray-900 dark:text-[#c9d1d9]">${parseFloat(avgOrder).toLocaleString()}</p>
                </div>
                <div className="p-6 bg-black/[0.01] dark:bg-[#0d1117] rounded-3xl border border-black/[0.04] dark:border-[#30363d] shadow-none">
                    <p className="text-[10px] font-black text-gray-400 dark:text-[#8b949e]/40 uppercase tracking-widest mb-2">Orders</p>
                    <p className="text-2xl font-black tracking-tight text-gray-900 dark:text-[#c9d1d9]">{dailyData.invoice_count}</p>
                </div>
            </div>

            <div className="mt-8 pt-8 border-t border-black/[0.03] dark:border-[#30363d] flex items-center justify-between shadow-none">
                <div className="flex items-center gap-3">
                    <div className="flex -space-x-2">
                        {[Wallet, CreditCard, ShoppingBag].map((Icon, i) => (
                            <div key={i} className="w-8 h-8 rounded-full bg-[#fdfdfc] dark:bg-[#0d1117] border-2 border-black/[0.03] dark:border-[#30363d] flex items-center justify-center text-gray-400 dark:text-[#8b949e]/40 shadow-none">
                                <Icon size={12} />
                            </div>
                        ))}
                    </div>
                    <span className="text-[10px] font-black uppercase tracking-widest text-gray-400 dark:text-[#8b949e]/40">Active</span>
                </div>
                <button className="flex items-center gap-2 text-[9px] font-black uppercase tracking-widest text-[#0d3542] dark:text-[#58a6ff] hover:gap-3 transition-all">
                    Report <ArrowUpRight size={12} />
                </button>
            </div>
        </motion.div>
    );
};

export default DailySummaryWidget;
