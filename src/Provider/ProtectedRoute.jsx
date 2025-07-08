import { Navigate, useLocation } from 'react-router';
import { useContext } from 'react';
import { AuthContext } from './AuthProvider';

export const ProtectedRoute = ({ children }) => {
    const { user, loading } = useContext(AuthContext);
    const location = useLocation();

    if (loading) {
        return(
            <></>
        )
    }

    if (!user) {
        return <Navigate to="/login" state={{ from: location }} />;
    }

    return children;
};