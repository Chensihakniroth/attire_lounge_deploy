import React, { useState, useEffect, useCallback } from 'react';
import { Mail, Search, Trash2, ChevronLeft, ChevronRight, Phone, Download, AlertCircle, Check } from 'lucide-react';
import axios from 'axios';
import { motion, AnimatePresence } from 'framer-motion';
import Skeleton from '../../common/Skeleton.jsx';
import ErrorBoundary from '../../common/ErrorBoundary.jsx';

const NewsletterManager = () => {
    const [subscribers, setSubscribers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [pagination, setPagination] = useState({
        current_page: 1,
        last_page: 1,
        total: 0
    });
    const [deleting, setDeleting] = useState(null);

    const fetchSubscribers = useCallback(async (page = 1) => {
        setLoading(true);
        try {
            const token = localStorage.getItem('admin_token') || sessionStorage.getItem('admin_token');
            const response = await axios.get('/api/v1/admin/newsletter-subscriptions', {
                params: { page, search },
                headers: { 'Authorization': `Bearer ${token}` }
            });

            if (response.data.success) {
                setSubscribers(response.data.data.data);
                setPagination({
                    current_page: response.data.data.current_page,
                    last_page: response.data.data.last_page,
                    total: response.data.data.total
                });
            }
        } catch (error) {
            console.error('Error fetching subscribers:', error);
        } finally {
            setLoading(false);
        }
    }, [search]);

    useEffect(() => {
        const timer = setTimeout(() => {
            fetchSubscribers();
        }, 500);
        return () => clearTimeout(timer);
    }, [fetchSubscribers]);

    const handleDelete = async (id) => {
        if (!window.confirm('Are you sure you want to remove this subscriber?')) return;
        
        setDeleting(id);
        try {
            const token = localStorage.getItem('admin_token') || sessionStorage.getItem('admin_token');
            await axios.delete(`/api/v1/admin/newsletter-subscriptions/${id}`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            fetchSubscribers(pagination.current_page);
        } catch (error) {
            console.error('Error deleting subscriber:', error);
            alert('Failed to delete subscriber.');
        } finally {
            setDeleting(null);
        }
    };

    const handleExport = () => {
        const headers = ['Phone Number', 'Subscribed At'];
        const csvContent = [
            headers.join(','),
            ...subscribers.map(sub => `"${sub.phone_number}","${new Date(sub.created_at).toLocaleString()}"`)
        ].join('\n');

        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement('a');
        const url = URL.createObjectURL(blob);
        link.setAttribute('href', url);
        link.setAttribute('download', `subscribers_${new Date().toISOString().split('T')[0]}.csv`);
        link.style.visibility = 'hidden';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    return (
        <ErrorBoundary>
            <div className="space-y-10 pb-24">
                <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
                    <div>
                        <h1 className="text-4xl font-serif text-gray-900 dark:text-white mb-2">Newsletter</h1>
                        <p className="text-gray-400 dark:text-attire-silver text-sm uppercase tracking-widest">Manage Your Audience</p>
                    </div>

                    <div className="flex flex-wrap items-center gap-4">
                        <div className="relative group">
                            <Search className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-attire-accent transition-colors" size={16} />
                            <input
                                type="text"
                                placeholder="Search numbers..."
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                                className="bg-white dark:bg-black/20 border border-black/5 dark:border-white/10 rounded-2xl py-3.5 pl-12 pr-6 text-[10px] font-bold uppercase tracking-widest text-gray-900 dark:text-white focus:border-attire-accent outline-none transition-all w-64 shadow-sm"
                            />
                        </div>
                        <motion.button
                            whileTap={{ scale: 0.95 }}
                            onClick={handleExport}
                            className="flex items-center gap-3 bg-black dark:bg-white text-white dark:text-black rounded-2xl py-3.5 px-6 text-[10px] font-bold uppercase tracking-widest hover:bg-attire-accent dark:hover:bg-attire-accent transition-all shadow-lg"
                        >
                            <Download size={14} />
                            <span>Export CSV</span>
                        </motion.button>
                    </div>
                </div>

                <div className="bg-white dark:bg-black/20 backdrop-blur-xl rounded-[2rem] shadow-xl border border-black/5 dark:border-white/10 overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="border-b border-black/5 dark:border-white/5 bg-black/[0.02] dark:bg-white/[0.02]">
                                    <th className="px-8 py-6 text-[10px] font-bold text-gray-400 dark:text-attire-silver/40 uppercase tracking-[0.2em]">Contact Information</th>
                                    <th className="px-8 py-6 text-[10px] font-bold text-gray-400 dark:text-attire-silver/40 uppercase tracking-[0.2em]">Status</th>
                                    <th className="px-8 py-6 text-[10px] font-bold text-gray-400 dark:text-attire-silver/40 uppercase tracking-[0.2em]">Joined Date</th>
                                    <th className="px-8 py-6 text-[10px] font-bold text-gray-400 dark:text-attire-silver/40 uppercase tracking-[0.2em] text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {loading ? (
                                    [...Array(5)].map((_, i) => (
                                        <tr key={i} className="border-b border-black/5 dark:border-white/5 last:border-0">
                                            {[...Array(4)].map((_, j) => (
                                                <td key={j} className="px-8 py-6"><Skeleton className="h-4 w-full rounded" /></td>
                                            ))}
                                        </tr>
                                    ))
                                ) : subscribers.length > 0 ? (
                                    subscribers.map((sub) => (
                                        <tr key={sub.id} className="border-b border-black/5 dark:border-white/5 last:border-0 group hover:bg-black/[0.01] dark:hover:bg-white/[0.01] transition-colors">
                                            <td className="px-8 py-6">
                                                <div className="flex items-center gap-4">
                                                    <div className="h-10 w-10 rounded-full bg-black/5 dark:bg-white/5 flex items-center justify-center border border-black/5 dark:border-white/5 group-hover:border-attire-accent/30 transition-colors">
                                                        <Phone size={16} className="text-gray-400 dark:text-attire-silver group-hover:text-attire-accent transition-colors" />
                                                    </div>
                                                    <div>
                                                        <p className="text-sm font-bold text-gray-900 dark:text-white uppercase tracking-wider">{sub.phone_number}</p>
                                                        <p className="text-[10px] text-gray-400 dark:text-attire-silver/40 font-mono italic">SMS Channel</p>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-8 py-6">
                                                <span className="px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest border text-green-500 bg-green-500/10 border-green-500/20">
                                                    Active
                                                </span>
                                            </td>
                                            <td className="px-8 py-6">
                                                <div className="flex flex-col">
                                                    <span className="text-xs text-gray-900 dark:text-white font-medium">{new Date(sub.created_at).toLocaleDateString()}</span>
                                                    <span className="text-[10px] text-gray-400 dark:text-attire-silver/40 font-mono">{new Date(sub.created_at).toLocaleTimeString()}</span>
                                                </div>
                                            </td>
                                            <td className="px-8 py-6 text-right">
                                                <button 
                                                    onClick={() => handleDelete(sub.id)}
                                                    disabled={deleting === sub.id}
                                                    className="p-3 bg-red-500/10 text-red-500 rounded-xl hover:bg-red-500 hover:text-white transition-all disabled:opacity-50"
                                                >
                                                    <Trash2 size={16} />
                                                </button>
                                            </td>
                                        </tr>
                                    ))
                                ) : (
                                    <tr>
                                        <td colSpan="4" className="px-8 py-20 text-center">
                                            <div className="w-16 h-16 bg-black/5 dark:bg-white/5 rounded-full flex items-center justify-center mx-auto mb-4 border border-black/5 dark:border-white/5">
                                                <Mail className="text-gray-400 dark:text-attire-silver/30" />
                                            </div>
                                            <p className="text-gray-400 dark:text-attire-silver/60 text-xs uppercase tracking-widest">No subscribers found.</p>
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>

                    {pagination.last_page > 1 && (
                        <div className="px-8 py-6 border-t border-black/5 dark:border-white/5 bg-black/[0.01] dark:bg-white/[0.01] flex items-center justify-between">
                            <p className="text-[10px] font-bold text-gray-400 dark:text-attire-silver/40 uppercase tracking-widest">
                                Total: {pagination.total} subscribers
                            </p>
                            <div className="flex items-center gap-2">
                                <button
                                    onClick={() => fetchSubscribers(pagination.current_page - 1)}
                                    disabled={pagination.current_page === 1}
                                    className="p-2 border border-black/5 dark:border-white/10 rounded-xl disabled:opacity-30 hover:bg-black/5 dark:hover:bg-white/5 transition-all"
                                >
                                    <ChevronLeft size={16} />
                                </button>
                                <span className="text-[10px] font-bold text-gray-900 dark:text-white uppercase tracking-[0.2em] px-4">
                                    Page {pagination.current_page} of {pagination.last_page}
                                </span>
                                <button
                                    onClick={() => fetchSubscribers(pagination.current_page + 1)}
                                    disabled={pagination.current_page === pagination.last_page}
                                    className="p-2 border border-black/5 dark:border-white/10 rounded-xl disabled:opacity-30 hover:bg-black/5 dark:hover:bg-white/5 transition-all"
                                >
                                    <ChevronRight size={16} />
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </ErrorBoundary>
    );
};

export default NewsletterManager;
