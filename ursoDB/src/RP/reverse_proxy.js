const fs = require('fs');
const config = JSON.parse(fs.readFileSync('configure.json', 'utf8'));

const express = require('express');
const axios = require('axios');
const logger = require('../logger');

const app = express();
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


/*app.listen(4000, () => {

  request('http://localhost:3000', function (err, res, body) {

	  //if(err) console.log( "err:", err );
	  ////if(res) console.log( "res:", res );
	  //console.log( "body:", body );
    // a -rem in json for comments, but too big
   if(err === null){

        console.log('frontend is reachable from proxy server')

   }
   else{

    console.log('frontend is NOT reachable from proxy server')

   }

  });

});*/
/*
// Synchronous readFile function
function readFile(key, callback) {
  try {
    const data = fs.readFileSync(`${key}.json`, 'utf8');
    callback(null, JSON.parse(data));
  } catch (error) {
    callback(error, null);
  }
}
// Asynchronous readFile function
async function readFileAsync(key, callback) {
  try {
    const data = await new Promise((resolve, reject) => {
      fs.readFile(`${key}.json`, 'utf8', (err, data) => {
        if (err) reject(err);
        else resolve(data);
      });
    });
    callback(null, JSON.parse(data));
  } catch (error) {
    callback(error, null);
  }
}
// Synchronous updateFile function
function updateFile(key, newData, callback) {
  try {
    const data = fs.readFileSync(`${key}.json`, 'utf8');
    const parsedData = JSON.parse(data);
    Object.assign(parsedData, newData);
    fs.writeFileSync(`${key}.json`, JSON.stringify(parsedData));
    callback(null);
  } catch (error) {
    callback(error);
  }
} 
// Asynchronous updateFile function
async function updateFileAsync(key, newData, callback) {
  try {
    const data = await readFileAsync(key);
    Object.assign(data, newData);
    if (newData[key] === '--nil--') {
      delete data[key];
    }
    await writeFileAsync(key, data);
    callback(null);
  } catch (error) {
    callback(error);
  }
}
// Synchronous deleteFile function
function deleteFile(key, callback) {
  try {
    fs.unlinkSync(`${key}.json`);
    callback(null);
  } catch (error) {
    callback(error);
  }
}
// Asynchronous deleteFile
async function deleteFileAsync(key, callback) {
  try {
    await new Promise((resolve, reject) => {
      fs.unlink(`${key}.json`, err => {
        if (err) reject(err);
        else resolve();
      });
    });
    callback(null);
  } catch (error) {
    callback(error);
  }
}
// Synchronous writeFile
function writeFile(key, data, callback) {
  try {
    fs.writeFileSync(`${key}.json`, JSON.stringify(data));
    callback(null);
  } catch (error) {
    callback(error);
  }
}
// Asynchronous writeFile
async function writeFileAsync(key, data) {
  try {
    await new Promise((resolve, reject) => {
      fs.writeFile(`${key}.json`, JSON.stringify(data), err => {
        if (err) reject(err);
        else resolve();
      });
    });
  } catch (error) {
    throw error;
  }
}*/

//nodes of servers
//script de arranque em sistemas:
//fork dos sistemas em nodejs
//forever
//swagger HOUST, Postman
/*const { exec } = require('child_process')

exec (ls -lh,(error,stdout,stderr) => {
  if(error) {
    console.error('error: ${error.message}');
  }
  if(stderr){
    console.error('stderr: ${stderr}');
    return;
  }
  console.log('stdout:\n$(stdout)');
});*/

// Defining backend servers