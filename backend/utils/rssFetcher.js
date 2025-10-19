const RSSParser = require('rss-parser');
const parser = new RSSParser();

async function fetchCompanyNews(companyName) {
  try {
    const feed = await parser.parseURL(
      `https://news.google.com/rss/search?q=${encodeURIComponent(companyName)}&hl=en-IN&gl=IN&ceid=IN:en`
    );
    // Return array of objects instead of string
    const news = feed.items.slice(0, 5).map(item => ({
      title: item.title || 'No title',
      link: item.link || '',
      pubDate: item.pubDate || ''
    }));

    return news;
  } catch (err) {
    console.error('RSS error:', err.message);
    return []; // return empty array on error
  }
}

module.exports = { fetchCompanyNews };
