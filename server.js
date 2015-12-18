/*------------------------------------------------------------------------------
  Copyright Javra Software - www.javra.com
--------------------------------------------------------------------------------
  File        : server.js
  Description : 
  Input param :
  Output param:
  Author      : Prasanna Shrestha
  Created     : 10/09/2015

Date   Author Version Description
------------------------------------------------------------------------
10/09/2015 v1 prasanna Creating all required logic                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                          
------------------------------------------------------------------------*/
var express = require('express');
var methodOverride = require('method-override');
var http = require('http');
var path = require('path');
var vhost = require('vhost');
var fs = require('fs');
var async = require("async");
var passport = require('passport');

// set the application development environment
var env = process.env.NODE_ENV = process.env.NODE_ENV || 'development';

var app = express();
var main = require('./main');
var subdomain = require('./subdomain');

var config = require('./config/config')[env];
require('./subdomain/server/config/mongoose')(config);
//require('./subdomain/server/config/passport')();

app.use(vhost('54.172.110.156', main))
app.use(vhost('*.54.172.110.156', subdomain));

var automatelanguagelabel = require('./subdomain/server/utilities/automatelanguagelabel.js');
// call function checkAndCreateLabelInDatabase to check multilanguage labels in html files
// and add in DB if its new label
automatelanguagelabel.checkAndCreateLabelInDatabase();


app.listen(config.port);
console.log('MongoDB IP : ...'+process.env.MONGODB_PORT_27017_TCP_ADDR);
console.log('SAAS XEPST LISTENING ON PORT :' + config.port + '..... ENV: '+env);