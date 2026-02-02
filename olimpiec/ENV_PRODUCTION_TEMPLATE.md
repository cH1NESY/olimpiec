# Шаблон .env для продакшена

Создайте файл `.env` на сервере и заполните следующие значения:

```env
APP_NAME="Олимпиец"
APP_ENV=production
APP_KEY=
APP_DEBUG=false
APP_TIMEZONE=UTC
APP_URL=https://olimpiec-shop.ru
APP_LOCALE=ru
APP_FALLBACK_LOCALE=ru
APP_FAKER_LOCALE=ru_RU
APP_MAINTENANCE_DRIVER=file

BCRYPT_ROUNDS=12

LOG_CHANNEL=stack
LOG_STACK=single
LOG_DEPRECATIONS_CHANNEL=null
LOG_LEVEL=error

DB_CONNECTION=pgsql
DB_HOST=postgres
DB_PORT=5432
DB_DATABASE=olimpiec
DB_USERNAME=olimpiec
DB_PASSWORD=ВАШ_НАДЕЖНЫЙ_ПАРОЛЬ_БД

SESSION_DRIVER=database
SESSION_LIFETIME=120
SESSION_ENCRYPT=false
SESSION_PATH=/
SESSION_DOMAIN=null

BROADCAST_CONNECTION=log
FILESYSTEM_DISK=local
QUEUE_CONNECTION=database
CACHE_STORE=file

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
MAIL_FROM_ADDRESS="noreply@olimpiec-shop.ru"
MAIL_FROM_NAME="${APP_NAME}"

AWS_ACCESS_KEY_ID=
AWS_SECRET_ACCESS_KEY=
AWS_DEFAULT_REGION=us-east-1
AWS_BUCKET=
AWS_USE_PATH_STYLE_ENDPOINT=false

VITE_APP_NAME="${APP_NAME}"

# Frontend URL (для CORS)
FRONTEND_URL=https://olimpiec-shop.ru

# Telegram Bot
TELEGRAM_BOT_TOKEN=ВАШ_ТОКЕН_ОТ_BOTFATHER
TELEGRAM_BOT_USERNAME=@your_bot_username

# YooKassa Payment (для продакшена используйте реальные ключи, не test_)
YOOKASSA_SHOP_ID=ВАШ_SHOP_ID
YOOKASSA_SECRET_KEY=ВАШ_SECRET_KEY

# RabbitMQ
RABBITMQ_USER=admin
RABBITMQ_PASS=ВАШ_НАДЕЖНЫЙ_ПАРОЛЬ
```

## Важные замечания:

1. **APP_KEY** - будет сгенерирован автоматически при запуске `setup-production.sh`
2. **DB_PASSWORD** - используйте надежный пароль (минимум 16 символов)
3. **TELEGRAM_BOT_TOKEN** - ваш токен от @BotFather
4. **YOOKASSA_*** - для продакшена используйте реальные ключи (не test_)
5. **APP_URL** и **FRONTEND_URL** - сначала используйте `http://`, после настройки SSL измените на `https://`
