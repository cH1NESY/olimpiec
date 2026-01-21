# Структура базы данных - Олимпиец

## Таблицы

### users
Пользователи системы
- `id` - ID пользователя
- `name` - Имя
- `email` - Email (уникальный)
- `phone` - Телефон
- `address` - Адрес
- `password` - Пароль (хэшированный)
- `email_verified_at` - Дата подтверждения email
- `remember_token` - Токен для "Запомнить меня"
- `created_at`, `updated_at` - Временные метки

### brands
Бренды товаров
- `id` - ID бренда
- `name` - Название бренда
- `slug` - URL-слаг (уникальный)
- `description` - Описание
- `logo` - Путь к логотипу
- `created_at`, `updated_at`

### categories
Категории товаров (многоуровневые)
- `id` - ID категории
- `name` - Название
- `slug` - URL-слаг (уникальный)
- `description` - Описание
- `parent_id` - ID родительской категории (nullable)
- `sort_order` - Порядок сортировки
- `is_active` - Активна ли категория
- `created_at`, `updated_at`

### sizes
Размеры товаров
- `id` - ID размера
- `name` - Название размера (S, M, L, 42, 43 и т.д.)
- `type` - Тип размера (clothing, shoes и т.д.)
- `created_at`, `updated_at`

### products
Товары
- `id` - ID товара
- `name` - Название
- `slug` - URL-слаг (уникальный)
- `description` - Краткое описание
- `full_description` - Полное описание
- `price` - Цена
- `old_price` - Старая цена (для скидок)
- `category_id` - ID категории
- `brand_id` - ID бренда (nullable)
- `gender` - Пол (male, female, unisex)
- `is_new` - Новинка
- `is_active` - Активен ли товар
- `views_count` - Количество просмотров
- `sales_count` - Количество продаж
- `rating` - Средний рейтинг (0.00 - 5.00)
- `reviews_count` - Количество отзывов
- `sku` - Артикул (уникальный)
- `stock_quantity` - Количество на складе
- `created_at`, `updated_at`

**Индексы:**
- `category_id`, `is_active`
- `brand_id`, `is_active`
- `is_new`, `is_active`
- `price`
- `rating`

### product_images
Изображения товаров
- `id` - ID изображения
- `product_id` - ID товара
- `image_path` - Путь к изображению
- `sort_order` - Порядок сортировки
- `is_main` - Главное изображение
- `created_at`, `updated_at`

### product_characteristics
Характеристики товаров
- `id` - ID характеристики
- `product_id` - ID товара
- `name` - Название характеристики
- `value` - Значение характеристики
- `sort_order` - Порядок сортировки
- `created_at`, `updated_at`

### product_size
Связь товаров и размеров (pivot таблица)
- `id` - ID записи
- `product_id` - ID товара
- `size_id` - ID размера
- `stock_quantity` - Количество на складе для данного размера
- `created_at`, `updated_at`
- Уникальный ключ: `product_id`, `size_id`

### stores
Магазины
- `id` - ID магазина
- `name` - Название
- `address` - Адрес
- `phone` - Телефон
- `email` - Email
- `working_hours` - Часы работы
- `latitude` - Широта
- `longitude` - Долгота
- `is_active` - Активен ли магазин
- `created_at`, `updated_at`

### orders
Заказы
- `id` - ID заказа
- `order_number` - Номер заказа (уникальный, генерируется автоматически)
- `user_id` - ID пользователя (nullable, для гостевых заказов)
- `customer_name` - Имя клиента
- `customer_email` - Email клиента
- `customer_phone` - Телефон клиента
- `delivery_address` - Адрес доставки
- `delivery_method` - Способ получения (pickup, delivery)
- `store_id` - ID магазина (для самовывоза)
- `status` - Статус заказа (pending, paid, processing, shipped, delivered, cancelled)
- `total_amount` - Общая сумма заказа
- `comment` - Комментарий к заказу
- `created_at`, `updated_at`

**Индексы:**
- `user_id`, `status`
- `order_number`
- `status`

### order_items
Позиции заказа
- `id` - ID позиции
- `order_id` - ID заказа
- `product_id` - ID товара
- `size_id` - ID размера (nullable)
- `quantity` - Количество
- `price` - Цена на момент заказа
- `total` - Итого (quantity * price)
- `created_at`, `updated_at`

### payments
Оплаты
- `id` - ID оплаты
- `order_id` - ID заказа
- `method` - Способ оплаты (card, cash, online, bank_transfer)
- `status` - Статус оплаты (pending, processing, completed, failed, refunded)
- `amount` - Сумма оплаты
- `transaction_id` - ID транзакции (nullable)
- `notes` - Заметки
- `paid_at` - Дата оплаты (nullable)
- `created_at`, `updated_at`

**Индексы:**
- `order_id`, `status`

## Связи между таблицами

- `User` → `Order` (один ко многим)
- `Category` → `Category` (самосвязь, parent-child)
- `Category` → `Product` (один ко многим)
- `Brand` → `Product` (один ко многим)
- `Product` → `ProductImage` (один ко многим)
- `Product` → `ProductCharacteristic` (один ко многим)
- `Product` ↔ `Size` (многие ко многим через `product_size`)
- `Product` → `OrderItem` (один ко многим)
- `Store` → `Order` (один ко многим)
- `Order` → `OrderItem` (один ко многим)
- `Order` → `Payment` (один к одному)
- `Size` → `OrderItem` (один ко многим)

## Запуск миграций

```bash
cd /home/ch1nesy/PhpstormProjects/olimpiec/olimpiec

# Запуск миграций
php artisan migrate

# Запуск миграций с seeders (тестовые данные)
php artisan migrate --seed

# Откат миграций
php artisan migrate:rollback

# Откат всех миграций
php artisan migrate:fresh --seed
```

## Seeders

1. **BrandSeeder** - Бренды (Nike, Adidas, Puma, Reebok, Under Armour)
2. **CategorySeeder** - Категории (Спорт → Футбол/Баскетбол/Бег/Фитнес → подкатегории)
3. **SizeSeeder** - Размеры (одежда: XS-XXL, обувь: 35-46)
4. **StoreSeeder** - Магазины (3 магазина в Москве)
5. **ProductSeeder** - Товары (футбольный мяч, форма, кроссовки, гантели)

## Особенности

### Сортировка товаров
- По цене: используется поле `price`
- По популярности: используется поле `sales_count`
- По рейтингу: используется поле `rating`

### Фильтры
- По бренду: `brand_id`
- По полу: `gender`
- По размеру: через таблицу `product_size`
- По цене: диапазон `price`
- По новинкам: `is_new = true`

### Статусы заказа
- `pending` - Ожидает оплаты
- `paid` - Оплачен
- `processing` - В обработке
- `shipped` - Отправлен
- `delivered` - Доставлен
- `cancelled` - Отменен

### Статусы оплаты
- `pending` - Ожидает оплаты
- `processing` - В процессе
- `completed` - Оплачено
- `failed` - Ошибка оплаты
- `refunded` - Возврат средств
