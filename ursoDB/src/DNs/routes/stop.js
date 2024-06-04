const express = require('express');
const router = express.Router();
const forever = require('forever');
const logger = require('../../logger'); 

// Function to stop the data node using Forever
function stopDataNode() {
  return new Promise((resolve, reject) => {
    logger.info('Stopping the data node...');

    // Stop the current process using Forever
    forever.stop().on('stop', () => {
      logger.info('Data node has been stopped.');
      resolve();
    }).on('error', (err) => {
      logger.error('Error stopping the data node:', err.message);
      reject(err);
    });
  });
}

router.post('/', async (req, res) => {
  try {
    logger.info('Received request to stop the data node');
    res.json({ success: true, message: 'Data node is stopping' });

    // Call the stopDataNode function after sending the response
    await stopDataNode();
  } catch (error) {
    logger.error('Error stopping the data node:', error.message);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

module.exports = router;
