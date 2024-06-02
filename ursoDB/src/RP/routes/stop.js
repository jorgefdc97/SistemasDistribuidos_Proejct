const express = require('express');
const router = express.Router();
const forever = require('forever');
const axios = require('axios');
const fs = require('fs');
const path = require('path');
const logger = require('../../logger'); // Adjust the path according to your structure
const config = JSON.parse(fs.readFileSync('configure.json', 'utf8'));

// Function to stop the reverse proxy
function stopReverseProxy() {
  return new Promise((resolve, reject) => {
    logger.info('Stopping the reverse proxy...');
    forever.list(false, (err, processes) => {
      if (err) {
        logger.error('Error listing processes:', err);
        return reject(err);
      }
      logger.info('Current running processes:', processes);

      // Add detailed logging
      const expectedPath = path.resolve(__dirname, '../reverse_proxy.js');
      logger.info(`Expected path: ${expectedPath}`);

      const process = processes.find(proc => {
        const procPath = path.resolve(proc.file);
        logger.info(`Comparing process path: ${procPath}`);
        return procPath === expectedPath;
      });

      if (process) {
        logger.info('Found process to stop:', process);
        forever.stop(process.uid).on('stop', () => {
          logger.info('Reverse proxy has been stopped.');
          resolve();
        }).on('error', (err) => {
          logger.error('Error stopping the reverse proxy:', err.message);
          reject(err);
        });
      } else {
        logger.info('No matching process found to stop.');
        resolve();
      }
    });
  });
}

// Function to stop all data nodes
async function stopDataNodes() {
  logger.info('Initiating shutdown of all data nodes...');
  
  // Get data node stop URLs from configuration
  const dataNodes = config.DNs.flatMap(dn => dn.servers.map(server => `http://${server.host}:${server.port}/data-node/stop`));

  try {
    const stopPromises = dataNodes.map(url => axios.post(url));
    await Promise.all(stopPromises);
    logger.info('All data nodes have been instructed to stop.');
  } catch (error) {
    logger.error('Error stopping data nodes:', error.message);
    throw error;
  }
}

// Function to stop both reverse proxy and data nodes
async function stopAll() {
  try {
    await stopReverseProxy();
    await stopDataNodes();
    process.exit(0); // Exit the process after stopping everything
  } catch (error) {
    logger.error('Error during shutdown process:', error.message);
    process.exit(1); // Exit with error code
  }
}

router.post('/', (req, res) => {
  try {
    logger.info('Received request to stop the reverse proxy and all nodes');
    res.json({ success: true, message: 'Stopping the reverse proxy and all nodes' });

    // Call the stopAll function after sending the response
    stopAll();
  } catch (error) {
    logger.error('Error stopping the reverse proxy and all nodes:', error.message);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

module.exports = router;
