const ClickAnalytics = require('../models/ClickAnalytics');
const ShortURL = require('../models/ShortURL');

// @desc    Get AI insights for a URL
// @route   GET /api/insights/:urlId
// @access  Private
const getAIInsights = async (req, res) => {
  try {
    const { urlId } = req.params;

    // Verify URL belongs to user
    const url = await ShortURL.findOne({
      _id: urlId,
      user: req.user._id,
    });

    if (!url) {
      return res.status(404).json({ message: 'URL not found' });
    }

    // Gather analytics data for the AI prompt
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    const totalClicks = await ClickAnalytics.countDocuments({ shortUrl: url._id });
    const last7DaysClicks = await ClickAnalytics.countDocuments({ shortUrl: url._id, clickedAt: { $gte: sevenDaysAgo } });

    // Clicks by day (last 30 days)
    const clicksByDay = await ClickAnalytics.aggregate([
      { $match: { shortUrl: url._id, clickedAt: { $gte: thirtyDaysAgo } } },
      { $group: { _id: { $dateToString: { format: '%Y-%m-%d', date: '$clickedAt' } }, clicks: { $sum: 1 } } },
      { $sort: { _id: 1 } },
    ]);

    // Referrer breakdown
    const referrerBreakdown = await ClickAnalytics.aggregate([
      { $match: { shortUrl: url._id } },
      { $group: { _id: '$referrer', count: { $sum: 1 } } },
      { $sort: { count: -1 } },
      { $limit: 5 },
    ]);

    // Device breakdown (from User-Agent)
    const allClicks = await ClickAnalytics.find({ shortUrl: url._id }).select('userAgent clickedAt');
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

    // Hourly distribution
    const hourlyData = await ClickAnalytics.aggregate([
      { $match: { shortUrl: url._id } },
      { $group: { _id: { $hour: '$clickedAt' }, clicks: { $sum: 1 } } },
      { $sort: { clicks: -1 } },
    ]);

    // Build concise data summary
    const daysSinceCreated = Math.max(1, Math.ceil((Date.now() - new Date(url.createdAt).getTime()) / (1000 * 60 * 60 * 24)));
    const avgClicksPerDay = (totalClicks / daysSinceCreated).toFixed(1);
    const avgLast7Days = (last7DaysClicks / 7).toFixed(1);

    const topReferrers = referrerBreakdown.map((r) => `${r._id} (${r.count})`).join(', ');
    const deviceSummary = Object.entries(deviceCounts).filter(([, v]) => v > 0).map(([k, v]) => `${k}: ${((v / totalClicks) * 100).toFixed(0)}%`).join(', ');
    const peakHour = hourlyData.length > 0 ? `${hourlyData[0]._id}:00 UTC` : 'N/A';
    const topClickDay = clicksByDay.length > 0 ? clicksByDay.reduce((max, d) => d.clicks > max.clicks ? d : max, clicksByDay[0]) : null;

    // Check trend direction
    const recentDays = clicksByDay.slice(-7);
    const olderDays = clicksByDay.slice(-14, -7);
    const recentAvg = recentDays.length > 0 ? recentDays.reduce((s, d) => s + d.clicks, 0) / recentDays.length : 0;
    const olderAvg = olderDays.length > 0 ? olderDays.reduce((s, d) => s + d.clicks, 0) / olderDays.length : 0;
    const trendDirection = recentAvg > olderAvg ? 'increasing' : recentAvg < olderAvg ? 'decreasing' : 'stable';

    const prompt = `Analyze this URL shortener link data. Be specific with numbers. No filler. Each section: 2 sentences max.

DATA:
- URL: ${url.originalUrl}
- Total clicks: ${totalClicks} over ${daysSinceCreated} days
- Overall avg: ${avgClicksPerDay}/day | Last 7 days avg: ${avgLast7Days}/day
- Trend: ${trendDirection} (recent week vs prior week)
- Best day: ${topClickDay ? `${topClickDay._id} with ${topClickDay.clicks} clicks` : 'N/A'}
- Peak hour: ${peakHour}
- Sources: ${topReferrers || 'No data'}
- Devices: ${deviceSummary || 'No data'}

Respond with EXACTLY this format (use these emoji headers, no markdown formatting):

📊 Performance Summary
[1-2 sentences with specific numbers about overall performance]

📈 Traffic Trends  
[1-2 sentences about growth/decline pattern with numbers]

🌐 Traffic Sources
[1-2 sentences about referrer distribution, name top source with %]

📱 Device Split
[1 sentence about device distribution with percentages]

⏰ Best Times
[1 sentence naming the peak hour and best day]

🎯 Actions
[Exactly 3 short bullet points starting with "•" - specific, actionable tips based on the data]`;

    // Call Groq API
    const groqApiKey = process.env.GROQ_API_KEY;
    if (!groqApiKey) {
      return res.status(500).json({ message: 'Groq API key not configured. Add GROQ_API_KEY to your .env file.' });
    }

    const groqResponse = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${groqApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'llama-3.3-70b-versatile',
        messages: [
          { role: 'system', content: 'You are a data analyst. Give specific, number-backed insights. No fluff. No bold/italic markdown. Plain text only.' },
          { role: 'user', content: prompt },
        ],
        temperature: 0.4,
        max_tokens: 500,
      }),
    });

    if (!groqResponse.ok) {
      const errorData = await groqResponse.text();
      console.error('Groq API error:', errorData);
      return res.status(500).json({ message: 'Failed to generate AI insights. Please try again.' });
    }

    const groqData = await groqResponse.json();
    const insights = groqData.choices?.[0]?.message?.content || 'Unable to generate insights.';

    res.json({
      insights,
      metadata: {
        totalClicks,
        avgClicksPerDay: parseFloat(avgClicksPerDay),
        daysSinceCreated,
        topReferrer: referrerBreakdown[0]?._id || 'N/A',
        dominantDevice: Object.entries(deviceCounts).sort((a, b) => b[1] - a[1])[0]?.[0] || 'N/A',
      },
    });
  } catch (error) {
    console.error('Get AI insights error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

module.exports = { getAIInsights };
