const { nanoid } = require('nanoid');
const ShortURL = require('../models/ShortURL');
const ClickAnalytics = require('../models/ClickAnalytics');

// @desc    Create short URL
// @route   POST /api/urls
// @access  Private
const createShortURL = async (req, res) => {
  try {
    const { originalUrl, customAlias, expiresAt } = req.body;

    // Validate URL
    try {
      new URL(originalUrl);
    } catch (err) {
      return res.status(400).json({ message: 'Invalid URL format' });
    }

    let shortCode;

    // Check if custom alias is provided
    if (customAlias) {
      // Validate custom alias format
      if (!/^[a-zA-Z0-9_-]+$/.test(customAlias)) {
        return res.status(400).json({ 
          message: 'Custom alias can only contain letters, numbers, underscores, and hyphens' 
        });
      }

      if (customAlias.length < 3 || customAlias.length > 20) {
        return res.status(400).json({ 
          message: 'Custom alias must be between 3 and 20 characters' 
        });
      }

      // Check if alias already exists
      const existingAlias = await ShortURL.findOne({ shortCode: customAlias });
      if (existingAlias) {
        return res.status(400).json({ message: 'Custom alias already taken' });
      }

      shortCode = customAlias;
    } else {
      // Generate random short code
      shortCode = nanoid(7);
    }

    const shortUrl = await ShortURL.create({
      user: req.user._id,
      originalUrl,
      shortCode,
      customAlias: customAlias || null,
      expiresAt: expiresAt ? new Date(expiresAt) : null,
    });

    res.status(201).json({
      _id: shortUrl._id,
      originalUrl: shortUrl.originalUrl,
      shortCode: shortUrl.shortCode,
      shortUrl: `${process.env.BACKEND_URL}/${shortUrl.shortCode}`,
      customAlias: shortUrl.customAlias,
      expiresAt: shortUrl.expiresAt,
      clickCount: shortUrl.clickCount,
      status: shortUrl.status,
      createdAt: shortUrl.createdAt,
    });
  } catch (error) {
    console.error('Create short URL error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Get all URLs for user
// @route   GET /api/urls
// @access  Private
const getUserURLs = async (req, res) => {
  try {
    const urls = await ShortURL.find({ user: req.user._id })
      .sort({ createdAt: -1 });

    const formattedUrls = urls.map((url) => ({
      _id: url._id,
      originalUrl: url.originalUrl,
      shortCode: url.shortCode,
      shortUrl: `${process.env.BACKEND_URL}/${url.shortCode}`,
      customAlias: url.customAlias,
      expiresAt: url.expiresAt,
      clickCount: url.clickCount,
      status: url.status,
      createdAt: url.createdAt,
    }));

    res.json(formattedUrls);
  } catch (error) {
    console.error('Get user URLs error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Get single URL
// @route   GET /api/urls/:id
// @access  Private
const getURL = async (req, res) => {
  try {
    const url = await ShortURL.findOne({ 
      _id: req.params.id, 
      user: req.user._id 
    });

    if (!url) {
      return res.status(404).json({ message: 'URL not found' });
    }

    res.json({
      _id: url._id,
      originalUrl: url.originalUrl,
      shortCode: url.shortCode,
      shortUrl: `${process.env.BACKEND_URL}/${url.shortCode}`,
      customAlias: url.customAlias,
      expiresAt: url.expiresAt,
      clickCount: url.clickCount,
      status: url.status,
      createdAt: url.createdAt,
    });
  } catch (error) {
    console.error('Get URL error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Delete URL
// @route   DELETE /api/urls/:id
// @access  Private
const deleteURL = async (req, res) => {
  try {
    const url = await ShortURL.findOne({ 
      _id: req.params.id, 
      user: req.user._id 
    });

    if (!url) {
      return res.status(404).json({ message: 'URL not found' });
    }

    // Delete associated analytics
    await ClickAnalytics.deleteMany({ shortUrl: url._id });

    await url.deleteOne();

    res.json({ message: 'URL deleted successfully' });
  } catch (error) {
    console.error('Delete URL error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Redirect to original URL
// @route   GET /:shortCode
// @access  Public
const redirectToURL = async (req, res) => {
  try {
    const { shortCode } = req.params;

    const url = await ShortURL.findOne({ shortCode });

    if (!url) {
      return res.status(404).send(`
        <!DOCTYPE html>
        <html>
          <head>
            <title>Link Not Found</title>
            <style>
              body { font-family: system-ui; display: flex; justify-content: center; align-items: center; height: 100vh; margin: 0; background: #f0f9ff; }
              .container { text-align: center; padding: 40px; background: white; border-radius: 12px; box-shadow: 0 4px 6px rgba(0,0,0,0.1); }
              h1 { color: #0ea5e9; }
              p { color: #64748b; }
            </style>
          </head>
          <body>
            <div class="container">
              <h1>Link Not Found</h1>
              <p>The short link you're looking for doesn't exist.</p>
            </div>
          </body>
        </html>
      `);
    }

    // Check if link is expired
    if (url.isExpired()) {
      return res.status(410).send(`
        <!DOCTYPE html>
        <html>
          <head>
            <title>Link Expired</title>
            <style>
              body { font-family: system-ui; display: flex; justify-content: center; align-items: center; height: 100vh; margin: 0; background: #f0f9ff; }
              .container { text-align: center; padding: 40px; background: white; border-radius: 12px; box-shadow: 0 4px 6px rgba(0,0,0,0.1); }
              h1 { color: #0ea5e9; }
              p { color: #64748b; }
            </style>
          </head>
          <body>
            <div class="container">
              <h1>Link Expired</h1>
              <p>This short link has expired and is no longer available.</p>
            </div>
          </body>
        </html>
      `);
    }

    // Unique device tracking via 1-hour cookie
    const cookieName = `visited_${shortCode}`;
    const alreadyVisited = req.cookies && req.cookies[cookieName];

    if (!alreadyVisited) {
      // Track click only if no cookie exists
      await ClickAnalytics.create({
        shortUrl: url._id,
        referrer: req.get('Referrer') || 'Direct',
        userAgent: req.get('User-Agent') || '',
        ipAddress: req.ip || req.connection.remoteAddress || '',
      });

      // Increment click count
      url.clickCount += 1;
      await url.save();

      // Set 1-hour cookie to prevent duplicate counting
      res.cookie(cookieName, '1', {
        maxAge: 60 * 60 * 1000, // 1 hour
        httpOnly: true,
        sameSite: 'lax',
      });
    }

    // Always redirect regardless of cookie
    res.redirect(url.originalUrl);
  } catch (error) {
    console.error('Redirect error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

module.exports = {
  createShortURL,
  getUserURLs,
  getURL,
  deleteURL,
  redirectToURL,
};
