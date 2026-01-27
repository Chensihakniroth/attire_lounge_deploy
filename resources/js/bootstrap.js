import axios from 'axios';
window.axios = axios;

window.axios.defaults.headers.common['X-Requested-With'] = 'XMLHttpRequest';

// Add a request interceptor to attach the token dynamically
window.axios.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem('admin_token') || sessionStorage.getItem('admin_token');
        if (token) {
            config.headers['Authorization'] = `Bearer ${token}`;
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

// Simple console log for debugging
console.log('Attire Lounge React App Initialized - MainApp.jsx structure');
