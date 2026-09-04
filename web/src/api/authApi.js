import axios from 'axios';

let rawUrl = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5126/api';
if (rawUrl && !rawUrl.startsWith('http://') && !rawUrl.startsWith('https://')) {
    rawUrl = `https://${rawUrl}`;
}
rawUrl = rawUrl.trim().replace(/\/+$/, '');
if (rawUrl && !rawUrl.toLowerCase().endsWith('/api')) {
    rawUrl = `${rawUrl}/api`;
}

const API_BASE_URL = rawUrl;

const api = axios.create({
    baseURL: API_BASE_URL,
    headers: {
        'Content-Type': 'application/json',
    },
});

// Add token to all requests
api.interceptors.request.use(
    (config) => {
        const token = sessionStorage.getItem('token');
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => Promise.reject(error)
);

export const login = async (email, password) => {
    try {
        const response = await api.post('/Auth/login', { email, password });
        return response.data;
    } catch (error) {
        throw error.response?.data || { message: error.message || 'Invalid email or password' };
    }
};

export const logout = () => {
    sessionStorage.removeItem('token');
    sessionStorage.removeItem('user');
};

export default api;