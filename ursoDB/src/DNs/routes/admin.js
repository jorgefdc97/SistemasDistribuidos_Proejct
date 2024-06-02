var express = require('express');
var router = express.Router();

router.get('/', function(req, res, next) {
  
    console.log("em ./routes/admin.js");
    
    return res.send('Admin page');

});

module.exports = router;