# Настройка SSL сертификата

Этот документ описывает процесс настройки SSL-сертификата через Let's Encrypt для домена `olimpiec-shop.ru`.

## Предварительные требования

1. ✅ Домен настроен и указывает на IP сервера (DNS A-запись)
2. ✅ Nginx настроен и работает на порту 80
3. ✅ Сайт доступен по HTTP: `curl http://olimpiec-shop.ru`

## Установка SSL

### Автоматическая установка (рекомендуется)

```bash
cd ~/olimpiec/olimpiec
sudo ./scripts/setup-ssl.sh
```

Или с указанием email:

```bash
sudo ./scripts/setup-ssl.sh your-email@example.com
```

Скрипт автоматически:
- Установит Certbot (если не установлен)
- Проверит DNS и доступность HTTP
- Получит SSL-сертификат от Let's Encrypt
- Настроит Nginx для работы с HTTPS
- Настроит автоматическое перенаправление HTTP → HTTPS
- Настроит автоматическое обновление сертификата

### Ручная установка

```bash
# Установка Certbot
sudo apt update
sudo apt install -y certbot python3-certbot-nginx

# Получение сертификата
sudo certbot --nginx -d olimpiec-shop.ru -d www.olimpiec-shop.ru

# Настройка автоматического обновления
sudo systemctl enable certbot.timer
sudo systemctl start certbot.timer
```

## После установки SSL

### 1. Обновите .env файл

Отредактируйте `olimpiec/.env`:

```bash
nano ~/olimpiec/olimpiec/.env
```

Измените:

```env
APP_URL=https://olimpiec-shop.ru
FRONTEND_URL=https://olimpiec-shop.ru
```

### 2. Перезапустите контейнеры

```bash
cd ~/olimpiec/olimpiec
docker-compose restart
```

### 3. Проверьте работу

```bash
# Проверка HTTPS
curl https://olimpiec-shop.ru

# Проверка перенаправления HTTP → HTTPS
curl -I http://olimpiec-shop.ru
# Должен вернуть 301 или 302 редирект
```

## Проверка статуса сертификата

```bash
# Проверка срока действия
sudo certbot certificates

# Тестовое обновление (не обновляет реальный сертификат)
sudo certbot renew --dry-run
```

## Автоматическое обновление

Certbot автоматически обновляет сертификаты каждые 90 дней. Проверьте статус:

```bash
sudo systemctl status certbot.timer
sudo systemctl list-timers | grep certbot
```

## Устранение проблем

### Ошибка: "Failed to obtain certificate"

**Причины:**
- DNS записи не настроены или не распространились
- Порт 80 закрыт в firewall
- Nginx не работает
- Домен уже имеет активный сертификат

**Решение:**
```bash
# Проверка DNS
dig +short olimpiec-shop.ru

# Проверка доступности HTTP
curl -I http://olimpiec-shop.ru

# Проверка статуса Nginx
sudo systemctl status nginx

# Проверка логов Certbot
sudo tail -50 /var/log/letsencrypt/letsencrypt.log
```

### Ошибка: "Connection refused" на HTTPS

**Причина:** Nginx не перезагружен после установки сертификата

**Решение:**
```bash
sudo nginx -t
sudo systemctl reload nginx
```

### Проверка конфигурации Nginx

После установки SSL, Certbot автоматически обновит конфигурацию Nginx. Проверьте:

```bash
sudo cat /etc/nginx/sites-available/olimpiec-shop.ru
```

Должны быть два блока `server`:
- Один для HTTP (порт 80) с редиректом на HTTPS
- Один для HTTPS (порт 443) с SSL сертификатами

## Безопасность

После установки SSL рекомендуется:

1. **Настроить HSTS** (уже включено Certbot по умолчанию)
2. **Проверить SSL рейтинг:** https://www.ssllabs.com/ssltest/analyze.html?d=olimpiec-shop.ru
3. **Обновить CORS** (уже настроено в `config/cors.php`)

## Дополнительная информация

- [Let's Encrypt документация](https://letsencrypt.org/docs/)
- [Certbot документация](https://certbot.eff.org/docs/)
- [Nginx SSL конфигурация](https://nginx.org/en/docs/http/configuring_https_servers.html)
