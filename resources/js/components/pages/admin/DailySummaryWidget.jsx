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

const DailySummaryWidget = ({ stats, loading }) => {
    if (loading) {
        return (
            <div className="h-64 bg-white dark:bg-white/5 rounded-[2.5rem] border border-black/5 dark:border-white/10 animate-pulse flex items-center justify-center">
                <p className="text-[10px] font-black uppercase tracking-[0.4em] text-gray-400">Syncing Ledger...</p>
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
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white dark:bg-black/20 backdrop-blur-xl p-8 rounded-[2.5rem] border border-black/5 dark:border-white/10 shadow-xl shadow-black/[0.02]"
        >
            <div className="flex items-center justify-between mb-8">
                <div className="flex items-center gap-4">
                    <div className="p-3 bg-attire-accent text-black rounded-2xl shadow-[0_10px_20px_rgba(245,168,28,0.2)]">
                        <DollarSign size={20} />
                    </div>
                    <div>
                        <h3 className="text-xl font-serif text-gray-900 dark:text-white tracking-tight">Daily POS Insights</h3>
                        <p className="text-[10px] font-black text-gray-400 dark:text-white/20 uppercase tracking-[0.2em]">Transaction Ledger</p>
                    </div>
                </div>
                <div className="flex items-center gap-1.5 px-3 py-1 bg-green-500/10 text-green-500 rounded-full text-[9px] font-black uppercase tracking-widest border border-green-500/20">
                    <TrendingUp size={10} /> +14%
                </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
                <div className="p-5 bg-black/[0.02] dark:bg-white/[0.02] rounded-3xl border border-black/5 dark:border-white/5">
                    <p className="text-[9px] font-black text-gray-400 dark:text-white/20 uppercase tracking-widest mb-1">Gross Revenue</p>
                    <p className="text-2xl font-bold tracking-tighter text-gray-900 dark:text-white">${parseFloat(dailyData.total_revenue).toLocaleString()}</p>
                </div>
                <div className="p-5 bg-black/[0.02] dark:bg-white/[0.02] rounded-3xl border border-black/5 dark:border-white/5">
                    <p className="text-[9px] font-black text-gray-400 dark:text-white/20 uppercase tracking-widest mb-1">Net Revenue</p>
                    <p className="text-2xl font-bold tracking-tighter text-attire-accent">${parseFloat(netRevenue).toLocaleString()}</p>
                </div>
                <div className="p-5 bg-black/[0.02] dark:bg-white/[0.02] rounded-3xl border border-black/5 dark:border-white/5">
                    <p className="text-[9px] font-black text-gray-400 dark:text-white/20 uppercase tracking-widest mb-1">Avg. Ticket</p>
                    <p className="text-xl font-bold tracking-tighter text-gray-900 dark:text-white">${parseFloat(avgOrder).toLocaleString()}</p>
                </div>
                <div className="p-5 bg-black/[0.02] dark:bg-white/[0.02] rounded-3xl border border-black/5 dark:border-white/5">
                    <p className="text-[9px] font-black text-gray-400 dark:text-white/20 uppercase tracking-widest mb-1">Invoice Count</p>
                    <p className="text-xl font-bold tracking-tighter text-gray-900 dark:text-white">{dailyData.invoice_count}</p>
                </div>
            </div>

            <div className="mt-8 pt-8 border-t border-black/5 dark:border-white/5 flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <div className="flex -space-x-2">
                        {[Wallet, CreditCard, ShoppingBag].map((Icon, i) => (
                            <div key={i} className="w-8 h-8 rounded-full bg-white dark:bg-[#1a1a1a] border-2 border-gray-50 dark:border-[#0a0a0a] flex items-center justify-center text-gray-400">
                                <Icon size={12} />
                            </div>
                        ))}
                    </div>
                    <span className="text-[9px] font-black uppercase tracking-widest text-gray-400">Multi-Channel Active</span>
                </div>
                <button className="flex items-center gap-2 text-[9px] font-black uppercase tracking-widest text-attire-accent hover:text-white transition-colors">
                    Report Details <ArrowUpRight size={12} />
                </button>
            </div>
        </motion.div>
    );
};

export default DailySummaryWidget;
