import React, { useState, useEffect, useCallback } from 'react';
import { History, User, Clock, Activity, Search, Filter, ChevronLeft, ChevronRight, Eye, Info, AlertCircle, PlusCircle, RefreshCw, Trash2 } from 'lucide-react';
import axios from 'axios';
import { motion, AnimatePresence } from 'framer-motion';
import Skeleton from '../../common/Skeleton.jsx';
import ErrorBoundary from '../../common/ErrorBoundary.jsx';

const ActionFilter = ({ value, onChange }) => {
    const [isOpen, setIsOpen] = useState(false);
    const options = [
        { value: '', label: 'All Actions', icon: Filter },
        { value: 'created', label: 'Created', icon: PlusCircle, color: 'text-green-500' },
        { value: 'updated', label: 'Updated', icon: RefreshCw, color: 'text-blue-500' },
        { value: 'deleted', label: 'Deleted', icon: Trash2, color: 'text-red-500' },
    ];

    const currentOption = options.find(opt => opt.value === value) || options[0];

    return (
        <div className="relative z-50">
            <motion.button
                whileTap={{ scale: 0.98 }}
                onClick={() => setIsOpen(!isOpen)}
                className="flex items-center gap-4 bg-white dark:bg-black/20 border border-black/5 dark:border-white/10 rounded-2xl py-3.5 px-6 text-[10px] font-bold uppercase tracking-[0.2em] text-gray-900 dark:text-white hover:border-attire-accent/30 transition-all shadow-sm"
            >
                <currentOption.icon size={14} className={currentOption.color || 'text-gray-400'} />
                <span>{currentOption.label}</span>
                <ChevronRight size={14} className={`text-gray-400 transition-transform duration-300 ${isOpen ? 'rotate-90' : ''}`} />
            </motion.button>

            <AnimatePresence>
                {isOpen && (
                    <>
                        <div className="fixed inset-0 z-[-1]" onClick={() => setIsOpen(false)} />
                        <motion.div
                            initial={{ opacity: 0, y: 10, scale: 0.95 }}
                            animate={{ opacity: 1, y: 0, scale: 1 }}
                            exit={{ opacity: 0, y: 10, scale: 0.95 }}
                            transition={{ duration: 0.2, ease: "easeOut" }}
                            className="absolute right-0 mt-3 w-56 bg-white dark:bg-[#0d0d0d] border border-black/5 dark:border-white/10 rounded-2xl shadow-[0_20px_50px_rgba(0,0,0,0.3)] dark:shadow-[0_20px_50px_rgba(0,0,0,0.7)] overflow-hidden py-2 backdrop-blur-xl z-[100]"
                        >
                            {options.map((option) => (
                                <button
                                    key={option.value}
                                    onClick={() => {
                                        onChange(option.value);
                                        setIsOpen(false);
                                    }}
                                    className={`w-full flex items-center gap-4 px-6 py-3.5 text-[10px] font-bold uppercase tracking-widest transition-all ${
                                        value === option.value 
                                            ? 'bg-black dark:bg-white text-white dark:text-black' 
                                            : 'text-gray-500 dark:text-attire-silver/60 hover:bg-black/5 dark:hover:bg-white/5 hover:text-gray-900 dark:hover:text-white'
                                    }`}
                                >
                                    <option.icon size={14} className={value === option.value ? '' : (option.color || 'text-gray-400')} />
                                    <span>{option.label}</span>
                                </button>
                            ))}
                        </motion.div>
                    </>
                )}
            </AnimatePresence>
        </div>
    );
};

const AuditLog = () => {
    const [activities, setActivities] = useState([]);
    const [loading, setLoading] = useState(true);
    const [pagination, setPagination] = useState({
        current_page: 1,
        last_page: 1,
        total: 0
    });
    const [filters, setFilters] = useState({
        action: '',
        per_page: 20
    });
    const [selectedActivity, setSelectedActivity] = useState(null);

    const fetchActivities = useCallback(async (page = 1) => {
        setLoading(true);
        try {
            const token = localStorage.getItem('admin_token') || sessionStorage.getItem('admin_token');
            const response = await axios.get('/api/v1/admin/activities', {
                params: {
                    page,
                    per_page: filters.per_page,
                    action: filters.action
                },
                headers: { 'Authorization': `Bearer ${token}` }
            });

            if (response.data.success) {
                setActivities(response.data.data.data);
                setPagination({
                    current_page: response.data.data.current_page,
                    last_page: response.data.data.last_page,
                    total: response.data.data.total
                });
            }
        } catch (error) {
            console.error('Error fetching audit logs:', error);
        } finally {
            setLoading(false);
        }
    }, [filters]);

    useEffect(() => {
        fetchActivities();
    }, [fetchActivities]);

    const handlePageChange = (newPage) => {
        if (newPage >= 1 && newPage <= pagination.last_page) {
            fetchActivities(newPage);
        }
    };

    const getActionColor = (action) => {
        switch (action) {
            case 'created': return 'text-green-500 bg-green-500/10 border-green-500/20';
            case 'updated': return 'text-blue-500 bg-blue-500/10 border-blue-500/20';
            case 'deleted': return 'text-red-500 bg-red-500/10 border-red-500/20';
            case 'failed_login':
            case 'unauthorized_access_attempt':
                return 'text-orange-500 bg-orange-500/10 border-orange-500/20 shadow-[0_0_15px_rgba(249,115,22,0.2)] animate-pulse';
            case 'logged_in': return 'text-purple-500 bg-purple-500/10 border-purple-500/20';
            default: return 'text-gray-500 bg-gray-500/10 border-gray-500/20';
        }
    };

    const formatChanges = (changes) => {
        if (!changes || Object.keys(changes).length === 0) return null;
        
        return (
            <div className="mt-4 space-y-3">
                <p className="text-[10px] font-bold text-gray-400 dark:text-attire-silver/40 uppercase tracking-widest border-b border-black/5 dark:border-white/5 pb-2">Changes</p>
                <div className="grid grid-cols-1 gap-2">
                    {Object.entries(changes).map(([key, value]) => (
                        <div key={key} className="text-[11px] bg-black/5 dark:bg-white/5 p-3 rounded-xl border border-black/5 dark:border-white/5">
                            <span className="font-bold text-gray-900 dark:text-white uppercase tracking-wider">{key.replace(/_/g, ' ')}:</span>
                            <div className="mt-2 flex flex-col gap-1">
                                <div className="flex items-center gap-2">
                                    <span className="px-2 py-0.5 bg-red-500/10 text-red-500 rounded border border-red-500/10 line-through opacity-60">
                                        {value.old === null ? 'null' : String(value.old)}
                                    </span>
                                    <ChevronRight size={10} className="text-gray-300 dark:text-white/20" />
                                    <span className="px-2 py-0.5 bg-green-500/10 text-green-500 rounded border border-green-500/10">
                                        {value.new === null ? 'null' : String(value.new)}
                                    </span>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        );
    };

    return (
        <ErrorBoundary>
            <div className="space-y-10 pb-24">
                <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
                    <div>
                        <h1 className="text-4xl font-serif text-gray-900 dark:text-white mb-2">Audit Logs</h1>
                        <p className="text-gray-400 dark:text-attire-silver text-sm uppercase tracking-widest">System Activity Tracking</p>
                    </div>

                    <div className="flex flex-wrap items-center gap-3">
                        <ActionFilter 
                            value={filters.action} 
                            onChange={(val) => setFilters({ ...filters, action: val })} 
                        />
                    </div>
                </div>

                <div className="bg-white dark:bg-black/20 backdrop-blur-xl rounded-[2rem] shadow-xl border border-black/5 dark:border-white/10 overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="border-b border-black/5 dark:border-white/5 bg-black/[0.02] dark:bg-white/[0.02]">
                                    <th className="px-8 py-6 text-[10px] font-bold text-gray-400 dark:text-attire-silver/40 uppercase tracking-[0.2em]">User</th>
                                    <th className="px-8 py-6 text-[10px] font-bold text-gray-400 dark:text-attire-silver/40 uppercase tracking-[0.2em]">Action</th>
                                    <th className="px-8 py-6 text-[10px] font-bold text-gray-400 dark:text-attire-silver/40 uppercase tracking-[0.2em]">Details</th>
                                    <th className="px-8 py-6 text-[10px] font-bold text-gray-400 dark:text-attire-silver/40 uppercase tracking-[0.2em]">IP Address</th>
                                    <th className="px-8 py-6 text-[10px] font-bold text-gray-400 dark:text-attire-silver/40 uppercase tracking-[0.2em]">Time</th>
                                    <th className="px-8 py-6 text-[10px] font-bold text-gray-400 dark:text-attire-silver/40 uppercase tracking-[0.2em]">Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {loading ? (
                                    [...Array(5)].map((_, i) => (
                                        <tr key={i} className="border-b border-black/5 dark:border-white/5 last:border-0">
                                            {[...Array(6)].map((_, j) => (
                                                <td key={j} className="px-8 py-6"><Skeleton className="h-4 w-full rounded" /></td>
                                            ))}
                                        </tr>
                                    ))
                                ) : activities.length > 0 ? (
                                    activities.map((activity) => (
                                        <tr key={activity.id} className="border-b border-black/5 dark:border-white/5 last:border-0 group hover:bg-black/[0.01] dark:hover:bg-white/[0.01] transition-colors">
                                            <td className="px-8 py-6">
                                                <div className="flex items-center gap-3">
                                                    <div className="h-8 w-8 rounded-full bg-black/5 dark:bg-white/5 flex items-center justify-center border border-black/5 dark:border-white/5">
                                                        <User size={14} className="text-gray-400 dark:text-attire-silver" />
                                                    </div>
                                                    <div>
                                                        <p className="text-xs font-bold text-gray-900 dark:text-white uppercase tracking-wider">{activity.user?.name || 'System'}</p>
                                                        <p className="text-[10px] text-gray-400 dark:text-attire-silver/40 font-mono">{activity.user?.email || 'N/A'}</p>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-8 py-6">
                                                <span className={`px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest border ${getActionColor(activity.action)}`}>
                                                    {activity.action}
                                                </span>
                                            </td>
                                            <td className="px-8 py-6">
                                                <p className="text-xs text-gray-600 dark:text-attire-silver/80 line-clamp-1 max-w-xs">{activity.details}</p>
                                            </td>
                                            <td className="px-8 py-6">
                                                <span className="text-[10px] font-mono text-gray-400 dark:text-attire-silver/40">{activity.ip_address}</span>
                                            </td>
                                            <td className="px-8 py-6">
                                                <div className="flex flex-col">
                                                    <span className="text-xs text-gray-900 dark:text-white font-medium">{new Date(activity.created_at).toLocaleDateString()}</span>
                                                    <span className="text-[10px] text-gray-400 dark:text-attire-silver/40 font-mono">{new Date(activity.created_at).toLocaleTimeString()}</span>
                                                </div>
                                            </td>
                                            <td className="px-8 py-6">
                                                <button 
                                                    onClick={() => setSelectedActivity(activity)}
                                                    className="p-3 bg-black/5 dark:bg-white/5 rounded-xl text-gray-400 dark:text-attire-silver hover:bg-black dark:hover:bg-white hover:text-white dark:hover:text-black transition-all"
                                                >
                                                    <Eye size={16} />
                                                </button>
                                            </td>
                                        </tr>
                                    ))
                                ) : (
                                    <tr>
                                        <td colSpan="6" className="px-8 py-20 text-center">
                                            <div className="w-16 h-16 bg-black/5 dark:bg-white/5 rounded-full flex items-center justify-center mx-auto mb-4 border border-black/5 dark:border-white/5">
                                                <Activity className="text-gray-400 dark:text-attire-silver/30" />
                                            </div>
                                            <p className="text-gray-400 dark:text-attire-silver/60 text-xs uppercase tracking-widest">No activities recorded yet.</p>
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>

                    {pagination.last_page > 1 && (
                        <div className="px-8 py-6 border-t border-black/5 dark:border-white/5 bg-black/[0.01] dark:bg-white/[0.01] flex items-center justify-between">
                            <p className="text-[10px] font-bold text-gray-400 dark:text-attire-silver/40 uppercase tracking-widest">
                                Total: {pagination.total} activities
                            </p>
                            <div className="flex items-center gap-2">
                                <button
                                    onClick={() => handlePageChange(pagination.current_page - 1)}
                                    disabled={pagination.current_page === 1}
                                    className="p-2 border border-black/5 dark:border-white/10 rounded-xl disabled:opacity-30 hover:bg-black/5 dark:hover:bg-white/5 transition-all"
                                >
                                    <ChevronLeft size={16} />
                                </button>
                                <span className="text-[10px] font-bold text-gray-900 dark:text-white uppercase tracking-[0.2em] px-4">
                                    Page {pagination.current_page} of {pagination.last_page}
                                </span>
                                <button
                                    onClick={() => handlePageChange(pagination.current_page + 1)}
                                    disabled={pagination.current_page === pagination.last_page}
                                    className="p-2 border border-black/5 dark:border-white/10 rounded-xl disabled:opacity-30 hover:bg-black/5 dark:hover:bg-white/5 transition-all"
                                >
                                    <ChevronRight size={16} />
                                </button>
                            </div>
                        </div>
                    )}
                </div>

                {/* Activity Detail Modal ✨ */}
                <AnimatePresence>
                    {selectedActivity && (
                        <div className="fixed inset-0 z-[9999] flex items-center justify-center p-6">
                            <motion.div 
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                exit={{ opacity: 0 }}
                                onClick={() => setSelectedActivity(null)}
                                className="absolute inset-0 bg-black/80 backdrop-blur-xl"
                            />
                            
                            <motion.div
                                initial={{ opacity: 0, scale: 0.95, y: 20 }}
                                animate={{ opacity: 1, scale: 1, y: 0 }}
                                exit={{ opacity: 0, scale: 0.95, y: 20 }}
                                className="relative w-full max-w-2xl bg-white dark:bg-[#0d0d0d] border border-black/5 dark:border-white/10 rounded-[2.5rem] overflow-hidden shadow-2xl z-[10000]"
                            >
                                <div className="p-8 border-b border-black/5 dark:border-white/5 bg-black/[0.02] dark:bg-white/[0.02] flex justify-between items-center">
                                    <div className="flex items-center gap-4">
                                        <div className={`p-3 rounded-2xl border ${getActionColor(selectedActivity.action)}`}>
                                            <Activity size={20} />
                                        </div>
                                        <div>
                                            <h2 className="text-xl font-serif text-gray-900 dark:text-white">Activity Detail</h2>
                                            <p className="text-[9px] font-bold text-gray-400 dark:text-attire-silver/40 uppercase tracking-widest mt-0.5">Reference ID: #{selectedActivity.id}</p>
                                        </div>
                                    </div>
                                    <button 
                                        onClick={() => setSelectedActivity(null)} 
                                        className="p-3 bg-black/5 dark:bg-white/5 rounded-full text-gray-400 hover:text-gray-900 dark:hover:text-white transition-all"
                                    >
                                        <ChevronRight size={20} className="rotate-90 md:rotate-0" />
                                    </button>
                                </div>

                                <div className="p-8 max-h-[70vh] overflow-y-auto attire-scrollbar space-y-8">
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                        <div className="space-y-4">
                                            <div>
                                                <p className="text-[9px] font-bold text-gray-400 dark:text-attire-silver/30 uppercase tracking-[0.2em] mb-2">Performed By</p>
                                                <div className="flex items-center gap-3 bg-black/5 dark:bg-white/5 p-4 rounded-2xl border border-black/5 dark:border-white/5">
                                                    <div className="h-10 w-10 rounded-full bg-black/5 dark:bg-white/5 flex items-center justify-center border border-black/5 dark:border-white/5">
                                                        <User size={18} className="text-gray-400 dark:text-attire-silver" />
                                                    </div>
                                                    <div>
                                                        <p className="text-sm font-bold text-gray-900 dark:text-white uppercase tracking-wider">{selectedActivity.user?.name || 'System'}</p>
                                                        <p className="text-[10px] text-gray-400 dark:text-attire-silver/40 font-mono">{selectedActivity.user?.email || 'automated-system'}</p>
                                                    </div>
                                                </div>
                                            </div>

                                            <div>
                                                <p className="text-[9px] font-bold text-gray-400 dark:text-attire-silver/30 uppercase tracking-[0.2em] mb-2">Contextual Data</p>
                                                <div className="space-y-2">
                                                    <div className="flex items-center justify-between p-3 bg-black/5 dark:bg-white/5 rounded-xl border border-black/5 dark:border-white/5">
                                                        <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Model</span>
                                                        <span className="text-[10px] font-mono text-gray-900 dark:text-white">{selectedActivity.model_type.split('\\').pop()}</span>
                                                    </div>
                                                    <div className="flex items-center justify-between p-3 bg-black/5 dark:bg-white/5 rounded-xl border border-black/5 dark:border-white/5">
                                                        <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Object ID</span>
                                                        <span className="text-[10px] font-mono text-gray-900 dark:text-white">#{selectedActivity.model_id}</span>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>

                                        <div className="space-y-4">
                                            <div>
                                                <p className="text-[9px] font-bold text-gray-400 dark:text-attire-silver/30 uppercase tracking-[0.2em] mb-2">Metadata</p>
                                                <div className="space-y-2">
                                                    <div className="flex items-center gap-3 p-3 bg-black/5 dark:bg-white/5 rounded-xl border border-black/5 dark:border-white/5">
                                                        <Clock size={12} className="text-attire-accent" />
                                                        <span className="text-[10px] font-mono text-gray-900 dark:text-white">{new Date(selectedActivity.created_at).toLocaleString()}</span>
                                                    </div>
                                                    <div className="flex items-center gap-3 p-3 bg-black/5 dark:bg-white/5 rounded-xl border border-black/5 dark:border-white/5">
                                                        <Info size={12} className="text-attire-accent" />
                                                        <span className="text-[10px] font-mono text-gray-900 dark:text-white">{selectedActivity.ip_address}</span>
                                                    </div>
                                                    <div className="p-3 bg-black/5 dark:bg-white/5 rounded-xl border border-black/5 dark:border-white/5 overflow-hidden">
                                                        <p className="text-[8px] font-bold text-gray-400 uppercase tracking-widest mb-1">User Agent</p>
                                                        <p className="text-[9px] font-mono text-gray-600 dark:text-attire-silver/40 break-all leading-tight">{selectedActivity.user_agent}</p>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="space-y-4">
                                        <div>
                                            <p className="text-[9px] font-bold text-gray-400 dark:text-attire-silver/30 uppercase tracking-[0.2em] mb-2">Description</p>
                                            <div className="p-4 bg-black/5 dark:bg-white/5 rounded-2xl border border-black/5 dark:border-white/5 italic text-sm text-gray-700 dark:text-attire-silver/80">
                                                "{selectedActivity.details}"
                                            </div>
                                        </div>

                                        {formatChanges(selectedActivity.changes)}
                                    </div>

                                    <div className="pt-4">
                                        <button 
                                            onClick={() => setSelectedActivity(null)}
                                            className="w-full py-4 bg-black dark:bg-white text-white dark:text-black rounded-2xl text-[11px] font-bold uppercase tracking-[0.3em] hover:bg-attire-accent dark:hover:bg-attire-accent transition-all"
                                        >
                                            Close Record
                                        </button>
                                    </div>
                                </div>
                            </motion.div>
                        </div>
                    )}
                </AnimatePresence>
            </div>
        </ErrorBoundary>
    );
};

export default AuditLog;
