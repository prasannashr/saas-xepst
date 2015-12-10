var passport = require('passport'),
    mongoose = require('mongoose'),
    LocalStrategy = require('passport-local').Strategy,
    User = mongoose.model('User'),
    Customer = mongoose.model('Customer'),
    encrypt = require('../utilities/encryption');

module.exports = function() {

    passport.use(new LocalStrategy({
            /** 
            passReqtoCallback set to true if we want to pass request body to passport authentication 
            @subinjoshi  - 7th august 2015
            **/
            passReqToCallback: true
        },
        function(req, username, password, done) {
            /** 
            check login using email and subdomain of user
            - in req , we pass req.body in passport authentication using passReqToCallback= true
            @subinjoshi - 7th august 2015 
            **/
            User.aggregate({
                "$unwind": "$app_users"
            }, {
                "$match": {
                    $and: [{
                        'subdomain': req.body.subdomain
                    }, {
                        'app_users.email': username
                    }]
                }
            }).exec(function(err, user) {

                if (!user) {
                    return done(null, false, {
                        message: 'This email is not registered.'
                    });
                } else if (user == '') {
                    return done(null, false, {
                        message: 'Not registered domain. Please check your domain !!'
                    });

                } else {
                    var hashed_pwd = encrypt.hashPwd(user[0].app_users.salt, password);
                    if (hashed_pwd != user[0].app_users.hashed_pwd || user[0].app_users.status != true) {
                        return done(null, false, {
                            message: 'This password is not correct.'
                        });
                    } else {
                        return done(null, user);
                    }
                }
            })
        }
    ));

    /** 
    used to serialize the user for the session 
    @subinjoshi - 7th august 2015
    **/
    passport.serializeUser(function(user, done) {
        if (user) {
            /**
            saved to session req.session.passport.user = {id:'..'} 
            @subinjoshi
            **/
            done(null, user[0].app_users._id);
        }
    });

    /** 
    used to deserialize the user
    @subinjoshi 
    **/
    passport.deserializeUser(function(id, done) {
        /** 
        find user by user ID passed in app_users array
        **/
        User.aggregate({
            "$unwind": "$app_users"
        }, {
            "$match": {
                'app_users._id': mongoose.Types.ObjectId(id)
            }
        }, {
            "$project": {
                _id: 1,
                subdomain: 1,
                customerId: 1,
                companyName: 1,
                'app_users.email': 1,
                'app_users.firstName': 1,
                'app_users.lastName': 1,
                'app_users.role': 1,
                'app_users.fullname': 1,
                'app_users._id': 1,
                'app_users.created_date': 1,
                'app_users.status': 1,
                'app_users.salt': 1,
                'app_users.designation': 1,
                'app_users.address': 1,
                'app_users.proPic': 1
            }
        }, function(err, user) {

            user = user[0];
            if (user) {
                 //fetch customer details to get organization detail
                Customer.findOne({
                    '_id': user.customerId
                }, function(err, customer) {
                    if (err) {
                        res.send(500, err)
                    } else {
                        if (customer) {
                            user['languageOption']=customer.setting.languageOption;
                            user['resolutionType']=customer.setting.resolutionType;
                            user['maxAttachment']=customer.setting.maxAttachment;
                            user['maxPriority']=customer.setting.maxPriority;
                            user.companyName = customer.organization_detail.companyName;
                            user.logo = customer.organization_detail.logoPath;
                            //console.log("=====================DeserializeUser===================");                           
                            return done(null, user);
                        }
                    }                    
                })
                /**
                user object ataches to the request as req.user
                @subinjoshi
                **/
                
                //return done(null, user);
            } else {
                return done(null, false);
            }
        })
    })

}
