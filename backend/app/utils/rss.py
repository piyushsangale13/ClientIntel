import feedparser


def fetch_company_news(company_name: str) -> list[dict]:
    feed = feedparser.parse(
        f"https://news.google.com/rss/search?q={company_name}&hl=en-IN&gl=IN&ceid=IN:en"
    )
    items = []
    for entry in feed.entries[:5]:
        items.append(
            {
                "title": getattr(entry, "title", "No title"),
                "link": getattr(entry, "link", ""),
                "pubDate": getattr(entry, "published", ""),
            }
        )
    return items
