import React, { useState, useMemo, useCallback, useRef, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import axios from 'axios';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Scissors, Search, X, Smartphone, Clock, Plus, Download,
    DollarSign, Package, User, AlertCircle, CheckCircle2, Mail,
    RefreshCw, Eye, Loader2, ChevronLeft, ChevronRight, Trash2,
    Filter, ArrowUpDown, ExternalLink, Phone,
    Calendar, Check, ChevronDown, Sparkles, Edit3, Send
} from 'lucide-react';
import { LumaSpin } from '@/components/ui/luma-spin';
import ModernModal from '../../common/ModernModal.jsx';
import { formatDate } from '@/helpers/format';
import { useToast } from '@/components/ui/toast';
import { useConfirm } from '@/components/ui/confirm-dialog';

/* ------------------------------------------------------------------ */
/*  Status Configuration                                               */
/* ------------------------------------------------------------------ */
const STATUS_CONFIG = {
    pending: {
        label: 'Pending',
        color: 'text-amber-500 dark:text-amber-400',
        bg: 'bg-amber-500/10 dark:bg-amber-500/15',
        border: 'border-amber-500/20',
        dot: 'bg-amber-500',
        activeRing: 'ring-amber-500/30',
        next: 'in_progress',
        nextLabel: 'Start Progress'
    },
    in_progress: {
        label: 'In Progress',
        color: 'text-blue-500 dark:text-blue-400',
        bg: 'bg-blue-500/10 dark:bg-blue-500/15',
        border: 'border-blue-500/20',
        dot: 'bg-blue-500',
        activeRing: 'ring-blue-500/30',
        next: 'ready',
        nextLabel: 'Mark Ready'
    },
    ready: {
        label: 'Ready',
        color: 'text-emerald-500 dark:text-emerald-400',
        bg: 'bg-emerald-500/10 dark:bg-emerald-500/15',
        border: 'border-emerald-500/20',
        dot: 'bg-emerald-500',
        activeRing: 'ring-emerald-500/30',
        next: 'completed',
        nextLabel: 'Mark Completed'
    },
    completed: {
        label: 'Done',
        color: 'text-muted-foreground dark:text-white/60',
        bg: 'bg-muted/60 dark:bg-white/5',
        border: 'border-border dark:border-white/10',
        dot: 'bg-muted-foreground/60',
        activeRing: 'ring-muted/30',
        next: 'pending',
        nextLabel: 'Reopen'
    },
};

const STATUS_KEYS = ['all', 'pending', 'in_progress', 'ready', 'completed'];

/* ------------------------------------------------------------------ */
/*  Count Up Hook for KPIs                                            */
/* ------------------------------------------------------------------ */
function useCountUp(target, duration = 800) {
    const [val, setVal] = useState(0);
    const prev = useRef(0);
    useEffect(() => {
        let raf = 0;
        const start = performance.now();
        const from = prev.current;
        const tick = (now) => {
            const t = Math.min(1, (now - start) / duration);
            const eased = 1 - Math.pow(1 - t, 3);
            setVal(from + (target - from) * eased);
            if (t < 1) raf = requestAnimationFrame(tick);
            else prev.current = target;
        };
        raf = requestAnimationFrame(tick);
        return () => cancelAnimationFrame(raf);
    }, [target, duration]);
    return val;
}

/* ------------------------------------------------------------------ */
/*  KPI Stat Card (Interactive Filter)                                */
/* ------------------------------------------------------------------ */
function KpiCard({ icon: Icon, label, value, active, onClick, colorClass = 'text-primary' }) {
    const animated = useCountUp(typeof value === 'number' ? value : 0);
    const display = typeof value === 'number' ? Math.round(animated).toLocaleString() : value;

    return (
        <button
            type="button"
            onClick={onClick}
            className={`group relative flex flex-col justify-between w-full text-left rounded-2xl border p-4 transition-all duration-300 hover:-translate-y-0.5 hover:shadow-lg ${
                active
                    ? 'border-primary/40 bg-primary/5 dark:bg-primary/10 shadow-sm ring-1 ring-primary/20'
                    : 'border-border/70 dark:border-white/10 bg-card hover:border-primary/30'
            }`}
        >
            <div className="flex items-center justify-between w-full">
                <span className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground">
                    {label}
                </span>
                <span className={`flex h-8 w-8 items-center justify-center rounded-xl bg-muted/60 dark:bg-white/5 transition-transform duration-300 group-hover:scale-110 ${colorClass}`}>
                    <Icon size={16} />
                </span>
            </div>
            <div className="mt-3 text-2xl sm:text-3xl font-extrabold tracking-tight text-foreground tabular-nums">
                {display}
            </div>
        </button>
    );
}

/* ------------------------------------------------------------------ */
/*  Inline Interactive Status Badge                                    */
/* ------------------------------------------------------------------ */
const StatusBadge = React.memo(({ status, onQuickAdvance, interactive = false }) => {
    const cfg = STATUS_CONFIG[status] || STATUS_CONFIG.pending;

    if (!interactive) {
        return (
            <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[10px] font-bold uppercase tracking-wider border ${cfg.color} ${cfg.bg} ${cfg.border}`}>
                <span className={`w-1.5 h-1.5 rounded-full ${cfg.dot}`} />
                {cfg.label}
            </span>
        );
    }

    return (
        <button
            type="button"
            onClick={(e) => {
                e.stopPropagation();
                if (onQuickAdvance) onQuickAdvance(cfg.next);
            }}
            title={`Click to advance to: ${cfg.nextLabel}`}
            className={`group inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[10px] font-bold uppercase tracking-wider border transition-all duration-200 hover:scale-105 active:scale-95 ${cfg.color} ${cfg.bg} ${cfg.border} hover:shadow-xs`}
        >
            <span className={`w-1.5 h-1.5 rounded-full ${cfg.dot} group-hover:animate-ping`} />
            <span>{cfg.label}</span>
            <span className="opacity-40 group-hover:opacity-100 text-[8px] ml-0.5">→</span>
        </button>
    );
});

/* ------------------------------------------------------------------ */
/*  Ready Timeline Helper                                              */
/* ------------------------------------------------------------------ */
function getReadyBadge(dateStr) {
    if (!dateStr) return { text: 'TBD', color: 'text-muted-foreground' };
    const ready = new Date(dateStr);
    const now = new Date();
    ready.setHours(0,0,0,0);
    now.setHours(0,0,0,0);

    const diffDays = Math.round((ready - now) / (1000 * 60 * 60 * 24));

    if (diffDays < 0) {
        return { text: `${Math.abs(diffDays)}d overdue`, color: 'text-rose-500 font-semibold' };
    }
    if (diffDays === 0) {
        return { text: 'Ready Today', color: 'text-emerald-500 font-semibold' };
    }
    if (diffDays === 1) {
        return { text: 'Tomorrow', color: 'text-blue-500 font-semibold' };
    }
    return { text: formatDate(dateStr, { month: 'short' }), color: 'text-foreground/80' };
}

/* ------------------------------------------------------------------ */
/*  Altering Row (Table Component)                                     */
/* ------------------------------------------------------------------ */
const AlteringRow = React.memo(({ altering, onDetailOpen, onEditOpen, selected, onToggleSelect, onUpdateStatus }) => {
    const readyBadge = getReadyBadge(altering.ready_at);

    return (
        <tr
            className={`transition-colors group cursor-pointer border-b border-border/50 dark:border-white/5 ${
                selected ? 'bg-primary/5 dark:bg-primary/10' : 'hover:bg-muted/40 dark:hover:bg-white/[0.02]'
            }`}
            onClick={() => onDetailOpen(altering)}
        >
            <td className="px-3.5 py-3.5 w-10" onClick={(e) => e.stopPropagation()}>
                <input
                    type="checkbox"
                    checked={!!selected}
                    onChange={() => onToggleSelect(altering.id)}
                    className="h-4 w-4 rounded-md border-border text-primary accent-primary cursor-pointer transition"
                />
            </td>

            {/* Customer & Ref */}
            <td className="px-4 py-3.5">
                <div className="flex items-center gap-2.5">
                    <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-muted/70 dark:bg-white/5 text-foreground/80 font-bold text-xs">
                        {(altering.customer_name || 'A')[0].toUpperCase()}
                    </div>
                    <div className="min-w-0">
                        <span className="text-[13px] font-bold text-foreground truncate block group-hover:text-primary transition-colors">
                            {altering.customer_name}
                        </span>
                        <div className="flex items-center gap-2 mt-0.5 text-[11px] text-muted-foreground">
                            {altering.order_no && (
                                <span className="font-mono text-[10px] text-foreground/70 font-semibold">
                                    #{altering.order_no}
                                </span>
                            )}
                            {altering.mobile && (
                                <span className="truncate">{altering.mobile}</span>
                            )}
                        </div>
                    </div>
                </div>
            </td>

            {/* Garment / Specs */}
            <td className="px-4 py-3.5 max-w-[200px] hidden md:table-cell">
                <span className="text-[12px] text-foreground/80 font-medium truncate block">
                    {altering.product || 'Standard Tailoring'}
                </span>
                {altering.remark && (
                    <span className="text-[10px] text-muted-foreground/60 truncate block italic mt-0.5">
                        {altering.remark}
                    </span>
                )}
            </td>

            {/* Cost */}
            <td className="px-4 py-3.5 tabular-nums font-bold text-[13px] text-foreground">
                ${parseFloat(altering.altering_cost || 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </td>

            {/* Status (Interactive) */}
            <td className="px-4 py-3.5">
                <StatusBadge
                    status={altering.status}
                    interactive={true}
                    onQuickAdvance={(nextStatus) => onUpdateStatus(altering.id, nextStatus)}
                />
            </td>

            {/* Due Timeline */}
            <td className="px-4 py-3.5 hidden lg:table-cell">
                <span className={`text-[11px] ${readyBadge.color}`}>
                    {readyBadge.text}
                </span>
            </td>

            {/* Quick Actions */}
            <td className="px-4 py-3.5 text-right w-24" onClick={(e) => e.stopPropagation()}>
                <div className="flex items-center justify-end gap-1 opacity-80 group-hover:opacity-100 transition-opacity">
                    <button
                        type="button"
                        onClick={() => onEditOpen(altering)}
                        className="p-1.5 rounded-lg text-muted-foreground hover:text-primary hover:bg-primary/10 transition-all"
                        title="Edit Record"
                    >
                        <Edit3 size={14} />
                    </button>
                    <button
                        type="button"
                        onClick={() => onDetailOpen(altering)}
                        className="p-1.5 rounded-lg text-muted-foreground hover:text-primary hover:bg-primary/10 transition-all"
                        title="View Details"
                    >
                        <Eye size={14} />
                    </button>
                </div>
            </td>
        </tr>
    );
});

/* ------------------------------------------------------------------ */
/*  Altering Card (Mobile View)                                        */
/* ------------------------------------------------------------------ */
const AlteringCard = React.memo(({ altering, onDetailOpen, onEditOpen, selected, onToggleSelect, onUpdateStatus }) => {
    const readyBadge = getReadyBadge(altering.ready_at);

    return (
        <motion.div
            initial={{ opacity: 0, y: 4 }}
            animate={{ opacity: 1, y: 0 }}
            className={`bg-card border rounded-2xl p-4 transition-all cursor-pointer ${
                selected ? 'border-primary/40 bg-primary/5 dark:bg-primary/10' : 'border-border/70 dark:border-white/10 hover:border-primary/30'
            }`}
            onClick={() => onDetailOpen(altering)}
        >
            <div className="flex items-start justify-between gap-3 mb-3">
                <div className="min-w-0 flex-1">
                    <h3 className="text-[13px] font-bold text-foreground truncate">
                        {altering.customer_name}
                    </h3>
                    <div className="flex items-center gap-2 mt-0.5 text-[11px] text-muted-foreground">
                        {altering.order_no && <span className="font-mono text-[10px]">#{altering.order_no}</span>}
                        {altering.mobile && <span>{altering.mobile}</span>}
                    </div>
                </div>

                <div className="flex items-center gap-2" onClick={(e) => e.stopPropagation()}>
                    <input
                        type="checkbox"
                        checked={!!selected}
                        onChange={() => onToggleSelect(altering.id)}
                        className="h-4 w-4 rounded border-border text-primary accent-primary cursor-pointer"
                    />
                    <StatusBadge
                        status={altering.status}
                        interactive={true}
                        onQuickAdvance={(nextStatus) => onUpdateStatus(altering.id, nextStatus)}
                    />
                </div>
            </div>

            {altering.product && (
                <p className="text-[11px] text-foreground/80 font-medium mb-3 line-clamp-1">
                    {altering.product}
                </p>
            )}

            <div className="flex items-center justify-between pt-2 border-t border-border/50 dark:border-white/5 text-[11px]">
                <div className="flex items-center gap-1.5 font-bold text-foreground tabular-nums">
                    <DollarSign size={13} className="text-primary" />
                    <span>${parseFloat(altering.altering_cost || 0).toFixed(2)}</span>
                </div>
                <div className="flex items-center gap-2">
                    <span className={readyBadge.color}>{readyBadge.text}</span>
                    <button
                        type="button"
                        onClick={(e) => {
                            e.stopPropagation();
                            onEditOpen(altering);
                        }}
                        className="p-1 rounded-lg text-muted-foreground hover:text-primary hover:bg-primary/10 transition-all"
                        title="Edit Record"
                    >
                        <Edit3 size={13} />
                    </button>
                </div>
            </div>
        </motion.div>
    );
});

/* ------------------------------------------------------------------ */
/*  Main Altering Manager Component                                    */
/* ------------------------------------------------------------------ */
export default function AlteringManager() {
    const queryClient = useQueryClient();
    const { toast } = useToast();
    const { confirm } = useConfirm();

    const [page, setPage] = useState(1);
    const [statusFilter, setStatusFilter] = useState('all');
    const [searchInput, setSearchInput] = useState('');
    const [searchQuery, setSearchQuery] = useState('');
    const [sortField, setSortField] = useState(null);
    const [sortOrder, setSortOrder] = useState('asc');

    const [selectedDetail, setSelectedDetail] = useState(null);
    const [isAdding, setIsAdding] = useState(false);
    const [editingRecord, setEditingRecord] = useState(null);
    const [showSyncModal, setShowSyncModal] = useState(false);
    const [syncUrl, setSyncUrl] = useState('');
    const [isSyncing, setIsSyncing] = useState(false);
    const [isNotifying, setIsNotifying] = useState(null);
    const [selectedIds, setSelectedIds] = useState(() => new Set());

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

    const [editFormData, setEditFormData] = useState({
        customer_name: '',
        order_no: '',
        mobile: '',
        product: '',
        remark: '',
        altering_cost: '',
        start_date: '',
        ready_at: '',
        status: 'pending',
    });

    const handleOpenEdit = useCallback((record) => {
        if (!record) return;
        setEditingRecord(record);
        setEditFormData({
            customer_name: record.customer_name || '',
            order_no: record.order_no || '',
            mobile: record.mobile || '',
            product: record.product || '',
            remark: record.remark || '',
            altering_cost: record.altering_cost || '',
            start_date: record.start_date ? String(record.start_date).split('T')[0] : '',
            ready_at: record.ready_at ? String(record.ready_at).split('T')[0] : '',
            status: record.status || 'pending',
        });
    }, []);

    // Debounce search query to avoid stutter
    useEffect(() => {
        const timer = setTimeout(() => {
            setSearchQuery(searchInput.trim());
            setPage(1);
        }, 300);
        return () => clearTimeout(timer);
    }, [searchInput]);

    /* ---- Data Query ---- */
    const { data: alteringsData, isLoading, isFetching } = useQuery({
        queryKey: ['admin-alterings', page, statusFilter, searchQuery],
        queryFn: async () => {
            const { data } = await axios.get('/api/v1/admin/alterings', {
                params: {
                    page,
                    status: statusFilter === 'all' ? 'all' : statusFilter,
                    search: searchQuery || undefined,
                },
            });
            return data;
        },
        staleTime: 30000,
    });

    const alterings = alteringsData?.data || [];
    const pagination = {
        currentPage: alteringsData?.current_page || 1,
        lastPage: alteringsData?.last_page || 1,
        total: alteringsData?.total || 0,
    };

    // Calculate status counts
    const statusCounts = useMemo(() => {
        const c = { all: pagination.total, pending: 0, in_progress: 0, ready: 0, completed: 0 };
        alterings.forEach((a) => {
            if (c[a.status] !== undefined) c[a.status]++;
        });
        return c;
    }, [alterings, pagination.total]);

    /* ---- Sorted Alterations ---- */
    const sortedAlterings = useMemo(() => {
        if (!sortField) return alterings;
        return [...alterings].sort((a, b) => {
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

    /* ---- Mutations ---- */
    const updateMutation = useMutation({
        mutationFn: async ({ id, data }) => axios.put(`/api/v1/admin/alterings/${id}`, data),
        onSuccess: (_, variables) => {
            queryClient.invalidateQueries({ queryKey: ['admin-alterings'] });
            if (selectedDetail && selectedDetail.id === variables.id) {
                setSelectedDetail((prev) => ({ ...prev, ...variables.data }));
            }
            toast.success('Alteration record updated');
        },
        onError: () => toast.error('Failed to update alteration record'),
    });

    const handleSaveEdit = (e) => {
        e.preventDefault();
        if (!editFormData.customer_name || !editFormData.product || !editFormData.altering_cost || !editFormData.ready_at) {
            toast.error('Please complete all required fields.');
            return;
        }
        updateMutation.mutate(
            { id: editingRecord.id, data: editFormData },
            {
                onSuccess: () => {
                    setEditingRecord(null);
                },
            }
        );
    };

    const deleteMutation = useMutation({
        mutationFn: async (id) => axios.delete(`/api/v1/admin/alterings/${id}`),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['admin-alterings'] });
            setSelectedDetail(null);
            toast.success('Record removed');
        },
        onError: () => toast.error('Failed to delete record'),
    });

    const bulkDeleteMutation = useMutation({
        mutationFn: async (ids) => axios.post('/api/v1/admin/alterings/bulk-delete', { ids }),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['admin-alterings'] });
            setSelectedIds(new Set());
            toast.success('Selected records deleted');
        },
        onError: () => toast.error('Failed to delete records'),
    });

    const createMutation = useMutation({
        mutationFn: async (data) => axios.post('/api/v1/admin/alterings', data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['admin-alterings'] });
            setIsAdding(false);
            setFormData({
                customer_name: '', order_no: '', mobile: '', product: '',
                remark: '', altering_cost: '', ready_at: '',
                start_date: new Date().toISOString().split('T')[0]
            });
            toast.success('New alteration record created');
        },
        onError: () => toast.error('Failed to create alteration record'),
    });

    /* ---- Selection Handlers ---- */
    const toggleSelect = useCallback((id) => {
        setSelectedIds((prev) => {
            const next = new Set(prev);
            if (next.has(id)) next.delete(id);
            else next.add(id);
            return next;
        });
    }, []);

    const toggleSelectAll = useCallback(() => {
        setSelectedIds((prev) => {
            const next = new Set(prev);
            const allSel = sortedAlterings.length > 0 && sortedAlterings.every((a) => next.has(a.id));
            if (allSel) sortedAlterings.forEach((a) => next.delete(a.id));
            else sortedAlterings.forEach((a) => next.add(a.id));
            return next;
        });
    }, [sortedAlterings]);

    const clearSelection = useCallback(() => setSelectedIds(new Set()), []);

    const handleBulkStatus = useCallback(async (status) => {
        const ids = [...selectedIds];
        if (!ids.length) return;
        try {
            await Promise.all(ids.map((id) => axios.put(`/api/v1/admin/alterings/${id}`, { status })));
            queryClient.invalidateQueries({ queryKey: ['admin-alterings'] });
            setSelectedIds(new Set());
            toast.success(`Updated ${ids.length} records to ${status}`);
        } catch {
            toast.error('Bulk update failed');
        }
    }, [selectedIds, queryClient, toast]);

    const allPageSelected = sortedAlterings.length > 0 && sortedAlterings.every((a) => selectedIds.has(a.id));

    /* ---- Quick Notification ---- */
    const handleNotify = useCallback(async (id) => {
        setIsNotifying(id);
        try {
            await axios.post(`/api/v1/admin/alterings/${id}/notify`);
            queryClient.invalidateQueries({ queryKey: ['admin-alterings'] });
            toast.success('Client notification dispatched');
        } catch {
            toast.error('Could not dispatch notification');
        } finally {
            setIsNotifying(null);
        }
    }, [queryClient, toast]);

    /* ---- Google Sheets Sync Bridge ---- */
    const handleSync = useCallback(async () => {
        if (!syncUrl) return;
        setIsSyncing(true);
        try {
            if (window.hika?.import) {
                await window.hika.import('altering', syncUrl);
            }
            queryClient.invalidateQueries({ queryKey: ['admin-alterings'] });
            setShowSyncModal(false);
            setSyncUrl('');
            toast.success('Sheets sync complete');
        } catch {
            toast.error('Sheet sync failed');
        } finally {
            setIsSyncing(false);
        }
    }, [syncUrl, queryClient, toast]);

    /* ---- Export Helpers ---- */
    const exportToCSV = useCallback(() => {
        const headers = ['Customer', 'Order No', 'Mobile', 'Garment / Work', 'Status', 'Cost ($)', 'Ready Date'];
        const rows = sortedAlterings.map((a) => [
            a.customer_name,
            a.order_no || '',
            a.mobile || '',
            a.product || '',
            a.status,
            a.altering_cost || '0',
            a.ready_at || ''
        ]);
        const csv = [headers.join(','), ...rows.map((r) => r.map((c) => `"${String(c).replace(/"/g, '""')}"`).join(','))].join('\n');
        const link = document.createElement('a');
        link.href = URL.createObjectURL(new Blob([csv], { type: 'text/csv;charset=utf-8;' }));
        link.download = `alterations-${new Date().toISOString().split('T')[0]}.csv`;
        link.click();
        toast.success('Exported CSV');
    }, [sortedAlterings, toast]);

    return (
        <div className="space-y-6 pb-20 max-w-[1400px] mx-auto px-4 sm:px-6 mt-4">
            {/* ---- Top Header Bar ---- */}
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div>
                    <h1 className="flex items-center gap-2.5 font-serif text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
                        <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-attire-gold/10 text-attire-gold border border-attire-gold/20 shadow-xs">
                            <Scissors size={18} />
                        </span>
                        Tailoring & Alterations
                    </h1>
                    <p className="mt-1 text-xs text-muted-foreground font-medium">
                        Track garment fittings, tailoring progress, pickup schedules, and client alerts.
                    </p>
                </div>

                <div className="flex items-center gap-2.5 flex-wrap">
                    <button
                        type="button"
                        onClick={() => setShowSyncModal(true)}
                        className="inline-flex h-9 items-center gap-2 rounded-xl border border-border/80 dark:border-white/10 bg-card px-3.5 text-xs font-semibold text-foreground transition-all hover:bg-muted/60 dark:hover:bg-white/5 active:scale-95"
                    >
                        <RefreshCw size={13} className={isSyncing ? 'animate-spin' : ''} />
                        <span>Sync Sheet</span>
                    </button>

                    <button
                        type="button"
                        onClick={exportToCSV}
                        className="inline-flex h-9 items-center gap-2 rounded-xl border border-border/80 dark:border-white/10 bg-card px-3.5 text-xs font-semibold text-foreground transition-all hover:bg-muted/60 dark:hover:bg-white/5 active:scale-95"
                        title="Export CSV"
                    >
                        <Download size={13} />
                        <span className="hidden sm:inline">Export</span>
                    </button>

                    <button
                        type="button"
                        onClick={() => setIsAdding(true)}
                        className="inline-flex h-9 items-center gap-2 rounded-xl bg-primary px-4 text-xs font-bold text-primary-foreground shadow-sm transition-all hover:opacity-95 active:scale-95"
                    >
                        <Plus size={14} />
                        <span>New Record</span>
                    </button>
                </div>
            </div>

            {/* ---- Interactive KPI Strip ---- */}
            <div className="grid grid-cols-2 gap-3.5 lg:grid-cols-4">
                <KpiCard
                    icon={Scissors}
                    label="All Records"
                    value={pagination.total}
                    active={statusFilter === 'all'}
                    onClick={() => { setStatusFilter('all'); setPage(1); }}
                    colorClass="text-primary"
                />
                <KpiCard
                    icon={Clock}
                    label="Pending"
                    value={statusCounts.pending}
                    active={statusFilter === 'pending'}
                    onClick={() => { setStatusFilter('pending'); setPage(1); }}
                    colorClass="text-amber-500"
                />
                <KpiCard
                    icon={Loader2}
                    label="In Progress"
                    value={statusCounts.in_progress}
                    active={statusFilter === 'in_progress'}
                    onClick={() => { setStatusFilter('in_progress'); setPage(1); }}
                    colorClass="text-blue-500"
                />
                <KpiCard
                    icon={CheckCircle2}
                    label="Ready / Done"
                    value={statusCounts.ready + statusCounts.completed}
                    active={statusFilter === 'ready'}
                    onClick={() => { setStatusFilter('ready'); setPage(1); }}
                    colorClass="text-emerald-500"
                />
            </div>

            {/* ---- Filter & Search Bar ---- */}
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3 rounded-2xl border border-border/80 dark:border-white/10 bg-card p-3 shadow-xs">
                {/* Status Segmented Tabs */}
                <div className="flex items-center gap-1 overflow-x-auto pb-1 lg:pb-0 custom-scrollbar">
                    {STATUS_KEYS.map((key) => {
                        const active = statusFilter === key;
                        const label = key === 'all' ? 'All' : STATUS_CONFIG[key]?.label || key;
                        const dotColor = STATUS_CONFIG[key]?.dot || 'bg-primary';

                        return (
                            <button
                                key={key}
                                type="button"
                                onClick={() => {
                                    setStatusFilter(key);
                                    setPage(1);
                                }}
                                className={`flex items-center gap-2 rounded-xl px-3.5 py-1.5 text-xs font-bold transition-all whitespace-nowrap ${
                                    active
                                        ? 'bg-primary text-primary-foreground shadow-xs'
                                        : 'text-muted-foreground hover:text-foreground hover:bg-muted/60 dark:hover:bg-white/5'
                                }`}
                            >
                                {key !== 'all' && (
                                    <span className={`w-1.5 h-1.5 rounded-full ${active ? 'bg-primary-foreground' : dotColor}`} />
                                )}
                                <span>{label}</span>
                            </button>
                        );
                    })}
                </div>

                {/* Search Input */}
                <div className="flex items-center gap-2">
                    <div className="relative flex-1 sm:w-72">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={14} />
                        <input
                            type="text"
                            placeholder="Search client, order #, phone..."
                            value={searchInput}
                            onChange={(e) => setSearchInput(e.target.value)}
                            className="w-full h-9 bg-muted/50 dark:bg-white/5 border border-border/80 dark:border-white/10 rounded-xl pl-9 pr-8 text-xs font-medium text-foreground outline-none focus:border-primary/50 transition-colors placeholder:text-muted-foreground/50"
                        />
                        {searchInput && (
                            <button
                                type="button"
                                onClick={() => setSearchInput('')}
                                className="absolute right-2.5 top-1/2 -translate-y-1/2 p-0.5 text-muted-foreground hover:text-foreground"
                            >
                                <X size={13} />
                            </button>
                        )}
                    </div>

                    <button
                        type="button"
                        onClick={() => queryClient.invalidateQueries({ queryKey: ['admin-alterings'] })}
                        className="h-9 w-9 shrink-0 flex items-center justify-center rounded-xl border border-border/80 dark:border-white/10 bg-card text-foreground hover:bg-muted/60 dark:hover:bg-white/5 transition-all"
                        title="Refresh"
                    >
                        <RefreshCw size={13} className={isFetching ? 'animate-spin' : ''} />
                    </button>
                </div>
            </div>

            {/* ---- Floating Bulk Selection Pill ---- */}
            <AnimatePresence>
                {selectedIds.size > 0 && (
                    <motion.div
                        initial={{ opacity: 0, y: 20, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 20, scale: 0.95 }}
                        className="sticky bottom-6 z-30 flex flex-wrap items-center justify-between gap-2.5 rounded-2xl border border-primary/30 bg-background/95 dark:bg-[#161b22]/95 px-5 py-3 shadow-xl backdrop-blur-md"
                    >
                        <div className="flex items-center gap-2">
                            <span className="flex h-6 w-6 items-center justify-center rounded-full bg-primary text-[11px] font-bold text-primary-foreground">
                                {selectedIds.size}
                            </span>
                            <span className="text-xs font-bold text-foreground">Records Selected</span>
                        </div>

                        <div className="flex items-center gap-2">
                            <button
                                type="button"
                                onClick={() => handleBulkStatus('in_progress')}
                                className="h-8 px-3 rounded-xl bg-blue-500/10 border border-blue-500/20 text-blue-600 dark:text-blue-400 text-xs font-bold hover:bg-blue-500/20 transition-all"
                            >
                                In Progress
                            </button>
                            <button
                                type="button"
                                onClick={() => handleBulkStatus('ready')}
                                className="h-8 px-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 dark:text-emerald-400 text-xs font-bold hover:bg-emerald-500/20 transition-all"
                            >
                                Mark Ready
                            </button>
                            <button
                                type="button"
                                onClick={() => handleBulkStatus('completed')}
                                className="h-8 px-3 rounded-xl bg-muted border border-border text-foreground text-xs font-bold hover:bg-muted/80 transition-all"
                            >
                                Mark Done
                            </button>
                            <button
                                type="button"
                                onClick={async () => {
                                    if (await confirm({
                                        title: 'Delete selected records?',
                                        message: `${selectedIds.size} record(s) will be permanently deleted.`,
                                        confirmLabel: 'Delete',
                                        cancelLabel: 'Cancel',
                                        danger: true
                                    })) {
                                        bulkDeleteMutation.mutate([...selectedIds]);
                                    }
                                }}
                                className="h-8 px-3 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-600 dark:text-rose-400 text-xs font-bold hover:bg-rose-500/20 transition-all flex items-center gap-1.5"
                            >
                                <Trash2 size={13} />
                                <span>Delete</span>
                            </button>
                            <button
                                type="button"
                                onClick={clearSelection}
                                className="h-8 px-3 rounded-xl border border-border/80 text-muted-foreground text-xs font-medium hover:text-foreground transition-all"
                            >
                                Clear
                            </button>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* ---- Content Area ---- */}
            {isLoading ? (
                <div className="flex flex-col items-center justify-center py-28 gap-3">
                    <LumaSpin size="lg" />
                    <p className="text-xs font-bold uppercase tracking-widest text-muted-foreground/60">
                        Loading alterations...
                    </p>
                </div>
            ) : sortedAlterings.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-24 text-center rounded-2xl border border-dashed border-border/80 bg-card/40">
                    <div className="w-14 h-14 rounded-2xl bg-muted/60 flex items-center justify-center mb-3.5 text-muted-foreground/60">
                        <Scissors size={22} />
                    </div>
                    <h3 className="text-sm font-bold text-foreground">No Alteration Records Found</h3>
                    <p className="text-xs text-muted-foreground mt-1 max-w-sm">
                        {searchQuery ? `No results matching "${searchQuery}".` : 'Get started by creating your first tailoring log.'}
                    </p>
                    {searchQuery ? (
                        <button
                            type="button"
                            onClick={() => setSearchInput('')}
                            className="mt-4 px-3.5 py-1.5 rounded-xl border border-border text-xs font-bold text-foreground hover:bg-muted/60 transition-all"
                        >
                            Clear Search
                        </button>
                    ) : (
                        <button
                            type="button"
                            onClick={() => setIsAdding(true)}
                            className="mt-4 px-4 py-2 rounded-xl bg-primary text-xs font-bold text-primary-foreground hover:opacity-95 transition-all"
                        >
                            + New Alteration
                        </button>
                    )}
                </div>
            ) : (
                <>
                    {/* Desktop Table View */}
                    <div className="hidden md:block rounded-2xl border border-border/80 dark:border-white/10 bg-card overflow-hidden shadow-xs">
                        <div className="overflow-x-auto">
                            <table className="w-full text-left border-collapse">
                                <thead>
                                    <tr className="border-b border-border/70 dark:border-white/10 bg-muted/30 dark:bg-white/[0.02]">
                                        <th className="w-10 px-3.5 py-3">
                                            <input
                                                type="checkbox"
                                                checked={!!allPageSelected}
                                                onChange={toggleSelectAll}
                                                className="h-4 w-4 rounded border-border text-primary accent-primary cursor-pointer"
                                            />
                                        </th>
                                        <th className="px-4 py-3 text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                                            Client & Order
                                        </th>
                                        <th className="px-4 py-3 text-[10px] font-bold uppercase tracking-wider text-muted-foreground hidden md:table-cell">
                                            Garment / Scope
                                        </th>
                                        <th className="px-4 py-3 text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                                            Cost ($)
                                        </th>
                                        <th className="px-4 py-3 text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                                            Status (Click to Advance)
                                        </th>
                                        <th className="px-4 py-3 text-[10px] font-bold uppercase tracking-wider text-muted-foreground hidden lg:table-cell">
                                            Ready Date
                                        </th>
                                        <th className="px-4 py-3 text-right text-[10px] font-bold uppercase tracking-wider text-muted-foreground w-28">
                                            Actions
                                        </th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {sortedAlterings.map((altering) => (
                                        <AlteringRow
                                            key={altering.id}
                                            altering={altering}
                                            onDetailOpen={setSelectedDetail}
                                            onEditOpen={handleOpenEdit}
                                            selected={selectedIds.has(altering.id)}
                                            onToggleSelect={toggleSelect}
                                            onUpdateStatus={(id, status) => updateMutation.mutate({ id, data: { status } })}
                                        />
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>

                    {/* Mobile Card Grid View */}
                    <div className="md:hidden grid grid-cols-1 gap-3">
                        <AnimatePresence>
                            {sortedAlterings.map((altering) => (
                                <AlteringCard
                                    key={altering.id}
                                    altering={altering}
                                    onDetailOpen={setSelectedDetail}
                                    onEditOpen={handleOpenEdit}
                                    selected={selectedIds.has(altering.id)}
                                    onToggleSelect={toggleSelect}
                                    onUpdateStatus={(id, status) => updateMutation.mutate({ id, data: { status } })}
                                />
                            ))}
                        </AnimatePresence>
                    </div>

                    {/* Pagination Bar */}
                    {pagination.lastPage > 1 && (
                        <div className="flex items-center justify-between pt-2">
                            <span className="text-xs text-muted-foreground font-medium">
                                Showing page <strong className="text-foreground">{page}</strong> of <strong className="text-foreground">{pagination.lastPage}</strong> ({pagination.total} total)
                            </span>

                            <div className="flex items-center gap-1.5">
                                <button
                                    type="button"
                                    onClick={() => { setPage((p) => Math.max(1, p - 1)); window.scrollTo({ top: 0, behavior: 'smooth' }); }}
                                    disabled={page === 1}
                                    className="h-8 px-3 rounded-xl border border-border/80 text-xs font-semibold text-foreground disabled:opacity-30 disabled:pointer-events-none hover:bg-muted/60 transition-all flex items-center gap-1"
                                >
                                    <ChevronLeft size={14} />
                                    <span>Prev</span>
                                </button>
                                <button
                                    type="button"
                                    onClick={() => { setPage((p) => Math.min(pagination.lastPage, p + 1)); window.scrollTo({ top: 0, behavior: 'smooth' }); }}
                                    disabled={page === pagination.lastPage}
                                    className="h-8 px-3 rounded-xl border border-border/80 text-xs font-semibold text-foreground disabled:opacity-30 disabled:pointer-events-none hover:bg-muted/60 transition-all flex items-center gap-1"
                                >
                                    <span>Next</span>
                                    <ChevronRight size={14} />
                                </button>
                            </div>
                        </div>
                    )}
                </>
            )}

            {/* ---- Detail & Quick-Action Modal ---- */}
            <ModernModal isOpen={!!selectedDetail} onClose={() => setSelectedDetail(null)} title="Alteration Specification">
                {selectedDetail && (
                    <div className="p-6 space-y-6">
                        {/* Client Header */}
                        <div className="flex items-center justify-between pb-4 border-b border-border/80">
                            <div className="flex items-center gap-3">
                                <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-primary/10 text-primary font-bold text-base">
                                    {(selectedDetail.customer_name || 'A')[0].toUpperCase()}
                                </div>
                                <div>
                                    <h3 className="text-base font-bold text-foreground">
                                        {selectedDetail.customer_name}
                                    </h3>
                                    <p className="text-xs text-muted-foreground mt-0.5">
                                        {selectedDetail.order_no ? `Order #${selectedDetail.order_no}` : 'Custom In-store Fitting'}
                                    </p>
                                </div>
                            </div>

                            <StatusBadge status={selectedDetail.status} />
                        </div>

                        {/* Interactive Status Switcher in Modal */}
                        <div>
                            <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground block mb-2">
                                Change Status
                            </span>
                            <div className="grid grid-cols-4 gap-2">
                                {Object.keys(STATUS_CONFIG).map((st) => {
                                    const active = selectedDetail.status === st;
                                    const cfg = STATUS_CONFIG[st];

                                    return (
                                        <button
                                            key={st}
                                            type="button"
                                            onClick={() => {
                                                updateMutation.mutate({ id: selectedDetail.id, data: { status: st } });
                                                setSelectedDetail((d) => ({ ...d, status: st }));
                                            }}
                                            className={`flex flex-col items-center justify-center gap-1.5 py-2.5 px-2 rounded-xl border text-xs font-bold transition-all ${
                                                active
                                                    ? `${cfg.bg} ${cfg.border} ${cfg.color} ring-1 ring-primary/30 shadow-xs`
                                                    : 'border-border/60 hover:bg-muted/50 text-muted-foreground'
                                            }`}
                                        >
                                            <span className={`w-2 h-2 rounded-full ${cfg.dot}`} />
                                            <span className="text-[11px]">{cfg.label}</span>
                                        </button>
                                    );
                                })}
                            </div>
                        </div>

                        {/* Detail Info Grid */}
                        <div className="grid grid-cols-2 gap-3">
                            <div className="rounded-xl border border-border/70 bg-muted/40 p-3">
                                <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground block mb-1">
                                    Client Contact
                                </span>
                                <p className="text-xs font-semibold text-foreground">
                                    {selectedDetail.mobile || 'No phone recorded'}
                                </p>
                            </div>

                            <div className="rounded-xl border border-border/70 bg-muted/40 p-3">
                                <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground block mb-1">
                                    Tailoring Cost
                                </span>
                                <p className="text-xs font-bold text-primary">
                                    ${parseFloat(selectedDetail.altering_cost || 0).toFixed(2)}
                                </p>
                            </div>

                            <div className="rounded-xl border border-border/70 bg-muted/40 p-3">
                                <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground block mb-1">
                                    Start Date
                                </span>
                                <p className="text-xs font-semibold text-foreground">
                                    {formatDate(selectedDetail.start_date, { fallback: 'Today', month: 'short' })}
                                </p>
                            </div>

                            <div className="rounded-xl border border-border/70 bg-muted/40 p-3">
                                <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground block mb-1">
                                    Ready / Pickup Date
                                </span>
                                <p className="text-xs font-semibold text-foreground">
                                    {formatDate(selectedDetail.ready_at, { fallback: 'TBD', month: 'short' })}
                                </p>
                            </div>
                        </div>

                        {/* Garment Details & Notes */}
                        <div className="rounded-xl border border-border/70 bg-muted/40 p-3.5 space-y-2">
                            <div>
                                <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground block mb-1">
                                    Garment & Adjustments
                                </span>
                                <p className="text-xs text-foreground leading-relaxed font-medium">
                                    {selectedDetail.product || 'Standard Alteration'}
                                </p>
                            </div>

                            {selectedDetail.remark && (
                                <div className="pt-2 border-t border-border/60">
                                    <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground block mb-1">
                                        Tailor Notes
                                    </span>
                                    <p className="text-xs text-muted-foreground leading-relaxed italic">
                                        {selectedDetail.remark}
                                    </p>
                                </div>
                            )}
                        </div>

                        {/* Modal Action Buttons */}
                        <div className="flex items-center justify-between gap-3 pt-4 border-t border-border/80 flex-wrap">
                            <button
                                type="button"
                                onClick={async () => {
                                    if (await confirm({
                                        title: 'Delete this record?',
                                        message: 'This alteration record will be permanently deleted.',
                                        confirmLabel: 'Delete',
                                        cancelLabel: 'Cancel',
                                        danger: true
                                    })) {
                                        deleteMutation.mutate(selectedDetail.id);
                                    }
                                }}
                                className="text-xs font-bold text-rose-500 hover:text-rose-600 transition-colors"
                            >
                                Delete Record
                            </button>

                            <div className="flex items-center gap-2">
                                <button
                                    type="button"
                                    onClick={() => handleOpenEdit(selectedDetail)}
                                    className="inline-flex h-9 items-center gap-1.5 rounded-xl border border-border/80 bg-card px-3.5 text-xs font-bold text-foreground hover:bg-muted/60 transition-all"
                                >
                                    <Edit3 size={13} />
                                    <span>Edit Record</span>
                                </button>

                                <button
                                    type="button"
                                    onClick={() => handleNotify(selectedDetail.id)}
                                    disabled={isNotifying === selectedDetail.id}
                                    className="inline-flex h-9 items-center gap-1.5 rounded-xl border border-border/80 bg-card px-3.5 text-xs font-bold text-foreground hover:bg-muted/60 transition-all disabled:opacity-50"
                                >
                                    {isNotifying === selectedDetail.id ? (
                                        <Loader2 size={13} className="animate-spin" />
                                    ) : (
                                        <Send size={13} />
                                    )}
                                    <span>Notify</span>
                                </button>

                                <button
                                    type="button"
                                    onClick={() => setSelectedDetail(null)}
                                    className="h-9 px-4 rounded-xl bg-primary text-xs font-bold text-primary-foreground hover:opacity-95 transition-all"
                                >
                                    Done
                                </button>
                            </div>
                        </div>
                    </div>
                )}
            </ModernModal>

            {/* ---- New Alteration Modal ---- */}
            <ModernModal isOpen={isAdding} onClose={() => setIsAdding(false)} title="New Tailoring & Alteration">
                <form
                    onSubmit={(e) => {
                        e.preventDefault();
                        if (!formData.customer_name || !formData.product || !formData.altering_cost || !formData.ready_at) {
                            toast.error('Please complete all required fields.');
                            return;
                        }
                        createMutation.mutate(formData);
                    }}
                    className="p-6 space-y-4"
                >
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                        <div className="flex flex-col gap-1">
                            <label className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                                Client Name *
                            </label>
                            <input
                                type="text"
                                required
                                placeholder="e.g. Johnathan Vance"
                                value={formData.customer_name}
                                onChange={(e) => setFormData({ ...formData, customer_name: e.target.value })}
                                className="h-10 bg-muted/50 dark:bg-white/5 border border-border/80 rounded-xl px-3 text-xs font-medium text-foreground outline-none focus:border-primary/50"
                            />
                        </div>

                        <div className="flex flex-col gap-1">
                            <label className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                                Mobile / Phone
                            </label>
                            <input
                                type="text"
                                placeholder="+1 (555) 234-5678"
                                value={formData.mobile}
                                onChange={(e) => setFormData({ ...formData, mobile: e.target.value })}
                                className="h-10 bg-muted/50 dark:bg-white/5 border border-border/80 rounded-xl px-3 text-xs font-medium text-foreground outline-none focus:border-primary/50"
                            />
                        </div>

                        <div className="flex flex-col gap-1">
                            <label className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                                Order / Invoice #
                            </label>
                            <input
                                type="text"
                                placeholder="INV-2026-..."
                                value={formData.order_no}
                                onChange={(e) => setFormData({ ...formData, order_no: e.target.value })}
                                className="h-10 bg-muted/50 dark:bg-white/5 border border-border/80 rounded-xl px-3 text-xs font-medium text-foreground outline-none focus:border-primary/50 font-mono"
                            />
                        </div>

                        <div className="flex flex-col gap-1">
                            <label className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                                Alteration Cost ($) *
                            </label>
                            <input
                                type="number"
                                step="0.01"
                                required
                                placeholder="35.00"
                                value={formData.altering_cost}
                                onChange={(e) => setFormData({ ...formData, altering_cost: e.target.value })}
                                className="h-10 bg-muted/50 dark:bg-white/5 border border-border/80 rounded-xl px-3 text-xs font-medium text-foreground outline-none focus:border-primary/50 font-bold"
                            />
                        </div>
                    </div>

                    <div className="flex flex-col gap-1">
                        <label className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                            Garment & Alteration Work Required *
                        </label>
                        <textarea
                            required
                            rows={3}
                            placeholder="e.g. Navy Tuxedo jacket - shorten sleeves by 1.5 inches, taper trouser waist..."
                            value={formData.product}
                            onChange={(e) => setFormData({ ...formData, product: e.target.value })}
                            className="bg-muted/50 dark:bg-white/5 border border-border/80 rounded-xl p-3 text-xs font-medium text-foreground outline-none focus:border-primary/50 resize-none"
                        />
                    </div>

                    <div className="grid grid-cols-2 gap-3.5">
                        <div className="flex flex-col gap-1">
                            <label className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                                Start Date
                            </label>
                            <input
                                type="date"
                                value={formData.start_date}
                                onChange={(e) => setFormData({ ...formData, start_date: e.target.value })}
                                className="h-10 bg-muted/50 dark:bg-white/5 border border-border/80 rounded-xl px-3 text-xs font-medium text-foreground outline-none focus:border-primary/50"
                            />
                        </div>

                        <div className="flex flex-col gap-1">
                            <label className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                                Target Pickup Date *
                            </label>
                            <input
                                type="date"
                                required
                                value={formData.ready_at}
                                onChange={(e) => setFormData({ ...formData, ready_at: e.target.value })}
                                className="h-10 bg-muted/50 dark:bg-white/5 border border-border/80 rounded-xl px-3 text-xs font-medium text-foreground outline-none focus:border-primary/50"
                            />
                        </div>
                    </div>

                    <div className="flex items-center justify-end gap-2.5 pt-4 border-t border-border/80">
                        <button
                            type="button"
                            onClick={() => setIsAdding(false)}
                            className="h-10 px-4 rounded-xl border border-border/80 text-xs font-semibold text-muted-foreground hover:text-foreground transition-all"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={createMutation.isPending}
                            className="inline-flex h-10 items-center gap-2 rounded-xl bg-primary px-5 text-xs font-bold text-primary-foreground shadow-sm hover:opacity-95 transition-all disabled:opacity-50"
                        >
                            {createMutation.isPending ? <Loader2 size={14} className="animate-spin" /> : <Check size={14} />}
                            <span>Create Record</span>
                        </button>
                    </div>
                </form>
            </ModernModal>

            {/* ---- Edit Alteration Modal ---- */}
            <ModernModal isOpen={!!editingRecord} onClose={() => setEditingRecord(null)} title="Edit Alteration Record">
                {editingRecord && (
                    <form onSubmit={handleSaveEdit} className="p-6 space-y-4">
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                            <div className="flex flex-col gap-1">
                                <label className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                                    Client Name *
                                </label>
                                <input
                                    type="text"
                                    required
                                    value={editFormData.customer_name}
                                    onChange={(e) => setEditFormData({ ...editFormData, customer_name: e.target.value })}
                                    className="h-10 bg-muted/50 dark:bg-white/5 border border-border/80 rounded-xl px-3 text-xs font-medium text-foreground outline-none focus:border-primary/50"
                                />
                            </div>

                            <div className="flex flex-col gap-1">
                                <label className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                                    Mobile / Phone
                                </label>
                                <input
                                    type="text"
                                    value={editFormData.mobile}
                                    onChange={(e) => setEditFormData({ ...editFormData, mobile: e.target.value })}
                                    className="h-10 bg-muted/50 dark:bg-white/5 border border-border/80 rounded-xl px-3 text-xs font-medium text-foreground outline-none focus:border-primary/50"
                                />
                            </div>

                            <div className="flex flex-col gap-1">
                                <label className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                                    Order / Invoice #
                                </label>
                                <input
                                    type="text"
                                    value={editFormData.order_no}
                                    onChange={(e) => setEditFormData({ ...editFormData, order_no: e.target.value })}
                                    className="h-10 bg-muted/50 dark:bg-white/5 border border-border/80 rounded-xl px-3 text-xs font-medium text-foreground outline-none focus:border-primary/50 font-mono"
                                />
                            </div>

                            <div className="flex flex-col gap-1">
                                <label className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                                    Alteration Cost ($) *
                                </label>
                                <input
                                    type="number"
                                    step="0.01"
                                    required
                                    value={editFormData.altering_cost}
                                    onChange={(e) => setEditFormData({ ...editFormData, altering_cost: e.target.value })}
                                    className="h-10 bg-muted/50 dark:bg-white/5 border border-border/80 rounded-xl px-3 text-xs font-medium text-foreground outline-none focus:border-primary/50 font-bold"
                                />
                            </div>
                        </div>

                        <div className="flex flex-col gap-1">
                            <label className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                                Garment & Alteration Work Required *
                            </label>
                            <textarea
                                required
                                rows={3}
                                value={editFormData.product}
                                onChange={(e) => setEditFormData({ ...editFormData, product: e.target.value })}
                                className="bg-muted/50 dark:bg-white/5 border border-border/80 rounded-xl p-3 text-xs font-medium text-foreground outline-none focus:border-primary/50 resize-none"
                            />
                        </div>

                        <div className="flex flex-col gap-1">
                            <label className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                                Tailor Notes
                            </label>
                            <textarea
                                rows={2}
                                value={editFormData.remark}
                                onChange={(e) => setEditFormData({ ...editFormData, remark: e.target.value })}
                                className="bg-muted/50 dark:bg-white/5 border border-border/80 rounded-xl p-3 text-xs font-medium text-foreground outline-none focus:border-primary/50 resize-none"
                            />
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
                            <div className="flex flex-col gap-1">
                                <label className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                                    Status
                                </label>
                                <select
                                    value={editFormData.status}
                                    onChange={(e) => setEditFormData({ ...editFormData, status: e.target.value })}
                                    className="h-10 bg-muted/50 dark:bg-white/5 border border-border/80 rounded-xl px-3 text-xs font-semibold text-foreground outline-none focus:border-primary/50 capitalize"
                                >
                                    <option value="pending">Pending</option>
                                    <option value="in_progress">In Progress</option>
                                    <option value="ready">Ready</option>
                                    <option value="completed">Done</option>
                                </select>
                            </div>

                            <div className="flex flex-col gap-1">
                                <label className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                                    Start Date
                                </label>
                                <input
                                    type="date"
                                    value={editFormData.start_date}
                                    onChange={(e) => setEditFormData({ ...editFormData, start_date: e.target.value })}
                                    className="h-10 bg-muted/50 dark:bg-white/5 border border-border/80 rounded-xl px-3 text-xs font-medium text-foreground outline-none focus:border-primary/50"
                                />
                            </div>

                            <div className="flex flex-col gap-1">
                                <label className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                                    Target Pickup Date *
                                </label>
                                <input
                                    type="date"
                                    required
                                    value={editFormData.ready_at}
                                    onChange={(e) => setEditFormData({ ...editFormData, ready_at: e.target.value })}
                                    className="h-10 bg-muted/50 dark:bg-white/5 border border-border/80 rounded-xl px-3 text-xs font-medium text-foreground outline-none focus:border-primary/50"
                                />
                            </div>
                        </div>

                        <div className="flex items-center justify-end gap-2.5 pt-4 border-t border-border/80">
                            <button
                                type="button"
                                onClick={() => setEditingRecord(null)}
                                className="h-10 px-4 rounded-xl border border-border/80 text-xs font-semibold text-muted-foreground hover:text-foreground transition-all"
                            >
                                Cancel
                            </button>
                            <button
                                type="submit"
                                disabled={updateMutation.isPending}
                                className="inline-flex h-10 items-center gap-2 rounded-xl bg-primary px-5 text-xs font-bold text-primary-foreground shadow-sm hover:opacity-95 transition-all disabled:opacity-50"
                            >
                                {updateMutation.isPending ? <Loader2 size={14} className="animate-spin" /> : <Check size={14} />}
                                <span>Save Changes</span>
                            </button>
                        </div>
                    </form>
                )}
            </ModernModal>

            {/* ---- Google Sheets Sync Modal ---- */}
            <ModernModal isOpen={showSyncModal} onClose={() => setShowSyncModal(false)} title="Google Sheets Sync">
                <div className="p-6 space-y-4">
                    <div className="flex flex-col items-center justify-center p-6 border border-dashed border-border/80 rounded-2xl bg-muted/30 text-center">
                        <RefreshCw size={24} className={`text-primary mb-2.5 ${isSyncing ? 'animate-spin' : ''}`} />
                        <h4 className="text-xs font-bold text-foreground">Import or Sync Spreadsheet</h4>
                        <p className="text-[11px] text-muted-foreground mt-1 max-w-xs">
                            Paste your published Google Sheet URL to import or sync alteration rows automatically.
                        </p>
                    </div>

                    <div className="flex flex-col gap-1">
                        <label className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                            Google Sheet Shareable URL
                        </label>
                        <input
                            type="url"
                            placeholder="https://docs.google.com/spreadsheets/d/..."
                            value={syncUrl}
                            onChange={(e) => setSyncUrl(e.target.value)}
                            className="h-10 bg-muted/50 dark:bg-white/5 border border-border/80 rounded-xl px-3 text-xs font-medium text-foreground outline-none focus:border-primary/50"
                        />
                    </div>

                    <button
                        type="button"
                        onClick={handleSync}
                        disabled={isSyncing || !syncUrl}
                        className="w-full h-10 rounded-xl bg-primary text-xs font-bold text-primary-foreground shadow-sm hover:opacity-95 transition-all disabled:opacity-40 flex items-center justify-center gap-2"
                    >
                        {isSyncing ? <Loader2 size={14} className="animate-spin" /> : <RefreshCw size={14} />}
                        <span>{isSyncing ? 'Syncing Spreadsheet…' : 'Start Sync'}</span>
                    </button>
                </div>
            </ModernModal>
        </div>
    );
}
