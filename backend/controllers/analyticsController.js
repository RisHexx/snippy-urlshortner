const ClickAnalytics = require('../models/ClickAnalytics');
const ShortURL = require('../models/ShortURL');

// @desc    Get analytics for a URL
// @route   GET /api/analytics/:urlId
// @access  Private
const getURLAnalytics = async (req, res) => {
  try {
    const { urlId } = req.params;

    // Verify URL belongs to user
    const url = await ShortURL.findOne({ 
      _id: urlId, 
      user: req.user._id 
    });

    if (!url) {
      return res.status(404).json({ message: 'URL not found' });
    }

    // Get clicks grouped by day for last 30 days
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const clicksByDay = await ClickAnalytics.aggregate([
      {
        $match: {
          shortUrl: url._id,
          clickedAt: { $gte: thirtyDaysAgo },
        },
      },
      {
        $group: {
          _id: {
            $dateToString: { format: '%Y-%m-%d', date: '$clickedAt' },
          },
          clicks: { $sum: 1 },
        },
      },
      {
        $sort: { _id: 1 },
      },
    ]);

    // Fill in missing days with 0 clicks
    const filledClicksByDay = [];
    const currentDate = new Date(thirtyDaysAgo);
    const today = new Date();

    while (currentDate <= today) {
      const dateString = currentDate.toISOString().split('T')[0];
      const dayData = clicksByDay.find((d) => d._id === dateString);
      
      filledClicksByDay.push({
        date: dateString,
        clicks: dayData ? dayData.clicks : 0,
      });

      currentDate.setDate(currentDate.getDate() + 1);
    }

    // Get total clicks
    const totalClicks = await ClickAnalytics.countDocuments({ shortUrl: url._id });

    // Get recent clicks (last 10)
    const recentClicks = await ClickAnalytics.find({ shortUrl: url._id })
      .sort({ clickedAt: -1 })
      .limit(10)
      .select('clickedAt referrer');

    res.json({
      urlInfo: {
        _id: url._id,
        originalUrl: url.originalUrl,
        shortCode: url.shortCode,
        shortUrl: `${process.env.BACKEND_URL}/${url.shortCode}`,
        createdAt: url.createdAt,
      },
      totalClicks,
      clicksByDay: filledClicksByDay,
      recentClicks,
    });
  } catch (error) {
    console.error('Get analytics error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

module.exports = {
  getURLAnalytics,
};
