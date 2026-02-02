# Чеклист настройки сервера 51.250.107.12

## 1. Изменения в .env файле:

Откройте файл `olimpiec/.env` и измените следующие строки:

```env
# Строка 2
APP_ENV=production

# Строка 4  
APP_DEBUG=false

# Строка 5
APP_URL=http://51.250.107.12

# Строка 15
LOG_LEVEL=error

# Строка 25 (или где у вас FRONTEND_URL)
FRONTEND_URL=http://51.250.107.12
```

## 2. Изменения в docker-compose.yml:

Для продакшена нужно изменить порты, чтобы они были доступны снаружи:

**В файле `olimpiec/docker-compose.yml`:**

### Для web (backend API):
```yaml
# Было:
ports:
  - "127.0.0.1:8080:80"

# Должно быть (для продакшена):
ports:
  - "8080:80"  # Убрать 127.0.0.1, чтобы был доступен снаружи
```

### Для frontend:
```yaml
# Проверьте, что порт открыт:
ports:
  - "5173:80"  # Или "0.0.0.0:5173:80"
```

## 3. Настройка файрвола на сервере:

Откройте порты на сервере:

```bash
# Ubuntu/Debian
sudo ufw allow 80/tcp
sudo ufw allow 443/tcp
sudo ufw allow 8080/tcp
sudo ufw allow 5173/tcp
sudo ufw enable
```

## 4. Настройка Nginx на сервере (рекомендуется):

Вместо прямого доступа к портам, лучше настроить Nginx как reverse proxy:

### Установка Nginx:
```bash
sudo apt update
sudo apt install nginx -y
```

### Конфигурация для фронтенда:

Создайте файл `/etc/nginx/sites-available/olimpiec-frontend`:

```nginx
server {
    listen 80;
    server_name 51.250.107.12;  # Или ваш домен

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
}
```

### Конфигурация для API:

Создайте файл `/etc/nginx/sites-available/olimpiec-api`:

```nginx
server {
    listen 8080;
    server_name 51.250.107.12;  # Или ваш домен

    location / {
        proxy_pass http://localhost:8080;
        proxy_http_version 1.1;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

Активируйте конфигурации:

```bash
sudo ln -s /etc/nginx/sites-available/olimpiec-frontend /etc/nginx/sites-enabled/
sudo ln -s /etc/nginx/sites-available/olimpiec-api /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl reload nginx
```

## 5. Команды для применения изменений:

```bash
cd /path/to/olimpiec/olimpiec

# 1. Сгенерировать APP_KEY (если пустой)
docker compose exec php-fpm php artisan key:generate

# 2. Очистить кэш
docker compose exec php-fpm php artisan config:clear
docker compose exec php-fpm php artisan cache:clear

# 3. Перезапустить контейнеры
docker compose restart

# 4. Проверить статус
docker compose ps
```

## 6. Проверка работы:

```bash
# Проверка фронтенда
curl http://51.250.107.12

# Проверка API
curl http://51.250.107.12:8080/api/health
# Или если настроен Nginx:
curl http://51.250.107.12/api/health

# Проверка логов
docker compose logs -f
```

## 7. Настройка Telegram Mini App:

В @BotFather:
- `/myapps` → выберите приложение → `/editapp`
- Укажите URL: `http://51.250.107.12` (или ваш домен)

**⚠️ ВАЖНО:** Telegram требует HTTPS для Mini App. Если используете только IP, это может не работать. Рекомендуется:
1. Купить домен
2. Настроить DNS (A-запись на 51.250.107.12)
3. Установить SSL через Let's Encrypt
4. Использовать `https://yourdomain.com` в Telegram

## 8. Если есть домен:

1. Настройте DNS (A-запись на 51.250.107.12)
2. Установите SSL:
   ```bash
   sudo apt install certbot python3-certbot-nginx -y
   sudo certbot --nginx -d yourdomain.com
   ```
3. Обновите .env:
   ```env
   APP_URL=https://yourdomain.com
   FRONTEND_URL=https://yourdomain.com
   ```

## 9. Безопасность:

- ✅ Настройте файрвол
- ✅ Используйте сильные пароли для БД
- ✅ Регулярно обновляйте систему
- ✅ Настройте автоматические бэкапы
- ✅ Мониторьте логи на подозрительную активность
