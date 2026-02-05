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

# Проверяем наличие vendor директории
echo "🔍 Проверка зависимостей Composer..."
if ! $DOCKER_COMPOSE_CMD exec -T php-fpm test -d /var/www/html/vendor; then
    echo "⚠️  Зависимости Composer не установлены. Устанавливаю..."
    $DOCKER_COMPOSE_CMD exec -T php-fpm composer install --no-dev --optimize-autoloader
    echo "✅ Зависимости установлены"
else
    echo "✅ Зависимости установлены"
fi

# Проверяем наличие таблиц в базе данных и выполняем миграции при необходимости
echo ""
echo "🔍 Проверка базы данных..."
echo "   Выполнение миграций (безопасно, если уже выполнены)..."
$DOCKER_COMPOSE_CMD exec -T php-fpm php artisan migrate --force > /dev/null 2>&1 || {
    echo "⚠️  Ошибка при выполнении миграций. Проверьте настройки базы данных в .env"
    exit 1
}
echo "✅ База данных настроена"

echo ""
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
