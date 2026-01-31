import axios from 'axios';

const api = axios.create({
    baseURL: '/api', // Proxy will divert this to http://localhost:3000
    headers: {
        'Content-Type': 'application/json',
    },
});

// Interceptor to add JWT token to every request
api.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem('token');
        if (token) {
            config.headers.Authorization = `Bearer ${token}`; // Ensure Bearer scheme
        }
        return config;
    },
    (error) => Promise.reject(error)
);

// Interceptor to handle authentication errors (expired tokens)
api.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error.response && (error.response.status === 401 || error.response.status === 403)) {
            console.error("Session expired or unauthorized. Logging out...");
            localStorage.removeItem('token');
            // Hard redirect to login to clear state and stop infinite loops
            if (window.location.pathname !== '/login') {
                window.location.href = '/login';
            }
        }
        return Promise.reject(error);
    }
);

export default api;
