import React, { Children, useContext } from 'react';
import useUserRole from '../hooks/useUserRole';
import { Navigate } from 'react-router';
import { AuthContext } from './AuthProvider';

const AdminRoute = ({ children }) => {
    const { user, loading } = useContext(AuthContext);
    const { role, roleLoading } = useUserRole();

    if (loading || roleLoading) {
        return <span className="loading loading-spinner loading-xl"></span>
    }

    if (!user || role !== 'admin') {
        return <Navigate state={{ from: location.pathname }} to="/dashboard/forbidden"></Navigate>
    }

    return children;
};

export default AdminRoute;