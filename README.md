# InfluenceIQ

A web application for calculating social media influence scores.

## Project Structure

```
├── main.py                        ← запуск сервера
├── requirements.txt
├── backend/
│   ├── routers/forecast.py        ← POST /api/forecast
│   ├── routers/history.py         ← GET /api/history
│   ├── calculator/engine.py       ← вся математика
│   ├── config/coefficients.py     ← коэффициенты
│   ├── schemas/forecast.py        ← pydantic-валидация
│   └── storage/db.py              ← SQLite история
└── frontend/
    ├── templates/index.html       ← страница
    └── static/
        ├── css/style.css          ← стили
        └── js/script.js           ← логика
```

## Installation

1. Install dependencies:
   ```bash
   pip install -r requirements.txt
   ```

2. Run the server:
   ```bash
   python main.py
   ```
   or
   ```bash
   uvicorn main:app --reload
   ```

3. Open your browser to `http://localhost:8000/index`

## API Endpoints

- `POST /api/forecast`: Calculate influence score
- `GET /api/history`: Get calculation history

## Usage

Enter your social media metrics in the form and click "Calculate Influence" to get your influence score and category.