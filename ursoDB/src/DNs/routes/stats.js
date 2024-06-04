const express = require('express');
const router = express.Router();
const { getStats, updateStats } = require('../../utils/stats_operations');

router.get('/', function(req, res) {
  const currentStats = getStats();
  console.log("em ./routes/stats.js");
  res.json(currentStats);
});

router.use((req, res, next) => {
  const method = req.method.toLowerCase();
  if (['post', 'put', 'patch', 'delete'].includes(method)) {
    updateStats(method);
  }
  next();
});

module.exports = router;
