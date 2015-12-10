var express = require('express'),
    stylus = require('stylus'),
    logger = require('morgan'),
    bodyParser = require('body-parser'),
    cookieParser = require('cookie-parser'),
    session = require('express-session'),
    passport = require('passport');


module.exports = function(app, config) {
    function compile(str, path) {
        return stylus(str).set('filename', path);
    }

     app.set('views', config.rootPath + '/server/views');
    //app.set('views', config.root + '/server/views');
    app.engine('html', require('ejs').renderFile);
    app.set('view engine', 'html');
    app.use(logger('dev'));
    app.use(cookieParser());
    app.use(bodyParser());
    app.use(session({
        secret: 'saas 123123123123'
    }));
    app.use(passport.initialize());
    app.use(passport.session());
    app.use(stylus.middleware({
        src: config.rootPath + '/public',
        compile: compile
    }));
    app.use(express.static(config.rootPath + '/public'));
}
