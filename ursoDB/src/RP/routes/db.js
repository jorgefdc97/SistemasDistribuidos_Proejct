var express = require('express');
var router = express.Router();

router.get('/', function(req, res, next) {
  
    console.log("em ./reverse_proxy/routes/db.js");
    
    return res.send('RP db page');

});

module.exports = router;