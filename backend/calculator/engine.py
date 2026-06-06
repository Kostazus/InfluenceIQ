from backend.schemas.forecast import (
    ForecastRequest, ForecastResponse, BloggerInput, CampaignInput, UserAccountInput
)
from backend.config.coefficients import *


class ForecastEngine:

    def calculate(self, req: ForecastRequest) -> ForecastResponse:
        b = req.blogger
        c = req.campaign
        a = req.account

        # --- Коэффициенты ---
        ctr      = PLATFORM_CTR.get(b.platform, 0.025)
        fmt_mult = FORMAT_MULTIPLIER.get(c.ad_format, 1.0)
        prod_conv = PRODUCT_CONVERSION.get(c.product_type, 0.035)
        acc_mult = (a.custom_conversion / 100) if a.custom_conversion > 0 \
                   else ACCOUNT_LEVELS.get(a.level, 0.7)

        # --- Базовый расчёт ---
        clicks          = b.views * ctr * fmt_mult
        base_sales      = clicks * prod_conv * acc_mult
        base_followers  = clicks * CLICK_TO_FOLLOW_RATE * acc_mult
        base_revenue    = base_sales * c.product_price
        base_profit     = base_revenue - c.ad_price

        # --- Диапазон ---
        sales_min = max(0, int(base_sales * FORECAST_RANGE_LOW))
        sales_max = max(0, int(base_sales * FORECAST_RANGE_HIGH))
        subs_min  = max(0, int(base_followers * FORECAST_RANGE_LOW))
        subs_max  = max(0, int(base_followers * FORECAST_RANGE_HIGH))
        profit_min = round(base_profit * FORECAST_RANGE_LOW, 2)
        profit_max = round(base_profit * FORECAST_RANGE_HIGH, 2)

        # --- ER и оценки ---
        er = round(b.likes / b.views * 100, 2) if b.views else 0.0
        audience_quality = self._audience_quality(er)
        risk_level       = self._risk(er)
        stability        = self._stability(b.platform, er)

        roi = base_profit / c.ad_price if c.ad_price > 0 else 0
        recommendation = self._recommend(roi, risk_level)

        rec_labels = {"take": "🟢 БЕРИ", "risky": "🟡 РИСКОВАННО", "skip": "🔴 НЕ БЕРИ"}

        lo, hi = profit_min, profit_max
        profit_summary = f"{'+'if lo>=0 else''}{lo:.0f}$ / {'+'if hi>=0 else''}{hi:.0f}$"

        return ForecastResponse(
            subscribers_min=subs_min,
            subscribers_max=subs_max,
            sales_min=sales_min,
            sales_max=sales_max,
            profit_min=profit_min,
            profit_max=profit_max,
            engagement_rate=er,
            audience_quality=audience_quality,
            risk_level=risk_level,
            stability_score=round(stability, 2),
            recommendation=recommendation,
            recommendation_label=rec_labels[recommendation],
            subscribers_summary=f"+{subs_min}–{subs_max} подписчиков",
            sales_summary=f"{sales_min}–{sales_max} продаж",
            profit_summary=profit_summary,
        )

    def _audience_quality(self, er: float) -> str:
        if er >= 6:   return "высокое"
        if er >= 3:   return "среднее"
        if er >= 1:   return "низкое"
        return "очень низкое"

    def _risk(self, er: float) -> str:
        if er >= ER_RISK_LOW:    return "низкий"
        if er >= ER_RISK_MEDIUM: return "средний"
        return "высокий"

    def _stability(self, platform: str, er: float) -> float:
        norm = {"tiktok": 4.0, "telegram": 8.0, "instagram": 3.0, "youtube": 2.5}
        expected = norm.get(platform, 4.0)
        return min(er / expected, 1.5) / 1.5

    def _recommend(self, roi: float, risk: str) -> str:
        if roi >= ROI_TAKE_THRESHOLD and risk != "высокий":
            return "take"
        if roi >= ROI_RISKY_THRESHOLD:
            return "risky"
        return "skip"