const express = require('express');
const router = express.Router();
const kvStore = require('../../utils/kvStore');
const logger = require('../../logger');
const { updateStats } = require('../../utils/stats_operations');
const bodyParser = require('body-parser');

// Create a key-value pair
router.use(bodyParser.json());

// Create a key-value pair
router.post('/c', (req, res) => {
    const { key, value } = req.body;
    const result = kvStore.createKeyValuePair(key, value);
    logger.debug(`Created key-value pair: ${key} - ${JSON.stringify(value)}`);
    res.json(result);
    updateStats('create');
});

// Read the value associated with a key or display all keys
router.get('/r/:key?', (req, res) => {
  const { key } = req.params;

  // If a key is provided, retrieve the value associated with that key
  if (key) {
    const value = kvStore.readValueByKey(key);
    if (value !== null) {
      logger.info(`Read value for key: ${key}`);
      res.json(value);
      updateStats('read');
    } else {
      logger.error(`Key not found: ${key}`);
      res.status(404).send('Key not found');
    }
  } else {
    // If no key is provided, display all keys in the kvStore
    const allKeys = Object.keys(kvStore.store);
    logger.info(`Displaying all keys: ${allKeys}`);
    res.json(allKeys);
  }
});


// Update the value associated with a key
router.put('/u/:key', (req, res) => {
  const { key } = req.params;
  const newValue = req.body;
  const result = kvStore.updateValueByKey(key, newValue);
  if (result !== null) {
    logger.info(`Updated value for key: ${key}`);
    res.json(result);
    updateStats('update');
  } else {
    logger.error(`Key not found: ${key}`);
    res.status(404).send('Key not found');
  }
});

// Delete a key-value pair
router.delete('/d/:key', (req, res) => {
  const { key } = req.params;
  const success = kvStore.deleteKeyValuePair(key);
  if (success) {
    logger.info(`Deleted key-value pair: ${key}`);
    res.send('Key-value pair deleted');
    updateStats('delete');
  } else {
    logger.error(`Key not found: ${key}`);
    res.status(404).send('Key not found');
  }
});

module.exports = router;
