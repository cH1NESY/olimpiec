# Олимпиец - Frontend

Frontend приложение для спортивного магазина "Олимпиец" на React.

## Технологии

- React 18
- React Router DOM
- Vite
- Axios

## Установка и запуск

### Локальная разработка

```bash
# Установка зависимостей
npm install

# Запуск dev сервера
npm run dev

# Сборка для production
npm run build

# Просмотр production сборки
npm run preview
```

### Docker

#### Production сборка

```bash
# Из корня проекта (olimpiec/)
docker-compose up -d frontend
```

#### Development режим

```bash
# Из папки frontend/
docker-compose -f docker-compose.dev.yml up
```

## Структура проекта

```
frontend/
├── src/
│   ├── api/           # API клиент
│   ├── components/     # React компоненты
│   ├── context/       # React Context (Cart)
│   ├── pages/         # Страницы приложения
│   ├── App.jsx        # Главный компонент
│   ├── main.jsx       # Точка входа
│   └── index.css      # Глобальные стили
├── public/            # Статические файлы
├── dist/              # Собранное приложение (генерируется)
└── package.json
```

## API Endpoints

Приложение ожидает следующие API endpoints:

- `GET /api/products` - Список товаров
- `GET /api/products/:id` - Детали товара
- `GET /api/categories` - Список категорий
- `GET /api/products/search` - Поиск товаров
- `POST /api/orders` - Создание заказа
- `GET /api/auth/user` - Информация о пользователе
- `GET /api/stores` - Список магазинов

## Стили

Приложение использует минималистичный спортивный стиль с цветовой схемой:
- Основной цвет: синий (#1e40af)
- Фон: белый (#ffffff)
- Акценты: различные оттенки синего
