from fastapi import FastAPI
from fastapi.staticfiles import StaticFiles
from fastapi.responses import FileResponse
from fastapi.middleware.cors import CORSMiddleware
from contextlib import asynccontextmanager
from dotenv import load_dotenv

load_dotenv()

from backend.routers import forecast, stats
from backend.routers.history import router as history_router
from backend.routers.auth import router as auth_router
from backend.routers.admin import router as admin_router
from backend.routers.analytics import router as analytics_router
from backend.routers.watchlist import router as watchlist_router
from backend.storage.db import init_db


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


@app.get("/history", include_in_schema=False)
async def history_page():
    return FileResponse("frontend/templates/history.html")


@app.get("/admin", include_in_schema=False)
async def admin_page():
    return FileResponse("frontend/templates/admin.html")

@app.get("/", include_in_schema=False)
async def root():
    return FileResponse("frontend/templates/index.html")
