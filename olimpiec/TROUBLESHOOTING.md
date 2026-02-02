# Решение проблем при развертывании

## Проблема: 403 Forbidden

### Симптомы:
- При обращении к домену получаете `403 Forbidden`
- В логах Nginx ошибки доступа

### Решения:

#### 1. Проверьте, что Docker контейнеры запущены:

```bash
docker-compose ps
```

Если контейнеры не запущены:
```bash
docker-compose up -d
```

#### 2. Проверьте доступность портов:

```bash
# Проверка frontend
curl http://localhost:5173

# Проверка backend
curl http://localhost:8080/api/health
```

#### 3. Используйте скрипт диагностики:

```bash
./scripts/fix-403-error.sh
```

#### 4. Проверьте логи Nginx:

```bash
sudo tail -f /var/log/nginx/olimpiec-shop-error.log
```

#### 5. Перезапустите контейнеры и Nginx:

```bash
docker-compose restart
sudo systemctl reload nginx
```

#### 6. Убедитесь, что порты открыты для localhost:

```bash
# Проверка портов
netstat -tlnp | grep -E '5173|8080'

# Должны быть видны:
# tcp  0  0 0.0.0.0:5173  LISTEN  ...
# tcp  0  0 127.0.0.1:8080  LISTEN  ...
```

---

## Проблема: Ошибка прав доступа при сборке фронтенда

### Симптомы:
```
EACCES: permission denied, copyfile '/path/to/favicon.ico' -> '/path/to/dist/favicon.ico'
```

### Решение:

```bash
# Исправление прав доступа
cd ~/olimpiec/frontend
sudo chown -R $USER:$USER .
chmod -R 755 .
rm -rf dist
mkdir -p dist
chmod 755 dist

# Повторная сборка
npm run build
```

Или используйте обновленный скрипт `setup-production.sh`, который автоматически исправляет права.

---

## Проблема: Домен не резолвится

### Симптомы:
- `nslookup olimpiec-shop.ru` возвращает `NXDOMAIN`
- DNS записи не найдены

### Решение:

1. Проверьте DNS записи в Yandex Cloud:
   - Cloud DNS → ваша зона → должны быть A-записи для `@` и `www`

2. Подождите 5-15 минут для распространения DNS

3. Проверьте DNS:
   ```bash
   dig olimpiec-shop.ru +short
   # Должен вернуть: 89.169.187.129
   ```

---

## Проблема: SSL сертификат не работает

### Симптомы:
- Ошибки при получении сертификата через certbot
- `ERR_SSL_PROTOCOL_ERROR` в браузере

### Решение:

1. Убедитесь, что DNS настроен:
   ```bash
   dig olimpiec-shop.ru +short
   ```

2. Убедитесь, что порт 80 открыт:
   ```bash
   sudo ufw allow 80/tcp
   ```

3. Проверьте, что домен доступен по HTTP:
   ```bash
   curl http://olimpiec-shop.ru
   ```

4. Переустановите сертификат:
   ```bash
   sudo certbot --nginx -d olimpiec-shop.ru -d www.olimpiec-shop.ru --force-renewal
   ```

---

## Проблема: API возвращает 404

### Симптомы:
- `/api/*` запросы возвращают 404
- API не работает

### Решение:

1. Проверьте, что backend контейнер запущен:
   ```bash
   docker-compose ps web
   ```

2. Проверьте логи backend:
   ```bash
   docker-compose logs web
   ```

3. Проверьте конфигурацию Nginx:
   ```bash
   sudo nginx -t
   ```

4. Убедитесь, что в `.env` правильный `APP_URL`:
   ```env
   APP_URL=https://olimpiec-shop.ru
   ```

---

## Проблема: Изображения не загружаются

### Симптомы:
- `/storage/*` возвращает 404
- Изображения товаров не отображаются

### Решение:

1. Проверьте символическую ссылку:
   ```bash
   docker-compose exec php-fpm ls -la public/storage
   ```

2. Создайте ссылку заново:
   ```bash
   docker-compose exec php-fpm php artisan storage:link
   ```

3. Проверьте права доступа:
   ```bash
   docker-compose exec php-fpm chmod -R 755 storage
   docker-compose exec php-fpm chown -R www-data:www-data storage
   ```

---

## Полезные команды для диагностики:

```bash
# Статус контейнеров
docker-compose ps

# Логи всех контейнеров
docker-compose logs -f

# Логи конкретного контейнера
docker-compose logs -f frontend
docker-compose logs -f web
docker-compose logs -f php-fpm

# Проверка портов
netstat -tlnp | grep -E '5173|8080'

# Проверка DNS
dig olimpiec-shop.ru +short
nslookup olimpiec-shop.ru

# Проверка Nginx
sudo nginx -t
sudo systemctl status nginx

# Логи Nginx
sudo tail -f /var/log/nginx/olimpiec-shop-access.log
sudo tail -f /var/log/nginx/olimpiec-shop-error.log

# Проверка файрвола
sudo ufw status
```

---

## Быстрое исправление всех проблем:

```bash
# 1. Исправление прав доступа
cd ~/olimpiec/frontend
sudo chown -R $USER:$USER .
chmod -R 755 .
rm -rf dist && mkdir -p dist

# 2. Пересборка фронтенда
npm run build

# 3. Перезапуск контейнеров
cd ../olimpiec
docker-compose restart

# 4. Перезагрузка Nginx
sudo systemctl reload nginx

# 5. Проверка
curl http://olimpiec-shop.ru
```
