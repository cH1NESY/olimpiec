# Настройка .env для продакшена (IP: 51.250.107.12)

## Что нужно изменить в .env файле:

### 1. Основные настройки приложения:

```env
APP_NAME="Олимпиец"
APP_ENV=production
APP_KEY=base64:ВАШ_СУЩЕСТВУЮЩИЙ_КЛЮЧ_ИЛИ_СГЕНЕРИРУЙТЕ_НОВЫЙ
APP_DEBUG=false
APP_TIMEZONE=UTC
APP_URL=http://51.250.107.12
# Или если у вас есть домен:
# APP_URL=https://yourdomain.com
```

**Важно:** Если у вас есть домен, используйте его вместо IP. Если домена нет, можно использовать IP, но лучше купить домен.

### 2. Настройки базы данных:

```env
DB_CONNECTION=pgsql
DB_HOST=postgres
DB_PORT=5432
DB_DATABASE=olimpiec
DB_USERNAME=olimpiec
DB_PASSWORD=ВАШ_НАДЕЖНЫЙ_ПАРОЛЬ_БД
```

**Важно:** 
- `DB_HOST=postgres` - это имя сервиса в docker-compose.yml, не меняйте
- `DB_PASSWORD` - используйте надежный пароль (минимум 16 символов)

### 3. Настройки фронтенда (CORS):

```env
FRONTEND_URL=http://51.250.107.12
# Или если у вас есть домен:
# FRONTEND_URL=https://yourdomain.com
```

**Важно:** Эта переменная используется для CORS. Если у вас есть домен, обязательно укажите его здесь.

### 4. Настройки Telegram:

```env
TELEGRAM_BOT_TOKEN=ВАШ_ТОКЕН_ОТ_BOTFATHER
TELEGRAM_BOT_USERNAME=ВАШ_БОТ_USERNAME
```

### 5. Настройки YooKassa (если используете):

```env
YOOKASSA_SHOP_ID=ВАШ_SHOP_ID
YOOKASSA_SECRET_KEY=ВАШ_SECRET_KEY
```

### 6. Настройки почты (если используете):

```env
MAIL_MAILER=smtp
MAIL_HOST=smtp.your-provider.com
MAIL_PORT=587
MAIL_USERNAME=your-email@example.com
MAIL_PASSWORD=your-password
MAIL_ENCRYPTION=tls
MAIL_FROM_ADDRESS="noreply@yourdomain.com"
MAIL_FROM_NAME="${APP_NAME}"
```

### 7. Настройки очередей:

```env
QUEUE_CONNECTION=redis
# Или для простоты:
# QUEUE_CONNECTION=database
```

### 8. Настройки кэша:

```env
CACHE_STORE=redis
# Или для простоты:
# CACHE_STORE=file
```

### 9. Настройки сессий:

```env
SESSION_DRIVER=redis
# Или для простоты:
# SESSION_DRIVER=file
SESSION_LIFETIME=120
```

### 10. Настройки RabbitMQ (если используете):

```env
RABBITMQ_USER=admin
RABBITMQ_PASS=ВАШ_НАДЕЖНЫЙ_ПАРОЛЬ
```

---

## Полный пример .env для продакшена:

```env
APP_NAME="Олимпиец"
APP_ENV=production
APP_KEY=base64:ВАШ_КЛЮЧ
APP_DEBUG=false
APP_TIMEZONE=UTC
APP_URL=http://51.250.107.12

LOG_CHANNEL=stack
LOG_DEPRECATIONS_CHANNEL=null
LOG_LEVEL=error

DB_CONNECTION=pgsql
DB_HOST=postgres
DB_PORT=5432
DB_DATABASE=olimpiec
DB_USERNAME=olimpiec
DB_PASSWORD=ВАШ_НАДЕЖНЫЙ_ПАРОЛЬ_БД

BROADCAST_CONNECTION=log
FILESYSTEM_DISK=local
QUEUE_CONNECTION=database
SESSION_DRIVER=file
SESSION_LIFETIME=120

MEMCACHED_HOST=127.0.0.1

REDIS_HOST=127.0.0.1
REDIS_PASSWORD=null
REDIS_PORT=6379

MAIL_MAILER=smtp
MAIL_HOST=mailpit
MAIL_PORT=1025
MAIL_USERNAME=null
MAIL_PASSWORD=null
MAIL_ENCRYPTION=null
MAIL_FROM_ADDRESS="hello@example.com"
MAIL_FROM_NAME="${APP_NAME}"

AWS_ACCESS_KEY_ID=
AWS_SECRET_ACCESS_KEY=
AWS_DEFAULT_REGION=us-east-1
AWS_BUCKET=
AWS_USE_PATH_STYLE_ENDPOINT=false

VITE_APP_NAME="${APP_NAME}"

FRONTEND_URL=http://51.250.107.12

TELEGRAM_BOT_TOKEN=ВАШ_ТОКЕН
TELEGRAM_BOT_USERNAME=ВАШ_БОТ_USERNAME

YOOKASSA_SHOP_ID=ВАШ_SHOP_ID
YOOKASSA_SECRET_KEY=ВАШ_SECRET_KEY

RABBITMQ_USER=admin
RABBITMQ_PASS=ВАШ_ПАРОЛЬ
```

---

## Шаги после настройки .env:

1. **Сгенерируйте APP_KEY (если нужно):**
   ```bash
   docker compose exec php-fpm php artisan key:generate
   ```

2. **Очистите кэш конфигурации:**
   ```bash
   docker compose exec php-fpm php artisan config:clear
   docker compose exec php-fpm php artisan cache:clear
   ```

3. **Проверьте конфигурацию:**
   ```bash
   docker compose exec php-fpm php artisan config:show
   ```

4. **Запустите миграции:**
   ```bash
   docker compose exec php-fpm php artisan migrate --force
   ```

5. **Создайте символическую ссылку для storage:**
   ```bash
   docker compose exec php-fpm php artisan storage:link
   ```

---

## Если у вас есть домен:

Если вы купили домен и настроили DNS (A-запись на 51.250.107.12), измените:

```env
APP_URL=https://yourdomain.com
FRONTEND_URL=https://yourdomain.com
```

И добавьте домен в `config/cors.php` в массив `allowed_origins` или используйте паттерн.

---

## Безопасность:

1. ✅ **APP_DEBUG=false** - обязательно для продакшена
2. ✅ **APP_ENV=production** - обязательно для продакшена
3. ✅ Используйте надежные пароли для БД
4. ✅ Не коммитьте .env в git
5. ✅ Регулярно обновляйте зависимости
6. ✅ Настройте SSL (Let's Encrypt) если есть домен

---

## Проверка работы:

После настройки проверьте:

```bash
# Проверка доступности API
curl http://51.250.107.12/api/health

# Проверка фронтенда
curl http://51.250.107.12

# Проверка логов
docker compose logs -f
```
