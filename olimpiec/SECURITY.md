# Руководство по безопасности

## Обзор мер безопасности

Данное приложение реализует комплексную систему защиты от различных типов атак.

## 1. Защита от SQL-инъекций

### Реализованные меры:

- **Использование Eloquent ORM**: Все запросы к базе данных выполняются через Eloquent ORM, который автоматически экранирует параметры.
- **Parameterized Queries**: Все сырые SQL-запросы используют параметризованные запросы с привязкой параметров.
- **Валидация входных данных**: Все пользовательские данные валидируются перед использованием в запросах.

### Примеры безопасных запросов:

```php
// ✅ Безопасно - параметризованный запрос
$query->whereRaw('LOWER(name) LIKE ?', [$searchTerm]);

// ❌ НЕбезопасно - конкатенация строк
$query->whereRaw("LOWER(name) LIKE '%{$searchTerm}%'");
```

### Проверенные контроллеры:

- ✅ `AdminOrderController` - использует параметризованные запросы
- ✅ `ProductController` - использует параметризованные запросы
- ✅ `PaymentController` - использует Eloquent ORM
- ✅ `OrderController` - использует Eloquent ORM

## 2. Защита от DDoS атак

### Rate Limiting (Ограничение частоты запросов)

#### Laravel Rate Limiting:

- **Общие API запросы**: 60 запросов в минуту
- **Аутентификация**: 5 запросов в минуту (login, register)
- **Создание заказов**: 10 запросов в минуту
- **Создание платежей**: 10 запросов в минуту
- **Отзывы**: 5 запросов в минуту
- **Webhooks**: 100 запросов в минуту

#### Nginx Rate Limiting:

- **API endpoints**: 30 запросов в минуту на IP
- **Auth endpoints**: 5 запросов в минуту на IP
- **Общие запросы**: 60 запросов в минуту на IP
- **Соединения**: максимум 20 соединений с одного IP

### Конфигурация:

```nginx
limit_req_zone $binary_remote_addr zone=api_limit:10m rate=30r/m;
limit_req_zone $binary_remote_addr zone=auth_limit:10m rate=5r/m;
limit_conn_zone $binary_remote_addr zone=conn_limit:10m;
```

## 3. Защита транзакций

### Реализованные меры:

- **Database Transactions**: Все критические операции выполняются в транзакциях.
- **Row Locking**: Используется `lockForUpdate()` для предотвращения race conditions.
- **Stock Validation**: Проверка наличия товара перед созданием заказа.
- **Atomic Operations**: Операции с остатками выполняются атомарно.

### Примеры:

```php
DB::beginTransaction();
try {
    // Lock product row
    $product = Product::lockForUpdate()->find($id);
    
    // Validate and update stock
    if ($product->stock_quantity >= $quantity) {
        $product->decrement('stock_quantity', $quantity);
    }
    
    DB::commit();
} catch (\Exception $e) {
    DB::rollBack();
    throw $e;
}
```

## 4. XSS (Cross-Site Scripting) защита

### Реализованные меры:

- **Security Headers**: Установлены заголовки безопасности через middleware.
- **Input Sanitization**: Входные данные очищаются от потенциально опасных символов.
- **Output Escaping**: Laravel автоматически экранирует вывод в Blade шаблонах.

### Security Headers:

- `X-XSS-Protection: 1; mode=block`
- `X-Content-Type-Options: nosniff`
- `X-Frame-Options: DENY`
- `Referrer-Policy: strict-origin-when-cross-origin`
- `Content-Security-Policy` (настроен для API)

## 5. CORS (Cross-Origin Resource Sharing)

### Конфигурация:

- Разрешены только указанные домены в `config/cors.php`
- Ограниченные HTTP методы
- Ограниченные заголовки
- Поддержка credentials для аутентификации

## 6. Валидация входных данных

### Правила валидации:

- Все входные данные валидируются через Laravel Request Validation
- Типы данных проверяются (integer, string, email, etc.)
- Длина строк ограничена
- Массивы проверяются на структуру и содержимое

### Примеры:

```php
$validated = $request->validate([
    'email' => 'required|email|max:255',
    'quantity' => 'required|integer|min:1|max:100',
    'items' => 'required|array|min:1',
    'items.*.product_id' => 'required|exists:products,id',
]);
```

## 7. Аутентификация и авторизация

### Реализованные меры:

- **Laravel Sanctum**: Используется для API аутентификации
- **Admin Middleware**: Проверка прав администратора
- **CSRF Protection**: Защита от CSRF атак для веб-роутов

## 8. Логирование и мониторинг

### Логирование:

- Все ошибки логируются с контекстом
- Платежные операции логируются
- Попытки аутентификации логируются
- Ошибки валидации логируются

## 9. Рекомендации для production

### Дополнительные меры:

1. **HTTPS**: Обязательно использовать HTTPS в production
2. **Firewall**: Настроить файрвол на уровне сервера
3. **WAF**: Рассмотреть использование Web Application Firewall (Cloudflare, AWS WAF)
4. **Monitoring**: Настроить мониторинг аномальной активности
5. **Backup**: Регулярные резервные копии базы данных
6. **Updates**: Регулярно обновлять зависимости и Laravel
7. **Environment Variables**: Хранить секреты в переменных окружения, не в коде
8. **Database**: Использовать отдельного пользователя БД с минимальными правами

### Проверка безопасности:

```bash
# Проверка зависимостей на уязвимости
composer audit

# Проверка конфигурации
php artisan config:cache
php artisan route:cache
```

## 10. Контакты для сообщений об уязвимостях

Если вы обнаружили уязвимость безопасности, пожалуйста, сообщите об этом ответственно.

## Заключение

Приложение использует современные практики безопасности Laravel и дополнительные меры защиты. Регулярно проверяйте обновления безопасности и следите за логами на предмет подозрительной активности.
