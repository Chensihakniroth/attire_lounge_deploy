import React, { createContext, useState, useContext, useCallback, useEffect } from 'react';
import axios from 'axios';

const AdminContext = createContext();

export const useAdmin = () => useContext(AdminContext);

export const AdminProvider = ({ children }) => {
    // State for user roles and permissions
    const [userRoles, setUserRoles] = useState([]);
    const [userPermissions, setUserPermissions] = useState([]);

    // Function to set user data after login
    const setUserData = useCallback((user) => {
        const roles = user?.roles || [];
        const permissions = user?.permissions || [];
        setUserRoles(roles);
        setUserPermissions(permissions);
        sessionStorage.setItem('user_roles', JSON.stringify(roles));
        sessionStorage.setItem('user_permissions', JSON.stringify(permissions));
    }, []);

    // Load user data from session storage on mount
    useEffect(() => {
        const storedRoles = sessionStorage.getItem('user_roles');
        const storedPermissions = sessionStorage.getItem('user_permissions');
        if (storedRoles) {
            setUserRoles(JSON.parse(storedRoles));
        }
        if (storedPermissions) {
            setUserPermissions(JSON.parse(storedPermissions));
        }
    }, []);

    // Helper to check if user has a specific permission
    const hasPermission = useCallback((permission) => {
        return userPermissions.includes(permission);
    }, [userPermissions]);

    // State for Appointments
    const [appointments, setAppointments] = useState([]);
    const [appointmentsPagination, setAppointmentsPagination] = useState({
        currentPage: 1,
        lastPage: 1,
        total: 0
    });
    const [appointmentsLoaded, setAppointmentsLoaded] = useState(false);
    const [appointmentsLoading, setAppointmentsLoading] = useState(false);

    // State for Gift Requests
    const [giftRequests, setGiftRequests] = useState([]);
    const [giftRequestsPagination, setGiftRequestsPagination] = useState({
        currentPage: 1,
        lastPage: 1,
        total: 0
    });
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
    const [showCollections, setShowCollections] = useState(false);
    const [collections, setCollections] = useState([]);
    const [collectionsLoading, setCollectionsLoading] = useState(false);

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

    const fetchCollections = useCallback(async () => {
        setCollectionsLoading(true);
        try {
            const response = await axios.get('/api/v1/products/collections');
            if (response.data.success) {
                setCollections(response.data.data);
            }
        } catch (err) {
            console.error('Error fetching collections:', err);
        } finally {
            setCollectionsLoading(false);
        }
    }, []);

    // --- Appointments Logic ---
    const fetchAppointments = useCallback(async (page = 1, forceRefresh = false) => {
        // If we already have data and aren't forcing a refresh, just return (unless it's a new page)
        if (appointmentsLoaded && !forceRefresh && page === 1) {
            // Background update (stale-while-revalidate) for page 1
            fetchAppointmentsBackground();
            return;
        }

        setAppointmentsLoading(true);
        try {
            const response = await axios.get(`/api/v1/admin/appointments?page=${page}`);
            const { data, current_page, last_page, total } = response.data;
            
            if (page === 1) {
                setAppointments(data);
            } else {
                setAppointments(prev => {
                    // Filter out duplicates just in case
                    const newIds = new Set(data.map(a => a.id));
                    return [...prev.filter(a => !newIds.has(a.id)), ...data];
                });
            }

            setAppointmentsPagination({
                currentPage: current_page,
                lastPage: last_page,
                total: total
            });
            setAppointmentsLoaded(true);
            
            if (page === 1) {
                fetchStats(); // Refresh stats when data changes
            }
        } catch (err) {
            console.error('Error fetching appointments:', err);
        } finally {
            setAppointmentsLoading(false);
        }
    }, [appointmentsLoaded, fetchStats]);

    const fetchAppointmentsBackground = async () => {
        try {
            const response = await axios.get('/api/v1/admin/appointments?page=1');
            const { data, current_page, last_page, total } = response.data;
            
            // Only update if it's page 1
            setAppointments(prev => {
                // Keep existing items that are NOT in the new page 1, then prepend/replace page 1
                // Actually, simpler to just replace page 1 items and keep the rest? 
                // For simplicity in background refresh, let's just update the first page's worth of data 
                // or just replace everything if we want to be strict, but that kills infinite scroll state.
                // Best approach for "stale-while-revalidate" with pagination is tricky.
                // Let's just update the items that match IDs or prepend new ones.
                
                // Simple strategy: Replace the first N items where N is page size.
                // Or easier: Just setAppointments(data) if we assume user is at top. 
                // But let's be safe:
                return data; // Reset to page 1 to ensure freshness on dashboard load
            });

             setAppointmentsPagination({
                currentPage: current_page,
                lastPage: last_page,
                total: total
            });
            fetchStats();
        } catch (err) {
            console.error('Error refreshing appointments:', err);
        }
    };

    const loadMoreAppointments = async () => {
        if (appointmentsPagination.currentPage < appointmentsPagination.lastPage) {
            await fetchAppointments(appointmentsPagination.currentPage + 1);
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
            await axios.delete('/api/v1/admin/appointments/completed');
            // Reset pagination as we've deleted items
            fetchAppointments(1, true);
            fetchStats();
        } catch (err) {
            setAppointments(previous);
            throw err;
        }
    };

    // --- Gift Requests Logic ---
    const fetchGiftRequests = useCallback(async (page = 1, forceRefresh = false) => {
        if (giftRequestsLoaded && !forceRefresh && page === 1) {
            fetchGiftRequestsBackground();
            return;
        }

        setGiftRequestsLoading(true);
        try {
            const response = await axios.get(`/api/v1/gift-requests?page=${page}`);
            let data, meta;

            // Handle both pagination object and plain array (fallback)
            if (Array.isArray(response.data)) {
                data = response.data;
                meta = { current_page: 1, last_page: 1, total: data.length };
            } else if (response.data && response.data.data) {
                data = response.data.data;
                meta = { 
                    current_page: response.data.current_page, 
                    last_page: response.data.last_page, 
                    total: response.data.total 
                };
            } else {
                data = [];
                meta = { current_page: 1, last_page: 1, total: 0 };
            }
            
            if (page === 1) {
                setGiftRequests(data);
            } else {
                setGiftRequests(prev => {
                     const newIds = new Set(data.map(r => r.id));
                     return [...prev.filter(r => !newIds.has(r.id)), ...data];
                });
            }

            setGiftRequestsPagination(meta);
            setGiftRequestsLoaded(true);
            if (page === 1) fetchStats();
        } catch (err) {
            console.error('Error fetching gift requests:', err);
            setGiftRequests([]); // Ensure state is valid on error
        } finally {
            setGiftRequestsLoading(false);
        }
    }, [giftRequestsLoaded, fetchStats]);

    const fetchGiftRequestsBackground = async () => {
        try {
            const response = await axios.get('/api/v1/gift-requests?page=1');
            let data;
             if (Array.isArray(response.data)) {
                data = response.data;
            } else if (response.data && response.data.data) {
                data = response.data.data;
            } else {
                data = [];
            }
            
            setGiftRequests(prev => {
                // Simplified refresh logic: just update if needed or replace top.
                // For accurate pagination state, resetting to page 1 data on refresh is safest
                return data;
            });
            // We can also update pagination here if needed, but background refresh usually doesn't change page count drastically
            if (response.data && response.data.total) {
                 setGiftRequestsPagination(prev => ({ ...prev, total: response.data.total }));
            }
            fetchStats();
        } catch (err) {
            console.error('Error refreshing gift requests:', err);
        }
    };

    const loadMoreGiftRequests = async () => {
        if (giftRequestsPagination.currentPage < giftRequestsPagination.lastPage) {
            await fetchGiftRequests(giftRequestsPagination.currentPage + 1);
        }
    };

    const updateGiftRequestStatus = async (id, status) => {
        const previous = [...giftRequests];
        setGiftRequests(prev => prev.map(req => req.id === id ? { ...req, status } : req));
        try {
            await axios.patch(`/api/v1/admin/gift-requests/${id}/status`, { status });
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
            await axios.delete(`/api/v1/admin/gift-requests/${id}`);
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
            loadMoreAppointments,
            appointmentsPagination,
            updateAppointmentStatus,
            clearCompletedAppointments,
            
            giftRequests,
            giftRequestsLoading,
            fetchGiftRequests,
            loadMoreGiftRequests,
            giftRequestsPagination,
            updateGiftRequestStatus,
            deleteGiftRequest,

            stats,
            fetchStats,

            collections,
            collectionsLoading,
            fetchCollections,

            isEditing,
            setIsEditing,
            showCollections,
            setShowCollections,

            userRoles,
            userPermissions,
            setUserData,
            hasPermission
        }}>
            {children}
        </AdminContext.Provider>
    );
};
