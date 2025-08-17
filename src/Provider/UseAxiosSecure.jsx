import axios from 'axios';
import { useContext, useEffect } from 'react';
import { useNavigate } from 'react-router';
import { AuthContext } from './AuthProvider';

const axiosSecure = axios.create({
    baseURL: `http://localhost:3000`,
});

// Flag to avoid attaching interceptors multiple times
let interceptorsAttached = false;

const useAxiosSecure = () => {
    const { logOut } = useContext(AuthContext);
    const navigate = useNavigate();

    useEffect(() => {
        if (!interceptorsAttached) {
            // ✅ Attach interceptors only once
            axiosSecure.interceptors.request.use(
                (config) => {
                    const token = localStorage.getItem("FitFlow-token");
                    if (token) {
                        config.headers.Authorization = `Bearer ${token}`;
                    }
                    return config;
                },
                (error) => Promise.reject(error)
            );

            axiosSecure.interceptors.response.use(
                (res) => res,
                (error) => {
                    const status = error.response?.status;
                    if (status === 403) {
                        navigate('/dashboard/forbidden');
                    } else if (status === 401) {
                        logOut()
                            .then(() => navigate('/login'))
                            .catch(() => { });
                    }
                    return Promise.reject(error);
                }
            );

            interceptorsAttached = true;
        }
    }, [logOut, navigate]);

    return axiosSecure;
};

export default useAxiosSecure;
