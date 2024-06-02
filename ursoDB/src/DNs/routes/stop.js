const express = require('express');
const router = express.Router();
const logger = require('../../logger'); // Adjust the path according to your structure

// Simulated example cleanup functions
function closeDatabaseConnections() {
  return new Promise((resolve) => {
    logger.info('Closing database connections...');
    // Simulate async operation with setTimeout
    setTimeout(() => {
      logger.info('Database connections closed.');
      resolve();
    }, 500);
  });
}

function stopBackgroundTasks() {
  return new Promise((resolve) => {
    logger.info('Stopping background tasks...');
    // Simulate async operation with setTimeout
    setTimeout(() => {
      logger.info('Background tasks stopped.');
      resolve();
    }, 500);
  });
}

function flushLogs() {
  return new Promise((resolve) => {
    logger.info('Flushing logs...');
    // Simulate async operation with setTimeout
    setTimeout(() => {
      logger.info('Logs flushed.');
      resolve();
    }, 500);
  });
}

// Function to stop the node gracefully
async function stopNode() {
  logger.info('Initiating graceful shutdown...');

  try {
    await closeDatabaseConnections();
    await stopBackgroundTasks();
    await flushLogs();
    logger.info('Cleanup completed. Stopping the node.');
    process.exit(0); // Exit the process after cleanup
  } catch (error) {
    logger.error('Error during cleanup:', error.message);
    process.exit(1); // Exit with error code
  }
}

router.post('/', (req, res) => {
  try {
    logger.info('Received request to stop the node');
    res.json({ success: true, message: 'Node is stopping' });

    // Call the stopNode function after sending the response
    stopNode();
  } catch (error) {
    logger.error('Error stopping the node:', error.message);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

module.exports = router;
