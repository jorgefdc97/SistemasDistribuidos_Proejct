var express = require('express');
var router = express.Router();
const axios = require('axios');
const logger = require('../../logger'); // Adjust the path to your logger

// Define data node master endpoints
const dataNodeMasters = [
  'http://localhost:3010', // dn00
  'http://localhost:3020', // dn01
  'http://localhost:3030', // dn02
  'http://localhost:3040'  // dn03
];

/* GET status listing. */
router.get('/:id?', async (req, res) => {
  try {
    logger.info('Fetching system status from all data node masters');

    const statusPromises = dataNodeMasters.map(async (dataNode) => {
      try {
        // Send HTTP request to each data node master's status route
        const response = await axios.get(`${dataNode}/status`);
        logger.info(`Status from ${dataNode} received: ${JSON.stringify(response.data)}`);
        return response.data; // Assuming data node status is returned in JSON format
      } catch (error) {
        logger.error(`Error fetching status from ${dataNode}: ${error.message}`);
        throw error;
      }
    });

    // Wait for all requests to complete
    const statuses = await Promise.all(statusPromises);

    // Aggregate system status
    const systemStatus = {
      dataNodeStatuses: statuses,
      startTime: '',
      uptime: ''
    };

    res.json(systemStatus);
  } catch (error) {
    logger.error('Error fetching system status:', error.message);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

module.exports = router;
