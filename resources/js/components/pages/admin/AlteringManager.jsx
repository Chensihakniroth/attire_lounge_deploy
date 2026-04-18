import React, { useState, useEffect, useMemo, useCallback, Suspense, lazy } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import axios from 'axios';
import { motion, AnimatePresence, useReducedMotion } from 'framer-motion';
import { 
    Scissors, 
    Search, 
    X, 
    Smartphone, 
    Clock, 
    MoreVertical, 
    RefreshCw, 
    Plus, 
    Download, 
    ChevronDown, 
    DollarSign, 
    Package, 
    User, 
    AlertCircle, 
    CheckCircle2, 
    Mail,
    ExternalLink,
    Eye
} from 'lucide-react';
import { LumaSpin } from '@/components/ui/luma-spin';
import { Card, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { BorderBeam } from '@/components/ui/border-beam';
import ModernModal from '../../common/ModernModal.jsx';
import { formatDate } from '@/helpers/format';
import DatePicker from '@/components/ui/DatePicker';
import MorphingPageDots from '@/components/ui/morphing-page-dots';

const statusConfig = {
    pending: {
        label: 'Pending',
        icon: Clock,
        bgColor: 'bg-amber-500/10',
        textColor: 'text-amber-500',
        borderColor: 'border-amber-500/20',
    },
    in_progress: {
        label: 'In Progress',
        icon: RefreshCw,
        bgColor: 'bg-blue-500/10',
        textColor: 'text-blue-500',
        borderColor: 'border-blue-500/20',
    },
    ready: {
        label: 'Ready',
        icon: CheckCircle2,
        bgColor: 'bg-emerald-500/10',
        textColor: 'text-emerald-500',
        borderColor: 'border-emerald-500/20',
    },
    completed: {
        label: 'Completed',
        icon: Scissors,
        bgColor: 'bg-gray-500/10',
        textColor: 'text-gray-500',
        borderColor: 'border-gray-500/20',
    },
};

const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
        opacity: 1,
        transition: {
            staggerChildren: 0.05,
        },
    },
};

const LoadingState = () => (
    <div className="flex flex-col items-center justify-center py-32 space-y-4">
        <LumaSpin size="xl" />
        <p className="text-[10px] font-black uppercase tracking-[0.4em] text-gray-400 dark:text-[#8b949e]/40">Gathering Alteration Logs...</p>
    </div>
);

const AlteringRow = React.memo(({ 
    altering, 
    statusConfig, 
    isSelected, 
    onSelect, 
    onDetailOpen,
    shouldAnimate,
    rowVariants 
}) => {
    const status = statusConfig[altering.status] || statusConfig.pending;

    return (
        <tr
            className={`hover:bg-black/[0.01] dark:hover:bg-white/[0.01] transition-colors group cursor-pointer ${
                isSelected ? 'bg-[#0d3542]/5 dark:bg-[#58a6ff]/5' : ''
            }`}
            onClick={() => onDetailOpen(altering)}
        >
            <td 
                className="px-6 py-6 w-12 text-center"
                onClick={(e) => e.stopPropagation()}
            >
                <input
                    type="checkbox"
                    className="w-4 h-4 rounded border-gray-300 dark:border-[#30363d] bg-transparent accent-[#0d3542] dark:accent-[#58a6ff] cursor-pointer"
                    checked={isSelected}
                    onChange={() => onSelect(altering.id)}
                />
            </td>

            <td className="px-6 py-6">
                <span className="text-sm font-bold text-gray-900 dark:text-[#c9d1d9] truncate uppercase tracking-widest">
                    {altering.customer_name}
                </span>
            </td>

            <td className="px-6 py-6 flex flex-col justify-center">
                <div className="text-xs font-bold text-gray-800 dark:text-gray-300 uppercase tracking-widest">
                    #{altering.order_no || 'MNL'}
                </div>
                <div className="text-xs text-gray-500 dark:text-[#8b949e]/60 flex items-center gap-1 uppercase tracking-widest mt-1">
                    <Smartphone size={10} />
                    {altering.mobile || 'N/A'}
                </div>
            </td>

            <td className="px-6 py-6">
                <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-lg text-xs font-bold uppercase tracking-widest border ${status.bgColor} ${status.textColor} ${status.borderColor}`}>
                    <status.icon size={12} className="mr-1 opacity-70" />
                    {status.label}
                </span>
            </td>

            <td className="px-6 py-6 text-right">
                <span className="text-sm font-bold text-[#0d3542] dark:text-[#58a6ff] tracking-widest">
                    ${parseFloat(altering.altering_cost || 0).toFixed(2)}
                </span>
            </td>

            <td className="px-6 py-6 max-w-[200px]">
                <span className="text-xs font-bold text-gray-500 dark:text-[#8b949e]/60 truncate block italic tracking-wide">
                    {altering.product || 'Unspecified'}
                </span>
            </td>

            <td className="px-6 py-6">
                <div className="flex flex-col">
                    <span className="text-xs font-bold text-gray-800 dark:text-gray-300 uppercase tracking-widest">
                        {formatDate(altering.ready_at, { fallback: 'N/A', month: 'short' })}
                    </span>
                    <span className="text-xs text-gray-500 dark:text-[#8b949e]/60 uppercase tracking-widest mt-1">
                        {altering.ready_at ? 'Target' : 'TBD'}
                    </span>
                </div>
            </td>

            <td className="px-6 py-6 text-right" onClick={(e) => e.stopPropagation()}>
                <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button 
                        onClick={() => onDetailOpen(altering)}
                        className="p-2.5 rounded-lg bg-black/5 dark:bg-[#0d1117] text-gray-400 hover:text-[#0d3542] dark:hover:text-[#58a6ff] hover:bg-[#0d3542]/10 dark:hover:bg-[#58a6ff]/10 transition-all border border-transparent dark:border-[#30363d]"
                    >
                        <Eye size={14} />
                    </button>
                    <button className="p-2.5 rounded-lg bg-black/5 dark:bg-[#0d1117] text-gray-400 hover:text-[#0d3542] dark:hover:text-[#58a6ff] hover:bg-[#0d3542]/10 dark:hover:bg-[#58a6ff]/10 transition-all border border-transparent dark:border-[#30363d]">
                        <MoreVertical size={14} />
                    </button>
                </div>
            </td>
        </tr>
    );
});

const AlteringTable = React.memo(({ 
    alterings, 
    selectedItems, 
    onItemSelect, 
    onSelectAll, 
    onDetailOpen,
    shouldAnimate,
    rowVariants 
}) => {
    return (
        <div className="w-full text-left">
            <table className="w-full text-left border-collapse">
                <thead>
                    <tr className="bg-black/[0.02] dark:bg-[#0d1117] border-b border-black/5 dark:border-[#30363d]">
                        <th className="px-6 py-5 text-center w-12">
                            <input
                                type="checkbox"
                                className="w-4 h-4 rounded border-gray-300 dark:border-[#30363d] bg-transparent accent-[#0d3542] dark:accent-[#58a6ff] cursor-pointer"
                                checked={alterings.length > 0 && selectedItems.length === alterings.length}
                                onChange={onSelectAll}
                            />
                        </th>
                        {['Client', 'Ref & Mobile', 'Status', 'Adj. Cost', 'Garment Info', 'Scheduled', 'Actions'].map((h, i) => (
                            <th key={i} className={`px-6 py-5 text-xs font-bold uppercase tracking-[0.2em] text-gray-500 dark:text-[#8b949e]/40 whitespace-nowrap ${i === 3 || i === 6 ? 'text-right' : ''}`}>
                                {h}
                            </th>
                        ))}
                    </tr>
                </thead>
                
                <tbody className="divide-y divide-black/5 dark:divide-[#30363d]">
                    {alterings.length === 0 ? (
                        <tr>
                            <td colSpan="8" className="py-20 text-center opacity-30 italic font-medium uppercase tracking-widest text-sm">
                                No active records
                            </td>
                        </tr>
                    ) : (
                        alterings.map((altering) => (
                            <AlteringRow
                                key={altering.id}
                                altering={altering}
                                statusConfig={statusConfig}
                                isSelected={selectedItems.includes(altering.id)}
                                onSelect={onItemSelect}
                                onDetailOpen={onDetailOpen}
                                shouldAnimate={shouldAnimate}
                                rowVariants={rowVariants}
                            />
                        ))
                    )}
                </tbody>
            </table>
        </div>
    );
});

export default function AlteringManager() {
    const queryClient = useQueryClient();
    const [mounted, setMounted] = useState(false);

    // API State
    const [page, setPage] = useState(1);
    const [statusFilter, setStatusFilter] = useState('');
    const [searchQuery, setSearchQuery] = useState('');

    // UI State
    const [selectedItems, setSelectedItems] = useState([]);
    const [sortField, setSortField] = useState(null);
    const [sortOrder, setSortOrder] = useState('asc');
    const [showSortMenu, setShowSortMenu] = useState(false);
    const [showFilterMenu, setShowFilterMenu] = useState(false);
    const [showExportMenu, setShowExportMenu] = useState(false);

    // Modals
    const [selectedDetail, setSelectedDetail] = useState(null);
    const [isAdding, setIsAdding] = useState(false);
    const [showSyncModal, setShowSyncModal] = useState(false);
    const [syncUrl, setSyncUrl] = useState('');
    const [isSyncing, setIsSyncing] = useState(false);
    const [wizardStep, setWizardStep] = useState(1);
    const [isNotifying, setIsNotifying] = useState(null);
    const [formData, setFormData] = useState({
        customer_name: '',
        order_no: '',
        mobile: '',
        product: '',
        remark: '',
        altering_cost: '',
        ready_at: '',
        start_date: new Date().toISOString().split('T')[0],
    });

    const shouldReduceMotion = useReducedMotion();

    // Data Fetching
    const { data: alteringsData, isLoading } = useQuery({
        queryKey: ['admin-alterings', page, statusFilter, searchQuery],
        queryFn: async () => {
            const { data } = await axios.get('/api/v1/admin/alterings', {
                params: {
                    page,
                    status: statusFilter
                        ? statusFilter.toLowerCase().replace(' ', '_')
                        : 'all',
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

    // Mutations
    const updateMutation = useMutation({
        mutationFn: async ({ id, data }) =>
            axios.put(`/api/v1/admin/alterings/${id}`, data),
        onSuccess: () =>
            queryClient.invalidateQueries({ queryKey: ['admin-alterings'] }),
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
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['admin-alterings'] });
            setSelectedItems([]);
        },
    });

    const createMutation = useMutation({
        mutationFn: async (data) => axios.post('/api/v1/admin/alterings', data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['admin-alterings'] });
            setIsAdding(false);
            setTimeout(() => setWizardStep(1), 300); // reset after exit anim
            setFormData({
                customer_name: '',
                order_no: '',
                mobile: '',
                product: '',
                remark: '',
                altering_cost: '',
                ready_at: '',
                start_date: new Date().toISOString().split('T')[0],
            });
        },
    });

    const handleNotify = async (id) => {
        setIsNotifying(id);
        try {
            await axios.post(`/api/v1/admin/alterings/${id}/notify`);
            queryClient.invalidateQueries({ queryKey: ['admin-alterings'] });
        } catch (err) {
            console.error(err);
        } finally {
            setIsNotifying(null);
        }
    };

    useEffect(() => {
        setMounted(true);
    }, []);

    // 📊 Business Logic (Memoized)
    const sortedAlterings = useMemo(() => {
        let sorted = [...alterings];
        if (!sortField) return sorted;

        return sorted.sort((a, b) => {
            let aVal = a[sortField] || '';
            let bVal = b[sortField] || '';

            if (sortField === 'altering_cost') {
                aVal = parseFloat(aVal) || 0;
                bVal = parseFloat(bVal) || 0;
            }

            if (aVal < bVal) return sortOrder === 'asc' ? -1 : 1;
            if (aVal > bVal) return sortOrder === 'asc' ? 1 : -1;
            return 0;
        });
    }, [alterings, sortField, sortOrder]);

    const exportToCSV = useCallback(() => {
        const headers = ['Customer', 'Order No', 'Mobile', 'Product', 'Status', 'Cost', 'Ready At'];
        const rows = sortedAlterings.map((alt) => [
            alt.customer_name,
            alt.order_no || '',
            alt.mobile || '',
            alt.product || '',
            alt.status,
            alt.altering_cost || '0',
            alt.ready_at || '',
        ]);
        const csvContent = [
            headers.join(','),
            ...rows.map((row) => row.map((cell) => `"${String(cell).replace(/"/g, '""')}"`).join(',')),
        ].join('\n');
        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement('a');
        link.href = URL.createObjectURL(blob);
        link.download = `alterings-${new Date().toISOString().split('T')[0]}.csv`;
        link.click();
    }, [sortedAlterings]);

    const exportToJSON = useCallback(() => {
        const jsonContent = JSON.stringify(sortedAlterings, null, 2);
        const blob = new Blob([jsonContent], { type: 'application/json;charset=utf-8;' });
        const link = document.createElement('a');
        link.href = URL.createObjectURL(blob);
        link.download = `alterings-${new Date().toISOString().split('T')[0]}.json`;
        link.click();
    }, [sortedAlterings]);

    const shouldAnimate = !shouldReduceMotion;

    const rowVariants = {
        hidden: { opacity: 0, y: 30, filter: 'blur(10px)' },
        visible: {
            opacity: 1,
            y: 0,
            filter: 'blur(0px)',
            transition: { duration: 0.6, ease: [0.16, 1, 0.3, 1] },
        },
        exit: {
            opacity: 0,
            y: -20,
            filter: 'blur(4px)',
            transition: { duration: 0.3 },
        },
    };

    // 🖱️ Event Handlers (Memoized)
    const handleSort = useCallback((field) => {
        setSortField((prev) => {
            if (prev === field) {
                setSortOrder((p) => (p === 'asc' ? 'desc' : 'asc'));
                return prev;
            }
            setSortOrder('asc');
            return field;
        });
        setShowSortMenu(false);
    }, []);

    const handleSelectAll = useCallback(() => {
        setSelectedItems((prev) => 
            prev.length === sortedAlterings.length ? [] : sortedAlterings.map((a) => a.id)
        );
    }, [sortedAlterings]);

    const handleItemSelect = useCallback((id) => {
        setSelectedItems((prev) =>
            prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]
        );
    }, []);

    const handleSync = useCallback(async () => {
        if (!syncUrl || !window.hika) return;
        setIsSyncing(true);
        try {
            await window.hika.import('altering', syncUrl);
            queryClient.invalidateQueries(['admin-alterings']);
            setShowSyncModal(false);
            setSyncUrl('');
        } catch (err) {
            console.error(err);
        } finally {
            setIsSyncing(false);
        }
    }, [syncUrl, queryClient]);

    const handleDetailOpen = useCallback((altering) => {
        setSelectedDetail(altering);
    }, []);

    const handlePageChange = useCallback((newPage) => {
        setPage(newPage);
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

    return (
        <div className="p-8 space-y-8 font-sans">
            {/* Header Section */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div>
                    <h1 className="text-2xl font-serif text-gray-900 dark:text-[#c9d1d9] uppercase tracking-[0.2em] flex items-center gap-3">
                        <Scissors className="w-5 h-5 text-gray-400 dark:text-[#8b949e]" />
                        Altering Logs
                    </h1>
                    <p className="text-sm text-gray-500 dark:text-[#8b949e]/60 mt-1 uppercase tracking-widest">
                        Tailor Queue Management
                    </p>
                </div>

                <div className="flex items-center gap-3 flex-wrap">
                    <Button
                        onClick={() => setShowSyncModal(true)}
                        className="bg-white dark:bg-[#0d1117] text-gray-600 dark:text-[#c9d1d9] hover:bg-black/5 dark:hover:bg-[#161b22] transition-colors py-2 px-4 rounded-lg font-bold uppercase tracking-widest text-xs border border-black/5 dark:border-[#30363d] shadow-none"
                    >
                        <RefreshCw className={`w-3.5 h-3.5 mr-2 ${isSyncing ? 'animate-spin' : ''}`} />
                        Sync Sheet
                    </Button>

                    <Button
                        onClick={() => setIsAdding(true)}
                        className="bg-[#0d3542] dark:bg-[#58a6ff]/10 text-white dark:text-[#58a6ff] dark:border dark:border-[#58a6ff]/30 hover:opacity-90 dark:hover:bg-[#58a6ff]/20 transition-colors py-2 px-4 rounded-lg font-bold uppercase tracking-widest text-xs shadow-none"
                    >
                        <Plus className="w-3.5 h-3.5 mr-2" /> Add Record
                    </Button>
                </div>
            </div>

            {/* Filter Bar */}
            <div className="flex flex-col lg:flex-row gap-4 items-center bg-white dark:bg-[#161b22] p-4 rounded-xl border border-black/5 dark:border-[#30363d] shadow-none">
                <div className="flex items-center gap-4 flex-1 flex-wrap lg:flex-nowrap w-full">
                    <div className="relative flex-1 group min-w-[200px]">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-[#0d3542] dark:group-focus-within:text-[#58a6ff] transition-colors" size={18} />
                        <input
                            type="text"
                            placeholder="Search records..."
                            value={searchQuery}
                            onChange={(e) => {
                                setSearchQuery(e.target.value);
                                setPage(1);
                            }}
                            className="w-full bg-black/[0.02] dark:bg-[#0d1117] border border-black/5 dark:border-[#30363d] rounded-lg py-3 pl-12 pr-8 text-sm font-bold uppercase tracking-widest outline-none focus:border-[#0d3542]/50 dark:focus:border-[#58a6ff]/50 transition-all placeholder:text-gray-400 dark:placeholder:text-[#8b949e]/20"
                        />
                        {searchQuery && (
                            <button
                                onClick={() => {
                                    setSearchQuery('');
                                    setPage(1);
                                }}
                                className="absolute right-3 top-1/2 -translate-y-1/2 p-0.5 hover:bg-black/5 dark:hover:bg-[#30363d] rounded text-gray-400 dark:text-[#8b949e] hover:text-[#0d3542] dark:hover:text-[#58a6ff] transition-all"
                                title="Clear search"
                            >
                                <X size={14} />
                            </button>
                        )}
                    </div>

                    {(searchQuery || statusFilter) && (
                        <button
                            onClick={() => {
                                setSearchQuery('');
                                setStatusFilter('');
                                setPage(1);
                            }}
                            className="text-xs font-bold underline uppercase tracking-widest text-[#0d3542] dark:text-[#58a6ff] hover:opacity-70 transition-colors px-2 whitespace-nowrap"
                        >
                            Reset Focus
                        </button>
                    )}

                    <div className="relative">
                        <button
                            onClick={() => setShowFilterMenu(!showFilterMenu)}
                            className={`px-4 py-3 bg-white dark:bg-[#0d1117] border border-black/5 dark:border-[#30363d] text-gray-600 dark:text-[#c9d1d9] hover:bg-black/5 dark:hover:bg-[#161b22] transition-colors flex items-center gap-2 rounded-lg font-bold tracking-widest uppercase text-xs whitespace-nowrap ${statusFilter ? 'ring-1 ring-[#0d3542]/50 dark:ring-[#58a6ff]/50' : ''}`}
                        >
                            <svg width="12" height="12" viewBox="0 0 16 16" fill="none">
                                <path d="M2 3H14M4 8H12M6 13H10" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
                            </svg>
                            Filter Stage
                            {statusFilter && (
                                <span className="ml-1 text-[10px] bg-[#0d3542] dark:bg-[#58a6ff] text-white dark:text-[#0d1117] font-black rounded px-1.5 py-0.5 leading-none">
                                    1
                                </span>
                            )}
                        </button>
                        {showFilterMenu && (
                            <>
                                <div className="fixed inset-0 z-10" onClick={() => setShowFilterMenu(false)} />
                                <div className="absolute right-0 mt-2 w-48 bg-white dark:bg-[#161b22] border border-black/5 dark:border-[#30363d] rounded-xl z-20 py-2 shadow-xl">
                                    <button
                                        onClick={() => {
                                            setStatusFilter('');
                                            setShowFilterMenu(false);
                                            setPage(1);
                                        }}
                                        className={`w-full px-4 py-2.5 text-left text-xs font-bold uppercase tracking-widest text-gray-900 dark:text-[#c9d1d9] hover:bg-black/5 dark:hover:bg-[#30363d] transition-colors ${!statusFilter ? 'bg-black/5 dark:bg-[#30363d]/50' : ''}`}
                                    >
                                        All Records
                                    </button>
                                    <div className="h-px bg-black/5 dark:bg-[#30363d] my-1" />
                                    {['Pending', 'In Progress', 'Ready', 'Completed'].map((status) => (
                                        <button
                                            key={status}
                                            onClick={() => {
                                                setStatusFilter(status);
                                                setShowFilterMenu(false);
                                                setPage(1);
                                            }}
                                            className={`w-full px-4 py-2.5 text-left text-xs font-bold uppercase tracking-widest text-gray-500 dark:text-[#8b949e] hover:text-gray-900 dark:hover:text-[#c9d1d9] hover:bg-black/5 dark:hover:bg-[#30363d] transition-colors ${statusFilter === status ? 'bg-black/5 dark:bg-[#30363d]/50 text-gray-900 dark:text-[#c9d1d9]' : ''}`}
                                        >
                                            {status}
                                        </button>
                                    ))}
                                </div>
                            </>
                        )}
                    </div>

                    <div className="relative">
                        <button
                            onClick={() => setShowSortMenu(!showSortMenu)}
                            className="px-4 py-3 bg-white dark:bg-[#0d1117] border border-black/5 dark:border-[#30363d] text-gray-600 dark:text-[#c9d1d9] hover:bg-black/5 dark:hover:bg-[#161b22] transition-colors flex items-center gap-2 rounded-lg font-bold tracking-widest uppercase text-xs whitespace-nowrap"
                        >
                            <svg width="12" height="12" viewBox="0 0 16 16" fill="none">
                                <path d="M3 6L6 3L9 6M6 3V13M13 10L10 13L7 10M10 13V3" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                            </svg>
                            Sort
                            <ChevronDown size={14} className="opacity-50" />
                        </button>
                        {showSortMenu && (
                            <>
                                <div className="fixed inset-0 z-10" onClick={() => setShowSortMenu(false)} />
                                <div className="absolute right-0 mt-2 w-48 bg-white dark:bg-[#161b22] border border-black/5 dark:border-[#30363d] rounded-xl z-20 py-2 shadow-xl">
                                    <button
                                        onClick={() => handleSort('customer_name')}
                                        className={`w-full px-4 py-2.5 text-left text-xs font-bold uppercase tracking-widest hover:bg-black/5 dark:hover:bg-[#30363d] text-gray-500 dark:text-[#8b949e] hover:text-gray-900 dark:hover:text-[#c9d1d9] ${sortField === 'customer_name' ? 'bg-black/5 dark:bg-[#30363d]/50 text-gray-900 dark:text-[#c9d1d9]' : ''}`}
                                    >
                                        Name {sortField === 'customer_name' && (sortOrder === 'asc' ? 'A-Z' : 'Z-A')}
                                    </button>
                                    <button
                                        onClick={() => handleSort('altering_cost')}
                                        className={`w-full px-4 py-2.5 text-left text-xs font-bold uppercase tracking-widest hover:bg-black/5 dark:hover:bg-[#30363d] text-gray-500 dark:text-[#8b949e] hover:text-gray-900 dark:hover:text-[#c9d1d9] ${sortField === 'altering_cost' ? 'bg-black/5 dark:bg-[#30363d]/50 text-gray-900 dark:text-[#c9d1d9]' : ''}`}
                                    >
                                        Cost {sortField === 'altering_cost' && (sortOrder === 'asc' ? 'Low-High' : 'High-Low')}
                                    </button>
                                    <button
                                        onClick={() => handleSort('ready_at')}
                                        className={`w-full px-4 py-2.5 text-left text-xs font-bold uppercase tracking-widest hover:bg-black/5 dark:hover:bg-[#30363d] text-gray-500 dark:text-[#8b949e] hover:text-gray-900 dark:hover:text-[#c9d1d9] ${sortField === 'ready_at' ? 'bg-black/5 dark:bg-[#30363d]/50 text-gray-900 dark:text-[#c9d1d9]' : ''}`}
                                    >
                                        Ready {sortField === 'ready_at' && (sortOrder === 'asc' ? 'Old-New' : 'New-Old')}
                                    </button>
                                </div>
                            </>
                        )}
                    </div>

                    <div className="relative">
                        <button
                            onClick={() => setShowExportMenu(!showExportMenu)}
                            className="px-4 py-3 bg-white dark:bg-[#0d1117] border border-black/5 dark:border-[#30363d] text-gray-600 dark:text-[#c9d1d9] hover:bg-black/5 dark:hover:bg-[#161b22] transition-colors flex items-center gap-2 rounded-lg font-bold tracking-widest uppercase text-xs whitespace-nowrap"
                        >
                            <Download size={14} /> Export <ChevronDown size={14} className="opacity-50" />
                        </button>
                        {showExportMenu && (
                            <>
                                <div className="fixed inset-0 z-10" onClick={() => setShowExportMenu(false)} />
                                <div className="absolute right-0 mt-2 w-32 bg-white dark:bg-[#161b22] border border-black/5 dark:border-[#30363d] rounded-xl z-20 py-2 shadow-xl">
                                    <button
                                        onClick={() => { exportToCSV(); setShowExportMenu(false); }}
                                        className="w-full px-4 py-2.5 text-left text-xs font-bold uppercase tracking-widest hover:bg-black/5 dark:hover:bg-[#30363d] text-gray-500 dark:text-[#8b949e] hover:text-gray-900 dark:hover:text-[#c9d1d9]"
                                    >
                                        CSV
                                    </button>
                                    <button
                                        onClick={() => { exportToJSON(); setShowExportMenu(false); }}
                                        className="w-full px-4 py-2.5 text-left text-xs font-bold uppercase tracking-widest hover:bg-black/5 dark:hover:bg-[#30363d] text-gray-500 dark:text-[#8b949e] hover:text-gray-900 dark:hover:text-[#c9d1d9]"
                                    >
                                        JSON
                                    </button>
                                </div>
                            </>
                        )}
                    </div>

                    {selectedItems.length > 0 && (
                        <div className="flex items-center gap-2">
                            <button
                                onClick={() => setSelectedItems([])}
                                className="bg-white dark:bg-[#0d1117] hover:bg-black/5 dark:hover:bg-[#161b22] text-gray-500 dark:text-[#8b949e] transition-all px-4 py-3 rounded-lg font-bold uppercase tracking-widest text-xs border border-black/5 dark:border-[#30363d] flex items-center gap-2 whitespace-nowrap"
                            >
                                <X size={12} strokeWidth={3} />
                                Clear {selectedItems.length}
                            </button>
                            <button
                                onClick={() => {
                                    if (window.confirm(`Are you sure you want to delete ${selectedItems.length} selected records?`)) {
                                        bulkDeleteMutation.mutate(selectedItems);
                                    }
                                }}
                                disabled={bulkDeleteMutation.isPending}
                                className="bg-red-500/10 hover:bg-red-500 text-red-500 hover:text-white transition-all px-4 py-3 rounded-lg font-bold uppercase tracking-widest text-xs flex items-center gap-2 disabled:opacity-50 whitespace-nowrap"
                            >
                                {bulkDeleteMutation.isPending ? (
                                    <LumaSpin className="animate-spin" size="xs" />
                                ) : (
                                    <svg width="10" height="10" viewBox="0 0 16 16" fill="none">
                                        <path d="M3 4H13M5 4V3C5 2.44772 5.44772 2 6 2H10C10.5523 2 11 2.44772 11 3V4M6.5 7V11M9.5 7V11M4 4V13C4 13.5523 4.44772 14 5 14H11C11.5523 14 12 13.5523 12 13V4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                                    </svg>
                                )}
                                Delete Selected
                            </button>
                        </div>
                    )}
                </div>
            </div>

            {/* Table Area - Optimized for performance */}
            <div className="bg-white dark:bg-[#161b22] border border-black/5 dark:border-[#30363d] rounded-xl overflow-hidden min-h-[400px] shadow-none">
                <Suspense fallback={<LoadingState />}>
                    {isLoading ? (
                        <LoadingState />
                    ) : (
                        <div className="overflow-x-auto">
                            <AlteringTable 
                                alterings={sortedAlterings} 
                                selectedItems={selectedItems}
                                onItemSelect={handleItemSelect}
                                onSelectAll={handleSelectAll}
                                onDetailOpen={handleDetailOpen}
                                shouldAnimate={shouldAnimate}
                                rowVariants={rowVariants}
                            />
                        </div>
                    )}
                </Suspense>
            </div>

                {/* Pagination */}
                {!isLoading && pagination.total > 0 && (
                    <div className="flex items-center justify-center p-5 border-t border-black/5 dark:border-[#30363d] bg-black/[0.01] dark:bg-[#161b22]">
                        <MorphingPageDots
                            total={pagination.lastPage}
                            activeIndex={pagination.currentPage - 1}
                            onChange={(index) => handlePageChange(index + 1)}
                        />
                    </div>
                )}

            {/* Detail Modal Overlays */}
            <ModernModal
                isOpen={!!selectedDetail}
                onClose={() => setSelectedDetail(null)}
                title="Altering Details"
            >
                {selectedDetail && (
                    <div className="space-y-6 relative z-10 p-2">
                        {/* Header */}
                        <div className="flex items-center gap-3 border-b border-black/5 dark:border-[#30363d] pb-4">
                            <div className="w-10 h-10 rounded bg-black/5 dark:bg-[#161b22] border border-black/5 dark:border-[#30363d] flex items-center justify-center">
                                <User className="w-5 h-5 text-gray-400 dark:text-[#8b949e]" />
                            </div>
                            <div>
                                <h3 className="text-lg font-serif text-gray-900 dark:text-[#c9d1d9] tracking-tight leading-none mb-1.5">
                                    {selectedDetail.customer_name}
                                </h3>
                                <div className="flex flex-wrap gap-2 text-[10px]">
                                    {(() => {
                                        const status = statusConfig[selectedDetail.status] || statusConfig.pending;
                                        return (
                                            <div className={`inline-flex items-center gap-1 px-1.5 py-0.5 text-[9px] font-black uppercase tracking-widest ${status.bgColor} ${status.textColor} border ${status.borderColor} rounded`}>
                                                <status.icon className="w-2.5 h-2.5" />
                                                {status.label}
                                            </div>
                                        );
                                    })()}
                                    {selectedDetail.order_no && (
                                        <div className="inline-flex items-center px-1.5 py-0.5 text-[9px] font-mono uppercase tracking-widest bg-black/5 dark:bg-[#161b22] border border-black/5 dark:border-[#30363d] text-gray-500 dark:text-[#8b949e] rounded">
                                            #{selectedDetail.order_no}
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>

                        {/* Information Matrix */}
                        <div className="grid gap-2">
                            <div className="flex gap-3 items-start p-3 bg-black/[0.02] dark:bg-[#0d1117] border border-black/5 dark:border-[#30363d] rounded">
                                <Smartphone size={14} className="text-gray-400 dark:text-[#8b949e] mt-0.5 shrink-0" />
                                <div>
                                    <p className="text-[9px] uppercase font-black tracking-widest text-gray-400 dark:text-[#8b949e] mb-0.5">Phone</p>
                                    <p className="text-xs font-mono text-gray-600 dark:text-[#c9d1d9]">
                                        {selectedDetail.mobile || 'Unknown'}
                                    </p>
                                </div>
                            </div>
                            <div className="flex gap-3 items-start p-3 bg-black/[0.02] dark:bg-[#0d1117] border border-black/5 dark:border-[#30363d] rounded">
                                <Package size={14} className="text-gray-400 dark:text-[#8b949e] mt-0.5 shrink-0" />
                                <div>
                                    <p className="text-[9px] uppercase font-black tracking-widest text-gray-400 dark:text-[#8b949e] mb-0.5">Product</p>
                                    <p className="text-xs text-gray-600 dark:text-[#c9d1d9] font-serif italic">
                                        {selectedDetail.product || 'Unspecified Detail'}
                                    </p>
                                </div>
                            </div>
                            {selectedDetail.remark && (
                                <div className="flex gap-3 items-start p-3 bg-black/[0.02] dark:bg-[#0d1117] border border-black/5 dark:border-[#30363d] rounded">
                                    <Mail size={14} className="text-gray-400 dark:text-[#8b949e] mt-0.5 shrink-0" />
                                    <div>
                                        <p className="text-[9px] uppercase font-black tracking-widest text-gray-400 dark:text-[#8b949e] mb-0.5">Notes</p>
                                        <p className="text-xs text-gray-600 dark:text-[#c9d1d9] leading-relaxed">
                                            {selectedDetail.remark}
                                        </p>
                                    </div>
                                </div>
                            )}
                            <div className="grid grid-cols-2 gap-2 mt-1">
                                <div className="p-3 bg-black/[0.02] dark:bg-[#0d1117] border border-black/5 dark:border-[#30363d] rounded">
                                    <p className="text-[9px] uppercase font-black tracking-widest text-gray-400 dark:text-[#8b949e] mb-1">Ready Date</p>
                                    <p className="text-sm font-mono text-gray-600 dark:text-[#c9d1d9]">
                                        {formatDate(selectedDetail.ready_at, { fallback: 'N/A', month: 'short' })}
                                    </p>
                                </div>
                                <div className="p-3 bg-black/[0.02] dark:bg-[#0d1117] border border-black/5 dark:border-[#30363d] rounded">
                                    <p className="text-[9px] uppercase font-black tracking-widest text-gray-400 dark:text-[#8b949e] mb-1">Cost</p>
                                    <p className="text-sm font-mono text-[#0d3542] dark:text-[#58a6ff]">
                                        ${selectedDetail.altering_cost || '0.00'}
                                    </p>
                                </div>
                            </div>
                        </div>

                        {/* Actions */}
                        <div className="flex flex-col gap-2 pt-2 border-t border-black/5 dark:border-[#30363d]">
                            <div className="flex gap-2">
                                {selectedDetail.status !== 'completed' && (
                                    <button
                                        onClick={() => {
                                            updateMutation.mutate({ id: selectedDetail.id, data: { status: 'completed' } });
                                            setSelectedDetail(null);
                                        }}
                                        className="flex-1 bg-green-50 dark:bg-[#238636]/20 border border-green-200 dark:border-[#2ea043]/30 text-green-700 dark:text-green-400 hover:bg-green-100 dark:hover:bg-[#2ea043]/40 transition-colors py-2.5 rounded text-[10px] font-black uppercase tracking-[0.1em] flex justify-center items-center gap-1.5"
                                    >
                                        <CheckCircle2 size={12} /> Mark Complete
                                    </button>
                                )}
                                <button
                                    onClick={() => handleNotify(selectedDetail.id)}
                                    disabled={isNotifying === selectedDetail.id}
                                    className="flex-1 bg-white dark:bg-[#161b22] border border-black/5 dark:border-[#30363d] text-gray-600 dark:text-[#c9d1d9] hover:bg-black/5 dark:hover:bg-[#30363d] transition-colors py-2.5 rounded text-[10px] font-black uppercase tracking-[0.1em] flex justify-center items-center gap-1.5"
                                >
                                    {isNotifying === selectedDetail.id ? (
                                        <LumaSpin className="animate-spin" size="xs" />
                                    ) : (
                                        <Mail size={12} />
                                    )} Notify Client
                                </button>
                            </div>
                            <div className="flex justify-between items-center px-1">
                                <button
                                    onClick={() => {
                                        if (confirm('Delete this record?')) {
                                            deleteMutation.mutate(selectedDetail.id);
                                            setSelectedDetail(null);
                                        }
                                    }}
                                    className="text-red-500/70 hover:text-red-500 hover:bg-red-50 py-1.5 px-3 rounded text-[10px] font-medium transition-colors border border-transparent hover:border-red-100 dark:hover:bg-red-500/10 dark:hover:border-red-500/20"
                                >
                                    Delete Record
                                </button>
                                <span className="text-[9px] uppercase tracking-widest font-black text-gray-400 dark:text-[#8b949e]">
                                    {selectedDetail.notified_at
                                        ? `Last notified: ${formatDate(selectedDetail.notified_at, { fallback: 'N/A', month: 'short' })}`
                                        : 'Not notified yet'}
                                </span>
                            </div>
                        </div>
                    </div>
                )}
            </ModernModal>

            {/* Add Modal Wizard */}
            <ModernModal
                isOpen={isAdding}
                onClose={() => setIsAdding(false)}
                title="Add Altering Record"
            >
                <div className="relative z-10 px-2 flex flex-col h-full pb-2">
                    {/* Progress Indicators */}
                    <div className="flex items-center gap-1 mb-6">
                        {[1, 2, 3].map((step) => (
                            <div
                                key={step}
                                className={`h-1 rounded-full transition-all duration-300 ${wizardStep >= step ? 'w-8 bg-[#58a6ff]' : 'w-4 bg-[#30363d]'}`}
                            />
                        ))}
                    </div>

                    <div className="flex-1 min-h-[200px]">
                        <AnimatePresence mode="wait">
                            {wizardStep === 1 && (
                                <motion.div key="step1" initial={{ opacity: 0, x: 10 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -10 }} className="space-y-4">
                                    <div className="space-y-1.5">
                                        <label className="text-[9px] font-black text-[#8b949e] uppercase tracking-widest">Customer Name</label>
                                        <input
                                            required autoFocus value={formData.customer_name} onChange={(e) => setFormData({ ...formData, customer_name: e.target.value })}
                                            placeholder="Full Name"
                                            className="w-full bg-[#0d1117] border border-[#30363d] rounded py-2 px-3 text-[#c9d1d9] text-xs outline-none focus:border-[#58a6ff]/50 transition-all font-mono"
                                        />
                                    </div>
                                    <div className="space-y-1.5">
                                        <label className="text-[9px] font-black text-[#8b949e] uppercase tracking-widest">Phone Number</label>
                                        <input
                                            value={formData.mobile} onChange={(e) => setFormData({ ...formData, mobile: e.target.value })}
                                            placeholder="+1 (555) 000-0000"
                                            className="w-full bg-[#0d1117] border border-[#30363d] rounded py-2 px-3 text-[#c9d1d9] text-xs outline-none focus:border-[#58a6ff]/50 transition-all font-mono"
                                        />
                                    </div>
                                    <div className="space-y-1.5">
                                        <label className="text-[9px] font-black text-[#8b949e] uppercase tracking-widest">Order Number</label>
                                        <input
                                            value={formData.order_no} onChange={(e) => setFormData({ ...formData, order_no: e.target.value })}
                                            placeholder="#ORD-..."
                                            className="w-full bg-[#0d1117] border border-[#30363d] rounded py-2 px-3 text-[#c9d1d9] text-xs outline-none focus:border-[#58a6ff]/50 transition-all font-mono"
                                        />
                                    </div>
                                </motion.div>
                            )}
                            {wizardStep === 2 && (
                                <motion.div key="step2" initial={{ opacity: 0, x: 10 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -10 }} className="space-y-4">
                                    <div className="space-y-1.5">
                                        <label className="text-[9px] font-black text-[#8b949e] uppercase tracking-widest">Product Details</label>
                                        <textarea
                                            required autoFocus rows="3" value={formData.product} onChange={(e) => setFormData({ ...formData, product: e.target.value })}
                                            placeholder="Specify the exact alterations required..."
                                            className="w-full bg-[#0d1117] border border-[#30363d] rounded py-2 px-3 text-[#c9d1d9] text-xs outline-none focus:border-[#58a6ff]/50 transition-all font-mono resize-none"
                                        />
                                    </div>
                                    <div className="space-y-1.5">
                                        <label className="text-[9px] font-black text-[#8b949e] uppercase tracking-widest">Notes (Optional)</label>
                                        <textarea
                                            rows="3" value={formData.remark} onChange={(e) => setFormData({ ...formData, remark: e.target.value })}
                                            placeholder="Internal tailor notes, structural warnings..."
                                            className="w-full bg-[#0d1117] border border-[#30363d] rounded py-2 px-3 text-[#8b949e] text-xs outline-none focus:border-[#58a6ff]/50 transition-all font-mono resize-none"
                                        />
                                    </div>
                                </motion.div>
                            )}
                            {wizardStep === 3 && (
                                <motion.div key="step3" initial={{ opacity: 0, x: 10 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -10 }} className="space-y-4">
                                    <div className="space-y-1.5">
                                        <label className="text-[9px] font-black text-[#8b949e] uppercase tracking-widest">Cost ($)</label>
                                        <div className="relative">
                                            <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 text-[#8b949e]" size={14} />
                                            <input
                                                required type="number" step="0.01" value={formData.altering_cost} onChange={(e) => setFormData({ ...formData, altering_cost: e.target.value })}
                                                placeholder="0.00"
                                                className="w-full bg-[#0d1117] border border-[#30363d] rounded py-2 pl-8 pr-3 text-[#58a6ff] text-sm outline-none focus:border-[#58a6ff]/50 transition-all font-mono"
                                            />
                                        </div>
                                    </div>
                                    <div className="grid grid-cols-2 gap-3">
                                        <div className="space-y-1.5">
                                            <label className="text-[9px] font-black text-[#8b949e] uppercase tracking-widest">Start Date</label>
                                            <DatePicker required value={formData.start_date} onChange={(e) => setFormData({ ...formData, start_date: e.target.value })} name="start_date" />
                                        </div>
                                        <div className="space-y-1.5">
                                            <label className="text-[9px] font-black text-[#8b949e] uppercase tracking-widest">Target Ready</label>
                                            <DatePicker required value={formData.ready_at} onChange={(e) => setFormData({ ...formData, ready_at: e.target.value })} name="ready_at" />
                                        </div>
                                    </div>
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </div>

                    {/* Controls */}
                    <div className="mt-6 pt-4 border-t border-[#30363d] flex items-center justify-between relative z-10">
                        <button
                            type="button"
                            onClick={() => wizardStep > 1 ? setWizardStep(w => w - 1) : setIsAdding(false)}
                            className="text-[9px] font-black uppercase tracking-widest text-[#8b949e] hover:text-[#c9d1d9] transition-colors px-2 py-1.5 rounded hover:bg-[#30363d]/50"
                        >
                            {wizardStep === 1 ? 'Cancel' : 'Back'}
                        </button>

                        {wizardStep < 3 ? (
                            <button
                                type="button"
                                onClick={() => {
                                    if (wizardStep === 1 && !formData.customer_name) return alert('Client name is required.');
                                    if (wizardStep === 2 && !formData.product) return alert('Garment scope is required.');
                                    setWizardStep(w => w + 1);
                                }}
                                className="px-5 py-2 bg-[#238636] text-white hover:bg-[#2ea043] transition-colors rounded text-[9px] font-black uppercase tracking-[0.1em]"
                            >
                                Continue
                            </button>
                        ) : (
                            <Button
                                onClick={() => {
                                    if (!formData.altering_cost || !formData.ready_at) return alert('Quote and Target Date are required.');
                                    createMutation.mutate(formData);
                                }}
                                disabled={createMutation.isPending}
                                className="px-5 py-2 h-auto bg-[#58a6ff] text-[#0d1117] hover:bg-[#79b8ff] transition-colors rounded text-[9px] font-black uppercase tracking-[0.1em]"
                            >
                                {createMutation.isPending ? (
                                    <LumaSpin className="animate-spin" size="xs" />
                                ) : (
                                    <CheckCircle2 className="mr-1.5 w-3 h-3" />
                                )}
                                Save
                            </Button>
                        )}
                    </div>
                </div>
            </ModernModal>

            {/* Sync Sheet Modal */}
            <ModernModal
                isOpen={showSyncModal}
                onClose={() => setShowSyncModal(false)}
                title="Master Sheet Sync"
            >
                <div className="space-y-4 px-2 pb-2">
                    <div className="flex flex-col items-center justify-center p-6 border border-[#30363d] rounded bg-[#0d1117] mb-2">
                        <div className="w-12 h-12 bg-[#161b22] border border-[#30363d] rounded flex items-center justify-center mb-4">
                            <RefreshCw size={20} className={`text-[#8b949e] ${isSyncing ? 'animate-spin' : ''}`} />
                        </div>
                        <p className="text-[#c9d1d9] text-[10px] font-mono tracking-widest uppercase">
                            Google Sheets Bridge
                        </p>
                    </div>

                    <div className="space-y-3">
                        <div className="space-y-1.5">
                            <label className="text-[9px] font-black text-[#8b949e] uppercase tracking-widest">
                                Sheet URL
                            </label>
                            <div className="relative group">
                                <ExternalLink size={12} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-[#8b949e] group-focus-within:text-[#58a6ff] transition-colors" />
                                <input
                                    type="text"
                                    placeholder="https://docs.google.com/spreadsheets/d/..."
                                    value={syncUrl}
                                    onChange={(e) => setSyncUrl(e.target.value)}
                                    className="w-full bg-[#0d1117] border border-[#30363d] rounded py-2 pl-7 pr-3 text-[#c9d1d9] text-xs outline-none focus:border-[#58a6ff]/50 transition-all font-mono"
                                />
                            </div>
                        </div>

                        <div className="bg-[#161b22] border border-[#30363d] rounded p-3 flex items-start gap-2.5">
                            <AlertCircle size={12} className="text-[#8b949e] mt-0.5" />
                            <p className="text-[10px] text-[#8b949e] leading-snug">
                                Make sure the sheet is shared with <span className="text-[#c9d1d9] font-bold">"Anyone with the link"</span>.
                            </p>
                        </div>

                        <Button
                            onClick={handleSync}
                            disabled={isSyncing || !syncUrl}
                            className="w-full py-2.5 h-auto bg-[#58a6ff] text-[#0d1117] hover:bg-[#79b8ff] transition-all rounded text-[10px] font-black uppercase tracking-[0.1em] flex justify-center items-center"
                        >
                            {isSyncing ? (
                                'Syncing Data...'
                            ) : (
                                <>
                                    <RefreshCw size={12} className="mr-1.5" /> Start Sync
                                </>
                            )}
                        </Button>
                    </div>
                </div>
            </ModernModal>
        </div>
    );
}
