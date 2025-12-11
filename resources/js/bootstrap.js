import axios from 'axios';
window.axios = axios;

window.axios.defaults.headers.common['X-Requested-With'] = 'XMLHttpRequest';
window.axios.defaults.baseURL = '/api';

// Simple console log for debugging
console.log('Attire Lounge React App Initialized - MainApp.jsx structure');
