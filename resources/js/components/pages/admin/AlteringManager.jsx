import React, { useState, useMemo, useCallback } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import axios from 'axios';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Scissors, Search, X, Smartphone, Clock, Plus, Download,
    DollarSign, Package, User, AlertCircle, CheckCircle2, Mail,
    RefreshCw, Eye, Loader2, ChevronLeft, ChevronRight, Trash2,
    MoreHorizontal, Filter, ArrowUpDown, ExternalLink
} from 'lucide-react';
import { LumaSpin } from '@/components/ui/luma-spin';
import ModernModal from '../../common/ModernModal.jsx';
import { formatDate } from '@/helpers/format';
import DatePicker from '@/components/ui/DatePicker';

/* ------------------------------------------------------------------ */
/*  Status Config                                                      */
/* ------------------------------------------------------------------ */
const STATUS_CONFIG = {
    pending: { label: 'Pending', color: 'text-amber-600 dark:text-amber-400', bg: 'bg-amber-500/10', border: 'border-amber-500/20', dot: 'bg-amber-400' },
    in_progress: { label: 'In Progress', color: 'text-blue-600 dark:text-blue-400', bg: 'bg-blue-500/10', border: 'border-blue-500/20', dot: 'bg-blue-400' },
    ready: { label: 'Ready', color: 'text-emerald-600 dark:text-emerald-400', bg: 'bg-emerald-500/10', border: 'border-emerald-500/20', dot: 'bg-emerald-400' },
    completed: { label: 'Done', color: 'text-gray-500', bg: 'bg-gray-500/10', border: 'border-gray-500/20', dot: 'bg-gray-400' },
};

const STATUS_ORDER = ['pending', 'in_progress', 'ready', 'completed'];

/* ------------------------------------------------------------------ */
/*  Loading                                                            */
/* ------------------------------------------------------------------ */
const LoadingState = () => (
    <div className="flex flex-col items-center justify-center py-24 gap-3">
        <LumaSpin size="lg" />
        <p className="text-[10px] font-bold uppercase tracking-[0.3em] text-gray-400 dark:text-[#8b949e]/40">
            Loading records…
        </p>
    </div>
);

/* ------------------------------------------------------------------ */
/*  Empty State                                                        */
/* ------------------------------------------------------------------ */
const EmptyState = ({ search, filter }) => (
    <div className="flex flex-col items-center justify-center py-20 text-center">
        <div className="w-14 h-14 rounded-xl bg-black/[0.02] dark:bg-white/[0.02] flex items-center justify-center mb-4">
            <Scissors size={20} className="text-gray-300 dark:text-[#8b949e]/30" />
        </div>
        <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-gray-400 dark:text-[#8b949e]/40">
            {search ? 'No matches found' : filter ? `No ${filter} records` : 'No alteration records yet'}
        </p>
    </div>
);

/* ------------------------------------------------------------------ */
/*  Status Badge                                                       */
/* ------------------------------------------------------------------ */
const StatusBadge = React.memo(({ status }) => {
    const cfg = STATUS_CONFIG[status] || STATUS_CONFIG.pending;
    return (
        <span className={`inline-flex items-center gap-1.5 px-2 py-1 rounded-md text-[9px] font-bold uppercase tracking-widest border ${cfg.color} ${cfg.bg} ${cfg.border}`}>
            <span className={`w-1.5 h-1.5 rounded-full ${cfg.dot}`} />
            {cfg.label}
        </span>
    );
});

/* ------------------------------------------------------------------ */
/*  Altering Row (table)                                               */
/* ------------------------------------------------------------------ */
const AlteringRow = React.memo(({ altering, onDetailOpen }) => {
    return (
        <tr
            className="hover:bg-black/[0.015] dark:hover:bg-white/[0.015] transition-colors group cursor-pointer"
            onClick={() => onDetailOpen(altering)}
        >
            <td className="px-4 py-4">
                <span className="text-[13px] font-bold text-gray-900 dark:text-[#c9d1d9] truncate block">
                    {altering.customer_name}
                </span>
            </td>
            <td className="px-4 py-4 hidden sm:table-cell">
                <span className="text-[11px] font-bold text-gray-800 dark:text-gray-300">
                    #{altering.order_no || 'MNL'}
                </span>
                <span className="text-[10px] text-gray-400 dark:text-[#8b949e]/50 block mt-0.5">
                    {altering.mobile || 'N/A'}
                </span>
            </td>
            <td className="px-4 py-4">
                <StatusBadge status={altering.status} />
            </td>
            <td className="px-4 py-4 text-right hidden md:table-cell">
                <span className="text-[13px] font-bold text-[#0d3542] dark:text-[#58a6ff]">
                    ${parseFloat(altering.altering_cost || 0).toFixed(2)}
                </span>
            </td>
            <td className="px-4 py-4 max-w-[150px] hidden lg:table-cell">
                <span className="text-[11px] text-gray-500 dark:text-[#8b949e]/60 truncate block italic">
                    {altering.product || 'Unspecified'}
                </span>
            </td>
            <td className="px-4 py-4 hidden md:table-cell">
                <span className="text-[11px] text-gray-600 dark:text-[#8b949e]">
                    {formatDate(altering.ready_at, { fallback: 'TBD', month: 'short' })}
                </span>
            </td>
            <td className="px-4 py-4 w-10" onClick={(e) => e.stopPropagation()}>
                <button
                    onClick={() => onDetailOpen(altering)}
                    className="p-2 rounded-lg text-gray-400 hover:text-[#0d3542] dark:hover:text-[#58a6ff] hover:bg-black/5 dark:hover:bg-white/5 transition-all opacity-0 group-hover:opacity-100"
                >
                    <Eye size={14} />
                </button>
            </td>
        </tr>
    );
});

/* ------------------------------------------------------------------ */
/*  Altering Card (mobile)                                             */
/* ------------------------------------------------------------------ */
const AlteringCard = React.memo(({ altering, onDetailOpen }) => {
    return (
        <motion.div
            initial={{ opacity: 0, y: 4 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white dark:bg-[#161b22] border border-black/[0.06] dark:border-[#30363d] rounded-xl p-4 hover:border-[#0d3542]/15 dark:hover:border-[#58a6ff]/15 transition-all cursor-pointer"
            onClick={() => onDetailOpen(altering)}
        >
            <div className="flex items-start justify-between mb-3">
                <div className="min-w-0 flex-1">
                    <h3 className="text-[13px] font-bold text-gray-900 dark:text-[#c9d1d9] truncate">
                        {altering.customer_name}
                    </h3>
                    <span className="text-[10px] text-gray-400 dark:text-[#8b949e]/50 font-mono">
                        #{altering.order_no || 'MNL'}
                    </span>
                </div>
                <StatusBadge status={altering.status} />
            </div>
            <div className="grid grid-cols-2 gap-2 mb-3 text-[10px]">
                <div>
                    <span className="text-gray-400 dark:text-[#8b949e]/40 uppercase tracking-widest block">Cost</span>
                    <span className="font-bold text-[#0d3542] dark:text-[#58a6ff]">${parseFloat(altering.altering_cost || 0).toFixed(2)}</span>
                </div>
                <div className="text-right">
                    <span className="text-gray-400 dark:text-[#8b949e]/40 uppercase tracking-widest block">Ready</span>
                    <span className="font-bold text-gray-600 dark:text-[#8b949e]">
                        {formatDate(altering.ready_at, { fallback: 'TBD', month: 'short' })}
                    </span>
                </div>
            </div>
            {altering.product && (
                <p className="text-[10px] text-gray-500 dark:text-[#8b949e]/50 italic truncate">{altering.product}</p>
            )}
        </motion.div>
    );
});

/* ------------------------------------------------------------------ */
/*  Altering Table (desktop)                                           */
/* ------------------------------------------------------------------ */
const AlteringTable = React.memo(({ alterings, onDetailOpen }) => (
    <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
            <thead>
                <tr className="bg-black/[0.015] dark:bg-white/[0.01] border-b border-black/[0.05] dark:border-[#30363d]">
                    {['Client', 'Reference', 'Status', 'Cost', 'Garment', 'Scheduled', ''].map((h, i) => (
                        <th
                            key={h}
                            className={`px-4 py-3 text-[9px] font-bold uppercase tracking-[0.15em] text-gray-400 dark:text-[#8b949e]/40 whitespace-nowrap ${
                                i === 3 ? 'text-right' : ''
                            } ${i === 1 ? 'hidden sm:table-cell' : ''} ${i === 4 ? 'hidden lg:table-cell' : ''} ${i === 5 ? 'hidden md:table-cell' : ''}`}
                        >
                            {h}
                        </th>
                    ))}
                </tr>
            </thead>
            <tbody className="divide-y divide-black/[0.04] dark:divide-[#30363d]">
                {alterings.map(altering => (
                    <AlteringRow key={altering.id} altering={altering} onDetailOpen={onDetailOpen} />
                ))}
            </tbody>
        </table>
    </div>
));

/* ------------------------------------------------------------------ */
/*  Input Field                                                         */
/* ------------------------------------------------------------------ */
const InputField = React.memo(({ label, icon, className = '', ...props }) => (
    <div className="flex flex-col gap-1.5">
        <label className="text-[9px] font-bold text-gray-400 dark:text-[#8b949e]/50 uppercase tracking-widest flex items-center gap-1.5">
            {icon && <span className="opacity-40">{icon}</span>}
            {label}
        </label>
        <input
            {...props}
            className={`h-10 px-3 bg-black/[0.02] dark:bg-white/[0.02] text-[12px] font-medium text-gray-900 dark:text-[#c9d1d9] border border-black/[0.06] dark:border-white/[0.06] rounded-lg outline-none focus:border-[#0d3542]/40 dark:focus:border-[#58a6ff]/40 transition-colors placeholder:text-gray-300 dark:placeholder:text-[#8b949e]/20 ${className}`}
        />
    </div>
));

/* ------------------------------------------------------------------ */
/*  Main Component                                                      */
/* ------------------------------------------------------------------ */
export default function AlteringManager() {
    const queryClient = useQueryClient();

    const [page, setPage] = useState(1);
    const [statusFilter, setStatusFilter] = useState('');
    const [searchQuery, setSearchQuery] = useState('');
    const [sortField, setSortField] = useState(null);
    const [sortOrder, setSortOrder] = useState('asc');
    const [showFilterMenu, setShowFilterMenu] = useState(false);
    const [showSortMenu, setShowSortMenu] = useState(false);
    const [showExportMenu, setShowExportMenu] = useState(false);

    const [selectedDetail, setSelectedDetail] = useState(null);
    const [isAdding, setIsAdding] = useState(false);
    const [showSyncModal, setShowSyncModal] = useState(false);
    const [syncUrl, setSyncUrl] = useState('');
    const [isSyncing, setIsSyncing] = useState(false);
    const [isNotifying, setIsNotifying] = useState(null);
    const [formData, setFormData] = useState({
        customer_name: '', order_no: '', mobile: '', product: '',
        remark: '', altering_cost: '', ready_at: '', start_date: new Date().toISOString().split('T')[0],
    });

    /* ---- Data ---- */
    const { data: alteringsData, isLoading } = useQuery({
        queryKey: ['admin-alterings', page, statusFilter, searchQuery],
        queryFn: async () => {
            const { data } = await axios.get('/api/v1/admin/alterings', {
                params: {
                    page,
                    status: statusFilter ? statusFilter.toLowerCase().replace(' ', '_') : 'all',
                    search: searchQuery,
                },
            });
            return data;
        },
    });

    const alterings = alteringsData?.data || [];
    const pagination = {
        currentPage: alteringsData?.current_page || 1,
        lastPage: alteringsData?.last_page || 1,
        total: alteringsData?.total || 0,
    };

    /* ---- Mutations ---- */
    const updateMutation = useMutation({
        mutationFn: async ({ id, data }) => axios.put(`/api/v1/admin/alterings/${id}`, data),
        onSuccess: () => queryClient.invalidateQueries({ queryKey: ['admin-alterings'] }),
    });

    const deleteMutation = useMutation({
        mutationFn: async (id) => axios.delete(`/api/v1/admin/alterings/${id}`),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['admin-alterings'] });
            setSelectedDetail(null);
        },
    });

    const bulkDeleteMutation = useMutation({
        mutationFn: async (ids) => axios.post('/api/v1/admin/alterings/bulk-delete', { ids }),
        onSuccess: () => queryClient.invalidateQueries({ queryKey: ['admin-alterings'] }),
    });

    const createMutation = useMutation({
        mutationFn: async (data) => axios.post('/api/v1/admin/alterings', data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['admin-alterings'] });
            setIsAdding(false);
            setFormData({ customer_name: '', order_no: '', mobile: '', product: '', remark: '', altering_cost: '', ready_at: '', start_date: new Date().toISOString().split('T')[0] });
        },
    });

    /* ---- Handlers ---- */
    const handleSort = useCallback((field) => {
        setSortField(prev => {
            if (prev === field) setSortOrder(p => (p === 'asc' ? 'desc' : 'asc'));
            else setSortOrder('asc');
            return prev === field ? field : field;
        });
        setShowSortMenu(false);
    }, []);

    const handleDetailOpen = useCallback((altering) => setSelectedDetail(altering), []);

    const handlePageChange = useCallback((p) => {
        setPage(p);
        window.scrollTo({ top: 0, behavior: 'smooth' });
    }, []);

    const handleSearchChange = useCallback((e) => {
        setSearchQuery(e.target.value);
        setPage(1);
    }, []);

    const handleReset = useCallback(() => {
        setSearchQuery('');
        setStatusFilter('');
        setPage(1);
    }, []);

    const handleNotify = useCallback(async (id) => {
        setIsNotifying(id);
        try {
            await axios.post(`/api/v1/admin/alterings/${id}/notify`);
            queryClient.invalidateQueries({ queryKey: ['admin-alterings'] });
        } catch { /* ignore */ }
        finally { setIsNotifying(null); }
    }, [queryClient]);

    const handleSync = useCallback(async () => {
        if (!syncUrl || !window.hika) return;
        setIsSyncing(true);
        try {
            await window.hika.import('altering', syncUrl);
            queryClient.invalidateQueries({ queryKey: ['admin-alterings'] });
            setShowSyncModal(false);
            setSyncUrl('');
        } catch { /* ignore */ }
        finally { setIsSyncing(false); }
    }, [syncUrl, queryClient]);

    /* ---- Sorting ---- */
    const sortedAlterings = useMemo(() => {
        if (!sortField) return alterings;
        return [...alterings].sort((a, b) => {
            let aVal = a[sortField] || '';
            let bVal = b[sortField] || '';
            if (sortField === 'altering_cost') { aVal = parseFloat(aVal) || 0; bVal = parseFloat(bVal) || 0; }
            if (aVal < bVal) return sortOrder === 'asc' ? -1 : 1;
            if (aVal > bVal) return sortOrder === 'asc' ? 1 : -1;
            return 0;
        });
    }, [alterings, sortField, sortOrder]);

    /* ---- Export ---- */
    const exportToCSV = useCallback(() => {
        const headers = ['Customer', 'Order No', 'Mobile', 'Product', 'Status', 'Cost', 'Ready At'];
        const rows = sortedAlterings.map(a => [a.customer_name, a.order_no || '', a.mobile || '', a.product || '', a.status, a.altering_cost || '0', a.ready_at || '']);
        const csv = [headers.join(','), ...rows.map(r => r.map(c => `"${String(c).replace(/"/g, '""')}"`).join(','))].join('\n');
        const link = document.createElement('a');
        link.href = URL.createObjectURL(new Blob([csv], { type: 'text/csv;charset=utf-8;' }));
        link.download = `alterings-${new Date().toISOString().split('T')[0]}.csv`;
        link.click();
    }, [sortedAlterings]);

    const exportToJSON = useCallback(() => {
        const link = document.createElement('a');
        link.href = URL.createObjectURL(new Blob([JSON.stringify(sortedAlterings, null, 2)], { type: 'application/json' }));
        link.download = `alterings-${new Date().toISOString().split('T')[0]}.json`;
        link.click();
    }, [sortedAlterings]);

    return (
        <div className="space-y-5 pb-16 max-w-[1100px] mx-auto px-4 sm:px-6 mt-4">
            {/* ---- Header ---- */}
            <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
                <div>
                    <h1 className="text-2xl sm:text-3xl font-serif text-gray-900 dark:text-[#c9d1d9] tracking-tight">
                        Altering Logs
                    </h1>
                    <p className="text-[10px] text-gray-400 dark:text-[#8b949e]/50 font-bold uppercase tracking-[0.3em] mt-1">
                        {pagination.total} total records
                    </p>
                </div>
                <div className="flex items-center gap-2">
                    <button
                        onClick={() => setShowSyncModal(true)}
                        className="h-9 px-4 bg-white dark:bg-[#161b22] border border-black/[0.06] dark:border-[#30363d] rounded-lg text-[10px] font-bold uppercase tracking-widest text-gray-600 dark:text-[#c9d1d9] hover:bg-black/[0.03] dark:hover:bg-white/[0.03] transition-all flex items-center gap-2"
                    >
                        <RefreshCw size={13} className={isSyncing ? 'animate-spin' : ''} />
                        <span className="hidden sm:inline">Sync</span>
                    </button>
                    <button
                        onClick={() => setIsAdding(true)}
                        className="h-9 px-4 bg-[#0d3542] dark:bg-[#58a6ff] text-white dark:text-black rounded-lg text-[10px] font-bold uppercase tracking-widest hover:opacity-90 active:scale-[0.97] transition-all flex items-center gap-2"
                    >
                        <Plus size={14} />
                        <span className="hidden sm:inline">Add</span>
                    </button>
                </div>
            </div>

            {/* ---- Filter Bar ---- */}
            <div className="bg-white dark:bg-[#161b22] border border-black/[0.06] dark:border-[#30363d] rounded-xl p-3">
                <div className="flex flex-col sm:flex-row gap-3">
                    {/* Search */}
                    <div className="relative flex-1">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={15} />
                        <input
                            type="text"
                            placeholder="Search by name, order, mobile..."
                            value={searchQuery}
                            onChange={handleSearchChange}
                            className="w-full h-10 bg-black/[0.02] dark:bg-white/[0.02] border border-black/[0.06] dark:border-white/[0.06] rounded-lg pl-9 pr-8 text-[12px] font-medium text-gray-900 dark:text-[#c9d1d9] outline-none focus:border-[#0d3542]/40 dark:focus:border-[#58a6ff]/40 transition-colors placeholder:text-gray-300 dark:placeholder:text-[#8b949e]/20"
                        />
                        {searchQuery && (
                            <button
                                onClick={handleReset}
                                className="absolute right-2.5 top-1/2 -translate-y-1/2 p-0.5 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                            >
                                <X size={13} />
                            </button>
                        )}
                    </div>

                    {/* Filter */}
                    <div className="relative">
                        <button
                            onClick={() => setShowFilterMenu(!showFilterMenu)}
                            className={`h-10 px-3 border rounded-lg text-[10px] font-bold uppercase tracking-widest flex items-center gap-2 transition-all ${
                                statusFilter
                                    ? 'border-[#0d3542]/30 dark:border-[#58a6ff]/30 text-[#0d3542] dark:text-[#58a6ff] bg-[#0d3542]/5 dark:bg-[#58a6ff]/5'
                                    : 'border-black/[0.06] dark:border-white/[0.06] text-gray-600 dark:text-[#c9d1d9] hover:bg-black/[0.03] dark:hover:bg-white/[0.03]'
                            }`}
                        >
                            <Filter size={12} />
                            {statusFilter || 'All'}
                        </button>
                        {showFilterMenu && (
                            <>
                                <div className="fixed inset-0 z-10" onClick={() => setShowFilterMenu(false)} />
                                <div className="absolute right-0 mt-1.5 w-40 bg-white dark:bg-[#161b22] border border-black/[0.06] dark:border-[#30363d] rounded-lg z-20 py-1 shadow-lg">
                                    <button
                                        onClick={() => { setStatusFilter(''); setShowFilterMenu(false); setPage(1); }}
                                        className={`w-full px-3 py-2 text-left text-[10px] font-bold uppercase tracking-widest transition-colors ${!statusFilter ? 'text-[#0d3542] dark:text-[#58a6ff] bg-black/[0.03] dark:bg-white/[0.03]' : 'text-gray-500 dark:text-[#8b949e] hover:bg-black/[0.03] dark:hover:bg-white/[0.03]'}`}
                                    >
                                        All Records
                                    </button>
                                    {STATUS_ORDER.map(key => (
                                        <button
                                            key={key}
                                            onClick={() => { setStatusFilter(STATUS_CONFIG[key].label); setShowFilterMenu(false); setPage(1); }}
                                            className={`w-full px-3 py-2 text-left text-[10px] font-bold uppercase tracking-widest transition-colors ${statusFilter === STATUS_CONFIG[key].label ? 'text-[#0d3542] dark:text-[#58a6ff] bg-black/[0.03] dark:bg-white/[0.03]' : 'text-gray-500 dark:text-[#8b949e] hover:bg-black/[0.03] dark:hover:bg-white/[0.03]'}`}
                                        >
                                            {STATUS_CONFIG[key].label}
                                        </button>
                                    ))}
                                </div>
                            </>
                        )}
                    </div>

                    {/* Sort */}
                    <div className="relative">
                        <button
                            onClick={() => setShowSortMenu(!showSortMenu)}
                            className="h-10 px-3 border border-black/[0.06] dark:border-white/[0.06] rounded-lg text-[10px] font-bold uppercase tracking-widest text-gray-600 dark:text-[#c9d1d9] hover:bg-black/[0.03] dark:hover:bg-white/[0.03] flex items-center gap-2 transition-all"
                        >
                            <ArrowUpDown size={12} />
                            Sort
                        </button>
                        {showSortMenu && (
                            <>
                                <div className="fixed inset-0 z-10" onClick={() => setShowSortMenu(false)} />
                                <div className="absolute right-0 mt-1.5 w-40 bg-white dark:bg-[#161b22] border border-black/[0.06] dark:border-[#30363d] rounded-lg z-20 py-1 shadow-lg">
                                    {[
                                        { field: 'customer_name', label: 'Name' },
                                        { field: 'altering_cost', label: 'Cost' },
                                        { field: 'ready_at', label: 'Ready Date' },
                                    ].map(({ field, label }) => (
                                        <button
                                            key={field}
                                            onClick={() => handleSort(field)}
                                            className={`w-full px-3 py-2 text-left text-[10px] font-bold uppercase tracking-widest transition-colors ${sortField === field ? 'text-[#0d3542] dark:text-[#58a6ff] bg-black/[0.03] dark:bg-white/[0.03]' : 'text-gray-500 dark:text-[#8b949e] hover:bg-black/[0.03] dark:hover:bg-white/[0.03]'}`}
                                        >
                                            {label} {sortField === field && (sortOrder === 'asc' ? '↑' : '↓')}
                                        </button>
                                    ))}
                                </div>
                            </>
                        )}
                    </div>

                    {/* Export */}
                    <div className="relative">
                        <button
                            onClick={() => setShowExportMenu(!showExportMenu)}
                            className="h-10 w-10 border border-black/[0.06] dark:border-white/[0.06] rounded-lg text-gray-600 dark:text-[#c9d1d9] hover:bg-black/[0.03] dark:hover:bg-white/[0.03] flex items-center justify-center transition-all"
                        >
                            <Download size={14} />
                        </button>
                        {showExportMenu && (
                            <>
                                <div className="fixed inset-0 z-10" onClick={() => setShowExportMenu(false)} />
                                <div className="absolute right-0 mt-1.5 w-28 bg-white dark:bg-[#161b22] border border-black/[0.06] dark:border-[#30363d] rounded-lg z-20 py-1 shadow-lg">
                                    <button onClick={() => { exportToCSV(); setShowExportMenu(false); }} className="w-full px-3 py-2 text-left text-[10px] font-bold uppercase tracking-widest text-gray-500 dark:text-[#8b949e] hover:bg-black/[0.03] dark:hover:bg-white/[0.03]">CSV</button>
                                    <button onClick={() => { exportToJSON(); setShowExportMenu(false); }} className="w-full px-3 py-2 text-left text-[10px] font-bold uppercase tracking-widest text-gray-500 dark:text-[#8b949e] hover:bg-black/[0.03] dark:hover:bg-white/[0.03]">JSON</button>
                                </div>
                            </>
                        )}
                    </div>
                </div>
            </div>

            {/* ---- Content ---- */}
            {isLoading ? (
                <LoadingState />
            ) : sortedAlterings.length === 0 ? (
                <EmptyState search={searchQuery} filter={statusFilter} />
            ) : (
                <>
                    {/* Desktop: Table */}
                    <div className="hidden md:block bg-white dark:bg-[#161b22] border border-black/[0.06] dark:border-[#30363d] rounded-xl overflow-hidden">
                        <AlteringTable alterings={sortedAlterings} onDetailOpen={handleDetailOpen} />
                    </div>

                    {/* Mobile: Card grid */}
                    <div className="md:hidden grid grid-cols-1 gap-3">
                        <AnimatePresence>
                            {sortedAlterings.map(altering => (
                                <AlteringCard key={altering.id} altering={altering} onDetailOpen={handleDetailOpen} />
                            ))}
                        </AnimatePresence>
                    </div>

                    {/* Pagination */}
                    {pagination.lastPage > 1 && (
                        <div className="flex items-center justify-center gap-2 pt-2">
                            <button
                                onClick={() => handlePageChange(page - 1)}
                                disabled={page === 1}
                                className="h-8 w-8 rounded-lg border border-black/[0.06] dark:border-[#30363d] flex items-center justify-center text-gray-500 disabled:opacity-30 disabled:pointer-events-none hover:bg-black/[0.03] dark:hover:bg-white/[0.03] transition-all"
                            >
                                <ChevronLeft size={14} />
                            </button>
                            <span className="text-[10px] font-bold uppercase tracking-widest text-gray-500 dark:text-[#8b949e] min-w-[60px] text-center">
                                {page} / {pagination.lastPage}
                            </span>
                            <button
                                onClick={() => handlePageChange(page + 1)}
                                disabled={page === pagination.lastPage}
                                className="h-8 w-8 rounded-lg border border-black/[0.06] dark:border-[#30363d] flex items-center justify-center text-gray-500 disabled:opacity-30 disabled:pointer-events-none hover:bg-black/[0.03] dark:hover:bg-white/[0.03] transition-all"
                            >
                                <ChevronRight size={14} />
                            </button>
                        </div>
                    )}
                </>
            )}

            {/* ---- Detail Modal ---- */}
            <ModernModal isOpen={!!selectedDetail} onClose={() => setSelectedDetail(null)} title="Altering Details">
                {selectedDetail && (
                    <div className="p-5 space-y-5">
                        {/* Header */}
                        <div className="flex items-center gap-3 pb-4 border-b border-black/[0.05] dark:border-white/[0.05]">
                            <div className="w-10 h-10 rounded-lg bg-black/[0.03] dark:bg-white/[0.03] flex items-center justify-center">
                                <User size={18} className="text-gray-400" />
                            </div>
                            <div className="flex-1 min-w-0">
                                <h3 className="text-base font-bold text-gray-900 dark:text-[#c9d1d9] truncate">
                                    {selectedDetail.customer_name}
                                </h3>
                                <div className="flex items-center gap-2 mt-0.5">
                                    <StatusBadge status={selectedDetail.status} />
                                    {selectedDetail.order_no && (
                                        <span className="text-[9px] font-mono text-gray-400 dark:text-[#8b949e]">
                                            #{selectedDetail.order_no}
                                        </span>
                                    )}
                                </div>
                            </div>
                        </div>

                        {/* Info grid */}
                        <div className="grid grid-cols-2 gap-3">
                            <InfoBlock icon={<Smartphone size={13} />} label="Phone" value={selectedDetail.mobile || '—'} />
                            <InfoBlock icon={<DollarSign size={13} />} label="Cost" value={`$${selectedDetail.altering_cost || '0.00'}`} accent />
                            <InfoBlock icon={<Package size={13} />} label="Product" value={selectedDetail.product || '—'} />
                            <InfoBlock icon={<Clock size={13} />} label="Ready" value={formatDate(selectedDetail.ready_at, { fallback: 'TBD', month: 'short' })} />
                        </div>

                        {selectedDetail.remark && (
                            <div className="bg-black/[0.02] dark:bg-white/[0.02] rounded-lg p-3.5 border border-black/[0.04] dark:border-white/[0.04]">
                                <span className="text-[9px] font-bold text-gray-400 uppercase tracking-widest block mb-1">Notes</span>
                                <p className="text-[12px] text-gray-600 dark:text-[#8b949e] leading-relaxed">{selectedDetail.remark}</p>
                            </div>
                        )}

                        {/* Actions */}
                        <div className="flex flex-col gap-2 pt-4 border-t border-black/[0.05] dark:border-white/[0.05]">
                            <div className="flex gap-2">
                                {selectedDetail.status !== 'completed' && (
                                    <button
                                        onClick={() => { updateMutation.mutate({ id: selectedDetail.id, data: { status: 'completed' } }); setSelectedDetail(null); }}
                                        className="flex-1 h-9 bg-emerald-50 dark:bg-emerald-500/10 border border-emerald-200 dark:border-emerald-500/20 text-emerald-700 dark:text-emerald-400 rounded-lg text-[10px] font-bold uppercase tracking-widest hover:bg-emerald-100 dark:hover:bg-emerald-500/20 transition-all flex items-center justify-center gap-1.5"
                                    >
                                        <CheckCircle2 size={13} /> Complete
                                    </button>
                                )}
                                <button
                                    onClick={() => handleNotify(selectedDetail.id)}
                                    disabled={isNotifying === selectedDetail.id}
                                    className="flex-1 h-9 bg-white dark:bg-[#161b22] border border-black/[0.06] dark:border-[#30363d] text-gray-600 dark:text-[#c9d1d9] rounded-lg text-[10px] font-bold uppercase tracking-widest hover:bg-black/[0.03] dark:hover:bg-white/[0.03] transition-all flex items-center justify-center gap-1.5"
                                >
                                    {isNotifying === selectedDetail.id ? <Loader2 className="animate-spin" size={13} /> : <Mail size={13} />}
                                    Notify
                                </button>
                            </div>
                            <div className="flex items-center justify-between pt-1">
                                <button
                                    onClick={() => { if (confirm('Delete this record?')) { deleteMutation.mutate(selectedDetail.id); setSelectedDetail(null); } }}
                                    className="text-[10px] text-rose-500/70 hover:text-rose-500 font-medium transition-colors"
                                >
                                    Delete Record
                                </button>
                                <span className="text-[9px] text-gray-400 dark:text-[#8b949e]/40 font-medium">
                                    {selectedDetail.notified_at ? `Notified ${formatDate(selectedDetail.notified_at, { month: 'short' })}` : 'Not notified'}
                                </span>
                            </div>
                        </div>
                    </div>
                )}
            </ModernModal>

            {/* ---- Add Modal ---- */}
            <ModernModal isOpen={isAdding} onClose={() => setIsAdding(false)} title="New Altering Record">
                <form
                    onSubmit={(e) => {
                        e.preventDefault();
                        if (!formData.customer_name || !formData.product || !formData.altering_cost || !formData.ready_at) {
                            return alert('Customer name, product, cost, and ready date are required.');
                        }
                        createMutation.mutate(formData);
                    }}
                    className="p-5 space-y-5 bg-white dark:bg-[#0d1117]"
                >
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <InputField label="Customer Name *" icon={<User size={11} />} value={formData.customer_name} onChange={(e) => setFormData({ ...formData, customer_name: e.target.value })} placeholder="Full Name" required />
                        <InputField label="Phone" icon={<Smartphone size={11} />} value={formData.mobile} onChange={(e) => setFormData({ ...formData, mobile: e.target.value })} placeholder="+1 (555) 000-0000" />
                        <InputField label="Order Number" icon={<Package size={11} />} value={formData.order_no} onChange={(e) => setFormData({ ...formData, order_no: e.target.value })} placeholder="#ORD-..." />
                        <InputField label="Cost ($) *" icon={<DollarSign size={11} />} type="number" step="0.01" value={formData.altering_cost} onChange={(e) => setFormData({ ...formData, altering_cost: e.target.value })} placeholder="0.00" required />
                    </div>

                    <div className="flex flex-col gap-1.5">
                        <label className="text-[9px] font-bold text-gray-400 dark:text-[#8b949e]/50 uppercase tracking-widest flex items-center gap-1.5">
                            <Package size={11} className="opacity-40" />
                            Product / Alterations *
                        </label>
                        <textarea
                            required
                            rows={3}
                            value={formData.product}
                            onChange={(e) => setFormData({ ...formData, product: e.target.value })}
                            placeholder="Describe the garment and required alterations..."
                            className="bg-black/[0.02] dark:bg-white/[0.02] p-3 text-[12px] font-medium text-gray-900 dark:text-[#c9d1d9] border border-black/[0.06] dark:border-white/[0.06] rounded-lg outline-none focus:border-[#0d3542]/40 dark:focus:border-[#58a6ff]/40 transition-colors resize-none placeholder:text-gray-300 dark:placeholder:text-[#8b949e]/20"
                        />
                    </div>

                    <div className="flex flex-col gap-1.5">
                        <label className="text-[9px] font-bold text-gray-400 dark:text-[#8b949e]/50 uppercase tracking-widest flex items-center gap-1.5">
                            <Mail size={11} className="opacity-40" />
                            Notes
                        </label>
                        <textarea
                            rows={2}
                            value={formData.remark}
                            onChange={(e) => setFormData({ ...formData, remark: e.target.value })}
                            placeholder="Internal notes..."
                            className="bg-black/[0.02] dark:bg-white/[0.02] p-3 text-[12px] font-medium text-gray-900 dark:text-[#c9d1d9] border border-black/[0.06] dark:border-white/[0.06] rounded-lg outline-none focus:border-[#0d3542]/40 dark:focus:border-[#58a6ff]/40 transition-colors resize-none placeholder:text-gray-300 dark:placeholder:text-[#8b949e]/20"
                        />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <InputField label="Start Date" icon={<Clock size={11} />} type="date" value={formData.start_date} onChange={(e) => setFormData({ ...formData, start_date: e.target.value })} />
                        <InputField label="Ready Date *" icon={<Clock size={11} />} type="date" value={formData.ready_at} onChange={(e) => setFormData({ ...formData, ready_at: e.target.value })} required />
                    </div>

                    <div className="flex items-center justify-end gap-3 pt-4 border-t border-black/[0.05] dark:border-white/[0.05]">
                        <button type="button" onClick={() => setIsAdding(false)} className="px-4 py-2.5 text-[10px] font-bold uppercase tracking-widest text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors">
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={createMutation.isPending}
                            className="h-9 px-5 bg-[#0d3542] dark:bg-[#58a6ff] text-white dark:text-black rounded-lg text-[10px] font-bold uppercase tracking-widest hover:opacity-90 active:scale-[0.97] transition-all disabled:opacity-50 flex items-center gap-2"
                        >
                            {createMutation.isPending ? <Loader2 className="animate-spin" size={14} /> : <CheckCircle2 size={14} />}
                            Save Record
                        </button>
                    </div>
                </form>
            </ModernModal>

            {/* ---- Sync Modal ---- */}
            <ModernModal isOpen={showSyncModal} onClose={() => setShowSyncModal(false)} title="Sync Google Sheet">
                <div className="p-5 space-y-4">
                    <div className="flex flex-col items-center justify-center p-5 border border-dashed border-black/[0.08] dark:border-white/[0.08] rounded-xl bg-black/[0.01] dark:bg-white/[0.01]">
                        <RefreshCw size={24} className={`text-gray-400 mb-3 ${isSyncing ? 'animate-spin' : ''}`} />
                        <p className="text-[10px] font-bold uppercase tracking-widest text-gray-400 dark:text-[#8b949e]">
                            Google Sheets Bridge
                        </p>
                    </div>

                    <InputField
                        label="Sheet URL"
                        icon={<ExternalLink size={11} />}
                        type="text"
                        placeholder="https://docs.google.com/spreadsheets/d/..."
                        value={syncUrl}
                        onChange={(e) => setSyncUrl(e.target.value)}
                    />

                    <div className="flex items-start gap-2 p-3 bg-amber-500/5 dark:bg-amber-500/5 rounded-lg border border-amber-500/10">
                        <AlertCircle size={13} className="text-amber-500 mt-0.5 shrink-0" />
                        <p className="text-[10px] text-gray-500 dark:text-[#8b949e] leading-snug">
                            Make sure the sheet is shared with <strong className="text-gray-700 dark:text-[#c9d1d9]">"Anyone with the link"</strong>.
                        </p>
                    </div>

                    <button
                        onClick={handleSync}
                        disabled={isSyncing || !syncUrl}
                        className="w-full h-10 bg-[#0d3542] dark:bg-[#58a6ff] text-white dark:text-black rounded-lg text-[10px] font-bold uppercase tracking-widest hover:opacity-90 disabled:opacity-40 transition-all flex items-center justify-center gap-2"
                    >
                        {isSyncing ? (
                            <><Loader2 className="animate-spin" size={13} /> Syncing…</>
                        ) : (
                            <><RefreshCw size={13} /> Start Sync</>
                        )}
                    </button>
                </div>
            </ModernModal>
        </div>
    );
}

/* ------------------------------------------------------------------ */
/*  Info Block (for detail modal)                                      */
/* ------------------------------------------------------------------ */
const InfoBlock = React.memo(({ icon, label, value, accent }) => (
    <div className="bg-black/[0.02] dark:bg-white/[0.02] rounded-lg p-3 border border-black/[0.04] dark:border-white/[0.04]">
        <div className="flex items-center gap-1.5 mb-1">
            <span className="text-gray-400 dark:text-[#8b949e]/40">{icon}</span>
            <span className="text-[9px] font-bold text-gray-400 dark:text-[#8b949e]/40 uppercase tracking-widest">{label}</span>
        </div>
        <p className={`text-[12px] font-medium ${accent ? 'text-[#0d3542] dark:text-[#58a6ff]' : 'text-gray-700 dark:text-[#c9d1d9]'}`}>
            {value}
        </p>
    </div>
));
