import axios from 'axios';
window.axios = axios;

window.axios.defaults.headers.common['X-Requested-With'] = 'XMLHttpRequest';

// Automatically set the authorization header if the token exists
const token = localStorage.getItem('admin_token');
if (token) {
    window.axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
}


// Simple console log for debugging
console.log('Attire Lounge React App Initialized - MainApp.jsx structure');
