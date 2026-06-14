from fastapi import APIRouter, HTTPException, Request, Depends
from pydantic import BaseModel
from backend.services.stats_fetcher import fetch_stats_by_url
from backend.middleware.rate_limit import rate_limit

router = APIRouter(prefix="/api", tags=["stats"])

# 20 запросов в минуту — YouTube API тоже имеет квоту
_stats_limit = rate_limit(max_calls=20, window_seconds=60)


class LinkRequest(BaseModel):
    url: str


@router.post("/fetch-stats", dependencies=[Depends(_stats_limit)])
async def fetch_stats(req: LinkRequest, request: Request):
    try:
        return await fetch_stats_by_url(req.url)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))