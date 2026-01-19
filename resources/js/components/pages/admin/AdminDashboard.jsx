import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { Calendar, Gift, ImageIcon, ArrowRight, Clock, AlertTriangle, User } from 'lucide-react';
import ErrorBoundary from '../../common/ErrorBoundary.jsx';

const StatCard = ({ icon, title, value, link, loading }) => (
    <div className="bg-white p-6 rounded-xl shadow-sm hover:shadow-lg transition-shadow duration-300">
        <div className="flex justify-between items-start">
            <div className="flex items-center justify-center h-12 w-12 rounded-full bg-gray-100">
                {icon}
            </div>
            {link && (
                <Link to={link} className="p-2 text-gray-400 hover:text-gray-700 transition-colors">
                    <ArrowRight size={20} />
                </Link>
            )}
        </div>
        <div className="mt-4">
            <p className="text-3xl font-bold text-gray-900">
                {loading ? '...' : value}
            </p>
            <p className="text-sm font-medium text-gray-500 mt-1">{title}</p>
        </div>
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
                const appointmentsResponse = await axios.get('/api/v1/admin/appointments');
                const sortedAppointments = [...appointmentsResponse.data].sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
                setRecentAppointments(sortedAppointments.slice(0, 5));

                setStats({
                    appointments: appointmentsResponse.data.length,
                    images: 'N/A',
                    gifts: 0, 
                });

            } catch (err) {
                console.error("Error fetching critical dashboard data (appointments):", err);
                setError("Could not load dashboard data. Please try again later.");
            } finally {
                setLoading(false);
            }
        };
        fetchDashboardData();
    }, []);

    if (error) {
        return (
            <div className="bg-red-50 p-6 rounded-lg">
                <div className="flex">
                    <div className="flex-shrink-0"><AlertTriangle className="h-5 w-5 text-red-400" /></div>
                    <div className="ml-3"><h3 className="text-sm font-medium text-red-800">{error}</h3></div>
                </div>
            </div>
        );
    }

    return (
        <ErrorBoundary>
            <div className="space-y-8">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900">Welcome, Admin</h1>
                    <p className="mt-1 text-gray-600">Here's a snapshot of your store's activity.</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    <StatCard icon={<Calendar className="text-blue-500" />} title="Total Appointments" value={stats.appointments} link="/admin/appointments" loading={loading} />
                    <StatCard icon={<Gift className="text-green-500" />} title="Gift Requests" value={stats.gifts} link="/admin/customize-gift" loading={loading} />
                    <StatCard icon={<ImageIcon className="text-purple-500" />} title="Total Images" value={stats.images} link="/admin/image-manager" loading={loading} />
                </div>

                <div className="bg-white p-6 rounded-xl shadow-sm">
                    <h2 className="text-lg font-semibold mb-4 text-gray-900">Recent Activity</h2>
                    {loading ? (
                        <p className="text-gray-500">Loading recent activity...</p>
                    ) : recentAppointments.length > 0 ? (
                        <ul className="divide-y divide-gray-100">
                            {recentAppointments.map(app => (
                                <li key={app.id} className="py-4 flex items-center justify-between">
                                    <div className="flex items-center space-x-4">
                                        <div className="h-10 w-10 flex items-center justify-center bg-gray-100 rounded-full">
                                            <User className="h-5 w-5 text-gray-500"/>
                                        </div>
                                        <div>
                                            <p className="font-medium text-gray-800">{app.name}</p>
                                            <p className="text-sm text-gray-500">{app.service}</p>
                                        </div>
                                    </div>
                                    <div className="text-sm text-gray-500 flex items-center">
                                        <Clock size={14} className="mr-2" />
                                        <span>{new Date(app.created_at).toLocaleDateString()}</span>
                                    </div>
                                </li>
                            ))}
                        </ul>
                    ) : (
                        <p className="text-gray-500">No recent appointments found.</p>
                    )}
                </div>
            </div>
        </ErrorBoundary>
    );
};

export default AdminDashboard;

