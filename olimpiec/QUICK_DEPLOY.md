# Быстрое развертывание на сервере

## Подготовка (локально)

```bash
# 1. Убедитесь, что все изменения сохранены
git add .
git commit -m "Prepare for production"
git push
```

## На сервере

### 1. Клонирование и настройка

```bash
# Подключитесь к серверу
ssh user@89.169.187.129

# Клонируйте проект
cd /var/www
git clone YOUR_REPO_URL olimpiec
cd olimpiec/olimpiec

# Создайте .env (см. ENV_PRODUCTION_TEMPLATE.md)
nano .env

# Сделайте скрипты исполняемыми
chmod +x scripts/*.sh
```

### 2. Запуск настройки

```bash
# Автоматическая настройка
./scripts/setup-production.sh

# Настройка Nginx
sudo ./scripts/setup-nginx.sh
```

### 3. Настройка DNS в Yandex Cloud

1. Cloud DNS → Создать зону → `olimpiec-shop.ru`
2. Добавить A-запись: `@` → `89.169.187.129`
3. Добавить A-запись: `www` → `89.169.187.129`

### 4. Настройка SSL

```bash
# После распространения DNS (5-15 минут)
sudo ./scripts/setup-ssl.sh

# Обновите .env для HTTPS
nano .env
# Измените APP_URL и FRONTEND_URL на https://

# Перезапустите
docker compose restart
docker compose exec php-fpm php artisan config:clear
```

### 5. Готово! ✅

Проверьте: https://olimpiec-shop.ru
