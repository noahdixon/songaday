import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

interface ProtectedRouteProps {
    element: React.ReactElement;
}

export const LoggedInRoute: React.FC<ProtectedRouteProps> = ({ element }) => {
    const { isLoggedIn } = useAuth();
    return isLoggedIn ? element : <Navigate to="/login" replace />;
};

export const LoggedOutRoute: React.FC<ProtectedRouteProps> = ({ element }) => {
    const { isLoggedIn } = useAuth();
    return !isLoggedIn ? element : <Navigate to="/home" replace />;
};