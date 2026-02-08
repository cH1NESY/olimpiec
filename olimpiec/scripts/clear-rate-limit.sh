#!/bin/bash

# Скрипт для очистки rate limit кэша
# Использование: ./scripts/clear-rate-limit.sh

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

echo "🔄 Очистка rate limit кэша..."

# Очищаем кэш Laravel (включая rate limit)
$DOCKER_COMPOSE_CMD exec -T php-fpm php artisan cache:clear

# Перезапускаем Nginx для сброса rate limit
echo "   Перезапуск Nginx..."
$DOCKER_COMPOSE_CMD restart nginx

echo ""
echo "✅ Rate limit кэш очищен!"
echo ""
echo "📋 Примечание: Если вы все еще получаете 429 ошибку, подождите 1 минуту"
echo "   или перезапустите контейнеры полностью:"
echo "   docker-compose restart"
echo ""
