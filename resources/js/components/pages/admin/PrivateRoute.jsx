import React, { useEffect } from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useAdmin } from './AdminContext'; // Import useAdmin

const PrivateRoute = () => {
    const { userPermissions, userRoles, isInitializing, adminToken } = useAdmin();

    // While initializing (re-hydrating from token), show a simple loader or nothing
    if (isInitializing) {
        return (
            <div className="min-h-screen bg-[#0d1117] flex items-center justify-center">
                <div className="w-8 h-8 border-2 border-white/10 border-t-white rounded-full animate-spin" />
            </div>
        );
    }

    // Check if user is authenticated
    const isAuthenticated = !!adminToken;
    
    // Check for admin permissions or super-admin role
    const hasAdminAccess = userRoles.includes('super-admin') || userRoles.includes('admin') || userPermissions.length > 0;
    
    if (!isAuthenticated || !hasAdminAccess) {
        return <Navigate to="/admin/login" replace />;
    }

    return <Outlet />;
};

export default PrivateRoute;
