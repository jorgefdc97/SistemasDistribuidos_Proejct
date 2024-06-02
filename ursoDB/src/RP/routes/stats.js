var express = require('express');
var router = express.Router();

router.get('/', function(req, res, next) {
  
    console.log("em ./reverse_proxy/routes/stats.js");
    
    return res.send('RP stats page');

});

module.exports = router;