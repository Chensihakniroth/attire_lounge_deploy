import React, { useEffect } from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useAdmin } from './AdminContext'; // Import useAdmin

const PrivateRoute = () => {
    const { userPermissions, userRoles, setUserData } = useAdmin();
    const adminToken = sessionStorage.getItem('admin_token') || localStorage.getItem('admin_token');

    // On initial load, try to retrieve user data from session storage if token exists
    // This handles page refreshes where context might be reset but token persists
    useEffect(() => {
        if (adminToken && userPermissions.length === 0 && userRoles.length === 0) {
            // Attempt to re-fetch user data or simply reconstruct it from storage
            const storedRoles = sessionStorage.getItem('user_roles') || localStorage.getItem('user_roles');
            const storedPermissions = sessionStorage.getItem('user_permissions') || localStorage.getItem('user_permissions');
            const storedUser = sessionStorage.getItem('admin_user') || localStorage.getItem('admin_user');
            
            if (storedRoles && storedPermissions) {
                setUserData(storedUser ? JSON.parse(storedUser) : {
                    roles: JSON.parse(storedRoles),
                    permissions: JSON.parse(storedPermissions)
                }, !!localStorage.getItem('admin_token'));
            }
        }
    }, [adminToken, userPermissions.length, userRoles.length, setUserData]);

    // Check if user is authenticated and has any permissions (implying admin access)
    const isAuthenticated = !!adminToken;
    const hasAdminPermissions = userPermissions.length > 0 || userRoles.includes('super-admin');

    // If not authenticated or no admin permissions, redirect to login
    if (!isAuthenticated || !hasAdminPermissions) {
        // Clear any lingering tokens/data if access is denied
        const storages = [sessionStorage, localStorage];
        storages.forEach(storage => {
            storage.removeItem('admin_token');
            storage.removeItem('admin_user');
            storage.removeItem('user_roles');
            storage.removeItem('user_permissions');
            storage.removeItem('isAdmin');
        });
        return <Navigate to="/admin/login" />;
    }

    return <Outlet />;
};

export default PrivateRoute;
