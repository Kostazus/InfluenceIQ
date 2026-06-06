from fastapi import APIRouter
from backend.schemas.forecast import ForecastRequest, ForecastResponse
from backend.calculator.engine import ForecastEngine
from backend.storage.db import save_forecast
 
router = APIRouter(prefix="/api", tags=["forecast"])
engine = ForecastEngine()
 
 
@router.post("/forecast", response_model=ForecastResponse)
async def forecast(req: ForecastRequest):
    result = engine.calculate(req)
    await save_forecast(
        platform=req.blogger.platform,
        views=req.blogger.views,
        ad_price=req.campaign.ad_price,
        result=result.model_dump(),
    )
    return result
 