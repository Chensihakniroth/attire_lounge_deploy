#!/bin/sh

# Substitute PORT in Nginx config
envsubst '${PORT}' < /etc/nginx/http.d/default.conf.template > /etc/nginx/http.d/default.conf

# Run migrations
echo "Running migrations..."
php artisan migrate --force

# Start supervisor
echo "Starting Supervisor..."
exec /usr/bin/supervisord -c /etc/supervisor/conf.d/supervisord.conf
