import React, {
    createContext,
    useState,
    useContext,
    useCallback,
    useEffect,
    useMemo,
} from 'react';
import axios from 'axios';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import API from '../../../api';

const AdminContext = createContext();

export const useAdmin = () => useContext(AdminContext);

export const AdminProvider = ({ children }) => {
    const queryClient = useQueryClient();

    // ─── Outlet Configuration ─────────────────────────────────────────
    const OUTLET_CONFIG = {
        attire_lounge: {
            label: 'Attire Lounge',
            shortLabel: 'AL',
            color: '#0d3542',
            logo: 'https://bucket-production-4ca0.up.railway.app/product-assets/uploads/asset/ALO.png',
        },
        caffeine: { label: 'CUFFEINE', shortLabel: 'CF', color: '#6f4e37', logo: 'https://bucket-production-4ca0.up.railway.app/product-assets/uploads/asset/cuff.png' },
        kravat: { label: 'Kravat', shortLabel: 'KV', color: '#3d2b56', logo: 'https://bucket-production-4ca0.up.railway.app/product-assets/uploads/asset/@asset5.png' },
        nile: { label: 'Nile', shortLabel: 'NL', color: '#1a1a2e', logo: 'https://bucket-production-4ca0.up.railway.app/product-assets/uploads/asset/nile-logo-white.png' },
    };

    const [activeOutlet, setActiveOutletState] = useState(() => {
        return localStorage.getItem('active_outlet') || 'attire_lounge';
    });

    // Persist outlet selection
    useEffect(() => {
        localStorage.setItem('active_outlet', activeOutlet);
    }, [activeOutlet]);

    const setActiveOutlet = useCallback(
        (outlet) => {
            if (outlet === activeOutlet) return;
            setActiveOutletState(outlet);
            queryClient.invalidateQueries({ queryKey: ['admin-stats'] });
            queryClient.invalidateQueries({ queryKey: ['admin-collections'] });
            queryClient.invalidateQueries({ queryKey: ['outOfStockItems'] });
            queryClient.invalidateQueries({ queryKey: ['admin-drinks'] });
            queryClient.invalidateQueries({ queryKey: ['admin-pos-products'] });
            queryClient.invalidateQueries({ queryKey: ['admin-appointments'] });
        },
        [activeOutlet, queryClient]
    );

    // ─── Authentication & User State ──────────────────────────────────
    const [adminToken, setAdminToken] = useState(() =>
        localStorage.getItem('admin_token')
    );

    const [user, setUser] = useState(() => {
        const stored = localStorage.getItem('admin_user');
        try {
            return stored ? JSON.parse(stored) : null;
        } catch (e) {
            return null;
        }
    });

    const [userRoles, setUserRoles] = useState(() => {
        const stored = localStorage.getItem('user_roles');
        try {
            return stored ? JSON.parse(stored) : [];
        } catch (e) {
            return [];
        }
    });

    const [userPermissions, setUserPermissions] = useState(() => {
        const stored = localStorage.getItem('user_permissions');
        try {
            return stored ? JSON.parse(stored) : [];
        } catch (e) {
            return [];
        }
    });

    const [isInitializing, setIsInitializing] = useState(true);

    const logout = useCallback(() => {
        setUser(null);
        setUserRoles([]);
        setUserPermissions([]);
        setAdminToken(null);
        localStorage.removeItem('admin_token');
        localStorage.removeItem('admin_user');
        localStorage.removeItem('user_roles');
        localStorage.removeItem('user_permissions');
        sessionStorage.removeItem('isAdmin');
        delete axios.defaults.headers.common['Authorization'];
        queryClient.clear();
    }, [queryClient]);

    // Re-hydration query
    const { isLoading: profileLoading } = useQuery({
        queryKey: ['admin-profile'],
        queryFn: async () => {
            try {
                const response = await API.getAdminMe();
                const userData = response.data;

                setUser(userData.user);
                setUserRoles(userData.user.roles || []);
                setUserPermissions(userData.user.permissions || []);

                localStorage.setItem(
                    'admin_user',
                    JSON.stringify(userData.user)
                );
                localStorage.setItem(
                    'user_roles',
                    JSON.stringify(userData.user.roles || [])
                );
                localStorage.setItem(
                    'user_permissions',
                    JSON.stringify(userData.user.permissions || [])
                );

                return userData;
            } catch (error) {
                if (error.response?.status === 401) {
                    logout();
                }
                throw error;
            }
        },
        enabled: !!adminToken && !user,
        staleTime: 5 * 60 * 1000,
    });

    useEffect(() => {
        if (!adminToken || (user && !profileLoading)) {
            setIsInitializing(false);
        }
    }, [adminToken, user, profileLoading]);

    const setUserData = useCallback((userData) => {
        const payload = userData?.data ?? userData ?? {};
        const newUser = payload?.user || userData?.user || null;
        const roles = payload?.user?.roles || userData?.roles || payload?.roles || [];
        const permissions =
            payload?.user?.permissions || userData?.permissions || payload?.permissions || [];
        const token = payload?.token || userData?.token || null;

        setUser(newUser);
        setUserRoles(roles);
        setUserPermissions(permissions);

        if (token) {
            setAdminToken(token);
            localStorage.setItem('admin_token', token);
            axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
        }

        if (newUser) {
            localStorage.setItem('admin_user', JSON.stringify(newUser));
            localStorage.setItem('user_roles', JSON.stringify(roles));
            localStorage.setItem(
                'user_permissions',
                JSON.stringify(permissions)
            );
            sessionStorage.setItem('isAdmin', 'true');
        }
    }, []);

    // ─── Editing State (used by ProductEditor / BulkProductEditor) ────
    const [isEditing, setIsEditing] = useState(false);

    // ─── Performance Mode ─────────────────────────────────────────────
    const [performanceMode, setPerformanceMode] = useState(() => {
        return localStorage.getItem('sovereign_sync') === 'true';
    });

    useEffect(() => {
        localStorage.setItem('sovereign_sync', performanceMode);
        if (performanceMode) {
            document.documentElement.classList.add('performance-mode');
        } else {
            document.documentElement.classList.remove('performance-mode');
        }
    }, [performanceMode]);

    const hasPermission = useCallback(
        (permission) => {
            return userPermissions.includes(permission);
        },
        [userPermissions]
    );

    // ─── Shared Data Queries ──────────────────────────────────────────
    const { data: stats = {}, isLoading: statsLoading } = useQuery({
        queryKey: ['admin-stats', activeOutlet],
        queryFn: async () => {
            const response = await axios.get('/api/v1/admin/stats');
            return response.data.data;
        },
        enabled: !!adminToken && !!user,
        staleTime: 60 * 1000,
    });

    const { data: appointments = [], isLoading: appointmentsLoading } = useQuery({
        queryKey: ['admin-appointments', activeOutlet],
        queryFn: async () => {
            const response = await axios.get('/api/v1/admin/appointments');
            return response.data.data || [];
        },
        enabled: !!adminToken && !!user,
        staleTime: 60 * 1000,
    });

    const { data: collections = [], isLoading: collectionsLoading } = useQuery({
        queryKey: ['admin-collections', activeOutlet],
        queryFn: async () => {
            const response = await axios.get('/api/v1/admin/collections');
            return response.data.data || [];
        },
        enabled: !!adminToken && !!user,
        staleTime: 60 * 1000,
    });

    const appointmentsPagination = useMemo(() => ({
        total: appointments.length,
    }), [appointments]);

    const updateAppointmentStatus = useCallback(async (id, status) => {
        const response = await axios.patch(`/api/v1/admin/appointments/${id}/status`, { status });
        queryClient.invalidateQueries({ queryKey: ['admin-appointments'] });
        return response.data;
    }, [queryClient]);

    const createAppointment = useCallback(async (data) => {
        const response = await axios.post('/api/v1/appointments', data);
        queryClient.invalidateQueries({ queryKey: ['admin-appointments'] });
        return response.data;
    }, [queryClient]);

    const clearClosedAppointments = useCallback(async () => {
        const response = await axios.delete('/api/v1/admin/appointments/completed');
        queryClient.invalidateQueries({ queryKey: ['admin-appointments'] });
        return response.data;
    }, [queryClient]);

    const fetchCollections = useCallback(() => {
        queryClient.invalidateQueries({ queryKey: ['admin-collections'] });
    }, [queryClient]);

    const value = {
        // Auth
        user,
        userRoles,
        userPermissions,
        adminToken,
        setUserData,
        logout,
        hasPermission,
        isInitializing: isInitializing || profileLoading,

        // Outlet
        activeOutlet,
        setActiveOutlet,
        OUTLET_CONFIG,

        // UI/Performance
        isEditing,
        setIsEditing,
        performanceMode,
        setPerformanceMode,

        // Data
        stats,
        statsLoading,
        appointments,
        appointmentsLoading,
        appointmentsPagination,
        collections,
        collectionsLoading,

        // Appointments
        updateAppointmentStatus,
        createAppointment,
        clearClosedAppointments,
        fetchCollections,
    };

    return (
        <AdminContext.Provider value={value}>{children}</AdminContext.Provider>
    );
};
