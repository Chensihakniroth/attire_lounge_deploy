import axios from 'axios';
window.axios = axios;

window.axios.defaults.headers.common['X-Requested-With'] = 'XMLHttpRequest';

// Simple console log for debugging
console.log('Attire Lounge React App Initialized - MainApp.jsx structure');
