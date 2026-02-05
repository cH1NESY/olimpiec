#!/bin/bash

# Скрипт для генерации APP_KEY
# Использование: ./scripts/generate-app-key.sh

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

# Проверяем наличие .env
if [ ! -f ".env" ]; then
    echo "❌ Ошибка: Файл .env не найден!"
    echo "   Создайте .env файл из .env.example или .env.production.example"
    exit 1
fi

echo "🔑 Генерация APP_KEY..."

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

# Генерируем APP_KEY
echo "   Генерация ключа..."
$DOCKER_COMPOSE_CMD exec -T php-fpm php artisan key:generate --force

# Очищаем кэш конфигурации
echo "   Очистка кэша..."
$DOCKER_COMPOSE_CMD exec -T php-fpm php artisan config:clear
$DOCKER_COMPOSE_CMD exec -T php-fpm php artisan cache:clear

echo ""
echo "✅ APP_KEY успешно сгенерирован!"
echo ""
echo "📋 Проверьте .env файл - там должен быть установлен APP_KEY"
echo ""
