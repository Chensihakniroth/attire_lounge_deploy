import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
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
    Wallet,
    Copy,
    X
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const SalesHistoryManager = () => {
    const navigate = useNavigate();
    const [invoices, setInvoices] = useState([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [page, setPage] = useState(1);
    const [date, setDate] = useState(() => {
        const d = new Date();
        return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
    });
    const [pagination, setPagination] = useState({
        current_page: 1,
        last_page: 1,
        total: 0,
        from: 0,
        to: 0
    });
    const [stats, setStats] = useState({ total_sales: 0, completed_count: 0, pending_refunded_count: 0 });

    const getTodayString = () => {
        const d = new Date();
        return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
    };

    const fetchInvoices = async (pageOverride) => {
        setLoading(true);
        const targetPage = pageOverride !== undefined ? pageOverride : page;
        try {
            const response = await axios.get('/api/v1/admin/pos/invoices', {
                params: { 
                    search, 
                    page: targetPage,
                    date: date || undefined
                }
            });
            setInvoices(response.data.data || []);
            setPagination({
                current_page: response.data.current_page || 1,
                last_page: response.data.last_page || 1,
                total: response.data.total || 0,
                from: response.data.from || 0,
                to: response.data.to || 0
            });
        } catch (error) {
            console.error('Fetch invoices failed', error);
        } finally {
            setLoading(false);
        }
    };

    const fetchStats = async (selectedDate) => {
        try {
            const dateToFetch = selectedDate || getTodayString();
            const response = await axios.get('/api/v1/admin/pos/summary/daily', {
                params: { date: dateToFetch }
            });
            setStats({
                total_sales: response.data.total_revenue || 0,
                completed_count: response.data.invoice_count || 0,
                pending_refunded_count: response.data.pending_refunded_count || 0
            });
        } catch (error) {
            console.error('Fetch stats failed', error);
        }
    };

    const handleSearch = () => {
        setPage(1);
        fetchInvoices(1);
    };

    const handleDateChange = (newDate) => {
        setDate(newDate);
        setPage(1);
    };

    const handleRefresh = () => {
        setPage(1);
        fetchInvoices(1);
        fetchStats(date);
    };

    useEffect(() => {
        fetchInvoices();
        fetchStats(date);
    }, [page, date]);

    return (
        <div className="p-8 space-y-8 font-sans">
            {/* Header Section */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div>
                    <h1 className="text-2xl font-serif text-gray-900 dark:text-[#c9d1d9] uppercase tracking-[0.2em]">
                        POS Sales History
                    </h1>
                    <p className="text-sm text-gray-500 dark:text-[#8b949e]/60 mt-1 uppercase tracking-widest">
                        Manage transactions, refunds, and daily reports
                    </p>
                </div>
                
                <div className="flex items-center gap-3">
                    <button className="flex items-center gap-2 px-4 py-2 bg-[#0d3542] dark:bg-[#58a6ff] text-white dark:text-black rounded-xl text-xs font-bold uppercase tracking-widest hover:scale-105 transition-all shadow-none border border-transparent">
                        <Download size={14} /> Export Report
                    </button>
                </div>
            </div>

            {/* Quick Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {[
                    { 
                        label: date ? 'Selected Date Total Sales' : 'Today Total Sales', 
                        value: `$${parseFloat(stats.total_sales || 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`, 
                        icon: <Wallet size={20} />, 
                        color: 'text-[#0d3542] dark:text-[#58a6ff]' 
                    },
                    { 
                        label: 'Completed Invoices', 
                        value: String(stats.completed_count || 0), 
                        icon: <CheckCircle size={20} />, 
                        color: 'text-green-500' 
                    },
                    { 
                        label: 'Pending/Refunded', 
                        value: String(stats.pending_refunded_count || 0), 
                        icon: <AlertCircle size={20} />, 
                        color: 'text-red-500' 
                    }
                ].map((stat, idx) => (
                    <div key={idx} className="p-6 bg-white dark:bg-[#161b22] border border-black/5 dark:border-[#30363d] rounded-xl shadow-none relative overflow-hidden group">
                        <div className="flex items-center justify-between relative z-10">
                            <div className="space-y-1">
                                <p className="text-xs font-bold text-gray-500 dark:text-[#8b949e]/40 uppercase tracking-widest">{stat.label}</p>
                                <p className={`text-2xl font-bold tracking-tighter ${stat.color}`}>{stat.value}</p>
                            </div>
                            <div className={`p-4 rounded-lg bg-black/[0.03] dark:bg-[#0d1117] ${stat.color} group-hover:scale-110 transition-transform border border-black/5 dark:border-[#30363d]`}>
                                {stat.icon}
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            {/* Filter Bar */}
            <div className="flex flex-col md:flex-row gap-4 items-center bg-white dark:bg-[#161b22] p-4 rounded-xl border border-black/5 dark:border-[#30363d] shadow-none">
                <div className="relative flex-1 w-full group">
                    <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-[#0d3542] dark:group-focus-within:text-[#58a6ff] transition-colors" />
                    <input 
                        type="text"
                        placeholder="Search invoice number, customer name, or phone..."
                        className="w-full bg-black/[0.02] dark:bg-[#0d1117] border border-black/5 dark:border-[#30363d] rounded-lg py-3 pl-12 pr-4 text-sm font-bold uppercase tracking-widest outline-none focus:border-[#0d3542]/50 dark:focus:border-[#58a6ff]/50 transition-all placeholder:text-gray-400 dark:placeholder:text-[#8b949e]/20"
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                    />
                </div>
                <div className="flex gap-2 w-full md:w-auto">
                    <div className="relative flex items-center bg-white dark:bg-[#0d1117] border border-black/5 dark:border-[#30363d] rounded-lg px-4 py-2 hover:text-[#0d3542] dark:hover:text-[#58a6ff] transition-all whitespace-nowrap">
                        <Calendar size={14} className="text-gray-400 dark:text-[#8b949e]/40 mr-2" />
                        <input 
                            type="date"
                            className="bg-transparent text-xs font-bold uppercase tracking-widest text-gray-500 dark:text-[#8b949e]/60 outline-none border-none cursor-pointer"
                            value={date}
                            onChange={(e) => handleDateChange(e.target.value)}
                        />
                        {date && (
                            <button 
                                onClick={() => handleDateChange('')}
                                className="ml-2 text-xs font-bold text-gray-400 hover:text-red-500"
                                title="Clear date filter"
                            >
                                <X size={12} />
                            </button>
                        )}
                    </div>
                    <button 
                        onClick={handleRefresh}
                        className="p-3 bg-white dark:bg-[#0d1117] border border-black/5 dark:border-[#30363d] rounded-lg text-gray-400 hover:text-[#0d3542] dark:hover:text-[#58a6ff] transition-all"
                    >
                        <RefreshCw size={16} className={loading ? 'animate-spin' : ''} />
                    </button>
                </div>
            </div>

            {/* Invoices Table */}
            <div className="bg-white dark:bg-[#161b22] border border-black/5 dark:border-[#30363d] rounded-xl shadow-none overflow-hidden min-h-[400px]">
                <table className="w-full text-left border-collapse">
                    <thead>
                        <tr className="bg-black/[0.02] dark:bg-[#0d1117] border-b border-black/5 dark:border-[#30363d]">
                            {['Invoice #', 'Customer', 'Date / Time', 'Items', 'Total', 'Status', 'Actions'].map((h, i) => (
                                <th key={i} className="px-6 py-5 text-xs font-bold uppercase tracking-[0.2em] text-gray-500 dark:text-[#8b949e]/40 whitespace-nowrap">{h}</th>
                            ))}
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-black/5 dark:divide-[#30363d]">
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
                                    <td className="px-6 py-6 text-sm font-bold text-gray-900 dark:text-[#c9d1d9] tracking-widest uppercase">
                                        {inv.invoice_number}
                                    </td>
                                    <td className="px-6 py-6">
                                        <div className="flex items-center gap-3">
                                            <div className="w-8 h-8 rounded-lg bg-black/5 dark:bg-[#0d1117] flex items-center justify-center text-gray-400 group-hover:text-[#0d3542] dark:group-hover:text-[#58a6ff] font-bold text-xs border border-transparent dark:border-[#30363d]">
                                                {inv.customer?.name?.charAt(0) || 'W'}
                                            </div>
                                            <div>
                                                <p className="text-sm font-bold text-gray-900 dark:text-[#c9d1d9] uppercase tracking-wider">{inv.customer?.name || 'Walk-in'}</p>
                                                <p className="text-xs text-gray-500 dark:text-[#8b949e]/40 uppercase tracking-widest">{inv.customer?.phone || 'No Contact'}</p>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-6">
                                        <div className="text-xs font-bold text-gray-700 dark:text-gray-300 uppercase tracking-widest">
                                            {new Date(inv.created_at).toLocaleDateString()}
                                        </div>
                                        <p className="text-xs text-gray-500 uppercase tracking-widest mt-1">
                                            {new Date(inv.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                        </p>
                                    </td>
                                    <td className="px-6 py-6 text-xs font-bold text-gray-500 dark:text-[#8b949e]/60 uppercase tracking-widest">
                                        {inv.items?.length || 0} Products
                                    </td>
                                    <td className="px-6 py-6">
                                        <span className="text-sm font-bold text-[#0d3542] dark:text-[#58a6ff] tracking-widest">
                                            ${parseFloat(inv.grand_total || 0).toLocaleString()}
                                        </span>
                                    </td>
                                    <td className="px-6 py-6">
                                        <span className={`px-2 py-1 rounded-lg text-xs font-bold uppercase tracking-widest ${
                                            inv.status === 'completed' ? 'bg-green-500/10 text-green-500 border border-green-500/20' :
                                            inv.status === 'void' ? 'bg-gray-500/10 text-gray-500 border border-gray-500/20' :
                                            inv.status === 'refunded' ? 'bg-orange-500/10 text-orange-500 border border-orange-500/20' :
                                            'bg-red-500/10 text-red-500 border border-red-500/20'
                                        }`}>
                                            {inv.status}
                                        </span>
                                    </td>
                                    <td className="px-6 py-6 text-right">
                                        <div className="flex items-center gap-2">
                                            <button 
                                                title="Clone Invoice into POS"
                                                onClick={() => navigate(`/admin/pos?action=clone&invoice=${inv.id}`)}
                                                className="p-2.5 rounded-lg bg-black/5 dark:bg-[#0d1117] text-gray-400 hover:text-[#0d3542] dark:hover:text-[#58a6ff] hover:bg-[#0d3542]/10 dark:hover:bg-[#58a6ff]/10 transition-all border border-transparent dark:border-[#30363d]"
                                            >
                                                <Copy size={14} />
                                            </button>
                                            <button 
                                                title="Initiate Refund in POS"
                                                onClick={() => navigate(`/admin/pos?action=refund&invoice=${inv.id}`)}
                                                className="p-2.5 rounded-lg bg-black/5 dark:bg-[#0d1117] text-gray-400 hover:text-red-500 hover:bg-red-500/10 transition-all border border-transparent dark:border-[#30363d]"
                                            >
                                                <Undo2 size={14} />
                                            </button>
                                            {!['void', 'refunded'].includes(inv.status) && (
                                                <button 
                                                    title="Void Invoice"
                                                    onClick={async () => {
                                                        if (!window.confirm('Void this invoice? Stock will be restored and the invoice will be marked as voided.')) return;
                                                        try {
                                                            await axios.post(`/api/v1/admin/pos/invoices/${inv.id}/void`, { reason: 'Voided from admin' });
                                                            handleRefresh();
                                                        } catch (err) {
                                                            alert(err.response?.data?.message || 'Failed to void invoice');
                                                        }
                                                    }}
                                                    className="p-2.5 rounded-lg bg-black/5 dark:bg-[#0d1117] text-gray-400 hover:text-orange-500 hover:bg-orange-500/10 transition-all border border-transparent dark:border-[#30363d]"
                                                >
                                                    <X size={14} />
                                                </button>
                                            )}
                                        </div>
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>

            {/* Pagination Controls */}
            <div className="flex items-center justify-between pb-10">
                <p className="text-xs font-bold text-gray-500 dark:text-[#8b949e]/40 uppercase tracking-widest">
                    Showing {pagination.from}-{pagination.to} of {pagination.total} transactions
                </p>
                <div className="flex items-center gap-2">
                    <button 
                        disabled={pagination.current_page <= 1}
                        onClick={() => setPage(prev => Math.max(1, prev - 1))}
                        className="p-2 rounded-xl border border-black/5 dark:border-[#30363d] text-gray-400 hover:text-[#0d3542] dark:hover:text-[#58a6ff] transition-all disabled:opacity-30 disabled:pointer-events-none"
                    >
                        <ChevronLeft size={16} />
                    </button>
                    <span className="text-xs font-bold text-gray-500 dark:text-[#8b949e]/40 uppercase tracking-widest px-2">
                        Page {pagination.current_page} of {pagination.last_page}
                    </span>
                    <button 
                        disabled={pagination.current_page >= pagination.last_page}
                        onClick={() => setPage(prev => Math.min(pagination.last_page, prev + 1))}
                        className="p-2 rounded-xl border border-black/5 dark:border-[#30363d] text-gray-400 hover:text-[#0d3542] dark:hover:text-[#58a6ff] transition-all disabled:opacity-30 disabled:pointer-events-none"
                    >
                        <ChevronRight size={16} />
                    </button>
                </div>
            </div>
        </div>
    );
};

export default SalesHistoryManager;
