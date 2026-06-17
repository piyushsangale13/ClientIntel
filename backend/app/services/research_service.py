import json
import re
from datetime import datetime, timedelta

import httpx
from langchain_core.documents import Document
from langchain_text_splitters import RecursiveCharacterTextSplitter
from sqlalchemy import func, select
from sqlalchemy.orm import Session

from app.models.company_research import CompanyResearch
from app.models.user import User
from app.services.langchain_factory import build_chat_model
from app.services.token_service import record_token_usage
from app.services.vector_service import index_company_documents
from app.utils.rss import fetch_company_news
from app.utils.scraper import scrape_website

ONE_DAY = timedelta(days=1)


def _get_official_website(company_name: str) -> str:
    from app.core.config import get_settings

    settings = get_settings()
    if not settings.google_api_key or not settings.google_cse_id:
        safe_company = re.sub(r"\s+", "", company_name.strip().lower())
        return f"https://www.{safe_company}.com"

    query = f"{company_name} official site"
    url = "https://www.googleapis.com/customsearch/v1"
    params = {
        "key": settings.google_api_key,
        "cx": settings.google_cse_id,
        "q": query,
        "num": 5,
    }
    try:
        response = httpx.get(url, params=params, timeout=30.0)
        response.raise_for_status()
        items = response.json().get("items", [])
        flattened = re.sub(r"\s+", "", company_name).lower()
        for item in items:
            link = item.get("link", "")
            if flattened in link.lower():
                return link
        return items[0].get("link") if items else f"https://www.{flattened}.com"
    except httpx.HTTPError:
        safe_company = re.sub(r"\s+", "", company_name.strip().lower())
        return f"https://www.{safe_company}.com"


def _extract_summary_payload(company: str, site_content: str, wikipedia_content: str, news_content: str) -> dict:
    chat_model = build_chat_model()
    prompt = f"""
You are a research assistant preparing a business intelligence brief for an IT sales representative.

Analyze and combine the following information about "{company}".
Return valid JSON with this structure:
{{
  "summary": "A concise company overview under 500 words",
  "companyDomain": "string",
  "employeeSize": "string",
  "companyLocations": ["City, Country"],
  "topInsights": ["3-5 short bullet points"]
}}

Official Website Content:
{site_content[:8000]}

Wikipedia Content:
{wikipedia_content[:8000]}

Recent News:
{news_content[:4000]}
"""
    result = chat_model.invoke(prompt)
    record_token_usage_from_response = result.response_metadata.get("token_usage", {}).get("total_tokens", 0)
    raw_content = result.content if isinstance(result.content, str) else json.dumps(result.content)

    if record_token_usage_from_response:
        return {"raw": raw_content, "tokens": record_token_usage_from_response}
    return {"raw": raw_content, "tokens": 0}


def _parse_summary_payload(raw: str) -> dict:
    try:
        start = raw.index("{")
        end = raw.rindex("}") + 1
        data = json.loads(raw[start:end])
        return {
            "summary": data.get("summary", ""),
            "companyDomain": data.get("companyDomain", ""),
            "employeeSize": data.get("employeeSize", ""),
            "companyLocations": data.get("companyLocations", []),
            "topInsights": data.get("topInsights", []),
        }
    except (ValueError, json.JSONDecodeError):
        return {
            "summary": raw.strip(),
            "companyDomain": "",
            "employeeSize": "",
            "companyLocations": [],
            "topInsights": [],
        }


def _chunk_company_documents(company: str, official_website: str, website_text: str, summary: str, news: list[dict]) -> list[Document]:
    splitter = RecursiveCharacterTextSplitter(chunk_size=800, chunk_overlap=120)
    content_blocks = [
        f"Company: {company}\nWebsite: {official_website}\nSummary:\n{summary}",
        f"Company: {company}\nWebsite content:\n{website_text}",
        f"Company: {company}\nRecent news:\n" + "\n".join(
            f"{item.get('title', '')} | {item.get('pubDate', '')} | {item.get('link', '')}" for item in news
        ),
    ]
    documents: list[Document] = []
    for idx, block in enumerate(content_blocks):
        for chunk in splitter.split_text(block):
            documents.append(Document(page_content=chunk, metadata={"source_block": idx}))
    return documents


def research_company(db: Session, user: User, company: str) -> dict:
    company = company.strip()
    if not company:
        raise ValueError("Company name required")

    cached = db.scalar(select(CompanyResearch).where(func.lower(CompanyResearch.company) == company.lower()))
    if cached and datetime.utcnow() - cached.last_updated < ONE_DAY:
        return _serialize_research(cached, cached=True)

    official_website = _get_official_website(company)
    wikipedia_url = _get_official_website(f"Wikipedia {company}")
    site_content = scrape_website(official_website)
    wikipedia_content = scrape_website(wikipedia_url)
    news = fetch_company_news(company)
    news_content = "\n".join(f"{item['title']} ({item['pubDate']}) - {item['link']}" for item in news)

    llm_payload = _extract_summary_payload(company, site_content, wikipedia_content, news_content)
    record_token_usage(db, llm_payload["tokens"])
    extracted = _parse_summary_payload(llm_payload["raw"])
    top_news = news[:3]

    if not cached:
        cached = CompanyResearch(company=company, official_website=official_website, website_text=site_content, summary="")

    cached.company = company
    cached.official_website = official_website
    cached.website_text = site_content
    cached.summary = extracted["summary"]
    cached.news = news
    cached.top_news = top_news
    cached.company_domain = extracted["companyDomain"]
    cached.employee_size = extracted["employeeSize"]
    cached.company_locations = extracted["companyLocations"]
    cached.top_insights = extracted["topInsights"]
    cached.requested_by_user_id = user.id
    cached.last_updated = datetime.utcnow()

    db.add(cached)
    db.commit()
    db.refresh(cached)

    index_company_documents(
        cached.id,
        company,
        _chunk_company_documents(company, official_website, site_content, extracted["summary"], news),
    )

    return _serialize_research(cached, cached=False)


def _serialize_research(research: CompanyResearch, cached: bool) -> dict:
    return {
        "company": research.company,
        "officialWebsite": research.official_website,
        "news": research.news or [],
        "websiteText": research.website_text,
        "summary": research.summary,
        "topNews": research.top_news or [],
        "companyDomain": research.company_domain or "",
        "employeeSize": research.employee_size or "",
        "companyLocations": research.company_locations or [],
        "topInsights": research.top_insights or [],
        "cached": cached,
    }
