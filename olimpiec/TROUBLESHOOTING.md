# Устранение проблем

Этот документ содержит решения распространенных проблем при развертывании и работе приложения.

## Ошибка: "No application encryption key has been specified"

**Причина:** В файле `.env` не установлен `APP_KEY`.

**Решение:**

```bash
cd ~/olimpiec/olimpiec
./scripts/generate-app-key.sh
```

Или вручную:

```bash
docker-compose exec php-fpm php artisan key:generate --force
docker-compose exec php-fpm php artisan config:clear
docker-compose exec php-fpm php artisan cache:clear
```

## Ошибка: "relation 'users' does not exist"

**Причина:** Миграции базы данных не выполнены.

**Решение:**

```bash
cd ~/olimpiec/olimpiec
./scripts/run-migrations.sh
```

Или вручную:

```bash
docker-compose exec php-fpm php artisan migrate --force
```

## Ошибка: "Failed to open stream: No such file or directory in /var/www/html/vendor/autoload.php"

**Причина:** Зависимости Composer не установлены.

**Решение:**

```bash
cd ~/olimpiec/olimpiec
./scripts/install-dependencies.sh
```

Или вручную:

```bash
docker-compose exec php-fpm composer install --no-dev --optimize-autoloader
```

## Ошибка: 403 Forbidden от Nginx

**Причина:** Контейнеры не запущены или порты недоступны.

**Решение:**

1. Проверьте статус контейнеров:
```bash
docker-compose ps
```

2. Если контейнеры не запущены:
```bash
docker-compose up -d
```

3. Проверьте доступность портов:
```bash
curl http://localhost:5173
curl http://localhost:8080/api/health
```

4. Проверьте логи:
```bash
docker-compose logs frontend
docker-compose logs nginx
sudo tail -20 /var/log/nginx/olimpiec-shop-error.log
```

## Ошибка: 500 Internal Server Error

**Возможные причины:**

1. **APP_KEY не установлен** - см. выше
2. **Проблемы с базой данных** - проверьте подключение
3. **Проблемы с правами доступа** - проверьте права на storage

**Решение:**

```bash
# 1. Проверьте APP_KEY
grep APP_KEY .env

# 2. Проверьте подключение к БД
docker-compose exec php-fpm php artisan tinker
# В консоли: DB::connection()->getPdo();

# 3. Проверьте права доступа
sudo chown -R $USER:$USER storage bootstrap/cache
chmod -R 775 storage bootstrap/cache

# 4. Проверьте логи
docker-compose logs php-fpm
tail -50 storage/logs/laravel.log
```

## Ошибка: "Connection refused" при подключении к базе данных

**Причина:** Контейнер PostgreSQL не запущен или неправильные настройки подключения.

**Решение:**

1. Проверьте статус контейнера:
```bash
docker-compose ps postgres
```

2. Проверьте настройки в `.env`:
```env
DB_CONNECTION=pgsql
DB_HOST=postgres
DB_PORT=5432
DB_DATABASE=your_database
DB_USERNAME=your_username
DB_PASSWORD=your_password
```

3. Перезапустите контейнеры:
```bash
docker-compose restart postgres
```

## Ошибка: "Storage link not found"

**Причина:** Символическая ссылка для storage не создана.

**Решение:**

```bash
docker-compose exec php-fpm php artisan storage:link
```

## Ошибка при сборке фронтенда: "EACCES: permission denied"

**Причина:** Недостаточно прав доступа к директории.

**Решение:**

```bash
cd ~/olimpiec/frontend
sudo chown -R $USER:$USER .
chmod -R 755 .
rm -rf dist
mkdir -p dist
chmod 755 dist
npm run build
```

## Проблемы с SSL сертификатом

### Ошибка: "Failed to obtain certificate"

**Решение:**

1. Проверьте DNS:
```bash
dig +short olimpiec-shop.ru
```

2. Проверьте доступность HTTP:
```bash
curl -I http://olimpiec-shop.ru
```

3. Проверьте логи Certbot:
```bash
sudo tail -50 /var/log/letsencrypt/letsencrypt.log
```

## Проблемы с Docker Compose

### Ошибка: "docker: unknown command: docker compose"

**Причина:** Установлена старая версия Docker Compose (через дефис).

**Решение:** Используйте `docker-compose` вместо `docker compose`. Все скрипты автоматически определяют доступную команду.

## Проблемы с кэшем

Если изменения не применяются, очистите кэш:

```bash
docker-compose exec php-fpm php artisan config:clear
docker-compose exec php-fpm php artisan cache:clear
docker-compose exec php-fpm php artisan route:clear
docker-compose exec php-fpm php artisan view:clear
```

## Проблемы с правами доступа

Если возникают проблемы с правами доступа:

```bash
# В директории olimpiec/
sudo chown -R $USER:$USER .
chmod -R 755 .

# Для storage и cache
chmod -R 775 storage bootstrap/cache
```

## Полная переустановка

Если ничего не помогает, выполните полную переустановку:

```bash
cd ~/olimpiec/olimpiec

# 1. Остановите контейнеры
docker-compose down

# 2. Удалите volumes (ОСТОРОЖНО: удалит данные БД!)
# docker-compose down -v

# 3. Пересоберите контейнеры
docker-compose build --no-cache

# 4. Запустите setup-production.sh
./scripts/setup-production.sh

# 5. Создайте администратора
./scripts/create-admin.sh
```

## Получение помощи

Если проблема не решена:

1. Проверьте логи:
   - Laravel: `storage/logs/laravel.log`
   - Docker: `docker-compose logs`
   - Nginx: `/var/log/nginx/olimpiec-shop-error.log`

2. Проверьте документацию:
   - `ADMIN_SETUP.md` - создание администратора
   - `SSL_SETUP.md` - настройка SSL
   - `NGINX_REVERSE_PROXY_SETUP.md` - настройка Nginx

3. Проверьте статус всех сервисов:
```bash
docker-compose ps
sudo systemctl status nginx
```
