import React, { useState, useCallback, useMemo, memo } from 'react';
import {
    User, Mail, Phone, Calendar, Clock, MessageSquare,
    AlertTriangle, Check, X, Trash2, Plus, Filter, History,
    Loader2, ChevronRight, Sparkles
} from 'lucide-react';
import { LumaSpin } from '@/components/ui/luma-spin';
import { useAdmin } from './AdminContext';
import OptimizedImage from '../../common/OptimizedImage.jsx';
import { motion, AnimatePresence } from 'framer-motion';
import ModernModal from '../../common/ModernModal';
import { formatTime } from '@/helpers/format';
import DatePicker from '@/components/ui/DatePicker';
import { TimePicker } from '@/components/ui/time-picker';
import {
    Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select';
import { format, parse } from 'date-fns';
import { useToast } from '@/components/ui/toast';
import { useConfirm } from '@/components/ui/confirm-dialog';

/* ------------------------------------------------------------------ */
/*  Status Config                                                      */
/* ------------------------------------------------------------------ */
const STATUS_DATA = {
    pending: {
        label: 'Active',
        color: 'text-amber-600 dark:text-amber-400',
        dot: 'bg-amber-400',
        bg: 'bg-amber-500/5',
        border: 'border-amber-500/20',
        ring: 'ring-amber-400/20',
    },
    done: {
        label: 'Closed',
        color: 'text-emerald-600 dark:text-emerald-400',
        dot: 'bg-emerald-400',
        bg: 'bg-emerald-500/5',
        border: 'border-emerald-500/20',
        ring: 'ring-emerald-400/20',
    },
    cancelled: {
        label: 'Void',
        color: 'text-rose-600 dark:text-rose-400',
        dot: 'bg-rose-400',
        bg: 'bg-rose-500/5',
        border: 'border-rose-500/20',
        ring: 'ring-rose-400/20',
    },
};

/* ------------------------------------------------------------------ */
/*  Tab Button                                                          */
/* ------------------------------------------------------------------ */
const TabButton = memo(({ active, label, count, onClick, dot }) => (
    <button
        onClick={onClick}
        className={`relative flex items-center gap-2 px-3 py-2 sm:px-4 sm:py-2.5 rounded-lg transition-all duration-200 ${
            active
                ? 'bg-[#0d3542] dark:bg-[#58a6ff] text-white dark:text-black shadow-sm'
                : 'text-gray-500 dark:text-[#8b949e] hover:bg-black/5 dark:hover:bg-white/5'
        }`}
    >
        {dot && (
            <span className={`w-1.5 h-1.5 rounded-full ${active ? 'bg-white/60' : dot}`} />
        )}
        <span className="text-[10px] font-bold uppercase tracking-widest">{label}</span>
        {count > 0 && (
            <span className={`px-1.5 py-0.5 rounded text-[9px] font-bold ${
                active
                    ? 'bg-white/20 dark:bg-black/20'
                    : 'bg-black/5 dark:bg-white/10'
            }`}>
                {count}
            </span>
        )}
    </button>
));

/* ------------------------------------------------------------------ */
/*  Empty State                                                         */
/* ------------------------------------------------------------------ */
const EmptyState = memo(({ tab }) => (
    <div className="flex flex-col items-center justify-center py-20 text-center">
        <div className="w-16 h-16 rounded-2xl bg-black/[0.02] dark:bg-white/[0.02] flex items-center justify-center mb-4">
            <Filter size={24} className="text-gray-300 dark:text-[#8b949e]/30" />
        </div>
        <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-gray-400 dark:text-[#8b949e]/40">
            No {activeTabLabel(tab)} records
        </p>
    </div>
));

const activeTabLabel = (tab) => {
    const labels = { pending: 'active', done: 'closed', cancelled: 'void' };
    return labels[tab] || tab;
};

/* ------------------------------------------------------------------ */
/*  Appointment Card (Pending — large card view)                       */
/* ------------------------------------------------------------------ */
const AppointmentCard = memo(({ appointment, onUpdateStatus, closingId }) => {
    const status = STATUS_DATA[appointment.status] || STATUS_DATA.pending;
    const isClosing = closingId === appointment.id;

    return (
        <motion.div
            layout="position"
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.97 }}
            transition={{ duration: 0.25 }}
            className="group bg-white dark:bg-[#161b22] border border-black/[0.06] dark:border-[#30363d] rounded-2xl overflow-hidden hover:border-[#0d3542]/15 dark:hover:border-[#58a6ff]/15 transition-all duration-300"
        >
            {/* Top accent bar */}
            <div className={`h-1 ${status.bg}`} style={{ background: `linear-gradient(90deg, var(--tw-gradient-stops))` }}>
                <div className={`h-full w-1/3 ${status.dot.replace('bg-', 'bg-')}`} style={{ opacity: 0.6 }} />
            </div>

            <div className="p-5 sm:p-6">
                {/* Header */}
                <div className="flex items-start gap-3 mb-5">
                    <div className="w-11 h-11 rounded-xl bg-black/[0.03] dark:bg-white/[0.03] flex items-center justify-center shrink-0 border border-black/5 dark:border-white/5">
                        <User size={18} className="text-gray-400 dark:text-[#8b949e]/40" />
                    </div>
                    <div className="flex-1 min-w-0">
                        <h3 className="text-base font-bold text-gray-900 dark:text-[#c9d1d9] truncate leading-tight">
                            {appointment.name}
                        </h3>
                        <div className="flex items-center gap-2 mt-1 flex-wrap">
                            <span className="text-[9px] font-bold uppercase tracking-widest text-[#0d3542] dark:text-[#58a6ff] bg-[#0d3542]/5 dark:bg-[#58a6ff]/10 px-2 py-0.5 rounded">
                                {appointment.service}
                            </span>
                            <span className="text-[9px] text-gray-400 dark:text-[#8b949e]/40 font-mono">
                                #{appointment.id}
                            </span>
                        </div>
                    </div>
                    <div className={`w-2 h-2 rounded-full shrink-0 mt-1.5 ${status.dot}`} />
                </div>

                {/* Info grid */}
                <div className="grid grid-cols-2 gap-x-4 gap-y-3 mb-5">
                    <InfoCell icon={<Calendar size={12} />} label="Date" value={new Date(appointment.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })} />
                    <InfoCell icon={<Clock size={12} />} label="Time" value={formatTime(appointment.time)} />
                    <InfoCell icon={<Phone size={12} />} label="Phone" value={appointment.phone} />
                    <InfoCell icon={<Mail size={12} />} label="Email" value={appointment.email} truncate />
                </div>

                {/* Message */}
                {appointment.message && (
                    <div className="bg-black/[0.02] dark:bg-white/[0.02] rounded-xl p-3.5 border border-black/[0.04] dark:border-white/[0.04] mb-5">
                        <p className="text-[12px] text-gray-600 dark:text-[#8b949e] leading-relaxed italic line-clamp-3">
                            "{appointment.message}"
                        </p>
                    </div>
                )}

                {/* Reference images */}
                {appointment.favorite_item_image_url?.length > 0 && (
                    <div className="mb-5">
                        <span className="text-[9px] font-bold text-gray-400 uppercase tracking-widest mb-2 block">
                            Reference
                        </span>
                        <div className="flex gap-2 overflow-x-auto no-scrollbar pb-1">
                            {appointment.favorite_item_image_url.map((item, idx) => {
                                const imageUrl = typeof item === 'object' ? item.image : item;
                                return (
                                    <div key={idx} className="shrink-0 w-12 h-12 rounded-lg border border-black/5 dark:border-white/5 overflow-hidden">
                                        <OptimizedImage src={imageUrl} alt={`Ref ${idx}`} containerClassName="w-full h-full" className="w-full h-full object-cover" />
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                )}

                {/* Actions */}
                <div className="flex items-center gap-2 pt-4 border-t border-black/[0.04] dark:border-white/[0.04]">
                    <button
                        onClick={() => onUpdateStatus(appointment.id, 'cancelled')}
                        className="flex-1 px-3 py-2.5 text-[10px] font-bold uppercase tracking-widest text-gray-400 hover:text-rose-500 hover:bg-rose-500/5 rounded-lg transition-all"
                    >
                        Void
                    </button>
                    <button
                        onClick={() => onUpdateStatus(appointment.id, 'done')}
                        disabled={isClosing}
                        className="flex-1 px-3 py-2.5 bg-[#0d3542] dark:bg-[#58a6ff] text-white dark:text-black rounded-lg text-[10px] font-bold uppercase tracking-widest hover:opacity-90 active:scale-[0.98] transition-all disabled:opacity-50 flex items-center justify-center gap-2"
                    >
                        {isClosing ? (
                            <><Loader2 className="animate-spin" size={12} /> <span className="hidden sm:inline">Closing…</span></>
                        ) : (
                            <><Check size={12} /> <span className="hidden sm:inline">Close</span></>
                        )}
                    </button>
                </div>
            </div>
        </motion.div>
    );
});

/* ------------------------------------------------------------------ */
/*  Info Cell                                                           */
/* ------------------------------------------------------------------ */
const InfoCell = memo(({ icon, label, value, truncate }) => (
    <div className="flex items-start gap-2.5 min-w-0">
        <div className="w-6 h-6 rounded-md bg-black/[0.03] dark:bg-white/[0.03] flex items-center justify-center shrink-0 text-gray-400 dark:text-[#8b949e]/40 mt-0.5">
            {icon}
        </div>
        <div className="min-w-0 flex-1">
            <span className="text-[9px] font-bold text-gray-400 dark:text-[#8b949e]/40 uppercase tracking-widest block leading-none mb-1">
                {label}
            </span>
            <span className={`text-[12px] font-medium text-gray-900 dark:text-[#c9d1d9] leading-tight block ${truncate ? 'truncate' : ''}`}>
                {value || <span className="text-gray-300 dark:text-[#8b949e]/20">—</span>}
            </span>
        </div>
    </div>
));

/* ------------------------------------------------------------------ */
/*  History / Void Row (compact list view)                              */
/* ------------------------------------------------------------------ */
const AppointmentHistoryRow = memo(({ appointment }) => {
    const status = STATUS_DATA[appointment.status] || STATUS_DATA.pending;

    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="group flex items-center gap-3 sm:gap-4 px-4 sm:px-5 py-3.5 border-b border-black/[0.04] dark:border-white/[0.04] hover:bg-black/[0.015] dark:hover:bg-white/[0.015] transition-colors"
        >
            {/* Avatar */}
            <div className="w-9 h-9 rounded-lg bg-black/[0.03] dark:bg-white/[0.03] flex items-center justify-center shrink-0 border border-black/5 dark:border-white/5">
                <User size={14} className="text-gray-400 dark:text-[#8b949e]/40" />
            </div>

            {/* Name + Service */}
            <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                    <h4 className="text-[13px] font-bold text-gray-900 dark:text-[#c9d1d9] truncate">
                        {appointment.name}
                    </h4>
                    <span className="hidden sm:inline text-[9px] font-bold uppercase tracking-widest text-[#0d3542] dark:text-[#58a6ff] bg-[#0d3542]/5 dark:bg-[#58a6ff]/10 px-1.5 py-0.5 rounded shrink-0">
                        {appointment.service}
                    </span>
                </div>
                <div className="flex items-center gap-3 text-[10px] text-gray-400 dark:text-[#8b949e]/50 mt-0.5">
                    <span className="flex items-center gap-1">
                        <Calendar size={10} className="opacity-40" />
                        {new Date(appointment.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                    </span>
                    <span className="flex items-center gap-1">
                        <Clock size={10} className="opacity-40" />
                        {formatTime(appointment.time)}
                    </span>
                </div>
            </div>

            {/* Contact (desktop) */}
            <div className="hidden md:block text-right min-w-[120px]">
                {appointment.phone && (
                    <p className="text-[10px] text-gray-500 dark:text-[#8b949e]/60 font-medium">{appointment.phone}</p>
                )}
                {appointment.email && (
                    <p className="text-[10px] text-gray-400 dark:text-[#8b949e]/40 truncate max-w-[140px]">{appointment.email}</p>
                )}
            </div>

            {/* Status badge */}
            <div className={`px-2.5 py-1 rounded-full text-[9px] font-bold uppercase tracking-widest border shrink-0 ${status.color} ${status.bg} ${status.border}`}>
                {status.label}
            </div>

            {/* Arrow */}
            <ChevronRight size={14} className="text-gray-300 dark:text-[#8b949e]/20 opacity-0 group-hover:opacity-100 transition-opacity shrink-0 hidden sm:block" />
        </motion.div>
    );
});

/* ------------------------------------------------------------------ */
/*  Loading Skeleton                                                    */
/* ------------------------------------------------------------------ */
const LoadingState = () => (
    <div className="py-24 flex flex-col items-center justify-center gap-3">
        <LumaSpin size="lg" />
        <p className="text-[10px] font-bold uppercase tracking-[0.3em] text-gray-400 dark:text-[#8b949e]/40">
            Loading appointments…
        </p>
    </div>
);

/* ------------------------------------------------------------------ */
/*  Input Field                                                         */
/* ------------------------------------------------------------------ */
const InputField = memo(({ label, type = 'text', icon, ...props }) => (
    <div className="flex flex-col gap-2">
        <label className="text-[9px] font-bold text-gray-400 dark:text-[#8b949e]/50 uppercase tracking-widest flex items-center gap-1.5">
            {icon && <span className="opacity-40">{icon}</span>}
            {label}
        </label>
        <input
            type={type}
            {...props}
            className="h-11 px-3.5 bg-black/[0.02] dark:bg-white/[0.02] text-[13px] font-medium text-gray-900 dark:text-[#c9d1d9] border border-black/[0.06] dark:border-white/[0.06] rounded-lg outline-none focus:border-[#0d3542]/40 dark:focus:border-[#58a6ff]/40 transition-colors placeholder:text-gray-300 dark:placeholder:text-[#8b949e]/20"
        />
    </div>
));

/* ------------------------------------------------------------------ */
/*  Main Component                                                      */
/* ------------------------------------------------------------------ */
const AppointmentManager = () => {
    const {
        appointments,
        appointmentsLoading,
        appointmentsPagination,
        updateAppointmentStatus,
        clearClosedAppointments,
        createAppointment,
    } = useAdmin();

    const [activeTab, setActiveTab] = useState('pending');
    const [visibleCount, setVisibleCount] = useState(12);
    const [isAdding, setIsAdding] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [closingId, setClosingId] = useState(null);
    const [formData, setFormData] = useState({
        name: '', email: '', phone: '', service: 'consultation',
        date: new Date().toISOString().split('T')[0],
        time: new Date().toTimeString().slice(0, 5),
        message: '',
    });

    const { toast } = useToast();
    const { confirm } = useConfirm();

    const handleInputChange = useCallback((e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    }, []);

    const handleCreateAppointment = useCallback(async (e) => {
        e.preventDefault();
        setIsSubmitting(true);
        try {
            await createAppointment(formData);
            setIsAdding(false);
            setFormData({ name: '', email: '', phone: '', service: 'consultation', date: new Date().toISOString().split('T')[0], time: new Date().toTimeString().slice(0, 5), message: '' });
            toast.success('Appointment created');
        } catch (err) {
            toast.error(err.response?.data?.message || 'Failed to create appointment.');
        } finally {
            setIsSubmitting(false);
        }
    }, [formData, createAppointment, toast]);

    const handleUpdateStatus = useCallback(async (id, status) => {
        setClosingId(id);
        try {
            await updateAppointmentStatus(id, status);
            toast.success('Status updated');
        } catch {
            toast.error('Failed to update status.');
        } finally {
            setClosingId(null);
        }
    }, [updateAppointmentStatus, toast]);

    const handleClearHistory = useCallback(async () => {
        const ok = await confirm({
            title: 'Clear closed & void records?',
            message: 'This action is IRREVERSIBLE — all cleared appointment history will be permanently deleted.',
            confirmLabel: 'Clear history',
            cancelLabel: 'Keep records',
            danger: true,
        });
        if (!ok) return;
        try {
            await clearClosedAppointments();
            toast.success('History cleared');
        } catch {
            toast.error('Failed to clear records.');
        }
    }, [clearClosedAppointments, confirm, toast]);

    /* ---- Filtered data ---- */
    const tabFilteredAppointments = useMemo(() => {
        return (appointments || []).filter(app => app.status === activeTab);
    }, [appointments, activeTab]);

    const visibleAppointments = useMemo(() => {
        return tabFilteredAppointments.slice(0, visibleCount);
    }, [tabFilteredAppointments, visibleCount]);

    const stats = useMemo(() => {
        const apts = appointments || [];
        return {
            pending: apts.filter(a => a.status === 'pending').length,
            done: apts.filter(a => a.status === 'done').length,
            cancelled: apts.filter(a => a.status === 'cancelled').length,
        };
    }, [appointments]);

    const isPending = activeTab === 'pending';

    return (
        <div className="space-y-6 pb-16 max-w-[1100px] mx-auto px-4 sm:px-6 mt-4">
            {/* ---- Header ---- */}
            <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
                <div>
                    <h1 className="text-2xl sm:text-3xl font-serif text-gray-900 dark:text-[#c9d1d9] tracking-tight">
                        Appointments
                    </h1>
                    <p className="text-[10px] text-gray-400 dark:text-[#8b949e]/50 font-bold uppercase tracking-[0.3em] mt-1">
                        {appointmentsPagination.total} total entries
                    </p>
                </div>

                <div className="flex items-center gap-2 flex-wrap">
                    <TabButton
                        active={activeTab === 'pending'}
                        onClick={() => { setActiveTab('pending'); setVisibleCount(12); }}
                        label="Active"
                        count={stats.pending}
                        dot="bg-amber-400"
                    />
                    <TabButton
                        active={activeTab === 'done'}
                        onClick={() => { setActiveTab('done'); setVisibleCount(12); }}
                        label="Closed"
                        count={stats.done}
                        dot="bg-emerald-400"
                    />
                    <TabButton
                        active={activeTab === 'cancelled'}
                        onClick={() => { setActiveTab('cancelled'); setVisibleCount(12); }}
                        label="Void"
                        count={stats.cancelled}
                        dot="bg-rose-400"
                    />
                </div>
            </div>

            {/* ---- Action bar ---- */}
            <div className="flex items-center justify-between">
                <p className="text-[10px] font-bold uppercase tracking-widest text-gray-400 dark:text-[#8b949e]/40">
                    {tabFilteredAppointments.length} {activeTabLabel(activeTab)} record{tabFilteredAppointments.length !== 1 ? 's' : ''}
                </p>
                <div className="flex items-center gap-2">
                    <button
                        onClick={() => setIsAdding(true)}
                        className="flex items-center gap-2 h-9 px-4 bg-[#0d3542] dark:bg-[#58a6ff] text-white dark:text-black rounded-lg text-[10px] font-bold uppercase tracking-widest hover:opacity-90 active:scale-[0.97] transition-all"
                    >
                        <Plus size={14} />
                        <span className="hidden sm:inline">New</span>
                    </button>
                    <button
                        onClick={handleClearHistory}
                        className="h-9 w-9 flex items-center justify-center rounded-lg bg-black/[0.03] dark:bg-white/[0.03] border border-black/[0.06] dark:border-white/[0.06] text-gray-400 hover:text-rose-500 hover:border-rose-500/20 transition-all active:scale-95"
                        title="Clear closed & void records"
                    >
                        <Trash2 size={15} />
                    </button>
                </div>
            </div>

            {/* ---- Content ---- */}
            {appointmentsLoading && (appointments || []).length === 0 ? (
                <LoadingState />
            ) : tabFilteredAppointments.length === 0 ? (
                <EmptyState tab={activeTab} />
            ) : isPending ? (
                /* ---- Pending: Card grid ---- */
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <AnimatePresence mode="popLayout">
                        {visibleAppointments.map(app => {
                            let imageUrls = [];
                            try {
                                if (typeof app.favorite_item_image_url === 'string') {
                                    const parsed = JSON.parse(app.favorite_item_image_url);
                                    imageUrls = Array.isArray(parsed) ? parsed : [];
                                } else if (Array.isArray(app.favorite_item_image_url)) {
                                    imageUrls = app.favorite_item_image_url;
                                }
                            } catch { /* ignore */ }
                            return (
                                <AppointmentCard
                                    key={app.id}
                                    appointment={{ ...app, favorite_item_image_url: imageUrls }}
                                    onUpdateStatus={handleUpdateStatus}
                                    closingId={closingId}
                                />
                            );
                        })}
                    </AnimatePresence>
                </div>
            ) : (
                /* ---- Done / Void: Compact list ---- */
                <div className="bg-white dark:bg-[#161b22] rounded-2xl border border-black/[0.06] dark:border-[#30363d] overflow-hidden">
                    {/* Table header (desktop) */}
                    <div className="hidden md:flex items-center gap-4 px-5 py-2.5 text-[9px] font-bold uppercase tracking-widest text-gray-400 dark:text-[#8b949e]/50 border-b border-black/[0.04] dark:border-white/[0.04] bg-black/[0.01] dark:bg-white/[0.01]">
                        <div className="w-9" />
                        <div className="flex-1">Customer</div>
                        <div className="w-[140px] text-right">Contact</div>
                        <div className="w-[80px] text-center">Status</div>
                        <div className="w-4" />
                    </div>
                    <AnimatePresence mode="popLayout">
                        {visibleAppointments.map(app => {
                            let imageUrls = [];
                            try {
                                if (typeof app.favorite_item_image_url === 'string') {
                                    const parsed = JSON.parse(app.favorite_item_image_url);
                                    imageUrls = Array.isArray(parsed) ? parsed : [];
                                } else if (Array.isArray(app.favorite_item_image_url)) {
                                    imageUrls = app.favorite_item_image_url;
                                }
                            } catch { /* ignore */ }
                            return (
                                <AppointmentHistoryRow
                                    key={app.id}
                                    appointment={{ ...app, favorite_item_image_url: imageUrls }}
                                />
                            );
                        })}
                    </AnimatePresence>
                </div>
            )}

            {/* ---- Load more ---- */}
            {tabFilteredAppointments.length > visibleCount && (
                <div className="flex justify-center pt-4">
                    <button
                        onClick={() => setVisibleCount(v => v + 12)}
                        className="flex items-center gap-2 px-6 py-3 text-[10px] font-bold uppercase tracking-[0.2em] text-gray-500 dark:text-[#8b949e] border border-black/[0.06] dark:border-white/[0.06] rounded-full hover:bg-black/[0.02] dark:hover:bg-white/[0.02] transition-all"
                    >
                        <History size={14} className="text-[#0d3542] dark:text-[#58a6ff]" />
                        Load more
                    </button>
                </div>
            )}

            {/* ---- New Appointment Modal ---- */}
            <ModernModal isOpen={isAdding} onClose={() => setIsAdding(false)} title="New Appointment" maxWidth="max-w-lg">
                <form onSubmit={handleCreateAppointment} className="p-6 sm:p-8 space-y-6 bg-white dark:bg-[#0d1117]">
                    {/* Section: Customer */}
                    <div>
                        <SectionLabel icon={<User size={11} />} label="Customer" />
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-3">
                            <InputField label="Full Name *" name="name" value={formData.name} onChange={handleInputChange} placeholder="e.g. Jean-Luc" required icon={<User size={12} />} />
                            <InputField label="Email" type="email" name="email" value={formData.email} onChange={handleInputChange} placeholder="e.g. contact@bespoke.com" icon={<Mail size={12} />} />
                            <InputField label="Phone *" name="phone" value={formData.phone} onChange={handleInputChange} placeholder="e.g. +33 00 000 0000" required icon={<Phone size={12} />} />
                            <div className="flex flex-col gap-2">
                                <label className="text-[9px] font-bold text-gray-400 dark:text-[#8b949e]/50 uppercase tracking-widest flex items-center gap-1.5">
                                    <Sparkles size={11} className="opacity-40" />
                                    Service *
                                </label>
                                <Select value={formData.service} onValueChange={(val) => setFormData(prev => ({ ...prev, service: val }))}>
                                    <SelectTrigger className="h-11 bg-black/[0.02] dark:bg-white/[0.02] border border-black/[0.06] dark:border-white/[0.06] rounded-lg px-3.5 text-[12px] font-medium focus:ring-0 focus:border-[#0d3542]/40 dark:focus:border-[#58a6ff]/40">
                                        <SelectValue placeholder="Select Service" />
                                    </SelectTrigger>
                                    <SelectContent className="rounded-xl border-black/10 dark:border-white/10 bg-white/95 dark:bg-[#0d1117]/95 backdrop-blur-xl">
                                        <SelectItem value="consultation" className="text-[11px] font-medium p-2.5">Consultation</SelectItem>
                                        <SelectItem value="fitting" className="text-[11px] font-medium p-2.5">Fitting Session</SelectItem>
                                        <SelectItem value="pickup" className="text-[11px] font-medium p-2.5">Order Pickup</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>
                    </div>

                    {/* Section: Scheduling */}
                    <div>
                        <SectionLabel icon={<Calendar size={11} />} label="Scheduling" />
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-3">
                            <div className="flex flex-col gap-2">
                                <label className="text-[9px] font-bold text-gray-400 dark:text-[#8b949e]/50 uppercase tracking-widest flex items-center gap-1.5">
                                    <Calendar size={11} className="opacity-40" />
                                    Date *
                                </label>
                                <DatePicker
                                    required
                                    name="date"
                                    value={formData.date}
                                    onChange={(e) => setFormData(prev => ({ ...prev, date: e.target.value }))}
                                    inputClassName="h-11 bg-black/[0.02] dark:bg-white/[0.02] border border-black/[0.06] dark:border-white/[0.06] rounded-lg"
                                />
                            </div>
                            <div className="flex flex-col gap-2">
                                <label className="text-[9px] font-bold text-gray-400 dark:text-[#8b949e]/50 uppercase tracking-widest flex items-center gap-1.5">
                                    <Clock size={11} className="opacity-40" />
                                    Time *
                                </label>
                                <TimePicker
                                    use12HourFormat
                                    value={formData.time ? parse(formData.time, 'HH:mm', new Date()) : new Date()}
                                    onChange={(date) => setFormData(prev => ({ ...prev, time: format(date, 'HH:mm') }))}
                                    className="h-11 bg-black/[0.02] dark:bg-white/[0.02] border border-black/[0.06] dark:border-white/[0.06] rounded-lg"
                                />
                            </div>
                        </div>
                    </div>

                    {/* Notes */}
                    <div className="flex flex-col gap-2">
                        <label className="text-[9px] font-bold text-gray-400 dark:text-[#8b949e]/50 uppercase tracking-widest flex items-center gap-1.5">
                            <MessageSquare size={11} className="opacity-40" />
                            Notes
                        </label>
                        <textarea
                            name="message"
                            value={formData.message}
                            onChange={handleInputChange}
                            rows={3}
                            className="bg-black/[0.02] dark:bg-white/[0.02] p-3.5 text-[12px] font-medium text-gray-900 dark:text-[#c9d1d9] border border-black/[0.06] dark:border-white/[0.06] rounded-lg outline-none focus:border-[#0d3542]/40 dark:focus:border-[#58a6ff]/40 transition-colors resize-none placeholder:text-gray-300 dark:placeholder:text-[#8b949e]/20"
                            placeholder="Any specific requirements…"
                        />
                    </div>

                    {/* Actions */}
                    <div className="flex items-center justify-end gap-3 pt-4 border-t border-black/[0.05] dark:border-white/[0.05]">
                        <button
                            type="button"
                            onClick={() => setIsAdding(false)}
                            className="px-5 py-2.5 text-[10px] font-bold uppercase tracking-widest text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={isSubmitting}
                            className="h-10 px-6 bg-[#0d3542] dark:bg-[#58a6ff] text-white dark:text-black rounded-lg text-[10px] font-bold uppercase tracking-widest hover:opacity-90 active:scale-[0.97] transition-all disabled:opacity-50 flex items-center gap-2"
                        >
                            {isSubmitting ? <Loader2 className="animate-spin" size={14} /> : <Check size={14} />}
                            Confirm
                        </button>
                    </div>
                </form>
            </ModernModal>
        </div>
    );
};

/* ------------------------------------------------------------------ */
/*  Section Label (for modal)                                           */
/* ------------------------------------------------------------------ */
const SectionLabel = memo(({ icon, label }) => (
    <div className="flex items-center gap-2">
        <div className="h-px flex-1 bg-black/[0.06] dark:bg-white/[0.06]" />
        <span className="text-[9px] font-bold uppercase tracking-[0.3em] text-gray-400 dark:text-[#8b949e]/50 flex items-center gap-1.5">
            {icon}
            {label}
        </span>
        <div className="h-px flex-1 bg-black/[0.06] dark:bg-white/[0.06]" />
    </div>
));

export default AppointmentManager;
