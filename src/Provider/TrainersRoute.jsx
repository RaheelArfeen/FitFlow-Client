import React, { useContext } from 'react';
import useUserRole from '../hooks/useUserRole';
import { AuthContext } from './AuthProvider';
import { Navigate } from 'react-router';

const TrainersRoute = ({ children }) => {
    const { user, loading } = useContext(AuthContext);
    const { role, roleLoading } = useUserRole();

    if (loading || roleLoading) {
        return <span className="loading loading-spinner loading-xl"></span>
    }

    if (!user || role !== 'trainer') {
        return <Navigate state={{ from: location.pathname }} to="/forbidden"></Navigate>
    }

    return children;
};

export default TrainersRoute;