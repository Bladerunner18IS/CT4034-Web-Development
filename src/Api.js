import axios from 'axios';
import { useAuth } from './AuthContext';

const api = axios.create({
    baseURL: '/api',
    timeout: 10000,
    headers: {
        'Content-Type': 'application/json',
    },
});

export default api;

// Module-level hooks/callbacks that will be provided by the Auth component.
let getAccessToken = () => null;
let setAuthContextFn = () => {};
let logoutFn = () => { window.location.href = '/login'; };

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

// Request interceptor uses the provided getter to synchronously attach token.
api.interceptors.request.use(
    (config) => {
        const token = getAccessToken();
        if (token) {
            config.headers = config.headers || {};
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => Promise.reject(error)
);

// Response interceptor handles 401 and refresh flow.
api.interceptors.response.use(
    (response) => response,
    async (error) => {
        const originalRequest = error.config;

        if (!originalRequest) {
            return Promise.reject(error);
        }

        if (error.response?.status !== 401 || originalRequest._retry) {
            return Promise.reject(error);
        }

        originalRequest._retry = true;

        if (!isRefreshing) {
            isRefreshing = true;
            try {
                const response = await axios.get('/api/refresh');
                const newAccessToken = response.data?.token;

                setAuthContextFn({
                    loggedIn: true,
                    accessToken: newAccessToken,
                });

                processQueue(null, newAccessToken);

                originalRequest.headers = originalRequest.headers || {};
                originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;
                return api(originalRequest);
            } catch (refreshError) {
                processQueue(refreshError, null);
                logoutFn();
                return Promise.reject(refreshError);
            } finally {
                isRefreshing = false;
            }
        } else {
            return new Promise((resolve, reject) => {
                failedQueue.push({ resolve, reject });
            })
                .then((token) => {
                    originalRequest.headers.Authorization = `Bearer ${token}`;
                    return api(originalRequest);
                })
                .catch((err) => Promise.reject(err));
        }
    }
);

// Called by the Auth wrapper to provide access to auth state and actions.
export const registerAuthHandlers = ({ getToken, setAuthContext, logout }) => {
    if (typeof getToken === 'function') getAccessToken = getToken;
    if (typeof setAuthContext === 'function') setAuthContextFn = setAuthContext;
    if (typeof logout === 'function') logoutFn = logout;
};

export const AuthInterceptor = ({ children }) => {
    const [authContext, setauthContext] = useAuth();

    const logoutUser = () => {
        setauthContext({ loggedIn: false, accessToken: null });
        window.location.href = '/login';
    };

    // Register synchronous getters/setters so interceptors have access
    // to auth state before child components run their effects.
    registerAuthHandlers({
        getToken: () => authContext?.accessToken,
        setAuthContext: (ctx) => setauthContext((prev) => ({ ...prev, ...ctx })),
        logout: logoutUser,
    });

    return children;
};