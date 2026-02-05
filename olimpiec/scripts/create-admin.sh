#!/bin/bash

# Скрипт для создания администратора
# Использование: ./scripts/create-admin.sh [--name "Имя"] [--email "email@example.com"] [--password "password"]

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

# Проверяем, что контейнер запущен
if ! $DOCKER_COMPOSE_CMD ps php-fpm | grep -q "Up"; then
    echo "⚠️  Контейнер php-fpm не запущен. Запускаю..."
    $DOCKER_COMPOSE_CMD up -d php-fpm
    echo "⏳ Ожидание запуска контейнера..."
    sleep 5
fi

echo "🔐 Создание администратора..."
echo ""

# Передаем все аргументы в Artisan команду
$DOCKER_COMPOSE_CMD exec -T php-fpm php artisan admin:create "$@"

echo ""
echo "✅ Готово!"
echo ""
echo "📋 Теперь вы можете войти в админ панель используя:"
echo "   Email: указанный при создании"
echo "   Пароль: указанный при создании"
echo ""
