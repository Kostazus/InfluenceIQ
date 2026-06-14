"""
Простой in-memory rate limiter — без внешних зависимостей.
Ограничивает запросы по IP с помощью скользящего окна.
"""

import time
from collections import defaultdict
from fastapi import Request, HTTPException


# Хранилище: { ip: [timestamp, timestamp, ...] }
_store: dict[str, list[float]] = defaultdict(list)


def rate_limit(max_calls: int, window_seconds: int):
    """
    Возвращает FastAPI-зависимость (Depends), которая проверяет лимит.

    Использование:
        @router.post("/forecast", dependencies=[Depends(rate_limit(10, 60))])

    max_calls       — максимум запросов за window_seconds секунд с одного IP
    window_seconds  — длина окна в секундах
    """
    async def _check(request: Request):
        ip = request.client.host if request.client else "unknown"
        now = time.monotonic()

        calls = _store[ip]
        # Убираем устаревшие метки за пределами окна
        calls[:] = [t for t in calls if now - t < window_seconds]

        if len(calls) >= max_calls:
            retry_after = int(window_seconds - (now - calls[0])) + 1
            raise HTTPException(
                status_code=429,
                detail=f"Слишком много запросов. Подождите {retry_after} сек.",
                headers={"Retry-After": str(retry_after)},
            )

        calls.append(now)

    return _check
