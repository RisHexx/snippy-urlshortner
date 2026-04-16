const express = require('express');
const {
  createShortURL,
  getUserURLs,
  getURL,
  deleteURL,
} = require('../controllers/urlController');
const { protect } = require('../middleware/auth');
const { createUrlLimiter, apiLimiter } = require('../middleware/rateLimit');

const router = express.Router();

router.route('/')
  .post(protect, createUrlLimiter, createShortURL)
  .get(protect, apiLimiter, getUserURLs);

router.route('/:id')
  .get(protect, apiLimiter, getURL)
  .delete(protect, apiLimiter, deleteURL);

module.exports = router;
