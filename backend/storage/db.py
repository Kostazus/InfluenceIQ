import aiosqlite
import json
from datetime import datetime

DB_PATH = "blogger_roi.db"


async def init_db():
    async with aiosqlite.connect(DB_PATH) as db:
        await db.execute("""
            CREATE TABLE IF NOT EXISTS history (
                id           INTEGER PRIMARY KEY AUTOINCREMENT,
                created      TEXT,
                platform     TEXT,
                views        INTEGER,
                ad_price     REAL,
                result       TEXT,
                user_id      INTEGER,
                channel_name TEXT,
                channel_url  TEXT
            )
        """)
        await db.commit()

        await db.execute("""
            CREATE TABLE IF NOT EXISTS users (
                id            INTEGER PRIMARY KEY AUTOINCREMENT,
                email         TEXT UNIQUE NOT NULL,
                password_hash TEXT NOT NULL,
                name          TEXT NOT NULL,
                is_admin      INTEGER DEFAULT 0,
                created_at    TEXT DEFAULT (datetime('now'))
            )
        """)
        await db.commit()

        # Migrations — safe on existing DBs
        for col_sql in [
            "ALTER TABLE users ADD COLUMN is_admin INTEGER DEFAULT 0",
            "ALTER TABLE users ADD COLUMN created_at TEXT DEFAULT (datetime('now'))",
            "ALTER TABLE history ADD COLUMN user_id INTEGER",
            "ALTER TABLE history ADD COLUMN channel_name TEXT",
            "ALTER TABLE history ADD COLUMN channel_url TEXT",
        ]:
            try:
                await db.execute(col_sql)
                await db.commit()
            except Exception:
                pass

        # First user is always admin
        try:
            await db.execute("UPDATE users SET is_admin=1 WHERE id=1 AND is_admin=0")
            await db.commit()
        except Exception:
            pass


async def save_forecast(
    platform: str,
    views: int,
    ad_price: float,
    result: dict,
    user_id: int | None = None,
    channel_name: str | None = None,
    channel_url: str | None = None,
) -> int:
    async with aiosqlite.connect(DB_PATH) as db:
        cursor = await db.execute(
            """INSERT INTO history
               (created, platform, views, ad_price, result, user_id, channel_name, channel_url)
               VALUES (?,?,?,?,?,?,?,?)""",
            (
                datetime.utcnow().isoformat(),
                platform, views, ad_price,
                json.dumps(result, ensure_ascii=False),
                user_id, channel_name, channel_url,
            ),
        )
        await db.commit()
        return cursor.lastrowid


async def get_history(limit: int = 200, user_id: int | None = None) -> list:
    async with aiosqlite.connect(DB_PATH) as db:
        db.row_factory = aiosqlite.Row
        if user_id is not None:
            cursor = await db.execute(
                """SELECT id, created, platform, views, ad_price, result,
                          user_id, channel_name, channel_url
                   FROM history WHERE user_id=? ORDER BY id DESC LIMIT ?""",
                (user_id, limit),
            )
        else:
            cursor = await db.execute(
                """SELECT id, created, platform, views, ad_price, result,
                          user_id, channel_name, channel_url
                   FROM history ORDER BY id DESC LIMIT ?""",
                (limit,),
            )
        rows = await cursor.fetchall()
        return [
            {
                "id":           r["id"],
                "created":      r["created"],
                "platform":     r["platform"],
                "views":        r["views"],
                "ad_price":     r["ad_price"],
                "result":       json.loads(r["result"]),
                "user_id":      r["user_id"],
                "channel_name": r["channel_name"] or "",
                "channel_url":  r["channel_url"] or "",
            }
            for r in rows
        ]
