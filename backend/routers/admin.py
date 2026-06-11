from fastapi import HTTPException, Depends
from fastapi.routing import APIRouter
from fastapi.security import OAuth2PasswordBearer
from backend.services.auth import decode_token
from backend.storage.db import DB_PATH
import aiosqlite
import json

router = APIRouter(prefix="/api/admin")
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/api/login")


async def require_admin(token: str = Depends(oauth2_scheme)):
    payload = decode_token(token)
    if not payload:
        raise HTTPException(status_code=401, detail="Not authenticated")
    async with aiosqlite.connect(DB_PATH) as db:
        cursor = await db.execute("SELECT is_admin FROM users WHERE id=?", (payload["sub"],))
        row = await cursor.fetchone()
        if not row or not row[0]:
            raise HTTPException(status_code=403, detail="Admin access required")
    return payload


@router.get("/stats")
async def admin_stats(admin=Depends(require_admin)):
    async with aiosqlite.connect(DB_PATH) as db:
        total_users = (await (await db.execute("SELECT COUNT(*) FROM users")).fetchone())[0]
        total_analyses = (await (await db.execute("SELECT COUNT(*) FROM history")).fetchone())[0]
        today_analyses = (await (await db.execute(
            "SELECT COUNT(*) FROM history WHERE created LIKE ?", (db._running and None or f"{__import__('datetime').date.today()}%",)
        )).fetchone())[0] if False else 0
        # simpler today count
        cursor = await db.execute("SELECT COUNT(*) FROM history WHERE created >= date('now')")
        today_analyses = (await cursor.fetchone())[0]

        new_users_week = (await (await db.execute(
            "SELECT COUNT(*) FROM users WHERE created_at >= datetime('now', '-7 days')"
        )).fetchone())[0]

    return {
        "total_users": total_users,
        "total_analyses": total_analyses,
        "today_analyses": today_analyses,
        "new_users_week": new_users_week,
    }


@router.get("/users")
async def admin_users(admin=Depends(require_admin)):
    async with aiosqlite.connect(DB_PATH) as db:
        db.row_factory = aiosqlite.Row
        cursor = await db.execute("""
            SELECT u.id, u.email, u.name, u.is_admin, u.created_at,
                   COUNT(h.id) as analyses_count
            FROM users u
            LEFT JOIN history h ON 1=1
            GROUP BY u.id
            ORDER BY u.id DESC
        """)
        # simpler version
        cursor = await db.execute(
            "SELECT id, email, name, is_admin, created_at FROM users ORDER BY id DESC"
        )
        rows = await cursor.fetchall()
        users = []
        for r in rows:
            users.append({
                "id": r["id"],
                "email": r["email"],
                "name": r["name"],
                "is_admin": bool(r["is_admin"]),
                "created_at": r["created_at"] or "—",
            })
    return users


@router.get("/history")
async def admin_history(limit: int = 50, admin=Depends(require_admin)):
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
async def delete_user(user_id: int, admin=Depends(require_admin)):
    async with aiosqlite.connect(DB_PATH) as db:
        await db.execute("DELETE FROM users WHERE id=? AND is_admin=0", (user_id,))
        await db.commit()
    return {"ok": True}
