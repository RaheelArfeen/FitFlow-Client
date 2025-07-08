import axios from 'axios';
import { useContext } from 'react';
import { useNavigate } from 'react-router';
import { AuthContext } from './AuthProvider';

const axiosSecure = axios.create({
    baseURL: `http://localhost:3000`
});

const useAxiosSecure = () => {
    const { user, logOut } = useContext(AuthContext);
    const navigate = useNavigate();

    axiosSecure.interceptors.request.use(config => {
        // ✅ Safely attach token only if user exists
        if (user?.accessToken) {
            config.headers.Authorization = `Bearer ${user.accessToken}`;
        }
        return config;
    }, error => {
        return Promise.reject(error);
    });

    axiosSecure.interceptors.response.use(res => {
        return res;
    }, error => {
        const status = error.response?.status;

        if (status === 403) {
            navigate('/dashboard/forbidden');
        } else if (status === 401) {
            logOut()
                .then(() => {
                    navigate('/login');
                })
                .catch(() => { });
        }

        return Promise.reject(error);
    });

    return axiosSecure;
};

export default useAxiosSecure;
