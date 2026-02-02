# Инструкция по развертыванию на сервере

## Быстрый старт

### 1. Подготовка на локальной машине

```bash
# Убедитесь, что все изменения закоммичены
git add .
git commit -m "Prepare for production deployment"
git push
```

### 2. На сервере - клонирование проекта

```bash
# Подключитесь к серверу по SSH
ssh user@89.169.187.129

# Клонируйте репозиторий
cd /var/www
git clone YOUR_REPO_URL olimpiec
cd olimpiec/olimpiec
```

### 3. Настройка переменных окружения

```bash
# Создайте .env из шаблона
cp .env.production.example .env

# Отредактируйте .env (обязательно заполните):
nano .env
```

**Обязательные параметры для изменения:**
- `APP_URL=https://olimpiec-shop.ru`
- `FRONTEND_URL=https://olimpiec-shop.ru`
- `DB_PASSWORD` - надежный пароль
- `TELEGRAM_BOT_TOKEN` - ваш токен бота
- `YOOKASSA_SHOP_ID` и `YOOKASSA_SECRET_KEY` - для продакшена

### 4. Запуск настройки

```bash
# Сделайте скрипты исполняемыми
chmod +x scripts/*.sh

# Запустите настройку продакшена
./scripts/setup-production.sh
```

### 5. Настройка Nginx на хосте

```bash
# Настройка Nginx как reverse proxy
sudo ./scripts/setup-nginx.sh
```

### 6. Настройка DNS в Yandex Cloud

1. Войдите в [Yandex Cloud Console](https://console.cloud.yandex.ru/)
2. Перейдите в **Cloud DNS**
3. Создайте зону для `olimpiec-shop.ru`
4. Добавьте A-записи:
   - `@` → `89.169.187.129`
   - `www` → `89.169.187.129`

Подождите 5-15 минут для распространения DNS.

### 7. Настройка SSL (HTTPS)

```bash
# После того как DNS распространился
sudo ./scripts/setup-ssl.sh
```

### 8. Обновление .env для HTTPS

```bash
nano .env
```

Измените:
```env
APP_URL=https://olimpiec-shop.ru
FRONTEND_URL=https://olimpiec-shop.ru
```

Перезапустите контейнеры:
```bash
docker-compose restart
docker-compose exec php-fpm php artisan config:clear
```

### 9. Проверка работы

```bash
# Проверка DNS
dig olimpiec-shop.ru +short

# Проверка HTTP
curl -I http://olimpiec-shop.ru

# Проверка HTTPS
curl -I https://olimpiec-shop.ru

# Проверка API
curl https://olimpiec-shop.ru/api/health
```

---

## Обновление приложения

После внесения изменений в код:

```bash
# На сервере
cd /var/www/olimpiec/olimpiec

# Получить изменения
git pull

# Пересобрать фронтенд
cd ../frontend
npm install
npm run build
cd ../olimpiec

# Перезапустить контейнеры
docker-compose restart

# Очистить кэш
docker-compose exec php-fpm php artisan config:clear
docker-compose exec php-fpm php artisan cache:clear
```

---

## Настройка файрвола

```bash
# Откройте необходимые порты
sudo ufw allow 22/tcp    # SSH
sudo ufw allow 80/tcp    # HTTP
sudo ufw allow 443/tcp   # HTTPS
sudo ufw enable
```

---

## Настройка Security Groups в Yandex Cloud

В Yandex Cloud Console → Network → Security Groups:

1. Создайте или отредактируйте Security Group
2. Добавьте правила для входящего трафика:
   - TCP 22 (SSH)
   - TCP 80 (HTTP)
   - TCP 443 (HTTPS)
3. Примените Security Group к виртуальной машине

---

## Мониторинг и логи

```bash
# Логи Docker контейнеров
docker-compose logs -f

# Логи Nginx
sudo tail -f /var/log/nginx/olimpiec-shop-access.log
sudo tail -f /var/log/nginx/olimpiec-shop-error.log

# Логи Laravel
docker-compose exec php-fpm tail -f storage/logs/laravel.log

# Статус контейнеров
docker-compose ps

# Использование ресурсов
docker stats
```

---

## Резервное копирование

### База данных

```bash
# Создать бэкап
docker-compose exec postgres pg_dump -U olimpiec olimpiec > backup_$(date +%Y%m%d_%H%M%S).sql

# Восстановить из бэкапа
docker-compose exec -T postgres psql -U olimpiec olimpiec < backup.sql
```

### Файлы storage

```bash
# Создать архив
tar -czf storage_backup_$(date +%Y%m%d_%H%M%S).tar.gz storage/app/public
```

---

## Решение проблем

### Проблема: Домен не работает

1. Проверьте DNS: `dig olimpiec-shop.ru +short`
2. Проверьте Nginx: `sudo nginx -t`
3. Проверьте логи: `sudo tail -f /var/log/nginx/olimpiec-shop-error.log`

### Проблема: 502 Bad Gateway

1. Проверьте, что контейнеры запущены: `docker-compose ps`
2. Проверьте логи: `docker-compose logs web`
3. Проверьте, что порты открыты: `sudo netstat -tlnp | grep -E '5173|8080'`

### Проблема: SSL не работает

1. Проверьте DNS: `dig olimpiec-shop.ru +short`
2. Проверьте, что порт 80 открыт
3. Переустановите сертификат: `sudo certbot renew --force-renewal`

---

## Полезные команды

```bash
# Перезапуск всех контейнеров
docker-compose restart

# Перезапуск конкретного сервиса
docker-compose restart php-fpm

# Просмотр логов
docker-compose logs -f php-fpm

# Выполнение команд в контейнере
docker-compose exec php-fpm php artisan migrate

# Очистка кэша
docker-compose exec php-fpm php artisan config:clear
docker-compose exec php-fpm php artisan cache:clear
docker-compose exec php-fpm php artisan route:clear
docker-compose exec php-fpm php artisan view:clear

# Обновление зависимостей
docker-compose exec php-fpm composer install --no-dev --optimize-autoloader
```

---

## Структура проекта на сервере

```
/var/www/olimpiec/
├── olimpiec/          # Backend (Laravel)
│   ├── .env          # Конфигурация (НЕ в git!)
│   ├── docker-compose.yml
│   └── scripts/      # Скрипты настройки
└── frontend/          # Frontend (React)
    └── dist/         # Собранные файлы
```

---

## Контакты и поддержка

При возникновении проблем проверьте:
1. Логи контейнеров
2. Логи Nginx
3. DNS записи
4. Файрвол и Security Groups
