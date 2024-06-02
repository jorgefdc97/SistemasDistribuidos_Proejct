var express = require('express');
var router = express.Router();
const axios = require('axios');

// Define data node servers endpoints
const dataNodes = ['dn00', 'dn01', 'dn02', 'dn03']; // Example data node server endpoints

router.post('/', async (req, res) => {
  try {
    const updatePromises = dataNodes.map(async (dataNode) => {
      // Send HTTP request to each data node server's maintenance endpoint
      const response = await axios.post(`http://${dataNode}/maintenance`, req.body);
      return response.data; // Assuming response indicates success or failure
    });

    // Wait for all update requests to complete
    await Promise.all(updatePromises);

    res.json({ success: true, message: 'Maintenance actions completed successfully.' });
  } catch (error) {
    console.error('Error performing maintenance:', error.message);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

module.exports = router;