/*------------------------------------------------------------------------------
  Copyright Javra Software - www.javra.com
  ------------------------------------------------------------------------------
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
var main = require('./server/domain');
var subdomain = require('./server/domainsub');

var config = require('./server/config/config')[env];
require('./server/domainsub/config/mongoose')(config);
//require('./subdomain/server/config/passport')();

app.use(vhost('localxepst.com', main))
app.use(vhost('*.localxepst.com', subdomain));

var automatelanguagelabel = require('./server/domainsub/utilities/automatelanguagelabel.js');
// call function checkAndCreateLabelInDatabase to check multilanguage labels in html files
// and add in DB if its new label
automatelanguagelabel.checkAndCreateLabelInDatabase();


app.listen(config.port);

console.log('SAAS XEPST LISTENING ON PORT :' + config.port + '..... ENV: '+env);
