import React, { useContext } from 'react';
import useUserRole from '../hooks/useUserRole';
import { AuthContext } from './AuthProvider';
import { Navigate } from 'react-router';
import Loader from '../Pages/Loader';

const TrainersRoute = ({ children }) => {
    const { user, loading } = useContext(AuthContext);
    const { role, roleLoading } = useUserRole();

    if (loading || roleLoading) {
        return <Loader/>
    }

    if (!user || role !== 'trainer') {
        return <Navigate state={{ from: location.pathname }} to="/dashboard/forbidden"></Navigate>
    }

    return children;
};

export default TrainersRoute;