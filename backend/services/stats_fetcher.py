"""
backend/services/stats_fetcher.py
YouTube Data API v3 — channel & video URLs, real engagement from recent videos.
"""

import os
import re
import httpx
from typing import Optional
from dataclasses import dataclass
from dotenv import load_dotenv

load_dotenv()


@dataclass
class BloggerStats:
    platform: str
    views: Optional[int]
    likes: Optional[int]
    followers: Optional[int]
    name: Optional[str]
    channel_url: Optional[str] = None
    engagement_rate: Optional[float] = None
    auto_filled: bool = True


def detect_platform(url: str) -> Optional[str]:
    url = url.lower()
    if "youtube.com" in url or "youtu.be" in url:
        return "youtube"
    if "t.me" in url or "telegram.me" in url:
        return "telegram"
    if "tiktok.com" in url:
        return "tiktok"
    if "instagram.com" in url:
        return "instagram"
    return None


def extract_video_id(url: str) -> Optional[str]:
    """Extract YouTube video ID from watch or short URL."""
    patterns = [
        r"(?:youtube\.com/watch\?v=|youtu\.be/)([A-Za-z0-9_-]{11})",
        r"youtube\.com/shorts/([A-Za-z0-9_-]{11})",
        r"youtube\.com/embed/([A-Za-z0-9_-]{11})",
    ]
    for p in patterns:
        m = re.search(p, url)
        if m:
            return m.group(1)
    return None


def extract_channel_handle(url: str) -> Optional[str]:
    """Extract channel ID or handle from channel URL."""
    patterns = [
        r"youtube\.com/channel/([A-Za-z0-9_-]+)",
        r"youtube\.com/@([A-Za-z0-9_.\-]+)",
        r"youtube\.com/c/([A-Za-z0-9_.\-]+)",
        r"youtube\.com/user/([A-Za-z0-9_.\-]+)",
    ]
    for p in patterns:
        m = re.search(p, url)
        if m:
            return m.group(1)
    return None


async def _resolve_channel_id(client: httpx.AsyncClient, handle: str, api_key: str) -> Optional[str]:
    """Turn a handle/username into a channel ID."""
    if handle.startswith("UC") and len(handle) == 24:
        return handle  # already a channel ID

    # Try forHandle (works for @handles)
    resp = await client.get(
        "https://www.googleapis.com/youtube/v3/channels",
        params={"part": "id", "forHandle": handle, "key": api_key},
    )
    items = resp.json().get("items", [])
    if items:
        return items[0]["id"]

    # Fallback: search
    resp = await client.get(
        "https://www.googleapis.com/youtube/v3/search",
        params={"part": "snippet", "q": handle, "type": "channel",
                "maxResults": 1, "key": api_key},
    )
    items = resp.json().get("items", [])
    if items:
        return items[0]["snippet"]["channelId"]

    return None


async def _channel_stats(client: httpx.AsyncClient, channel_id: str, api_key: str) -> Optional[BloggerStats]:
    """Fetch channel stats + avg engagement from last 10 videos."""
    # 1. Channel metadata
    resp = await client.get(
        "https://www.googleapis.com/youtube/v3/channels",
        params={"part": "statistics,snippet", "id": channel_id, "key": api_key},
    )
    items = resp.json().get("items", [])
    if not items:
        return None

    stats   = items[0]["statistics"]
    snippet = items[0]["snippet"]
    subscribers = int(stats.get("subscriberCount", 0))
    channel_name = snippet.get("title", "")
    channel_url = f"https://www.youtube.com/channel/{channel_id}"

    # 2. Last 10 videos for real engagement
    resp = await client.get(
        "https://www.googleapis.com/youtube/v3/search",
        params={"part": "id", "channelId": channel_id, "type": "video",
                "order": "date", "maxResults": 10, "key": api_key},
    )
    video_ids = [it["id"]["videoId"] for it in resp.json().get("items", [])]

    avg_views = 0
    avg_likes = 0
    real_er: Optional[float] = None

    if video_ids:
        resp = await client.get(
            "https://www.googleapis.com/youtube/v3/videos",
            params={"part": "statistics", "id": ",".join(video_ids), "key": api_key},
        )
        vid_items = resp.json().get("items", [])
        views_list = []
        likes_list = []
        for v in vid_items:
            s = v["statistics"]
            vc = int(s.get("viewCount", 0))
            lc = int(s.get("likeCount", 0))
            if vc > 0:
                views_list.append(vc)
                likes_list.append(lc)

        if views_list:
            avg_views = int(sum(views_list) / len(views_list))
            avg_likes = int(sum(likes_list) / len(likes_list))
            real_er   = round(sum(likes_list) / sum(views_list) * 100, 2)
    else:
        # Fallback to total stats
        total_views = int(stats.get("viewCount", 0))
        video_count = max(int(stats.get("videoCount", 1)), 1)
        avg_views   = total_views // video_count
        avg_likes   = int(avg_views * 0.03)

    return BloggerStats(
        platform="youtube",
        views=avg_views,
        likes=avg_likes,
        followers=subscribers,
        name=channel_name,
        channel_url=channel_url,
        engagement_rate=real_er,
    )


async def fetch_youtube_stats(url: str) -> Optional[BloggerStats]:
    api_key = os.getenv("YOUTUBE_API_KEY")
    if not api_key:
        return None

    async with httpx.AsyncClient(timeout=15) as client:
        video_id   = extract_video_id(url)
        chan_handle = extract_channel_handle(url)

        if video_id:
            # ── Video URL ──────────────────────────────────────────
            resp = await client.get(
                "https://www.googleapis.com/youtube/v3/videos",
                params={"part": "statistics,snippet", "id": video_id, "key": api_key},
            )
            items = resp.json().get("items", [])
            if not items:
                return None

            vs      = items[0]["statistics"]
            snippet = items[0]["snippet"]
            channel_id = snippet.get("channelId")

            views = int(vs.get("viewCount", 0))
            likes = int(vs.get("likeCount", 0))
            real_er = round(likes / views * 100, 2) if views else None

            # Get channel subscriber count
            subscribers = 0
            channel_name = snippet.get("channelTitle", "")
            channel_url  = f"https://www.youtube.com/channel/{channel_id}" if channel_id else url

            if channel_id:
                resp2 = await client.get(
                    "https://www.googleapis.com/youtube/v3/channels",
                    params={"part": "statistics", "id": channel_id, "key": api_key},
                )
                ch_items = resp2.json().get("items", [])
                if ch_items:
                    subscribers = int(ch_items[0]["statistics"].get("subscriberCount", 0))

            return BloggerStats(
                platform="youtube",
                views=views,
                likes=likes,
                followers=subscribers,
                name=channel_name,
                channel_url=channel_url,
                engagement_rate=real_er,
            )

        elif chan_handle:
            # ── Channel URL ────────────────────────────────────────
            channel_id = await _resolve_channel_id(client, chan_handle, api_key)
            if not channel_id:
                return None
            return await _channel_stats(client, channel_id, api_key)

    return None


async def fetch_stats_by_url(url: str) -> dict:
    platform = detect_platform(url)

    if not platform:
        return {"success": False, "error": "Не удалось определить платформу по ссылке"}

    if platform == "youtube":
        stats = await fetch_youtube_stats(url)
        if not stats:
            return {"success": False, "error": "Не удалось получить данные. Проверь ссылку или API ключ"}
        return {
            "success": True,
            "platform": stats.platform,
            "views": stats.views,
            "likes": stats.likes,
            "followers": stats.followers,
            "name": stats.name,
            "channel_url": stats.channel_url,
            "engagement_rate": stats.engagement_rate,
        }

    # Telegram / TikTok / Instagram — manual input
    return {
        "success": False,
        "platform": platform,
        "manual": True,
        "message": f"{platform.capitalize()} — введи данные вручную",
    }
