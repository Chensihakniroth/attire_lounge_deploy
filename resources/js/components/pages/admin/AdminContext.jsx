import React, { createContext, useState, useContext, useCallback, useEffect, useMemo } from 'react';
import axios from 'axios';
import { useQuery, useQueryClient } from '@tanstack/react-query';

const AdminContext = createContext();

export const useAdmin = () => useContext(AdminContext);

export const AdminProvider = ({ children }) => {
    const queryClient = useQueryClient();

    // ─── Outlet Configuration ─────────────────────────────────────────
    const OUTLET_CONFIG = {
        attire_lounge: { label: 'Attire Lounge', shortLabel: 'AL', color: '#0d3542' },
        caffeine:      { label: 'Caffeine',      shortLabel: 'CF', color: '#6f4e37' },
        kravat:        { label: 'Kravat',         shortLabel: 'KV', color: '#3d2b56' },
    };

    const [activeOutlet, setActiveOutletState] = useState(() => {
        return localStorage.getItem('active_outlet') || 'attire_lounge';
    });

    // Persist outlet selection
    useEffect(() => {
        localStorage.setItem('active_outlet', activeOutlet);
    }, [activeOutlet]);

    const setActiveOutlet = useCallback((outlet) => {
        if (outlet === activeOutlet) return;
        setActiveOutletState(outlet);
        // Only invalidate outlet-scoped queries — appointments/gifts are global
        queryClient.invalidateQueries({ queryKey: ['admin-stats'] });
        queryClient.invalidateQueries({ queryKey: ['admin-collections'] });
        queryClient.invalidateQueries({ queryKey: ['outOfStockItems'] });
        queryClient.invalidateQueries({ queryKey: ['admin-drinks'] });
        queryClient.invalidateQueries({ queryKey: ['admin-pos-products'] });
    }, [activeOutlet, queryClient]);

    // State for user details
    const [user, setUser] = useState(null);
    const [userRoles, setUserRoles] = useState([]);
    const [userPermissions, setUserPermissions] = useState([]);
    const [performanceMode, setPerformanceMode] = useState(() => {
        return localStorage.getItem('sovereign_sync') === 'true';
    });

    // Function to set user data after login
    const setUserData = useCallback((userData, persistent = false) => {
        const roles = userData?.roles || [];
        const permissions = userData?.permissions || [];
        setUser(userData);
        setUserRoles(roles);
        setUserPermissions(permissions);
        
        const storage = persistent ? localStorage : sessionStorage;
        
        storage.setItem('admin_user', JSON.stringify(userData));
        storage.setItem('user_roles', JSON.stringify(roles));
        storage.setItem('user_permissions', JSON.stringify(permissions));
    }, []);

    // Load user data from session storage on mount
    useEffect(() => {
        const storedUser = sessionStorage.getItem('admin_user') || localStorage.getItem('admin_user');
        const storedRoles = sessionStorage.getItem('user_roles') || localStorage.getItem('user_roles');
        const storedPermissions = sessionStorage.getItem('user_permissions') || localStorage.getItem('user_permissions');
        
        if (storedUser) setUser(JSON.parse(storedUser));
        if (storedRoles) setUserRoles(JSON.parse(storedRoles));
        if (storedPermissions) setUserPermissions(JSON.parse(storedPermissions));
    }, []);

    // Persist Performance Mode & Synchronize with DOM
    useEffect(() => {
        localStorage.setItem('sovereign_sync', performanceMode);
        if (performanceMode) {
            document.documentElement.classList.add('performance-mode');
        } else {
            document.documentElement.classList.remove('performance-mode');
        }
    }, [performanceMode]);

    // Helper to check if user has a specific permission
    const hasPermission = useCallback((permission) => {
        return userPermissions.includes(permission);
    }, [userPermissions]);

    // --- React Query Fetchers ---

    const { data: stats = { 
        appointments: 0, gifts: 0, total_customers: 0, products: 0, 
        collections: 0, subscribers: 0, pending_appointments: 0, pending_gifts: 0,
        pos_products: 0, daily_orders: 0, sales: 0, low_stock: 0
    } } = useQuery({
        queryKey: ['admin-stats', activeOutlet],
        queryFn: async () => {
            const { data } = await axios.get('/api/v1/admin/stats', { headers: { 'X-Active-Outlet': activeOutlet } });
            return data.data;
        },
        staleTime: 60 * 1000,
    });

    const { data: collections = [], isLoading: collectionsLoading } = useQuery({
        queryKey: ['admin-collections', activeOutlet],
        queryFn: async () => {
            const { data } = await axios.get('/api/v1/admin/collections', { headers: { 'X-Active-Outlet': activeOutlet } });
            return data.data;
        },
        staleTime: 2 * 60 * 1000,
    });


    // --- Prefetch Background Data for Instant Switching ---
    useEffect(() => {
        const prefetchData = () => {
            const allOutlets = Object.keys(OUTLET_CONFIG);
            const otherOutlets = allOutlets.filter(o => o !== activeOutlet);
            otherOutlets.forEach(outlet => {
                queryClient.prefetchQuery({
                    queryKey: ['admin-stats', outlet],
                    queryFn: async () => {
                        const { data } = await axios.get('/api/v1/admin/stats', { headers: { 'X-Active-Outlet': outlet } });
                        return data.data;
                    },
                    staleTime: 5 * 60 * 1000,
                });
                queryClient.prefetchQuery({
                    queryKey: ['admin-collections', outlet],
                    queryFn: async () => {
                        const { data } = await axios.get('/api/v1/admin/collections', { headers: { 'X-Active-Outlet': outlet } });
                        return data.data;
                    },
                    staleTime: 5 * 60 * 1000,
                });
            });
        };

        // Defer heavy prefetching so it doesn't block UI navigation
        if ('requestIdleCallback' in window) {
            window.requestIdleCallback(prefetchData, { timeout: 2000 });
        } else {
            setTimeout(prefetchData, 3000);
        }
    }, [activeOutlet, queryClient]);

    // Pagination states for local control
    const [appPage, setAppPage] = useState(1);

    const { data: appointmentsData, isLoading: appointmentsLoading } = useQuery({
        queryKey: ['admin-appointments', appPage],
        queryFn: async () => {
            const { data } = await axios.get(`/api/v1/admin/appointments?page=${appPage}`);
            return data;
        },
        staleTime: 60 * 1000,
    });


    const appointments = appointmentsData?.data || [];
    const appointmentsPagination = {
        currentPage: appointmentsData?.current_page || 1,
        lastPage: appointmentsData?.last_page || 1,
        total: appointmentsData?.total || 0
    };


    const [isEditing, setIsEditing] = useState(false);
    const [showCollections, setShowCollections] = useState(false);

    // --- Legacy Handlers (kept for compatibility) ---
    const fetchStats = () => queryClient.invalidateQueries({ queryKey: ['admin-stats'] });
    const fetchCollections = () => queryClient.invalidateQueries({ queryKey: ['admin-collections'] });
    const fetchAppointments = (page = 1) => setAppPage(page);

    const loadMoreAppointments = () => {
        if (appointmentsPagination.currentPage < appointmentsPagination.lastPage) {
            setAppPage(prev => prev + 1);
        }
    };


    const createAppointment = async (appointmentData) => {
        try {
            const response = await axios.post('/api/v1/appointments', appointmentData);
            queryClient.invalidateQueries({ queryKey: ['admin-appointments'] });
            queryClient.invalidateQueries({ queryKey: ['admin-stats'] });
            return response.data;
        } catch (err) {
            console.error('Failed to create appointment:', err);
            throw err;
        }
    };

    const updateAppointmentStatus = async (id, status) => {
        try {
            const response = await axios.patch(`/api/v1/admin/appointments/${id}/status`, { status });
            queryClient.invalidateQueries({ queryKey: ['admin-appointments'] });
            queryClient.invalidateQueries({ queryKey: ['admin-stats'] });
        } catch (err) {
            console.error('[AdminContext] Failed to update status:', err);
            throw err;
        }
    };

    const clearClosedAppointments = async () => {
        try {
            await axios.delete('/api/v1/admin/appointments/completed');
            queryClient.invalidateQueries({ queryKey: ['admin-appointments'] });
            queryClient.invalidateQueries({ queryKey: ['admin-stats'] });
        } catch (err) {
            console.error('Failed to clear closed appointments:', err);
            throw err;
        }
    };


    return (
        <AdminContext.Provider value={{
            appointments,
            appointmentsLoading,
            fetchAppointments,
            loadMoreAppointments,
            createAppointment,
            appointmentsPagination,
            updateAppointmentStatus,
            clearClosedAppointments,
            




            stats,
            fetchStats,

            collections,
            collectionsLoading,
            fetchCollections,

            isEditing,
            setIsEditing,
            showCollections,
            setShowCollections,

            user,
            userRoles,
            userPermissions,
            setUserData,
            hasPermission,
            performanceMode,
            setPerformanceMode,

            // Outlet
            activeOutlet,
            setActiveOutlet,
            OUTLET_CONFIG,
        }}>
            {children}
        </AdminContext.Provider>
    );
};
