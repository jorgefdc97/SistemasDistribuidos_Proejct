const express = require('express');
const router = express.Router();
const logger = require('../../logger'); 

let currentMaster = null;

router.post('/', (req, res) => {
  const { masterId } = req.body;

  if (!masterId) {
    logger.error('Master ID is required');
    return res.status(400).json({ error: 'Master ID is required' });
  }

  currentMaster = masterId;
  logger.info(`Node ${masterId} is now registered as MASTER.`);

  res.json({ success: true, message: `Node ${masterId} is now registered as MASTER.` });
});

module.exports = router;
