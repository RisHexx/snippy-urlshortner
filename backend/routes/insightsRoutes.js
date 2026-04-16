const express = require('express');
const { getAIInsights } = require('../controllers/insightsController');
const { protect } = require('../middleware/auth');
const { apiLimiter } = require('../middleware/rateLimit');

const router = express.Router();

router.get('/:urlId', protect, apiLimiter, getAIInsights);

module.exports = router;
