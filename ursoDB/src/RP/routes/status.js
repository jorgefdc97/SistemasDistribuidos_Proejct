const express = require('express');
const router = express.Router();
const axios = require('axios');
const fs = require('fs');
const logger = require('../../logger');

// Function to fetch data node status
async function fetchDataNodeStatus(node) {
  try {
    const response = await axios.get(`http://${node.host}:${node.port}/status`);
    return response.data;
  } catch (error) {
    logger.error(`Error fetching status for data node ${node.name}: ${error.message}`);
    return { error: `Failed to fetch status for data node ${node.name}` };
  }
}

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

// Route handler for /status endpoint
router.get('/', async (req, res) => {
  const upTime = getUpTime();
  const status = {
    'alive since': upTime.formattedDate,
    uptime: `${upTime.days} days : ${upTime.hours} hours : ${upTime.minutes} minutes : ${upTime.seconds} seconds`,
    status: 'Online'
  };

  res.json(status);
});

module.exports = router;
