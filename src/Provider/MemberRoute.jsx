import React, { Children, useContext } from 'react';
import useUserRole from '../Hooks/UseUserRole';
import { Navigate } from 'react-router';
import { AuthContext } from './AuthProvider';
import Loader from '../Pages/Loader';

const MemberRoute = ({ children }) => {
    const { user, loading } = useContext(AuthContext);
    const { role, roleLoading } = useUserRole();

    if (loading || roleLoading) {
        return <Loader />
    }

    if (!user || role !== 'member') {
        return <Navigate state={{ from: location.pathname }} to="/dashboard/forbidden"></Navigate>
    }

    return children;
};

export default MemberRoute;