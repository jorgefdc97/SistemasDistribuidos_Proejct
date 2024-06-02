var express = require('express');
var router = express.Router();
const axios = require('axios');

const dataNodeMasters = ['dn00', 'dn01', 'dn02', 'dn03'];

/* GET status listing. */
router.get('/:id?', async (req, res, next) => {
  
    console.log("em ./routes/status.js"); 
    let serverId;

    try {
        const statusPromises = dataNodeMasters.map(async (dataNode) => {
          // Send HTTP request to each data node master's status route
          const response = await axios.get(`http://${dataNode}/status`);

          return response.data; // Assuming data node status is returned in JSON format
        });
    
        // Wait for all requests to complete
        const statuses = await Promise.all(statusPromises);
    
        // Aggregate system status
        const systemStatus = {
          dataNodeStatuses: statuses
          // Add other entity statuses (start time, uptime, etc.) if needed
        };
    
        res.json(systemStatus);

    } catch (error) {

        console.error('Error fetching system status:', error.message);
        res.status(500).json({ error: 'Internal Server Error' });

    }

    /*
    if (req.query.id){
        serverId = parseInt(req.query.id);
        let server = server.find(server => server.id === parseInt(serverId));
        console.table( server );
        return res.send( server );
    }
  
    if(req.params.id){
        serverId = parseInt(req.params.id);
        let server = server.find(server => server.id === parseInt(serverId));
        console.table( server );
        return res.send( server );
    }
    */  

});

module.exports = router;