#!/bin/bash

# ── InfluenceIQ — запуск сервера ─────────────────────────────
cd "$(dirname "$0")"

# Проверяем Python
if ! command -v python3 &>/dev/null; then
  echo "❌ Python3 не найден. Установи Python 3.10+"
  exit 1
fi

# Активируем venv если есть
if [ -d ".venv" ]; then
  source .venv/bin/activate
fi

# Устанавливаем зависимости
pip install -r requirements.txt -q

# Запускаем сервер
echo ""
echo "✅ InfluenceIQ запущен → http://localhost:8000"
echo "   Остановить: Ctrl+C"
echo ""

python3 -m uvicorn main:app --host 0.0.0.0 --port 8000 --reload
