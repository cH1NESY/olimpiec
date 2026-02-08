#!/bin/bash

# Скрипт для исправления проблем с админ-панелью
# Использование: ./scripts/fix-admin-issues.sh

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

echo "🔧 Исправление проблем с админ-панелью..."

# 1. Проверяем и создаем storage link
echo ""
echo "1️⃣  Проверка storage link..."
if $DOCKER_COMPOSE_CMD exec -T php-fpm test -L /var/www/html/public/storage 2>/dev/null; then
    echo "   ✅ Storage link существует"
else
    echo "   ⚠️  Storage link не найден. Создаю..."
    $DOCKER_COMPOSE_CMD exec -T php-fpm php artisan storage:link
    echo "   ✅ Storage link создан"
fi

# 2. Проверяем права доступа на storage
echo ""
echo "2️⃣  Проверка прав доступа на storage..."
$DOCKER_COMPOSE_CMD exec -T php-fpm chmod -R 775 /var/www/html/storage
$DOCKER_COMPOSE_CMD exec -T php-fpm chmod -R 775 /var/www/html/bootstrap/cache
$DOCKER_COMPOSE_CMD exec -T php-fpm chown -R www-data:www-data /var/www/html/storage
$DOCKER_COMPOSE_CMD exec -T php-fpm chown -R www-data:www-data /var/www/html/bootstrap/cache
echo "   ✅ Права доступа установлены"

# 3. Создаем директорию products если её нет
echo ""
echo "3️⃣  Проверка директории products..."
if $DOCKER_COMPOSE_CMD exec -T php-fpm test -d /var/www/html/storage/app/public/products; then
    echo "   ✅ Директория products существует"
else
    echo "   ⚠️  Директория products не существует. Создаю..."
    $DOCKER_COMPOSE_CMD exec -T php-fpm mkdir -p /var/www/html/storage/app/public/products
    $DOCKER_COMPOSE_CMD exec -T php-fpm chmod 775 /var/www/html/storage/app/public/products
    $DOCKER_COMPOSE_CMD exec -T php-fpm chown www-data:www-data /var/www/html/storage/app/public/products
    echo "   ✅ Директория создана"
fi

# 4. Очищаем кэш
echo ""
echo "4️⃣  Очистка кэша..."
$DOCKER_COMPOSE_CMD exec -T php-fpm php artisan config:clear
$DOCKER_COMPOSE_CMD exec -T php-fpm php artisan cache:clear
$DOCKER_COMPOSE_CMD exec -T php-fpm php artisan route:clear
$DOCKER_COMPOSE_CMD exec -T php-fpm php artisan view:clear
echo "   ✅ Кэш очищен"

# 5. Перезапускаем Nginx для применения изменений
echo ""
echo "5️⃣  Перезапуск Nginx..."
$DOCKER_COMPOSE_CMD restart nginx
echo "   ✅ Nginx перезапущен"

echo ""
echo "✅ Все проверки завершены!"
echo ""
echo "📋 Проверьте:"
echo "   1. Размеры загружаются: curl http://localhost:8080/api/sizes"
echo "   2. Storage доступен: curl http://localhost:8080/storage/products/"
echo "   3. Изображения доступны: ls -la storage/app/public/products/"
echo ""
