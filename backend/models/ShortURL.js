const mongoose = require('mongoose');

const shortURLSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    originalUrl: {
      type: String,
      required: true,
    },
    shortCode: {
      type: String,
      required: true,
      unique: true,
    },
    customAlias: {
      type: String,
      default: null,
    },
    expiresAt: {
      type: Date,
      default: null,
    },
    clickCount: {
      type: Number,
      default: 0,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  }
);

// Check if link is expired
shortURLSchema.methods.isExpired = function () {
  if (!this.expiresAt) return false;
  return new Date() > this.expiresAt;
};

// Virtual for getting status
shortURLSchema.virtual('status').get(function () {
  if (this.isExpired()) return 'Expired';
  return this.isActive ? 'Active' : 'Inactive';
});

shortURLSchema.set('toJSON', { virtuals: true });

module.exports = mongoose.model('ShortURL', shortURLSchema);
