var express = require('express');
var router = express.Router();

router.get('/', function(req, res, next) {
  
    console.log("em ./routes/db.js");
    
    return res.send('db page');

});

module.exports = router;