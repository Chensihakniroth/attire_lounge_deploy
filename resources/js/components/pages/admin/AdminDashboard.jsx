import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Calendar, Gift, ImageIcon, ArrowRight, Clock, AlertTriangle, User, TrendingUp, Package, ShoppingBag, Plus } from 'lucide-react';
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
            <div className="bg-black/5 dark:bg-black/20 p-8 rounded-[2rem] shadow-sm border border-black/5 dark:border-white/5 space-y-4">
                <Skeleton className="h-14 w-14 rounded-2xl" />
                <div className="space-y-2">
                    <Skeleton className="h-10 w-1/2" />
                    <Skeleton className="h-4 w-3/4" />
                </div>
            </div>
        );
    }

    return (
        <motion.div 
            variants={cardVariants} 
            className="group relative bg-white dark:bg-black/20 backdrop-blur-xl p-8 rounded-[2rem] shadow-xl border border-black/5 dark:border-white/10 
                       hover:border-attire-accent/30 hover:bg-gray-50 dark:hover:bg-black/30 transition-all duration-300"
        >
            <div className="flex justify-between items-start">
                <div className="flex items-center justify-center h-14 w-14 rounded-2xl bg-black/5 dark:bg-white/5 group-hover:bg-attire-accent/10 transition-colors border border-black/5 dark:border-white/5 group-hover:border-attire-accent/20">
                    {React.cloneElement(icon, { size: 24, className: "text-gray-400 dark:text-attire-silver group-hover:text-attire-accent transition-colors" })}
                </div>
                {link && (
                    <Link to={link} className="p-2 text-gray-400 dark:text-white/30 hover:text-gray-900 dark:hover:text-white transition-colors bg-black/5 dark:bg-white/5 rounded-full hover:bg-black/10 dark:hover:bg-white/10">
                        <ArrowRight size={18} />
                    </Link>
                )}
            </div>
            <div className="mt-6">
                <p className="text-4xl font-serif text-gray-900 dark:text-white tracking-tight">
                    {value}
                </p>
                <p className="text-[10px] font-bold text-gray-400 dark:text-attire-silver/40 mt-2 uppercase tracking-[0.2em]">{title}</p>
            </div>
        </motion.div>
    );
};

const RecentActivityItem = ({ item }) => (
    <motion.li 
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.3 }}
        className="py-4 px-4 flex items-center justify-between border-b border-black/5 dark:border-white/5 last:border-0 rounded-xl 
                   transition duration-200 ease-out hover:bg-black/5 dark:hover:bg-white/5 group"
    >
        <div className="flex items-center space-x-4">
            <div className="h-10 w-10 flex items-center justify-center bg-black/5 dark:bg-white/5 rounded-full border border-black/5 dark:border-white/5 group-hover:border-attire-accent/30 transition-colors">
                <User className="h-5 w-5 text-gray-400 dark:text-attire-silver group-hover:text-attire-accent transition-colors" />
            </div>
            <div>
                <p className="font-medium text-gray-900 dark:text-white group-hover:text-attire-accent transition-colors text-sm">{item.name}</p>
                <p className="text-[10px] uppercase tracking-wider text-gray-400 dark:text-attire-silver/40">{item.service}</p>
            </div>
        </div>
        <div className="text-[10px] text-gray-400 dark:text-attire-silver/50 flex items-center bg-black/5 dark:bg-black/20 px-3 py-1 rounded-full border border-black/5 dark:border-white/5">
            <Clock size={10} className="mr-2" />
            <span>{new Date(item.created_at).toLocaleDateString()}</span>
        </div>
    </motion.li>
);

const AdminDashboard = () => {
    const { 
        appointments, 
        appointmentsLoading, 
        fetchAppointments,
        giftRequests,
        giftRequestsLoading,
        fetchGiftRequests,
        stats,
        fetchStats
    } = useAdmin();

    useEffect(() => {
        fetchAppointments();
        fetchGiftRequests();
        fetchStats();
    }, [fetchAppointments, fetchGiftRequests, fetchStats]);

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
                className="space-y-10 pb-24"
                initial="hidden"
                animate="visible"
                variants={containerVariants}
            >
                <motion.div variants={cardVariants} className="flex items-end justify-between">
                    <div>
                        <h1 className="text-4xl font-serif text-gray-900 dark:text-white mb-2">Dashboard</h1>
                        <p className="text-gray-400 dark:text-attire-silver text-sm uppercase tracking-widest">Performance Overview</p>
                    </div>
                    <div className="hidden md:block text-right">
                        <p className="text-[9px] font-bold text-attire-accent uppercase tracking-widest mb-1">Active Session</p>
                        <p className="text-gray-900 dark:text-white font-mono text-xs opacity-40">{new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</p>
                    </div>
                </motion.div>

                <motion.div 
                    className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6"
                    variants={containerVariants}
                >
                    <StatCard icon={<Calendar />} title="Appointments" value={stats.appointments} link="/admin/appointments" loading={isLoading} />
                    <StatCard icon={<Gift />} title="Gift Requests" value={stats.gifts} link="/admin/customize-gift" loading={isLoading} />
                    <StatCard icon={<ShoppingBag />} title="Total Products" value={stats.products} link="/admin/products" loading={isLoading} />
                    <StatCard icon={<TrendingUp />} title="Subscribers" value={stats.subscribers} loading={isLoading} />
                </motion.div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    <motion.div variants={cardVariants} className="lg:col-span-2 bg-white dark:bg-black/20 backdrop-blur-xl p-6 md:p-8 rounded-[2rem] shadow-xl border border-black/5 dark:border-white/10">
                        <div className="flex items-center justify-between mb-6">
                            <h2 className="text-xl font-serif text-gray-900 dark:text-white">Recent Activity</h2>
                            <Link to="/admin/appointments" className="text-[10px] font-bold text-attire-accent hover:text-gray-900 dark:hover:text-white transition-colors uppercase tracking-[0.2em]">View All</Link>
                        </div>
                        
                        {isLoading ? (
                            <div className="space-y-4">
                                {[...Array(5)].map((_, i) => <Skeleton key={i} className="h-12 w-full" />)}
                            </div>
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
                                <div className="w-16 h-16 bg-black/5 dark:bg-white/5 rounded-full flex items-center justify-center mx-auto mb-4 border border-black/5 dark:border-white/5">
                                    <Clock className="text-gray-400 dark:text-attire-silver/30" />
                                </div>
                                <p className="text-gray-400 dark:text-attire-silver/60 text-xs uppercase tracking-widest">No recent activity.</p>
                            </div>
                        )}
                    </motion.div>

                    <motion.div variants={cardVariants} className="bg-white dark:bg-black/20 backdrop-blur-xl p-8 rounded-[2rem] shadow-xl border border-black/5 dark:border-white/10 flex flex-col">
                        <h2 className="text-xl font-serif text-gray-900 dark:text-white mb-6">Quick Actions</h2>
                        <div className="flex flex-col gap-4 flex-grow">
                            <QuickAction icon={<Package />} title="Product Library" description="Manage collections" link="/admin/products" />
                            <QuickAction icon={<Plus />} title="New Product" description="Add to masterpiece" link="/admin/products/new" />
                            <QuickAction icon={<Calendar />} title="Appointment Board" description="Consultation schedule" link="/admin/appointments" />
                            <QuickAction icon={<Gift />} title="Gift Requests" description="Custom orders" link="/admin/customize-gift" />
                            <QuickAction icon={<ImageIcon />} title="Asset Gallery" description="Manage media" link="/admin/inventory" />
                            
                            <div className="mt-8 pt-8 border-t border-black/5 dark:border-white/5">
                                <p className="text-[9px] font-bold text-gray-400 dark:text-attire-silver/30 uppercase tracking-[0.2em] mb-4">Urgent Attention</p>
                                <div className="flex items-center justify-between p-4 bg-yellow-50 dark:bg-yellow-400/5 rounded-2xl border border-yellow-200 dark:border-yellow-400/10">
                                    <div className="flex items-center gap-3">
                                        <AlertTriangle size={14} className="text-yellow-600 dark:text-yellow-400" />
                                        <span className="text-[10px] font-bold text-gray-900 dark:text-white uppercase tracking-wider">{stats.pending_appointments} New Consults</span>
                                    </div>
                                    <Link to="/admin/appointments" className="text-[8px] font-black uppercase bg-yellow-400 text-black px-2 py-0.5 rounded hover:bg-yellow-500 transition-colors">Action</Link>
                                </div>
                            </div>
                        </div>
                    </motion.div>
                </div>
            </motion.div>
        </ErrorBoundary>
    );
};

const QuickAction = ({ icon, title, description, link }) => {
    const content = (
        <div className="flex items-center gap-4 p-4 bg-black/5 dark:bg-white/5 rounded-2xl border border-black/5 dark:border-white/5 hover:border-attire-accent/30 hover:bg-gray-50 dark:hover:bg-white/10 transition-all duration-300 group">
            <div className="h-10 w-10 flex items-center justify-center bg-gray-50 dark:bg-black/20 rounded-xl border border-black/5 dark:border-white/5 group-hover:border-attire-accent/20 transition-colors">
                {React.cloneElement(icon, { size: 18, className: "text-gray-400 dark:text-attire-silver group-hover:text-attire-accent transition-colors" })}
            </div>
            <div className="flex-grow">
                <p className="text-[10px] font-bold text-gray-900 dark:text-white uppercase tracking-wider">{title}</p>
                <p className="text-[9px] text-gray-400 dark:text-attire-silver/40 uppercase tracking-widest">{description}</p>
            </div>
            <ArrowRight size={12} className="text-gray-300 dark:text-white/20 group-hover:text-attire-accent group-hover:translate-x-1 transition-all" />
        </div>
    );

    if (link) return <Link to={link} className="block">{content}</Link>;
    return <div className="block">{content}</div>;
};

export default AdminDashboard;
