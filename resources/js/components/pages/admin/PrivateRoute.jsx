import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';

const PrivateRoute = () => {
    const isAdmin = sessionStorage.getItem('isAdmin') === 'true';
    return isAdmin ? <Outlet /> : <Navigate to="/admin/login" />;
};

export default PrivateRoute;
