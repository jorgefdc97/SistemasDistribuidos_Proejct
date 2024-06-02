const fs = require('fs');
const express = require('express');
const axios = require('axios');
const logger = require('../logger');
const { exec } = require('child_process');

const app = express();
const config = JSON.parse(fs.readFileSync('configure.json', 'utf8'));
const port = config.RP.port;

app.use(express.json());

const adminRoute = require('./routes/admin');
const dbRoute = require('./routes/db');
const setMasterRoute = require('./routes/set_master');
const statsRoute = require('./routes/stats');
const statusRoute = require('./routes/status');
const stopRoute = require('./routes/stop');

app.use('/admin', adminRoute);
app.use('/db', dbRoute);
app.use('/set_master', setMasterRoute);
app.use('/stats', statsRoute);
app.use('/status', statusRoute);
app.use('/stop', stopRoute);

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

    // Start each node using forever
    const env = { NODE_ID: server.name };
    const command = `forever start -c "node" DNs/app.js`;

    const nodeProcess = exec(command, { env: { ...process.env, ...env } }, (error, stdout, stderr) => {
      if (error) {
        logger.error(`[${server.name}] error: ${error.message}`);
        return;
      }
      if (stderr) {
        logger.error(`[${server.name}] stderr: ${stderr}`);
      }
      logger.info(`[${server.name}] stdout: ${stdout}`);
    });

    nodeProcess.on('close', (code) => {
      logger.info(`[${server.name}] process exited with code ${code}`);
    });
  });
});

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
