# Настройка домена olimpiec-shop.ru на Yandex Cloud

## Проблема:

✅ Nginx работает (видна приветственная страница по IP)  
❌ Домен не работает (нет DNS записей)

## Решение:

После смены NS серверов на Yandex Cloud нужно **создать DNS записи** для домена.

---

## Шаг 1: Настройка DNS записей в Yandex Cloud

### Вариант A: Через веб-интерфейс Yandex Cloud

1. Войдите в [Yandex Cloud Console](https://console.cloud.yandex.ru/)
2. Перейдите в раздел **Cloud DNS** или **DNS**
3. Создайте новую зону для домена `olimpiec-shop.ru`
4. Добавьте следующие записи:

#### A-запись для основного домена:
```
Тип: A
Имя: @ (или оставить пустым)
Значение: 89.169.187.129
TTL: 300
```

#### A-запись для www:
```
Тип: A
Имя: www
Значение: 89.169.187.129
TTL: 300
```

### Вариант B: Через Yandex Cloud CLI

Если у вас установлен YCLI:

```bash
# Создать DNS зону
yc dns zone create --name olimpiec-shop-ru --zone olimpiec-shop.ru.

# Добавить A-запись для основного домена
yc dns zone add-records --name olimpiec-shop-ru \
  --record "@ 300 A 89.169.187.129"

# Добавить A-запись для www
yc dns zone add-records --name olimpiec-shop-ru \
  --record "www 300 A 89.169.187.129"
```

---

## Шаг 2: Проверка DNS записей

После создания записей подождите 5-15 минут для распространения DNS, затем проверьте:

```bash
# Проверка A-записи
dig olimpiec-shop.ru +short
# Должен вернуть: 89.169.187.129

# Или
nslookup olimpiec-shop.ru
# Должен показать: 89.169.187.129

# Проверка www
dig www.olimpiec-shop.ru +short
# Должен вернуть: 89.169.187.129
```

**Онлайн проверка:**
- [https://dnschecker.org/#A/olimpiec-shop.ru](https://dnschecker.org/#A/olimpiec-shop.ru)
- [https://www.whatsmydns.net/#A/olimpiec-shop.ru](https://www.whatsmydns.net/#A/olimpiec-shop.ru)

---

## Шаг 3: Настройка Nginx для домена

Создайте конфигурацию Nginx для вашего домена:

```bash
sudo nano /etc/nginx/sites-available/olimpiec-shop.ru
```

**Конфигурация:**

```nginx
server {
    listen 80;
    server_name olimpiec-shop.ru www.olimpiec-shop.ru;

    # Логи
    access_log /var/log/nginx/olimpiec-shop-access.log;
    error_log /var/log/nginx/olimpiec-shop-error.log;

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
        
        # Таймауты
        proxy_connect_timeout 60s;
        proxy_send_timeout 60s;
        proxy_read_timeout 60s;
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

    # Storage (изображения)
    location /storage {
        proxy_pass http://localhost:8080;
        proxy_http_version 1.1;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        
        # Кэширование
        expires 30d;
        add_header Cache-Control "public";
    }
}
```

Активируйте конфигурацию:

```bash
# Создайте символическую ссылку
sudo ln -s /etc/nginx/sites-available/olimpiec-shop.ru /etc/nginx/sites-enabled/

# Удалите дефолтную конфигурацию (если нужно)
sudo rm /etc/nginx/sites-enabled/default

# Проверьте конфигурацию
sudo nginx -t

# Перезагрузите Nginx
sudo systemctl reload nginx
```

---

## Шаг 4: Обновите .env файл

В файле `olimpiec/.env` измените:

```env
APP_URL=https://olimpiec-shop.ru
FRONTEND_URL=https://olimpiec-shop.ru
```

**Важно:** Пока используйте `http://`, после настройки SSL измените на `https://`.

---

## Шаг 5: Настройка SSL (HTTPS)

После того как домен заработает, настройте SSL через Let's Encrypt:

```bash
# Установите certbot
sudo apt update
sudo apt install certbot python3-certbot-nginx -y

# Получите SSL сертификат
sudo certbot --nginx -d olimpiec-shop.ru -d www.olimpiec-shop.ru
```

Certbot автоматически:
- Получит SSL сертификат
- Обновит конфигурацию Nginx для HTTPS
- Настроит автоматическое обновление сертификата

После этого обновите `.env`:
```env
APP_URL=https://olimpiec-shop.ru
FRONTEND_URL=https://olimpiec-shop.ru
```

---

## Шаг 6: Проверка работы

```bash
# Проверка DNS
dig olimpiec-shop.ru +short

# Проверка HTTP
curl -I http://olimpiec-shop.ru

# Проверка API
curl http://olimpiec-shop.ru/api/health

# Проверка логов Nginx
sudo tail -f /var/log/nginx/olimpiec-shop-access.log
sudo tail -f /var/log/nginx/olimpiec-shop-error.log
```

---

## Возможные проблемы:

### 1. DNS еще не распространился

**Решение:** Подождите 15-30 минут. DNS может распространяться до 48 часов, но обычно это занимает 5-15 минут.

**Проверка:**
```bash
dig olimpiec-shop.ru @8.8.8.8
dig olimpiec-shop.ru @1.1.1.1
```

### 2. Nginx не слушает на порту 80

**Проверка:**
```bash
sudo netstat -tlnp | grep :80
# Или
sudo ss -tlnp | grep :80
```

**Решение:** Убедитесь, что Nginx запущен:
```bash
sudo systemctl status nginx
sudo systemctl start nginx
```

### 3. Файрвол блокирует порт 80

**Проверка:**
```bash
sudo ufw status
```

**Решение:**
```bash
sudo ufw allow 80/tcp
sudo ufw allow 443/tcp
sudo ufw reload
```

### 4. Yandex Cloud блокирует порты

**Проверка:** В Yandex Cloud Console → Network → Security Groups

**Решение:** Убедитесь, что в Security Group открыты порты 80 и 443 для входящего трафика.

---

## Чеклист:

- [ ] Создана DNS зона в Yandex Cloud
- [ ] Добавлена A-запись для `@` (основной домен)
- [ ] Добавлена A-запись для `www`
- [ ] DNS записи распространились (проверено через dig/nslookup)
- [ ] Создана конфигурация Nginx для домена
- [ ] Конфигурация активирована и проверена
- [ ] Nginx перезагружен
- [ ] Файрвол настроен (порты 80, 443 открыты)
- [ ] Security Groups в Yandex Cloud настроены
- [ ] Обновлен .env файл
- [ ] Домен работает (проверено через curl/браузер)
- [ ] Настроен SSL (опционально, но рекомендуется)

---

## Полезные команды:

```bash
# Проверка DNS
dig olimpiec-shop.ru +short
nslookup olimpiec-shop.ru
host olimpiec-shop.ru

# Проверка Nginx
sudo nginx -t
sudo systemctl status nginx
sudo systemctl reload nginx

# Проверка портов
sudo netstat -tlnp | grep :80
sudo ss -tlnp | grep :80

# Проверка файрвола
sudo ufw status
sudo iptables -L -n

# Логи Nginx
sudo tail -f /var/log/nginx/olimpiec-shop-access.log
sudo tail -f /var/log/nginx/olimpiec-shop-error.log
```
