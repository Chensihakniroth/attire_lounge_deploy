import React, { useState, useEffect, useContext } from 'react';
import { User, Mail, Phone, Calendar, Clock, MessageSquare, AlertTriangle, Loader, Check, X, Trash2 } from 'lucide-react';
import { ThemeContext } from './ThemeContext';
import { useAdmin } from './AdminContext';

const AppointmentRow = ({ appointment, onUpdateStatus, colors }) => {
    const statusConfig = {
        pending: { label: 'Pending', color: 'text-yellow-400', bg: 'bg-yellow-400/10', border: 'border-yellow-400/20' },
        done: { label: 'Completed', color: 'text-green-400', bg: 'bg-green-400/10', border: 'border-green-400/20' },
        cancelled: { label: 'Cancelled', color: 'text-red-400', bg: 'bg-red-400/10', border: 'border-red-400/20' },
    };

    const status = statusConfig[appointment.status] || statusConfig.pending;

    return (
        <div className={`p-6 rounded-3xl backdrop-blur-xl bg-black/20 border border-white/10 shadow-lg transition-all duration-300 hover:bg-black/30 hover:border-white/20 group`}>
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 mb-4 border-b border-white/5">
                <div className="flex items-center gap-4">
                    <div className="h-12 w-12 rounded-full bg-white/5 flex items-center justify-center border border-white/5">
                        <User className="w-5 h-5 text-attire-silver group-hover:text-attire-accent transition-colors" />
                    </div>
                    <div>
                        <h3 className="text-xl font-serif text-white">{appointment.name}</h3>
                        <p className="text-xs text-attire-silver/60 uppercase tracking-wider font-medium">{appointment.service}</p>
                    </div>
                </div>
                <span className={`px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider border ${status.color} ${status.bg} ${status.border}`}>
                    {status.label}
                </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
                <div className="md:col-span-4 space-y-3">
                    <div className="flex items-center text-attire-silver/80 group-hover:text-white transition-colors">
                        <Mail className="w-4 h-4 mr-3 text-attire-silver/40" />
                        <a href={`mailto:${appointment.email}`} className="hover:text-attire-accent hover:underline truncate text-sm transition-colors">{appointment.email}</a>
                    </div>
                    <div className="flex items-center text-attire-silver/80 group-hover:text-white transition-colors">
                        <Phone className="w-4 h-4 mr-3 text-attire-silver/40" />
                        <span className="text-sm">{appointment.phone}</span>
                    </div>
                    <div className="flex items-center text-attire-silver/80 pt-3 border-t border-white/5 mt-3">
                        <Calendar className="w-4 h-4 mr-3 text-attire-silver/40" />
                        <span className="text-sm font-medium">{new Date(appointment.date).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })} <span className="text-white/20 mx-1">|</span> {appointment.time}</span>
                    </div>
                </div>

                <div className="md:col-span-8 space-y-4">
                    {appointment.message && (
                        <div className="bg-white/5 p-4 rounded-xl border border-white/5">
                            <div className="flex items-start gap-3">
                                <MessageSquare className="w-4 h-4 text-attire-accent mt-1 flex-shrink-0" />
                                <div>
                                    <p className="text-xs font-bold text-attire-silver/50 uppercase tracking-widest mb-1">Request Details</p>
                                    <p className="text-sm text-attire-cream italic leading-relaxed">"{appointment.message}"</p>
                                </div>
                            </div>
                        </div>
                    )}
                    
                    {appointment.favorite_item_image_url && appointment.favorite_item_image_url.length > 0 && (
                        <div>
                            <p className="text-xs font-bold text-attire-silver/50 uppercase tracking-widest mb-3">Selected Favorites</p>
                            <div className="flex gap-4 overflow-x-auto pb-2 [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
                                {appointment.favorite_item_image_url.map((item, index) => {
                                    const isObject = typeof item === 'object' && item !== null;
                                    const imageUrl = isObject ? item.image : item;
                                    const name = isObject ? item.name : `Item ${index + 1}`;

                                    return (
                                        <div key={index} className="flex flex-col items-center min-w-[80px]">
                                            <div className="h-16 w-16 rounded-lg overflow-hidden border border-white/10 mb-2 relative group/img">
                                                <img
                                                    src={imageUrl}
                                                    alt={name}
                                                    className="w-full h-full object-cover transition-transform duration-500 group-hover/img:scale-110"
                                                />
                                            </div>
                                            <p className="text-[10px] text-white text-center font-medium truncate w-full max-w-[80px]" title={name}>{name}</p>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    )}
                </div>
            </div>

            <div className="mt-6 pt-4 border-t border-white/5 flex justify-end gap-3">
                <button 
                    onClick={() => onUpdateStatus(appointment.id, 'done')} 
                    disabled={appointment.status === 'done'} 
                    className="px-4 py-2 text-xs font-bold uppercase tracking-widest text-green-400 bg-green-400/10 border border-green-400/20 rounded-xl hover:bg-green-400/20 disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center gap-2"
                >
                    <Check className="w-4 h-4" /> Complete
                </button>
                <button 
                    onClick={() => onUpdateStatus(appointment.id, 'cancelled')} 
                    disabled={appointment.status === 'cancelled'} 
                    className="px-4 py-2 text-xs font-bold uppercase tracking-widest text-red-400 bg-red-400/10 border border-red-400/20 rounded-xl hover:bg-red-400/20 disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center gap-2"
                >
                    <X className="w-4 h-4" /> Cancel
                </button>
            </div>
        </div>
    );
};

const AppointmentManager = () => {
    const { colors } = useContext(ThemeContext);
    const { 
        appointments, 
        appointmentsLoading, 
        fetchAppointments, 
        updateAppointmentStatus, 
        clearCompletedAppointments 
    } = useAdmin();

    useEffect(() => {
        fetchAppointments(); // Use context fetcher which handles caching
        const intervalId = setInterval(() => fetchAppointments(false), 60000); 
        return () => clearInterval(intervalId);
    }, [fetchAppointments]);

    const handleUpdateStatus = async (id, status) => {
        try {
            await updateAppointmentStatus(id, status);
        } catch (err) {
            alert('Failed to update status. Please try again.');
        }
    };

    const handleClearCompleted = async () => {
        if (window.confirm('Are you sure you want to clear all "done" appointments? This action cannot be undone.')) {
            try {
                await clearCompletedAppointments();
            } catch (err) {
                alert('Failed to clear completed appointments. Please try again.');
            }
        }
    };

    const renderContent = () => {
        if (appointmentsLoading && appointments.length === 0) {
            return <div className="flex justify-center items-center h-64"><Loader className="animate-spin text-attire-accent" size={48} /></div>;
        }

        if (appointments.length === 0 && !appointmentsLoading) {
             return (
                <div className="text-center py-20 bg-black/20 rounded-3xl border border-white/5">
                    <div className="w-16 h-16 bg-white/5 rounded-full flex items-center justify-center mx-auto mb-4">
                        <Calendar className="text-attire-silver/30" />
                    </div>
                    <p className="text-attire-silver/60">No pending appointments.</p>
                </div>
             );
        }

        return (
            <div className="space-y-6">
                {appointments.map(app => {
                    let imageUrls = [];
                    try {
                        if (typeof app.favorite_item_image_url === 'string') {
                            const parsed = JSON.parse(app.favorite_item_image_url);
                            imageUrls = Array.isArray(parsed) ? parsed : [];
                        } else if (Array.isArray(app.favorite_item_image_url)) {
                            imageUrls = app.favorite_item_image_url;
                        }
                    } catch (e) {}
                    const appointmentWithImages = { ...app, favorite_item_image_url: imageUrls };
                    
                    return (
                        <AppointmentRow 
                            key={app.id} 
                            appointment={appointmentWithImages} 
                            onUpdateStatus={handleUpdateStatus} 
                            colors={colors} 
                        />
                    );
                })}
            </div>
        );
    };

    return (
        <div className="space-y-8">
            <div className="flex justify-between items-end pb-4 border-b border-white/10">
                <div>
                    <h1 className="text-4xl font-serif text-white mb-2">Appointments</h1>
                    <p className="text-attire-silver text-sm">Manage styling consultations and visits.</p>
                </div>
                <button
                    onClick={handleClearCompleted}
                    className="flex items-center px-5 py-2.5 text-xs font-bold uppercase tracking-widest text-attire-silver hover:text-red-400 bg-white/5 hover:bg-red-500/10 border border-white/10 hover:border-red-500/30 rounded-xl transition-all duration-300 group"
                >
                    <Trash2 className="w-4 h-4 mr-2 opacity-50 group-hover:opacity-100 transition-opacity" />
                    Clear History
                </button>
            </div>
            {renderContent()}
        </div>
    );
};

export default AppointmentManager;