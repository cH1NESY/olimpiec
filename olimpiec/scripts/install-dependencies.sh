#!/bin/bash

# Скрипт для установки зависимостей Composer
# Использование: ./scripts/install-dependencies.sh

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
if [ ! -f "composer.json" ]; then
    echo "❌ Ошибка: Запустите скрипт из директории olimpiec/"
    exit 1
fi

echo "📦 Установка зависимостей Composer..."

# Проверяем, что контейнер запущен
if ! $DOCKER_COMPOSE_CMD ps php-fpm | grep -q "Up"; then
    echo "⚠️  Контейнер php-fpm не запущен. Запускаю..."
    $DOCKER_COMPOSE_CMD up -d php-fpm
    echo "⏳ Ожидание запуска контейнера..."
    sleep 5
fi

# Устанавливаем зависимости
echo "   Установка зависимостей..."
$DOCKER_COMPOSE_CMD exec -T php-fpm composer install --no-dev --optimize-autoloader

echo ""
echo "✅ Зависимости установлены!"
echo ""
