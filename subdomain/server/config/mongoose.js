var mongoose = require('mongoose'),
    userModel = require('../models/User'),
    customerModel = require('../models/Customer'),
    projectModel = require('../models/Project'),
    srModel = require('../models/Sr');
    roleModel = require('../models/Role');
    multilanguageModel = require('../models/Language');

module.exports = function(config) {
  mongoose.connect(config.db);
  var db = mongoose.connection;
  db.on('error', console.error);
  db.once('open', function callback() {
    //console.log('Saas Xepst db opened');
  });
};

