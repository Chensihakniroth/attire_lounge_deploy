import React, { useState, useCallback, useEffect } from 'react';
import { motion } from 'framer-motion';
import { User, X, Search, Loader2, UserPlus, Sparkles, Phone, Mail } from 'lucide-react';
import axios from 'axios';
import { usePOS } from './POSContext';
import QuickCustomerModal from './QuickCustomerModal';

const CustomerSearch = ({ onClose }) => {
    const [query, setQuery] = useState('');
    const [results, setResults] = useState([]);
    const [loading, setLoading] = useState(false);
    const [isRegisterModalOpen, setIsRegisterModalOpen] = useState(false);
    const { attachCustomer } = usePOS();

    const handleSearch = useCallback(async (val) => {
        if (val.length < 2) {
            setResults([]);
            return;
        }
        setLoading(true);
        try {
            const response = await axios.get(
                `/api/v1/search?q=${val}&type=customer`
            );
            setResults(
                response.data.data.filter(
                    (item) => item.type === 'customer' || item.name
                )
            );
        } catch (error) {
            console.error('Customer search error:', error);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        const timer = setTimeout(() => handleSearch(query), 300);
        return () => clearTimeout(timer);
    }, [query, handleSearch]);

    const selectCustomer = (customer) => {
        attachCustomer(customer);
        onClose();
    };

    const handleQuickRegisterSuccess = (customer) => {
        attachCustomer(customer);
        onClose();
    };

    return (
        <>
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
                onClick={onClose}
            >
                <motion.div
                    initial={{ scale: 0.9, y: 20 }}
                    animate={{ scale: 1, y: 0 }}
                    exit={{ scale: 0.9, y: 20 }}
                    className="w-full max-w-lg bg-white dark:bg-[#0a0a0a] rounded-[2rem] shadow-2xl border border-black/5 dark:border-white/10 overflow-hidden flex flex-col max-h-[80vh]"
                    onClick={(e) => e.stopPropagation()}
                >
                    {/* Header */}
                    <div className="p-6 border-b border-black/5 dark:border-white/10 flex items-center justify-between bg-black/[0.01] dark:bg-white/[0.01]">
                        <div className="flex items-center gap-3">
                            <div className="p-2 rounded-xl bg-attire-accent/10 border border-attire-accent/20 text-attire-accent">
                                <User size={18} />
                            </div>
                            <div>
                                <h2 className="text-[12px] font-bold uppercase tracking-[0.2em] text-gray-900 dark:text-white leading-none mb-1">
                                    Customer Search
                                </h2>
                                <p className="text-[9px] text-gray-500 uppercase tracking-widest">
                                    Identify client by name, phone or email
                                </p>
                            </div>
                        </div>
                        <button
                            onClick={onClose}
                            className="p-2 hover:bg-black/5 dark:hover:bg-white/5 rounded-xl text-gray-400 transition-all"
                        >
                            <X size={18} />
                        </button>
                    </div>

                    {/* Input Area */}
                    <div className="p-6 flex items-center gap-3">
                        <div className="relative group flex-1">
                            <Search
                                size={18}
                                className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-attire-accent transition-colors"
                            />
                            <input
                                autoFocus
                                type="text"
                                placeholder="Details..."
                                className="w-full bg-black/[0.03] dark:bg-white/[0.03] border border-black/10 dark:border-white/10 rounded-2xl py-5 pl-14 pr-6 text-[12px] font-bold uppercase tracking-[0.1em] text-gray-900 dark:text-white outline-none focus:border-attire-accent/50 focus:bg-white dark:focus:bg-black transition-all"
                                value={query}
                                onChange={(e) => setQuery(e.target.value)}
                            />
                            {loading && (
                                <Loader2
                                    size={18}
                                    className="absolute right-5 top-1/2 -translate-y-1/2 animate-spin text-attire-accent"
                                />
                            )}
                        </div>

                        <button
                            onClick={() => setIsRegisterModalOpen(true)}
                            className="p-5 bg-attire-accent text-black rounded-2xl hover:scale-105 active:scale-95 transition-all shadow-lg shadow-attire-accent/10 group relative"
                            title="Quick VIP Registration"
                        >
                            <UserPlus size={20} />
                            <span className="absolute -top-1 -right-1 w-3 h-3 bg-white rounded-full border-2 border-attire-accent flex items-center justify-center">
                                <Sparkles
                                    size={6}
                                    className="text-attire-accent"
                                />
                            </span>
                        </button>
                    </div>

                    {/* Results List */}
                    <div className="flex-1 overflow-y-auto no-scrollbar px-6 pb-6 space-y-2">
                        {results.length > 0 ? (
                            results.map((customer) => (
                                <button
                                    key={customer.id}
                                    onClick={() => selectCustomer(customer)}
                                    className="w-full flex items-center gap-4 p-4 rounded-2xl bg-black/[0.02] dark:bg-white/[0.02] border border-black/5 dark:border-white/5 hover:border-attire-accent/50 hover:bg-attire-accent/5 transition-all text-left group"
                                >
                                    <div className="w-12 h-12 rounded-xl bg-black/5 dark:bg-white/5 flex items-center justify-center text-gray-400 group-hover:text-attire-accent group-hover:bg-attire-accent/10 transition-all font-bold text-lg">
                                        {customer.name?.charAt(0) || '?'}
                                    </div>
                                    <div className="flex-1">
                                        <div className="flex items-center gap-2 mb-0.5">
                                            <h4 className="text-[11px] font-bold uppercase tracking-wider text-gray-900 dark:text-white">
                                                {customer.name}
                                            </h4>
                                            {customer.is_vip && (
                                                <span className="px-1.5 py-0.5 bg-attire-accent text-black text-[7px] font-bold rounded">
                                                    VIP
                                                </span>
                                            )}
                                        </div>
                                        <div className="flex items-center gap-4 opacity-50">
                                            <div className="flex items-center gap-1 text-[9px] uppercase tracking-widest">
                                                <Phone size={10} />{' '}
                                                {customer.phone || 'N/A'}
                                            </div>
                                            <div className="flex items-center gap-1 text-[9px] uppercase tracking-widest">
                                                <Mail size={10} />{' '}
                                                {customer.email || 'N/A'}
                                            </div>
                                        </div>
                                    </div>
                                    <div className="p-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                        <UserPlus
                                            className="text-attire-accent"
                                            size={18}
                                        />
                                    </div>
                                </button>
                            ))
                        ) : query.length >= 2 && !loading ? (
                            <div className="text-center py-12 opacity-30">
                                <p className="text-[10px] font-bold uppercase tracking-widest mb-4">
                                    No matching customers found
                                </p>
                                <button
                                    onClick={() => setIsRegisterModalOpen(true)}
                                    className="flex items-center gap-2 px-6 py-3 bg-attire-accent text-black text-[9px] font-bold uppercase tracking-widest rounded-xl mx-auto hover:scale-105 transition-all active:scale-95 shadow-xl shadow-attire-accent/20 font-sans"
                                >
                                    <UserPlus size={14} /> Register New Customer
                                </button>
                            </div>
                        ) : (
                            <div className="text-center py-12 opacity-20">
                                <User size={48} className="mx-auto mb-4" />
                                <p className="text-[10px] font-bold uppercase tracking-widest italic">
                                    Waiting for search...
                                </p>
                            </div>
                        )}
                    </div>
                </motion.div>
            </motion.div>

            <QuickCustomerModal
                isOpen={isRegisterModalOpen}
                onClose={() => setIsRegisterModalOpen(false)}
                onSuccess={handleQuickRegisterSuccess}
            />
        </>
    );
};

export default CustomerSearch;
