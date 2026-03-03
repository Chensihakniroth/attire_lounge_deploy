import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
    Calendar, Gift, ImageIcon, ArrowRight, Clock, AlertTriangle, 
    User, TrendingUp, Package, ShoppingBag, Plus, Users, 
    Activity, ShieldCheck, Briefcase
} from 'lucide-react';
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
            <div className="bg-white dark:bg-black/20 p-8 rounded-[2rem] shadow-sm border border-black/5 dark:border-white/5 space-y-4">
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
            className="group relative bg-white dark:bg-black/20 backdrop-blur-xl p-8 rounded-[2rem] shadow-xl shadow-black/[0.02] border border-black/5 dark:border-white/10 
                       hover:border-attire-accent/30 transition-all duration-300"
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
                <p className="text-[10px] font-black text-gray-400 dark:text-attire-silver/40 mt-2 uppercase tracking-[0.2em]">{title}</p>
            </div>
        </motion.div>
    );
};

const SimpleTrendChart = ({ data }) => {
    if (!data || data.length === 0) return null;

    const maxVal = Math.max(...data.map(d => d.appointments + d.gifts), 1);
    const height = 150;
    const width = 600;
    const padding = 40;
    
    const points = data.map((d, i) => {
        const x = (i / (data.length - 1)) * (width - padding * 2) + padding;
        const y = height - ((d.appointments / maxVal) * (height - padding * 2) + padding);
        return { x, y };
    });

    const pathData = `M ${points.map(p => `${p.x},${p.y}`).join(' L ')}`;

    return (
        <div className="mt-8">
            <div className="flex items-center justify-between mb-6">
                <p className="text-[10px] font-black text-gray-400 dark:text-attire-silver/30 uppercase tracking-[0.2em]">6-Month Growth Trend</p>
                <div className="flex gap-4">
                    <div className="flex items-center gap-2">
                        <div className="w-2 h-2 rounded-full bg-attire-accent" />
                        <span className="text-[8px] uppercase font-black text-gray-400">Consultations</span>
                    </div>
                </div>
            </div>
            <div className="relative h-[150px] w-full">
                <svg viewBox={`0 0 ${width} ${height}`} className="w-full h-full overflow-visible">
                    <defs>
                        <linearGradient id="gradient" x1="0%" y1="0%" x2="0%" y2="100%">
                            <stop offset="0%" stopColor="#f5a81c" stopOpacity="0.2" />
                            <stop offset="100%" stopColor="#f5a81c" stopOpacity="0" />
                        </linearGradient>
                    </defs>
                    <path
                        d={`${pathData} L ${points[points.length - 1].x},${height} L ${points[0].x},${height} Z`}
                        fill="url(#gradient)"
                        className="transition-all duration-1000"
                    />
                    <motion.path
                        d={pathData}
                        fill="none"
                        stroke="#f5a81c"
                        strokeWidth="3"
                        initial={{ pathLength: 0 }}
                        animate={{ pathLength: 1 }}
                        transition={{ duration: 1.5, ease: "easeInOut" }}
                    />
                    {points.map((p, i) => (
                        <motion.circle
                            key={i}
                            cx={p.x}
                            cy={p.y}
                            r="4"
                            className="fill-white dark:fill-black stroke-attire-accent stroke-[2]"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ delay: i * 0.1 + 0.5 }}
                        />
                    ))}
                </svg>
                <div className="flex justify-between mt-4 px-[20px]">
                    {data.map((d, i) => (
                        <span key={i} className="text-[9px] font-mono text-gray-400 dark:text-attire-silver/30 uppercase">{d.name}</span>
                    ))}
                </div>
            </div>
        </div>
    );
};

const RecentActivityItem = ({ item }) => (
    <motion.li 
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.3 }}
        className="py-4 px-4 flex items-center justify-between border-b border-black/5 dark:border-white/5 last:border-0 rounded-2xl 
                   transition duration-200 ease-out hover:bg-black/[0.02] dark:hover:bg-white/[0.02] group"
    >
        <div className="flex items-center space-x-4">
            <div className="h-10 w-10 flex items-center justify-center bg-black/5 dark:bg-white/5 rounded-xl border border-black/5 dark:border-white/5 group-hover:border-attire-accent/30 transition-colors">
                <User className="h-5 w-5 text-gray-400 dark:text-attire-silver group-hover:text-attire-accent transition-colors" />
            </div>
            <div>
                <p className="font-bold text-gray-900 dark:text-white group-hover:text-attire-accent transition-colors text-[13px] uppercase tracking-wide">{item.name}</p>
                <p className="text-[10px] uppercase font-black tracking-widest text-gray-400 dark:text-white/20">{item.service}</p>
            </div>
        </div>
        <div className="text-[10px] font-mono text-gray-400 dark:text-attire-silver/50 flex items-center bg-black/5 dark:bg-black/20 px-3 py-1 rounded-full border border-black/5 dark:border-white/5">
            <Clock size={10} className="mr-2" />
            <span>{new Date(item.created_at).toLocaleDateString()}</span>
        </div>
    </motion.li>
);

const QuickAction = ({ icon, title, description, link }) => {
    const content = (
        <div className="flex items-center gap-4 p-4 bg-black/[0.02] dark:bg-white/5 rounded-2xl border border-black/5 dark:border-white/5 hover:border-attire-accent/30 hover:bg-white dark:hover:bg-white/10 transition-all duration-300 group shadow-sm hover:shadow-lg hover:shadow-black/[0.02]">
            <div className="h-10 w-10 flex items-center justify-center bg-white dark:bg-black/20 rounded-xl border border-black/5 dark:border-white/5 group-hover:border-attire-accent/20 transition-colors">
                {React.cloneElement(icon, { size: 18, className: "text-gray-400 dark:text-attire-silver group-hover:text-attire-accent transition-colors" })}
            </div>
            <div className="flex-grow">
                <p className="text-[10px] font-black text-gray-900 dark:text-white uppercase tracking-wider">{title}</p>
                <p className="text-[9px] text-gray-400 dark:text-attire-silver/40 uppercase tracking-widest font-medium">{description}</p>
            </div>
            <ArrowRight size={12} className="text-gray-300 dark:text-white/20 group-hover:text-attire-accent group-hover:translate-x-1 transition-all" />
        </div>
    );

    if (link) return <Link to={link} className="block">{content}</Link>;
    return <div className="block">{content}</div>;
};

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
                className="space-y-10 pb-24 font-sans"
                initial="hidden"
                animate="visible"
                variants={containerVariants}
            >
                {/* Dashboard Header */}
                <motion.div variants={cardVariants} className="flex flex-col md:flex-row md:items-end justify-between gap-6">
                    <div>
                        <h1 className="text-4xl font-serif text-gray-900 dark:text-white mb-2">Dashboard</h1>
                        <p className="text-gray-400 dark:text-attire-silver text-sm uppercase tracking-widest">Performance Intelligence</p>
                    </div>
                    <div className="flex items-center gap-4 bg-white dark:bg-black/20 p-4 rounded-2xl border border-black/5 dark:border-white/5 shadow-sm">
                        <div className="p-2 bg-attire-accent/10 rounded-lg text-attire-accent">
                            <Clock size={16} />
                        </div>
                        <div className="text-right">
                            <p className="text-[9px] font-black text-attire-accent uppercase tracking-widest mb-0.5">Current Session</p>
                            <p className="text-gray-900 dark:text-white font-mono text-xs opacity-60 font-bold">{new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</p>
                        </div>
                    </div>
                </motion.div>

                {/* Key Metrics */}
                <motion.div 
                    className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6"
                    variants={containerVariants}
                >
                    <StatCard icon={<Calendar />} title="Appointments" value={stats.appointments} link="/admin/appointments" loading={isLoading} />
                    <StatCard icon={<Users />} title="Total Clients" value={stats.total_customers} link="/admin/customer-profiles" loading={isLoading} />
                    <StatCard icon={<ShoppingBag />} title="Total Products" value={stats.products} link="/admin/products" loading={isLoading} />
                    <StatCard icon={<TrendingUp />} title="Subscribers" value={stats.subscribers} link="/admin/newsletter" loading={isLoading} />
                </motion.div>

                {/* Growth Trends */}
                {stats.trends && (
                    <motion.div variants={cardVariants} className="bg-white dark:bg-black/20 backdrop-blur-xl p-8 rounded-[3rem] shadow-xl shadow-black/[0.02] border border-black/5 dark:border-white/10">
                        <SimpleTrendChart data={stats.trends} />
                    </motion.div>
                )}

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
                    {/* Activity Feed */}
                    <motion.div variants={cardVariants} className="lg:col-span-2 bg-white dark:bg-black/20 backdrop-blur-xl p-8 rounded-[3rem] shadow-xl shadow-black/[0.02] border border-black/5 dark:border-white/10">
                        <div className="flex items-center justify-between mb-8">
                            <div className="flex items-center gap-4">
                                <div className="p-3 bg-blue-500/10 rounded-2xl text-blue-500">
                                    <Activity size={20} />
                                </div>
                                <h2 className="text-2xl font-serif text-gray-900 dark:text-white tracking-tight">Recent Activity</h2>
                            </div>
                            <Link to="/admin/appointments" className="text-[10px] font-black text-attire-accent hover:text-gray-900 dark:hover:text-white transition-colors uppercase tracking-[0.3em] bg-attire-accent/5 px-4 py-2 rounded-xl border border-attire-accent/10">View Journal</Link>
                        </div>
                        
                        {isLoading ? (
                            <div className="space-y-4">
                                {[...Array(5)].map((_, i) => <Skeleton key={i} className="h-16 w-full rounded-2xl" />)}
                            </div>
                        ) : recentAppointments.length > 0 ? (
                            <motion.ul 
                                className="space-y-3"
                                initial="hidden"
                                animate="visible"
                                variants={containerVariants}
                            >
                                {recentAppointments.map(app => (
                                    <RecentActivityItem key={app.id} item={app} />
                                ))}
                            </motion.ul>
                        ) : (
                            <div className="text-center py-20 bg-black/[0.01] rounded-[2rem] border border-dashed border-black/5 dark:border-white/5">
                                <div className="w-16 h-16 bg-black/5 dark:bg-white/5 rounded-full flex items-center justify-center mx-auto mb-4 border border-black/5 dark:border-white/5">
                                    <Clock className="text-gray-400 dark:text-attire-silver/30" />
                                </div>
                                <p className="text-gray-400 dark:text-attire-silver/60 text-[10px] uppercase font-black tracking-widest italic">The journal is currently empty.</p>
                            </div>
                        )}
                    </motion.div>

                    {/* Quick Access Sidebar */}
                    <motion.div variants={cardVariants} className="bg-white dark:bg-black/20 backdrop-blur-xl p-8 rounded-[3rem] shadow-xl shadow-black/[0.02] border border-black/5 dark:border-white/10 flex flex-col">
                        <div className="flex items-center gap-4 mb-8">
                            <div className="p-3 bg-purple-500/10 rounded-2xl text-purple-500">
                                <ShieldCheck size={20} />
                            </div>
                            <h2 className="text-2xl font-serif text-gray-900 dark:text-white tracking-tight">Quick Actions</h2>
                        </div>
                        <div className="flex flex-col gap-4 flex-grow">
                            <QuickAction icon={<Users />} title="Client Registry" description="Manage Dossiers" link="/admin/customer-profiles" />
                            <QuickAction icon={<Package />} title="Product Library" description="Curate Collections" link="/admin/products" />
                            <QuickAction icon={<Plus />} title="New Masterpiece" description="Registry Entry" link="/admin/products/new" />
                            <QuickAction icon={<Calendar />} title="Appointment Board" description="Consultations" link="/admin/appointments" />
                            <QuickAction icon={<Gift />} title="Gift Requests" description="Custom Curation" link="/admin/customize-gift" />
                            
                            <div className="mt-8 pt-8 border-t border-black/5 dark:border-white/5">
                                <div className="flex items-center gap-3 mb-4 text-gray-400 dark:text-white/20">
                                    <AlertTriangle size={14} />
                                    <p className="text-[10px] font-black uppercase tracking-[0.2em]">Priority Alerts</p>
                                </div>
                                <div className="p-5 bg-yellow-500/5 dark:bg-yellow-400/5 rounded-[2rem] border border-yellow-500/10 dark:border-yellow-400/10 shadow-inner">
                                    <div className="flex items-center justify-between">
                                        <div>
                                            <span className="text-xl font-serif text-gray-900 dark:text-white leading-none">{stats.pending_appointments}</span>
                                            <span className="text-[10px] font-black text-gray-400 dark:text-white/20 uppercase tracking-widest ml-2">Pending</span>
                                        </div>
                                        <Link to="/admin/appointments" className="p-2 bg-yellow-400 text-black rounded-xl hover:bg-yellow-500 transition-colors shadow-lg shadow-yellow-400/20">
                                            <ArrowRight size={14} />
                                        </Link>
                                    </div>
                                    <p className="text-[9px] font-bold text-yellow-600/60 dark:text-yellow-400/40 uppercase tracking-widest mt-2">New consultation requests</p>
                                </div>
                            </div>
                        </div>
                    </motion.div>
                </div>
            </motion.div>
        </ErrorBoundary>
    );
};

export default AdminDashboard;
