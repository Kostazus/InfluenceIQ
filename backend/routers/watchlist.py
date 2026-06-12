"""
/api/watchlist  — saved channels per user
"""

from fastapi import APIRouter, Request, HTTPException
from pydantic import BaseModel
from backend.storage.db import DB_PATH
from backend.services.auth import decode_token
from backend.services.stats_fetcher import fetch_youtube_stats, detect_platform
import aiosqlite
from datetime import datetime

router = APIRouter(prefix="/api", tags=["watchlist"])


def _require_user(request: Request) -> int:
    auth = request.headers.get("Authorization", "")
    if auth.startswith("Bearer "):
        payload = decode_token(auth[7:])
        if payload:
            try:
                return int(payload["sub"])
            except Exception:
                pass
    raise HTTPException(status_code=401, detail="Login required to use watchlist")


class WatchAddReq(BaseModel):
    url: str


@router.get("/watchlist")
async def get_watchlist(request: Request):
    user_id = _require_user(request)
    async with aiosqlite.connect(DB_PATH) as db:
        db.row_factory = aiosqlite.Row
        cursor = await db.execute(
            "SELECT * FROM watchlist WHERE user_id=? ORDER BY added_at DESC",
            (user_id,),
        )
        rows = await cursor.fetchall()
        return [dict(r) for r in rows]


@router.post("/watchlist")
async def add_to_watchlist(req: WatchAddReq, request: Request):
    user_id = _require_user(request)
    url = req.url.strip()

    # Check duplicate
    async with aiosqlite.connect(DB_PATH) as db:
        cur = await db.execute(
            "SELECT id FROM watchlist WHERE user_id=? AND channel_url=?",
            (user_id, url),
        )
        if await cur.fetchone():
            raise HTTPException(status_code=400, detail="Already in watchlist")

    # Fetch initial stats
    channel_name = None
    subscribers  = None
    avg_views    = None
    avg_er       = None

    platform = detect_platform(url)
    if platform == "youtube":
        stats = await fetch_youtube_stats(url)
        if stats:
            channel_name = stats.name
            subscribers  = stats.followers
            avg_views    = stats.views
            avg_er       = stats.engagement_rate

    async with aiosqlite.connect(DB_PATH) as db:
        cursor = await db.execute(
            """INSERT INTO watchlist
               (user_id, channel_url, channel_name, subscribers, avg_views, avg_er, refreshed_at)
               VALUES (?,?,?,?,?,?,?)""",
            (user_id, url, channel_name, subscribers, avg_views, avg_er,
             datetime.utcnow().isoformat()),
        )
        await db.commit()
        row_id = cursor.lastrowid

    return {
        "id": row_id, "channel_url": url, "channel_name": channel_name,
        "subscribers": subscribers, "avg_views": avg_views, "avg_er": avg_er,
    }


@router.delete("/watchlist/{item_id}")
async def remove_from_watchlist(item_id: int, request: Request):
    user_id = _require_user(request)
    async with aiosqlite.connect(DB_PATH) as db:
        await db.execute(
            "DELETE FROM watchlist WHERE id=? AND user_id=?", (item_id, user_id)
        )
        await db.commit()
    return {"ok": True}


@router.post("/watchlist/{item_id}/refresh")
async def refresh_watchlist_item(item_id: int, request: Request):
    user_id = _require_user(request)
    async with aiosqlite.connect(DB_PATH) as db:
        db.row_factory = aiosqlite.Row
        cur = await db.execute(
            "SELECT * FROM watchlist WHERE id=? AND user_id=?", (item_id, user_id)
        )
        row = await cur.fetchone()
        if not row:
            raise HTTPException(status_code=404, detail="Not found")

    url      = row["channel_url"]
    platform = detect_platform(url)
    stats    = None
    if platform == "youtube":
        stats = await fetch_youtube_stats(url)

    if stats:
        async with aiosqlite.connect(DB_PATH) as db:
            await db.execute(
                """UPDATE watchlist SET channel_name=?, subscribers=?, avg_views=?,
                   avg_er=?, refreshed_at=? WHERE id=?""",
                (stats.name, stats.followers, stats.views, stats.engagement_rate,
                 datetime.utcnow().isoformat(), item_id),
            )
            await db.commit()
        return {
            "id": item_id, "channel_name": stats.name, "subscribers": stats.followers,
            "avg_views": stats.views, "avg_er": stats.engagement_rate,
        }

    return {"ok": True, "message": "Could not refresh stats"}
