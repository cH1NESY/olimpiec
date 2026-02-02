# Настройка Nginx на хосте как Reverse Proxy для Docker

## Ваша ситуация:

✅ У вас уже есть Nginx в Docker-контейнерах:
- Backend API (web) на порту 8080
- Frontend на порту 5173

❌ НЕ нужно:
- Устанавливать Nginx заново (если уже установлен)
- Настраивать PHP-FPM на хосте (у вас уже есть в Docker)
- Копировать файлы Laravel в `/var/www/`

✅ НУЖНО:
- Настроить Nginx на хосте как **reverse proxy** для Docker-контейнеров

---

## Шаг 1: Проверьте, установлен ли Nginx на хосте

```bash
nginx -v
# Или
sudo systemctl status nginx
```

Если Nginx не установлен:
```bash
sudo apt update
sudo apt install nginx -y
```

---

## Шаг 2: Настройка для фронтенда

Создайте файл `/etc/nginx/sites-available/olimpiec-frontend`:

```bash
sudo nano /etc/nginx/sites-available/olimpiec-frontend
```

**Конфигурация:**

```nginx
server {
    listen 80;
    server_name 51.250.107.12;  # Или ваш домен: yourdomain.com www.yourdomain.com

    # Логи
    access_log /var/log/nginx/olimpiec-frontend-access.log;
    error_log /var/log/nginx/olimpiec-frontend-error.log;

    # Проксируем на Docker-контейнер фронтенда
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

    # Проксируем /api на backend
    location /api {
        proxy_pass http://localhost:8080;
        proxy_http_version 1.1;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        
        # CORS заголовки (если нужно)
        add_header Access-Control-Allow-Origin * always;
        add_header Access-Control-Allow-Methods "GET, POST, PUT, DELETE, OPTIONS" always;
        add_header Access-Control-Allow-Headers "Authorization, Content-Type" always;
        
        if ($request_method = 'OPTIONS') {
            return 204;
        }
    }

    # Проксируем /storage на backend
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
```

---

## Шаг 3: Активируйте конфигурацию

```bash
# Создайте символическую ссылку
sudo ln -s /etc/nginx/sites-available/olimpiec-frontend /etc/nginx/sites-enabled/

# Проверьте конфигурацию на ошибки
sudo nginx -t

# Если все ОК, перезагрузите Nginx
sudo systemctl reload nginx
```

---

## Шаг 4: Измените docker-compose.yml (если нужно)

Убедитесь, что порты открыты для локального доступа:

**В `olimpiec/docker-compose.yml`:**

```yaml
web:
  ports:
    - "8080:80"  # Убедитесь, что нет 127.0.0.1 (или оставьте как есть для безопасности)

frontend:
  ports:
    - "5173:80"  # Убедитесь, что порт открыт
```

Если хотите, чтобы порты были доступны только локально (рекомендуется для безопасности):

```yaml
web:
  ports:
    - "127.0.0.1:8080:80"  # Только локальный доступ

frontend:
  ports:
    - "127.0.0.1:5173:80"  # Только локальный доступ
```

Nginx на хосте будет проксировать запросы на эти локальные порты.

---

## Шаг 5: Настройка файрвола

Откройте только порт 80 (и 443 для HTTPS):

```bash
sudo ufw allow 80/tcp
sudo ufw allow 443/tcp
sudo ufw enable
```

**НЕ нужно** открывать порты 8080 и 5173 наружу - они будут доступны только локально через Nginx.

---

## Шаг 6: Проверка работы

```bash
# Проверка фронтенда
curl http://51.250.107.12

# Проверка API
curl http://51.250.107.12/api/health

# Проверка storage
curl -I http://51.250.107.12/storage/products/some-image.jpg

# Проверка логов Nginx
sudo tail -f /var/log/nginx/olimpiec-frontend-access.log
sudo tail -f /var/log/nginx/olimpiec-frontend-error.log
```

---

## Шаг 7: Настройка SSL (если есть домен)

Если у вас есть домен, настройте HTTPS:

```bash
# Установите certbot
sudo apt install certbot python3-certbot-nginx -y

# Получите SSL сертификат
sudo certbot --nginx -d yourdomain.com -d www.yourdomain.com
```

Certbot автоматически обновит конфигурацию Nginx для HTTPS.

После этого обновите `.env`:
```env
APP_URL=https://yourdomain.com
FRONTEND_URL=https://yourdomain.com
```

---

## Альтернативный вариант: Один файл для всего

Если хотите объединить все в один конфиг:

```nginx
server {
    listen 80;
    server_name 51.250.107.12 yourdomain.com www.yourdomain.com;

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

    # Storage
    location /storage {
        proxy_pass http://localhost:8080;
        proxy_http_version 1.1;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        expires 30d;
        add_header Cache-Control "public";
    }
}
```

---

## Отличия от классической установки:

| Классическая установка | Ваш случай (Docker) |
|------------------------|---------------------|
| PHP-FPM на хосте | PHP-FPM в Docker |
| Laravel файлы в `/var/www/` | Laravel в Docker volume |
| Nginx работает напрямую с PHP | Nginx проксирует на Docker |
| `fastcgi_pass unix:/var/run/php/...` | `proxy_pass http://localhost:8080` |

---

## Резюме:

✅ **НУЖНО:**
1. Установить Nginx на хосте (если не установлен)
2. Создать конфиг reverse proxy
3. Активировать конфиг
4. Настроить файрвол (порты 80, 443)

❌ **НЕ НУЖНО:**
1. Настраивать PHP-FPM на хосте
2. Копировать файлы Laravel
3. Настраивать `fastcgi_pass`

Ваши Docker-контейнеры уже содержат все необходимое!
