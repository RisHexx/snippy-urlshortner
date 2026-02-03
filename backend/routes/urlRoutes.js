const express = require('express');
const {
  createShortURL,
  getUserURLs,
  getURL,
  deleteURL,
} = require('../controllers/urlController');
const { protect } = require('../middleware/auth');

const router = express.Router();

router.route('/')
  .post(protect, createShortURL)
  .get(protect, getUserURLs);

router.route('/:id')
  .get(protect, getURL)
  .delete(protect, deleteURL);

module.exports = router;
