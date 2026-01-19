import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { User, Mail, Phone, Calendar, Clock, MessageSquare, AlertTriangle, Loader, Check, X, Trash2 } from 'lucide-react';

const AppointmentRow = ({ appointment, onUpdateStatus }) => {
    const statusStyles = {
        pending: 'border-gray-300',
        done: 'border-green-500',
        cancelled: 'border-red-500',
    };
    
    const statusBgStyles = {
        pending: 'bg-gray-100',
        done: 'bg-green-50',
        cancelled: 'bg-red-50',
    }

    return (
        <div className={`bg-white p-5 rounded-xl shadow-sm border-l-4 ${statusStyles[appointment.status] || 'border-gray-300'} ${statusBgStyles[appointment.status] || 'bg-white'}`}>
            {/* Header */}
            <div className="flex justify-between items-center pb-3 mb-3 border-b">
                <div className="flex items-center">
                    <User className="w-5 h-5 text-blue-600 mr-3" />
                    <h3 className="text-lg font-semibold text-gray-900">{appointment.name}</h3>
                </div>
                <span className="text-xs font-bold uppercase px-3 py-1 rounded-full bg-gray-200 text-gray-800">{appointment.status}</span>
            </div>

            {/* Body */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* Left Column: Contact & Date */}
                <div className="md:col-span-1 space-y-4">
                    <div className="flex items-center text-gray-600">
                        <Mail className="w-4 h-4 mr-3 flex-shrink-0" />
                        <a href={`mailto:${appointment.email}`} className="hover:text-blue-600 truncate text-sm">{appointment.email}</a>
                    </div>
                    <div className="flex items-center text-gray-600">
                        <Phone className="w-4 h-4 mr-3 flex-shrink-0" />
                        <span className="text-sm">{appointment.phone}</span>
                    </div>
                    <div className="flex items-center text-gray-600 pt-2 border-t mt-2">
                        <Calendar className="w-4 h-4 mr-3 flex-shrink-0" />
                        <span className="text-sm font-medium">{new Date(appointment.date).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })} at {appointment.time}</span>
                    </div>
                </div>

                {/* Middle Column: Message & Service */}
                <div className="md:col-span-2 space-y-4">
                    <div>
                        <p className="font-semibold text-gray-700 text-sm mb-1">Service Requested</p>
                        <p className="text-sm text-gray-800">{appointment.service}</p>
                    </div>
                    {appointment.message && (
                        <div>
                             <p className="font-semibold text-gray-700 text-sm mb-1">Message</p>
                            <div className="flex items-start text-gray-600 text-sm">
                                <MessageSquare className="w-4 h-4 mr-3 mt-0.5 flex-shrink-0" />
                                <p className="italic">{appointment.message}</p>
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {/* Image Gallery */}
            {appointment.favorite_item_image_url && appointment.favorite_item_image_url.length > 0 && (
                <div className="mt-4 pt-4 border-t">
                    <h4 className="text-sm font-semibold text-gray-600 mb-2">Selected Items</h4>
                    <div className="flex flex-wrap gap-3">
                        {appointment.favorite_item_image_url.map((imageUrl, index) => (
                            <img 
                                key={index}
                                src={imageUrl} 
                                alt={`Favorite Item ${index + 1}`}
                                className="w-16 h-16 object-cover rounded-lg shadow-sm border"
                            />
                        ))}
                    </div>
                </div>
            )}

            {/* Footer: Actions */}
            <div className="mt-4 pt-4 border-t flex justify-end space-x-2">
                <button onClick={() => onUpdateStatus(appointment.id, 'done')} disabled={appointment.status === 'done'} className="px-3 py-1.5 text-xs font-semibold text-green-800 bg-green-100 rounded-md hover:bg-green-200 disabled:opacity-60 disabled:cursor-not-allowed flex items-center"><Check className="w-4 h-4 mr-1" /> Mark as Done</button>
                <button onClick={() => onUpdateStatus(appointment.id, 'cancelled')} disabled={appointment.status === 'cancelled'} className="px-3 py-1.5 text-xs font-semibold text-red-800 bg-red-100 rounded-md hover:bg-red-200 disabled:opacity-60 disabled:cursor-not-allowed flex items-center"><X className="w-4 h-4 mr-1" /> Cancel</button>
            </div>
        </div>
    );
};

const AppointmentManager = () => {
    const [appointments, setAppointments] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const fetchAppointments = async () => {
        try {
            setLoading(true);
            const response = await axios.get('/api/v1/admin/appointments');
            const sortedAppointments = [...response.data].sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
            setAppointments(sortedAppointments);
        } catch (err) {
            console.error('Error fetching appointments:', err);
            setError('Failed to load appointments. Please try again later.');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchAppointments();
    }, []);

    const handleUpdateStatus = async (id, status) => {
        try {
            const response = await axios.patch(`/api/v1/admin/appointments/${id}/status`, { status });
            setAppointments(prev => 
                prev.map(app => app.id === id ? response.data.appointment : app)
            );
        } catch (err) {
            console.error(`Error updating appointment ${id} to status ${status}:`, err);
            alert('Failed to update status. Please try again.');
        }
    };
    
    const handleClearCompleted = async () => {
        if (window.confirm('Are you sure you want to clear all "done" appointments? This action cannot be undone.')) {
            try {
                await axios.post('/api/v1/admin/appointments/clear-completed');
                // Remove done appointments from local state for immediate feedback
                setAppointments(prev => prev.filter(app => app.status !== 'done'));
            } catch (err) {
                console.error('Error clearing completed appointments:', err);
                alert('Failed to clear completed appointments. Please try again.');
            }
        }
    };

    const renderContent = () => {
        if (loading) {
            return <div className="flex justify-center items-center h-64"><Loader className="animate-spin text-blue-500" size={48} /></div>;
        }

        if (error) {
            return <div className="flex flex-col items-center justify-center h-64 bg-red-50 text-red-700 rounded-lg"><AlertTriangle size={48} className="mb-4" /><p>{error}</p></div>;
        }

        if (appointments.length === 0) {
            return <p className="text-center text-gray-500">No appointments found.</p>;
        }

        return (
            <div className="space-y-4">
                {appointments.map(appointment => (
                    <AppointmentRow key={appointment.id} appointment={appointment} onUpdateStatus={handleUpdateStatus} />
                ))}
            </div>
        );
    };

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900">Appointment Requests</h1>
                    <p className="mt-1 text-gray-600">Manage incoming appointment requests from customers.</p>
                </div>
                <button
                    onClick={handleClearCompleted}
                    className="flex items-center px-4 py-2 text-sm font-medium text-white bg-gray-800 rounded-lg hover:bg-gray-900"
                >
                    <Trash2 className="w-4 h-4 mr-2" />
                    Clear Completed
                </button>
            </div>
            {renderContent()}
        </div>
    );
};

export default AppointmentManager;