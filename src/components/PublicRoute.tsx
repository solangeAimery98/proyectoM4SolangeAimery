import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../features/auth/AuthContext';

interface PublicRouteProps {
    children: React.ReactElement;
}

export const PublicRoute: React.FC<PublicRouteProps> = ({ children }) => {
    const { currentUser, loading } = useAuth();

    if (loading) {
        return <div>Cargando...</div>;
    }

    if (currentUser) {
        return <Navigate to="/" replace />;
    }

    return children;
};