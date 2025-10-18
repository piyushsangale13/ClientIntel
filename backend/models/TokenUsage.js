const mongoose = require('mongoose');

const tokenUsageSchema = new mongoose.Schema({
  totalTokens: {
    type: Number,
    required: true,
    default: 0,
  },
  updatedAt: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model('TokenUsage', tokenUsageSchema);
