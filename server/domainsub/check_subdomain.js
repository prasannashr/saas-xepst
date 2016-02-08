var Clients = require('./server/models/Customer');
//var allowedSubs = {'admin':true, 'www':true };

function checkSubdomain() {
    return function(req, res, next) {
        var domain = req.headers.host
        subDomain = domain.split('.');
        Clients.findOne({
            'subdomain': subDomain[0]
        }, function(err, client) {
            if (!err) {
                if (!client) {
                    res.send(403, 'Sorry! you cant see that.');
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

module.exports = checkSubdomain;