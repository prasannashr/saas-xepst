var crypto = require('crypto');
var Clients = require('../models/Customer');

/** 
create salt 
**/
exports.createSalt = function() {
    return crypto.randomBytes(128).toString('base64');
}

/**
 encrypt password using sha1 and salt
 @subinjoshi - 3rd August
  **/
exports.hashPwd = function(salt, pwd) {
    var hmac = crypto.createHmac('sha1', salt);
    return hmac.update(pwd).digest('hex');
}

/** 
Generate random alphanumeric password of 8 characters 
@Subin Joshi - 7th August 2015 
**/
exports.generatePassword = function() {
    return Math.random().toString(36).substring(2, 10);
}

/** 
check subdomain and only give access if the subdomain name exists 
**/
exports.checkSubdomain = function() {
    return function(req, res, next) {
        var domain = req.headers.host
        subDomain = domain.split('.');
        Clients.findOne({
            'subdomain': subDomain[0]
        }, function(err, client) {
            if (!err) {
                if (!client) {
                    res.send(403, 'Sorry! This Domain is not exist.');
                } else {
                    return next();

                }
            } else {
                console.log("err >> " + err);
                return next(err)
            }

        });
    }
}
