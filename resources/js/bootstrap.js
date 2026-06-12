import axios from 'axios';
window.axios = axios;

window.axios.defaults.headers.common['X-Requested-With'] = 'XMLHttpRequest';

// Add a request interceptor to attach the token and active outlet dynamically
window.axios.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem('admin_token') || sessionStorage.getItem('admin_token');
        if (token) {
            config.headers['Authorization'] = `Bearer ${token}`;
        }

        // 🏢 Attach Active Outlet Header for multi-tenant scoping
        if (!config.headers['X-Active-Outlet']) {
            const activeOutlet = localStorage.getItem('active_outlet') || 'attire_lounge';
            config.headers['X-Active-Outlet'] = activeOutlet;
        }

        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

// Only initialize Echo for admin panel (when auth token exists)
// The public frontend does not need WebSocket connectivity
const token = localStorage.getItem('admin_token') || sessionStorage.getItem('admin_token');

if (token) {
    // Dynamically import Echo/Pusher only for admin panel
    // This prevents bundling WebSocket libraries in the public frontend
    const initializeEcho = async () => {
        try {
            const [EchoModule, PusherModule] = await Promise.all([
                import('laravel-echo'),
                import('pusher-js'),
            ]);

            const Echo = EchoModule.default;
            const Pusher = PusherModule.default;

            window.Pusher = Pusher;

            const { data } = await axios.get('/api/v1/admin/reverb/config');

            window.Echo = new Echo({
                broadcaster: 'reverb',
                key: data.key,
                wsHost: data.host,
                wsPort: data.port ?? 80,
                wssPort: data.port ?? 443,
                forceTLS: (data.scheme ?? 'https') === 'https',
                enabledTransports: ['ws', 'wss'],
            });

            console.log('%c✦ Attire Lounge Admin — Reverb connected', 'color: #f5a81c; font-weight: bold;');
        } catch (error) {
            console.warn('%c✦ Attire Lounge Admin — Reverb not available (offline mode)', 'color: #f5a81c; font-weight: bold;');
            window.Echo = null;
        }
    };

    initializeEcho();
} else {
    // Public frontend — Echo is not needed
    window.Echo = null;
}

// 🎮 Initialize Senior Developer Admin Commands
import { initAdminCommands } from './helpers/adminCommands';
initAdminCommands();
