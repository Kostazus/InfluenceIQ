from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from backend.services.stats_fetcher import fetch_stats_by_url

router = APIRouter(prefix="/api", tags=["stats"])


class LinkRequest(BaseModel):
    url: str


@router.post("/fetch-stats")
async def fetch_stats(req: LinkRequest):
    try:
        return await fetch_stats_by_url(req.url)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))