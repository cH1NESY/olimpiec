#!/bin/bash

# Скрипт для настройки продакшена на сервере
# Использование: ./scripts/setup-production.sh

set -e

echo "🚀 Настройка продакшена для olimpiec-shop.ru"
echo ""

# Проверка, что мы в правильной директории
if [ ! -f "artisan" ]; then
    echo "❌ Ошибка: Запустите скрипт из директории olimpiec/"
    exit 1
fi

# Проверка наличия .env
if [ ! -f ".env" ]; then
    echo "📝 Создание .env из .env.production.example..."
    if [ -f ".env.production.example" ]; then
        cp .env.production.example .env
        echo "✅ Файл .env создан. Пожалуйста, заполните необходимые значения!"
        echo "   Особенно важно: DB_PASSWORD, APP_KEY, TELEGRAM_BOT_TOKEN, YOOKASSA_*"
        exit 1
    else
        echo "❌ Ошибка: .env.production.example не найден"
        exit 1
    fi
fi

echo "📦 Сборка фронтенда..."
cd ../frontend

# Исправление прав доступа
echo "   Исправление прав доступа..."
sudo chown -R $USER:$USER . 2>/dev/null || true
chmod -R 755 . 2>/dev/null || true

# Очистка и создание dist директории
if [ -d "dist" ]; then
    rm -rf dist
fi
mkdir -p dist
chmod 755 dist

if [ ! -d "node_modules" ]; then
    echo "   Установка зависимостей..."
    npm install
fi

echo "   Сборка проекта..."
npm run build

# Исправление прав для собранных файлов
chmod -R 755 dist 2>/dev/null || true

cd ../olimpiec

# Определяем команду docker-compose
if command -v docker-compose &> /dev/null; then
    DOCKER_COMPOSE_CMD="docker-compose"
elif docker compose version &> /dev/null; then
    DOCKER_COMPOSE_CMD="docker compose"
else
    echo "❌ Docker Compose не найден!"
    exit 1
fi

echo ""
echo "🐳 Запуск Docker контейнеров..."
$DOCKER_COMPOSE_CMD up -d

echo ""
echo "⏳ Ожидание запуска контейнеров..."
sleep 10

echo ""
echo "📦 Установка зависимостей Composer..."
if [ ! -d "vendor" ]; then
    echo "   Установка зависимостей..."
    $DOCKER_COMPOSE_CMD exec -T php-fpm composer install --no-dev --optimize-autoloader
else
    echo "   Зависимости уже установлены, обновление..."
    $DOCKER_COMPOSE_CMD exec -T php-fpm composer install --no-dev --optimize-autoloader
fi

echo ""
echo "🔑 Генерация APP_KEY..."
$DOCKER_COMPOSE_CMD exec -T php-fpm php artisan key:generate --force

echo ""
echo "🗄️  Запуск миграций..."
$DOCKER_COMPOSE_CMD exec -T php-fpm php artisan migrate --force

echo ""
echo "🔗 Создание символической ссылки для storage..."
$DOCKER_COMPOSE_CMD exec -T php-fpm php artisan storage:link || true

echo ""
echo "🧹 Очистка кэша..."
$DOCKER_COMPOSE_CMD exec -T php-fpm php artisan config:clear
$DOCKER_COMPOSE_CMD exec -T php-fpm php artisan cache:clear
$DOCKER_COMPOSE_CMD exec -T php-fpm php artisan route:clear
$DOCKER_COMPOSE_CMD exec -T php-fpm php artisan view:clear

echo ""
echo "✅ Настройка завершена!"
echo ""
echo "📋 Следующие шаги:"
echo "   1. Настройте Nginx на хосте (см. scripts/setup-nginx.sh)"
echo "   2. Настройте DNS записи в Yandex Cloud"
echo "   3. Настройте SSL через Let's Encrypt"
echo "   4. Проверьте работу: curl http://olimpiec-shop.ru"
echo ""
