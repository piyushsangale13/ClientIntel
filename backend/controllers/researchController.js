// controllers/researchController.js
const { AzureOpenAI } = require("openai");
const { scrapeWebsite } = require("../utils/webScraper");
const { fetchCompanyNews } = require("../utils/rssFetcher");
const CompanyResearch = require("../models/CompanyResearch");
const TokenUsage = require("../models/TokenUsage");
require("dotenv").config();

const openai = new AzureOpenAI({
  apiKey: process.env.OPEN_AI_API_KEY,
  endpoint: process.env.OPEN_AI_API_ENDPOINT,
  apiVersion: "2025-04-01-preview",
});

/**
 * Helper: record token usage safely
 * @param {number} tokens
 */
async function recordTokenUsage(tokens = 0) {
  try {
    if (!tokens || tokens <= 0) return;
    let usage = await TokenUsage.findOne();
    if (!usage) {
      usage = new TokenUsage({ totalTokens: tokens });
    } else {
      usage.totalTokens += tokens;
      usage.updatedAt = Date.now();
    }
    await usage.save();
  } catch (err) {
    console.error("Failed to record token usage:", err);
  }
}

/** Step 1: Get official website via LLM (returns URL string) */
async function getOfficialWebsite(companyName) {
  const prompt = `
I will give you a company name.
You must return only the company's official website URL (no text, no explanation).
Company: ${companyName}
`.trim();

  const result = await openai.chat.completions.create({
    model: "gpt-5-mini",
    messages: [{ role: "user", content: prompt }],
  });

  // record tokens for this call
  const tokens = result.usage?.total_tokens || 0;
  await recordTokenUsage(tokens);

  return result.choices[0]?.message?.content?.trim();
}

/** Step 2: Summarize + extract (primary summary) */
async function summarizeAndExtract(company, siteContent, newsContent) {
  const prompt = `
You are a research assistant creating a brief for an IT sales representative.

Combine and analyze the following information about "${company}".
Include:
- A concise company overview (max 250 words)
- The company’s primary domain (e.g., software, pharma, steel, etc.)
- Estimated employee size (approximate if not exact)
- Main office locations (city/country)

--- Official Website Content ---
${siteContent}

--- Recent News ---
${newsContent}

Provide a clear, concise summary.
`.trim();

  const result = await openai.chat.completions.create({
    model: "gpt-5-mini",
    messages: [{ role: "user", content: prompt }],
  });

  // record tokens for this call
  const tokens = result.usage?.total_tokens || 0;
  await recordTokenUsage(tokens);

  return result.choices[0]?.message?.content?.trim() || "";
}

/** Step 3: Extract structured JSON (domain, employeeSize, locations) */
async function extractStructuredData(fromText) {
  const prompt = `
Extract the following fields from the input text. Return ONLY valid JSON.

Input:
${fromText}

Return JSON with keys:
{
  "companyDomain": "string (e.g., software, pharma, finance, manufacturing)",
  "employeeSize": "string (e.g., 10-50, 1000+, approx)",
  "companyLocations": ["City, Country", ...]
}
`.trim();

  const result = await openai.chat.completions.create({
    model: "gpt-5-mini",
    messages: [{ role: "user", content: prompt }],
  });

  // record tokens for this call
  const tokens = result.usage?.total_tokens || 0;
  await recordTokenUsage(tokens);

  const raw = result.choices[0]?.message?.content || "{}";
  try {
    // The model sometimes returns backticks or extra text; try to extract JSON
    const firstBrace = raw.indexOf("{");
    const lastBrace = raw.lastIndexOf("}");
    const jsonString = firstBrace !== -1 && lastBrace !== -1
      ? raw.slice(firstBrace, lastBrace + 1)
      : raw;

    return JSON.parse(jsonString);
  } catch (err) {
    console.warn("Failed to parse structured JSON from LLM response:", err, "raw:", raw);
    return { companyDomain: "", employeeSize: "", companyLocations: [] };
  }
}

/** Combined route handler */
const researchCompany = async (req, res) => {
  const { company } = req.body;
  if (!company) return res.status(400).json({ error: "Company name required" });

  try {
    const ONE_DAY = 24 * 60 * 60 * 1000;

    // 1) Check cache (24h)
    const cached = await CompanyResearch.findOne({ company: new RegExp(`^${company}$`, "i") });
    if (cached && Date.now() - cached.lastUpdated.getTime() < ONE_DAY) {
      console.log("✅ Returning cached result for", company);
      return res.status(200).json(cached);
    }

    console.log(`🔍 Researching company: ${company}`);

    // 2) Ask LLM for official website
    const website = await getOfficialWebsite(company);
    console.log("🌐 Official Website (LLM):", website);

    // If LLM didn't return a usable URL, fallback to constructed URL
    let websiteUrl = website;
    if (!websiteUrl || !/^https?:\/\//i.test(websiteUrl)) {
      websiteUrl = `https://www.${company.toLowerCase().replace(/\s+/g, "")}.com`;
      console.log("Using fallback websiteUrl:", websiteUrl);
    }

    // 3) Scrape website content
    const siteContent = await scrapeWebsite(websiteUrl);

    // 4) Fetch news
    const news = await fetchCompanyNews(company); // array of {title, link, pubDate}
    const newsContent = Array.isArray(news) ? news.map(n => `${n.title} (${n.pubDate}) - ${n.link}`).join("\n") : "";

    // 5) Summarize & extract overview (primary LLM pass)
    const summaryText = await summarizeAndExtract(company, siteContent, newsContent);

    // 6) Structured extraction (domain, sizes, locations)
    const structured = await extractStructuredData(summaryText);

    // 7) Prepare top 3 news
    const topNews = Array.isArray(news) ? news.slice(0, 3) : [];

    // 8) Save / update cache
    const updated = await CompanyResearch.findOneAndUpdate(
      { company },
      {
        company,
        websiteUrl,
        websiteText: siteContent,
        news,
        summary: summaryText,
        topNews,
        companyDomain: structured.companyDomain || "",
        employeeSize: structured.employeeSize || "",
        companyLocations: structured.companyLocations || [],
        lastUpdated: new Date(),
      },
      { upsert: true, new: true }
    );

    // 9) Response
    return res.status(200).json({
      company,
      officialWebsite: websiteUrl,
      summary: summaryText,
      topNews,
      companyDomain: structured.companyDomain || "",
      employeeSize: structured.employeeSize || "",
      companyLocations: structured.companyLocations || [],
      cached: false,
    });
  } catch (err) {
    console.error("Error in researchCompany:", err);
    return res.status(500).json({ error: "Research failed" });
  }
};

module.exports = { researchCompany };
