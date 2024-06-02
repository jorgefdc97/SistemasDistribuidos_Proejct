// DNs/app.js
const express = require('express');
const bodyParser = require('body-parser');
const LifeRaft = require('liferaft');
const winston = require('winston');
const WinstonTransport = require('./winstonTransportLayer');

const app = express();
app.use(bodyParser.json());

const nodeId = process.env.NODE_ID || 'node1';
const port = process.env.PORT || 3000;
const peers = process.env.PEERS ? process.env.PEERS.split(',') : [];

// Initialize Winston Logger
const logger = winston.createLogger({
  level: 'info',
  format: winston.format.json(),
  transports: [
    new winston.transports.Console(),
    new winston.transports.File({ filename: 'combined.log' })
  ]
});

// Initialize Raft node
const raft = new LifeRaft({
  'address': `tcp://localhost:${port}`,
  'election min': '200 millisecond',
  'election max': '1 second',
  adapter: WinstonTransport,
  path: './db/log1',
  logger: logger
});

raft.start();

// Log Raft events
raft.on('term change', (term) => {
  logger.info(`Node ${nodeId} - Term changed to ${term}`);
});

raft.on('leader change', (leader) => {
  logger.info(`Node ${nodeId} - Leader changed to ${leader}`);
  if (nodeId === leader) {
    // If this node is the leader, announce it to the RP
    axios.get('http://rp-server-ip/set_master', {
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

// Import routes
const statusRoute = require('./routes/status');
const statsRoute = require('./routes/stats');
const adminRoute = require('./routes/admin');
const dbRoute = require('./routes/db');
const electionRoute = require('./routes/election');
const maintenanceRoute = require('./routes/maintenance');
const stopRoute = require('./routes/stop');

app.use('/status', statusRoute);
app.use('/stats', statsRoute);
app.use('/admin', adminRoute);
app.use('/db', dbRoute);
app.use('/election', electionRoute);
app.use('/maintenance', maintenanceRoute);
app.use('/stop', stopRoute);

// Start the server
app.listen(port, () => {
  logger.info(`DN server running on port ${port} as ${nodeId}`);
});
