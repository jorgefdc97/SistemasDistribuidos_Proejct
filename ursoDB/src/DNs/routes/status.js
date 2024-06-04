const express = require('express');
const router = express.Router();
const fs = require('fs');
const logger = require('../../logger');

// Function to get process uptime
function getUpTime() {
  const uptimeInMilliseconds = process.uptime() * 1000;
  const days = Math.floor(uptimeInMilliseconds / (1000 * 60 * 60 * 24));
  const hours = Math.floor((uptimeInMilliseconds % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
  const minutes = Math.floor((uptimeInMilliseconds % (1000 * 60 * 60)) / (1000 * 60));
  const seconds = Math.floor((uptimeInMilliseconds % (1000 * 60)) / 1000);

  // Get the date when the process started
  const startDate = new Date(Date.now() - uptimeInMilliseconds);
  const formattedDate = `${startDate.getFullYear()}-${(startDate.getMonth() + 1).toString().padStart(2, '0')}-${startDate.getDate().toString().padStart(2, '0')}`;

  return {
    days,
    hours,
    minutes,
    seconds,
    formattedDate
  };
}

// Function to get the master ID from the parent node in manel.json
function getMasterIdFromParentNode(req) {
  const configFilePath = '../etc/manel.json';
  const config = JSON.parse(fs.readFileSync(configFilePath, 'utf8'));
  // Find the parent node based on the current host and port
  const currentNode = config.DNs.find(node => node.servers.some(server => server.host === req.hostname && server.port === req.port));
  // Retrieve the master ID from the parent node
  return currentNode ? currentNode.master_id : 'Master not elected';
}

// Route handler for /status endpoint
router.get('/', async (req, res) => {
  const upTime = getUpTime();
  const masterId = getMasterIdFromParentNode(req);
  const status = {
    'alive since': upTime.formattedDate,
    uptime: `${upTime.days} days : ${upTime.hours} hours : ${upTime.minutes} minutes : ${upTime.seconds} seconds`,
    masterNode: masterId,
    status: 'Online'
  };

  res.json(status);
});

module.exports = router;
