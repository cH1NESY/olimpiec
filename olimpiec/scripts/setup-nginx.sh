#!/bin/bash

# Скрипт для настройки Nginx на хосте как reverse proxy
# Использование: sudo ./scripts/setup-nginx.sh

set -e

DOMAIN="olimpiec-shop.ru"
NGINX_CONFIG="/etc/nginx/sites-available/${DOMAIN}"

if [ "$EUID" -ne 0 ]; then 
    echo "❌ Ошибка: Запустите скрипт с sudo"
    exit 1
fi

echo "🔧 Настройка Nginx для ${DOMAIN}..."

# Проверка установки Nginx
if ! command -v nginx &> /dev/null; then
    echo "📦 Установка Nginx..."
    apt update
    apt install -y nginx
fi

# Создание конфигурации
echo "📝 Создание конфигурации Nginx..."
cat > "${NGINX_CONFIG}" << 'EOF'
server {
    listen 80;
    server_name olimpiec-shop.ru www.olimpiec-shop.ru;

    # Логи
    access_log /var/log/nginx/olimpiec-shop-access.log;
    error_log /var/log/nginx/olimpiec-shop-error.log;

    # Фронтенд
    location / {
        proxy_pass http://localhost:5173;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        
        # Таймауты для больших файлов
        proxy_connect_timeout 60s;
        proxy_send_timeout 60s;
        proxy_read_timeout 60s;
    }

    # API
    location /api {
        proxy_pass http://localhost:8080;
        proxy_http_version 1.1;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }

    # Storage (изображения)
    location /storage {
        proxy_pass http://localhost:8080;
        proxy_http_version 1.1;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        
        # Кэширование изображений
        expires 30d;
        add_header Cache-Control "public";
    }
}
EOF

# Активация конфигурации
echo "🔗 Активация конфигурации..."
ln -sf "${NGINX_CONFIG}" /etc/nginx/sites-enabled/

# Удаление дефолтной конфигурации (опционально)
if [ -f "/etc/nginx/sites-enabled/default" ]; then
    echo "🗑️  Удаление дефолтной конфигурации..."
    rm /etc/nginx/sites-enabled/default
fi

# Проверка конфигурации
echo "✅ Проверка конфигурации Nginx..."
if nginx -t; then
    echo "✅ Конфигурация корректна"
else
    echo "❌ Ошибка в конфигурации Nginx!"
    exit 1
fi

# Перезагрузка Nginx
echo "🔄 Перезагрузка Nginx..."
systemctl reload nginx

echo ""
echo "✅ Nginx настроен!"
echo ""
echo "📋 Следующие шаги:"
echo "   1. Убедитесь, что DNS записи настроены в Yandex Cloud"
echo "   2. Проверьте работу: curl http://${DOMAIN}"
echo "   3. Настройте SSL: sudo certbot --nginx -d ${DOMAIN} -d www.${DOMAIN}"
echo ""
