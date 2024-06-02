const express = require('express');
const logger = require('../logger');
const db = require('./routes/db');

const app = express();
const port = config.DNs[0].servers[0].port;  // Adjust index as needed

app.use(express.json());
const LifeRaft = require('@markwylde/liferaft');
const adminRoute = require('./routes/admin');
const dbRoute = require('./routes/db');
const electionRoute = require('./routes/election');
const maintenanceRoute = require('./routes/maintenance');
const statsRoute = require('./routes/stats');
const statusRoute = require('./routes/status');
const stopRoute = require('./routes/stop');
const indexRoute = require('./routes/index');

class WinstonTransport {
  constructor(options) {
    this.logger = options.logger;
  }

  append(entry) {
    this.logger.info(entry);
  }
}
// Raft Configuration
raft = new LifeRaft({
  'address': `tcp://localhost:${port}`,
  'election min': '200 millisecond',
  'election max': '1 second',
  adapter: WinstonTransport,
  path: './db/log1',
  logger: logger
});

app.use('/', indexRoute);
app.use('/admin', adminRoute);
app.use('/db', dbRoute);
app.use('/election', electionRoute);
app.use('/maintenance', maintenanceRoute);
app.use('/stats', statsRoute);
app.use('/status', statusRoute);
app.use('/stop', stopRoute);

// Create a key-value pair
app.post('/db/c', (req, res) => {
  const { key, value } = req.body;
  const result = db.createKeyValuePair(key, value);
  logger.info(`Created key-value pair: ${key} - ${JSON.stringify(value)}`);
  res.json(result);
});

// Read the value associated with a key
app.get('/db/r/:key', (req, res) => {
  const { key } = req.params;
  const value = db.readValueByKey(key);
  if (value !== null) {
    logger.info(`Read value for key: ${key}`);
    res.json(value);
  } else {
    logger.error(`Key not found: ${key}`);
    res.status(404).send('Key not found');
  }
});

// Update the value associated with a key
app.put('/db/u/:key', (req, res) => {
  const { key } = req.params;
  const newValue = req.body;
  const result = db.updateValueByKey(key, newValue);
  if (result !== null) {
    logger.info(`Updated value for key: ${key}`);
    res.json(result);
  } else {
    logger.error(`Key not found: ${key}`);
    res.status(404).send('Key not found');
  }
});

// Delete a key-value pair
app.delete('/db/d/:key', (req, res) => {
  const { key } = req.params;
  const success = db.deleteKeyValuePair(key);
  if (success) {
    logger.info(`Deleted key-value pair: ${key}`);
    res.send('Key-value pair deleted');
  } else {
    logger.error(`Key not found: ${key}`);
    res.status(404).send('Key not found');
  }
});

// Start the server
app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});

module.exports = app;
