# from fastapi import FastAPI, HTTPException, Query
# from fastapi.middleware.cors import CORSMiddleware
# import feedparser
# import requests
# from cachetools import TTLCache, cached
# from typing import List, Dict, Any
# from datetime import datetime
# import html
# import time
# import os

# # --- CREWAI & GEMINI IMPORTS ---
# from pydantic import BaseModel
# from crewai import Agent, Task, Crew, Process
# from langchain_google_genai import ChatGoogleGenerativeAI

# app = FastAPI(title="RSS Aggregator & Personal Intelligence API")

# app.add_middleware(
#     CORSMiddleware,
#     allow_origins=["*"],
#     allow_credentials=True,
#     allow_methods=["*"],
#     allow_headers=["*"],
# )

# # === 1. CONFIGURATION ===

# # !!! PASTE YOUR GEMINI API KEY HERE OR SET IN ENV VARIABLES !!!
# os.environ["GOOGLE_API_KEY"] = os.getenv("GOOGLE_API_KEY", "YOUR_GEMINI_API_KEY_HERE")

# # Initialize Gemini LLM
# # Using gemini-1.5-flash for speed and efficiency
# llm = ChatGoogleGenerativeAI(
#     model="gemini-2.5-flash",
#     verbose=True,
#     temperature=0.7,
#     google_api_key=os.environ["GOOGLE_API_KEY"]
# )

# # Existing RSS Feeds Configuration
# RSS_FEEDS = {
#     "ap_education_src1": "https://www.eenadu.net/rss/education",
#     "ap_education_src2": "https://cdn.sakshi.com/rss/education.xml",
#     "national_education_hindustan_times": "https://www.hindustantimes.com/education/rssfeed.xml",
#     "national_education_timesofindia": "https://timesofindia.indiatimes.com/rssfeeds/913168846.cms",
#     "national": "https://www.thehindu.com/news/national/feeder/default.rss",
#     "andhra": "https://www.thehindu.com/news/national/andhra-pradesh/feeder/default.rss",
#     "finance": "https://www.moneycontrol.com/rss/latestnews.xml",
#     "politics": "https://www.indianewsnetwork.com/rss.en.politics.xml",
#     "p1":"https://www.nationalheraldindia.com/stories.rss?section=politics",
#     "cinema": "https://timesofindia.indiatimes.com/rssfeeds/1081479906.cms",
#     "sports": "https://www.espn.com/espn/rss/news",
#     "telugu_eenadu": "https://www.eenadu.net/rss/home",
#     "telugu_sakshi": "https://cdn.sakshi.com/rss/sakshi-telangana.xml",
#     "telugu_andhrajyothy": "https://www.andhrajyothy.com/rss/latest.xml",
#     "bbc_world": "https://feeds.bbci.co.uk/news/world/rss.xml",
#     "bbc_top_stories": "https://feeds.bbci.co.uk/news/rss.xml",
#     "aljazeera_top": "https://www.aljazeera.com/xml/rss/all.xml"
# }

# CATEGORY_MAP = {
#     "education": ["ap_education_src1", "ap_education_src2", "national_education_hindustan_times", "national_education_timesofindia"],
#     "national": ["national", "national_education_hindustan_times", "national_education_timesofindia"],
#     "regional": ["andhra", "telugu_eenadu", "telugu_sakshi", "telugu_andhrajyothy"],
#     "finance": ["finance"],
#     "politics": ["politics","p1"],
#     "cinema": ["cinema"],
#     "sports": ["sports"],
#     "international": ["aljazeera_top","bbc_world", "bbc_top_stories"]
# }

# FEED_CACHE_TTL = 120
# ITEMS_CACHE = TTLCache(maxsize=50, ttl=FEED_CACHE_TTL)

# # === 2. HELPER FUNCTIONS ===

# def parse_entry(entry) -> Dict[str, Any]:
#     thumbnail = None
#     media = entry.get('media_thumbnail') or entry.get('media_content')
#     if media:
#         if isinstance(media, list) and len(media) > 0:
#             thumbnail = media[0].get('url')
#         elif isinstance(media, dict):
#             thumbnail = media.get('url')
#     if not thumbnail:
#         encl = entry.get('enclosures')
#         if encl and isinstance(encl, list) and len(encl) > 0:
#             thumbnail = encl[0].get('href')

#     summary = entry.get('summary') or entry.get('description') or ""
#     summary_text = html.unescape(summary)

#     return {
#         "id": entry.get('id') or entry.get('link'),
#         "title": entry.get('title', ''),
#         "summary": summary_text,
#         "published": entry.get('published', entry.get('updated', '')),
#         "published_parsed": (time.mktime(entry.published_parsed) if entry.get('published_parsed') else None),
#         "link": entry.get('link', ''),
#         "thumbnail": thumbnail,
#         "source": entry.get('source', {}).get('title') if entry.get('source') else None
#     }

# @cached(ITEMS_CACHE)
# def fetch_feed_items(url: str) -> List[Dict[str, Any]]:
#     d = feedparser.parse(url)
#     entries = []
#     for e in d.entries:
#         entries.append(parse_entry(e))
#     entries.sort(key=lambda it: it.get('published_parsed') or 0, reverse=True)
#     return entries

# # === 3. AI AGENT SETUP ===

# class AnalysisRequest(BaseModel):
#     user_profile: Dict[str, str]
#     news_items: List[Dict[str, Any]]

# def create_news_crew(user_profile, news_content):
#     # Agent 1: The Contextual Curator
#     curator = Agent(
#         role='Personal News Curator',
#         goal=f'Filter noise and identify news that directly impacts a {user_profile.get("profession")} in {user_profile.get("city")}, aged {user_profile.get("ageGroup")}.',
#         backstory="You are an elite intelligence analyst. You ignore celebrity gossip and general noise. You focus on economic, regulatory, educational, and societal shifts that affect the user's specific life, career, and location.",
#         llm=llm,
#         verbose=True
#     )

#     # Agent 2: The Action Strategist
#     strategist = Agent(
#         role='Life & Career Strategist',
#         goal='Create a concrete, futuristic action plan based on the curated news.',
#         backstory="You are a pragmatic strategist. You don't just report news; you tell the user what to DO about it. You provide investment tips, career advice, or safety warnings based on the news.",
#         llm=llm,
#         verbose=True
#     )

#     # Task 1: Analysis
#     analysis_task = Task(
#         description=f"""
#         Analyze the following news summary for this user profile: {user_profile}
        
#         NEWS CONTENT:
#         {news_content}

#         1. Identify the Top 3 most critical stories for this specific user.
#         2. Explain briefly WHY each story matters to their profession/location.
#         """,
#         agent=curator,
#         expected_output="A summary of critical news items and their specific relevance to the user."
#     )

#     # Task 2: Solution Generation
#     solution_task = Task(
#         description="""
#         Based on the Curator's analysis, generate a "Personal Impact Briefing" in Markdown format.
        
#         Include:
#         1. 🎯 **The Bottom Line**: A 1-sentence summary of the current landscape for the user.
#         2. 🛑 **Risks**: Any immediate threats (jobs, economy, local safety).
#         3. 💡 **Opportunities**: New chances for growth, investment, or learning.
#         4. 🚀 **Action Plan**: 3 specific, step-by-step actions the user should take TODAY.
        
#         Keep it punchy, futuristic, and direct.
#         """,
#         agent=strategist,
#         expected_output="A structured markdown Personal Impact Briefing."
#     )

#     crew = Crew(
#         agents=[curator, strategist],
#         tasks=[analysis_task, solution_task],
#         process=Process.sequential
#     )
#     return crew

# # === 4. API ENDPOINTS ===

# @app.get("/news")
# def list_categories():
#     return {"categories": list(RSS_FEEDS.keys())}

# @app.get("/news/{category}")
# def get_news(category: str, page: int = Query(1, ge=1), per_page: int = Query(20, ge=1, le=100)):
#     category = category.lower()
#     if category not in CATEGORY_MAP:
#         raise HTTPException(status_code=404, detail="Unknown category")
    
#     feed_keys = CATEGORY_MAP[category]
#     all_items = []
    
#     for key in feed_keys:
#         url = RSS_FEEDS.get(key)
#         if url:
#             try:
#                 items = fetch_feed_items(url)
#                 all_items.extend(items)
#             except Exception as exc:
#                 print(f"Failed to fetch {url}: {exc}")
    
#     all_items.sort(key=lambda x: x.get("published", ""), reverse=True)
#     start = (page - 1) * per_page
#     end = start + per_page
#     paged = all_items[start:end]
    
#     return {"category": category, "total": len(all_items), "page": page, "per_page": per_page, "items": paged}

# @app.post("/news/analyze")
# def analyze_news(request: AnalysisRequest):
#     # Prepare text summary for LLM (Limit to top 15 items to manage context window)
#     news_summary_text = ""
#     for item in request.news_items[:15]:
#         news_summary_text += f"- {item.get('title')} (Source: {item.get('source')})\n"

#     try:
#         crew = create_news_crew(request.user_profile, news_summary_text)
#         result = crew.kickoff()
#         # CrewAI returns an object, we need the string output
#         return {"analysis": str(result)}
#     except Exception as e:
#         print(f"Agent Error: {e}")
#         raise HTTPException(status_code=500, detail=str(e))




from fastapi import FastAPI, HTTPException, Query
from fastapi.middleware.cors import CORSMiddleware
import feedparser
import requests
from cachetools import TTLCache, cached
from typing import List, Dict, Any, Optional
from datetime import datetime
import html
import time
import os
import json

# --- CREWAI & GEMINI IMPORTS ---
from pydantic import BaseModel, Field
from crewai import Agent, Task, Crew, Process
from langchain_google_genai import ChatGoogleGenerativeAI

app = FastAPI(title="RSS Aggregator & Personal Intelligence API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# === CONFIGURATION ===
os.environ["GOOGLE_API_KEY"] = os.getenv("GOOGLE_API_KEY", "YOUR_GEMINI_API_KEY_HERE")

llm = ChatGoogleGenerativeAI(
    model="gemini-2.5-flash",
    verbose=True,
    temperature=0.2, # Lower temperature for valid JSON
    google_api_key=os.environ["GOOGLE_API_KEY"]
)

# ... (Keep existing RSS_FEEDS, CATEGORY_MAP, FEED_CACHE_TTL, helper functions exactly as they were) ...
RSS_FEEDS = {
    "ap_education_src1": "https://www.eenadu.net/rss/education",
    "ap_education_src2": "https://cdn.sakshi.com/rss/education.xml",
    "national_education_hindustan_times": "https://www.hindustantimes.com/education/rssfeed.xml",
    "national_education_timesofindia": "https://timesofindia.indiatimes.com/rssfeeds/913168846.cms",
    "national": "https://www.thehindu.com/news/national/feeder/default.rss",
    "andhra": "https://www.thehindu.com/news/national/andhra-pradesh/feeder/default.rss",
    "finance": "https://www.moneycontrol.com/rss/latestnews.xml",
    "politics": "https://www.indianewsnetwork.com/rss.en.politics.xml",
    "p1":"https://www.nationalheraldindia.com/stories.rss?section=politics",
    "cinema": "https://timesofindia.indiatimes.com/rssfeeds/1081479906.cms",
    "sports": "https://www.espn.com/espn/rss/news",
    "telugu_eenadu": "https://www.eenadu.net/rss/home",
    "telugu_sakshi": "https://cdn.sakshi.com/rss/sakshi-telangana.xml",
    "telugu_andhrajyothy": "https://www.andhrajyothy.com/rss/latest.xml",
    "bbc_world": "https://feeds.bbci.co.uk/news/world/rss.xml",
    "bbc_top_stories": "https://feeds.bbci.co.uk/news/rss.xml",
    "aljazeera_top": "https://www.aljazeera.com/xml/rss/all.xml"
}

CATEGORY_MAP = {
    "education": ["ap_education_src1", "ap_education_src2", "national_education_hindustan_times", "national_education_timesofindia"],
    "national": ["national", "national_education_hindustan_times", "national_education_timesofindia"],
    "regional": ["andhra", "telugu_eenadu", "telugu_sakshi", "telugu_andhrajyothy"],
    "finance": ["finance"],
    "politics": ["politics","p1"],
    "cinema": ["cinema"],
    "sports": ["sports"],
    "international": ["aljazeera_top","bbc_world", "bbc_top_stories"]
}

FEED_CACHE_TTL = 120
ITEMS_CACHE = TTLCache(maxsize=50, ttl=FEED_CACHE_TTL)

def parse_entry(entry) -> Dict[str, Any]:
    thumbnail = None
    media = entry.get('media_thumbnail') or entry.get('media_content')
    if media:
        if isinstance(media, list) and len(media) > 0:
            thumbnail = media[0].get('url')
        elif isinstance(media, dict):
            thumbnail = media.get('url')
    if not thumbnail:
        encl = entry.get('enclosures')
        if encl and isinstance(encl, list) and len(encl) > 0:
            thumbnail = encl[0].get('href')

    summary = entry.get('summary') or entry.get('description') or ""
    summary_text = html.unescape(summary)

    return {
        "id": entry.get('id') or entry.get('link'),
        "title": entry.get('title', ''),
        "summary": summary_text,
        "published": entry.get('published', entry.get('updated', '')),
        "published_parsed": (time.mktime(entry.published_parsed) if entry.get('published_parsed') else None),
        "link": entry.get('link', ''),
        "thumbnail": thumbnail,
        "source": entry.get('source', {}).get('title') if entry.get('source') else None
    }

@cached(ITEMS_CACHE)
def fetch_feed_items(url: str) -> List[Dict[str, Any]]:
    d = feedparser.parse(url)
    entries = []
    for e in d.entries:
        entries.append(parse_entry(e))
    entries.sort(key=lambda it: it.get('published_parsed') or 0, reverse=True)
    return entries

# === UPDATED AI LOGIC ===

# 1. More detailed User Profile Model
class DetailedUserProfile(BaseModel):
    name: str = Field(default="User")
    age_group: str
    city: str
    state: str
    profession: str
    job_level: str  # e.g., "Junior", "Senior", "Executive"
    industry: str   # e.g., "Tech", "Healthcare"
    goals: str      # e.g., "Buying a house", "Career growth"
    worries: str    # e.g., "Inflation", "Job security"

class AnalysisRequest(BaseModel):
    user_profile: DetailedUserProfile
    news_items: List[Dict[str, Any]]

def create_structured_crew(user_profile: DetailedUserProfile, news_content: str):
    
    # Contextual Curator
    curator = Agent(
        role='Senior Intelligence Analyst',
        goal=f'Filter news specifically for a {user_profile.job_level} {user_profile.profession} in {user_profile.industry} based in {user_profile.city}.',
        backstory="You are an expert filter. You ignore noise. You look for news that affects the user's specific career, local economy, and personal goals.",
        llm=llm
    )

    # Strategic Advisor
    strategist = Agent(
        role='Personal Chief Strategy Officer',
        goal='Generate a structured JSON report with risks, opportunities, and actions.',
        backstory="You are a precise strategist. You do not write long paragraphs. You output data in strict JSON format for dashboard rendering.",
        llm=llm
    )

    # Task 1: Analysis
    analysis_task = Task(
        description=f"""
        Analyze these news items for: {user_profile}
        
        Focus on:
        1. Local impact ({user_profile.city}, {user_profile.state})
        2. Career impact ({user_profile.profession}, {user_profile.industry})
        3. Personal goals: {user_profile.goals}
        4. Worries: {user_profile.worries}

        News Content:
        {news_content}
        """,
        agent=curator,
        expected_output="A list of relevant impacts and insights."
    )

    # Task 2: JSON Generation
    # We explicitly ask for JSON structure here.
    json_task = Task(
        description="""
        Based on the analysis, generate a JSON object. 
        DO NOT include markdown formatting (like ```json ... ```). Just return the raw JSON string.
        
        The JSON must follow this exact schema:
        {
            "executive_summary": "One punchy sentence summarizing the overall situation.",
            "impact_score": 85, (0-100 integer, how much the news affects them today),
            "critical_alerts": [
                {"title": "Risk Title", "description": "Short explanation", "severity": "high/medium/low"}
            ],
            "opportunities": [
                {"title": "Opportunity Title", "description": "Short explanation"}
            ],
            "action_plan": [
                {"step": "Step 1", "action": "Specific action to take", "urgency": "Immediate/This Week"}
            ]
        }
        """,
        agent=strategist,
        expected_output="Valid JSON string."
    )

    crew = Crew(
        agents=[curator, strategist],
        tasks=[analysis_task, json_task],
        process=Process.sequential
    )
    return crew

# === API ENDPOINTS ===

@app.get("/news")
def list_categories():
    return {"categories": list(RSS_FEEDS.keys())}

@app.get("/news/{category}")
def get_news(category: str, page: int = Query(1, ge=1), per_page: int = Query(20, ge=1, le=100)):
    category = category.lower()
    if category not in CATEGORY_MAP:
        raise HTTPException(status_code=404, detail="Unknown category")
    
    feed_keys = CATEGORY_MAP[category]
    all_items = []
    
    for key in feed_keys:
        url = RSS_FEEDS.get(key)
        if url:
            try:
                items = fetch_feed_items(url)
                all_items.extend(items)
            except Exception as exc:
                print(f"Failed to fetch {url}: {exc}")
    
    all_items.sort(key=lambda x: x.get("published", ""), reverse=True)
    start = (page - 1) * per_page
    end = start + per_page
    paged = all_items[start:end]
    
    return {"category": category, "total": len(all_items), "page": page, "per_page": per_page, "items": paged}

@app.post("/news/analyze")
def analyze_news(request: AnalysisRequest):
    # Limit to top 10 items for clearer analysis
    news_summary_text = ""
    for item in request.news_items[:10]:
        news_summary_text += f"- {item.get('title')}: {item.get('summary')}\n"

    try:
        crew = create_structured_crew(request.user_profile, news_summary_text)
        result = crew.kickoff()
        
        # CrewAI returns a generic object. We need to parse the string content as JSON.
        # Sometimes LLMs wrap JSON in markdown blocks, we strip them.
        raw_output = str(result).strip()
        if raw_output.startswith("```json"):
            raw_output = raw_output[7:]
        if raw_output.endswith("```"):
            raw_output = raw_output[:-3]
        
        parsed_json = json.loads(raw_output)
        return parsed_json
        
    except json.JSONDecodeError:
        # Fallback if AI fails to generate strict JSON
        return {
            "executive_summary": "Analysis generated, but formatting failed. Please try again.",
            "impact_score": 0,
            "critical_alerts": [],
            "opportunities": [],
            "action_plan": []
        }
    except Exception as e:
        print(f"Agent Error: {e}")
        raise HTTPException(status_code=500, detail=str(e))
