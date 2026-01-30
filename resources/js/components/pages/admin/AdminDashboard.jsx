import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Calendar, Gift, ImageIcon, ArrowRight, Clock, AlertTriangle, User, TrendingUp } from 'lucide-react';
import ErrorBoundary from '../../common/ErrorBoundary.jsx';
import Skeleton from '../../common/Skeleton.jsx';
import { motion } from 'framer-motion';
import { useAdmin } from './AdminContext';

const cardVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.4 } }
};

const StatCard = ({ icon, title, value, link, loading }) => {
    if (loading) {
        return (
            <div className="bg-black/20 p-6 rounded-3xl shadow-sm border border-white/5">
                <Skeleton className="h-12 w-12 rounded-full" />
                <Skeleton className="h-8 w-1/4 mt-4" />
                <Skeleton className="h-4 w-1/2 mt-1" />
            </div>
        );
    }

    return (
        <motion.div 
            variants={cardVariants} 
            className="group relative bg-black/20 backdrop-blur-xl p-8 rounded-3xl shadow-xl border border-white/10 
                       hover:border-attire-accent/30 hover:bg-black/30 transition-all duration-300"
        >
            <div className="flex justify-between items-start">
                <div className="flex items-center justify-center h-14 w-14 rounded-2xl bg-white/5 group-hover:bg-attire-accent/10 transition-colors border border-white/5 group-hover:border-attire-accent/20">
                    {React.cloneElement(icon, { size: 24, className: "text-attire-silver group-hover:text-attire-accent transition-colors" })}
                </div>
                {link && (
                    <Link to={link} className="p-2 text-white/30 hover:text-white transition-colors bg-white/5 rounded-full hover:bg-white/10">
                        <ArrowRight size={18} />
                    </Link>
                )}
            </div>
            <div className="mt-6">
                <p className="text-4xl font-serif text-white tracking-tight">
                    {value}
                </p>
                <p className="text-xs font-semibold text-attire-silver/60 mt-2 uppercase tracking-widest">{title}</p>
            </div>
        </motion.div>
    );
};

const RecentActivityItem = ({ item }) => (
    <motion.li 
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.3 }}
        className="py-4 px-4 flex items-center justify-between border-b border-white/5 last:border-0 rounded-xl 
                   transition duration-200 ease-out hover:bg-white/5 group"
    >
        <div className="flex items-center space-x-4">
            <div className="h-10 w-10 flex items-center justify-center bg-white/5 rounded-full border border-white/5 group-hover:border-attire-accent/30 transition-colors">
                <User className="h-5 w-5 text-attire-silver group-hover:text-attire-accent transition-colors" />
            </div>
            <div>
                <p className="font-medium text-white group-hover:text-attire-accent transition-colors">{item.name}</p>
                <p className="text-xs text-attire-silver/60">{item.service}</p>
            </div>
        </div>
        <div className="text-xs text-attire-silver/50 flex items-center bg-black/20 px-3 py-1 rounded-full border border-white/5">
            <Clock size={12} className="mr-2" />
            <span>{new Date(item.created_at).toLocaleDateString()}</span>
        </div>
    </motion.li>
);

const RecentActivitySkeleton = () => (
    <div className="space-y-4">
        {[...Array(5)].map((_, i) => (
            <div key={i} className="flex items-center space-x-4">
                <Skeleton className="h-10 w-10 rounded-full" />
                <div className="flex-1 space-y-2">
                    <Skeleton className="h-4 w-3/4" />
                    <Skeleton className="h-4 w-1/2" />
                </div>
            </div>
        ))}
    </div>
);

const AdminDashboard = () => {
    const { 
        appointments, 
        appointmentsLoading, 
        fetchAppointments,
        giftRequests,
        giftRequestsLoading,
        fetchGiftRequests,
        stats
    } = useAdmin();

    useEffect(() => {
        fetchAppointments();
        fetchGiftRequests();
    }, [fetchAppointments, fetchGiftRequests]);

    const recentAppointments = appointments.slice(0, 5);
    const isLoading = (appointmentsLoading && appointments.length === 0) || (giftRequestsLoading && giftRequests.length === 0);

    const containerVariants = {
        hidden: { opacity: 0 },
        visible: {
            opacity: 1,
            transition: {
                staggerChildren: 0.1
            }
        }
    };

    return (
        <ErrorBoundary>
            <motion.div 
                className="space-y-10"
                initial="hidden"
                animate="visible"
                variants={containerVariants}
            >
                <motion.div variants={cardVariants} className="flex items-end justify-between">
                    <div>
                        <h1 className="text-4xl font-serif text-white mb-2">Dashboard</h1>
                        <p className="text-attire-silver">Overview of your boutique's performance.</p>
                    </div>
                    <div className="hidden md:block text-right">
                        <p className="text-xs font-semibold text-attire-accent uppercase tracking-widest mb-1">Current Date</p>
                        <p className="text-white font-mono text-sm">{new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</p>
                    </div>
                </motion.div>

                <motion.div 
                    className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
                    variants={containerVariants}
                >
                    <StatCard icon={<Calendar />} title="Total Appointments" value={stats.appointments} link="/admin/appointments" loading={isLoading} />
                    <StatCard icon={<Gift />} title="Gift Requests" value={stats.gifts} link="/admin/customize-gift" loading={isLoading} />
                    <StatCard icon={<TrendingUp />} title="Total Activity" value={stats.appointments + stats.gifts} loading={isLoading} />
                </motion.div>

                <motion.div variants={cardVariants} className="bg-black/20 backdrop-blur-xl p-8 rounded-3xl shadow-xl border border-white/10">
                    <div className="flex items-center justify-between mb-6">
                        <h2 className="text-xl font-serif text-white">Recent Activity</h2>
                        <Link to="/admin/appointments" className="text-xs font-semibold text-attire-accent hover:text-white transition-colors uppercase tracking-wider">View All</Link>
                    </div>
                    
                    {isLoading ? (
                        <RecentActivitySkeleton />
                    ) : recentAppointments.length > 0 ? (
                        <motion.ul 
                            className="space-y-2"
                            initial="hidden"
                            animate="visible"
                            variants={containerVariants}
                        >
                            {recentAppointments.map(app => (
                                <RecentActivityItem key={app.id} item={app} />
                            ))}
                        </motion.ul>
                    ) : (
                        <div className="text-center py-12">
                            <div className="w-16 h-16 bg-white/5 rounded-full flex items-center justify-center mx-auto mb-4 border border-white/5">
                                <Clock className="text-attire-silver/30" />
                            </div>
                            <p className="text-attire-silver/60">No recent activity recorded.</p>
                        </div>
                    )}
                </motion.div>
            </motion.div>
        </ErrorBoundary>
    );
};

export default AdminDashboard;
