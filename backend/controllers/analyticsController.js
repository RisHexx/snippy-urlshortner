const ClickAnalytics = require('../models/ClickAnalytics');
const ShortURL = require('../models/ShortURL');
const { getCache, setCache } = require('../config/redis');

// @desc    Get analytics for a URL
// @route   GET /api/analytics/:urlId
// @access  Private
const getURLAnalytics = async (req, res) => {
  try {
    const { urlId } = req.params;

    // Check Redis cache first (TTL: 2 min — short for freshness)
    const cacheKey = `analytics:${urlId}`;
    const cached = await getCache(cacheKey);
    if (cached) {
      return res.json(cached);
    }

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

    // --- Enhanced Analytics ---

    // Referrer breakdown
    const referrerBreakdown = await ClickAnalytics.aggregate([
      { $match: { shortUrl: url._id } },
      { $group: { _id: '$referrer', count: { $sum: 1 } } },
      { $sort: { count: -1 } },
      { $limit: 8 },
    ]);

    // Device breakdown (parsed from User-Agent)
    const allClicks = await ClickAnalytics.find({ shortUrl: url._id }).select('userAgent');
    const deviceCounts = { Desktop: 0, Mobile: 0, Tablet: 0 };
    allClicks.forEach((click) => {
      const ua = (click.userAgent || '').toLowerCase();
      if (/tablet|ipad/i.test(ua)) {
        deviceCounts.Tablet++;
      } else if (/mobile|android|iphone/i.test(ua)) {
        deviceCounts.Mobile++;
      } else {
        deviceCounts.Desktop++;
      }
    });

    // Hourly traffic distribution (0-23)
    const hourlyRaw = await ClickAnalytics.aggregate([
      { $match: { shortUrl: url._id } },
      { $group: { _id: { $hour: '$clickedAt' }, clicks: { $sum: 1 } } },
      { $sort: { _id: 1 } },
    ]);

    // Fill all 24 hours
    const hourlyDistribution = [];
    for (let h = 0; h < 24; h++) {
      const found = hourlyRaw.find((d) => d._id === h);
      hourlyDistribution.push({ hour: h, clicks: found ? found.clicks : 0 });
    }

    // Weekly comparison: this week vs last week
    const now = new Date();
    const dayOfWeek = now.getDay(); // 0=Sun
    const thisWeekStart = new Date(now);
    thisWeekStart.setDate(now.getDate() - dayOfWeek);
    thisWeekStart.setHours(0, 0, 0, 0);

    const lastWeekStart = new Date(thisWeekStart);
    lastWeekStart.setDate(lastWeekStart.getDate() - 7);
    const lastWeekEnd = new Date(thisWeekStart);

    const thisWeekClicks = await ClickAnalytics.aggregate([
      { $match: { shortUrl: url._id, clickedAt: { $gte: thisWeekStart } } },
      { $group: { _id: { $dayOfWeek: '$clickedAt' }, clicks: { $sum: 1 } } },
      { $sort: { _id: 1 } },
    ]);

    const lastWeekClicks = await ClickAnalytics.aggregate([
      { $match: { shortUrl: url._id, clickedAt: { $gte: lastWeekStart, $lt: lastWeekEnd } } },
      { $group: { _id: { $dayOfWeek: '$clickedAt' }, clicks: { $sum: 1 } } },
      { $sort: { _id: 1 } },
    ]);

    const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    const weeklyComparison = dayNames.map((name, index) => {
      const mongoDay = index + 1; // MongoDB: 1=Sun, 7=Sat
      const thisW = thisWeekClicks.find((d) => d._id === mongoDay);
      const lastW = lastWeekClicks.find((d) => d._id === mongoDay);
      return {
        day: name,
        thisWeek: thisW ? thisW.clicks : 0,
        lastWeek: lastW ? lastW.clicks : 0,
      };
    });

    const responseData = {
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
      referrerBreakdown,
      deviceBreakdown: deviceCounts,
      hourlyDistribution,
      weeklyComparison,
    };

    // Cache for 2 minutes
    await setCache(cacheKey, responseData, 120);

    res.json(responseData);
  } catch (error) {
    console.error('Get analytics error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

module.exports = {
  getURLAnalytics,
};
