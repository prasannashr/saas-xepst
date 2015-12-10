
var auth = require('../subdomain/server/config/auth'),
    users = require('../subdomain/server/controllers/users'),
    mongoose = require('mongoose'),
    User = mongoose.model('User'),
    Customer = mongoose.model('Customer'),
    emailVerification = require('./server/config/emailVerification.js');

module.exports = function(app) {

    app.get('/partials/*', function(req, res) {
        res.render('../../public/app/' + req.params[0]);
    });
    /**
    *
    *rikesh
    **/
    app.post('/api/createCustomer', users.createCustomer);

    app.get('/auth/verifyEmail', emailVerification.handler);

    app.get('/', function(req, res) {
        console.log('i am in main page');
        res.render('index');
    });

    app.get('/signup', function(req, res) {
        console.log('i am in main page');
        res.render('signup');
    });

    app.all('/api/*', function(req, res) {
        res.send(404);
    });

    app.get('/api/login', function(req, res) {

        console.log(req.user);
        res.send(req.user);
    });

    /**
    *
    *rikesh **/
    app.post('/checkavailable', users.checkavailable);
}
