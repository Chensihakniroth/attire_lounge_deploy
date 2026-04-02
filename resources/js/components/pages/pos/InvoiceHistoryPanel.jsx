import React, { useState, useEffect } from 'react';
import { 
    X, 
    Search, 
    Calendar, 
    Filter, 
    Receipt, 
    History,
    ChevronRight, 
    RefreshCcw, 
    CheckCircle, 
    Clock,
    User,
    ArrowUpRight,
    Undo2,
    Check
} from 'lucide-react';
import axios from 'axios';
import { motion, AnimatePresence } from 'framer-motion';
import RefundModal from './RefundModal';

const InvoiceHistoryPanel = ({ onClose }) => {
    const [invoices, setInvoices] = useState([]);
    const [loading, setLoading] = useState(true);
    const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
    const [search, setSearch] = useState('');
    const [selectedInvoice, setSelectedInvoice] = useState(null);
    const [showRefund, setShowRefund] = useState(false);

    const fetchHistory = async () => {
        setLoading(true);
        try {
            const response = await axios.get('/api/v1/admin/pos/invoices', {
                params: { date, search }
            });
            setInvoices(response.data.data);
        } catch (err) {
            console.error('Failed to fetch invoice history');
        } finally {
            setLoading(false);
        }
    };

    const handleSelectInvoice = async (invoice) => {
        setLoading(true);
        try {
            const response = await axios.get(`/api/v1/admin/pos/invoices/${invoice.id}`);
            setSelectedInvoice(response.data.data);
            setShowRefund(true);
        } catch (err) {
            console.error('Failed to fetch invoice details');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchHistory();
    }, [date]);

    return (
        <motion.div 
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className="fixed inset-y-0 right-0 w-full max-w-md bg-white dark:bg-[#0a0a0a] shadow-[-20px_0_50px_rgba(0,0,0,0.2)] z-[200] border-l border-black/5 dark:border-white/10 flex flex-col font-sans"
        >
            {/* Header */}
            <div className="p-6 border-b border-black/5 dark:border-white/10 flex items-center justify-between bg-black/[0.01] dark:bg-white/[0.01]">
                <div className="flex items-center gap-3">
                    <div className="p-2.5 rounded-xl bg-attire-accent/10 border border-attire-accent/20 text-attire-accent">
                        <History size={20} />
                    </div>
                    <div>
                        <h2 className="text-[14px] font-bold uppercase tracking-[0.3em] text-gray-900 dark:text-white leading-none mb-1">
                            Sales History
                        </h2>
                        <p className="text-[9px] text-gray-500 uppercase tracking-widest">Review past transactions & refunds</p>
                    </div>
                </div>
                <button onClick={onClose} className="p-2 hover:bg-black/5 dark:hover:bg-white/5 rounded-xl text-gray-400 transition-all">
                    <X size={20} />
                </button>
            </div>

            {/* Filters */}
            <div className="p-6 space-y-4 border-b border-black/5 dark:border-white/5">
                <div className="relative group">
                    <Calendar size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-attire-accent" />
                    <input 
                        type="date" 
                        className="w-full bg-black/[0.03] dark:bg-white/[0.03] border border-black/10 dark:border-white/10 rounded-xl py-3 pl-12 pr-4 text-[11px] font-bold uppercase tracking-widest outline-none focus:border-attire-accent/50 transition-all"
                        value={date}
                        onChange={(e) => setDate(e.target.value)}
                    />
                </div>
                
                <div className="relative group">
                    <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-attire-accent" />
                    <input 
                        type="text" 
                        placeholder="Search invoice # or customer..."
                        className="w-full bg-black/[0.03] dark:bg-white/[0.03] border border-black/10 dark:border-white/10 rounded-xl py-3 pl-12 pr-4 text-[11px] font-bold uppercase tracking-widest outline-none focus:border-attire-accent/50 transition-all"
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        onKeyDown={(e) => e.key === 'Enter' && fetchHistory()}
                    />
                </div>
            </div>

            {/* List */}
            <div className="flex-1 overflow-y-auto no-scrollbar p-6 space-y-3">
                {loading && !showRefund ? (
                    <div className="h-full flex items-center justify-center">
                        <RefreshCcw className="animate-spin text-attire-accent" size={24} />
                    </div>
                ) : invoices.length === 0 ? (
                    <div className="h-full flex flex-col items-center justify-center text-center opacity-30 italic">
                        <Receipt size={48} className="mb-4" />
                        <p className="text-[10px] font-bold uppercase tracking-widest">No records for this date</p>
                    </div>
                ) : (
                    invoices.map((inv) => (
                        <div 
                            key={inv.id}
                            className="p-4 rounded-2xl bg-black/[0.02] dark:bg-white/[0.02] border border-black/5 dark:border-white/5 hover:border-attire-accent/30 transition-all group"
                        >
                            <div className="flex items-center justify-between mb-3">
                                <div className="flex items-center gap-2">
                                    <span className="text-[10px] font-bold text-gray-900 dark:text-white uppercase tracking-tighter">
                                        {inv.invoice_number}
                                    </span>
                                    <span className={`px-1.5 py-0.5 rounded text-[7px] font-bold uppercase tracking-widest ${
                                        inv.status === 'completed' ? 'bg-green-500/10 text-green-500' : 'bg-red-500/10 text-red-500'
                                    }`}>
                                        {inv.status}
                                    </span>
                                </div>
                                <span className="text-[10px] font-bold text-attire-accent">
                                    ${parseFloat(inv.total_amount).toLocaleString()}
                                </span>
                            </div>

                            <div className="flex items-center justify-between text-[9px] text-gray-500 uppercase tracking-widest">
                                <div className="flex items-center gap-2">
                                    <User size={10} />
                                    <span>{inv.customer?.name || 'Walk-in Customer'}</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <Clock size={10} />
                                    <span>{new Date(inv.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                                </div>
                            </div>
                            
                            <div className="mt-4 pt-3 border-t border-black/5 dark:border-white/5 flex justify-end">
                                <button 
                                    onClick={() => handleSelectInvoice(inv)}
                                    className="flex items-center gap-1.5 text-[8px] font-bold uppercase tracking-[0.2em] text-attire-accent hover:scale-105 transition-all"
                                >
                                    {inv.status === 'refunded' ? 'Details' : 'Refund / Details'} <ArrowUpRight size={10} />
                                </button>
                            </div>
                        </div>
                    ))
                )}
            </div>

            {/* Refund Modal Overlay */}
            <AnimatePresence>
                {showRefund && selectedInvoice && (
                    <RefundModal 
                        invoice={selectedInvoice} 
                        onClose={() => setShowRefund(false)} 
                        onRefundSuccess={() => {
                            setShowRefund(false);
                            fetchHistory();
                        }}
                    />
                )}
            </AnimatePresence>
        </motion.div>
    );
};

export default InvoiceHistoryPanel;
