from fastapi import APIRouter, Request
from backend.storage.db import get_history, DB_PATH
from backend.services.auth import decode_token
import aiosqlite

router = APIRouter(prefix="/api", tags=["history"])


def _user_id_from_request(request: Request) -> int | None:
    auth = request.headers.get("Authorization", "")
    if auth.startswith("Bearer "):
        payload = decode_token(auth[7:])
        if payload:
            try:
                return int(payload["sub"])
            except Exception:
                pass
    return None


@router.get("/history")
async def history(request: Request, limit: int = 200):
    user_id = _user_id_from_request(request)
    return await get_history(limit=limit, user_id=user_id)


@router.delete("/history/clear")
async def clear_history(request: Request):
    user_id = _user_id_from_request(request)
    async with aiosqlite.connect(DB_PATH) as db:
        if user_id is not None:
            await db.execute("DELETE FROM history WHERE user_id=?", (user_id,))
        else:
            await db.execute("DELETE FROM history")
        await db.commit()
    return {"ok": True}


@router.delete("/history/{item_id}")
async def delete_history_item(item_id: int, request: Request):
    user_id = _user_id_from_request(request)
    async with aiosqlite.connect(DB_PATH) as db:
        if user_id is not None:
            await db.execute("DELETE FROM history WHERE id=? AND user_id=?", (item_id, user_id))
        else:
            await db.execute("DELETE FROM history WHERE id=?", (item_id,))
        await db.commit()
    return {"ok": True}
