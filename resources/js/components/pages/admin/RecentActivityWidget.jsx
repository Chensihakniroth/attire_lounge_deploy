import React from 'react';
import { Activity, User, Calendar, ShoppingBag, Gift, ArrowRight } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link } from 'react-router-dom';
import { useAdmin } from './AdminContext';
import { useQuery } from '@tanstack/react-query';
import API from '../../../api';

const ActivityItem = React.forwardRef(({ item, type, isLast }, ref) => {
    const getIcon = () => {
        switch (type) {
            case 'appointment': return <Calendar size={10} />;
            case 'customer': return <User size={10} />;
            case 'product': return <ShoppingBag size={10} />;
            case 'gift': return <Gift size={10} />;
            default: return <Activity size={10} />;
        }
    };

    const getColor = () => {
        switch (type) {
            case 'appointment': return 'text-blue-500';
            case 'customer': return 'text-indigo-500';
            case 'product': return 'text-emerald-500';
            case 'gift': return 'text-rose-500';
            default: return 'text-gray-500';
        }
    };

    const getTimeAgo = (dateString) => {
        if (!dateString) return 'RECENT';
        const date = new Date(dateString);
        const now = new Date();
        const diffMs = now - date;
        const diffMins = Math.floor(diffMs / 60000);
        const diffHours = Math.floor(diffMins / 60);

        if (diffMins < 1) return 'NOW';
        if (diffMins < 60) return `${diffMins}M`;
        if (diffHours < 24) return `${diffHours}H`;
        return `${Math.floor(diffHours / 24)}D`;
    };

    const primaryText = type === 'appointment' 
        ? (item.service || item.appointment_type || 'Bespoke Fitting')
        : (item.name || 'Client Registration');

    const secondaryText = type === 'appointment'
        ? (item.name ? `${item.name}${item.status ? ` • ${item.status}` : ''}` : (item.phone || item.email || 'Scheduled Booking'))
        : (item.email || item.phone || item.nationality || 'New Client Profile');

    return (
        <div className="relative flex gap-4 pr-2 group">
            <div className="flex flex-col items-center">
                <div className={`w-8 h-8 rounded-xl bg-black/[0.03] dark:bg-white/[0.03] flex items-center justify-center ${getColor()} border border-black/5 dark:border-white/5 transition-all duration-300 group-hover:scale-110`}>
                    {getIcon()}
                </div>
                {!isLast && <div className="w-[1px] h-full bg-black/[0.05] dark:bg-white/[0.05] mt-2" />}
            </div>

            <div className="flex-grow pt-1 min-w-0">
                <div className="flex items-center justify-between gap-2">
                    <p className="text-[10px] font-black text-gray-900 dark:text-white uppercase tracking-wider truncate">
                        {primaryText}
                    </p>
                    <span className="text-[8px] font-mono font-black text-gray-400 dark:text-[#8b949e]/30 shrink-0">
                        {getTimeAgo(item.created_at)}
                    </span>
                </div>
                <p className="text-[9px] text-gray-400 dark:text-[#8b949e]/50 uppercase tracking-widest mt-0.5 truncate italic">
                    {secondaryText}
                </p>
            </div>
        </div>
    );
});

const RecentActivityWidget = ({ loading: appointmentsLoading }) => {
    const { performanceMode, activeOutlet } = useAdmin() || {};

    const { data: recentActivities = [] } = useQuery({
        queryKey: ['admin-recent-activities', activeOutlet],
        queryFn: async () => {
            const [appointments, customers] = await Promise.all([
                API.getAdminAppointments({ per_page: 5 }).catch(() => ({ data: [] })),
                API.getAdminCustomers({ per_page: 5 }).catch(() => ({ data: [] }))
            ]);

            const appList = Array.isArray(appointments)
                ? appointments
                : (Array.isArray(appointments?.data) ? appointments.data : []);

            const custList = Array.isArray(customers)
                ? customers
                : (Array.isArray(customers?.data) ? customers.data : []);

            return [
                ...appList.map(item => ({ ...item, type: 'appointment' })),
                ...custList.map(item => ({ ...item, type: 'customer' }))
            ].sort((a, b) => new Date(b.created_at || 0) - new Date(a.created_at || 0)).slice(0, 6);
        },
        staleTime: 60000
    });

    return (
        <motion.div
            initial={performanceMode ? { opacity: 0 } : { opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="h-full flex flex-col pt-2"
        >
            <div className="flex items-center justify-between mb-10">
                <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-2xl bg-emerald-500/10 flex items-center justify-center text-emerald-500">
                        <Activity size={18} strokeWidth={2.5} />
                    </div>
                    <div>
                        <h3 className="text-sm font-black text-gray-900 dark:text-white uppercase tracking-wider">Activity</h3>
                        <p className="text-[9px] text-gray-400 dark:text-[#8b949e]/40 uppercase tracking-[0.2em] font-medium">Events</p>
                    </div>
                </div>
                <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/5 border border-emerald-500/10">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                    <span className="text-[9px] font-black uppercase tracking-widest text-emerald-500">Live</span>
                </div>
            </div>

            <div className="flex-grow space-y-6 overflow-y-auto custom-scrollbar pr-2 mb-6">
                <AnimatePresence mode="popLayout">
                    {recentActivities.map((item, index) => (
                        <ActivityItem
                            key={`${item.type}-${item.id}`}
                            item={item}
                            type={item.type}
                            isLast={index === recentActivities.length - 1}
                        />
                    ))}
                </AnimatePresence>
            </div>

            <Link
                to="/admin/appointments"
                className="mt-auto w-full py-3 bg-black/[0.02] dark:bg-white/[0.02] border border-black/5 dark:border-white/5 rounded-2xl flex items-center justify-center gap-2 text-[10px] font-black uppercase tracking-widest text-gray-400 hover:text-indigo-500 hover:border-indigo-500/20 transition-all group"
            >
                See All
                <ArrowRight size={12} className="group-hover:translate-x-1 transition-transform" />
            </Link>
        </motion.div>
    );
};

export default RecentActivityWidget;