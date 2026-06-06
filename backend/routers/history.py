from fastapi import APIRouter
from backend.storage.db import get_history, DB_PATH
import aiosqlite

router = APIRouter(prefix="/api", tags=["history"])


@router.get("/history")
async def history(limit: int = 200):
    return await get_history(limit)


@router.delete("/history/clear")
async def clear_history():
    async with aiosqlite.connect(DB_PATH) as db:
        await db.execute("DELETE FROM history")
        await db.commit()
    return {"ok": True}


@router.delete("/history/{item_id}")
async def delete_history_item(item_id: int):
    async with aiosqlite.connect(DB_PATH) as db:
        await db.execute("DELETE FROM history WHERE id = ?", (item_id,))
        await db.commit()
    return {"ok": True}
