import React, { createContext, useState, useContext, useCallback, useEffect } from 'react';
import axios from 'axios';
import { useQuery, useQueryClient } from '@tanstack/react-query';

const AdminContext = createContext();

export const useAdmin = () => useContext(AdminContext);

export const AdminProvider = ({ children }) => {
    const queryClient = useQueryClient();

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
        collections: 0, subscribers: 0, pending_appointments: 0, pending_gifts: 0 
    } } = useQuery({
        queryKey: ['admin-stats'],
        queryFn: async () => {
            const { data } = await axios.get('/api/v1/admin/stats');
            return data.data;
        }
    });

    const { data: collections = [], isLoading: collectionsLoading } = useQuery({
        queryKey: ['admin-collections'],
        queryFn: async () => {
            const { data } = await axios.get('/api/v1/admin/collections');
            return data.data;
        }
    });

    const { data: products = [], isLoading: productsLoading } = useQuery({
        queryKey: ['admin-products'],
        queryFn: async () => {
            const { data } = await axios.get('/api/v1/products', { 
                params: { 
                    per_page: 1000,
                    include_hidden: true
                } 
            });
            return data.data;
        }
    });

    const { data: outOfStockItems = [], isLoading: outOfStockLoading } = useQuery({
        queryKey: ['outOfStockItems'],
        queryFn: async () => {
            const { data } = await axios.get('/api/v1/gift-items/out-of-stock');
            return Array.isArray(data) ? data : [];
        }
    });

    // Pagination states for local control
    const [appPage, setAppPage] = useState(1);
    const [giftPage, setGiftPage] = useState(1);

    const { data: appointmentsData, isLoading: appointmentsLoading } = useQuery({
        queryKey: ['admin-appointments', appPage],
        queryFn: async () => {
            const { data } = await axios.get(`/api/v1/admin/appointments?page=${appPage}`);
            return data;
        }
    });

    const { data: giftRequestsData, isLoading: giftRequestsLoading } = useQuery({
        queryKey: ['admin-gift-requests', giftPage],
        queryFn: async () => {
            const { data } = await axios.get(`/api/v1/gift-requests?page=${giftPage}`);
            return data;
        }
    });

    const appointments = appointmentsData?.data || [];
    const appointmentsPagination = {
        currentPage: appointmentsData?.current_page || 1,
        lastPage: appointmentsData?.last_page || 1,
        total: appointmentsData?.total || 0
    };

    const giftRequests = giftRequestsData?.data || (Array.isArray(giftRequestsData) ? giftRequestsData : []);
    const giftRequestsPagination = {
        currentPage: giftRequestsData?.current_page || 1,
        lastPage: giftRequestsData?.last_page || 1,
        total: giftRequestsData?.total || 0
    };

    const [isEditing, setIsEditing] = useState(false);
    const [showCollections, setShowCollections] = useState(false);

    // --- Legacy Handlers (kept for compatibility) ---
    const fetchStats = () => queryClient.invalidateQueries({ queryKey: ['admin-stats'] });
    const fetchCollections = () => queryClient.invalidateQueries({ queryKey: ['admin-collections'] });
    const fetchProducts = () => queryClient.invalidateQueries({ queryKey: ['admin-products'] });
    const fetchOutOfStockItems = () => queryClient.invalidateQueries({ queryKey: ['outOfStockItems'] });
    const fetchAppointments = (page = 1) => setAppPage(page);
    const fetchGiftRequests = (page = 1) => setGiftPage(page);

    const loadMoreAppointments = () => {
        if (appointmentsPagination.currentPage < appointmentsPagination.lastPage) {
            setAppPage(prev => prev + 1);
        }
    };

    const loadMoreGiftRequests = () => {
        if (giftRequestsPagination.currentPage < giftRequestsPagination.lastPage) {
            setGiftPage(prev => prev + 1);
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
            await axios.patch(`/api/v1/admin/appointments/${id}/status`, { status });
            queryClient.invalidateQueries(); // Invalidate all since stats might change too
        } catch (err) {
            console.error('Failed to update status:', err);
            throw err;
        }
    };

    const clearClosedAppointments = async () => {
        try {
            await axios.delete('/api/v1/admin/appointments/completed');
            queryClient.invalidateQueries();
        } catch (err) {
            console.error('Failed to clear closed appointments:', err);
            throw err;
        }
    };

    const updateGiftRequestStatus = async (id, status) => {
        try {
            await axios.patch(`/api/v1/admin/gift-requests/${id}/status`, { status });
            queryClient.invalidateQueries();
        } catch (err) {
            console.error('Failed to update gift status:', err);
            throw err;
        }
    };

    const deleteGiftRequest = async (id) => {
        try {
            await axios.delete(`/api/v1/admin/gift-requests/${id}`);
            queryClient.invalidateQueries();
        } catch (err) {
            console.error('Failed to delete gift request:', err);
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

            products,
            productsLoading,
            fetchProducts,

            outOfStockItems,
            outOfStockLoading,
            fetchOutOfStockItems,

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
            setPerformanceMode
        }}>
            {children}
        </AdminContext.Provider>
    );
};
