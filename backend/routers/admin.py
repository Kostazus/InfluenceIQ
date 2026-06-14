from fastapi import APIRouter, Request, HTTPException
from fastapi.routing import APIRouter
from backend.storage.db import DB_PATH
from backend.services.auth import decode_token
import aiosqlite
import json

router = APIRouter(prefix="/api/admin")


async def require_admin(request: Request) -> int:
    """Проверяет Bearer токен и что пользователь is_admin=1."""
    auth = request.headers.get("Authorization", "")
    if not auth.startswith("Bearer "):
        raise HTTPException(status_code=401, detail="Требуется авторизация")

    payload = decode_token(auth[7:])
    if not payload:
        raise HTTPException(status_code=401, detail="Недействительный токен")

    try:
        user_id = int(payload["sub"])
    except Exception:
        raise HTTPException(status_code=401, detail="Недействительный токен")

    async with aiosqlite.connect(DB_PATH) as db:
        cursor = await db.execute(
            "SELECT is_admin FROM users WHERE id=?", (user_id,)
        )
        row = await cursor.fetchone()

    if not row or not row[0]:
        raise HTTPException(status_code=403, detail="Доступ запрещён")

    return user_id


@router.get("/stats")
async def admin_stats(request: Request):
    await require_admin(request)
    async with aiosqlite.connect(DB_PATH) as db:
        total_users = (await (await db.execute("SELECT COUNT(*) FROM users")).fetchone())[0]
        total_analyses = (await (await db.execute("SELECT COUNT(*) FROM history")).fetchone())[0]
        cursor = await db.execute("SELECT COUNT(*) FROM history WHERE created >= date('now')")
        today_analyses = (await cursor.fetchone())[0]
        try:
            new_users_week = (await (await db.execute(
                "SELECT COUNT(*) FROM users WHERE created_at >= datetime('now', '-7 days')"
            )).fetchone())[0]
        except Exception:
            new_users_week = 0

    return {
        "total_users": total_users,
        "total_analyses": total_analyses,
        "today_analyses": today_analyses,
        "new_users_week": new_users_week,
    }


@router.get("/users")
async def admin_users(request: Request):
    await require_admin(request)
    async with aiosqlite.connect(DB_PATH) as db:
        db.row_factory = aiosqlite.Row
        # Get column names to handle missing created_at
        col_cursor = await db.execute("PRAGMA table_info(users)")
        cols = [row[1] for row in await col_cursor.fetchall()]
        has_created_at = "created_at" in cols

        query = "SELECT id, email, name, is_admin" + (", created_at" if has_created_at else "") + " FROM users ORDER BY id DESC"
        cursor = await db.execute(query)
        rows = await cursor.fetchall()
        users = []
        for r in rows:
            users.append({
                "id": r["id"],
                "email": r["email"],
                "name": r["name"],
                "is_admin": bool(r["is_admin"]),
                "created_at": (r["created_at"] if has_created_at else None) or "—",
            })
    return users


@router.get("/history")
async def admin_history(request: Request, limit: int = 50):
    await require_admin(request)
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
                "result": json.loads(r["result"]) if r["result"] else {},
            }
            for r in rows
        ]


@router.delete("/users/{user_id}")
async def delete_user(user_id: int, request: Request):
    await require_admin(request)
    async with aiosqlite.connect(DB_PATH) as db:
        await db.execute("DELETE FROM users WHERE id=? AND is_admin=0", (user_id,))
        await db.commit()
    return {"ok": True}
