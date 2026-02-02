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
if [ ! -d "node_modules" ]; then
    echo "   Установка зависимостей..."
    npm install
fi
npm run build
cd ../olimpiec

echo ""
echo "🐳 Запуск Docker контейнеров..."
docker compose up -d

echo ""
echo "⏳ Ожидание запуска контейнеров..."
sleep 10

echo ""
echo "🔑 Генерация APP_KEY..."
docker compose exec -T php-fpm php artisan key:generate --force

echo ""
echo "🗄️  Запуск миграций..."
docker compose exec -T php-fpm php artisan migrate --force

echo ""
echo "🔗 Создание символической ссылки для storage..."
docker compose exec -T php-fpm php artisan storage:link || true

echo ""
echo "🧹 Очистка кэша..."
docker compose exec -T php-fpm php artisan config:clear
docker compose exec -T php-fpm php artisan cache:clear
docker compose exec -T php-fpm php artisan route:clear
docker compose exec -T php-fpm php artisan view:clear

echo ""
echo "✅ Настройка завершена!"
echo ""
echo "📋 Следующие шаги:"
echo "   1. Настройте Nginx на хосте (см. scripts/setup-nginx.sh)"
echo "   2. Настройте DNS записи в Yandex Cloud"
echo "   3. Настройте SSL через Let's Encrypt"
echo "   4. Проверьте работу: curl http://olimpiec-shop.ru"
echo ""
