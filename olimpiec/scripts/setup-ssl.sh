#!/bin/bash

# Скрипт для настройки SSL через Let's Encrypt
# Использование: sudo ./scripts/setup-ssl.sh [email]

set -e

DOMAIN="olimpiec-shop.ru"
EMAIL="${1:-admin@${DOMAIN}}"

if [ "$EUID" -ne 0 ]; then 
    echo "❌ Ошибка: Запустите скрипт с sudo"
    exit 1
fi

echo "🔒 Настройка SSL для ${DOMAIN}..."
echo "📧 Email для уведомлений: ${EMAIL}"

# Проверка установки certbot
if ! command -v certbot &> /dev/null; then
    echo "📦 Установка certbot..."
    apt update
    apt install -y certbot python3-certbot-nginx
fi

# Проверка DNS
echo ""
echo "🔍 Проверка DNS записей..."
DOMAIN_IP=$(dig +short "${DOMAIN}" | tail -n1)
if [ -z "$DOMAIN_IP" ]; then
    echo "⚠️  Внимание: DNS записи для ${DOMAIN} не найдены!"
    echo "   Убедитесь, что DNS настроен в Yandex Cloud перед продолжением"
    read -p "Продолжить? (y/n) " -n 1 -r
    echo
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        exit 1
    fi
else
    echo "✅ DNS запись найдена: ${DOMAIN} -> ${DOMAIN_IP}"
fi

# Проверка доступности HTTP
echo ""
echo "🌐 Проверка доступности HTTP..."
if ! curl -s -o /dev/null -w "%{http_code}" "http://${DOMAIN}" | grep -q "200"; then
    echo "⚠️  Внимание: Домен не отвечает по HTTP!"
    echo "   Убедитесь, что Nginx настроен и работает"
    read -p "Продолжить? (y/n) " -n 1 -r
    echo
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        exit 1
    fi
else
    echo "✅ HTTP доступен"
fi

# Получение SSL сертификата
echo ""
echo "📜 Получение SSL сертификата через Let's Encrypt..."
echo "   Это может занять несколько секунд..."

if certbot --nginx -d "${DOMAIN}" -d "www.${DOMAIN}" \
    --non-interactive \
    --agree-tos \
    --email "${EMAIL}" \
    --redirect; then
    echo "✅ SSL сертификат успешно получен и установлен!"
else
    echo ""
    echo "❌ Ошибка при получении сертификата"
    echo ""
    echo "Возможные причины:"
    echo "   1. DNS записи не настроены или не распространились"
    echo "   2. Домен недоступен по HTTP (порт 80 закрыт или Nginx не работает)"
    echo "   3. Домен уже имеет активный сертификат"
    echo ""
    echo "Проверьте логи:"
    echo "   sudo tail -50 /var/log/letsencrypt/letsencrypt.log"
    exit 1
fi

# Настройка автоматического обновления
echo ""
echo "🔄 Настройка автоматического обновления сертификата..."
if ! systemctl list-timers | grep -q "certbot.timer"; then
    systemctl enable certbot.timer
    systemctl start certbot.timer
    echo "✅ Автоматическое обновление включено"
else
    echo "✅ Автоматическое обновление уже настроено"
fi

# Проверка конфигурации Nginx
echo ""
echo "✅ Проверка конфигурации Nginx после установки SSL..."
if nginx -t; then
    echo "✅ Конфигурация корректна"
    systemctl reload nginx
else
    echo "❌ Ошибка в конфигурации Nginx!"
    exit 1
fi

# Проверка HTTPS
echo ""
echo "🔍 Проверка работы HTTPS..."
sleep 2
if curl -s -o /dev/null -w "%{http_code}" "https://${DOMAIN}" | grep -q "200"; then
    echo "✅ HTTPS работает!"
else
    echo "⚠️  HTTPS может быть еще не готов (подождите несколько секунд)"
fi

echo ""
echo "✅ SSL успешно настроен!"
echo ""
echo "📋 Следующие шаги:"
echo ""
echo "1. Обновите .env файл в olimpiec/.env:"
echo "   APP_URL=https://${DOMAIN}"
echo "   FRONTEND_URL=https://${DOMAIN}"
echo ""
echo "2. Обновите CORS настройки в config/cors.php:"
echo "   'allowed_origins' => ['https://${DOMAIN}'],"
echo ""
echo "3. Перезапустите контейнеры:"
echo "   cd ~/olimpiec/olimpiec"
echo "   docker-compose restart"
echo ""
echo "4. Проверьте работу:"
echo "   curl https://${DOMAIN}"
echo ""
echo "📅 Сертификат будет автоматически обновляться каждые 90 дней"
echo ""
