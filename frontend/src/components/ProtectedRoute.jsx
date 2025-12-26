import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

const ProtectedRoute = ({ allowedRoles = [] }) => {
    const { user, isAuthenticated, loading } = useAuth();

    if (loading) {
        return <div className="min-h-screen flex items-center justify-center">Loading...</div>; // Or a nice spinner
    }

    if (!isAuthenticated) {
        return <Navigate to="/login" replace />;
    }

    // specific role check if allowedRoles is provided
    if (allowedRoles.length > 0 && !allowedRoles.includes(user?.role)) {
       return <Navigate to="/" replace />;
    }

    return <Outlet />;
};

export default ProtectedRoute;
