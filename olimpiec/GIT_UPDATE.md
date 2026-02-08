# Обновление проекта через Git

## Если есть локальные изменения

### Вариант 1: Сохранить изменения в коммит (рекомендуется)

```bash
cd ~/olimpiec

# Посмотреть, какие файлы изменены
git status

# Добавить изменения
git add frontend/src/pages/Admin/AdminProductForm.jsx
git add frontend/src/pages/Admin/AdminProducts.jsx
git add frontend/src/pages/Cart.jsx
git add frontend/public/placeholder.svg

# Создать коммит
git commit -m "Fix: Replace placeholder images and add debug info for sizes"

# Теперь можно сделать pull
git pull origin master
```

### Вариант 2: Временно сохранить изменения (stash)

```bash
cd ~/olimpiec

# Сохранить изменения во временное хранилище
git stash

# Сделать pull
git pull origin master

# Вернуть изменения обратно
git stash pop
```

### Вариант 3: Отменить локальные изменения (если они не нужны)

```bash
cd ~/olimpiec

# Отменить изменения в конкретных файлах
git checkout -- frontend/src/pages/Admin/AdminProductForm.jsx
git checkout -- frontend/src/pages/Admin/AdminProducts.jsx
git checkout -- frontend/src/pages/Cart.jsx

# Теперь можно сделать pull
git pull origin master
```

## После успешного pull

```bash
cd ~/olimpiec/olimpiec

# Запустить скрипт для исправления проблем
./scripts/fix-admin-issues.sh

# Пересобрать фронтенд
cd ../frontend
npm run build

# Вернуться в olimpiec и перезапустить контейнеры
cd ../olimpiec
docker-compose restart
```
