import httpx
from bs4 import BeautifulSoup


def scrape_website(url: str) -> str:
    try:
        response = httpx.get(url, timeout=30.0, follow_redirects=True)
        response.raise_for_status()
        soup = BeautifulSoup(response.text, "html.parser")
        return " ".join(soup.get_text(separator=" ").split())[:5000] or "No readable content found."
    except httpx.HTTPError:
        return "Error scraping website content."
