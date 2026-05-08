import React, { useState, useEffect, useCallback, useMemo, memo } from 'react';
import { 
    User, Mail, Phone, Calendar, Clock, MessageSquare, 
    AlertTriangle, Check, X, Trash2, ChevronDown, Plus, 
    Filter, ArrowUpRight, History, Tag as TagIcon
} from 'lucide-react';
import { LumaSpin } from '@/components/ui/luma-spin';
import { Button } from '@/components/ui/button';
import { useAdmin } from './AdminContext';
import OptimizedImage from '../../common/OptimizedImage.jsx';
import { motion, AnimatePresence } from 'framer-motion';
import ModernModal from '../../common/ModernModal';
import { formatTime } from '@/helpers/format';
import DatePicker from '@/components/ui/DatePicker';
import { TimePicker } from '@/components/ui/time-picker';
import { 
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { format, parse } from 'date-fns';

/**
 * --- Status Labels ---
 * Using theme-aligned subtle accents.
 */
const STATUS_DATA = {
    pending: { label: 'Active', color: 'text-amber-600 dark:text-amber-400', bg: 'bg-amber-400/5', border: 'border-amber-400/10' },
    done: { label: 'Closed', color: 'text-emerald-600 dark:text-emerald-400', bg: 'bg-emerald-400/5', border: 'border-emerald-400/10' },
    cancelled: { label: 'Void', color: 'text-rose-600 dark:text-rose-400', bg: 'bg-rose-400/5', border: 'border-rose-400/10' },
};

/**
 * --- History Row ---
 */
const AppointmentHistoryRow = memo(({ appointment }) => {
    const status = STATUS_DATA[appointment.status] || STATUS_DATA.pending;

    return (
        <motion.div 
            initial={{ opacity: 0, y: 3 }}
            animate={{ opacity: 1, y: 0 }}
            className="group flex items-center gap-4 px-6 py-4 border-b border-black/5 dark:border-white/5 hover:bg-black/[0.01] dark:hover:bg-white/[0.01] transition-all"
        >
            <div className="w-10 h-10 rounded-full bg-black/[0.03] dark:bg-black flex items-center justify-center shrink-0 border border-black/5 dark:border-white/5">
                <User size={16} className="text-gray-400 dark:text-[#8b949e]/40" />
            </div>
            
            <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-0.5">
                    <h4 className="text-[14px] font-bold text-gray-900 dark:text-[#c9d1d9] truncate">
                        {appointment.name}
                    </h4>
                    <span className="text-[9px] font-black uppercase tracking-widest text-[#0d3542] dark:text-[#58a6ff] bg-[#0d3542]/5 dark:bg-[#58a6ff]/10 px-2 py-0.5 rounded">
                        {appointment.service}
                    </span>
                </div>
                <div className="flex items-center gap-4 text-[11px] text-gray-500 dark:text-[#8b949e]/60 font-medium">
                    <span className="flex items-center gap-1.5"><Calendar size={12} className="opacity-40" /> {new Date(appointment.date).toLocaleDateString()}</span>
                    <span className="flex items-center gap-1.5"><Clock size={12} className="opacity-40" /> {formatTime(appointment.time)}</span>
                </div>
            </div>

            <div className="hidden lg:flex flex-col text-right px-6">
                <p className="text-[10px] text-gray-400 dark:text-[#8b949e]/40 truncate">{appointment.email}</p>
                <p className="text-[10px] text-gray-500 font-bold tracking-widest">{appointment.phone}</p>
            </div>

            <div className={`px-4 py-1.5 rounded-full text-[9px] font-black uppercase tracking-widest border ${status.color} ${status.bg} ${status.border} min-w-[100px] text-center`}>
                {status.label}
            </div>
            
            <div className="w-10 flex justify-end">
                <ArrowUpRight size={14} className="text-gray-300 dark:text-[#8b949e]/20 opacity-0 group-hover:opacity-100 transition-opacity" />
            </div>
        </motion.div>
    );
});

/**
 * --- Active Record Card ---
 */
const AppointmentCard = memo(({ appointment, onUpdateStatus, closingId }) => {
    return (
        <motion.div 
            layout="position"
            initial={{ opacity: 0, scale: 0.99 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.98 }}
            className="group flex flex-col h-full relative bg-[#fdfdfc] dark:bg-[#161b22] border border-black/10 dark:border-[#30363d] rounded-[2rem] overflow-hidden transition-all duration-300 hover:border-[#0d3542]/20 dark:hover:border-[#58a6ff]/20 shadow-none"
        >
            <div className="p-8 flex-grow">
                {/* Header Context */}
                <div className="flex items-start justify-between mb-8">
                    <div className="flex items-center gap-6">
                        <div className="w-14 h-14 rounded-2xl bg-black/[0.02] dark:bg-[#0d1117] flex items-center justify-center border border-black/5 dark:border-[#30363d]">
                            <User size={24} className="text-gray-300 dark:text-[#8b949e]/20" />
                        </div>
                        <div>
                            <h3 className="text-2xl font-serif text-gray-900 dark:text-[#c9d1d9] leading-tight">{appointment.name}</h3>
                            <div className="flex items-center gap-3 mt-1">
                                <span className="text-[10px] font-black uppercase tracking-widest text-[#0d3542] dark:text-[#58a6ff] bg-[#0d3542]/5 dark:bg-[#58a6ff]/10 px-2.5 py-0.5 rounded-full">
                                    {appointment.service}
                                </span>
                                <div className="h-1 w-1 rounded-full bg-gray-200 dark:bg-[#30363d]" />
                                <span className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">ID: {appointment.id}</span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Info Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-8 mb-8">
                    <div className="space-y-5">
                        <div className="flex items-center gap-4">
                            <div className="w-8 h-8 rounded-lg bg-black/[0.02] dark:bg-white/[0.02] flex items-center justify-center text-gray-400">
                                <Calendar size={14} />
                            </div>
                            <div className="flex flex-col">
                                <span className="text-[9px] font-black text-gray-400 uppercase tracking-widest mb-0.5">Date</span>
                                <span className="text-[14px] font-bold text-gray-900 dark:text-[#c9d1d9]">
                                    {new Date(appointment.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                                </span>
                            </div>
                        </div>

                        <div className="flex items-center gap-4">
                            <div className="w-8 h-8 rounded-lg bg-black/[0.02] dark:bg-white/[0.02] flex items-center justify-center text-gray-400">
                                <Clock size={14} />
                            </div>
                            <div className="flex flex-col">
                                <span className="text-[9px] font-black text-gray-400 uppercase tracking-widest mb-0.5">Time</span>
                                <span className="text-[14px] font-bold text-gray-900 dark:text-[#c9d1d9]">{formatTime(appointment.time)}</span>
                            </div>
                        </div>
                    </div>

                    <div className="space-y-5">
                        <div className="flex items-center gap-4">
                            <div className="w-8 h-8 rounded-lg bg-black/[0.02] dark:bg-white/[0.02] flex items-center justify-center text-gray-400">
                                <Phone size={14} />
                            </div>
                            <div className="flex flex-col">
                                <span className="text-[9px] font-black text-gray-400 uppercase tracking-widest mb-0.5">Contact</span>
                                <span className="text-[14px] font-bold text-gray-900 dark:text-[#c9d1d9]">{appointment.phone}</span>
                            </div>
                        </div>
                        <div className="flex items-center gap-4">
                            <div className="w-8 h-8 rounded-lg bg-black/[0.02] dark:bg-white/[0.02] flex items-center justify-center text-gray-400">
                                <Mail size={14} />
                            </div>
                            <div className="flex flex-col min-w-0">
                                <span className="text-[9px] font-black text-gray-400 uppercase tracking-widest mb-0.5">Email</span>
                                <span className="text-[12px] font-medium text-gray-500 dark:text-[#8b949e] truncate">{appointment.email}</span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Content Section */}
                {(appointment.message || appointment.favorite_item_image_url?.length > 0) && (
                    <div className="space-y-6 pt-6 border-t border-black/5 dark:border-white/5">
                        {appointment.message && (
                            <div className="bg-[#fdfdfc] dark:bg-[#0d1117] p-5 rounded-2xl border border-black/5 dark:border-white/5">
                                <p className="text-[14px] text-gray-700 dark:text-[#c9d1d9] leading-relaxed italic">"{appointment.message}"</p>
                            </div>
                        )}

                        {appointment.favorite_item_image_url?.length > 0 && (
                            <div className="flex flex-col gap-3">
                                <span className="text-[9px] font-black text-gray-400 uppercase tracking-widest ml-1">Reference Selection</span>
                                <div className="flex gap-3 overflow-x-auto no-scrollbar py-1">
                                    {appointment.favorite_item_image_url.map((item, idx) => {
                                        const imageUrl = typeof item === 'object' ? item.image : item;
                                        return (
                                            <div key={idx} className="shrink-0 w-14 h-14 rounded-xl border border-black/5 dark:border-white/5 overflow-hidden transition-all duration-300 hover:scale-105 active:scale-95 cursor-pointer">
                                                <OptimizedImage
                                                    src={imageUrl}
                                                    alt={`Ref ${idx}`}
                                                    containerClassName="w-full h-full"
                                                    className="w-full h-full object-cover"
                                                />
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>
                        )}
                    </div>
                )}
            </div>

            {/* Actions Bar */}
            <div className="mt-auto p-4 bg-black/[0.02] dark:bg-black/40 border-t border-black/5 dark:border-white/5 flex items-center justify-between">
                <div className="flex items-center gap-2 pl-4">
                    <div className="w-1.5 h-1.5 rounded-full bg-[#0d3542]/20 dark:bg-[#58a6ff]/20 animate-pulse" />
                    <span className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-400">Quick Actions</span>
                </div>
                <div className="flex items-center gap-4">
                    <button 
                        onClick={() => onUpdateStatus(appointment.id, 'cancelled')}
                        className="px-5 py-2.5 text-[10px] font-black uppercase tracking-widest text-gray-400 hover:text-rose-500 transition-all rounded-xl"
                    >
                        Void Record
                    </button>
                    <button 
                        onClick={() => onUpdateStatus(appointment.id, 'done')}
                        disabled={closingId === appointment.id}
                        className="px-7 py-2.5 bg-[#0d3542] dark:bg-[#58a6ff] text-white dark:text-black rounded-xl text-[10px] font-black uppercase tracking-widest transition-all hover:scale-[1.02] active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {closingId === appointment.id ? (
                            <span className="flex items-center gap-2"><Loader2 className="animate-spin" size={12} /> Closing...</span>
                        ) : 'Close'}
                    </button>
                </div>
            </div>
        </motion.div>
    );
});

const LoadingState = () => (
    <div className="col-span-full py-32 flex flex-col items-center justify-center space-y-4">
        <LumaSpin size="xl" />
        <p className="text-[10px] font-black uppercase tracking-[0.4em] text-gray-400 dark:text-[#8b949e]/40">Gathering Appointments...</p>
    </div>
);

const AppointmentManager = () => {
    const { 
        appointments, 
        appointmentsLoading, 
        appointmentsPagination,
        updateAppointmentStatus, 
        clearClosedAppointments,
        createAppointment
    } = useAdmin();

    const [activeTab, setActiveTab] = useState('pending');
    const [visibleCount, setVisibleRows] = useState(12);
    const [isAdding, setIsAdding] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [closingId, setClosingId] = useState(null);
    const [formData, setFormData] = useState({
        name: '', email: '', phone: '', service: 'consultation', date: '', time: '', message: ''
    });

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleCreateAppointment = async (e) => {
        e.preventDefault();
        setIsSubmitting(true);
        try {
            await createAppointment(formData);
            setIsAdding(false);
            setFormData({ name: '', email: '', phone: '', service: 'consultation', date: '', time: '', message: '' });
        } catch (err) {
            alert(err.response?.data?.message || 'Failed to create appointment.');
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleUpdateStatus = async (id, status) => {
        setClosingId(id);
        try {
            await updateAppointmentStatus(id, status);
        } catch (err) {
            alert('Failed to update status.');
        } finally {
            setClosingId(null);
        }
    };

    const handleClearHistory = async () => {
        if (window.confirm('IRREVERSIBLE: Clear all history?')) {
            try {
                await clearClosedAppointments();
            } catch (err) {
                alert('Failed to clear records.');
            }
        }
    };

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

    return (
        <div className="space-y-10 pb-20 max-w-[1200px] mx-auto px-4 sm:px-6 mt-6">
            {/* Header */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-8 pb-8 border-b border-black/[0.08] dark:border-[#30363d]">
                <div className="space-y-1">
                    <h1 className="text-5xl font-serif text-gray-900 dark:text-[#c9d1d9] tracking-tight">Appointments</h1>
                    <p className="text-[12px] text-gray-500 dark:text-[#8b949e]/60 font-black uppercase tracking-[0.4em] ml-1">{appointmentsPagination.total} Entries Found</p>
                </div>

                <div className="flex flex-wrap items-center gap-4">
                    <div className="flex items-center p-1.5 bg-black/[0.03] dark:bg-white/[0.02] rounded-2xl border border-black/5 dark:border-white/5">
                        <TabButton 
                            active={activeTab === 'pending'} 
                            onClick={() => setActiveTab('pending')}
                            label="Active" 
                            count={stats.pending}
                            activeBg="bg-[#0d3542] dark:bg-[#58a6ff]"
                        />
                        <TabButton 
                            active={activeTab === 'done'} 
                            onClick={() => setActiveTab('done')}
                            label="History" 
                            count={stats.done}
                            activeBg="bg-[#0d3542] dark:bg-[#58a6ff]"
                        />
                        <TabButton 
                            active={activeTab === 'cancelled'} 
                            onClick={() => setActiveTab('cancelled')}
                            label="Void" 
                            count={stats.cancelled}
                            activeBg="bg-[#0d3542] dark:bg-[#58a6ff]"
                        />
                    </div>
                    
                    <button
                        onClick={() => setIsAdding(true)}
                        className="h-12 px-8 bg-[#0d3542] dark:bg-[#58a6ff] text-white dark:text-black rounded-2xl text-[11px] font-black uppercase tracking-widest hover:scale-[1.02] active:scale-95 transition-all"
                    >
                        New Appointment
                    </button>

                    <button
                        onClick={handleClearHistory}
                        className="w-12 h-12 flex items-center justify-center rounded-2xl bg-black/[0.03] dark:bg-white/[0.02] border border-black/5 dark:border-white/5 text-gray-400 hover:text-rose-500 transition-all active:scale-95"
                        title="Clear Records"
                    >
                        <Trash2 size={18} />
                    </button>
                </div>
            </div>

            {/* List */}
            {appointmentsLoading && (appointments || []).length === 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <LoadingState />
                </div>
            ) : tabFilteredAppointments.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-24 text-center opacity-40">
                    <Filter className="text-gray-300 dark:text-[#8b949e]/20 mb-6" size={32} />
                    <p className="text-[11px] font-black uppercase tracking-[0.2em] text-gray-500 dark:text-[#8b949e]/40">No records classified as '{activeTab}'</p>
                </div>
            ) : (
                <div className={activeTab === 'pending' ? "grid grid-cols-1 lg:grid-cols-2 gap-8" : "bg-[#fdfdfc] dark:bg-[#161b22]/40 rounded-3xl border border-black/10 dark:border-[#30363d] overflow-hidden shadow-none"}>
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
                            } catch (e) {}
                            
                            const enhancedApp = { ...app, favorite_item_image_url: imageUrls };

                            return activeTab === 'pending' ? (
                                <AppointmentCard 
                                    key={app.id} 
                                    appointment={enhancedApp} 
                                    onUpdateStatus={handleUpdateStatus}
                                    closingId={closingId}
                                />
                            ) : (
                                <AppointmentHistoryRow 
                                    key={app.id} 
                                    appointment={enhancedApp} 
                                />
                            );
                        })}
                    </AnimatePresence>
                </div>
            )}

            {tabFilteredAppointments.length > visibleCount && (
                <div className="flex justify-center mt-12 pb-20">
                    <button 
                        onClick={() => setVisibleRows(v => v + 12)}
                        className="group flex items-center gap-3 px-10 py-5 text-[11px] font-black uppercase tracking-[0.3em] text-gray-500 dark:text-[#8b949e] border border-black/5 dark:border-white/5 rounded-full hover:bg-black/[0.02] dark:hover:bg-white/[0.02] transition-all"
                    >
                        <History size={16} className="text-[#0d3542] dark:text-[#58a6ff]" />
                        Load More Entries
                    </button>
                </div>
            )}

            {/* Modal */}
            <ModernModal isOpen={isAdding} onClose={() => setIsAdding(false)} title="New Appointment" maxWidth="max-w-2xl">
                <form onSubmit={handleCreateAppointment} className="p-10 space-y-10 bg-[#fdfdfc] dark:bg-[#111111]">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-12 gap-y-10">
                        {/* Customer Identity Section */}
                        <div className="sm:col-span-2 flex items-center gap-3 mb-2">
                             <div className="h-px bg-black/5 dark:bg-white/5 flex-1" />
                             <span className="text-[9px] font-black uppercase tracking-[0.4em] text-gray-400">Customer Identity</span>
                             <div className="h-px bg-black/5 dark:bg-white/5 flex-1" />
                        </div>

                        <InputField 
                            label="Full Name *" 
                            name="name" 
                            value={formData.name} 
                            onChange={handleInputChange} 
                            placeholder="e.g. Jean-Luc" 
                            required 
                            icon={<User size={14} />}
                        />
                        <InputField 
                            label="Email Address" 
                            type="email" 
                            name="email" 
                            value={formData.email} 
                            onChange={handleInputChange} 
                            placeholder="e.g. contact@bespoke.com" 
                            icon={<Mail size={14} />}
                        />
                        <InputField 
                            label="Phone Number *" 
                            name="phone" 
                            value={formData.phone} 
                            onChange={handleInputChange} 
                            placeholder="e.g. +33 00 000 0000" 
                            required 
                            icon={<Phone size={14} />}
                        />
                        
                        <div className="flex flex-col gap-3">
                            <label className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] ml-1 flex items-center gap-2">
                                <TagIcon size={12} className="opacity-40" />
                                Service Type *
                            </label>
                            <Select 
                                value={formData.service} 
                                onValueChange={(val) => setFormData(prev => ({ ...prev, service: val }))}
                            >
                                <SelectTrigger className="h-14 bg-black/[0.03] dark:bg-white/[0.03] border-0 border-b border-black/10 dark:border-white/10 rounded-xl px-4 text-[13px] font-bold uppercase tracking-widest focus:ring-0 focus:ring-offset-0 focus:border-[#0d3542] dark:focus:border-[#58a6ff]">
                                    <SelectValue placeholder="Select Service" />
                                </SelectTrigger>
                                <SelectContent className="rounded-2xl border-black/10 dark:border-white/10 bg-white/95 dark:bg-[#0d1117]/95 backdrop-blur-xl">
                                    <SelectItem value="consultation" className="text-[11px] font-black uppercase tracking-widest p-3">Consultation</SelectItem>
                                    <SelectItem value="fitting" className="text-[11px] font-black uppercase tracking-widest p-3">Fitting session</SelectItem>
                                    <SelectItem value="pickup" className="text-[11px] font-black uppercase tracking-widest p-3">Order pickup</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>

                        {/* Timing Section */}
                        <div className="sm:col-span-2 flex items-center gap-3 mt-4 mb-2">
                             <div className="h-px bg-black/5 dark:bg-white/5 flex-1" />
                             <span className="text-[9px] font-black uppercase tracking-[0.4em] text-gray-400">Scheduling Details</span>
                             <div className="h-px bg-black/5 dark:bg-white/5 flex-1" />
                        </div>

                        <div className="flex flex-col gap-3">
                            <label className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] ml-1 flex items-center gap-2">
                                <Calendar size={12} className="opacity-40" />
                                Scheduled Date *
                            </label>
                            <DatePicker 
                                required
                                name="date"
                                value={formData.date}
                                onChange={(e) => setFormData(prev => ({ ...prev, date: e.target.value }))}
                                inputClassName="h-14 bg-black/[0.03] dark:bg-white/[0.03] border-0 border-b border-black/10 dark:border-white/10 rounded-xl py-0"
                            />
                        </div>
                        <div className="flex flex-col gap-3">
                            <label className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] ml-1 flex items-center gap-2">
                                <Clock size={12} className="opacity-40" />
                                Scheduled Time *
                            </label>
                            <TimePicker 
                                use12HourFormat={true}
                                value={formData.time ? parse(formData.time, 'HH:mm', new Date()) : new Date()}
                                onChange={(date) => setFormData(prev => ({ ...prev, time: format(date, 'HH:mm') }))}
                                className="h-14 bg-black/[0.03] dark:bg-white/[0.03] border-0 border-b border-black/10 dark:border-white/10 rounded-xl"
                            />
                        </div>
                        
                        <div className="sm:col-span-2 flex flex-col gap-3">
                            <label className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] ml-1 flex items-center gap-2">
                                <MessageSquare size={12} className="opacity-40" />
                                Notes / Instructions
                            </label>
                            <textarea 
                                name="message" 
                                value={formData.message} 
                                onChange={handleInputChange} 
                                rows="3" 
                                className="bg-black/[0.03] dark:bg-white/[0.03] p-5 text-[13px] font-medium border-0 border-b border-black/10 dark:border-white/10 outline-none focus:border-[#0d3542] dark:focus:border-[#58a6ff] transition-all rounded-2xl resize-none" 
                                placeholder="Any specific requirements for this session..."
                            ></textarea>
                        </div>
                    </div>

                    <div className="flex justify-end gap-6 pt-10 border-t border-black/5 dark:border-white/5">
                        <button type="button" onClick={() => setIsAdding(false)} className="px-8 py-4 text-[10px] font-black uppercase tracking-widest text-gray-400 hover:text-gray-900 transition-colors">Discard</button>
                        <button type="submit" disabled={isSubmitting} className="h-14 px-12 bg-[#0d3542] dark:bg-[#58a6ff] text-white dark:text-black rounded-2xl text-[11px] font-black uppercase tracking-widest transition-all active:scale-95">
                            {isSubmitting ? <Loader2 className="animate-spin" size={16} /> : 'Confirm Selection'}
                        </button>
                    </div>
                </form>
            </ModernModal>
        </div>
    );
};

const TabButton = ({ active, label, count, onClick, activeBg = "bg-white dark:bg-[#1c2128]" }) => (
    <button 
        onClick={onClick}
        className={`flex items-center gap-3 px-6 py-3 rounded-xl transition-all duration-300 ${active ? `${activeBg} border border-black/5 dark:border-white/5` : 'opacity-40 hover:opacity-100 hover:bg-black/5 dark:hover:bg-white/5'}`}
    >
        <span className={`text-[10px] font-black uppercase tracking-[0.2em] ${active ? 'text-white dark:text-black' : 'text-gray-500'}`}>{label}</span>
        {count > 0 && (
            <span className={`px-2 py-0.5 rounded-lg text-[9px] font-black ${active ? 'bg-white/20 dark:bg-black/20 text-white dark:text-black' : 'bg-gray-200 dark:bg-white/10 text-gray-500'}`}>
                {count}
            </span>
        )}
    </button>
);

const InputField = ({ label, type = "text", icon, ...props }) => (
    <div className="flex flex-col gap-3">
        <label className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] ml-1 flex items-center gap-2">
            {icon && <span className="opacity-40">{icon}</span>}
            {label}
        </label>
        <input 
            type={type} 
            {...props} 
            className="bg-black/[0.03] dark:bg-white/[0.03] h-14 px-4 text-[13px] font-bold border-b border-black/10 dark:border-white/10 outline-none focus:border-[#0d3542] dark:focus:border-[#58a6ff] transition-all rounded-xl placeholder:text-gray-300 dark:placeholder:text-[#8b949e]/20" 
        />
    </div>
);

export default AppointmentManager;
