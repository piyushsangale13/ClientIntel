const { AzureOpenAI } = require('openai');
require('dotenv').config();

const openai = new AzureOpenAI({
  apiKey: process.env.OPEN_AI_API_KEY,
  endpoint: process.env.OPEN_AI_API_ENDPOINT,
  apiVersion: '2025-04-01-preview',
});

module.exports = {openai};
