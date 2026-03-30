import React, { useState, useEffect, useMemo } from 'react';
import { motion, useReducedMotion, AnimatePresence } from 'framer-motion';
import {
    Download,
    ChevronDown,
    X,
    Mail,
    Phone,
    Clock,
    Search,
    Scissors,
    CheckCircle2,
    AlertCircle,
    RefreshCw,
    Check,
    Loader,
    Plus,
    MoreVertical,
    Smartphone,
    Package,
    DollarSign,
    User,
    ExternalLink,
} from 'lucide-react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import axios from 'axios';

// UI Components
import { Button } from '@/components/ui/button';
import { Card, CardTitle, CardDescription } from '@/components/ui/card';
import { BorderBeam } from '@/components/ui/border-beam';

const statusConfig = {
    pending: {
        label: 'Pending',
        bgColor: 'bg-yellow-500/10',
        borderColor: 'border-yellow-500/30',
        textColor: 'text-yellow-600 dark:text-yellow-400',
        dotColor: 'bg-yellow-500 dark:bg-yellow-400',
        icon: Clock,
    },
    in_progress: {
        label: 'In Progress',
        bgColor: 'bg-blue-500/10',
        borderColor: 'border-blue-500/30',
        textColor: 'text-blue-600 dark:text-blue-400',
        dotColor: 'bg-blue-500 dark:bg-blue-400',
        icon: RefreshCw,
    },
    ready: {
        label: 'Ready',
        bgColor: 'bg-green-500/10',
        borderColor: 'border-green-500/30',
        textColor: 'text-green-600 dark:text-green-400',
        dotColor: 'bg-green-500 dark:bg-green-400',
        icon: CheckCircle2,
    },
    completed: {
        label: 'Completed',
        bgColor: 'bg-black/5 dark:bg-white/5',
        borderColor: 'border-black/10 dark:border-white/10',
        textColor: 'text-gray-500 dark:text-white/60',
        dotColor: 'bg-gray-400 dark:bg-white/40',
        icon: Check,
    },
    cancelled: {
        label: 'Cancelled',
        bgColor: 'bg-red-500/10',
        borderColor: 'border-red-500/30',
        textColor: 'text-red-600 dark:text-red-400',
        dotColor: 'bg-red-500 dark:bg-red-400',
        icon: AlertCircle,
    },
};

const formatDate = (dateStr) => {
    if (!dateStr) return '—';
    return new Date(dateStr).toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
    });
};

const AlteringRow = React.memo(
    ({
        altering,
        statusConfig,
        isSelected,
        onSelect,
        onDetailOpen,
        shouldAnimate,
        rowVariants,
    }) => {
        const status = statusConfig[altering.status] || statusConfig.pending;
        return (
            <motion.div variants={shouldAnimate ? rowVariants : {}}>
                <div
                    className={`px-5 py-4 group relative transition-all duration-300 border-b border-black/5 dark:border-white/5 ${isSelected ? 'bg-attire-accent/10 hover:bg-attire-accent/20' : 'bg-transparent hover:bg-black/[0.02] dark:hover:bg-white/[0.02]'}`}
                    style={{
                        display: 'grid',
                        gridTemplateColumns:
                            '40px 240px 160px 140px 200px 1fr 60px',
                        columnGap: '10px',
                        alignItems: 'center',
                    }}
                >
                    <div className="flex items-center justify-center border-r border-black/5 dark:border-white/5 pr-3">
                        <input
                            type="checkbox"
                            className="w-3.5 h-3.5 rounded border-black/20 dark:border-white/20 bg-transparent accent-attire-accent cursor-pointer"
                            checked={isSelected}
                            onChange={() => onSelect(altering.id)}
                        />
                    </div>

                    <div className="flex items-center gap-3 min-w-0 border-r border-black/5 dark:border-white/5 px-3">
                        <div className="h-8 w-8 rounded-full bg-black/5 dark:bg-white/5 flex items-center justify-center flex-shrink-0 text-gray-500 dark:text-white/60">
                            <User size={14} />
                        </div>
                        <div className="min-w-0">
                            <div className="text-sm font-medium text-gray-900 dark:text-white/90 truncate font-sans">
                                {altering.customer_name}
                            </div>
                            <div className="text-[11px] text-gray-500 dark:text-white/50 font-sans mt-0.5 tracking-wide">
                                {altering.mobile || '—'}{' '}
                                {altering.order_no &&
                                    ` • #${altering.order_no}`}
                            </div>
                        </div>
                    </div>

                    <div className="flex items-center border-r border-black/5 dark:border-white/5 px-3">
                        <div
                            className={`inline-flex items-center gap-1.5 px-2.5 py-1 text-[10px] font-black uppercase tracking-[0.2em] ${status.bgColor} ${status.textColor} border ${status.borderColor} rounded-lg`}
                        >
                            <div
                                className={`w-1.5 h-1.5 rounded-full ${status.dotColor}`}
                            />
                            {status.label}
                        </div>
                    </div>

                    <div className="flex items-center border-r border-black/5 dark:border-white/5 px-3 text-sm font-mono tracking-widest text-attire-accent font-black">
                        ${altering.altering_cost || '0.00'}
                    </div>

                    <div className="flex items-center min-w-0 border-r border-black/5 dark:border-white/5 px-3 text-sm text-gray-400 dark:text-white/50 truncate font-mono uppercase">
                        {altering.product || 'UNSPECIFIED_ARTIFACT'}
                    </div>

                    <div className="flex items-center min-w-0 border-r border-black/5 dark:border-white/5 px-3">
                        <span
                            className={`text-[11px] font-mono tracking-widest ${altering.ready_at && new Date(altering.ready_at) < new Date() && altering.status !== 'completed' ? 'text-red-600 dark:text-red-400 bg-red-500/10 px-2 py-1 object-none' : 'text-gray-400 dark:text-white/40'}`}
                        >
                            {formatDate(altering.ready_at)}
                        </span>
                    </div>

                    <div className="flex items-center justify-center px-3">
                        <button
                            onClick={() => onDetailOpen(altering)}
                            className="opacity-0 group-hover:opacity-100 hover:text-attire-accent hover:bg-black/5 dark:hover:bg-white/5 w-8 h-8 flex items-center justify-center transition-all cursor-pointer text-gray-400 dark:text-white/40 border border-transparent hover:border-black/10 dark:hover:border-white/10"
                        >
                            <svg
                                width="14"
                                height="14"
                                viewBox="0 0 16 16"
                                fill="none"
                            >
                                <rect
                                    x="7"
                                    y="2"
                                    width="2"
                                    height="2"
                                    fill="currentColor"
                                />
                                <rect
                                    x="7"
                                    y="7"
                                    width="2"
                                    height="2"
                                    fill="currentColor"
                                />
                                <rect
                                    x="7"
                                    y="12"
                                    width="2"
                                    height="2"
                                    fill="currentColor"
                                />
                            </svg>
                        </button>
                    </div>
                </div>
            </motion.div>
        );
    }
);

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

    const handleSort = (field) => {
        if (sortField === field) {
            setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
        } else {
            setSortField(field);
            setSortOrder('asc');
        }
        setShowSortMenu(false);
    };

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

    const handleSelectAll = () => {
        if (selectedItems.length === sortedAlterings.length) {
            setSelectedItems([]);
        } else {
            setSelectedItems(sortedAlterings.map((a) => a.id));
        }
    };

    const handleItemSelect = (id) => {
        setSelectedItems((prev) =>
            prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]
        );
    };

    const exportToCSV = () => {
        const headers = [
            'Customer',
            'Order No',
            'Mobile',
            'Product',
            'Status',
            'Cost',
            'Ready At',
        ];
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
            ...rows.map((row) =>
                row
                    .map((cell) => `"${String(cell).replace(/"/g, '""')}"`)
                    .join(',')
            ),
        ].join('\n');
        const blob = new Blob([csvContent], {
            type: 'text/csv;charset=utf-8;',
        });
        const link = document.createElement('a');
        link.href = URL.createObjectURL(blob);
        link.download = `alterings-${new Date().toISOString().split('T')[0]}.csv`;
        link.click();
    };

    const exportToJSON = () => {
        const jsonContent = JSON.stringify(sortedAlterings, null, 2);
        const blob = new Blob([jsonContent], {
            type: 'application/json;charset=utf-8;',
        });
        const link = document.createElement('a');
        link.href = URL.createObjectURL(blob);
        link.download = `alterings-${new Date().toISOString().split('T')[0]}.json`;
        link.click();
    };

    const shouldAnimate = !shouldReduceMotion;

    const containerVariants = {
        visible: { transition: { staggerChildren: 0.04, delayChildren: 0.1 } },
    };

    const rowVariants = {
        hidden: { opacity: 0, y: 30, filter: 'blur(10px)' },
        visible: {
            opacity: 1,
            y: 0,
            filter: 'blur(0px)',
            transition: {
                duration: 0.6,
                ease: [0.16, 1, 0.3, 1],
            },
        },
        exit: {
            opacity: 0,
            y: -20,
            filter: 'blur(4px)',
            transition: { duration: 0.3 },
        },
    };

    const handleSync = async () => {
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
    };

    return (
        <div className="w-full font-sans pb-20">
            {/* Header & Controls */}
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-10">
                <div>
                    <h1 className="text-4xl font-serif text-attire-charcoal dark:text-white tracking-tight flex items-center gap-4">
                        <div className="p-3 bg-attire-accent/10 rounded-2xl border border-attire-accent/20 shadow-[0_0_20px_rgba(245,168,28,0.1)]">
                            <Scissors className="w-8 h-8 text-attire-accent" />
                        </div>
                        Altering Manager
                    </h1>
                    <div className="flex items-center gap-3 mt-4">
                        <span className="w-8 h-px bg-attire-accent/40" />
                        <p className="text-gray-400 dark:text-white/40 text-[10px] font-black uppercase tracking-[0.4em]">
                            Tailor Queue Management
                        </p>
                    </div>
                </div>

                <div className="flex items-center gap-3 flex-wrap">
                    <div className="relative">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 dark:text-white/40" />
                        <input
                            type="text"
                            placeholder="Search..."
                            value={searchQuery}
                            onChange={(e) => {
                                setSearchQuery(e.target.value);
                                setPage(1);
                            }}
                            className="bg-black/5 dark:bg-white/5 border border-black/10 dark:border-white/10 rounded-xl py-2.5 pl-10 pr-4 text-attire-charcoal dark:text-white text-sm outline-none focus:border-attire-accent/50 transition-all placeholder:text-gray-400 dark:placeholder:text-white/20 w-48 lg:w-64 font-mono tracking-widest text-[11px]"
                        />
                    </div>

                    <div className="relative">
                        <button
                            onClick={() => setShowFilterMenu(!showFilterMenu)}
                            className={`px-4 py-2.5 bg-black/5 dark:bg-white/5 border border-black/10 dark:border-white/10 text-attire-charcoal dark:text-white hover:bg-black/10 dark:hover:bg-white/10 transition-colors flex items-center gap-2 rounded-xl text-sm font-mono tracking-widest text-[11px] ${statusFilter ? 'ring-1 ring-attire-accent/50' : ''}`}
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
                                <span className="ml-1 text-[10px] bg-attire-accent text-black font-black rounded px-1.5 py-0.5">
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
                                <div className="absolute right-0 mt-2 w-48 bg-[#0a0a0a] border border-white/10 shadow-xl rounded-xl z-20 overflow-hidden py-2">
                                    <button
                                        onClick={() => {
                                            setStatusFilter('');
                                            setShowFilterMenu(false);
                                            setPage(1);
                                        }}
                                        className={`w-full px-4 py-2.5 text-left text-sm text-white/80 hover:bg-white/5 transition-colors ${!statusFilter ? 'bg-white/5' : ''}`}
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
                            className="px-4 py-2.5 bg-black/5 dark:bg-white/5 border border-black/10 dark:border-white/10 text-attire-charcoal dark:text-white hover:bg-black/10 dark:hover:bg-white/10 transition-colors flex items-center gap-2 rounded-xl text-sm font-mono tracking-widest text-[11px]"
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
                                <div className="absolute right-0 mt-2 w-48 bg-[#0a0a0a] border border-white/10 shadow-xl rounded-xl z-20 py-2">
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
                                <div className="absolute right-0 mt-2 w-32 bg-[#0a0a0a] border border-white/10 shadow-xl rounded-xl z-20 py-2">
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

                    <button
                        onClick={() => setShowSyncModal(true)}
                        className="px-4 py-2.5 bg-attire-accent/10 border border-attire-accent/20 text-attire-accent hover:bg-attire-accent/20 transition-all flex items-center gap-2 rounded-xl text-sm font-mono tracking-widest text-[11px]"
                    >
                        <RefreshCw size={14} className={isSyncing ? 'animate-spin' : ''} />
                        Sync Sheet
                    </button>

                    <Button
                        onClick={() => setIsAdding(true)}
                        className="bg-attire-charcoal dark:bg-white text-white dark:text-black hover:bg-attire-accent transition-colors px-6 py-5 rounded-xl font-bold uppercase tracking-[0.2em] text-[10px] ml-1"
                    >
                        <Plus className="w-3 h-3 mr-2" /> Add Record
                    </Button>
                </div>
            </div>

            {/* Table Area */}
            <div className="bg-white/80 dark:bg-[#0a0a0a]/80 backdrop-blur-xl border border-black/10 dark:border-white/10 rounded-3xl overflow-hidden relative shadow-2xl">
                <div className="overflow-x-auto">
                    <div className="min-w-[1100px]">
                        {/* Table Header */}
                        <div
                            className="px-5 py-4 text-[10px] font-black uppercase tracking-[0.2em] text-gray-400 dark:text-white/40 bg-black/[0.02] dark:bg-white/[0.02] border-b border-black/5 dark:border-white/10 text-left"
                            style={{
                                display: 'grid',
                                gridTemplateColumns:
                                    '40px 240px 160px 140px 200px 1fr 60px',
                                columnGap: '10px',
                            }}
                        >
                            <div className="flex items-center justify-center border-r border-black/5 dark:border-white/5 pr-3">
                                <input
                                    type="checkbox"
                                    className="w-3.5 h-3.5 rounded border-black/20 dark:border-white/20 bg-transparent accent-attire-accent cursor-pointer"
                                    checked={
                                        sortedAlterings.length > 0 &&
                                        selectedItems.length ===
                                            sortedAlterings.length
                                    }
                                    onChange={handleSelectAll}
                                />
                            </div>
                            <div className="flex items-center gap-1.5 border-r border-black/5 dark:border-white/5 px-3">
                                <svg
                                    width="12"
                                    height="12"
                                    viewBox="0 0 16 16"
                                    fill="none"
                                    className="opacity-50"
                                >
                                    <circle
                                        cx="8"
                                        cy="6"
                                        r="3"
                                        stroke="currentColor"
                                        strokeWidth="1.5"
                                    />
                                    <path
                                        d="M3 14C3 11.5 5 10 8 10C11 10 13 11.5 13 14"
                                        stroke="currentColor"
                                        strokeWidth="1.5"
                                    />
                                </svg>
                                Client
                            </div>
                            <div className="flex items-center gap-1.5 border-r border-black/5 dark:border-white/5 px-3">
                                <svg
                                    width="12"
                                    height="12"
                                    viewBox="0 0 16 16"
                                    fill="none"
                                    className="opacity-50"
                                >
                                    <path
                                        d="M3 8L6 5L10 9L13 6"
                                        stroke="currentColor"
                                        strokeWidth="1.5"
                                        strokeLinecap="round"
                                    />
                                </svg>
                                Status
                            </div>
                            <div className="flex items-center gap-1.5 border-r border-black/5 dark:border-white/5 px-3">
                                <DollarSign size={12} className="opacity-50" />{' '}
                                Cost
                            </div>
                            <div className="flex items-center gap-1.5 border-r border-black/5 dark:border-white/5 px-3">
                                <Package size={12} className="opacity-50" />{' '}
                                Product
                            </div>
                            <div className="flex items-center gap-1.5 border-r border-black/5 dark:border-white/5 px-3">
                                <Clock size={12} className="opacity-50" /> Ready
                                Date
                            </div>
                            <div className="flex items-center justify-center px-3 opacity-30">
                                <MoreVertical size={14} />
                            </div>
                        </div>

                        {isLoading ? (
                            <div className="flex items-center justify-center h-64">
                                <Loader className="w-8 h-8 text-attire-accent animate-spin" />
                            </div>
                        ) : sortedAlterings.length === 0 ? (
                            <div className="flex flex-col items-center justify-center h-64 text-center">
                                <Scissors className="w-12 h-12 text-black/10 dark:text-white/10 mb-4" />
                                <p className="text-gray-400 dark:text-white/30 text-xs font-black uppercase tracking-widest">
                                    No records found
                                </p>
                            </div>
                        ) : (
                            <AnimatePresence mode="wait">
                                <motion.div
                                    key={`page-${page}`}
                                    variants={
                                        shouldAnimate ? containerVariants : {}
                                    }
                                    initial={
                                        shouldAnimate ? 'hidden' : 'visible'
                                    }
                                    animate="visible"
                                >
                                    {sortedAlterings.map((altering) => (
                                        <AlteringRow
                                            key={altering.id}
                                            altering={altering}
                                            statusConfig={statusConfig}
                                            isSelected={selectedItems.includes(
                                                altering.id
                                            )}
                                            onSelect={handleItemSelect}
                                            onDetailOpen={setSelectedDetail}
                                            shouldAnimate={shouldAnimate}
                                            rowVariants={rowVariants}
                                        />
                                    ))}
                                </motion.div>
                            </AnimatePresence>
                        )}
                    </div>
                </div>

                {/* Pagination Details */}
                {!isLoading && pagination.total > 0 && (
                    <div className="flex items-center justify-between p-5 border-t border-black/5 dark:border-white/10 bg-black/[0.01] dark:bg-white/[0.01]">
                        <div className="text-[10px] uppercase font-black tracking-widest text-gray-400 dark:text-white/40">
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
            </div>

            {/* Detail Modal Overlays */}
            <AnimatePresence>
                {selectedDetail && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.3 }}
                        className="fixed inset-0 bg-black/60 dark:bg-[#000000]/80 backdrop-blur-md flex items-center justify-center z-50 p-4"
                        onClick={() => setSelectedDetail(null)}
                    >
                        <motion.div
                            initial={{ scale: 0.95, opacity: 0, y: 20 }}
                            animate={{ scale: 1, opacity: 1, y: 0 }}
                            exit={{ scale: 0.95, opacity: 0, y: 20 }}
                            transition={{
                                type: 'spring',
                                stiffness: 400,
                                damping: 30,
                            }}
                            className="bg-white dark:bg-[#0a0a0a] border border-black/10 dark:border-white/10 rounded-[2.5rem] p-8 max-w-lg w-full shadow-2xl relative overflow-hidden"
                            onClick={(e) => e.stopPropagation()}
                        >
                            <div className="absolute top-0 right-0 w-64 h-64 bg-attire-accent/[0.03] rounded-full blur-3xl pointer-events-none" />

                            <button
                                onClick={() => setSelectedDetail(null)}
                                className="absolute top-6 right-6 w-8 h-8 rounded-full bg-black/5 dark:bg-white/5 hover:bg-black/10 dark:hover:bg-white/10 flex items-center justify-center transition-colors text-gray-400 dark:text-white/40 hover:text-attire-charcoal dark:hover:text-white"
                            >
                                <X size={14} />
                            </button>

                            <div className="space-y-8 relative z-10">
                                {/* Header */}
                                <div className="flex items-center gap-4">
                                    <div className="w-16 h-16 rounded-3xl bg-attire-accent/10 border border-attire-accent/20 flex items-center justify-center shadow-[0_0_20px_rgba(245,168,28,0.1)]">
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
                                                <div className="inline-flex items-center px-2 py-0.5 text-[9px] font-mono uppercase tracking-widest bg-white/5 border border-white/10 text-white/50 rounded-md">
                                                    #{selectedDetail.order_no}
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </div>

                                {/* Information Matrix */}
                                <div className="grid gap-4 bg-white/[0.02] border border-white/5 p-5 rounded-3xl">
                                    <div className="flex gap-4 items-start">
                                        <Smartphone
                                            size={16}
                                            className="text-white/30 mt-0.5 shrink-0"
                                        />
                                        <div>
                                            <p className="text-[10px] uppercase font-black tracking-widest text-white/30 mb-0.5">
                                                Phone
                                            </p>
                                            <p className="text-sm font-medium text-white">
                                                {selectedDetail.mobile ||
                                                    'Unknown'}
                                            </p>
                                        </div>
                                    </div>
                                    <div className="flex gap-4 items-start">
                                        <Package
                                            size={16}
                                            className="text-white/30 mt-0.5 shrink-0"
                                        />
                                        <div>
                                            <p className="text-[10px] uppercase font-black tracking-widest text-white/30 mb-0.5">
                                                Product
                                            </p>
                                            <p className="text-sm text-white/80 font-serif italic">
                                                {selectedDetail.product ||
                                                    'Unspecified Detail'}
                                            </p>
                                        </div>
                                    </div>
                                    {selectedDetail.remark && (
                                        <div className="flex gap-4 items-start">
                                            <Mail
                                                size={16}
                                                className="text-white/30 mt-0.5 shrink-0"
                                            />
                                            <div>
                                                <p className="text-[10px] uppercase font-black tracking-widest text-white/30 mb-0.5">
                                                    Notes
                                                </p>
                                                <p className="text-sm text-white/60 leading-relaxed bg-black/20 p-3 rounded-xl border border-white/5 mt-1">
                                                    {selectedDetail.remark}
                                                </p>
                                            </div>
                                        </div>
                                    )}
                                    <div className="grid grid-cols-2 gap-4 pt-4 border-t border-white/5">
                                        <div>
                                            <p className="text-[10px] uppercase font-black tracking-widest text-white/30 mb-1">
                                                Ready Date
                                            </p>
                                            <p className="text-sm font-mono text-white/80">
                                                {formatDate(
                                                    selectedDetail.ready_at
                                                )}
                                            </p>
                                        </div>
                                        <div>
                                            <p className="text-[10px] uppercase font-black tracking-widest text-white/30 mb-1">
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
                                                className="flex-1 bg-white text-black hover:bg-white/80 transition-colors py-4 rounded-xl text-[10px] font-black uppercase tracking-[0.2em] shadow-xl flex justify-center items-center gap-2"
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
                                                <Loader
                                                    className="animate-spin"
                                                    size={14}
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
                                        <span className="text-[9px] uppercase tracking-widest font-black text-white/20">
                                            {selectedDetail.notified_at
                                                ? `Last notified: ${formatDate(selectedDetail.notified_at)}`
                                                : 'Not notified yet'}
                                        </span>
                                    </div>
                                </div>
                            </div>
                        </motion.div>
                    </motion.div>
                )}

                {/* Add Modal Wizard */}
                {isAdding && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                        <div
                            className="absolute inset-0 bg-black/60 dark:bg-[#000000]/80 backdrop-blur-md"
                            onClick={() => setIsAdding(false)}
                        />
                        <motion.div
                            initial={{ scale: 0.95, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.95, opacity: 0 }}
                            className="relative w-full max-w-xl"
                        >
                            <Card className="bg-white dark:bg-[#0a0a0a] border border-black/10 dark:border-white/10 p-8 rounded-[3rem] shadow-2xl relative overflow-hidden">
                                <BorderBeam size={250} duration={12} />

                                {/* Header / Progress Indicators */}
                                <div className="flex justify-between items-start mb-8 relative z-10">
                                    <div>
                                        <CardTitle className="text-3xl font-serif text-attire-charcoal dark:text-white tracking-tight">
                                            Add Record
                                        </CardTitle>
                                        <div className="flex items-center gap-2 mt-3">
                                            {[1, 2, 3].map((step) => (
                                                <div
                                                    key={step}
                                                    className={`h-1.5 rounded-full transition-all duration-300 ${wizardStep >= step ? 'w-8 bg-attire-accent' : 'w-4 bg-black/10 dark:bg-white/10'}`}
                                                />
                                            ))}
                                        </div>
                                    </div>
                                    <Button
                                        variant="ghost"
                                        onClick={() => setIsAdding(false)}
                                        className="text-gray-400 dark:text-white/40 hover:text-attire-charcoal dark:hover:text-white hover:bg-black/5 dark:hover:bg-white/5 rounded-full w-10 h-10 p-0 flex items-center justify-center"
                                    >
                                        <X size={16} />
                                    </Button>
                                </div>

                                <div className="relative z-10 min-h-[300px]">
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
                                                        className="w-full bg-black/5 dark:bg-white/5 border border-black/10 dark:border-white/10 hover:border-black/20 dark:hover:border-white/20 rounded-2xl p-4 text-attire-charcoal dark:text-white text-sm outline-none focus:border-attire-accent/50 focus:bg-black/[0.07] dark:focus:bg-white/[0.07] transition-all"
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
                                                        className="w-full bg-black/5 dark:bg-white/5 border border-black/10 dark:border-white/10 hover:border-black/20 dark:hover:border-white/20 rounded-2xl p-4 text-attire-charcoal dark:text-white text-sm outline-none focus:border-attire-accent/50 focus:bg-black/[0.07] dark:focus:bg-white/[0.07] transition-all"
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
                                                        className="w-full bg-black/5 dark:bg-white/5 border border-black/10 dark:border-white/10 hover:border-black/20 dark:hover:border-white/20 rounded-2xl p-4 text-attire-charcoal dark:text-white font-mono text-sm outline-none focus:border-attire-accent/50 focus:bg-black/[0.07] dark:focus:bg-white/[0.07] transition-all"
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
                                                        className="w-full bg-black/5 dark:bg-white/5 border border-black/10 dark:border-white/10 hover:border-black/20 dark:hover:border-white/20 rounded-2xl p-4 text-attire-charcoal dark:text-white text-sm outline-none focus:border-attire-accent/50 focus:bg-black/[0.07] dark:focus:bg-white/[0.07] transition-all resize-none"
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
                                                            className="w-full bg-black/5 dark:bg-white/5 border border-black/10 dark:border-white/10 hover:border-black/20 dark:hover:border-white/20 rounded-2xl p-4 text-attire-charcoal dark:text-white text-sm outline-none focus:border-attire-accent/50 focus:bg-black/[0.07] dark:focus:bg-white/[0.07] transition-all [color-scheme:light] dark:[color-scheme:dark]"
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
                                                            className="w-full bg-black/5 dark:bg-white/5 border border-black/10 dark:border-white/10 hover:border-black/20 dark:hover:border-white/20 rounded-2xl p-4 text-attire-charcoal dark:text-white text-sm outline-none focus:border-attire-accent/50 focus:bg-black/[0.07] dark:focus:bg-white/[0.07] transition-all [color-scheme:light] dark:[color-scheme:dark]"
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
                                        className="text-[10px] font-black uppercase tracking-widest text-white/40 hover:text-white transition-colors px-4 py-3"
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
                                            className="px-8 py-4 bg-black/5 dark:bg-white/10 text-attire-charcoal dark:text-white hover:bg-black/10 dark:hover:bg-white transition-colors dark:hover:text-black rounded-2xl text-[10px] font-black uppercase tracking-widest"
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
                                            className="px-8 py-6 bg-attire-accent text-black hover:bg-[#ffb940] transition-colors shadow-[0_0_20px_rgba(245,168,28,0.3)] rounded-2xl text-[10px] font-black uppercase tracking-widest"
                                        >
                                            {createMutation.isPending ? (
                                                <Loader className="animate-spin mr-2" />
                                            ) : (
                                                <CheckCircle2 className="mr-2 w-4 h-4" />
                                            )}
                                            Save Record
                                        </Button>
                                    )}
                                </div>
                            </Card>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
            {/* Sync Sheet Modal */}
            <AnimatePresence>
                {showSyncModal && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            onClick={() => setShowSyncModal(false)}
                            className="absolute inset-0 bg-black/60 backdrop-blur-md"
                        />
                        <motion.div
                            initial={{ scale: 0.9, opacity: 0, y: 20 }}
                            animate={{ scale: 1, opacity: 1, y: 0 }}
                            exit={{ scale: 0.9, opacity: 0, y: 20 }}
                            className="relative w-full max-w-lg z-10"
                        >
                            <Card className="bg-[#0e0e0e] border border-white/10 p-8 shadow-2xl rounded-[2rem] overflow-hidden">
                                <div className="absolute top-0 right-0 p-6">
                                    <button
                                        onClick={() => setShowSyncModal(false)}
                                        className="text-white/20 hover:text-white transition-colors"
                                    >
                                        <X size={20} />
                                    </button>
                                </div>

                                <div className="flex flex-col items-center text-center mb-10">
                                    <div className="w-20 h-20 bg-attire-accent/10 rounded-3xl flex items-center justify-center mb-6 border border-attire-accent/20 shadow-[0_0_40px_rgba(245,168,28,0.1)]">
                                        <RefreshCw
                                            size={32}
                                            className={`text-attire-accent ${isSyncing ? 'animate-spin' : ''}`}
                                        />
                                    </div>
                                    <h2 className="text-2xl font-serif text-white mb-2">
                                        Master Sheet Sync
                                    </h2>
                                    <p className="text-white/40 text-xs font-mono tracking-widest uppercase">
                                        Google Sheets Data Intelligence
                                    </p>
                                </div>

                                <div className="space-y-6">
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black text-white/40 uppercase tracking-widest pl-2">
                                            Sheet Sharing URL
                                        </label>
                                        <div className="relative group">
                                            <div className="absolute left-4 top-1/2 -translate-y-1/2">
                                                <ExternalLink
                                                    size={16}
                                                    className="text-white/20 group-focus-within:text-attire-accent transition-colors"
                                                />
                                            </div>
                                            <input
                                                type="text"
                                                placeholder="https://docs.google.com/spreadsheets/d/..."
                                                value={syncUrl}
                                                onChange={(e) => setSyncUrl(e.target.value)}
                                                className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 pl-12 pr-4 text-white text-sm outline-none focus:border-attire-accent/50 focus:bg-white/[0.08] transition-all font-mono"
                                            />
                                        </div>
                                    </div>

                                    <div className="bg-white/5 border border-white/5 rounded-2xl p-4 flex items-start gap-3">
                                        <div className="p-2 bg-blue-500/10 rounded-lg">
                                            <svg
                                                width="14"
                                                height="14"
                                                viewBox="0 0 24 24"
                                                fill="none"
                                                stroke="currentColor"
                                                strokeWidth="2"
                                                className="text-blue-400"
                                            >
                                                <circle cx="12" cy="12" r="10" />
                                                <line x1="12" y1="16" x2="12" y2="12" />
                                                <line x1="12" y1="8" x2="12.01" y2="8" />
                                            </svg>
                                        </div>
                                        <p className="text-[10px] leading-relaxed text-white/50">
                                            Make sure your Google Sheet is shared with{' '}
                                            <span className="text-white/80 font-bold">
                                                Anyone with the link
                                            </span>{' '}
                                            or accessible via this application.
                                        </p>
                                    </div>

                                    <Button
                                        onClick={handleSync}
                                        disabled={isSyncing || !syncUrl}
                                        className="w-full py-6 bg-attire-accent text-black hover:bg-[#ffb940] transition-all shadow-[0_10px_30px_rgba(245,168,28,0.2)] rounded-2xl text-[11px] font-black uppercase tracking-[0.2em] relative overflow-hidden group"
                                    >
                                        {isSyncing && (
                                            <div className="absolute inset-x-0 bottom-0 h-1 bg-black/10 overflow-hidden">
                                                <motion.div
                                                    initial={{ x: '-100%' }}
                                                    animate={{ x: '100%' }}
                                                    transition={{ repeat: Infinity, duration: 1.5 }}
                                                    className="w-1/2 h-full bg-black/20"
                                                />
                                            </div>
                                        )}
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

                                    <button
                                        onClick={() => setShowSyncModal(false)}
                                        className="w-full py-4 text-[10px] font-black text-white/20 uppercase tracking-widest hover:text-white transition-colors"
                                    >
                                        Maybe Later
                                    </button>
                                </div>
                            </Card>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </div>
    );
}
