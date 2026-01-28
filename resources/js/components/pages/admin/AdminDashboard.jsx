import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Calendar, Gift, ImageIcon, ArrowRight, Clock, AlertTriangle, User } from 'lucide-react';
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
            <div className="bg-gray-800 p-6 rounded-xl shadow-sm">
                <Skeleton className="h-12 w-12 rounded-full" />
                <Skeleton className="h-8 w-1/4 mt-4" />
                <Skeleton className="h-4 w-1/2 mt-1" />
            </div>
        );
    }

    return (
        <motion.div 
            variants={cardVariants} 
            className="bg-gray-800 p-6 rounded-xl shadow-md border border-gray-700/50 
                       transform transition duration-200 ease-out
                       hover:-translate-y-1 hover:shadow-xl hover:border-gray-600 hover:bg-gray-750"
        >
            <div className="flex justify-between items-start">
                <div className="flex items-center justify-center h-12 w-12 rounded-full bg-gray-700 group-hover:bg-gray-600 transition-colors">
                    {icon}
                </div>
                {link && (
                    <Link to={link} className="p-2 text-gray-400 hover:text-white transition-colors bg-gray-700/50 rounded-lg hover:bg-gray-600">
                        <ArrowRight size={20} />
                    </Link>
                )}
            </div>
            <div className="mt-4">
                <p className="text-3xl font-bold text-white tracking-tight">
                    {value}
                </p>
                <p className="text-sm font-medium text-gray-400 mt-1 uppercase tracking-wider">{title}</p>
            </div>
        </motion.div>
    );
};

const RecentActivityItem = ({ item }) => (
    <motion.li 
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.3 }}
        className="py-4 px-4 flex items-center justify-between border-b border-gray-700/50 last:border-0 rounded-lg 
                   transition duration-200 ease-out hover:bg-gray-700/30 hover:translate-x-1"
    >
        <div className="flex items-center space-x-4">
            <div className="h-10 w-10 flex items-center justify-center bg-gray-700 rounded-full">
                <User className="h-5 w-5 text-gray-400" />
            </div>
            <div>
                <p className="font-medium text-white">{item.name}</p>
                <p className="text-sm text-gray-400">{item.service}</p>
            </div>
        </div>
        <div className="text-sm text-gray-400 flex items-center">
            <Clock size={14} className="mr-2" />
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

    // Derived state for recent appointments (no need to sort if backend does, but for safety/limit we slice)
    const recentAppointments = appointments.slice(0, 5);
    
    // Show loading only if we have NO data and are loading. 
    // If we have cached data, show it immediately (stale-while-revalidate).
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
                className="space-y-8"
                initial="hidden"
                animate="visible"
                variants={containerVariants}
            >
                <motion.div variants={cardVariants}>
                    <h1 className="text-3xl font-bold text-white">Welcome, Admin</h1>
                    <p className="mt-1 text-gray-400">Here's a snapshot of your store's activity.</p>
                </motion.div>

                <motion.div 
                    className="grid grid-cols-1 md:grid-cols-2 gap-6"
                    variants={containerVariants}
                >
                    <StatCard icon={<Calendar className="text-blue-500" />} title="Total Appointments" value={stats.appointments} link="/admin/appointments" loading={isLoading} />
                    <StatCard icon={<Gift className="text-green-500" />} title="Gift Requests" value={stats.gifts} link="/admin/customize-gift" loading={isLoading} />
                </motion.div>

                <motion.div variants={cardVariants} className="bg-gray-800 p-6 rounded-xl shadow-sm">
                    <h2 className="text-lg font-semibold mb-4 text-white">Recent Activity</h2>
                    {isLoading ? (
                        <RecentActivitySkeleton />
                    ) : recentAppointments.length > 0 ? (
                        <motion.ul 
                            className="divide-y divide-gray-700"
                            initial="hidden"
                            animate="visible"
                            variants={containerVariants}
                        >
                            {recentAppointments.map(app => (
                                <RecentActivityItem key={app.id} item={app} />
                            ))}
                        </motion.ul>
                    ) : (
                        <p className="text-gray-400">No recent appointments found.</p>
                    )}
                </motion.div>
            </motion.div>
        </ErrorBoundary>
    );
};

export default AdminDashboard;
