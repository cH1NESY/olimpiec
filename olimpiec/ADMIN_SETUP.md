# Создание администратора

Этот документ описывает процесс создания администратора для доступа к админ-панели.

## Предварительные требования

1. ✅ База данных настроена и миграции выполнены
2. ✅ Docker контейнеры запущены

## Создание администратора

### Способ 1: Интерактивный (рекомендуется)

```bash
cd ~/olimpiec/olimpiec
./scripts/create-admin.sh
```

Скрипт попросит ввести:
- Имя администратора
- Email администратора
- Пароль (минимум 8 символов)
- Подтверждение пароля

### Способ 2: С параметрами

```bash
cd ~/olimpiec/olimpiec
./scripts/create-admin.sh --name "Администратор" --email "admin@olimpiec-shop.ru" --password "secure_password123"
```

### Способ 3: Через Artisan напрямую

```bash
cd ~/olimpiec/olimpiec
docker-compose exec php-fpm php artisan admin:create
```

Или с параметрами:

```bash
docker-compose exec php-fpm php artisan admin:create \
  --name="Администратор" \
  --email="admin@olimpiec-shop.ru" \
  --password="secure_password123"
```

## Превращение существующего пользователя в администратора

Если пользователь с указанным email уже существует, скрипт предложит сделать его администратором:

```bash
./scripts/create-admin.sh --email "existing@example.com"
```

Или через Artisan:

```bash
docker-compose exec php-fpm php artisan tinker
```

Затем в консоли:

```php
$user = \App\Models\User::where('email', 'existing@example.com')->first();
$user->is_admin = true;
$user->save();
exit
```

## Проверка администратора

### Через Artisan Tinker

```bash
docker-compose exec php-fpm php artisan tinker
```

```php
$admin = \App\Models\User::where('is_admin', true)->first();
echo "ID: {$admin->id}\n";
echo "Имя: {$admin->name}\n";
echo "Email: {$admin->email}\n";
echo "Админ: " . ($admin->is_admin ? 'Да' : 'Нет') . "\n";
exit
```

### Через SQL

```bash
docker-compose exec postgres psql -U your_db_user -d your_db_name -c "SELECT id, name, email, is_admin FROM users WHERE is_admin = true;"
```

## Вход в админ-панель

1. Откройте сайт: `https://olimpiec-shop.ru`
2. Перейдите в админ-панель: `https://olimpiec-shop.ru/admin`
3. Войдите используя:
   - Email: указанный при создании
   - Пароль: указанный при создании

## Безопасность

⚠️ **Важно:**

1. Используйте **сильный пароль** (минимум 8 символов, рекомендуется 12+)
2. Не используйте простые пароли типа `password`, `12345678`, `admin`
3. Храните пароль в безопасном месте (менеджер паролей)
4. Регулярно меняйте пароль администратора
5. Не делитесь учетными данными администратора

## Управление администраторами

### Список всех администраторов

```bash
docker-compose exec php-fpm php artisan tinker
```

```php
$admins = \App\Models\User::where('is_admin', true)->get();
foreach ($admins as $admin) {
    echo "ID: {$admin->id}, Email: {$admin->email}, Имя: {$admin->name}\n";
}
exit
```

### Удаление прав администратора

```bash
docker-compose exec php-fpm php artisan tinker
```

```php
$user = \App\Models\User::where('email', 'user@example.com')->first();
$user->is_admin = false;
$user->save();
exit
```

### Изменение пароля администратора

```bash
docker-compose exec php-fpm php artisan tinker
```

```php
$user = \App\Models\User::where('email', 'admin@example.com')->first();
$user->password = \Illuminate\Support\Facades\Hash::make('new_password');
$user->save();
exit
```

## Устранение проблем

### Ошибка: "Пользователь с email уже существует"

**Решение:** Используйте опцию сделать существующего пользователя администратором, или создайте пользователя с другим email.

### Ошибка: "Пароли не совпадают"

**Решение:** Убедитесь, что вы вводите одинаковый пароль в оба поля.

### Ошибка: "Пароль должен содержать минимум 8 символов"

**Решение:** Используйте пароль длиной не менее 8 символов.

### Ошибка: "Docker Compose не найден"

**Решение:** Убедитесь, что Docker и Docker Compose установлены и доступны в PATH.

### Ошибка: "Контейнер php-fpm не запущен"

**Решение:** Запустите контейнеры:

```bash
docker-compose up -d
```

## Дополнительная информация

- Админ-панель доступна по пути: `/admin`
- Админ-роуты защищены middleware `AdminMiddleware`
- Проверка прав: `Auth::user()->is_admin === true`
- Все админ-роуты требуют аутентификации через Sanctum
