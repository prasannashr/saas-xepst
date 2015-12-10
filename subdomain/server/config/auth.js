/*------------------------------------------------------------------------------
  Copyright Javra Software - www.javra.com
--------------------------------------------------------------------------------
  File        : subdomain/server/config/auth.js
  Description :
  Input param :
  Output param:
  Author      : Subin Joshi
  Created     : 10/09/2015

 Date   Author Version Description
 ------------------------------------------------------------------------
 10/09/2015 v1 Subin Creating all required logic                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                          
 ------------------------------------------------------------------------*/

var _ = require('underscore'),
    fs = require('fs'),
    jwt = require('jwt-simple');
var passport = require('passport'),
    User = require('../models/User.js');
var env = process.env.NODE_ENV = process.env.NODE_ENV || 'development',
    config = require('../../../config/config.js')[env];
exports.authenticate = function(req, res, next) {
    
    req.body.username = req.body.email.toLowerCase();
    /** 
    for passing subdomain in req.body in passport 
    @subinjoshi
    **/
    if(!req.body.subdomain){
        var domain = req.headers.host;
        //console.log("Domain :: ",domain);
        subDomain = domain.split('.');
        //console.log("subDomain :: ",subDomain);
        req.body.subdomain = subDomain[0];
    }
   
    var auth = passport.authenticate('local', function(err, user) {
        if (err) {
            return next(err);
        }
        if (!user) {
            res.send({
                success: false
            })
        }
        
        //hide the user's password
        //@Rikesh 2015/09/14        
        if(user[0]) {
            delete user[0].app_users.hashed_pwd;
        }    
        
        //authenticate() middleware  may  invoke req.login() automatically
        //@subinjoshi       
        req.logIn(user, function(err) {
            if (err) {
                return next(err);
            }
            res.send({
                success: true,
                user: user
            });
        })
    })
    auth(req, res, next);
};
/*----------------------------------------------------------------------------------------------------
 Name       : verifyCustomer
 Description: handles customer email verification upon clicking the verify button by customer 
              in the email sent for verification. And auto login in dashboard and redirect to change password page
 Author     : Rikesh Bhansari, Prasanna Shrestha
 Updated    : 20/11/2015
------------------------------------------------------------------------------------------------------*/
exports.verifyCustomer = function(req, res, next) {
   
    var token = req.query.token;    
    var payload = jwt.decode(token, config.email_secret);
    var email = payload.sub;
    var customerId = payload.customerId;
    var password = payload.password;

    if(!email) return handleError(res);

    User.findOne({'customerId': customerId, 'app_users.email': email}, function(err,foundUser) {
        if(err) return res.status(500);

        if(!foundUser) return handleError(res);
        
        if(!foundUser.app_users[0].status) {
            foundUser.app_users[0].status = true;
        }
        
        foundUser.save(function(err) {
            if(err) return res.status(500);
            req.body.username = payload.sub;
            req.body.email = payload.sub;
            req.body.password = payload.password;
            req.body.subdomain = foundUser.subdomain;   

            passport.authenticate('local', function(err, user) {
                
                if (err) { return next(err); }
                if (!user) { return res.redirect('/'); }
                if(user[0]) {
                    delete user[0].app_users.hashed_pwd;
                } 
                req.logIn(user, function(err) {
                  if (err) { return next(err); }
                  var app_url = config.app_url.split('.');
                    if (app_url[0] == 'www') {
                        app_url[0] = foundUser.subdomain;
                        app_url = app_url.join('.');
                        app_url = app_url+'/dashboard/setting/changepassword';
                    } else {
                        app_url = app_url.join('.');
                        app_url = foundUser.subdomain + '.' + app_url+'/dashboard/setting/changepassword';
                    }
                    return res.redirect('http://'+app_url);
                  
                });
            })(req, res, next);           
            
        })
    })
}

exports.requiresApiLogin = function(req, res, next) {
    if (!req.isAuthenticated()) {
        res.status(403);
        res.end();
    } else {
        next();
    }
};

exports.requiresRole = function(role) {

    return function(req, res, next) {
        var sub = req.user.app_users.role;
        if (!req.isAuthenticated() || req.user.app_users.role != role) {
            res.status(403);
            res.end();
        } else {
            next();
        }
    }
}
