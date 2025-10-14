const express = require('express');
const { getResponse } = require('../controllers/getResponseController');

const router = express.Router();
const axios = require('axios');

router.post('/prompt', getResponse);

module.exports = router;