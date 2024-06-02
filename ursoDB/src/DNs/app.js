const express = require('express');
const bodyParser = require('body-parser');
const LifeRaft = require('@markwylde/liferaft');
const path = require('path');
const fs = require('fs');
const axios = require('axios');
const WinstonTransport = require('./winstonTransportLayer');
const logger = require('../logger');
const adminRoute = require('./routes/admin');
const dbRoute = require('./routes/db');
const electionRoute = require('./routes/election');
const maintenanceRoute = require('./routes/maintenance');
const statsRoute = require('./routes/stats');
const statusRoute = require('./routes/status');
const stopRoute = require('./routes/stop');
const indexRoute = require('./routes/index');

const app = express();
app.use(bodyParser.json());

// Load configuration
const configPath = path.resolve(__dirname, '../configure.json');
const config = JSON.parse(fs.readFileSync(configPath, 'utf8'));

const nodeId = process.env.NODE_ID || 'node1';
const nodeConfig = config.DNs.flatMap(dn => dn.servers).find(server => server.name === nodeId);

if (!nodeConfig) {
  throw new Error(`Node configuration not found for NODE_ID ${nodeId}`);
}

const port = nodeConfig.port;
const peers = config.DNs.flatMap(dn => dn.servers)
                        .filter(server => server.name !== nodeId)
                        .map(server => `http://localhost:${server.port}/raft`);

// Initialize Raft node
const raft = new LifeRaft({
  address: `tcp://localhost:${port}`,
  'election min': '200 millisecond',
  'election max': '1 second',
  Log: WinstonTransport,
  logger: logger
});

// Join the raft cluster asynchronously
peers.forEach(peer => {
  raft.join(peer, async (packet) => {
    try {
      await axios.post(peer, packet);
      logger.info(`Packet sent to ${peer}: ${JSON.stringify(packet)}`);
    } catch (error) {
      logger.error(`Error sending packet to ${peer}: ${error.message}`);
    }
  });
});

// Log Raft events
raft.on('term change', (term) => {
  logger.info(`Node ${nodeId} - Term changed to ${term}`);
});

raft.on('leader change', (leader) => {
  logger.info(`Node ${nodeId} - Leader changed to ${leader}`);
  if (nodeId === leader) {
    // If this node is the leader, announce it to the RP
    const rpConfig = config.RP;
    axios.get(`http://${rpConfig.host}:${rpConfig.port}/set_master`, {
      params: { leader: nodeId }
    }).catch(error => {
      logger.error('Error announcing leader:', error.message);
    });
  }
});

// Raft endpoint to handle incoming messages
app.post('/raft', (req, res) => {
  raft.emit(req.body.type, req.body, res);
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
  logger.info(`DN server running on port ${port} as ${nodeId}`);
  raft.emit('initialize');
});

module.exports = app;
