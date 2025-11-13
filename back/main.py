from fastapi import FastAPI, HTTPException, Query
from fastapi.middleware.cors import CORSMiddleware
import feedparser
import requests
from cachetools import TTLCache, cached
from typing import List, Dict, Any
from datetime import datetime
import html
import time

app = FastAPI(title="RSS Aggregator API")

# Allow the frontend dev server
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # tighten to your domain in production
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# === Config: categories and feed URLs ===
# RSS_FEEDS = {
#     "national": "https://www.thehindu.com/news/national/feeder/default.rss",
#     "andhra": "https://www.thehindu.com/news/national/andhra-pradesh/feeder/default.rss",
#     "finance": "https://www.moneycontrol.com/rss/latestnews.xml",
#     "politics": "https://www.livemint.com/rss/politicsRSS",
#     "cinema": "https://timesofindia.indiatimes.com/rssfeeds/1081479906.cms",
#     "sports": "https://www.espn.com/espn/rss/news"
# }


RSS_FEEDS = {

     "ap_education_src1": "https://www.eenadu.net/rss/education",
    "ap_education_src2": "https://cdn.sakshi.com/rss/education.xml",

    # National India
    "national_education_hindustan_times": "https://www.hindustantimes.com/education/rssfeed.xml",
    "national_education_timesofindia": "https://timesofindia.indiatimes.com/rssfeeds/913168846.cms",

    # International Education
    "international_education_bbc": "https://feeds.bbci.co.uk/news/education/rss.xml",
    "international_education_aljazeera": "https://www.aljazeera.com/xml/rss/education.xml",
    # 🇮🇳 National & Regional News
    "national": "https://www.thehindu.com/news/national/feeder/default.rss",
    "andhra": "https://www.thehindu.com/news/national/andhra-pradesh/feeder/default.rss",
    "finance": "https://www.moneycontrol.com/rss/latestnews.xml",
    "politics": "https://www.livemint.com/rss/politicsRSS",
    "cinema": "https://timesofindia.indiatimes.com/rssfeeds/1081479906.cms",
    "sports": "https://www.espn.com/espn/rss/news",

    # 🗞️ Telugu News Sources
    "telugu_eenadu": "https://www.eenadu.net/rss/home",
    "telugu_sakshi": "https://cdn.sakshi.com/rss/sakshi-telangana.xml",
    "telugu_andhrajyothy": "https://www.andhrajyothy.com/rss/latest.xml",

    # 🌍 International News
    "bbc_world": "https://feeds.bbci.co.uk/news/world/rss.xml",
    "bbc_top_stories": "https://feeds.bbci.co.uk/news/rss.xml",
    "aljazeera_top": "https://www.aljazeera.com/xml/rss/all.xml"
}


# === Cache: feed url -> parsed items; TTL in seconds ===
FEED_CACHE_TTL = 120  # seconds
ITEMS_CACHE = TTLCache(maxsize=50, ttl=FEED_CACHE_TTL)

# === Helper functions ===

def parse_entry(entry) -> Dict[str, Any]:
    """Normalize a feedparser entry into a dict we send to client."""
    # Try to find thumbnail
    thumbnail = None
    # media_thumbnail
    media = entry.get('media_thumbnail') or entry.get('media_content')
    if media:
        if isinstance(media, list) and len(media) > 0:
            thumbnail = media[0].get('url')
        elif isinstance(media, dict):
            thumbnail = media.get('url')

    # enclosure
    if not thumbnail:
        encl = entry.get('enclosures')
        if encl and isinstance(encl, list) and len(encl) > 0:
            thumbnail = encl[0].get('href')

    # some feeds include image links in the content or summary
    summary = entry.get('summary') or entry.get('description') or ""
    # unescape HTML entities for convenience
    summary_text = html.unescape(summary)

    return {
        "id": entry.get('id') or entry.get('link'),
        "title": entry.get('title', ''),
        "summary": summary_text,
        "published": entry.get('published', entry.get('updated', '')),
        "published_parsed": (
            time.mktime(entry.published_parsed) if entry.get('published_parsed') else None
        ),
        "link": entry.get('link', ''),
        "thumbnail": thumbnail,
        "source": entry.get('source', {}).get('title') if entry.get('source') else None
    }

@cached(ITEMS_CACHE)
def fetch_feed_items(url: str) -> List[Dict[str, Any]]:
    """Fetch and parse feed; cached by URL"""
    d = feedparser.parse(url)
    if d.bozo:
        # d.bozo_exception contains the parsing exception but many feeds report bozo for minor reasons.
        # Still attempt to return entries if present.
        pass
    entries = []
    for e in d.entries:
        entries.append(parse_entry(e))
    # sort by published if possible (desc)
    entries.sort(key=lambda it: it.get('published_parsed') or 0, reverse=True)
    return entries

# === API endpoints ===

@app.get("/news", summary="List categories")
def list_categories():
    return {"categories": list(RSS_FEEDS.keys())}

@app.get("/news/{category}", summary="Get feed items for a category")
def get_news(
    category: str,
    page: int = Query(1, ge=1),
    per_page: int = Query(20, ge=1, le=100),
):
    category = category.lower()
    if category not in RSS_FEEDS:
        raise HTTPException(status_code=404, detail="Unknown category")

    url = RSS_FEEDS[category]
    try:
        items = fetch_feed_items(url)
    except Exception as exc:
        raise HTTPException(status_code=502, detail=str(exc))

    # Pagination
    start = (page - 1) * per_page
    end = start + per_page
    paged = items[start:end]

    return {
        "category": category,
        "total": len(items),
        "page": page,
        "per_page": per_page,
        "items": paged,
    }

# Optional: simple proxy to fetch article HTML (disabled by default)
# NOTE: Many sites block embedding and some require respecting robots.txt and copyright.
# If you enable a proxy to fetch article HTML, be mindful of legality and load.
@app.get("/news/proxy")
def proxy_article(url: str):
    """Fetches the raw HTML of an article and returns as text/html.
    Use only for allowed sites — disabled or limited in production.
    """
    # Lightweight safety: only allow http/https and some length
    if not (url.startswith("http://") or url.startswith("https://")) or len(url) > 2000:
        raise HTTPException(status_code=400, detail="Invalid URL")
    try:
        headers = {
            "User-Agent": "Mozilla/5.0 (compatible; RSS-Aggregator/1.0)"
        }
        resp = requests.get(url, headers=headers, timeout=10)
        resp.raise_for_status()
        # Return text for embedding in frontend (CSP/X-Frame may still block)
        return {
            "url": url,
            "content": resp.text
        }
    except Exception as exc:
        raise HTTPException(status_code=502, detail=str(exc))
