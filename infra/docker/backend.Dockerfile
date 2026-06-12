FROM php:8.4-fpm-alpine

RUN docker-php-ext-install pdo pdo_mysql opcache pcntl

RUN apk add --no-cache $PHPIZE_DEPS \
    && pecl install redis \
    && docker-php-ext-enable redis

# Node.js LTS — necessário para o job ReconstruirSite
RUN apk add --no-cache nodejs npm

COPY --from=composer:latest /usr/bin/composer /usr/bin/composer

WORKDIR /var/www/backend

RUN chown -R www-data:www-data /var/www/backend
