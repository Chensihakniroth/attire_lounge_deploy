import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Search, UserPlus, Sparkles, Loader2, Phone, Mail, User } from 'lucide-react';
import axios from 'axios';
import { usePOS } from './POSContext';
import { motion, AnimatePresence } from 'framer-motion';
import QuickCustomerModal from './QuickCustomerModal';

const InlineCustomerSearch = () => {
    const [query, setQuery] = useState('');
    const [results, setResults] = useState([]);
    const [loading, setLoading] = useState(false);
    const [showResults, setShowResults] = useState(false);
    const [isVipModalOpen, setIsVipModalOpen] = useState(false);
    const { attachCustomer } = usePOS();
    const dropdownRef = useRef(null);

    const handleSearch = useCallback(async (val) => {
        if (val.length < 2) {
            setResults([]);
            setShowResults(false);
            return;
        }
        setLoading(true);
        try {
            const response = await axios.get(`/api/v1/search?q=${val}&type=customer`);
            const customers = response.data.data.filter(item => item.type === 'customer' || item.name);
            setResults(customers);
            setShowResults(customers.length > 0);
        } catch (error) {
            console.error('Inline search error:', error);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        const timer = setTimeout(() => handleSearch(query), 300);
        return () => clearTimeout(timer);
    }, [query, handleSearch]);

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setShowResults(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const selectCustomer = (customer) => {
        attachCustomer(customer);
        setQuery('');
        setResults([]);
        setShowResults(false);
    };

    return (
        <div className="relative w-full" ref={dropdownRef}>
            <div className="flex items-center gap-2">
                <div className="relative flex-1 group">
                    <Search size={14} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-attire-accent transition-colors" />
                    <input 
                        type="text"
                        placeholder="Search Customer..."
                        className="w-full bg-black/[0.02] dark:bg-[#161b22] border border-black/10 dark:border-[#30363d] rounded-xl py-3 pl-10 pr-4 text-[11px] font-bold uppercase tracking-widest text-gray-900 dark:text-white outline-none focus:border-[#0d3542]/30 focus:bg-[#fdfdfc] dark:focus:bg-[#0d1117] transition-all"
                        value={query}
                        onChange={(e) => {
                            setQuery(e.target.value);
                            if (e.target.value.length >= 2) setShowResults(true);
                        }}
                        onFocus={() => query.length >= 2 && setShowResults(true)}
                    />
                    {loading && (
                        <Loader2 size={12} className="absolute right-4 top-1/2 -translate-y-1/2 animate-spin text-attire-accent" />
                    )}
                </div>

                <button 
                    onClick={() => setIsVipModalOpen(true)}
                    className="p-3 bg-attire-accent/10 border border-attire-accent/20 text-attire-accent rounded-xl hover:bg-attire-accent hover:text-black transition-all group relative active:scale-95"
                    title="Add VIP Customer"
                >
                    <UserPlus size={16} />
                    <Sparkles size={8} className="absolute top-1 right-1 text-attire-accent group-hover:text-black" />
                </button>
            </div>

            {/* Results Dropdown */}
            <AnimatePresence>
                {showResults && results.length > 0 && (
                    <motion.div 
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: 10 }}
                        className="absolute top-full left-0 right-0 mt-2 bg-[#fdfdfc] dark:bg-[#161b22] border border-black/5 dark:border-[#30363d] rounded-2xl shadow-none z-[150] overflow-hidden max-h-[300px] no-scrollbar"
                    >
                        <div className="p-2 space-y-1">
                            {results.map(customer => (
                                <button 
                                    key={customer.id}
                                    onClick={() => selectCustomer(customer)}
                                    className="w-full flex items-center gap-3 p-3 hover:bg-attire-accent/5 rounded-xl transition-all text-left group"
                                >
                                    <div className="w-8 h-8 rounded-lg bg-black/5 dark:bg-white/5 flex items-center justify-center text-gray-400 group-hover:text-attire-accent group-hover:bg-attire-accent/10 font-bold text-xs">
                                        {customer.name?.charAt(0)}
                                    </div>
                                    <div className="flex-1">
                                        <div className="flex items-center gap-2">
                                            <span className="text-[10px] font-bold uppercase tracking-wider text-gray-900 dark:text-white">{customer.name}</span>
                                            {customer.is_vip && (
                                                <span className="px-1 py-0.5 bg-attire-accent text-black text-[6px] font-black rounded uppercase">VIP</span>
                                            )}
                                        </div>
                                        <div className="text-[8px] text-gray-500 uppercase tracking-widest flex gap-2">
                                            {customer.phone && <span className="flex items-center gap-1"><Phone size={8}/> {customer.phone}</span>}
                                        </div>
                                    </div>
                                </button>
                            ))}
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            <QuickCustomerModal 
                isOpen={isVipModalOpen}
                onClose={() => setIsVipModalOpen(false)}
                onSuccess={(newCustomer) => {
                    attachCustomer(newCustomer);
                    setQuery('');
                }}
            />
        </div>
    );
};

export default InlineCustomerSearch;
