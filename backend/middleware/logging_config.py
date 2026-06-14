"""
Настройка логирования для InfluenceIQ.
Пишет одновременно в консоль (Railway logs) и в файл logs/app.log.
"""

import logging
import logging.handlers
import os
from pathlib import Path


def setup_logging():
    log_dir = Path("logs")
    log_dir.mkdir(exist_ok=True)

    fmt = logging.Formatter(
        fmt="%(asctime)s | %(levelname)-8s | %(name)s | %(message)s",
        datefmt="%Y-%m-%d %H:%M:%S",
    )

    # ── Файловый хендлер (ротация: 5 МБ × 3 файла) ──
    file_handler = logging.handlers.RotatingFileHandler(
        filename=log_dir / "app.log",
        maxBytes=5 * 1024 * 1024,
        backupCount=3,
        encoding="utf-8",
    )
    file_handler.setLevel(logging.WARNING)
    file_handler.setFormatter(fmt)

    # ── Консольный хендлер (Railway видит stdout) ──
    console_handler = logging.StreamHandler()
    console_handler.setLevel(logging.INFO)
    console_handler.setFormatter(fmt)

    # ── Корневой логгер ──
    root = logging.getLogger()
    root.setLevel(logging.INFO)
    root.addHandler(file_handler)
    root.addHandler(console_handler)

    # Заглушаем шумные библиотеки
    logging.getLogger("httpx").setLevel(logging.WARNING)
    logging.getLogger("uvicorn.access").setLevel(logging.WARNING)

    logging.getLogger("influenceiq").info("Logging initialised — file: logs/app.log")
