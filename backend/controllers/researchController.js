const { AzureOpenAI } = require("openai");
const { scrapeWebsite } = require("../utils/webScraper");
const { fetchCompanyNews } = require("../utils/rssFetcher");
const CompanyResearch = require("../models/CompanyResearch");
const TokenUsage = require("../models/TokenUsage");
const axios = require("axios");
require("dotenv").config();

const openai = new AzureOpenAI({
  apiKey: process.env.OPEN_AI_API_KEY,
  endpoint: process.env.OPEN_AI_API_ENDPOINT,
  apiVersion: "2025-04-01-preview",
});

async function recordTokenUsage(tokens = 0) {
  try {
    if (!tokens || tokens <= 0) return;
    let usage = await TokenUsage.findOne();
    if (!usage) usage = new TokenUsage({ totalTokens: tokens });
    else {
      usage.totalTokens += tokens;
      usage.updatedAt = Date.now();
    }
    await usage.save();
  } catch (err) {
    console.error("Failed to record token usage:", err);
  }
}

async function runLLM(prompt) {
  try {
    const result = await openai.chat.completions.create({
      model: "gpt-5-mini",
      messages: [{ role: "user", content: prompt }],
    });

    const tokens = result.usage?.total_tokens || 0;
    await recordTokenUsage(tokens);

    return result.choices[0]?.message?.content?.trim() || "";
  } catch (err) {
    console.error("LLM Error:", err.message);
    return "";
  }
}

async function getOfficialWebsite(companyName) {
  const apiKey = process.env.GOOGLE_API_KEY;
  const cx = process.env.GOOGLE_CSE_ID;

  if (!apiKey || !cx) {
    console.warn("⚠️ GOOGLE_API_KEY or GOOGLE_CSE_ID missing. Using fallback URL.");
    return `https://www.${companyName.toLowerCase().replace(/\s+/g, "")}.com`;
  }

  try {
    const query = `${companyName} official site`;
    const url = `https://www.googleapis.com/customsearch/v1?key=${apiKey}&cx=${cx}&q=${encodeURIComponent(query)}&num=5`;

    const res = await axios.get(url);
    const items = res.data.items || [];

    for (let item of items) {
      const link = item.link;
      if (link && link.includes(companyName.replace(/\s+/g, "").toLowerCase())) {
        return link;
      }
    }

    return items[0]?.link || `https://www.${companyName.toLowerCase().replace(/\s+/g, "")}.com`;
  } catch (err) {
    console.error("Google Search API Error:", err.message);
    return `https://www.${companyName.toLowerCase().replace(/\s+/g, "")}.com`;
  }
}

async function summarizeAndExtract(company, siteContent, wikipediaContent, newsContent) {
  const prompt = `
You are a research assistant preparing a business intelligence brief for an IT sales representative.

Analyze and combine the following information about "${company}".
Your response must be in **valid JSON** with the structure below:

{
  "summary": "A concise, detailed company overview (max 500 words)",
  "companyDomain": "string (e.g., software, pharma, finance, manufacturing)",
  "employeeSize": "string (e.g., 10-50, 1000+, approx)",
  "companyLocations": ["City, Country", ...],
  "topInsights": ["3-5 short bullet points highlighting key facts or news"]
}

--- Official Website Content ---
${siteContent.slice(0, 8000)}

--- Wikipedia Content ---
${wikipediaContent.slice(0, 8000)}

--- Recent News ---
${newsContent.slice(0, 4000)}
`;

  const raw = await runLLM(prompt);

  try {
    const jsonStr = raw.slice(raw.indexOf("{"), raw.lastIndexOf("}") + 1);
    const data = JSON.parse(jsonStr);

    return {
      summary: data.summary || "",
      companyDomain: data.companyDomain || "",
      employeeSize: data.employeeSize || "",
      companyLocations: data.companyLocations || [],
      topInsights: data.topInsights || [],
    };
  } catch (err) {
    console.warn("⚠️ Failed to parse JSON from LLM:", raw);
    return {
      summary: raw || "",
      companyDomain: "",
      employeeSize: "",
      companyLocations: [],
      topInsights: [],
    };
  }
}

const researchCompany = async (req, res) => {
  const { company } = req.body;
  if (!company) return res.status(400).json({ error: "Company name required" });

  try {
    const ONE_DAY = 24 * 60 * 60 * 1000;

    const cached = await CompanyResearch.findOne({ company: new RegExp(`^${company}$`, "i") });
    if (cached && Date.now() - cached.lastUpdated.getTime() < ONE_DAY) {
      console.log("✅ Returning cached result for", company);
      return res.status(200).json(cached);
    }

    console.log(`🔍 Researching company: ${company}`);

    const websiteUrl = await getOfficialWebsite(company);
    // console.log("🌐 Official Website:", websiteUrl);
    const wikipediaUrl = await getOfficialWebsite(`Wikipedia:${company}`);
    // console.log("🌐 Wikipedia Website:", wikipediaUrl);
    const siteContent = await scrapeWebsite(websiteUrl);
    const wikipediaContent = await scrapeWebsite(wikipediaUrl);
    // console.log(wikipediaContent);
    const news = await fetchCompanyNews(company);
    const newsContent = Array.isArray(news)
      ? news.map((n) => `${n.title} (${n.pubDate}) - ${n.link}`).join("\n")
      : "";

    const extracted = await summarizeAndExtract(company, siteContent, wikipediaContent, newsContent);

    const topNews = Array.isArray(news) ? news.slice(0, 3) : [];

    const updated = await CompanyResearch.findOneAndUpdate(
      { company },
      {
        company,
        websiteUrl,
        websiteText: siteContent,
        news,
        summary: extracted.summary,
        topNews,
        companyDomain: extracted.companyDomain,
        employeeSize: extracted.employeeSize,
        companyLocations: extracted.companyLocations,
        lastUpdated: new Date(),
      },
      { upsert: true, new: true }
    );

    return res.status(200).json({
      company,
      officialWebsite: websiteUrl,
      news,
      websiteText: siteContent,
      summary: extracted.summary,
      topNews,
      companyDomain: extracted.companyDomain,
      employeeSize: extracted.employeeSize,
      companyLocations: extracted.companyLocations,
      topInsights: extracted.topInsights,
      cached: false,
    });
  } catch (err) {
    console.error("❌ Error in researchCompany:", err);
    return res.status(500).json({ error: "Research failed" });
  }
};

module.exports = { researchCompany };
