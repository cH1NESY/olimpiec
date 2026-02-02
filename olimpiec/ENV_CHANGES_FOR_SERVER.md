# Изменения в .env для сервера 51.250.107.12

## Обязательные изменения:

### 1. Основные настройки приложения:

**Было:**
```env
APP_ENV=local
APP_DEBUG=true
APP_URL=http://localhost
```

**Должно быть:**
```env
APP_ENV=production
APP_DEBUG=false
APP_URL=http://51.250.107.12
```

### 2. Настройки логирования:

**Было:**
```env
LOG_LEVEL=debug
```

**Должно быть:**
```env
LOG_LEVEL=error
```

### 3. Настройки фронтенда (CORS):

**Было:**
```env
FRONTEND_URL=http://localhost:5173
```

**Должно быть:**
```env
FRONTEND_URL=http://51.250.107.12
```

---

## Полный список изменений (что нужно поменять):

```env
# СТРОКА 2: Изменить
APP_ENV=production

# СТРОКА 4: Изменить
APP_DEBUG=false

# СТРОКА 5: Изменить
APP_URL=http://51.250.107.12

# СТРОКА 15: Изменить
LOG_LEVEL=error

# СТРОКА 25: Изменить (если есть)
FRONTEND_URL=http://51.250.107.12
```

---

## Если у вас есть домен (рекомендуется):

Если вы купили домен и настроили DNS на IP 51.250.107.12, используйте:

```env
APP_URL=https://yourdomain.com
FRONTEND_URL=https://yourdomain.com
```

И настройте SSL сертификат через Let's Encrypt.

---

## Остальные настройки оставить как есть:

- ✅ `APP_NAME` - можно оставить или изменить на "Олимпиец"
- ✅ `APP_KEY` - если пустой, сгенерируйте: `php artisan key:generate`
- ✅ `DB_*` - оставить как есть (для Docker)
- ✅ `TELEGRAM_BOT_TOKEN` - оставить ваш токен
- ✅ `TELEGRAM_BOT_USERNAME` - оставить ваш username
- ✅ `YOOKASSA_*` - оставить ваши ключи (для продакшена используйте реальные, не test_)

---

## Команды после изменения .env:

```bash
# 1. Сгенерировать APP_KEY (если пустой)
docker compose exec php-fpm php artisan key:generate

# 2. Очистить кэш
docker compose exec php-fpm php artisan config:clear
docker compose exec php-fpm php artisan cache:clear

# 3. Перезапустить контейнеры
docker compose restart

# 4. Проверить работу
curl http://51.250.107.12/api/health
```

---

## Важно для безопасности:

1. **APP_DEBUG=false** - обязательно! Иначе будут видны ошибки
2. **APP_ENV=production** - обязательно! Для продакшена
3. **LOG_LEVEL=error** - не логировать debug информацию
4. Если используете YooKassa - замените `test_` ключи на реальные для продакшена

---

## Проверка после настройки:

```bash
# Проверка API
curl http://51.250.107.12/api/health

# Проверка фронтенда
curl http://51.250.107.12

# Проверка логов на ошибки
docker compose logs php-fpm | grep -i error
```
