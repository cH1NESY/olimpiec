# Решение проблем с Telegram Mini App

## Черный экран / Бесконечная загрузка

### Проблема 1: ERR_NETWORK_CHANGED

**Симптомы:**
- Ошибки `ERR_NETWORK_CHANGED` в консоли браузера
- Файлы не загружаются полностью
- Бесконечная загрузка

**Причины:**
- Cloudflared туннель нестабилен или переподключается
- URL cloudflared изменился после перезапуска
- Проблемы с сетью

**Решение:**

1. **Перезапустите cloudflared:**
   ```bash
   # Остановите текущий процесс (Ctrl+C)
   ./cloudflared tunnel --url http://localhost:5173
   ```

2. **Обновите URL в @BotFather:**
   - Скопируйте новый URL из вывода cloudflared
   - Обновите в @BotFather через `/myapps` → `/editapp`

3. **Очистите кэш браузера:**
   - В Chrome: Ctrl+Shift+Delete
   - Или используйте режим инкогнито

4. **Проверьте стабильность туннеля:**
   ```bash
   # Проверьте, что туннель работает
   curl -I https://your-url.trycloudflare.com
   ```

### Проблема 2: API недоступен через туннель

**Симптомы:**
- Черный экран в Telegram Mini App
- Бесконечная загрузка
- Ошибки CORS в консоли браузера

**Решение:**

1. **Проверьте, что фронтенд проксирует API правильно:**
   ```bash
   # Проверьте локально
   curl http://localhost:5173/api/categories
   ```

2. **Проверьте CORS настройки:**
   - Убедитесь, что cloudflared URL добавлен в `allowed_origins_patterns` в `config/cors.php`
   - Очистите кэш конфигурации:
     ```bash
     docker compose exec php-fpm php artisan config:clear
     ```

3. **Проверьте доступность API через cloudflared:**
   ```bash
   curl https://your-cloudflared-url.trycloudflare.com/api/categories
   ```

### Проблема 3: Ошибки JavaScript в консоли

**Решение:**

1. Откройте DevTools в браузере (F12)
2. Проверьте вкладку Console на наличие ошибок
3. Проверьте вкладку Network - все ли файлы загружаются (статус 200)
4. Убедитесь, что все зависимости загружены

### Проблема 4: Туннель не работает

**Симптомы:**
- HTTP 530 ошибка
- Таймауты в логах cloudflared
- `Could not resolve host`

**Решение:**

1. **Убедитесь, что фронтенд запущен:**
   ```bash
   curl http://localhost:5173
   ```

2. **Перезапустите cloudflared:**
   ```bash
   # Остановите текущий процесс (Ctrl+C)
   # Запустите снова
   ./cloudflared tunnel --url http://localhost:5173
   ```

3. **Подождите 30-60 секунд** после запуска

4. **Проверьте доступность:**
   ```bash
   curl -I https://your-url.trycloudflare.com
   ```

### Проблема 5: API запросы не проходят

**Решение:**

1. **Проверьте проксирование в nginx фронтенда:**
   - Убедитесь, что `location /api` правильно настроен в `frontend/nginx.conf`
   - Проверьте, что бэкенд доступен через Docker network

2. **Проверьте логи nginx:**
   ```bash
   docker compose logs frontend
   ```

3. **Проверьте логи бэкенда:**
   ```bash
   docker compose logs web
   ```

## Отладка

### Включение отладочных логов

1. **Включите debug режим в Laravel:**
   ```env
   APP_DEBUG=true
   ```

2. **Проверьте логи:**
   ```bash
   docker compose logs -f web
   ```

### Проверка через браузер

1. Откройте cloudflared URL в обычном браузере
2. Откройте DevTools (F12)
3. Проверьте вкладку Network на наличие ошибок
4. Проверьте вкладку Console на JavaScript ошибки

### Проверка Telegram Web App API

1. Убедитесь, что Telegram Web App SDK загружен:
   ```javascript
   console.log(window.Telegram?.WebApp)
   ```

2. Проверьте initData:
   ```javascript
   console.log(window.Telegram?.WebApp?.initData)
   ```

## Частые ошибки

### CORS ошибка

```
Access to XMLHttpRequest at 'https://...' from origin 'https://...' has been blocked by CORS policy
```

**Решение:** Добавьте cloudflared URL в `allowed_origins_patterns` в `config/cors.php`

### 404 Not Found для API

**Решение:** Проверьте, что nginx фронтенда правильно проксирует `/api` запросы

### 500 Internal Server Error

**Решение:** Проверьте логи бэкенда и убедитесь, что все сервисы запущены

### ERR_NETWORK_CHANGED

**Решение:** 
- Перезапустите cloudflared
- Обновите URL в @BotFather
- Очистите кэш браузера

## Полезные команды

```bash
# Проверка статуса контейнеров
docker compose ps

# Просмотр логов
docker compose logs -f frontend
docker compose logs -f web

# Перезапуск сервисов
docker compose restart frontend
docker compose restart web

# Очистка кэша
docker compose exec php-fpm php artisan config:clear
docker compose exec php-fpm php artisan cache:clear

# Пересборка фронтенда
cd ../frontend && npm run build
cd ../olimpiec && docker compose restart frontend
```
