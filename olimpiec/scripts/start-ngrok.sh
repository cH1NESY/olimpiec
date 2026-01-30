#!/bin/bash

# Скрипт для запуска ngrok туннеля для Telegram Mini App

echo "🚀 Запуск ngrok туннеля для Telegram Mini App..."
echo ""
echo "⚠️  Убедитесь, что:"
echo "   1. Фронтенд запущен на порту 5173"
echo "   2. ngrok установлен (https://ngrok.com/download)"
echo ""

# Проверка наличия ngrok
if ! command -v ngrok &> /dev/null; then
    echo "❌ ngrok не найден!"
    echo "Установите ngrok: https://ngrok.com/download"
    exit 1
fi

# Проверка, запущен ли фронтенд
if ! curl -s http://localhost:5173 > /dev/null; then
    echo "⚠️  Внимание: фронтенд не отвечает на http://localhost:5173"
    echo "Запустите фронтенд перед использованием ngrok"
    echo ""
fi

echo "✅ Запуск ngrok туннеля..."
echo ""
echo "📋 Скопируйте HTTPS URL из вывода ниже и используйте его в @BotFather"
echo ""

# Запуск ngrok
ngrok http 5173
