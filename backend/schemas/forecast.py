from pydantic import BaseModel, Field
from typing import Optional, Literal


class BloggerInput(BaseModel):
    platform: Literal["tiktok", "telegram", "instagram", "youtube"]
    views: int = Field(..., gt=0, description="Средние просмотры")
    likes: int = Field(..., ge=0, description="Средние лайки")
    followers: Optional[int] = Field(None, ge=0)
    link: Optional[str] = None
    name: Optional[str] = None


class CampaignInput(BaseModel):
    ad_price: float = Field(..., gt=0, description="Цена рекламы $")
    ad_format: Literal["post", "story", "video", "reels"]
    product_price: float = Field(..., gt=0, description="Цена продукта $")
    product_type: Literal["course", "product", "service", "subscription"]


class UserAccountInput(BaseModel):
    followers: int = Field(..., ge=0, description="Подписчики аккаунта")
    level: Literal["beginner", "medium", "strong"] = "medium"
    custom_conversion: float = Field(0.0, ge=0, le=100)


class ForecastRequest(BaseModel):
    blogger: BloggerInput
    campaign: CampaignInput
    account: UserAccountInput


class ForecastResponse(BaseModel):
    subscribers_min: int
    subscribers_max: int
    sales_min: int
    sales_max: int
    profit_min: float
    profit_max: float
    engagement_rate: float
    audience_quality: str
    risk_level: str
    stability_score: float
    recommendation: str
    recommendation_label: str
    subscribers_summary: str
    sales_summary: str
    profit_summary: str