import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Search,
    Package,
    ChevronRight,
    RefreshCcw,
    User,
    ShoppingBag,
    Hash,
    ArrowLeft,
    Download,
    Calendar,
    DollarSign,
    Send
} from 'lucide-react';
import { useAdmin } from './AdminContext';
import { useNavigate } from 'react-router-dom';

const OrderManager = () => {
    const { activeOutlet, OUTLET_CONFIG } = useAdmin();
    const navigate = useNavigate();
    const outletData = OUTLET_CONFIG?.[activeOutlet] || { label: 'Nile' };
    const [invoices, setInvoices] = useState([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [filter, setFilter] = useState('all');
    const [expandedId, setExpandedId] = useState(null);
    const [notifyingId, setNotifyingId] = useState(null);

    const fetchOrders = async () => {
        setLoading(true);
        try {
            const params = {
                order_source: 'woocommerce',
                per_page: 100,
            };

            if (search) params.search = search;

            const now = new Date();
            if (filter === 'today') {
                params.date = now.toISOString().split('T')[0];
            } else if (filter === 'week') {
                const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
                params.from_date = weekAgo.toISOString().split('T')[0];
            } else if (filter === 'month') {
                const monthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
                params.from_date = monthAgo.toISOString().split('T')[0];
            }

            const response = await axios.get('/api/v1/admin/pos/invoices', { params });
            setInvoices(response.data.data || []);
        } catch (err) {
            console.error('Failed to fetch orders:', err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchOrders();
    }, [filter, search]);

    const handleNotifyTelegram = async (invoiceId) => {
        setNotifyingId(invoiceId);
        try {
            const response = await axios.post(`/api/v1/admin/pos/invoices/${invoiceId}/notify-telegram`);
            if (response.data?.success) {
                alert('✅ Notification sent to Telegram group');
            } else {
                alert('❌ Failed: ' + (response.data?.error || 'Unknown error'));
            }
        } catch (err) {
            alert('❌ Error: ' + (err.response?.data?.error || err.message));
        } finally {
            setNotifyingId(null);
        }
    };

    const formatDate = (dateStr) => {
        const d = new Date(dateStr);
        return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
    };

    const formatTime = (dateStr) => {
        const d = new Date(dateStr);
        return d.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
    };

    const getStatusColor = (status) => {
        switch (status) {
            case 'completed': return 'text-emerald-500';
            case 'pending': return 'text-amber-500';
            case 'refunded': return 'text-red-500';
            default: return 'text-gray-500';
        }
    };

    const getStatusBg = (status) => {
        switch (status) {
            case 'completed': return 'bg-emerald-500/10 border-emerald-500/20';
            case 'pending': return 'bg-amber-500/10 border-amber-500/20';
            case 'refunded': return 'bg-red-500/10 border-red-500/20';
            default: return 'bg-gray-500/10 border-gray-500/20';
        }
    };

    const totalRevenue = invoices.reduce((sum, inv) => sum + parseFloat(inv.grand_total || 0), 0);
    const todayOrders = invoices.filter(inv => {
        const d = new Date(inv.date);
        const today = new Date();
        return d.toDateString() === today.toDateString();
    }).length;

    return (
        <div className="p-8 space-y-6 font-sans bg-[#fdfdfc] dark:bg-[#010409] min-h-screen text-gray-900 dark:text-[#c9d1d9]">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <button
                        onClick={() => navigate('/admin')}
                        className="p-2 hover:bg-black/5 dark:hover:bg-white/5 rounded-xl transition-colors"
                    >
                        <ArrowLeft size={20} className="text-gray-500" />
                    </button>
                    <div className="flex items-center gap-3">
                        <div className="w-12 h-12 rounded-xl bg-[#1a1a2e] flex items-center justify-center">
                            <ShoppingBag size={24} className="text-white" />
                        </div>
                        <div>
                            <h1 className="text-2xl font-serif text-gray-900 dark:text-[#c9d1d9] uppercase tracking-[0.2em]">
                                Order Manager
                            </h1>
                            <p className="text-sm text-gray-500 dark:text-[#8b949e]/60 mt-1 uppercase tracking-widest font-medium">
                                {outletData.label} — WooCommerce Orders
                            </p>
                        </div>
                    </div>
                </div>
                <button
                    onClick={fetchOrders}
                    className="flex items-center gap-2 px-4 py-2 bg-black/[0.02] dark:bg-white/[0.02] border border-black/5 dark:border-[#30363d] rounded-xl hover:bg-black/5 dark:hover:bg-white/5 transition-colors"
                >
                    <RefreshCcw size={14} className="text-gray-500" />
                    <span className="text-[10px] font-bold uppercase tracking-widest text-gray-500">Refresh</span>
                </button>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                {[
                    { label: 'TOTAL ORDERS', value: invoices.length, icon: <ShoppingBag size={20} />, color: 'text-[#1a1a2e] dark:text-[#58a6ff]' },
                    { label: 'TODAY', value: todayOrders, icon: <Calendar size={20} />, color: 'text-blue-500' },
                    { label: 'REVENUE', value: `$${totalRevenue.toFixed(2)}`, icon: <DollarSign size={20} />, color: 'text-emerald-500' },
                    { label: 'CURRENCY', value: 'USD', icon: <Hash size={20} />, color: 'text-purple-500' },
                ].map((stat, idx) => (
                    <div key={idx} className="p-6 bg-white dark:bg-[#161b22] border border-black/5 dark:border-[#30363d] rounded-xl shadow-none relative overflow-hidden group">
                        <div className="flex items-center justify-between relative z-10">
                            <div className="space-y-1">
                                <p className="text-[9px] font-black text-gray-500 dark:text-[#8b949e]/40 uppercase tracking-widest">
                                    {stat.label}
                                </p>
                                <p className={`text-2xl font-black tracking-tighter ${stat.color}`}>
                                    {stat.value}
                                </p>
                            </div>
                            <div className={`p-4 rounded-lg bg-black/[0.03] dark:bg-[#0d1117] ${stat.color} group-hover:scale-110 transition-transform border border-black/5 dark:border-[#30363d]`}>
                                {stat.icon}
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            {/* Search + Filter */}
            <div className="flex flex-col md:flex-row gap-4 items-center bg-white dark:bg-[#161b22] p-4 rounded-xl border border-black/5 dark:border-[#30363d] shadow-none">
                <div className="relative flex-1 w-full">
                    <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
                    <input
                        type="text"
                        placeholder="Search by WC order ID, customer name..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        className="w-full bg-black/[0.02] dark:bg-[#0d1117] border border-black/5 dark:border-[#30363d] rounded-lg py-3 pl-12 pr-4 text-sm font-bold uppercase tracking-widest outline-none focus:border-[#1a1a2e]/50 dark:focus:border-[#58a6ff]/50 transition-all placeholder:text-gray-400 dark:placeholder:text-[#8b949e]/20"
                    />
                </div>
                <div className="flex gap-2 w-full md:w-auto">
                    {['all', 'today', 'week', 'month'].map((f) => (
                        <button
                            key={f}
                            onClick={() => setFilter(f)}
                            className={`flex-1 md:flex-none px-4 py-2.5 rounded-xl border text-[10px] font-black uppercase tracking-widest transition-all ${
                                filter === f
                                    ? 'bg-[#1a1a2e] dark:bg-[#58a6ff] text-white dark:text-black border-transparent'
                                    : 'bg-black/[0.02] dark:bg-[#0d1117] border-black/5 dark:border-[#30363d] text-gray-500 dark:text-[#8b949e] hover:border-[#1a1a2e]/30 dark:hover:border-[#58a6ff]/30'
                            }`}
                        >
                            {f === 'all' ? 'All' : f === 'today' ? 'Today' : f === 'week' ? 'Week' : 'Month'}
                        </button>
                    ))}
                </div>
            </div>

            {/* Order List */}
            <div className="bg-white dark:bg-[#161b22] border border-black/5 dark:border-[#30363d] rounded-xl shadow-none overflow-hidden min-h-[400px]">
                {loading ? (
                    <div className="flex items-center justify-center h-60">
                        <RefreshCcw size={32} className="animate-spin text-gray-400" />
                    </div>
                ) : invoices.length === 0 ? (
                    <div className="flex flex-col items-center justify-center h-60 opacity-40">
                        <ShoppingBag size={64} className="mb-4 text-gray-400" />
                        <h3 className="text-lg font-bold uppercase tracking-widest text-gray-900 dark:text-white mb-2">
                            No Orders Yet
                        </h3>
                        <p className="text-xs text-gray-500 uppercase tracking-widest">
                            WooCommerce orders will appear here when customers place orders
                        </p>
                    </div>
                ) : (
                    <div className="divide-y divide-black/5 dark:divide-[#30363d]">
                        {invoices.map((invoice) => (
                            <motion.div
                                key={invoice.id}
                                layout
                                className="overflow-hidden"
                            >
                                {/* Order Row */}
                                <div
                                    className="p-5 cursor-pointer hover:bg-black/[0.01] dark:hover:bg-white/[0.02] transition-colors"
                                    onClick={() => setExpandedId(expandedId === invoice.id ? null : invoice.id)}
                                >
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-4">
                                            <div className="w-10 h-10 rounded-xl bg-[#1a1a2e]/10 dark:bg-[#58a6ff]/10 flex items-center justify-center">
                                                <Hash size={16} className="text-[#1a1a2e] dark:text-[#58a6ff]" />
                                            </div>
                                            <div>
                                                <p className="text-sm font-black uppercase tracking-wider text-gray-900 dark:text-white">
                                                    WC Order #{invoice.wc_order_id || invoice.invoice_number}
                                                </p>
                                                <div className="flex items-center gap-3 mt-1">
                                                    <p className="text-[10px] font-bold text-gray-500 dark:text-[#8b949e]">
                                                        {formatDate(invoice.date)} at {formatTime(invoice.created_at)}
                                                    </p>
                                                    {invoice.customer && (
                                                        <span className="text-[10px] font-bold text-gray-400">
                                                            • {invoice.customer.name}
                                                        </span>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-4">
                                            <span className={`text-[9px] font-black uppercase tracking-widest px-2 py-1 rounded-md border ${getStatusBg(invoice.status)} ${getStatusColor(invoice.status)}`}>
                                                {invoice.status}
                                            </span>
                                            <p className="text-lg font-black text-gray-900 dark:text-white">
                                                ${parseFloat(invoice.grand_total).toFixed(2)}
                                            </p>
                                            <ChevronRight
                                                size={18}
                                                className={`text-gray-400 transition-transform ${expandedId === invoice.id ? 'rotate-90' : ''}`}
                                            />
                                        </div>
                                    </div>
                                </div>

                                {/* Expanded Details */}
                                <AnimatePresence>
                                    {expandedId === invoice.id && (
                                        <motion.div
                                            initial={{ height: 0, opacity: 0 }}
                                            animate={{ height: 'auto', opacity: 1 }}
                                            exit={{ height: 0, opacity: 0 }}
                                            transition={{ duration: 0.2 }}
                                            className="border-t border-black/5 dark:border-[#30363d] bg-black/[0.01] dark:bg-[#0d1117]"
                                        >
                                            <div className="p-6 space-y-4">
                                                {/* Customer */}
                                                {invoice.customer && (
                                                    <div className="flex items-center gap-3 p-3 bg-white dark:bg-[#161b22] rounded-xl border border-black/5 dark:border-[#30363d]">
                                                        <div className="w-8 h-8 rounded-lg bg-[#1a1a2e]/10 dark:bg-[#58a6ff]/10 flex items-center justify-center">
                                                            <User size={14} className="text-[#1a1a2e] dark:text-[#58a6ff]" />
                                                        </div>
                                                        <div>
                                                            <p className="text-xs font-bold text-gray-900 dark:text-white">
                                                                {invoice.customer.name}
                                                            </p>
                                                            {invoice.customer.email && (
                                                                <p className="text-[10px] text-gray-500">
                                                                    {invoice.customer.email}
                                                                </p>
                                                            )}
                                                            {invoice.customer.phone && (
                                                                <p className="text-[10px] text-gray-500">
                                                                    {invoice.customer.phone}
                                                                </p>
                                                            )}
                                                        </div>
                                                    </div>
                                                )}

                                                {/* Items Table */}
                                                {invoice.items && invoice.items.length > 0 && (
                                                    <div className="space-y-2">
                                                        <p className="text-[9px] font-black uppercase tracking-widest text-gray-500 dark:text-[#8b949e]">
                                                            Items ({invoice.items.length})
                                                        </p>
                                                        <div className="bg-white dark:bg-[#161b22] rounded-xl border border-black/5 dark:border-[#30363d] overflow-hidden">
                                                            <table className="w-full text-left">
                                                                <thead>
                                                                    <tr className="border-b border-black/5 dark:border-[#30363d]">
                                                                        <th className="px-4 py-2 text-[9px] font-black uppercase tracking-widest text-gray-500">Product</th>
                                                                        <th className="px-4 py-2 text-[9px] font-black uppercase tracking-widest text-gray-500">SKU</th>
                                                                        <th className="px-4 py-2 text-[9px] font-black uppercase tracking-widest text-gray-500 text-center">Qty</th>
                                                                        <th className="px-4 py-2 text-[9px] font-black uppercase tracking-widest text-gray-500 text-right">Price</th>
                                                                        <th className="px-4 py-2 text-[9px] font-black uppercase tracking-widest text-gray-500 text-right">Total</th>
                                                                    </tr>
                                                                </thead>
                                                                <tbody className="divide-y divide-black/5 dark:divide-[#30363d]">
                                                                    {invoice.items.map((item, idx) => (
                                                                        <tr key={idx}>
                                                                            <td className="px-4 py-2">
                                                                                <p className="text-[11px] font-bold text-gray-900 dark:text-white">{item.product_name}</p>
                                                                                <p className="text-[9px] text-gray-500">Size: {item.product_variant}</p>
                                                                            </td>
                                                                            <td className="px-4 py-2 text-[10px] font-mono text-gray-500">{item.product_sku}</td>
                                                                            <td className="px-4 py-2 text-[11px] font-bold text-gray-900 dark:text-white text-center">{item.quantity}</td>
                                                                            <td className="px-4 py-2 text-[11px] font-bold text-gray-900 dark:text-white text-right">${parseFloat(item.unit_price).toFixed(2)}</td>
                                                                            <td className="px-4 py-2 text-[11px] font-bold text-gray-900 dark:text-white text-right">${parseFloat(item.line_total).toFixed(2)}</td>
                                                                        </tr>
                                                                    ))}
                                                                </tbody>
                                                            </table>
                                                        </div>
                                                    </div>
                                                )}

                                                {/* Totals */}
                                                <div className="flex items-center justify-between pt-3 border-t border-black/5 dark:border-[#30363d]">
                                                    <div className="flex gap-4">
                                                        <p className="text-[10px] font-bold text-gray-500">
                                                            Subtotal: ${parseFloat(invoice.subtotal).toFixed(2)}
                                                        </p>
                                                        {invoice.items_discount > 0 && (
                                                            <p className="text-[10px] font-bold text-red-500">
                                                                Discount: -${parseFloat(invoice.items_discount).toFixed(2)}
                                                            </p>
                                                        )}
                                                    </div>
                                                    <p className="text-lg font-black text-gray-900 dark:text-white">
                                                        Total: ${parseFloat(invoice.grand_total).toFixed(2)} {invoice.currency || 'USD'}
                                                    </p>
                                                </div>

                                                {/* Notify Telegram */}
                                                <div className="flex justify-end pt-2">
                                                    <button
                                                        onClick={(e) => {
                                                            e.stopPropagation();
                                                            handleNotifyTelegram(invoice.id);
                                                        }}
                                                        disabled={notifyingId === invoice.id}
                                                        className="flex items-center gap-2 px-3 py-1.5 text-[9px] font-black uppercase tracking-widest text-[#1a1a2e] dark:text-[#58a6ff] bg-[#1a1a2e]/5 dark:bg-[#58a6ff]/10 border border-[#1a1a2e]/10 dark:border-[#58a6ff]/20 rounded-lg hover:bg-[#1a1a2e]/10 dark:hover:bg-[#58a6ff]/20 transition-colors disabled:opacity-50"
                                                    >
                                                        <Send size={12} className={notifyingId === invoice.id ? 'animate-pulse' : ''} />
                                                        {notifyingId === invoice.id ? 'Sending...' : 'Notify Telegram'}
                                                    </button>
                                                </div>

                                                {/* Notes */}
                                                {invoice.notes && (
                                                    <p className="text-[10px] text-gray-500 italic bg-black/[0.02] dark:bg-white/[0.02] p-2 rounded-lg">
                                                        {invoice.notes}
                                                    </p>
                                                )}
                                            </div>
                                        </motion.div>
                                    )}
                                </AnimatePresence>
                            </motion.div>
                        ))}
                    </div>
                )}
            </div>

            {/* Footer */}
            <div className="flex items-center justify-between">
                <p className="text-[10px] font-bold uppercase tracking-widest text-gray-400">
                    Showing {invoices.length} WooCommerce order{invoices.length !== 1 ? 's' : ''}
                </p>
                <p className="text-[10px] font-bold uppercase tracking-widest text-gray-400">
                    Last refreshed: {new Date().toLocaleTimeString()}
                </p>
            </div>
        </div>
    );
};

export default OrderManager;
