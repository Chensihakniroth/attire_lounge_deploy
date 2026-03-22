FROM php:8.3-fpm-alpine

# Install system dependencies
RUN apk add --no-cache \
    nginx \
    supervisor \
    libpng-dev \
    libjpeg-turbo-dev \
    freetype-dev \
    libwebp-dev \
    libzip-dev \
    zip \
    unzip \
    git \
    curl \
    curl-dev \
    libxml2-dev \
    icu-dev \
    oniguruma-dev \
    gettext \
    linux-headers

# Install PHP extensions
RUN docker-php-ext-configure gd --with-freetype --with-jpeg --with-webp \
    && docker-php-ext-install -j$(nproc) gd pdo_mysql mbstring zip bcmath intl sockets pcntl dom xml simplexml curl

# Install Redis extension
RUN apk add --no-cache --virtual .build-deps $PHPIZE_DEPS \
    && pecl install redis \
    && docker-php-ext-enable redis \
    && apk del .build-deps

# Install Composer
COPY --from=composer:latest /usr/bin/composer /usr/bin/composer

# Set working directory
WORKDIR /var/www/html

# Set Composer to allow superuser
ENV COMPOSER_ALLOW_SUPERUSER=1

# Copy application files
COPY . .

# Install PHP dependencies (Skipping scripts to avoid booting the app without ENV)
RUN composer install --no-dev --optimize-autoloader --no-scripts

# Install Node dependencies and build assets
RUN apk add --no-cache nodejs npm \
    && npm install \
    && npm run build

# Configure Nginx (We do this in entrypoint to handle $PORT dynamically)
RUN mkdir -p /etc/nginx/http.d/
COPY nginx.template /etc/nginx/http.d/default.conf.template

# Permissions
RUN chown -R www-data:www-data /var/www/html/storage /var/www/html/bootstrap/cache

# Supervisor config
COPY docker/supervisord.conf /etc/supervisor/conf.d/supervisord.conf

# Entrypoint
COPY docker/entrypoint.sh /usr/local/bin/entrypoint.sh
RUN chmod +x /usr/local/bin/entrypoint.sh

# Expose port (Railway will override this with its own port but good for local)
EXPOSE 8080

ENTRYPOINT ["/usr/local/bin/entrypoint.sh"]
