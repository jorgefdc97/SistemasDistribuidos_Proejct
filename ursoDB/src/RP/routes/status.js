var express = require('express');
var router = express.Router();

router.get('/', function(req, res, next) {
  
    console.log("em ./reverse_proxy/routes/status.js");
    
    return res.send('RP Status page');

});

module.exports = router;