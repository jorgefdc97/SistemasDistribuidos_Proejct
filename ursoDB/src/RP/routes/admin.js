var express = require('express');
var router = express.Router();

router.get('/', function(req, res, next) {
  
    console.log("em ./reverse_proxy/routes/admin.js");
    
    return res.send('RP Admin page');

});

module.exports = router;