"""
/api/channel-analytics  — detailed per-video data for dashboard charts
/api/export-pdf         — generate PDF report
"""

from fastapi import APIRouter, Request
from fastapi.responses import StreamingResponse
from pydantic import BaseModel
from backend.services.stats_fetcher import (
    detect_platform, extract_video_id, extract_channel_handle,
    _resolve_channel_id,
)
from backend.services.auth import decode_token
import httpx, os, io
from dotenv import load_dotenv

load_dotenv()
router = APIRouter(prefix="/api", tags=["analytics"])


class LinkReq(BaseModel):
    url: str


class PdfReq(BaseModel):
    channel_name: str | None = None
    channel_url: str | None = None
    platform: str = "youtube"
    views: int = 0
    followers: int = 0
    ad_price: float = 0
    engagement_rate: float | None = None
    subscribers_min: int = 0
    subscribers_max: int = 0
    sales_min: int = 0
    sales_max: int = 0
    profit_min: float = 0
    profit_max: float = 0
    roi: int = 0
    audience_quality: str = ""
    risk_level: str = ""
    recommendation: str = ""
    recommendation_label: str = ""


# ── Channel Analytics ──────────────────────────────────────────
@router.post("/channel-analytics")
async def channel_analytics(req: LinkReq):
    api_key = os.getenv("YOUTUBE_API_KEY")
    if not api_key:
        return {"error": "No YouTube API key configured"}

    url = req.url
    platform = detect_platform(url)
    if platform != "youtube":
        return {"error": "Only YouTube channels supported for analytics"}

    async with httpx.AsyncClient(timeout=15) as client:
        video_id    = extract_video_id(url)
        chan_handle = extract_channel_handle(url)

        # Resolve channel_id
        channel_id = None
        if video_id:
            r = await client.get(
                "https://www.googleapis.com/youtube/v3/videos",
                params={"part": "snippet", "id": video_id, "key": api_key},
            )
            items = r.json().get("items", [])
            if items:
                channel_id = items[0]["snippet"]["channelId"]
        elif chan_handle:
            channel_id = await _resolve_channel_id(client, chan_handle, api_key)

        if not channel_id:
            return {"error": "Could not resolve channel"}

        # Channel meta
        r = await client.get(
            "https://www.googleapis.com/youtube/v3/channels",
            params={"part": "statistics,snippet", "id": channel_id, "key": api_key},
        )
        ch_items = r.json().get("items", [])
        if not ch_items:
            return {"error": "Channel not found"}

        stats   = ch_items[0]["statistics"]
        snippet = ch_items[0]["snippet"]
        subscribers = int(stats.get("subscriberCount", 0))
        total_views = int(stats.get("viewCount", 0))
        video_count = int(stats.get("videoCount", 1))

        # Last 15 videos
        r = await client.get(
            "https://www.googleapis.com/youtube/v3/search",
            params={"part": "id,snippet", "channelId": channel_id, "type": "video",
                    "order": "date", "maxResults": 15, "key": api_key},
        )
        search_items = r.json().get("items", [])
        if not search_items:
            return {"error": "No videos found"}

        vid_ids   = [it["id"]["videoId"] for it in search_items]
        vid_titles = {it["id"]["videoId"]: it["snippet"]["title"][:50] for it in search_items}
        vid_dates  = {it["id"]["videoId"]: it["snippet"]["publishedAt"][:10] for it in search_items}

        # Video stats
        r = await client.get(
            "https://www.googleapis.com/youtube/v3/videos",
            params={"part": "statistics", "id": ",".join(vid_ids), "key": api_key},
        )
        vid_items = r.json().get("items", [])

        videos = []
        for v in vid_items:
            s  = v["statistics"]
            vc = int(s.get("viewCount", 0))
            lc = int(s.get("likeCount", 0))
            cc = int(s.get("commentCount", 0))
            er = round(lc / vc * 100, 2) if vc else 0
            videos.append({
                "id":       v["id"],
                "title":    vid_titles.get(v["id"], ""),
                "date":     vid_dates.get(v["id"], ""),
                "views":    vc,
                "likes":    lc,
                "comments": cc,
                "er":       er,
            })

        # Sort by date desc, keep last 10
        videos.sort(key=lambda x: x["date"], reverse=True)
        videos = videos[:10]

        avg_views = int(sum(v["views"] for v in videos) / len(videos)) if videos else 0
        avg_er    = round(sum(v["er"] for v in videos) / len(videos), 2) if videos else 0

        return {
            "channel_name": snippet.get("title", ""),
            "channel_id":   channel_id,
            "subscribers":  subscribers,
            "total_views":  total_views,
            "video_count":  video_count,
            "avg_views":    avg_views,
            "avg_er":       avg_er,
            "videos":       videos,
        }


# ── PDF Export ─────────────────────────────────────────────────
@router.post("/export-pdf")
async def export_pdf(req: PdfReq):
    try:
        from fpdf import FPDF
    except ImportError:
        return {"error": "fpdf2 not installed"}

    pdf = FPDF()
    pdf.add_page()
    pdf.set_auto_page_break(auto=True, margin=18)

    # ── Header band ──
    pdf.set_fill_color(29, 29, 31)
    pdf.rect(0, 0, 210, 28, 'F')
    pdf.set_text_color(255, 255, 255)
    pdf.set_font("Helvetica", "B", 16)
    pdf.set_xy(14, 8)
    pdf.cell(0, 10, "InfluenceIQ", ln=False)
    pdf.set_font("Helvetica", "", 9)
    pdf.set_xy(14, 18)
    pdf.set_text_color(180, 180, 180)
    pdf.cell(0, 6, "Influencer Analysis Report")

    # date right
    import datetime
    pdf.set_font("Helvetica", "", 9)
    pdf.set_text_color(180, 180, 180)
    pdf.set_xy(140, 18)
    pdf.cell(56, 6, datetime.date.today().strftime("%d %b %Y"), align="R")

    pdf.set_xy(0, 32)

    def section_title(t):
        pdf.set_font("Helvetica", "B", 9)
        pdf.set_text_color(130, 130, 135)
        pdf.set_x(14)
        pdf.cell(0, 8, t.upper(), ln=True)
        pdf.set_draw_color(220, 220, 225)
        pdf.line(14, pdf.get_y(), 196, pdf.get_y())
        pdf.ln(3)

    def kv(label, value, color=None):
        pdf.set_x(14)
        pdf.set_font("Helvetica", "", 10)
        pdf.set_text_color(110, 110, 115)
        pdf.cell(58, 7, label)
        pdf.set_font("Helvetica", "B", 10)
        if color:
            pdf.set_text_color(*color)
        else:
            pdf.set_text_color(29, 29, 31)
        pdf.cell(0, 7, str(value), ln=True)
        pdf.set_text_color(29, 29, 31)

    # ── Channel ──
    section_title("Channel")
    kv("Name",       req.channel_name or "—")
    kv("Platform",   req.platform.capitalize())
    kv("Subscribers", f"{req.followers:,}")
    kv("Avg Views",  f"{req.views:,}")
    if req.engagement_rate is not None:
        kv("Engagement Rate", f"{req.engagement_rate}%")
    if req.channel_url:
        pdf.set_x(14)
        pdf.set_font("Helvetica", "", 9)
        pdf.set_text_color(0, 102, 204)
        pdf.cell(0, 6, req.channel_url[:80], ln=True)
    pdf.ln(4)

    # ── Recommendation ──
    section_title("Recommendation")
    rec_colors = {"take": (26, 122, 53), "risky": (180, 100, 0), "skip": (192, 57, 43)}
    rec_color  = rec_colors.get(req.recommendation, (29, 29, 31))
    pdf.set_x(14)
    pdf.set_font("Helvetica", "B", 13)
    pdf.set_text_color(*rec_color)
    pdf.cell(0, 10, req.recommendation_label or req.recommendation.upper(), ln=True)
    pdf.set_text_color(29, 29, 31)
    pdf.ln(2)

    # ── Forecast ──
    section_title("Forecast")
    kv("New Followers",  f"+{req.subscribers_min:,} – {req.subscribers_max:,}")
    kv("Sales Forecast", f"{req.sales_min:,} – {req.sales_max:,} units")
    profit_avg = (req.profit_min + req.profit_max) / 2
    p_str = f"{'+'if profit_avg>=0 else ''}${abs(int(profit_avg)):,} (avg)"
    kv("Profit Forecast", p_str,
       color=(26,122,53) if profit_avg >= 0 else (192,57,43))
    kv("ROI", f"{req.roi:+}%")
    pdf.ln(4)

    # ── Quality ──
    section_title("Quality Metrics")
    kv("Audience Quality",  req.audience_quality)
    kv("Risk Level",        req.risk_level)
    pdf.ln(4)

    # ── Campaign ──
    section_title("Campaign Input")
    kv("Ad Spend", f"${req.ad_price:,.2f}")
    pdf.ln(4)

    # ── Footer ──
    pdf.set_y(-20)
    pdf.set_draw_color(200, 200, 205)
    pdf.line(14, pdf.get_y(), 196, pdf.get_y())
    pdf.ln(3)
    pdf.set_font("Helvetica", "", 8)
    pdf.set_text_color(160, 160, 165)
    pdf.set_x(14)
    pdf.cell(0, 5, "Generated by InfluenceIQ · influenceiq.app · For informational purposes only.")

    buf = io.BytesIO(bytes(pdf.output()))
    buf.seek(0)
    return StreamingResponse(
        buf,
        media_type="application/pdf",
        headers={"Content-Disposition": "attachment; filename=influenceiq-report.pdf"},
    )
