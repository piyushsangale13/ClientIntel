const { AzureOpenAI } = require('openai');
const TokenUsage = require('../models/TokenUsage');
require('dotenv').config();

const openai = new AzureOpenAI({
  apiKey: process.env.OPEN_AI_API_KEY,
  endpoint: process.env.OPEN_AI_API_ENDPOINT,
  apiVersion: '2025-04-01-preview',
});

let conversationHistory = [];

const getResponse = async (req, res) => {
  const { prompt } = req.body;

  conversationHistory.push({ role: 'user', content: prompt });
  try {
    const result = await openai.chat.completions.create({
      model: 'gpt-5-mini',
      messages: conversationHistory,
    });

    const tokenUsed = result.usage?.total_tokens || 0;
    console.log('Token usage:', tokenUsed);

    let usage = await TokenUsage.findOne();
    if (!usage) {
      usage = new TokenUsage({ totalTokens: tokenUsed });
    } else {
      usage.totalTokens += tokenUsed;
      usage.updatedAt = Date.now();
    }

    await usage.save();

    const botResponse = result.choices[0]?.message?.content || 'No reply';
    conversationHistory.push({ role: 'assistant', content: botResponse });

    res.status(200).json(botResponse);

  } catch (err) {
    console.error('OpenAI error:', err);
    res.status(500).json({ message: 'Error connecting to OpenAI' });
  }
};

module.exports = { getResponse };
