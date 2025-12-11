const mix = require('laravel-mix');

// Configure Mix for React
mix.react('resources/js/app.jsx', 'public/js')
   .postCss('resources/css/app.css', 'public/css', [
        require('tailwindcss'),
        require('autoprefixer'),
   ]);

// Set public path
mix.setPublicPath('public');

// For development
if (mix.inProduction()) {
    mix.version();
} else {
    mix.sourceMaps();
}

// Disable notifications
mix.disableSuccessNotifications();
