#!/bin/bash

# Скрипт для запуска cloudflared туннеля для Telegram Mini App

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
CLOUDFLARED_PATH="$SCRIPT_DIR/../cloudflared"

# Проверка наличия cloudflared
if [ ! -f "$CLOUDFLARED_PATH" ]; then
    echo "❌ cloudflared не найден в $CLOUDFLARED_PATH"
    echo ""
    echo "Скачайте cloudflared:"
    echo "  cd $(dirname $CLOUDFLARED_PATH)"
    echo "  wget https://github.com/cloudflare/cloudflared/releases/latest/download/cloudflared-linux-amd64 -O cloudflared"
    echo "  chmod +x cloudflared"
    exit 1
fi

# Проверка прав на выполнение
if [ ! -x "$CLOUDFLARED_PATH" ]; then
    echo "🔧 Установка прав на выполнение..."
    chmod +x "$CLOUDFLARED_PATH"
fi

echo "🚀 Запуск cloudflared туннеля для Telegram Mini App..."
echo ""
echo "⚠️  Убедитесь, что:"
echo "   1. Фронтенд запущен на порту 5173"
echo ""

# Проверка, запущен ли фронтенд
if ! curl -s http://localhost:5173 > /dev/null 2>&1; then
    echo "⚠️  Внимание: фронтенд не отвечает на http://localhost:5173"
    echo "Запустите фронтенд перед использованием cloudflared"
    echo ""
fi

echo "✅ Запуск cloudflared туннеля..."
echo ""
echo "📋 Скопируйте HTTPS URL из вывода ниже и используйте его в @BotFather"
echo ""

# Запуск cloudflared
"$CLOUDFLARED_PATH" tunnel --url http://localhost:5173
