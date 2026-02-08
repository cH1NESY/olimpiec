#!/bin/bash

# Скрипт для проверки и настройки storage
# Использование: ./scripts/check-storage.sh

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

echo "🔍 Проверка storage..."

# Проверяем, что контейнер запущен
if ! $DOCKER_COMPOSE_CMD ps php-fpm | grep -q "Up"; then
    echo "⚠️  Контейнер php-fpm не запущен. Запускаю..."
    $DOCKER_COMPOSE_CMD up -d php-fpm
    sleep 5
fi

# Проверяем storage link
echo "   Проверка storage link..."
if $DOCKER_COMPOSE_CMD exec -T php-fpm test -L /var/www/html/public/storage; then
    echo "   ✅ Storage link существует"
    $DOCKER_COMPOSE_CMD exec -T php-fpm ls -la /var/www/html/public/storage | head -5
else
    echo "   ⚠️  Storage link не найден. Создаю..."
    $DOCKER_COMPOSE_CMD exec -T php-fpm php artisan storage:link
    echo "   ✅ Storage link создан"
fi

# Проверяем директорию для продуктов
echo ""
echo "   Проверка директории products..."
if $DOCKER_COMPOSE_CMD exec -T php-fpm test -d /var/www/html/storage/app/public/products; then
    echo "   ✅ Директория products существует"
    echo "   Файлы в директории:"
    $DOCKER_COMPOSE_CMD exec -T php-fpm ls -la /var/www/html/storage/app/public/products | head -10
else
    echo "   ⚠️  Директория products не существует. Создаю..."
    $DOCKER_COMPOSE_CMD exec -T php-fpm mkdir -p /var/www/html/storage/app/public/products
    $DOCKER_COMPOSE_CMD exec -T php-fpm chmod -R 775 /var/www/html/storage/app/public/products
    echo "   ✅ Директория создана"
fi

# Проверяем права доступа
echo ""
echo "   Проверка прав доступа..."
$DOCKER_COMPOSE_CMD exec -T php-fpm chmod -R 775 /var/www/html/storage/app/public
$DOCKER_COMPOSE_CMD exec -T php-fpm chown -R www-data:www-data /var/www/html/storage/app/public

echo ""
echo "✅ Проверка storage завершена!"
echo ""
echo "📋 Проверьте доступность изображений:"
echo "   curl http://localhost:8080/storage/products/1770533517_oxqHQggTih.jpg"
echo ""
