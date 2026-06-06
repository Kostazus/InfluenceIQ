"""
backend/services/stats_fetcher.py
StringSession — сессия хранится в .env, не слетает при перезапуске.
"""

import os
import re
import httpx
from typing import Optional
from dataclasses import dataclass
from dotenv import load_dotenv
from telethon import TelegramClient
from telethon.sessions import StringSession
from telethon.tl.functions.channels import GetFullChannelRequest

load_dotenv()


@dataclass
class BloggerStats:
    platform: str
    views: Optional[int]
    likes: Optional[int]
    followers: Optional[int]
    name: Optional[str]
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


def extract_youtube_id(url: str) -> Optional[str]:
    patterns = [
        r"youtube\.com/channel/([A-Za-z0-9_-]+)",
        r"youtube\.com/@([A-Za-z0-9_.-]+)",
        r"youtube\.com/c/([A-Za-z0-9_.-]+)",
        r"youtube\.com/user/([A-Za-z0-9_.-]+)",
    ]
    for p in patterns:
        m = re.search(p, url)
        if m:
            return m.group(1)
    return None


def extract_telegram_username(url: str) -> Optional[str]:
    url = url.strip().rstrip('/')
    # Убираем /s/ из веб-версии t.me/s/username
    url = re.sub(r'/s/', '/', url)
    m = re.search(r"(?:t\.me|telegram\.me)/([A-Za-z0-9_]{3,})", url)
    return m.group(1) if m else None


async def fetch_youtube_stats(url: str) -> Optional[BloggerStats]:
    api_key = os.getenv("YOUTUBE_API_KEY")
    if not api_key:
        return None

    identifier = extract_youtube_id(url)
    if not identifier:
        return None

    async with httpx.AsyncClient(timeout=10) as client:
        if identifier.startswith("UC"):
            channel_id = identifier
        else:
            resp = await client.get(
                "https://www.googleapis.com/youtube/v3/search",
                params={"part": "snippet", "q": identifier,
                        "type": "channel", "maxResults": 1, "key": api_key}
            )
            data = resp.json()
            items = data.get("items", [])
            if not items:
                return None
            channel_id = items[0]["snippet"]["channelId"]

        resp = await client.get(
            "https://www.googleapis.com/youtube/v3/channels",
            params={"part": "statistics,snippet", "id": channel_id, "key": api_key}
        )
        data = resp.json()
        items = data.get("items", [])
        if not items:
            return None

        stats   = items[0]["statistics"]
        snippet = items[0]["snippet"]

        subscribers     = int(stats.get("subscriberCount", 0))
        total_views     = int(stats.get("viewCount", 0))
        video_count     = int(stats.get("videoCount", 1)) or 1
        avg_views       = total_views // video_count
        estimated_likes = int(avg_views * 0.04)

        return BloggerStats(
            platform="youtube",
            views=avg_views,
            likes=estimated_likes,
            followers=subscribers,
            name=snippet.get("title"),
        )


async def fetch_telegram_stats(url: str) -> Optional[BloggerStats]:
    api_id      = os.getenv("TELEGRAM_API_ID")
    api_hash    = os.getenv("TELEGRAM_API_HASH")
    session_str = os.getenv("TELEGRAM_SESSION")

    if not api_id or not api_hash or not session_str:
        print("TELEGRAM ERROR: missing credentials in .env")
        return None

    username = extract_telegram_username(url)
    if not username:
        return None

    try:
        # StringSession — не требует повторной авторизации
        client = TelegramClient(
            StringSession(session_str),
            int(api_id),
            api_hash,
        )

        async with client:
            entity    = await client.get_entity(username)
            full      = await client(GetFullChannelRequest(entity))
            followers = full.full_chat.participants_count

            messages        = await client.get_messages(entity, limit=10)
            views_list      = []
            total_reactions = 0

            for msg in messages:
                if msg.views:
                    views_list.append(msg.views)
                if msg.reactions:
                    for reaction in msg.reactions.results:
                        total_reactions += reaction.count

            avg_views = sum(views_list) // len(views_list) if views_list else 0
            avg_likes = total_reactions // len(messages) if messages else 0

            return BloggerStats(
                platform="telegram",
                views=avg_views,
                likes=avg_likes,
                followers=followers,
                name=getattr(entity, "title", username),
            )

    except Exception as e:
        print(f"TELEGRAM ERROR: {e}")
        return None


async def fetch_stats_by_url(url: str) -> dict:
    platform = detect_platform(url)

    if not platform:
        return {"success": False, "error": "Не удалось определить платформу по ссылке"}

    if platform == "youtube":
        stats = await fetch_youtube_stats(url)
    elif platform == "telegram":
        stats = await fetch_telegram_stats(url)
    else:
        return {
            "success": False,
            "platform": platform,
            "manual": True,
            "message": f"{platform.capitalize()} не поддерживает автозагрузку — введи данные вручную",
        }

    if not stats:
        return {"success": False, "error": "Не удалось получить данные. Проверь ссылку или API ключ"}

    return {
        "success": True,
        "platform": stats.platform,
        "views": stats.views,
        "likes": stats.likes,
        "followers": stats.followers,
        "name": stats.name,
    }
