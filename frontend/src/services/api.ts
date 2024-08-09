import axios from 'axios';
import { AuthServiceResponse, refreshToken, logout } from './authService';
import { setIsLoggedIn } from './authStateService';
import { toast } from 'react-toastify';

const API_URL = process.env.APP_URL || "http://localhost:5000";

const api = axios.create({
    baseURL: API_URL,
    headers: {
        'Content-Type': 'application/json',
    },
});

// Request interceptor to include access token in headers
api.interceptors.request.use(
    (config) => {
        const accessToken = localStorage.getItem('accessToken');
        if (accessToken) {
            config.headers.Authorization = `Bearer ${accessToken}`;
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

// Response interceptor for handling errors
api.interceptors.response.use(
    (response) =>  {
        console.log(response);
        return response;
    },
    async (error) => {
        const originalRequest = error.config;
        if (error.response?.data?.error === "INVALID_ACCESS_TOKEN" && !originalRequest._retry) {
            // Handle refreshing access token and resending
            originalRequest._retry = true;
            // try {
            // Attempt token refresh
            const refreshTokenResult: AuthServiceResponse = await refreshToken();
            if (refreshTokenResult.success) {
                // Update access token and resend request
                localStorage.setItem('accessToken', refreshTokenResult.accessToken!);
                originalRequest.headers['Authorization'] = `Bearer ${refreshTokenResult.accessToken}`;
                return api(originalRequest); 
            } else {
                // Logout user if refresh failed
                await logout();
                localStorage.removeItem('accessToken');
                setIsLoggedIn(false);
                toast.error('Session expired. Please log in again.');
                return Promise.reject(error);
            }
        }

        if (error.code === "ERR_NETWORK") {
            toast.error('Network error. Please check your internet connection.');
            return Promise.reject(error);
        }

        // Handle other errors
        console.error(`API request error: code ${error.code}`, error);
        return Promise.reject(error);
    }
);

export default api;