import axios from 'axios';
import { useAuth } from './AuthContext';
import { useEffect } from 'react';
 
const api = axios.create({
  baseURL: '/api',
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});
 
export default api;

export const AuthInterceptor = ({ children }) => {

    const [authContext, setauthContext] = useAuth();

    let isRefreshing = false;
    let failedQueue = [];

    const processQueue = (error, token = null) => {
        failedQueue.forEach((prom) => {
            if (error) {
                prom.reject(error);
            } else {
                prom.resolve(token);
            }
        });

        failedQueue = [];
    };

    useEffect(() => {

        const requestInterceptor = api.interceptors.request.use(
            (config) => {
                if (authContext) {
                    config.headers.Authorization = `Bearer ${authContext['accessToken']}`;
                }
                return config;
            },
            (error) => Promise.reject(error)
        );

        const responseInterceptor =  api.interceptors.response.use(
            (response) => response,
            async (error) => {
                const originalRequest = error.config;

                if (error.response?.status !== 401 || originalRequest._retry || !authContext) {
                    return Promise.reject(error);
                }

                originalRequest._retry = true;

                if (!isRefreshing) {
                    isRefreshing = true;

                    try {
                        const response = await axios.get('/refresh');


                        const { newAccessToken } = response.data['token'];
                        setauthContext({
                            loggedIn: true,
                            accessToken: newAccessToken
                        });


                        processQueue(null, newAccessToken);
                        return api(originalRequest);

                    } catch (refreshError) {

                        processQueue(refreshError, null);
                        logoutUser();
                        return Promise.reject(refreshError);
                    } finally {
                        isRefreshing = false;
                    }

                } else {

                    return new Promise((resolve, reject) => {
                        failedQueue.push({resolve, reject});
                    })
                        .then((token) => {
                            originalRequest.headers.Authorization = `Bearer ${token}`;
                            return api(originalRequest);
                        })
                        .catch((err) => Promise.reject(err));
                }
            }
        );
        return () => {
            api.interceptors.request.eject(requestInterceptor);
            api.interceptors.response.eject(responseInterceptor);
        };
    }, [authContext]);

    return children;
};

const logoutUser = () => {
    setauthContext({
        loggedIn: false,
        accessToken: null
    });
    window.location.href = '/login';
};