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

/**
 * Echo exposes an expressive API for subscribing to channels and listening
 * for events that are broadcast by Laravel. Echo and event broadcasting
 * allow your team to quickly build robust real-time web applications.
 */

import Echo from 'laravel-echo';
import Pusher from 'pusher-js';

window.Pusher = Pusher;

const reverbConfig = window.REVERB_CONFIG || {};

/*
window.Echo = new Echo({
    broadcaster: 'reverb',
    key: reverbConfig.key,
    wsHost: reverbConfig.host,
    wsPort: reverbConfig.port ?? 80,
    wssPort: reverbConfig.port ?? 443,
    forceTLS: (reverbConfig.scheme ?? 'https') === 'https',
    enabledTransports: ['ws', 'wss'],
});
*/

// Simple console log for debugging
console.log('Attire Lounge Official React App Initialized - Real-time Ready! (ﾉ´ヮ`)ﾉ*:･ﾟ✧');
