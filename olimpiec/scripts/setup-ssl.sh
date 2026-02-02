#!/bin/bash

# Скрипт для настройки SSL через Let's Encrypt
# Использование: sudo ./scripts/setup-ssl.sh

set -e

DOMAIN="olimpiec-shop.ru"

if [ "$EUID" -ne 0 ]; then 
    echo "❌ Ошибка: Запустите скрипт с sudo"
    exit 1
fi

echo "🔒 Настройка SSL для ${DOMAIN}..."

# Проверка установки certbot
if ! command -v certbot &> /dev/null; then
    echo "📦 Установка certbot..."
    apt update
    apt install -y certbot python3-certbot-nginx
fi

# Проверка DNS
echo "🔍 Проверка DNS записей..."
if ! dig +short "${DOMAIN}" | grep -q "."; then
    echo "⚠️  Внимание: DNS записи для ${DOMAIN} не найдены!"
    echo "   Убедитесь, что DNS настроен в Yandex Cloud перед продолжением"
    read -p "Продолжить? (y/n) " -n 1 -r
    echo
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        exit 1
    fi
fi

# Получение SSL сертификата
echo "📜 Получение SSL сертификата..."
certbot --nginx -d "${DOMAIN}" -d "www.${DOMAIN}" --non-interactive --agree-tos --email "admin@${DOMAIN}" || {
    echo "❌ Ошибка при получении сертификата"
    echo "   Убедитесь, что:"
    echo "   1. DNS записи настроены и распространились"
    echo "   2. Домен доступен по HTTP (порт 80 открыт)"
    echo "   3. Nginx настроен и работает"
    exit 1
}

echo ""
echo "✅ SSL настроен!"
echo ""
echo "📋 Обновите .env файл:"
echo "   APP_URL=https://${DOMAIN}"
echo "   FRONTEND_URL=https://${DOMAIN}"
echo ""
echo "🔄 Перезапустите контейнеры для применения изменений:"
echo "   docker compose restart"
echo ""
