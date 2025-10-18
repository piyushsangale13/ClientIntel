// models/CompanyResearch.js
const mongoose = require("mongoose");

const newsSchema = new mongoose.Schema({
  title: String,
  link: String,
  pubDate: String,
});

const companyResearchSchema = new mongoose.Schema({
  company: { type: String, required: true, unique: true },
  websiteUrl: { type: String },
  websiteText: { type: String }, // scraped content (optional to store)
  summary: { type: String }, // GPT summary
  news: [newsSchema], // all fetched news
  topNews: [newsSchema], // top 3 news
  companyDomain: { type: String }, // e.g. software, pharma, etc.
  employeeSize: { type: String }, // e.g. 100-500, 10k+, etc.
  companyLocations: [{ type: String }], // e.g. ["San Francisco, USA"]
  lastUpdated: { type: Date, default: Date.now },
});

module.exports = mongoose.model("CompanyResearch", companyResearchSchema);
