const rateLimit = require('express-rate-limit');

// Global limiter - 100 requests per 15 minutes
const globalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  message: { message: 'Too many requests, please try again later.' },
  standardHeaders: true,
  legacyHeaders: false,
});

// URL creation limiter - 10 URLs per 15 minutes
const createUrlLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,
  message: { message: 'Too many URLs created. Please try again later.' },
  standardHeaders: true,
  legacyHeaders: false,
});

// Redirect limiter - 60 requests per minute per IP
const redirectLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 60,
  message: { message: 'Too many redirect requests. Please slow down.' },
  standardHeaders: true,
  legacyHeaders: false,
});

// API limiter - 30 requests per minute
const apiLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 30,
  message: { message: 'Too many API requests. Please try again later.' },
  standardHeaders: true,
  legacyHeaders: false,
});

module.exports = {
  globalLimiter,
  createUrlLimiter,
  redirectLimiter,
  apiLimiter,
};
