from fastapi import APIRouter, Request
from backend.schemas.forecast import ForecastRequest, ForecastResponse
from backend.calculator.engine import ForecastEngine
from backend.storage.db import save_forecast
from backend.services.auth import decode_token

router = APIRouter(prefix="/api", tags=["forecast"])
engine = ForecastEngine()


def _user_id_from_request(request: Request) -> int | None:
    """Extract user_id from Bearer token if present."""
    auth = request.headers.get("Authorization", "")
    if auth.startswith("Bearer "):
        payload = decode_token(auth[7:])
        if payload:
            try:
                return int(payload["sub"])
            except Exception:
                pass
    return None


@router.post("/forecast", response_model=ForecastResponse)
async def forecast(req: ForecastRequest, request: Request):
    user_id = _user_id_from_request(request)
    result  = engine.calculate(req)

    channel_name = getattr(req.blogger, "name", None) or None
    channel_url  = req.blogger.link or None

    await save_forecast(
        platform=req.blogger.platform,
        views=req.blogger.views,
        ad_price=req.campaign.ad_price,
        result=result.model_dump(),
        user_id=user_id,
        channel_name=channel_name,
        channel_url=channel_url,
    )
    return result
