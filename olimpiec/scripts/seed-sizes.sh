#!/bin/bash

# Скрипт для заполнения базы данных размерами
# Использование: ./scripts/seed-sizes.sh

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

echo "📦 Заполнение базы данных размерами..."

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

# Проверяем, есть ли уже размеры в базе
echo ""
echo "🔍 Проверка существующих размеров..."
SIZE_COUNT=$($DOCKER_COMPOSE_CMD exec -T php-fpm php artisan tinker --execute="echo App\Models\Size::count();" 2>/dev/null | tail -1 | tr -d '\r\n' || echo "0")

if [ "$SIZE_COUNT" -gt 0 ]; then
    echo "   ⚠️  В базе уже есть $SIZE_COUNT размеров"
    read -p "   Продолжить и добавить еще? (y/n): " -n 1 -r
    echo
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        echo "   Отменено."
        exit 0
    fi
fi

# Запускаем сидер
echo ""
echo "   Запуск SizeSeeder..."
$DOCKER_COMPOSE_CMD exec -T php-fpm php artisan db:seed --class=SizeSeeder

# Проверяем результат
echo ""
echo "✅ Размеры успешно добавлены!"
echo ""
echo "📋 Проверка результата..."
$DOCKER_COMPOSE_CMD exec -T php-fpm php artisan tinker --execute="
\$clothing = App\Models\Size::where('type', 'clothing')->count();
\$shoes = App\Models\Size::where('type', 'shoes')->count();
echo 'Одежда: ' . \$clothing . ' размеров' . PHP_EOL;
echo 'Обувь: ' . \$shoes . ' размеров' . PHP_EOL;
echo 'Всего: ' . App\Models\Size::count() . ' размеров' . PHP_EOL;
" 2>/dev/null | grep -E "(Одежда|Обувь|Всего)" || echo "   Размеры добавлены"

echo ""
echo "✅ Готово! Теперь можно создавать товары с размерами."
