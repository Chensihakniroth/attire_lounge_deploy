import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Calendar, Gift, ImageIcon, ArrowRight, Clock, AlertTriangle, User } from 'lucide-react';
import ErrorBoundary from '../../common/ErrorBoundary.jsx';
import Skeleton from '../../common/Skeleton.jsx';
import { motion } from 'framer-motion';

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
        <motion.div variants={cardVariants} className="bg-gray-800 p-6 rounded-xl shadow-sm hover:shadow-lg transition-shadow duration-300">
            <div className="flex justify-between items-start">
                <div className="flex items-center justify-center h-12 w-12 rounded-full bg-gray-700">
                    {icon}
                </div>
                {link && (
                    <Link to={link} className="p-2 text-gray-400 hover:text-white transition-colors">
                        <ArrowRight size={20} />
                    </Link>
                )}
            </div>
            <div className="mt-4">
                <p className="text-3xl font-bold text-white">
                    {value}
                </p>
                <p className="text-sm font-medium text-gray-400 mt-1">{title}</p>
            </div>
        </motion.div>
    );
};

const RecentActivityItem = ({ item }) => (
    <motion.li 
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.3 }}
        className="py-4 flex items-center justify-between border-b border-gray-700"
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
    const [stats, setStats] = useState({ appointments: 0, gifts: 0, images: 0 });
    const [recentAppointments, setRecentAppointments] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchDashboardData = async () => {
            setLoading(true);
            try {
                // Using axios which is assumed to be globally available or imported elsewhere
                const appointmentsResponse = await axios.get('/api/v1/admin/appointments');
                const sortedAppointments = [...appointmentsResponse.data].sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
                setRecentAppointments(sortedAppointments.slice(0, 5));

                setStats({
                    appointments: appointmentsResponse.data.length,
                    images: 'N/A', // Placeholder
                    gifts: 0, // Placeholder
                });

            } catch (err) {
                console.error("Error fetching dashboard data:", err);
                setError("Could not load dashboard data. Please check the console for more details.");
            } finally {
                setLoading(false);
            }
        };
        fetchDashboardData();
    }, []);

    if (error) {
        return (
            <div className="bg-red-900/20 p-6 rounded-lg">
                <div className="flex">
                    <div className="flex-shrink-0"><AlertTriangle className="h-5 w-5 text-red-500" /></div>
                    <div className="ml-3"><h3 className="text-sm font-medium text-red-200">{error}</h3></div>
                </div>
            </div>
        );
    }

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
                    className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
                    variants={containerVariants}
                >
                    <StatCard icon={<Calendar className="text-blue-500" />} title="Total Appointments" value={stats.appointments} link="/admin/appointments" loading={loading} />
                    <StatCard icon={<Gift className="text-green-500" />} title="Gift Requests" value={stats.gifts} link="/admin/customize-gift" loading={loading} />
                    <StatCard icon={<ImageIcon className="text-purple-500" />} title="Total Images" value={stats.images} link="/admin/image-manager" loading={loading} />
                </motion.div>

                <motion.div variants={cardVariants} className="bg-gray-800 p-6 rounded-xl shadow-sm">
                    <h2 className="text-lg font-semibold mb-4 text-white">Recent Activity</h2>
                    {loading ? (
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
