const express = require('express');
const router = express.Router();
const stats_operations = require('../../utils/stats_operations');

router.get('/', function(req, res) {
  const currentStats = stats_operations.getStats();
  console.log("em ./routes/stats.js");
  res.json(currentStats);
});

router.use((req, res, next) => {
  const method = req.method.toLowerCase();
  if (['post', 'put', 'patch', 'delete'].includes(method)) {
    stats_operations.updateStats(method);
  }
  next();
});

module.exports = router;
