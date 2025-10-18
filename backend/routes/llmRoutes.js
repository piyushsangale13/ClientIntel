const express = require('express');
const { getResponse } = require('../controllers/getResponseController');
const TokenUsage = require('../models/TokenUsage');

const router = express.Router();
const axios = require('axios');
const {researchCompany} = require('../controllers/researchController');

router.post('/prompt', getResponse);

router.post("/company", researchCompany);

router.get('/token_count', async (req, res) => {
  try {
    const usage = await TokenUsage.findOne();
    res.status(200).json(usage || { totalTokens: 0 });
  } catch (err) {
    res.status(500).json({ error: 'Error fetching token usage' });
  }
});

module.exports = router;