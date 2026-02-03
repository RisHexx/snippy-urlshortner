const mongoose = require('mongoose');

const clickAnalyticsSchema = new mongoose.Schema(
  {
    shortUrl: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'ShortURL',
      required: true,
    },
    clickedAt: {
      type: Date,
      default: Date.now,
    },
    referrer: {
      type: String,
      default: 'Direct',
    },
    userAgent: {
      type: String,
      default: '',
    },
    ipAddress: {
      type: String,
      default: '',
    },
  },
  {
    timestamps: true,
  }
);

// Index for faster queries
clickAnalyticsSchema.index({ shortUrl: 1, clickedAt: -1 });

module.exports = mongoose.model('ClickAnalytics', clickAnalyticsSchema);
