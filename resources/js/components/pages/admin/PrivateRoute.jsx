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
            // Attempt to re-fetch user data or simply reconstruct it from session storage
            // For now, we'll assume setUserData can handle empty input if data not in storage.
            // In a real app, you might have an /admin/user endpoint to get current user details
            const storedRoles = sessionStorage.getItem('user_roles');
            const storedPermissions = sessionStorage.getItem('user_permissions');
            if (storedRoles && storedPermissions) {
                setUserData({
                    roles: JSON.parse(storedRoles),
                    permissions: JSON.parse(storedPermissions)
                });
            }
        }
    }, [adminToken, userPermissions.length, userRoles.length, setUserData]);

    // Check if user is authenticated and has any permissions (implying admin access)
    const isAuthenticated = !!adminToken;
    const hasAdminPermissions = userPermissions.length > 0 || userRoles.includes('super-admin');

    // If not authenticated or no admin permissions, redirect to login
    if (!isAuthenticated || !hasAdminPermissions) {
        // Clear any lingering tokens/data if access is denied
        sessionStorage.removeItem('admin_token');
        localStorage.removeItem('admin_token');
        sessionStorage.removeItem('user_roles');
        sessionStorage.removeItem('user_permissions');
        sessionStorage.removeItem('isAdmin'); // Clear old flag
        return <Navigate to="/admin/login" />;
    }

    return <Outlet />;
};

export default PrivateRoute;
