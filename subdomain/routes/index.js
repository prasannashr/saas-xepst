var express = require('express');
var router = express.Router();

router.get('/dash', function(req, res) {
    console.log('i am in Subdomain');   
    //var pass = Math.random().toString(36).substring(2,10);
    res.render('login');
 });


module.exports = router;