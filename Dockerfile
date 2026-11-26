FROM php:8.2-apache
COPY --chown=www-data:www-data . /var/www/html/
EXPOSE 80
