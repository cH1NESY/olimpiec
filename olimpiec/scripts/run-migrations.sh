#!/bin/bash

# Скрипт для запуска миграций базы данных
# Использование: ./scripts/run-migrations.sh

set -e

# Определяем команду docker-compose
if command -v docker-compose &> /dev/null; then
    DOCKER_COMPOSE_CMD="docker-compose"
elif docker compose version &> /dev/null; then
    DOCKER_COMPOSE_CMD="docker compose"
else
    echo "❌ Docker Compose не найден!"
    exit 1
fi

# Проверяем, что мы в правильной директории
if [ ! -f "artisan" ]; then
    echo "❌ Ошибка: Запустите скрипт из директории olimpiec/"
    exit 1
fi

echo "🗄️  Запуск миграций базы данных..."

# Проверяем, что контейнер запущен
if ! $DOCKER_COMPOSE_CMD ps php-fpm | grep -q "Up"; then
    echo "⚠️  Контейнер php-fpm не запущен. Запускаю..."
    $DOCKER_COMPOSE_CMD up -d php-fpm
    echo "⏳ Ожидание запуска контейнера..."
    sleep 5
fi

# Проверяем наличие vendor директории
if ! $DOCKER_COMPOSE_CMD exec -T php-fpm test -d /var/www/html/vendor; then
    echo "⚠️  Зависимости Composer не установлены. Устанавливаю..."
    $DOCKER_COMPOSE_CMD exec -T php-fpm composer install --no-dev --optimize-autoloader
fi

# Запускаем миграции
echo "   Выполнение миграций..."
$DOCKER_COMPOSE_CMD exec -T php-fpm php artisan migrate --force

echo ""
echo "✅ Миграции выполнены!"
echo ""
