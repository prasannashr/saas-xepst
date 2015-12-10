var passport = require('passport');

exports.authenticate = function(req, res, next) {

    req.body.username = req.body.email.toLowerCase();
    console.log('inside authenticate' + req.body.username);
    var domain = req.headers.host
    subDomain = domain.split('.');
    req.body.subdomain = subDomain[0];
    

    var auth = passport.authenticate('local', function(err, user) {
        if (err) {
            return next(err);
        }
        if (!user) {
            res.send({
                success: false
            })
        }
        req.logIn(user, function(err) {
            if (err) {
                return next(err);
            }
            res.redirect('/');
        })
    })
    auth(req, res, next);
};

exports.requiresApiLogin = function(req, res, next) {
    if (!req.isAuthenticated()) {
        res.status(403);
        res.end();
    } else {
        next();
    }
};

exports.requiresRole = function(role) {
    console.log('inside requires role '+role);
    return function(req, res, next) {
        if (!req.isAuthenticated() || req.user.roles.indexOf(role) === -1) {
            res.status(403);
            res.end();
        } else {
            next();
        }
    }
}
