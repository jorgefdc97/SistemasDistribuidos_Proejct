const express = require('express');
const router = express.Router();
const fs = require('fs');
const logger = require('../../logger');

// Route handler for setting the master node
router.post('/', (req, res) => {
  try {
    const { nodeId } = req.body; // Assuming the request body contains the ID of the new master node
    const configFilePath = '../etc/manel.json'; // Adjust the file path as needed
    const config = JSON.parse(fs.readFileSync(configFilePath, 'utf8'));
    
    // Find the node with the specified ID
    const node = config.DNs.find(node => node.id === nodeId);

    if (!node) {
      throw new Error(`Node with ID ${nodeId} not found.`);
    }

    // Update the master node ID in the configuration
    config.master_id = nodeId;

    // Write the updated configuration back to the file
    fs.writeFileSync(configFilePath, JSON.stringify(config, null, 2), 'utf8');

    logger.info(`Master node set to node ID ${nodeId}`);

    res.json({ success: true, message: `Master node set to node ID ${nodeId}` });
  } catch (error) {
    logger.error(`Error setting master node: ${error.message}`);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

module.exports = router;

