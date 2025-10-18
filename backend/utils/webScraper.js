const axios = require('axios');
const cheerio = require('cheerio');

async function scrapeWebsite(url) {
  try {
    const { data } = await axios.get(url, { timeout: 100000 });
    const $ = cheerio.load(data);
    const text = $('body').text().replace(/\s+/g, ' ').slice(0, 5000);
    return text || 'No readable content found.';
  } catch (err) {
    console.error('Scraping error:', err.message);
    return 'Error scraping website content.';
  }
}

module.exports = {scrapeWebsite};
