const express = require('express');
const { getURLAnalytics } = require('../controllers/analyticsController');
const { protect } = require('../middleware/auth');

const router = express.Router();

router.get('/:urlId', protect, getURLAnalytics);

module.exports = router;
