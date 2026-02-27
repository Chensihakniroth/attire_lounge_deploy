import React, { createContext, useState, useContext, useCallback } from 'react';
import axios from 'axios';

const AdminContext = createContext();

export const useAdmin = () => useContext(AdminContext);

export const AdminProvider = ({ children }) => {
    // State for Appointments
    const [appointments, setAppointments] = useState([]);
    const [appointmentsLoaded, setAppointmentsLoaded] = useState(false);
    const [appointmentsLoading, setAppointmentsLoading] = useState(false);

    // State for Gift Requests
    const [giftRequests, setGiftRequests] = useState([]);
    const [giftRequestsLoaded, setGiftRequestsLoaded] = useState(false);
    const [giftRequestsLoading, setGiftRequestsLoading] = useState(false);

    // Global Stats (derived or fetched)
    const [stats, setStats] = useState({ 
        appointments: 0, 
        gifts: 0, 
        products: 0, 
        collections: 0, 
        subscribers: 0,
        pending_appointments: 0,
        pending_gifts: 0
    });

    const [isEditing, setIsEditing] = useState(false);

    const fetchStats = useCallback(async () => {
        try {
            const response = await axios.get('/api/v1/admin/stats');
            if (response.data.success) {
                setStats(response.data.data);
            }
        } catch (err) {
            console.error('Error fetching stats:', err);
        }
    }, []);

    // --- Appointments Logic ---
    const fetchAppointments = useCallback(async (forceRefresh = false) => {
        // If we already have data and aren't forcing a refresh, just return (or fetch in background)
        if (appointmentsLoaded && !forceRefresh) {
            // Background update (stale-while-revalidate)
            fetchAppointmentsBackground();
            return;
        }

        setAppointmentsLoading(true);
        try {
            const response = await axios.get('/api/v1/admin/appointments');
            // Assuming backend already sorts, but we can ensure consistency here if needed
            setAppointments(response.data);
            setAppointmentsLoaded(true);
            fetchStats(); // Refresh stats when data changes
        } catch (err) {
            console.error('Error fetching appointments:', err);
        } finally {
            setAppointmentsLoading(false);
        }
    }, [appointmentsLoaded, fetchStats]);

    const fetchAppointmentsBackground = async () => {
        try {
            const response = await axios.get('/api/v1/admin/appointments');
            setAppointments(response.data);
            fetchStats();
        } catch (err) {
            console.error('Error refreshing appointments:', err);
        }
    };

    const updateAppointmentStatus = async (id, status) => {
        // Optimistic update
        const previous = [...appointments];
        setAppointments(prev => prev.map(app => app.id === id ? { ...app, status } : app));

        try {
            await axios.patch(`/api/v1/admin/appointments/${id}/status`, { status });
            fetchStats(); // Refresh stats
        } catch (err) {
            console.error('Failed to update status:', err);
            setAppointments(previous); // Revert
            throw err;
        }
    };

    const clearCompletedAppointments = async () => {
        const previous = [...appointments];
        setAppointments(prev => prev.filter(app => app.status !== 'done'));
        try {
            await axios.post('/api/v1/admin/appointments/clear-completed');
            fetchStats();
        } catch (err) {
            setAppointments(previous);
            throw err;
        }
    };

    // --- Gift Requests Logic ---
    const fetchGiftRequests = useCallback(async (forceRefresh = false) => {
        if (giftRequestsLoaded && !forceRefresh) {
            fetchGiftRequestsBackground();
            return;
        }

        setGiftRequestsLoading(true);
        try {
            const response = await axios.get('/api/v1/gift-requests');
            setGiftRequests(response.data);
            setGiftRequestsLoaded(true);
            fetchStats();
        } catch (err) {
            console.error('Error fetching gift requests:', err);
        } finally {
            setGiftRequestsLoading(false);
        }
    }, [giftRequestsLoaded, fetchStats]);

    const fetchGiftRequestsBackground = async () => {
        try {
            const response = await axios.get('/api/v1/gift-requests');
            setGiftRequests(response.data);
            fetchStats();
        } catch (err) {
            console.error('Error refreshing gift requests:', err);
        }
    };

    const updateGiftRequestStatus = async (id, status) => {
        const previous = [...giftRequests];
        setGiftRequests(prev => prev.map(req => req.id === id ? { ...req, status } : req));
        try {
            await axios.patch(`/api/v1/gift-requests/${id}/status`, { status });
            fetchStats();
        } catch (err) {
            setGiftRequests(previous);
            throw err;
        }
    };

    const deleteGiftRequest = async (id) => {
        const previous = [...giftRequests];
        setGiftRequests(prev => prev.filter(req => req.id !== id));
        try {
            await axios.delete(`/api/v1/gift-requests/${id}`);
            fetchStats();
        } catch (err) {
            setGiftRequests(previous);
            throw err;
        }
    };

    // --- Stats Helper ---
    const updateStats = (newStats) => {
        setStats(prev => ({ ...prev, ...newStats }));
    };

    return (
        <AdminContext.Provider value={{
            appointments,
            appointmentsLoading,
            fetchAppointments,
            updateAppointmentStatus,
            clearCompletedAppointments,
            
            giftRequests,
            giftRequestsLoading,
            fetchGiftRequests,
            updateGiftRequestStatus,
            deleteGiftRequest,

            stats,
            fetchStats,

            isEditing,
            setIsEditing
        }}>
            {children}
        </AdminContext.Provider>
    );
};
