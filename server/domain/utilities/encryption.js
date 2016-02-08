var crypto = require('crypto');

exports.createSalt = function() {
    return crypto.randomBytes(128).toString('base64');
}

exports.hashPwd = function(salt, pwd) {
    var hmac = crypto.createHmac('sha1', salt);
    return hmac.update(pwd).digest('hex');
}

/** Generate random alphanumeric password of 8 characters - @Subin Joshi - 7th August 2015 **/
exports.generatePassword = function(){
	return Math.random().toString(36).substring(2,10);
}
