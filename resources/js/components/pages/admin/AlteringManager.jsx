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
    ExternalLink
} from 'lucide-react';
import { LumaSpin } from '@/components/ui/luma-spin';
import { Card, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { BorderBeam } from '@/components/ui/border-beam';
import ModernModal from '../../common/ModernModal.jsx';
import { formatDate } from '@/helpers/format';

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
        <motion.div
            variants={shouldAnimate ? rowVariants : {}}
            className={`px-5 py-4 border-b border-black/5 dark:border-white/5 hover:bg-black/[0.02] dark:hover:bg-white/[0.02] transition-colors group cursor-pointer ${
                isSelected ? 'bg-attire-accent/5 dark:bg-attire-accent/5' : ''
            }`}
            style={{
                display: 'grid',
                gridTemplateColumns: '40px 200px 160px 140px 120px 160px 1fr 60px',
                columnGap: '10px',
                alignItems: 'center',
            }}
            onClick={() => onDetailOpen(altering)}
        >
            <div 
                className="flex items-center justify-center border-r border-black/5 dark:border-white/5 pr-3 h-full"
                onClick={(e) => e.stopPropagation()}
            >
                <input
                    type="checkbox"
                    className="w-3.5 h-3.5 rounded border-black/20 dark:border-white/20 bg-transparent accent-attire-accent cursor-pointer"
                    checked={isSelected}
                    onChange={() => onSelect(altering.id)}
                />
            </div>

            <div className="flex items-center gap-4 border-r border-black/5 dark:border-white/5 px-4 h-full overflow-hidden">
                <div className="w-10 h-10 rounded-xl bg-[#0d3542]/10 border border-[#0d3542]/20 flex items-center justify-center shrink-0">
                    <span className="text-sm font-black text-[#0d3542]">
                        {altering.customer_name?.charAt(0) || 'U'}
                    </span>
                </div>
                <span className="text-[16px] font-serif text-attire-charcoal dark:text-white truncate">
                    {altering.customer_name}
                </span>
            </div>

            <div className="flex flex-col gap-1.5 border-r border-black/5 dark:border-white/5 px-4 h-full justify-center overflow-hidden">
                <div className="flex items-center gap-1.5 opacity-40">
                    <div className="w-1.5 h-1.5 rounded-full bg-current" />
                    <span className="text-[13px] font-mono tracking-tighter uppercase truncate">
                        #{altering.order_no || 'MANUAL'}
                    </span>
                </div>
                <div className="text-[12.5px] font-medium text-gray-500 dark:text-white/40 flex items-center gap-2">
                    <Smartphone size={10} />
                    {altering.mobile || 'N/A'}
                </div>
            </div>

            <div className="px-4 border-r border-black/5 dark:border-white/5 h-full flex items-center">
                <div className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[12px] font-black uppercase tracking-widest border ${status.bgColor} ${status.textColor} ${status.borderColor} w-fit`}>
                    <status.icon className="w-3.5 h-3.5" />
                    {status.label}
                </div>
            </div>

            <div className="px-4 border-r border-black/5 dark:border-white/5 h-full flex items-center">
                <span className="text-[15px] font-mono font-bold text-attire-accent">
                    ${altering.altering_cost || '0.00'}
                </span>
            </div>

            <div className="px-3 border-r border-black/5 dark:border-white/5 h-full flex items-center overflow-hidden">
                <span className="text-xs font-medium text-gray-500 dark:text-white/60 line-clamp-1 italic">
                    {altering.product || 'Unspecified Product'}
                </span>
            </div>

            <div className="px-4 border-r border-black/5 dark:border-white/5 h-full flex items-center">
                <div className="flex flex-col">
                    <span className="text-[14px] font-mono text-attire-charcoal dark:text-white">
                        {formatDate(altering.ready_at, { fallback: 'N/A', month: 'short' })}
                    </span>
                    <span className="text-[11.5px] uppercase tracking-tighter text-gray-400 font-bold">
                        {altering.ready_at ? 'Target Ready' : 'Date TBD'}
                    </span>
                </div>
            </div>

            <div 
                className="flex items-center justify-center px-3 h-full"
                onClick={(e) => e.stopPropagation()}
            >
                <div className="p-2 opacity-0 group-hover:opacity-100 dark:group-hover:bg-white/5 rounded-lg transition-all hover:text-attire-accent">
                    <MoreVertical size={14} />
                </div>
            </div>
        </motion.div>
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
        <div className="min-w-[1100px]">
            {/* Table Header */}
            <div
                className="px-5 py-5 text-[12.5px] font-black uppercase tracking-[0.2em] text-gray-400 dark:text-[#8b949e] bg-black/[0.01] dark:bg-[#161b22] border-b border-black/5 dark:border-[#30363d] text-left"
                style={{
                    display: 'grid',
                    gridTemplateColumns: '40px 200px 160px 140px 120px 160px 1fr 60px',
                    columnGap: '10px',
                }}
            >
                <div className="flex items-center justify-center border-r border-black/5 dark:border-white/5 pr-3">
                    <input
                        type="checkbox"
                        className="w-3.5 h-3.5 rounded border-black/20 dark:border-white/20 bg-transparent accent-attire-accent cursor-pointer"
                        checked={alterings.length > 0 && selectedItems.length === alterings.length}
                        onChange={onSelectAll}
                    />
                </div>
                <div className="flex items-center gap-1.5 border-r border-black/5 dark:border-white/5 px-3">
                    <User size={12} className="opacity-50" />
                    Customer Name
                </div>
                <div className="flex items-center gap-1.5 border-r border-black/5 dark:border-white/5 px-3">
                    <Smartphone size={12} className="opacity-50" />
                    Ref & Mobile
                </div>
                <div className="flex items-center gap-1.5 border-r border-black/5 dark:border-white/5 px-4">
                    <Clock size={14} className="opacity-50" />
                    Status
                </div>
                <div className="flex items-center gap-1.5 border-r border-black/5 dark:border-white/5 px-3">
                    <DollarSign size={12} className="opacity-50" />
                    Cost
                </div>
                <div className="flex items-center gap-1.5 border-r border-black/5 dark:border-white/5 px-3">
                    <Package size={12} className="opacity-50" />
                    Product Item
                </div>
                <div className="flex items-center gap-1.5 border-r border-black/5 dark:border-white/5 px-3">
                    <Clock size={12} className="opacity-50" />
                    Est. Ready Date
                </div>
                <div className="flex items-center justify-center px-3">
                    <MoreVertical size={12} className="opacity-50" />
                </div>
            </div>

            {/* Table Body */}
            <AnimatePresence mode="popLayout" initial={false}>
                {alterings.length === 0 ? (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="py-20 text-center"
                    >
                        <div className="inline-flex p-4 rounded-full bg-black/5 dark:bg-white/5 mb-4">
                            <AlertCircle className="w-6 h-6 text-gray-400" />
                        </div>
                        <p className="text-sm text-gray-500 dark:text-white/40 font-mono tracking-widest uppercase">
                            No records found matching your filters
                        </p>
                    </motion.div>
                ) : (
                    <motion.div
                        variants={{
                            visible: { transition: { staggerChildren: 0.04 } }
                        }}
                        initial="hidden"
                        animate="visible"
                    >
                        {alterings.map((altering) => (
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
                        ))}
                    </motion.div>
                )}
            </AnimatePresence>
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
        <div className="w-full font-sans pb-20">
            {/* Header & Controls */}
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-10">
                <div>
                    <h1 className="text-4xl font-serif text-attire-charcoal dark:text-white tracking-tight flex items-center gap-4">
                        <div className="p-3 bg-attire-accent/10 rounded-2xl border border-attire-accent/20">
                            <Scissors className="w-8 h-8 text-attire-accent" />
                        </div>
                        Altering Manager
                    </h1>
                    <div className="flex items-center gap-3 mt-4">
                        <span className="w-8 h-px bg-attire-accent/40" />
                        <p className="text-gray-400 dark:text-white/40 text-xs font-black uppercase tracking-[0.4em]">
                            Tailor Queue Management
                        </p>
                    </div>
                </div>

                <div className="flex items-center gap-3 flex-wrap">
                    <div className="relative group">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 dark:text-white/40 group-focus-within:text-attire-accent transition-colors" />
                        <input
                            type="text"
                            placeholder="Search records..."
                            value={searchQuery}
                            onChange={(e) => {
                                setSearchQuery(e.target.value);
                                setPage(1);
                            }}
                            className="bg-black/5 dark:bg-white/5 border border-black/10 dark:border-white/10 rounded-xl py-3.5 pl-10 pr-10 text-attire-charcoal dark:text-white outline-none focus:border-attire-accent/50 transition-all placeholder:text-gray-400 dark:placeholder:text-white/20 w-48 lg:w-64 font-mono tracking-widest text-[14.5px]"
                        />
                        {searchQuery && (
                            <button
                                onClick={() => {
                                    setSearchQuery('');
                                    setPage(1);
                                }}
                                className="absolute right-3 top-1/2 -translate-y-1/2 p-1 hover:bg-black/10 dark:hover:bg-white/10 rounded-full text-gray-400 hover:text-attire-accent transition-all"
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
                            className="text-xs font-black underline uppercase tracking-widest text-attire-accent hover:text-[#ffb940] transition-colors p-2"
                        >
                            Reset
                        </button>
                    )}

                    <div className="relative">
                        <button
                            onClick={() => setShowFilterMenu(!showFilterMenu)}
                            className={`px-4 py-2.5 bg-black/5 dark:bg-white/5 border border-black/10 dark:border-white/10 text-attire-charcoal dark:text-white hover:bg-black/10 dark:hover:bg-white/10 transition-colors flex items-center gap-2 rounded-xl font-mono tracking-widest text-xs ${statusFilter ? 'ring-1 ring-attire-accent/50' : ''}`}
                        >
                            <svg
                                width="14"
                                height="14"
                                viewBox="0 0 16 16"
                                fill="none"
                            >
                                <path
                                    d="M2 3H14M4 8H12M6 13H10"
                                    stroke="currentColor"
                                    strokeWidth="1.5"
                                    strokeLinecap="round"
                                />
                            </svg>
                            Filter
                            {statusFilter && (
                                <span className="ml-1 text-xs bg-attire-accent text-black font-black rounded px-1.5 py-0.5">
                                    1
                                </span>
                            )}
                        </button>
                        {showFilterMenu && (
                            <>
                                <div
                                    className="fixed inset-0 z-10"
                                    onClick={() => setShowFilterMenu(false)}
                                />
                                <div className="absolute right-0 mt-2 w-48 bg-white dark:bg-[#161b22] border border-black/10 dark:border-[#30363d] rounded-xl z-20 overflow-hidden py-2">
                                    <button
                                        onClick={() => {
                                            setStatusFilter('');
                                            setShowFilterMenu(false);
                                            setPage(1);
                                        }}
                                        className={`w-full px-4 py-2.5 text-left text-sm text-gray-700 dark:text-[#c9d1d9] hover:bg-black/5 dark:hover:bg-white/5 transition-colors ${!statusFilter ? 'bg-black/5 dark:bg-white/5' : ''}`}
                                    >
                                        All Records
                                    </button>
                                    <div className="h-px bg-white/10 my-1" />
                                    {[
                                        'Pending',
                                        'In Progress',
                                        'Ready',
                                        'Completed',
                                    ].map((status) => (
                                        <button
                                            key={status}
                                            onClick={() => {
                                                setStatusFilter(status);
                                                setShowFilterMenu(false);
                                                setPage(1);
                                            }}
                                            className={`w-full px-4 py-2.5 text-left text-sm text-white/80 hover:bg-white/5 transition-colors ${statusFilter === status ? 'bg-white/5' : ''}`}
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
                            className="px-4 py-2.5 bg-black/5 dark:bg-white/5 border border-black/10 dark:border-white/10 text-attire-charcoal dark:text-white hover:bg-black/10 dark:hover:bg-white/10 transition-colors flex items-center gap-2 rounded-xl font-mono tracking-widest text-xs"
                        >
                            <svg
                                width="14"
                                height="14"
                                viewBox="0 0 16 16"
                                fill="none"
                            >
                                <path
                                    d="M3 6L6 3L9 6M6 3V13M13 10L10 13L7 10M10 13V3"
                                    stroke="currentColor"
                                    strokeWidth="1.5"
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                />
                            </svg>
                            Sort
                            <ChevronDown size={14} className="opacity-50" />
                        </button>
                        {showSortMenu && (
                            <>
                                <div
                                    className="fixed inset-0 z-10"
                                    onClick={() => setShowSortMenu(false)}
                                />
                                <div className="absolute right-0 mt-2 w-48 bg-white dark:bg-[#161b22] border border-black/10 dark:border-[#30363d] rounded-xl z-20 py-2">
                                    <button
                                        onClick={() =>
                                            handleSort('customer_name')
                                        }
                                        className={`w-full px-4 py-2 text-left text-sm hover:bg-white/5 text-white/80 ${sortField === 'customer_name' ? 'bg-white/5' : ''}`}
                                    >
                                        Name{' '}
                                        {sortField === 'customer_name' &&
                                            (sortOrder === 'asc'
                                                ? 'A-Z'
                                                : 'Z-A')}
                                    </button>
                                    <button
                                        onClick={() =>
                                            handleSort('altering_cost')
                                        }
                                        className={`w-full px-4 py-2 text-left text-sm hover:bg-white/5 text-white/80 ${sortField === 'altering_cost' ? 'bg-white/5' : ''}`}
                                    >
                                        Cost{' '}
                                        {sortField === 'altering_cost' &&
                                            (sortOrder === 'asc'
                                                ? 'Low-High'
                                                : 'High-Low')}
                                    </button>
                                    <button
                                        onClick={() => handleSort('ready_at')}
                                        className={`w-full px-4 py-2 text-left text-sm hover:bg-white/5 text-white/80 ${sortField === 'ready_at' ? 'bg-white/5' : ''}`}
                                    >
                                        Ready Date{' '}
                                        {sortField === 'ready_at' &&
                                            (sortOrder === 'asc'
                                                ? 'Old-New'
                                                : 'New-Old')}
                                    </button>
                                </div>
                            </>
                        )}
                    </div>

                    <div className="relative">
                        <button
                            onClick={() => setShowExportMenu(!showExportMenu)}
                            className="px-4 py-2.5 bg-black/5 dark:bg-white/5 border border-black/10 dark:border-white/10 text-attire-charcoal dark:text-white hover:bg-black/10 dark:hover:bg-white/10 transition-colors flex items-center gap-2 rounded-xl text-sm font-mono tracking-widest text-[11px]"
                        >
                            <Download size={14} /> Export{' '}
                            <ChevronDown size={14} className="opacity-50" />
                        </button>
                        {showExportMenu && (
                            <>
                                <div
                                    className="fixed inset-0 z-10"
                                    onClick={() => setShowExportMenu(false)}
                                />
                                <div className="absolute right-0 mt-2 w-32 bg-white dark:bg-[#161b22] border border-black/10 dark:border-[#30363d] rounded-xl z-20 py-2">
                                    <button
                                        onClick={() => {
                                            exportToCSV();
                                            setShowExportMenu(false);
                                        }}
                                        className="w-full px-4 py-2 text-left text-sm hover:bg-white/5 text-white/80"
                                    >
                                        CSV
                                    </button>
                                    <button
                                        onClick={() => {
                                            exportToJSON();
                                            setShowExportMenu(false);
                                        }}
                                        className="w-full px-4 py-2 text-left text-sm hover:bg-white/5 text-white/80 border-t border-white/10 m-0 rounded-none"
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
                                className="bg-black/5 dark:bg-white/5 hover:bg-black/10 dark:hover:bg-white/10 text-gray-500 transition-all px-4 py-2.5 rounded-xl font-bold uppercase tracking-widest text-[9px] border border-black/10 dark:border-white/10 flex items-center gap-2"
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
                                className="bg-red-500/10 hover:bg-red-500/20 text-red-500 transition-all px-4 py-2.5 rounded-xl font-bold uppercase tracking-widest text-[9px] border border-red-500/20 flex items-center gap-2 disabled:opacity-50"
                            >
                                {bulkDeleteMutation.isPending ? (
                                    <LumaSpin className="animate-spin" size="sm" />
                                ) : (
                                    <svg width="12" height="12" viewBox="0 0 16 16" fill="none">
                                        <path d="M3 4H13M5 4V3C5 2.44772 5.44772 2 6 2H10C10.5523 2 11 2.44772 11 3V4M6.5 7V11M9.5 7V11M4 4V13C4 13.5523 4.44772 14 5 14H11C11.5523 14 12 13.5523 12 13V4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                                    </svg>
                                )}
                                Delete Selected
                            </button>
                        </div>
                    )}

                    <Button
                        onClick={() => setShowSyncModal(true)}
                        className="bg-black/5 dark:bg-white/5 text-attire-charcoal dark:text-white hover:bg-attire-accent dark:hover:bg-attire-accent transition-colors px-6 py-5 rounded-xl font-bold uppercase tracking-[0.2em] text-[10px] ml-1 border border-black/10 dark:border-white/10"
                    >
                        <RefreshCw className={`w-3.5 h-3.5 mr-2 ${isSyncing ? 'animate-spin' : ''}`} />
                        Sync Sheet
                    </Button>

                    <Button
                        onClick={() => setIsAdding(true)}
                        className="bg-attire-charcoal dark:bg-white text-white dark:text-black hover:bg-attire-accent transition-colors px-6 py-5 rounded-xl font-bold uppercase tracking-[0.2em] text-[10px] ml-1"
                    >
                        <Plus className="w-3 h-3 mr-2" /> Add Record
                    </Button>
                </div>
            </div>

            {/* Table Area - Optimized for performance */}
            <div className="bg-[#fdfdfc] dark:bg-[#0d1117] border border-black/10 dark:border-[#30363d] rounded-3xl overflow-hidden relative shadow-none">
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

                {/* Pagination Details */}
                {!isLoading && pagination.total > 0 && (
                    <div className="flex items-center justify-between p-5 border-t border-black/5 dark:border-[#30363d] bg-black/[0.01] dark:bg-[#161b22]">
                        <div className="text-[10px] uppercase font-black tracking-widest text-gray-400 dark:text-[#8b949e]">
                            Page {pagination.currentPage} of{' '}
                            {pagination.lastPage}{' '}
                            <span className="mx-2 opacity-30">•</span>{' '}
                            {pagination.total} records
                        </div>
                        <div className="flex gap-2">
                            <button
                                onClick={() =>
                                    setPage((p) => Math.max(1, p - 1))
                                }
                                disabled={page === 1}
                                className="px-4 py-2 bg-black/5 dark:bg-white/5 border border-black/10 dark:border-white/10 text-attire-charcoal dark:text-white text-[10px] font-black uppercase tracking-[0.2em] hover:bg-black/10 dark:hover:bg-white/10 disabled:opacity-30 transition-colors rounded-xl"
                            >
                                Previous
                            </button>
                            <button
                                onClick={() =>
                                    setPage((p) =>
                                        Math.min(pagination.lastPage, p + 1)
                                    )
                                }
                                disabled={page === pagination.lastPage}
                                className="px-4 py-2 bg-black/5 dark:bg-white/5 border border-black/10 dark:border-white/10 text-attire-charcoal dark:text-white text-[10px] font-black uppercase tracking-[0.2em] hover:bg-black/10 dark:hover:bg-white/10 disabled:opacity-30 transition-colors rounded-xl"
                            >
                                Next
                            </button>
                        </div>
                    </div>
                )}

            {/* Detail Modal Overlays */}
            <ModernModal
                isOpen={!!selectedDetail}
                onClose={() => setSelectedDetail(null)}
                title="Altering Details"
            >
                {selectedDetail && (
                    <div className="space-y-8 relative z-10 px-2 pb-2">
                        {/* Header */}
                        <div className="flex items-center gap-4">
                            <div className="w-16 h-16 rounded-3xl bg-attire-accent/10 border border-attire-accent/20 flex items-center justify-center">
                                <User className="w-8 h-8 text-attire-accent" />
                            </div>
                            <div>
                                <h3 className="text-2xl font-serif text-attire-charcoal dark:text-white tracking-tight leading-none mb-2">
                                    {selectedDetail.customer_name}
                                </h3>
                                <div className="flex flex-wrap gap-2">
                                    {(() => {
                                        const status =
                                            statusConfig[
                                                selectedDetail.status
                                            ] || statusConfig.pending;
                                        return (
                                            <div
                                                className={`inline-flex items-center gap-1.5 px-2 py-0.5 text-[9px] font-black uppercase tracking-widest ${status.bgColor} ${status.textColor} border ${status.borderColor} rounded-md`}
                                            >
                                                <status.icon className="w-3 h-3" />{' '}
                                                {status.label}
                                            </div>
                                        );
                                    })()}
                                    {selectedDetail.order_no && (
                                        <div className="inline-flex items-center px-2 py-0.5 text-[9px] font-mono uppercase tracking-widest bg-black/5 dark:bg-[#161b22] border border-black/10 dark:border-[#30363d] text-gray-500 dark:text-[#8b949e] rounded-md">
                                            #{selectedDetail.order_no}
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>

                        {/* Information Matrix */}
                        <div className="grid gap-4 bg-black/[0.01] dark:bg-[#161b22] border border-black/5 dark:border-[#30363d] p-5 rounded-3xl">
                            <div className="flex gap-4 items-start">
                                <Smartphone
                                    size={16}
                                    className="text-gray-400 dark:text-white/30 mt-0.5 shrink-0"
                                />
                                <div>
                                    <p className="text-[10px] uppercase font-black tracking-widest text-gray-400 dark:text-white/30 mb-0.5">
                                        Phone
                                    </p>
                                    <p className="text-sm font-medium text-gray-900 dark:text-white">
                                        {selectedDetail.mobile ||
                                            'Unknown'}
                                    </p>
                                </div>
                            </div>
                            <div className="flex gap-4 items-start">
                                <Package
                                    size={16}
                                    className="text-gray-400 dark:text-white/30 mt-0.5 shrink-0"
                                />
                                <div>
                                    <p className="text-[10px] uppercase font-black tracking-widest text-gray-400 dark:text-white/30 mb-0.5">
                                        Product
                                    </p>
                                    <p className="text-sm text-gray-700 dark:text-white/80 font-serif italic">
                                        {selectedDetail.product ||
                                            'Unspecified Detail'}
                                    </p>
                                </div>
                            </div>
                            {selectedDetail.remark && (
                                <div className="flex gap-4 items-start">
                                    <Mail
                                        size={16}
                                        className="text-gray-400 dark:text-white/30 mt-0.5 shrink-0"
                                    />
                                    <div>
                                        <p className="text-[10px] uppercase font-black tracking-widest text-gray-400 dark:text-white/30 mb-0.5">
                                            Notes
                                        </p>
                                        <p className="text-sm text-gray-600 dark:text-[#c9d1d9] leading-relaxed bg-black/5 dark:bg-[#0d1117] p-3 rounded-xl border border-black/5 dark:border-[#30363d] mt-1">
                                            {selectedDetail.remark}
                                        </p>
                                    </div>
                                </div>
                            )}
                            <div className="grid grid-cols-2 gap-4 pt-4 border-t border-black/5 dark:border-white/5">
                                <div>
                                    <p className="text-[10px] uppercase font-black tracking-widest text-gray-400 dark:text-white/30 mb-1">
                                        Ready Date
                                    </p>
                                    <p className="text-sm font-mono text-gray-800 dark:text-white/80">
                                        {formatDate(
                                            selectedDetail.ready_at,
                                            { fallback: 'N/A', month: 'short' }
                                        )}
                                    </p>
                                </div>
                                <div>
                                    <p className="text-[10px] uppercase font-black tracking-widest text-gray-400 dark:text-white/30 mb-1">
                                        Cost
                                    </p>
                                    <p className="text-sm font-mono text-attire-accent">
                                        $
                                        {selectedDetail.altering_cost ||
                                            '0.00'}
                                    </p>
                                </div>
                            </div>
                        </div>

                        {/* Actions */}
                        <div className="flex flex-col gap-3 pt-2">
                            <div className="flex gap-3">
                                {selectedDetail.status !==
                                    'completed' && (
                                    <button
                                        onClick={() => {
                                            updateMutation.mutate({
                                                id: selectedDetail.id,
                                                data: {
                                                    status: 'completed',
                                                },
                                            });
                                            setSelectedDetail(null);
                                        }}
                                        className="flex-1 bg-attire-charcoal dark:bg-white text-white dark:text-black hover:bg-attire-accent dark:hover:bg-attire-accent transition-colors py-4 rounded-xl text-[10px] font-black uppercase tracking-[0.2em] flex justify-center items-center gap-2"
                                    >
                                        <CheckCircle2 size={14} /> Mark
                                        Complete
                                    </button>
                                )}
                                <button
                                    onClick={() =>
                                        handleNotify(selectedDetail.id)
                                    }
                                    disabled={
                                        isNotifying ===
                                        selectedDetail.id
                                    }
                                    className="flex-1 bg-attire-accent/10 border border-attire-accent/30 text-attire-accent hover:bg-attire-accent/20 transition-colors py-4 rounded-xl text-[10px] font-black uppercase tracking-[0.2em] flex justify-center items-center gap-2"
                                >
                                    {isNotifying ===
                                    selectedDetail.id ? (
                                        <LumaSpin
                                            className="animate-spin"
                                            size="sm"
                                        />
                                    ) : (
                                        <Mail size={14} />
                                    )}{' '}
                                    Notify Client
                                </button>
                            </div>
                            <button
                                onClick={() => {
                                    if (
                                        confirm('Delete this record?')
                                    ) {
                                        deleteMutation.mutate(
                                            selectedDetail.id
                                        );
                                    }
                                }}
                                className="text-red-500/50 hover:text-red-500 hover:bg-red-500/10 py-3 rounded-xl text-xs font-medium transition-colors"
                            >
                                Delete Record
                            </button>
                            <div className="text-center pt-2">
                                <span className="text-[9px] uppercase tracking-widest font-black text-gray-400 dark:text-white/20">
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
                <div className="relative z-10 px-2">
                    {/* Progress Indicators */}
                    <div className="flex items-center gap-2 mb-8">
                        {[1, 2, 3].map((step) => (
                            <div
                                key={step}
                                className={`h-1.5 rounded-full transition-all duration-300 ${wizardStep >= step ? 'w-8 bg-attire-accent' : 'w-4 bg-black/10 dark:bg-white/10'}`}
                            />
                        ))}
                    </div>

                    <div className="min-h-[300px]">
                        <AnimatePresence mode="wait">
                            {wizardStep === 1 && (
                                <motion.div
                                    key="step1"
                                    initial={{ opacity: 0, x: 20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    exit={{ opacity: 0, x: -20 }}
                                    className="space-y-6"
                                >
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black text-gray-400 dark:text-white/40 uppercase tracking-widest pl-1">
                                            Customer Name
                                        </label>
                                        <input
                                            required
                                            autoFocus
                                            value={
                                                formData.customer_name
                                            }
                                            onChange={(e) =>
                                                setFormData({
                                                    ...formData,
                                                    customer_name:
                                                        e.target
                                                            .value,
                                                })
                                            }
                                            placeholder="Full Name"
                                            className="w-full bg-[#fdfdfc] dark:bg-[#161b22] border border-black/10 dark:border-[#30363d] hover:border-black/20 dark:hover:border-white/20 rounded-2xl p-4 text-gray-900 dark:text-[#c9d1d9] text-sm outline-none focus:border-[#0d3542]/50 dark:focus:border-[#58a6ff]/50 focus:bg-[#fdfdfc] dark:focus:bg-[#0d1117] transition-all"
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black text-gray-400 dark:text-white/40 uppercase tracking-widest pl-1">
                                            Phone Number
                                        </label>
                                        <input
                                            value={formData.mobile}
                                            onChange={(e) =>
                                                setFormData({
                                                    ...formData,
                                                    mobile: e.target
                                                        .value,
                                                })
                                            }
                                            placeholder="+1 (555) 000-0000"
                                            className="w-full bg-black/5 dark:bg-white/5 border border-black/10 dark:border-white/10 hover:border-black/20 dark:hover:border-white/20 rounded-2xl p-4 text-gray-900 dark:text-white text-sm outline-none focus:border-attire-accent/50 focus:bg-black/[0.07] dark:focus:bg-white/[0.07] transition-all"
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black text-gray-400 dark:text-white/40 uppercase tracking-widest pl-1">
                                            Order Number (Optional)
                                        </label>
                                        <input
                                            value={
                                                formData.order_no
                                            }
                                            onChange={(e) =>
                                                setFormData({
                                                    ...formData,
                                                    order_no:
                                                        e.target
                                                            .value,
                                                })
                                            }
                                            placeholder="#ORD-..."
                                            className="w-full bg-black/5 dark:bg-white/5 border border-black/10 dark:border-white/10 hover:border-black/20 dark:hover:border-white/20 rounded-2xl p-4 text-gray-900 dark:text-white font-mono text-sm outline-none focus:border-attire-accent/50 focus:bg-black/[0.07] dark:focus:bg-white/[0.07] transition-all"
                                        />
                                    </div>
                                </motion.div>
                            )}
                            {wizardStep === 2 && (
                                <motion.div
                                    key="step2"
                                    initial={{ opacity: 0, x: 20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    exit={{ opacity: 0, x: -20 }}
                                    className="space-y-6"
                                >
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black text-gray-400 dark:text-white/40 uppercase tracking-widest pl-1">
                                            Product Details
                                        </label>
                                        <textarea
                                            required
                                            autoFocus
                                            rows="3"
                                            value={formData.product}
                                            onChange={(e) =>
                                                setFormData({
                                                    ...formData,
                                                    product:
                                                        e.target
                                                            .value,
                                                })
                                            }
                                            placeholder="Specify the exact alterations required..."
                                            className="w-full bg-black/5 dark:bg-white/5 border border-black/10 dark:border-white/10 hover:border-black/20 dark:hover:border-white/20 rounded-2xl p-4 text-gray-900 dark:text-white text-sm outline-none focus:border-attire-accent/50 focus:bg-black/[0.07] dark:focus:bg-white/[0.07] transition-all resize-none"
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black text-gray-400 dark:text-white/40 uppercase tracking-widest pl-1">
                                            Notes (Optional)
                                        </label>
                                        <textarea
                                            rows="3"
                                            value={formData.remark}
                                            onChange={(e) =>
                                                setFormData({
                                                    ...formData,
                                                    remark: e.target
                                                        .value,
                                                })
                                            }
                                            placeholder="Internal tailor notes, structural warnings..."
                                            className="w-full bg-black/5 dark:bg-white/5 border border-black/10 dark:border-white/10 hover:border-black/20 dark:hover:border-white/20 rounded-2xl p-4 text-gray-500 dark:text-white/60 text-sm outline-none focus:border-attire-accent/50 focus:bg-black/[0.07] dark:focus:bg-white/[0.07] transition-all resize-none"
                                        />
                                    </div>
                                </motion.div>
                            )}
                            {wizardStep === 3 && (
                                <motion.div
                                    key="step3"
                                    initial={{ opacity: 0, x: 20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    exit={{ opacity: 0, x: -20 }}
                                    className="space-y-6"
                                >
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black text-gray-400 dark:text-white/40 uppercase tracking-widest pl-1">
                                            Cost ($)
                                        </label>
                                        <div className="relative">
                                            <DollarSign
                                                className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 dark:text-white/40"
                                                size={16}
                                            />
                                            <input
                                                required
                                                type="number"
                                                step="0.01"
                                                value={
                                                    formData.altering_cost
                                                }
                                                onChange={(e) =>
                                                    setFormData({
                                                        ...formData,
                                                        altering_cost:
                                                            e.target
                                                                .value,
                                                    })
                                                }
                                                placeholder="0.00"
                                                className="w-full bg-black/5 dark:bg-white/5 border border-black/10 dark:border-white/10 hover:border-black/20 dark:hover:border-white/20 rounded-2xl py-4 pl-12 pr-4 text-attire-accent font-mono text-lg outline-none focus:border-attire-accent/50 focus:bg-black/[0.07] dark:focus:bg-white/[0.07] transition-all"
                                            />
                                        </div>
                                    </div>
                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="space-y-2">
                                            <label className="text-[10px] font-black text-gray-400 dark:text-white/40 uppercase tracking-widest pl-1">
                                                Start Date
                                            </label>
                                            <input
                                                required
                                                type="date"
                                                value={
                                                    formData.start_date
                                                }
                                                onChange={(e) =>
                                                    setFormData({
                                                        ...formData,
                                                        start_date:
                                                            e.target
                                                                .value,
                                                    })
                                                }
                                                className="w-full bg-black/5 dark:bg-white/5 border border-black/10 dark:border-white/10 hover:border-black/20 dark:hover:border-white/20 rounded-2xl p-4 text-gray-900 dark:text-white text-sm outline-none focus:border-attire-accent/50 focus:bg-black/[0.07] dark:focus:bg-white/[0.07] transition-all [color-scheme:light] dark:[color-scheme:dark]"
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-[10px] font-black text-gray-400 dark:text-white/40 uppercase tracking-widest pl-1">
                                                Target Ready
                                            </label>
                                            <input
                                                required
                                                type="date"
                                                value={
                                                    formData.ready_at
                                                }
                                                onChange={(e) =>
                                                    setFormData({
                                                        ...formData,
                                                        ready_at:
                                                            e.target
                                                                .value,
                                                    })
                                                }
                                                className="w-full bg-black/5 dark:bg-white/5 border border-black/10 dark:border-white/10 hover:border-black/20 dark:hover:border-white/20 rounded-2xl p-4 text-gray-900 dark:text-white text-sm outline-none focus:border-attire-accent/50 focus:bg-black/[0.07] dark:focus:bg-white/[0.07] transition-all [color-scheme:light] dark:[color-scheme:dark]"
                                            />
                                        </div>
                                    </div>
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </div>

                    {/* Controls */}
                    <div className="mt-8 pt-6 border-t border-black/10 dark:border-white/10 flex items-center justify-between relative z-10">
                        <button
                            type="button"
                            onClick={() =>
                                wizardStep > 1
                                    ? setWizardStep((w) => w - 1)
                                    : setIsAdding(false)
                            }
                            className="text-[10px] font-black uppercase tracking-widest text-gray-400 dark:text-white/40 hover:text-attire-charcoal dark:hover:text-white transition-colors px-4 py-3"
                        >
                            {wizardStep === 1
                                ? 'Cancel'
                                : 'Go Back'}
                        </button>

                        {wizardStep < 3 ? (
                            <button
                                type="button"
                                onClick={() => {
                                    if (
                                        wizardStep === 1 &&
                                        !formData.customer_name
                                    )
                                        return alert(
                                            'Client name is required.'
                                        );
                                    if (
                                        wizardStep === 2 &&
                                        !formData.product
                                    )
                                        return alert(
                                            'Garment scope is required.'
                                        );
                                    setWizardStep((w) => w + 1);
                                }}
                                className="px-8 py-4 bg-black/5 dark:bg-white/10 text-gray-900 dark:text-white hover:bg-black/10 dark:hover:bg-white transition-colors dark:hover:text-black rounded-2xl text-[10px] font-black uppercase tracking-widest"
                            >
                                Continue
                            </button>
                        ) : (
                            <Button
                                onClick={() => {
                                    if (
                                        !formData.altering_cost ||
                                        !formData.ready_at
                                    )
                                        return alert(
                                            'Quote and Target Date are required.'
                                        );
                                    createMutation.mutate(formData);
                                }}
                                disabled={createMutation.isPending}
                                className="px-8 py-6 bg-attire-accent text-black hover:bg-[#ffb940] transition-colors rounded-2xl text-[10px] font-black uppercase tracking-widest"
                            >
                                {createMutation.isPending ? (
                                    <LumaSpin className="animate-spin" size="sm" />
                                ) : (
                                    <CheckCircle2 className="mr-2 w-4 h-4" />
                                )}
                                Save Record
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
                <div className="space-y-6 px-2 pb-2">
                    <div className="flex flex-col items-center text-center mb-8">
                        <div className="w-20 h-20 bg-attire-accent/10 rounded-3xl flex items-center justify-center mb-6 border border-attire-accent/20">
                            <RefreshCw
                                size={32}
                                className={`text-attire-accent ${isSyncing ? 'animate-spin' : ''}`}
                            />
                        </div>
                        <p className="text-gray-400 dark:text-white/40 text-xs font-mono tracking-widest uppercase">
                            Google Sheets Intelligence
                        </p>
                    </div>

                    <div className="space-y-4">
                        <div className="space-y-2">
                            <label className="text-[10px] font-black text-gray-400 dark:text-white/40 uppercase tracking-widest pl-2">
                                Sheet Sharing URL
                            </label>
                            <div className="relative group">
                                <div className="absolute left-4 top-1/2 -translate-y-1/2">
                                    <ExternalLink
                                        size={16}
                                        className="text-gray-400 dark:text-white/20 group-focus-within:text-attire-accent transition-colors"
                                    />
                                </div>
                                <input
                                    type="text"
                                    placeholder="https://docs.google.com/spreadsheets/d/..."
                                    value={syncUrl}
                                    onChange={(e) => setSyncUrl(e.target.value)}
                                    className="w-full bg-[#fdfdfc] dark:bg-[#161b22] border border-black/10 dark:border-[#30363d] rounded-2xl py-4 pl-12 pr-4 text-gray-900 dark:text-[#c9d1d9] text-sm outline-none focus:border-[#0d3542]/50 dark:focus:border-[#58a6ff]/50 focus:bg-[#fdfdfc] dark:focus:bg-[#0d1117] transition-all font-mono"
                                />
                            </div>
                        </div>

                        <div className="bg-black/5 dark:bg-white/5 border border-black/5 dark:border-white/5 rounded-2xl p-4 flex items-start gap-3">
                            <div className="p-2 bg-blue-500/10 rounded-lg">
                                <AlertCircle size={14} className="text-blue-400" />
                            </div>
                            <p className="text-[10px] leading-relaxed text-gray-500 dark:text-white/50">
                                Make sure your Google Sheet is shared with{' '}
                                <span className="text-gray-900 dark:text-white/80 font-bold">
                                    Anyone with the link
                                </span>{' '}
                                or accessible via this application.
                            </p>
                        </div>

                        <Button
                            onClick={handleSync}
                            disabled={isSyncing || !syncUrl}
                            className="w-full py-6 bg-attire-accent text-black hover:bg-[#ffb940] transition-all rounded-2xl text-[11px] font-black uppercase tracking-[0.2em] relative overflow-hidden group"
                        >
                            {isSyncing ? (
                                'Syncing Master Data...'
                            ) : (
                                <>
                                    <RefreshCw
                                        size={14}
                                        className="mr-2 group-hover:rotate-180 transition-transform duration-500"
                                    />
                                    Start Synchronization
                                </>
                            )}
                        </Button>
                    </div>
                </div>
            </ModernModal>
        </div>
    );
}
