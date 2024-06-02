var express = require('express');
var router = express.Router();

/* GET home page. */
router.get('/', function(req, res, next) {
  //console.log( "==>>", Object.keys(req) );
  console.log( "==>> url:", req.url );
  console.log( "==>> query:", req.query );
  console.log( "==>> params:", req.params );
  res.render('index', { title: 'Express' });
});

module.exports = router;