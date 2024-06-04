const { exec } = require('child_process');
const express = require('express');
const axios = require('axios');
const logger = require('../logger');
const fs = require('fs');
const path = require('path');

// Load configuration
const configPath = path.resolve(__dirname, '../../etc/manel.json');
const config = JSON.parse(fs.readFileSync(configPath, 'utf8'));

const app = express();
const port = config.RP.port;

app.use(express.json());

// Import routes
var adminRoute = require('./routes/admin');
var dbRoute = require('./routes/db');
var setMasterRoute = require('./routes/set_master');
var statsRoute = require('./routes/stats');
var statusRoute = require('./routes/status');
var stopRoute = require('./routes/stop');

// Use routes
app.use('/admin', adminRoute);
app.use('/db', dbRoute);
app.use('/set_master', setMasterRoute);
app.use('/stats', statsRoute);
app.use('/status', statusRoute);
app.use('/stop', stopRoute);

// Ensure the logs directory exists
const logsDir = path.resolve(__dirname, '../logs');
if (!fs.existsSync(logsDir)) {
  fs.mkdirSync(logsDir);
}

// Initialize servers from configure.json
let servers = {};
config.DNs.forEach((dn, dnIndex) => {
  dn.servers.forEach((server, serverIndex) => {
    const serverId = `dn${dnIndex}s${serverIndex}`;
    servers[serverId] = {
      id: serverId,
      host: `http://${server.host}:${server.port}`,
      usage: 0
    };
  });
});

// Start all nodes using forever
const startNodes = () => {
  config.DNs.forEach(dn => {
    dn.servers.forEach(server => {
      const command = `forever start -a -l "logs/${server.name}.log" -o "logs/${server.name}.out" -e "logs/${server.name}.err" --minUptime 1000 --spinSleepTime 1000 -c "node" DNs/app.js`;
      exec(command, { env: { NODE_ID: server.name } }, (err, stdout, stderr) => {
        if (err) {
          logger.error(`Error starting node ${server.name}: ${err.message}`);
          return;
        }
        if (stderr) {
          logger.error(`Error output for node ${server.name}: ${stderr}`);
        }
        logger.info(`Node ${server.name} started successfully.`);
      });
    });
  });
};

// Start nodes when the proxy starts
startNodes();

// Proxy function to redirect requests
const proxy = (url) => {
  return async (req, res) => {
    try {
      const response = await axios({
        method: req.method,
        url: `${url}${req.url}`,
        data: req.body,
        headers: req.headers
      });
      res.json(response.data);
    } catch (error) {
      logger.error(`Error forwarding request to ${url}: ${error.message}`);
      res.status(500).send('Internal server error');
    }
  };
};

// Function to redirect requests based on server ID
function re_direct(req, res, next) {
  const id = req.query.id;

  logger.info(`Redirecting to server ID: ${id} for URL: ${req.url}`);

  const server = servers[id];

  if (!server) {
    return next({ error: "wrong server id" });
  } else {
    server.usage++;
    proxy(server.host)(req, res, next);
  }
}

app.get('/', (req, res) => {
  res.send(`
  <head>
    <title>Express</title>
  </head>
  <body>
    <h1>Express</h1>
    <p>Welcome to Express</p>
  </body>
</html>`);
});

app.use('/api', re_direct);

// Status route to return stats
app.use('/stat', (req, res) => {
  const serversArray = Object.values(servers);
  const livingTimeInSecs = Math.round((Date.now() - start_at.getTime()) * 0.001);
  const stats = serversArray.map(server => ({
    id: server.id,
    host: server.host,
    usage: server.usage
  }));

  console.table(stats);

  res.status(200).send({
    success: true,
    start_at: start_at.toISOString(),
    now: (new Date()).toISOString(),
    living_time_in_secs: livingTimeInSecs,
    stats
  });
});

const start_at = new Date();
app.listen(port, () => {
  logger.info(`Reverse proxy server running on port ${port}`);
});

module.exports = app;
