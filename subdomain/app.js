var express = require('express');
var bodyParser = require('body-parser');
var methodOverride = require('method-override');
var http = require('http');
var path = require('path');
var app = express();

var logger = require('morgan'),
    cookieParser = require('cookie-parser'),
    session = require('express-session'),
    passport = require('passport');
var env = process.env.NODE_ENV = process.env.NODE_ENV || 'development';
var utilities = require('./server/utilities/encryption');
var config = require('../config/config')[env];
var multer = require('multer');

app.set('views', __dirname + '/server/views');
app.engine('html', require('ejs').renderFile);
app.set('view engine', 'html');
app.use(bodyParser());
app.use(methodOverride());
app.use(express.static(path.join(__dirname, '../public')));

app.use(logger('dev'));
app.use(cookieParser());
app.use(bodyParser());
app.use(session({
    secret: 'saas 123123123123',
    resave: true,
    saveUninitialized: true
}));

app.use(passport.initialize());
app.use(passport.session());
app.use(utilities.checkSubdomain());

//require('./server/config/passport')();
require('./routes')(app);

module.exports = app;
