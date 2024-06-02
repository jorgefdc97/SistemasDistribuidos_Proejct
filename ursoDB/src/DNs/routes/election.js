const express = require('express');
const router = express.Router();
const Liferaft = require('@markwylde/liferaft');
const axios = require('axios');
const logger = require('../../logger'); // Adjust the path according to your structure

// URL of reverse proxy where /set_master is hosted
const reverseProxyUrl = 'http://localhost:3000'; // Replace with actual URL

// Configure the Raft node
const raftNode = new Liferaft({
  id: 'dataNode', // Unique ID for the node
  peers: ['dn01', 'dn02', 'dn03'], // List of peer nodes
  electionTimeout: 1000 + Math.floor(Math.random() * 1000), // Election timeout in ms
  heartbeatInterval: 500 // Heartbeat interval in ms
});

// Handle election events
raftNode.on('elected', async () => {
  logger.info(`Node ${raftNode.id} was elected as leader`);

  try {
    // Call /set_master route on reverse proxy
    const response = await axios.post(`${reverseProxyUrl}/set_master`, {
      masterId: raftNode.id
    });
    logger.info(response.data);
  } catch (error) {
    logger.error('Error setting master:', error.message);
  }
});

router.post('/', (req, res) => {
  raftNode.start();
  logger.info('Election started');
  res.json({ success: true, message: 'Election started' });
});

module.exports = router;
