import aiosqlite
import json
from datetime import datetime

DB_PATH = "blogger_roi.db"


async def init_db():
    async with aiosqlite.connect(DB_PATH) as db:
        await db.execute("""
            CREATE TABLE IF NOT EXISTS history (
                id        INTEGER PRIMARY KEY AUTOINCREMENT,
                created   TEXT,
                platform  TEXT,
                views     INTEGER,
                ad_price  REAL,
                result    TEXT
            )
        """)
        await db.commit()


async def save_forecast(platform: str, views: int, ad_price: float, result: dict):
    async with aiosqlite.connect(DB_PATH) as db:
        await db.execute(
            "INSERT INTO history (created, platform, views, ad_price, result) VALUES (?,?,?,?,?)",
            (datetime.utcnow().isoformat(), platform, views, ad_price, json.dumps(result, ensure_ascii=False))
        )
        await db.commit()


async def get_history(limit: int = 20) -> list:
    async with aiosqlite.connect(DB_PATH) as db:
        db.row_factory = aiosqlite.Row
        cursor = await db.execute(
            "SELECT id, created, platform, views, ad_price, result FROM history ORDER BY id DESC LIMIT ?",
            (limit,)
        )
        rows = await cursor.fetchall()
        return [
            {
                "id": r["id"],
                "created": r["created"],
                "platform": r["platform"],
                "views": r["views"],
                "ad_price": r["ad_price"],
                "result": json.loads(r["result"]),
            }
            for r in rows
        ]