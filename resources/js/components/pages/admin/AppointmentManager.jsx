import React, { useState, useEffect, useCallback, useMemo, memo } from 'react';
import { User, Mail, Phone, Calendar, Clock, MessageSquare, AlertTriangle, Loader, Check, X, Trash2, ChevronDown } from 'lucide-react';
import { useAdmin } from './AdminContext';
import OptimizedImage from '../../common/OptimizedImage.jsx';
import Skeleton from '../../common/Skeleton.jsx';
import { motion, AnimatePresence } from 'framer-motion';

const AppointmentRow = ({ appointment, onUpdateStatus }) => {
    const statusConfig = {
        pending: { label: 'Pending', color: 'text-yellow-600 dark:text-yellow-400', bg: 'bg-yellow-400/10', border: 'border-yellow-400/20' },
        done: { label: 'Completed', color: 'text-green-600 dark:text-green-400', bg: 'bg-green-400/10', border: 'border-green-400/20' },
        cancelled: { label: 'Cancelled', color: 'text-red-600 dark:text-red-400', bg: 'bg-red-400/10', border: 'border-red-400/20' },
    };

    const status = statusConfig[appointment.status] || statusConfig.pending;

    const formatTime = (timeStr) => {
        if (!timeStr) return '';
        const [hours] = timeStr.split(':');
        let h = parseInt(hours, 10);
        const ampm = h >= 12 ? 'PM' : 'AM';
        h = h % 12;
        h = h ? h : 12;
        return `${h}${ampm}`;
    };

    return (
        <motion.div 
            layout="position"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className={`p-6 rounded-3xl backdrop-blur-xl bg-white dark:bg-black/20 border border-black/5 dark:border-white/10 shadow-lg dark:shadow-none transition-all duration-300 hover:bg-gray-50 dark:hover:bg-black/30 hover:border-black/10 dark:hover:border-white/20 group`}
        >
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 mb-4 border-b border-black/5 dark:border-white/5">
                <div className="flex items-center gap-4">
                    <div className="h-12 w-12 rounded-full bg-black/5 dark:bg-white/5 flex items-center justify-center border border-black/5 dark:border-white/5">
                        <User className="w-5 h-5 text-gray-400 dark:text-attire-silver group-hover:text-attire-accent transition-colors" />
                    </div>
                    <div>
                        <h3 className="text-xl font-serif text-gray-900 dark:text-white">{appointment.name}</h3>
                        <p className="text-xs text-gray-500 dark:text-attire-silver/60 uppercase tracking-wider font-medium">{appointment.service}</p>
                    </div>
                </div>
                <span className={`px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider border ${status.color} ${status.bg} ${status.border}`}>
                    {status.label}
                </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
                <div className="md:col-span-4 space-y-3">
                    <div className="flex items-center text-gray-600 dark:text-attire-silver/80 group-hover:text-gray-900 dark:group-hover:text-white transition-colors">
                        <Mail className="w-4 h-4 mr-3 text-gray-400 dark:text-attire-silver/40" />
                        <a href={`mailto:${appointment.email}`} className="hover:text-attire-accent hover:underline truncate text-sm transition-colors">{appointment.email}</a>
                    </div>
                    <div className="flex items-center text-gray-600 dark:text-attire-silver/80 group-hover:text-gray-900 dark:group-hover:text-white transition-colors">
                        <Phone className="w-4 h-4 mr-3 text-gray-400 dark:text-attire-silver/40" />
                        <span className="text-sm">{appointment.phone}</span>
                    </div>
                    <div className="flex items-center text-gray-600 dark:text-attire-silver/80 pt-3 border-t border-black/5 dark:border-white/5 mt-3">
                        <Calendar className="w-4 h-4 mr-3 text-gray-400 dark:text-attire-silver/40" />
                        <span className="text-sm font-medium text-gray-900 dark:text-white">{new Date(appointment.date).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })} <span className="text-black/10 dark:text-white/20 mx-1">|</span> {formatTime(appointment.time)}</span>
                    </div>
                </div>

                <div className="md:col-span-8 space-y-4">
                    {appointment.message && (
                        <div className="bg-black/5 dark:bg-white/5 p-4 rounded-xl border border-black/5 dark:border-white/5">
                            <div className="flex items-start gap-3">
                                <MessageSquare className="w-4 h-4 text-attire-accent mt-1 flex-shrink-0" />
                                <div>
                                    <p className="text-xs font-bold text-gray-400 dark:text-attire-silver/50 uppercase tracking-widest mb-1">Request Details</p>
                                    <p className="text-sm text-gray-700 dark:text-attire-cream italic leading-relaxed">"{appointment.message}"</p>
                                </div>
                            </div>
                        </div>
                    )}
                    
                    {appointment.favorite_item_image_url && appointment.favorite_item_image_url.length > 0 && (
                        <div>
                            <p className="text-xs font-bold text-gray-400 dark:text-attire-silver/50 uppercase tracking-widest mb-3">Selected Favorites</p>
                            <div className="flex gap-4 overflow-x-auto pb-2 [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
                                {appointment.favorite_item_image_url.map((item, index) => {
                                    const isObject = typeof item === 'object' && item !== null;
                                    const imageUrl = isObject ? item.image : item;
                                    const name = isObject ? item.name : `Item ${index + 1}`;

                                    return (
                                        <div key={index} className="flex flex-col items-center min-w-[80px]">
                                            <div className="h-16 w-16 rounded-lg overflow-hidden border border-black/5 dark:border-white/10 mb-2 relative group/img">
                                                <OptimizedImage
                                                    src={imageUrl}
                                                    alt={name}
                                                    containerClassName="w-full h-full"
                                                    className="w-full h-full transition-transform duration-500 group-hover/img:scale-110"
                                                />
                                            </div>
                                            <p className="text-[10px] text-gray-900 dark:text-white text-center font-medium truncate w-full max-w-[80px]" title={name}>{name}</p>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    )}
                </div>
            </div>

            <div className="mt-6 pt-4 border-t border-black/5 dark:border-white/5 flex justify-end gap-3">
                <button 
                    onClick={() => onUpdateStatus(appointment.id, 'done')} 
                    disabled={appointment.status === 'done'} 
                    className="px-4 py-2 text-xs font-bold uppercase tracking-widest text-green-600 dark:text-green-400 bg-green-400/10 border border-green-400/20 rounded-xl hover:bg-green-400/20 disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center gap-2"
                >
                    <Check className="w-4 h-4" /> Complete
                </button>
                <button 
                    onClick={() => onUpdateStatus(appointment.id, 'cancelled')} 
                    disabled={appointment.status === 'cancelled'} 
                    className="px-4 py-2 text-xs font-bold uppercase tracking-widest text-red-600 dark:text-red-400 bg-red-400/10 border border-red-400/20 rounded-xl hover:bg-red-400/20 disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center gap-2"
                >
                    <X className="w-4 h-4" /> Cancel
                </button>
            </div>
        </motion.div>
    );
};

const AppointmentSkeleton = () => (
    <div className="p-6 rounded-3xl bg-white dark:bg-white/5 border border-black/5 dark:border-white/5 shadow-lg dark:shadow-none space-y-6">
        <div className="flex items-center justify-between pb-4 border-b border-black/5 dark:border-white/5">
            <div className="flex items-center gap-4">
                <Skeleton className="h-12 w-12 rounded-full" />
                <div className="space-y-2">
                    <Skeleton className="h-5 w-32" />
                    <Skeleton className="h-3 w-20" />
                </div>
            </div>
            <Skeleton className="h-6 w-24 rounded-full" />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
            <div className="md:col-span-4 space-y-3">
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-2/3" />
                <Skeleton className="h-4 w-3/4 pt-3" />
            </div>
            <div className="md:col-span-8">
                <Skeleton className="h-24 w-full rounded-2xl" />
            </div>
        </div>
    </div>
);

const AppointmentManager = () => {
    const { 
        appointments, 
        appointmentsLoading, 
        fetchAppointments, 
        updateAppointmentStatus, 
        clearCompletedAppointments 
    } = useAdmin();

    const [visibleCount, setVisibleRows] = useState(5);

    useEffect(() => {
        fetchAppointments();
        const intervalId = setInterval(() => fetchAppointments(false), 60000); 
        return () => clearInterval(intervalId);
    }, [fetchAppointments]);

    const handleUpdateStatus = async (id, status) => {
        try {
            await updateAppointmentStatus(id, status);
        } catch (err) {
            alert('Failed to update status.');
        }
    };

    const handleClearCompleted = async () => {
        if (window.confirm('Are you sure you want to clear completed appointments?')) {
            try {
                await clearCompletedAppointments();
            } catch (err) {
                alert('Failed to clear completed appointments.');
            }
        }
    };

    const visibleAppointments = useMemo(() => {
        return appointments.slice(0, visibleCount);
    }, [appointments, visibleCount]);

    const hasMore = appointments.length > visibleCount;

    return (
        <div className="space-y-8 pb-20">
            <div className="flex justify-between items-end pb-4 border-b border-black/5 dark:border-white/10">
                <div>
                    <h1 className="text-4xl font-serif text-gray-900 dark:text-white mb-2">Appointments</h1>
                    <p className="text-gray-500 dark:text-attire-silver text-sm uppercase tracking-widest">Client consults & visits</p>
                </div>
                <button
                    onClick={handleClearCompleted}
                    className="flex items-center px-5 py-2.5 text-xs font-bold uppercase tracking-widest text-gray-500 dark:text-attire-silver hover:text-red-600 dark:hover:text-red-400 bg-black/5 dark:bg-white/5 hover:bg-red-500/10 border border-black/5 dark:border-white/10 hover:border-red-500/30 rounded-xl transition-all duration-300"
                >
                    <Trash2 className="w-4 h-4 mr-2" />
                    Clear History
                </button>
            </div>

            {appointmentsLoading && appointments.length === 0 ? (
                <div className="space-y-6">
                    {[...Array(3)].map((_, i) => <AppointmentSkeleton key={i} />)}
                </div>
            ) : appointments.length === 0 ? (
                <div className="text-center py-20 bg-black/5 dark:bg-black/20 rounded-3xl border border-black/5 dark:border-white/5">
                    <Calendar className="mx-auto text-gray-300 dark:text-attire-silver/20 mb-4" size={48} />
                    <p className="text-gray-500 dark:text-attire-silver/60 uppercase tracking-widest text-xs">No active appointments.</p>
                </div>
            ) : (
                <div className="space-y-6">
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
                            
                            return (
                                <AppointmentRow 
                                    key={app.id} 
                                    appointment={{ ...app, favorite_item_image_url: imageUrls }} 
                                    onUpdateStatus={handleUpdateStatus} 
                                />
                            );
                        })}
                    </AnimatePresence>

                    {hasMore && (
                        <div className="flex justify-center mt-12">
                            <button 
                                onClick={() => setVisibleRows(v => v + 5)}
                                className="group flex items-center gap-3 px-8 py-4 bg-black/5 dark:bg-white/5 hover:bg-black/10 dark:hover:bg-white/10 border border-black/5 dark:border-white/10 rounded-2xl transition-all"
                            >
                                <span className="text-[10px] font-bold uppercase tracking-[0.3em] text-gray-900 dark:text-white">Load More History</span>
                                <ChevronDown size={16} className="text-attire-accent group-hover:translate-y-1 transition-transform" />
                            </button>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};

export default AppointmentManager;
