# Настройка Telegram Mini App

## Шаги для запуска Telegram Mini App

### 1. Создание Telegram бота

1. Откройте [@BotFather](https://t.me/BotFather) в Telegram
2. Отправьте команду `/newbot`
3. Следуйте инструкциям для создания бота
4. Сохраните полученный токен бота

### 2. Настройка Web App

**⚠️ ВАЖНО:** Telegram Mini App требует **публичный HTTPS URL**. Локальный `http://localhost:5173/` **не подойдет**.

#### Вариант A: Использование ngrok для локальной разработки

1. Установите [ngrok](https://ngrok.com/download)
2. Запустите туннель для вашего фронтенда:
   ```bash
   ngrok http 5173
   ```
3. Скопируйте полученный HTTPS URL (например: `https://abc123.ngrok.io`)
4. Отправьте команду `/newapp` боту [@BotFather](https://t.me/BotFather)
5. Выберите вашего бота
6. Укажите название приложения
7. Укажите описание
8. Загрузите иконку (512x512px)
9. Укажите URL: `https://abc123.ngrok.io` (URL из ngrok)
10. Сохраните полученный URL для Mini App

**Примечание:** Бесплатный ngrok дает случайный URL при каждом запуске. Для постоянного URL используйте платную версию или другие сервисы (cloudflared, localtunnel).

#### Вариант B: Использование cloudflared (бесплатно, постоянный URL)

1. Установите cloudflared:
   ```bash
   # Перейдите в директорию проекта
   cd olimpiec
   
   # Скачайте cloudflared
   wget https://github.com/cloudflare/cloudflared/releases/latest/download/cloudflared-linux-amd64 -O cloudflared
   chmod +x cloudflared
   
   # Или через пакетный менеджер (Ubuntu/Debian)
   # sudo apt install cloudflared
   ```

2. **Убедитесь, что фронтенд запущен и доступен:**
   ```bash
   # Проверьте, что фронтенд доступен
   curl http://localhost:5173
   
   # Или запустите фронтенд, если он не запущен
   docker compose up -d frontend
   ```

3. **Запустите туннель:**
   ```bash
   # Используйте готовый скрипт
   ./scripts/start-cloudflared.sh
   
   # Или вручную (из директории olimpiec)
   ./cloudflared tunnel --url http://localhost:5173
   ```

4. **Скопируйте HTTPS URL из вывода** - он будет выглядеть примерно так:
   ```
   https://academics-joke-selected-hawk.trycloudflare.com
   ```
   
   ⚠️ **Важно:** 
   - Оставьте процесс cloudflared запущенным! Если вы закроете терминал или остановите процесс, туннель перестанет работать.
   - Подождите 10-30 секунд после запуска, чтобы туннель полностью установился.
   - Если видите ошибки таймаутов в логах - это нормально, туннель все равно может работать.
   - **Если получаете ошибку 530:** Перезапустите cloudflared после изменения портов Docker.

5. **Проверьте доступность URL** (в другом терминале):
   ```bash
   curl -I https://your-url.trycloudflare.com
   ```
   
   Должен вернуться HTTP 200 или 302. Если получаете 530 - перезапустите cloudflared.

6. **Используйте полученный HTTPS URL в @BotFather:**
   - Откройте [@BotFather](https://t.me/BotFather)
   - Отправьте `/newapp`
   - Выберите вашего бота
   - Укажите URL: `https://your-url.trycloudflare.com` (ваш URL)
   - Сохраните настройки

#### Вариант C: Развертывание на сервере с HTTPS

Если у вас есть сервер с доменом и SSL сертификатом:
- Укажите полный URL: `https://yourdomain.com`
- Или для отдельной страницы: `https://yourdomain.com/telegram`

### 3. Настройка переменных окружения

Добавьте в `.env` файл:

```env
TELEGRAM_BOT_TOKEN=your_bot_token_here
TELEGRAM_BOT_USERNAME=your_bot_username
```

### 4. Запуск миграций

```bash
docker compose exec php-fpm php artisan migrate
```

Это добавит поля для Telegram пользователей в таблицу `users`.

### 5. Настройка HTTPS

Telegram Mini App **требует HTTPS** для работы. 

**Для локальной разработки:**
- Используйте ngrok, cloudflared или подобные туннели
- Они автоматически предоставляют HTTPS URL

**Для продакшена:**
- Убедитесь, что ваш домен имеет валидный SSL сертификат
- Все запросы должны идти через HTTPS
- Можно использовать Let's Encrypt для бесплатного SSL

### 6. Тестирование

1. Откройте вашего бота в Telegram
2. Найдите кнопку "Menu" или команду `/start`
3. Нажмите на кнопку с вашим Mini App
4. Приложение должно открыться в Telegram WebView

## Решение проблемы 530 ошибки

Если вы получаете ошибку **530** при открытии URL через cloudflared:

1. **Остановите cloudflared** (Ctrl+C в терминале где он запущен)

2. **Убедитесь, что фронтенд доступен:**
   ```bash
   curl http://localhost:5173
   ```

3. **Перезапустите cloudflared:**
   ```bash
   ./cloudflared tunnel --url http://localhost:5173
   ```

4. **Подождите 30-60 секунд** и проверьте снова

5. **Если проблема сохраняется**, попробуйте использовать ngrok как альтернативу

## Структура проекта

### Backend

- `app/Http/Controllers/Api/TelegramAuthController.php` - Контроллер для аутентификации через Telegram
- `app/Models/User.php` - Модель пользователя с поддержкой Telegram полей
- `database/migrations/2026_01_30_110631_add_telegram_fields_to_users_table.php` - Миграция для Telegram полей
- `routes/api.php` - Маршрут `/api/auth/telegram` для аутентификации

### Frontend

- `frontend/src/utils/telegram.js` - Утилиты для работы с Telegram Web App API
- `frontend/src/context/AuthContext.jsx` - Обновлен для поддержки Telegram аутентификации
- `frontend/src/api/api.js` - Добавлен метод `telegramAuth`
- `frontend/public/telegram-web-app.js` - Mock для разработки вне Telegram

## Особенности реализации

### Аутентификация

При открытии приложения в Telegram:
1. Telegram передает `initData` через Web App API
2. Фронтенд отправляет `initData` на `/api/auth/telegram`
3. Бэкенд проверяет подпись данных
4. Создается или обновляется пользователь в базе данных
5. Возвращается токен для дальнейшей работы с API

### Безопасность

- Проверка подписи Telegram `initData` через HMAC SHA-256
- Использование токена бота для верификации
- В режиме разработки (`APP_DEBUG=true`) проверка подписи может быть отключена

### UI/UX

- Автоматическая адаптация под тему Telegram
- Использование Telegram цветов через CSS переменные
- Поддержка MainButton и BackButton
- Тактильная обратная связь (Haptic Feedback)

## Команды для разработки

```bash
# Запуск миграций (в контейнере)
docker compose exec php-fpm php artisan migrate

# Очистка кэша
docker compose exec php-fpm php artisan config:clear
docker compose exec php-fpm php artisan cache:clear

# Запуск приложения
docker compose up -d

# Пересборка фронтенда после изменений
cd ../frontend && npm run build
cd ../olimpiec && docker compose restart frontend
```

## Быстрый старт

### Для локальной разработки:

1. **Запустите приложение:**
   ```bash
   docker compose up -d
   ```

2. **Убедитесь, что фронтенд доступен:**
   ```bash
   curl http://localhost:5173
   # Должен вернуть HTML страницу
   ```

3. **Запустите cloudflared туннель:**
   ```bash
   # Используйте готовый скрипт
   ./scripts/start-cloudflared.sh
   
   # Или вручную
   ./cloudflared tunnel --url http://localhost:5173
   ```
   
4. **Скопируйте HTTPS URL из вывода** (например: `https://academics-joke-selected-hawk.trycloudflare.com`)

5. **Подождите 10-30 секунд** и проверьте доступность:
   ```bash
   curl -I https://your-url.trycloudflare.com
   ```

6. **Создайте бота через @BotFather:**
   - Откройте [@BotFather](https://t.me/BotFather)
   - Отправьте `/newbot` и следуйте инструкциям
   - Сохраните токен бота

7. **Добавьте токен в `.env`:**
   ```env
   TELEGRAM_BOT_TOKEN=your_bot_token_here
   TELEGRAM_BOT_USERNAME=your_bot_username
   ```

8. **Запустите миграции:**
   ```bash
   docker compose exec php-fpm php artisan migrate
   ```

9. **Создайте Mini App через @BotFather:**
   - Отправьте `/newapp`
   - Выберите вашего бота
   - Укажите URL из cloudflared (например: `https://academics-joke-selected-hawk.trycloudflare.com`)
   - Сохраните URL Mini App

10. **Откройте бота в Telegram и нажмите на кнопку Mini App**

### Для продакшена:

Используйте ваш реальный домен с HTTPS: `https://yourdomain.com`

## Тестирование без Telegram

Для тестирования вне Telegram используется mock-реализация `telegram-web-app.js`, которая позволяет разрабатывать и тестировать приложение в обычном браузере.

## Полезные ссылки

- [Telegram Bot API Documentation](https://core.telegram.org/bots/api)
- [Telegram Mini Apps Documentation](https://core.telegram.org/bots/webapps)
- [Telegram Web App API](https://core.telegram.org/bots/webapps#initializing-mini-apps)
