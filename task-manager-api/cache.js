const NodeCache = require("node-cache");

// In-Memory cache for Practical 9 (Caching & Query Optimization)
const cache = new NodeCache({
  stdTTL: 60, // 60 seconds cache retention
  checkperiod: 120 // Automatic sweep interval
});

module.exports = cache;
