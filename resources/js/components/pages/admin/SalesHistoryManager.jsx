import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { 
    Search, 
    Filter, 
    Calendar, 
    Download, 
    FileText, 
    Trash2, 
    Undo2, 
    Eye, 
    CheckCircle, 
    Clock, 
    AlertCircle,
    ChevronLeft,
    ChevronRight,
    RefreshCw,
    Wallet
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const SalesHistoryManager = () => {
    const [invoices, setInvoices] = useState([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [page, setPage] = useState(1);
    const [stats, setStats] = useState({ total_sales: 0, total_invoices: 0, total_refunds: 0 });

    const fetchInvoices = async () => {
        setLoading(true);
        try {
            const response = await axios.get('/api/v1/admin/pos/invoices', {
                params: { search, page }
            });
            setInvoices(response.data.data);
            // Optionally fetch stats if the API provides it or have a separate endpoint
        } catch (error) {
            console.error('Fetch invoices failed', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchInvoices();
    }, [page]);

    return (
        <div className="p-8 space-y-8 font-sans">
            {/* Header Section */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900 dark:text-white uppercase tracking-[0.2em]">
                        POS Sales History
                    </h1>
                    <p className="text-sm text-gray-500 dark:text-gray-400 mt-1 uppercase tracking-widest">
                        Manage transactions, refunds, and daily reports
                    </p>
                </div>
                
                <div className="flex items-center gap-3">
                    <button className="flex items-center gap-2 px-4 py-2 bg-black dark:bg-white/10 text-white rounded-xl text-[10px] font-bold uppercase tracking-widest hover:bg-black/80 transition-all border border-black/10 dark:border-white/10">
                        <Download size={14} /> Export Report
                    </button>
                </div>
            </div>

            {/* Quick Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {[
                    { label: 'Today Total Sales', value: '$0.00', icon: <Wallet size={20} />, color: 'text-attire-accent' },
                    { label: 'Completed Invoices', value: '0', icon: <CheckCircle size={20} />, color: 'text-green-500' },
                    { label: 'Pending/Refunded', value: '0', icon: <AlertCircle size={20} />, color: 'text-red-500' }
                ].map((stat, idx) => (
                    <div key={idx} className="p-6 bg-white dark:bg-white/5 border border-black/5 dark:border-white/10 rounded-[2rem] shadow-sm relative overflow-hidden group">
                        <div className="flex items-center justify-between relative z-10">
                            <div className="space-y-1">
                                <p className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">{stat.label}</p>
                                <p className={`text-2xl font-bold tracking-tighter ${stat.color}`}>{stat.value}</p>
                            </div>
                            <div className={`p-4 rounded-2xl bg-black/[0.03] dark:bg-white/[0.03] ${stat.color} group-hover:scale-110 transition-transform`}>
                                {stat.icon}
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            {/* Filter Bar */}
            <div className="flex flex-col md:flex-row gap-4 items-center bg-white dark:bg-white/5 p-4 rounded-[2rem] border border-black/5 dark:border-white/10 shadow-sm">
                <div className="relative flex-1 w-full group">
                    <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-attire-accent transition-colors" />
                    <input 
                        type="text"
                        placeholder="Search invoice number, customer name, or phone..."
                        className="w-full bg-black/[0.02] dark:bg-white/[0.02] border border-black/5 dark:border-white/10 rounded-xl py-3 pl-12 pr-4 text-[11px] font-bold uppercase tracking-widest outline-none focus:border-attire-accent/50 transition-all"
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        onKeyDown={(e) => e.key === 'Enter' && fetchInvoices()}
                    />
                </div>
                <div className="flex gap-2 w-full md:w-auto">
                    <button className="flex items-center gap-2 px-6 py-3 bg-white dark:bg-white/5 border border-black/5 dark:border-white/10 rounded-xl text-[10px] font-bold uppercase tracking-widest text-gray-500 hover:text-attire-accent transition-all whitespace-nowrap">
                        <Calendar size={14} /> Filter Date
                    </button>
                    <button 
                        onClick={fetchInvoices}
                        className="p-3 bg-white dark:bg-white/5 border border-black/5 dark:border-white/10 rounded-xl text-gray-400 hover:text-attire-accent transition-all"
                    >
                        <RefreshCw size={16} className={loading ? 'animate-spin' : ''} />
                    </button>
                </div>
            </div>

            {/* Invoices Table */}
            <div className="bg-white dark:bg-white/5 border border-black/5 dark:border-white/10 rounded-[2.5rem] shadow-xl overflow-hidden min-h-[400px]">
                <table className="w-full text-left border-collapse">
                    <thead>
                        <tr className="bg-black/[0.02] dark:bg-white/[0.02] border-b border-black/5 dark:border-white/5">
                            {['Invoice #', 'Customer', 'Date / Time', 'Items', 'Total', 'Status', 'Actions'].map((h, i) => (
                                <th key={i} className="px-6 py-5 text-[10px] font-bold uppercase tracking-[0.2em] text-gray-500 whitespace-nowrap">{h}</th>
                            ))}
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-black/5 dark:divide-white/5">
                        {loading ? (
                            Array(5).fill(0).map((_, i) => (
                                <tr key={i} className="animate-pulse">
                                    <td colSpan="7" className="px-6 py-8"><div className="h-4 bg-gray-200 dark:bg-white/5 rounded-full w-full" /></td>
                                </tr>
                            ))
                        ) : invoices.length === 0 ? (
                            <tr>
                                <td colSpan="7" className="px-6 py-20 text-center opacity-30 italic font-medium uppercase tracking-widest text-sm">No transactions found</td>
                            </tr>
                        ) : (
                            invoices.map((inv) => (
                                <tr key={inv.id} className="hover:bg-black/[0.01] dark:hover:bg-white/[0.01] transition-colors group">
                                    <td className="px-6 py-6 text-[11px] font-bold text-gray-900 dark:text-white tracking-widest uppercase">
                                        {inv.invoice_number}
                                    </td>
                                    <td className="px-6 py-6">
                                        <div className="flex items-center gap-3">
                                            <div className="w-8 h-8 rounded-lg bg-black/5 dark:bg-white/5 flex items-center justify-center text-gray-400 group-hover:text-attire-accent font-bold text-[10px]">
                                                {inv.customer?.name.charAt(0) || 'W'}
                                            </div>
                                            <div>
                                                <p className="text-[11px] font-bold text-gray-900 dark:text-white uppercase tracking-wider">{inv.customer?.name || 'Walk-in'}</p>
                                                <p className="text-[9px] text-gray-500 uppercase tracking-widest">{inv.customer?.phone || 'No Contact'}</p>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-6">
                                        <div className="text-[10px] font-bold text-gray-700 dark:text-gray-300 uppercase tracking-widest">
                                            {new Date(inv.created_at).toLocaleDateString()}
                                        </div>
                                        <p className="text-[9px] text-gray-500 uppercase tracking-widest mt-1">
                                            {new Date(inv.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                        </p>
                                    </td>
                                    <td className="px-6 py-6 text-[10px] font-bold text-gray-500 uppercase tracking-widest">
                                        {inv.items_count || 0} Products
                                    </td>
                                    <td className="px-6 py-6">
                                        <span className="text-[11px] font-bold text-attire-accent tracking-widest">
                                            ${parseFloat(inv.total_amount).toLocaleString()}
                                        </span>
                                    </td>
                                    <td className="px-6 py-6">
                                        <span className={`px-2 py-1 rounded-lg text-[8px] font-bold uppercase tracking-widest ${
                                            inv.status === 'completed' ? 'bg-green-500/10 text-green-500 border border-green-500/20' : 'bg-red-500/10 text-red-500 border border-red-500/20'
                                        }`}>
                                            {inv.status}
                                        </span>
                                    </td>
                                    <td className="px-6 py-6 text-right">
                                        <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                            <button 
                                                title="View Details"
                                                className="p-2.5 rounded-xl bg-black/5 dark:bg-white/5 text-gray-400 hover:text-attire-accent hover:bg-attire-accent/10 transition-all"
                                            >
                                                <Eye size={14} />
                                            </button>
                                            <button 
                                                title="Initiate Refund"
                                                className="p-2.5 rounded-xl bg-black/5 dark:bg-white/5 text-gray-400 hover:text-red-500 hover:bg-red-500/10 transition-all"
                                            >
                                                <Undo2 size={14} />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>

            {/* Pagination Placeholder */}
            <div className="flex items-center justify-between pb-10">
                <p className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">Showing {invoices.length} transactions</p>
                <div className="flex items-center gap-2">
                    <button className="p-2 rounded-xl border border-black/5 dark:border-white/10 text-gray-400 hover:text-attire-accent transition-all disabled:opacity-30"><ChevronLeft size={16} /></button>
                    <button className="p-2 rounded-xl border border-black/5 dark:border-white/10 text-gray-400 hover:text-attire-accent transition-all disabled:opacity-30"><ChevronRight size={16} /></button>
                </div>
            </div>
        </div>
    );
};

export default SalesHistoryManager;
