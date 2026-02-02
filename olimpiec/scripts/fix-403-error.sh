#!/bin/bash

# Скрипт для диагностики и исправления ошибки 403 Forbidden
# Использование: ./scripts/fix-403-error.sh

set -e

echo "🔍 Диагностика проблемы 403 Forbidden..."
echo ""

# Проверка Docker контейнеров
echo "1. Проверка Docker контейнеров..."
# Проверяем, какая команда доступна
if command -v docker-compose &> /dev/null; then
    DOCKER_COMPOSE_CMD="docker-compose"
elif docker compose version &> /dev/null; then
    DOCKER_COMPOSE_CMD="docker compose"
else
    echo "   ❌ Docker Compose не найден!"
    exit 1
fi

if ! $DOCKER_COMPOSE_CMD ps | grep -q "Up"; then
    echo "   ⚠️  Контейнеры не запущены. Запускаю..."
    $DOCKER_COMPOSE_CMD up -d
    echo "   ⏳ Ожидание запуска контейнеров..."
    sleep 15
else
    echo "   ✅ Контейнеры запущены"
fi

# Проверка доступности портов
echo ""
echo "2. Проверка доступности портов..."
if curl -s http://localhost:5173 > /dev/null; then
    echo "   ✅ Порт 5173 (frontend) доступен"
else
    echo "   ❌ Порт 5173 недоступен"
    echo "   Проверяю контейнер frontend..."
    $DOCKER_COMPOSE_CMD logs frontend --tail 20
fi

if curl -s http://localhost:8080/api/health > /dev/null 2>&1; then
    echo "   ✅ Порт 8080 (backend) доступен"
else
    echo "   ⚠️  Порт 8080 недоступен (может быть нормально, если только локальный доступ)"
fi

# Проверка Nginx конфигурации
echo ""
echo "3. Проверка Nginx конфигурации..."
if sudo nginx -t 2>&1 | grep -q "successful"; then
    echo "   ✅ Конфигурация Nginx корректна"
else
    echo "   ❌ Ошибка в конфигурации Nginx:"
    sudo nginx -t
fi

# Проверка логов Nginx
echo ""
echo "4. Последние ошибки в логах Nginx:"
if [ -f "/var/log/nginx/olimpiec-shop-error.log" ]; then
    echo "   Последние 10 строк:"
    sudo tail -10 /var/log/nginx/olimpiec-shop-error.log | sed 's/^/   /'
else
    echo "   ⚠️  Файл логов не найден"
fi

# Проверка прав доступа к файлам фронтенда
echo ""
echo "5. Проверка прав доступа к файлам фронтенда..."
if [ -d "../frontend/dist" ]; then
    if [ -r "../frontend/dist/index.html" ]; then
        echo "   ✅ Файлы фронтенда доступны для чтения"
    else
        echo "   ❌ Проблема с правами доступа к файлам фронтенда"
        echo "   Исправляю..."
        sudo chown -R $USER:$USER ../frontend/dist
        chmod -R 755 ../frontend/dist
    fi
else
    echo "   ❌ Директория dist не найдена. Нужно собрать фронтенд!"
    echo "   Запустите: cd ../frontend && npm run build"
fi

# Проверка подключения Nginx к контейнерам
echo ""
echo "6. Проверка подключения Nginx к контейнерам..."
if curl -s http://127.0.0.1:5173 > /dev/null; then
    echo "   ✅ Nginx может подключиться к frontend (localhost:5173)"
else
    echo "   ❌ Nginx не может подключиться к frontend"
    echo "   Проверяю, слушает ли контейнер на всех интерфейсах..."
    $DOCKER_COMPOSE_CMD ps frontend
fi

if curl -s http://127.0.0.1:8080 > /dev/null 2>&1; then
    echo "   ✅ Nginx может подключиться к backend (localhost:8080)"
else
    echo "   ⚠️  Backend доступен только локально (это нормально)"
fi

# Рекомендации
echo ""
echo "📋 Рекомендации:"
echo ""
echo "Если проблема сохраняется:"
echo "1. Проверьте, что контейнеры запущены: docker-compose ps"
echo "2. Проверьте логи: docker-compose logs frontend"
echo "3. Проверьте логи Nginx: sudo tail -f /var/log/nginx/olimpiec-shop-error.log"
echo "4. Убедитесь, что порт 5173 открыт для localhost: netstat -tlnp | grep 5173"
echo "5. Перезапустите контейнеры: docker-compose restart"
echo ""
