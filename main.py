from fastapi import FastAPI, Request
from fastapi.staticfiles import StaticFiles
from fastapi.responses import FileResponse, JSONResponse
from fastapi.middleware.cors import CORSMiddleware
from contextlib import asynccontextmanager
from dotenv import load_dotenv
import logging
import time

logger = logging.getLogger("influenceiq")

load_dotenv()

# ── Logging must be set up before anything else ──
from backend.middleware.logging_config import setup_logging
setup_logging()

from backend.routers import forecast, stats
from backend.routers.history import router as history_router
from backend.routers.auth import router as auth_router
from backend.routers.admin import router as admin_router
from backend.routers.analytics import router as analytics_router
from backend.routers.watchlist import router as watchlist_router
from backend.storage.db import init_db

_start_time = time.time()


@asynccontextmanager
async def lifespan(app: FastAPI):
    await init_db()
    yield


app = FastAPI(title="InfluenceIQ", version="1.0.0", lifespan=lifespan)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(forecast.router)
app.include_router(history_router)
app.include_router(stats.router)
app.include_router(auth_router)
app.include_router(admin_router)
app.include_router(analytics_router)
app.include_router(watchlist_router)

app.mount("/static", StaticFiles(directory="frontend/static"), name="static")


@app.exception_handler(Exception)
async def global_exception_handler(request: Request, exc: Exception):
    logger.error(
        "Unhandled exception | %s %s | %s: %s",
        request.method, request.url.path,
        type(exc).__name__, exc,
        exc_info=True,
    )
    return JSONResponse(
        status_code=500,
        content={"detail": "Internal server error"},
    )


@app.get("/history", include_in_schema=False)
async def history_page():
    return FileResponse("frontend/templates/history.html")


@app.get("/admin", include_in_schema=False)
async def admin_page():
    return FileResponse("frontend/templates/admin.html")

@app.get("/api/health")
async def health():
    """Railway и мониторинг проверяют этот эндпоинт."""
    return JSONResponse({
        "status": "ok",
        "uptime_seconds": round(time.time() - _start_time),
        "version": "1.0.0",
    })


@app.get("/", include_in_schema=False)
async def root():
    return FileResponse("frontend/templates/index.html")
