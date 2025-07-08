import { useQuery } from '@tanstack/react-query';
import { useContext } from 'react';
import { AuthContext } from '../Provider/AuthProvider';
import useAxiosSecure from '../Provider/UseAxiosSecure';

const useUserRole = () => {
    const { user, loading: authLoading } = useContext(AuthContext)
    const axiosSecure = useAxiosSecure();

    const {
        data: role = 'user',
        isLoading: roleLoading,
        refetch,
    } = useQuery({
        queryKey: ['userRole', user?.email],
        enabled: !authLoading && !!user?.email,
        queryFn: async () => {
            const res = await axiosSecure.get(`/users/role/${user.email}`);
            return res.data.role;
        },
    });

    return { role, roleLoading: authLoading || roleLoading, refetch };
};

export default useUserRole;