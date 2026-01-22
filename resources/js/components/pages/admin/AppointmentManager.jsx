import React, { useState, useEffect, useContext } from 'react';
import { User, Mail, Phone, Calendar, Clock, MessageSquare, AlertTriangle, Loader, Check, X, Trash2 } from 'lucide-react';
import { ThemeContext } from './ThemeContext';

const AppointmentRow = ({ appointment, onUpdateStatus, colors }) => {
    const statusStyles = {
        pending: { borderLeft: `4px solid ${colors.border}`, backgroundColor: colors.card },
        done: { borderLeft: '4px solid #22c55e', backgroundColor: colors.card },
        cancelled: { borderLeft: '4px solid #ef4444', backgroundColor: colors.card },
    };

    return (
        <div
            style={statusStyles[appointment.status]} 
            className="p-5 rounded-xl shadow-sm transition-transform ease-in-out duration-200 hover:scale-[1.02]"
        >
            <div style={{borderColor: colors.border}} className="flex justify-between items-center pb-3 mb-3 border-b">
                <div className="flex items-center">
                    <User style={{color: colors.primary}} className="w-5 h-5 mr-3" />
                    <h3 style={{color: colors.mainText}} className="text-lg font-semibold">{appointment.name}</h3>
                </div>
                <span style={{backgroundColor: colors.background, color: colors.sidebarText}} className="text-xs font-bold uppercase px-3 py-1 rounded-full">{appointment.status}</span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="md:col-span-1 space-y-4">
                    <div style={{color: colors.sidebarText}} className="flex items-center">
                        <Mail className="w-4 h-4 mr-3 flex-shrink-0" />
                        <a href={`mailto:${appointment.email}`} style={{color: colors.primary}} className="hover:underline truncate text-sm">{appointment.email}</a>
                    </div>
                    <div style={{color: colors.sidebarText}} className="flex items-center">
                        <Phone className="w-4 h-4 mr-3 flex-shrink-0" />
                        <span className="text-sm">{appointment.phone}</span>
                    </div>
                    <div style={{borderColor: colors.border}} className="flex items-center text-gray-600 pt-2 border-t mt-2">
                        <Calendar className="w-4 h-4 mr-3 flex-shrink-0" />
                        <span className="text-sm font-medium">{new Date(appointment.date).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })} at {appointment.time}</span>
                    </div>
                </div>

                <div className="md:col-span-2 space-y-4">
                    <div>
                        <p style={{color: colors.mainText}} className="font-semibold text-sm mb-1">Service Requested</p>
                        <p style={{color: colors.sidebarText}} className="text-sm">{appointment.service}</p>
                    </div>
                    {appointment.message && (
                        <div>
                             <p style={{color: colors.mainText}} className="font-semibold text-sm mb-1">Message</p>
                            <div style={{color: colors.sidebarText}} className="flex items-start text-sm">
                                <MessageSquare className="w-4 h-4 mr-3 mt-0.5 flex-shrink-0" />
                                <p className="italic">{appointment.message}</p>
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {appointment.favorite_item_image_url && appointment.favorite_item_image_url.length > 0 && (
                <div className="mt-4 pt-4 border-t">
                    <h4 style={{color: colors.sidebarText}} className="text-sm font-semibold mb-2">Selected Items</h4>
                    <div className="flex flex-wrap gap-3">
                        {appointment.favorite_item_image_url.map((imageUrl, index) => (
                            <img
                                key={index}
                                src={imageUrl}
                                alt={`Favorite Item ${index + 1}`}
                                style={{borderColor: colors.border}}
                                className="w-16 h-16 object-cover rounded-lg shadow-sm border"
                            />
                        ))}
                    </div>
                </div>
            )}

            <div style={{borderColor: colors.border}} className="mt-4 pt-4 border-t flex justify-end space-x-2">
                <button onClick={() => onUpdateStatus(appointment.id, 'done')} disabled={appointment.status === 'done'} className="px-3 py-1.5 text-xs font-semibold text-green-800 bg-green-100 rounded-md hover:bg-green-200 disabled:opacity-60 disabled:cursor-not-allowed flex items-center"><Check className="w-4 h-4 mr-1" /> Mark as Done</button>
                <button onClick={() => onUpdateStatus(appointment.id, 'cancelled')} disabled={appointment.status === 'cancelled'} className="px-3 py-1.5 text-xs font-semibold text-red-800 bg-red-100 rounded-md hover:bg-red-200 disabled:opacity-60 disabled:cursor-not-allowed flex items-center"><X className="w-4 h-4 mr-1" /> Cancel</button>
            </div>
        </div>
    );
};

const AppointmentManager = () => {
    const { colors } = useContext(ThemeContext);
    const [appointments, setAppointments] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const fetchAppointments = async () => {
        try {
            setLoading(true);
            const response = await axios.get('/api/v1/admin/appointments');
            const appointmentsWithParsedImages = response.data.map(app => {
                let imageUrls = [];
                try {
                    if (typeof app.favorite_item_image_url === 'string') {
                        const parsed = JSON.parse(app.favorite_item_image_url);
                        imageUrls = Array.isArray(parsed) ? parsed : [];
                    } else if (Array.isArray(app.favorite_item_image_url)) {
                        imageUrls = app.favorite_item_image_url;
                    }
                } catch (e) {
                    console.error('Failed to parse favorite_item_image_url:', e);
                }
                return { ...app, favorite_item_image_url: imageUrls };
            });
            const sortedAppointments = [...appointmentsWithParsedImages].sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
            setAppointments(sortedAppointments);
        } catch (err) {
            console.error('Error fetching appointments:', err);
            setError('Failed to load appointments. Please try again later.');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchAppointments(); // Initial fetch

        const intervalId = setInterval(fetchAppointments, 60000); // Fetch every 60 seconds

        return () => clearInterval(intervalId); // Cleanup on unmount
    }, []);

    const handleUpdateStatus = async (id, status) => {
        try {
            const response = await axios.patch(`/api/v1/admin/appointments/${id}/status`, { status });
            const updatedAppointment = response.data.appointment;

            let imageUrls = [];
            try {
                if (typeof updatedAppointment.favorite_item_image_url === 'string') {
                    const parsed = JSON.parse(updatedAppointment.favorite_item_image_url);
                    imageUrls = Array.isArray(parsed) ? parsed : [];
                } else if (Array.isArray(updatedAppointment.favorite_item_image_url)) {
                    imageUrls = updatedAppointment.favorite_item_image_url;
                }
            } catch (e) {
                console.error('Failed to parse favorite_item_image_url on update:', e);
            }

            const finalUpdatedAppointment = { ...updatedAppointment, favorite_item_image_url: imageUrls };

            setAppointments(prev =>
                prev.map(app => app.id === id ? finalUpdatedAppointment : app)
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
                setAppointments(prev => prev.filter(app => app.status !== 'done'));
            } catch (err) {
                console.error('Error clearing completed appointments:', err);
                alert('Failed to clear completed appointments. Please try again.');
            }
        }
    };

    const renderContent = () => {
        if (loading) {
            return <div className="flex justify-center items-center h-64"><Loader style={{color: colors.primary}} className="animate-spin" size={48} /></div>;
        }

        if (error) {
            return <div className="flex flex-col items-center justify-center h-64 bg-red-50 text-red-700 rounded-lg"><AlertTriangle size={48} className="mb-4" /><p>{error}</p></div>;
        }

        if (appointments.length === 0) {
            return <p style={{color: colors.sidebarText}} className="text-center">No appointments found.</p>;
        }

        return (
            <div
                className="space-y-4"
            >
                {appointments.map(appointment => (
                    <AppointmentRow key={appointment.id} appointment={appointment} onUpdateStatus={handleUpdateStatus} colors={colors} />
                ))}
            </div>
        );
    };

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <div>
                    <h1 style={{color: colors.mainText}} className="text-3xl font-bold">Appointment Requests</h1>
                    <p style={{color: colors.sidebarText}} className="mt-1">Manage incoming appointment requests from customers.</p>
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