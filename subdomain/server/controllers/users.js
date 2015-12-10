/*------------------------------------------------------------------------------
    Copyright Javra Software - www.javra.com
    ----------------------------------------------------------------------------
    File        : subdomain/server/controllers/users.js
    Description :
    Input param :
    Output param:
    Author      : Subin Joshi
    Created     : 10/09/2015
--------------------------------------------------------------------------------*/

var User = require('mongoose').model('User'),
    Customer = require('mongoose').model('Customer'),
    encrypt = require('../utilities/encryption'),
    nodemailer = require('nodemailer'),
    mongoose = require('mongoose'),
    emailVerification = require('../../../main/server/config/emailVerification.js'),
    env = process.env.NODE_ENV = process.env.NODE_ENV || 'development',
    config = require('../../../config/config.js')[env],
    multilanguage = require('../controllers/languages.js');

exports.getUsers = function(req, res) {
    User.find({}).exec(function(err, collection) {
        res.send(collection);
    })
};

exports.dashboard = function(req, res) {
    res.render('dashboard-new');
};
exports.loginPage = function(req, res) {
    res.render('login');
};

/**
  checks if email and subdomain are already used
 **/
exports.checkavailable = function(req, res) {
    var email = {
        'email': req.body.checkVal
    };
    var subdomain = {
        'subdomain': req.body.checkVal
    }
    var check;
    if (req.body.field == "subdomain") {
        check = subdomain;
    } else {
        check = email;
    }
    Customer.findOne(check, function(err, found) {
        if (err) {
            return err;
        }
        if (found == null) {
            res.send(false);
        }
        res.send(true);
    })
};


/*---------------------------------------------------------------------------
    Name: checkCurrentPassword
    Description:check current customer's password in the database
    Author: RuchiDhami
----------------------------------------------------------------------------*/

exports.checkCurrentPassword = function(req, res, callback) {

    var salt = req.user.app_users.salt;
    var password = req.body.password;
    password = encrypt.hashPwd(salt, password);
    User.findOne({
        'app_users.hashed_pwd': password
    }, function(err, result) {
        if (err) {
            res.send(500, err)
        } else {
            if (!result) {
                return callback('Password not match with OldPassword')
            }
        }
        res.send(result)
    })
};

/*---------------------------------------------------------------------------
    Name: editPassword
    Description:edit oldpassword of customers
    Author: RuchiDhami
----------------------------------------------------------------------------*/

exports.editPassword = function(req, res, callback) {
    var password = req.body.password;
    var salt = req.body.salt;
    salt = encrypt.createSalt();
    hashed_pwd = encrypt.hashPwd(salt, password);
    User.update({
        'app_users._id': req.params.id
    }, {
        '$set': {
            'app_users.$.hashed_pwd': hashed_pwd,
            'app_users.$.salt': salt
        }
    }, function(err, result) {
        if (err) {
            res.send(500, err)
        }
        res.send(result);
    });
}


/*----------------------------------------------------------------------------------------------------
 Name: createCustomer
 Description:  Create customer and user at the same time when customer signs up 
 Author: Subin Joshi
------------------------------------------------------------------------------------------------------*/
exports.createCustomer = function(req, res, next) {
    var customerData = req.body;

    customerData.email = customerData.email.toLowerCase();
    customerData.subdomain = customerData.subdomain.toLowerCase();

    /**
    creates salt and encrypt password 
    **/
    customerData.salt = encrypt.createSalt();
    customerData.password = encrypt.generatePassword();
    customerData.hashed_pwd = encrypt.hashPwd(customerData.salt, customerData.password);

    customerData.organization_detail = {       
        "companyName": customerData.cname       
    };    
    
    // set default Sr_status code/value and priority details from config file
    customerData.setting =  {  "sr_status" : config.sr_status, 
                               "priority"  : config.priority
                            };
        
    //var newUserData for storing user details in user collections    
    var newUserData = {
        subdomain: customerData.subdomain,
        companyName: customerData.cname,
        app_users: [{
            email: customerData.email,
            hashed_pwd: customerData.hashed_pwd,
            firstName: customerData.firstName,
            lastName: customerData.lastName,
            salt: customerData.salt,
            role: 'admin'
        }]
    }

    
    //creates customer in customer collection with customerData    
    Customer.create(customerData, function(err, user) {
        if (err) {
            return handleError(res, err);
        }
        newUserData.customerId = user._id;

        /*---------------------------------------------------------------------------------
            Description: creates user in the user collection with newUserData when sign up 
            Author: Subin Joshi
        ----------------------------------------------------------------------------------*/
        User.create(newUserData, function(err, user) {
            if (err) {
                if (err.toString().indexOf('E11000') > -1) {
                    err = new Error('Duplicate Email');
                }
                res.status(400);
                return res.send({
                    reason: err.toString()
                });
            }
            res.send(user);
        });
        // set emailing details to user after successfully creation of customer
        emailData = {
            fullname: customerData.firstName+ ' ' +customerData.lastName,
            subdomain: customerData.subdomain,
            password: customerData.password,
            email: customerData.email,
            customerId: newUserData.customerId
        };
        // call emailVerification function to send login details and tokens to verify customer in their Email
        emailVerification.send(emailData);
        // after customer create set multilanguage values for multilanguage lables for that particular customer
        // by default it will set some default values which are required 
        // and it will call another function inside this function multilanguage.setLanguage() which will read all html files multilanguage labels 
        // and store in that customer's language collection 
        multilanguage.setLanguage(newUserData.customerId);
    });
};


/*----------------------------------------------------------------------------------------------------
 Name: addUser
 Description: Add/create users by Customer 
 Author: SubinJoshi
------------------------------------------------------------------------------------------------------*/
exports.addUser = function(req, res) {

    var domain = req.headers.host
    subDomain = domain.split('.');
    randomPassword = encrypt.generatePassword();
    req.body.email = req.body.email.toLowerCase();
    req.body.salt = encrypt.createSalt();
    req.body.hashed_pwd = encrypt.hashPwd(req.body.salt, randomPassword);
    req.body.fullname = req.body.firstName + ' ' + req.body.lastName;

    /**
    finds and update/push user data in subdomain
     **/
    User.update({
        'subdomain': subDomain[0]
    }, {
        $push: {
            app_users: {
                email: req.body.email,
                hashed_pwd: req.body.hashed_pwd,
                firstName: req.body.firstName,
                lastName: req.body.lastName,
                cname: req.body.cname,
                address: req.body.address,
                role: 'user',
                salt: req.body.salt,
                fullname: req.body.fullname,
                designation: req.body.designation,
                status: true
            }
        }
    }, function(err, user) {
        if (err) {
            return handleError(res, err);
        }
        if (!user) {
            return res.send(404);
        }
        var newuser = {
            fullname: req.body.fullname,
            subdomain: subDomain.join('.'),
            password: randomPassword,
            email: req.body.email,
            role: req.body.role
        }
        emailVerification.sendEmailToNewUser(newuser);
        return res.json(user);
    });
};

/*----------------------------------------------------------------------------------------------------
 Name: updateUserProfile
 Description: update profile by user 
 Author: SubinJoshi
------------------------------------------------------------------------------------------------------*/
exports.updateUserProfile = function(req, res) {
    var userUpdates = req.body;
    /** 
    finds user by user ID and update user info
     **/
    User.update({
        'app_users._id': mongoose.Types.ObjectId(req.params.userId)
    }, {
        '$set': {
            'app_users.$.firstName': req.body.firstName,
            'app_users.$.lastName': req.body.lastName,
            'app_users.$.email': req.body.email,
            'app_users.$.updated_date': new Date(),
        }
    }, function(err, user) {
        if (err) {
            return handleError(res, err);
        }
        if (!user) {
            return res.send(404);
        }
        return res.json(user);
    });
};

/*----------------------------------------------------------------------------------------------------
 Name: updateLanguageEditOption
 Description: update Language Edit Option in popup by admin in true or false
 Author: Prasanna Shrestha
------------------------------------------------------------------------------------------------------*/
exports.updateLanguageEditOption = function(req, res) {
    var userUpdates = req.body;
    /** 
    finds user by user ID and update user info
     **/

    Customer.update({
        '_id': mongoose.Types.ObjectId(req.params.customerId)
    }, {
        '$set': {
            'setting.languageOption': req.body.status
        }
    }, {
        upsert: true
    }, function(err, customer) {
        if (err) {
            return handleError(res, err);
        }
        if (!customer) {
            return res.send(404);
        }
        return res.json(customer);
    });
};

/*----------------------------------------------------------------------------------------------------
 Name: updateResolutionType
 Description: update ResolutionType by admin in true/false
 Author: Prasanna Shrestha
------------------------------------------------------------------------------------------------------*/
exports.updateResolutionType = function(req, res) {
    var userUpdates = req.body;
    /** 
    finds user by user ID and update user info
     **/

    Customer.update({
        '_id': mongoose.Types.ObjectId(req.params.customerId)
    }, {
        '$set': {
            'setting.resolutionType': req.body.status
        }
    }, {
        upsert: true
    }, function(err, customer) {
        if (err) {
            return handleError(res, err);
        }
        if (!customer) {
            return res.send(404);
        }
        
        return res.json(customer);
    });
};

/*----------------------------------------------------------------------------------------------------
 Name: updateMaxAttachment
 Description: update Max file Attachment by admin in 1-10, Max is 10
 Author: Prasanna Shrestha
------------------------------------------------------------------------------------------------------*/
exports.updateMaxAttachment = function(req, res) {
    var userUpdates = req.body;
    /** 
    finds user by user ID and update user info
     **/
     console.log("req.body.maxVal :: ",req.body.maxVal);
    Customer.update({
        '_id': mongoose.Types.ObjectId(req.params.customerId)
    }, {
        '$set': {
            'setting.maxAttachment': req.body.maxVal
        }
    }, {
        upsert: true
    }, function(err, customer) {
        if (err) {
            console.log(err,"maxAttachment");
            return handleError(res, err);
        }
        if (!customer) {
            return res.send(404);
        }
        //console.log(customer,"maxAttachment");
        return res.json(customer);
    });
};

/*----------------------------------------------------------------------------------------------------
 Name: updateMaxPriority
 Description: update Max Priority for SR 
 Author: Prasanna Shrestha
------------------------------------------------------------------------------------------------------*/
exports.updateMaxPriority = function(req, res) {
    var userUpdates = req.body;
    /** 
    finds user by user ID and update user info
     **/
    //console.log("req.body.maxVal :: ",req.body.maxVal);
    Customer.update({
        '_id': mongoose.Types.ObjectId(req.params.customerId)
    }, {
        '$set': {
            'setting.maxPriority': req.body.maxVal
        }
    }, {
        upsert: true
    }, function(err, customer) {
        if (err) {
            console.log(err,"maxPriority");
            return handleError(res, err);
        }
        if (!customer) {
            return res.send(404);
        }
        //console.log(customer,"maxPriority");
        return res.json(customer);
    });
};



/*----------------------------------------------------------------------------------------------------
 Name: getCustomerUsers
 Description: gets list of users of customer
 Author: SubinJoshi
------------------------------------------------------------------------------------------------------*/
exports.getCustomerUsers = function(req, res) {

    var domain = req.headers.host
    subDomain = domain.split('.');
    /** 
    find user of customers by its subdomain using pagination 
    @RuchiDhami
    **/
    var page = req.body;
    User.find({
        'subdomain': subDomain[0]
    }, {
        app_users: {
            $slice: [(page.pageno - 1) * page.limit, page.limit]
        }
    }, function(err, user) {
        res.send(user);
    })
};

/*----------------------------------------------------------------------------------------------------
 Name: getSRPriorities
 Description: gets list of SR priority field value and meaning
 Author: Prasanna Shrestha
------------------------------------------------------------------------------------------------------*/
exports.getSRPriorities = function(req, res) {

    var domain = req.headers.host
    subDomain = domain.split('.');
    // get priority list by customer subdomain name
    Customer.findOne({
        'subdomain': subDomain[0]
    }, function(err, customer) {
        if (err) {
            res.send(500, err)
        } else {
            if (customer) {
                //console.log(customer.setting.priority);
                res.send(customer.setting.priority);
            }
        }
    })
};

/*----------------------------------------------------------------------------------------------------
 Name: updateSRPriorities
 Description: update selected SR priority field value and meaning
 Author: Prasanna Shrestha
------------------------------------------------------------------------------------------------------*/
exports.updateSRPriorities = function(req, res) {

    var domain = req.headers.host
    subDomain = domain.split('.');
    // get priority list by customer subdomain name
    Customer.update({
        'subdomain': subDomain[0],
        'setting.priority._id' : mongoose.Types.ObjectId(req.params.priorityId)
    }, {
        '$set': {
            'setting.priority.$.meaning': req.body.meaning           
        }
    }, function(err, customer) {
        if (err) {
            res.send(500, err)
        } else {
            if (customer) {
                //console.log("Updated :: ",customer);
                res.json(customer);
            }
        }
    })

};

/*---------------------------------------------------------------------------------------------------
    Name: getTotalCustomerUsers
    Description:calculate the total number of customer user list
    Author: RuchiDhami
----------------------------------------------------------------------------------------------------*/

exports.getTotalCustomerUsers = function(req, res) {
    User.aggregate({
        $match: {
            'customerId': req.params.customerId
        }
    }, {
        $project: {
            totalUser: {
                $size: "$app_users"
            }
        }
    }, function(err, totalUser) {
        res.send(totalUser)
    })
}

/*----------------------------------------------------------------------------------------------------
 Name: deleteCustomerUser
 Description: deletes user from user collection 
 Author: SubinJoshi
------------------------------------------------------------------------------------------------------*/
exports.deleteCustomerUser = function(req, res) {
    /** 
    pulls user by its User _id from user array
    **/
    User.update({}, {
        $pull: {
            'app_users': {
                _id: req.params.deleteUserId
            }
        }
    }, {
        multi: true
    }, function(err, user) {
        if (err) {
            return handleError(res, err);
        }
        if (!user) {
            return res.send(404);
        }
        return res.json(user);
    });

}

/*----------------------------------------------------------------------------------------------------
 Name: getUserDetail
 Description: gets user details  by user ID
 Author: SubinJoshi
------------------------------------------------------------------------------------------------------*/
exports.getUserDetail = function(req, res) {
    /** 
    unwind array and find user detail by user ID 
    **/
    User.aggregate({
        '$unwind': '$app_users'
    }, {
        '$match': {
            'app_users._id': mongoose.Types.ObjectId(req.params.userId)
        }
    }, function(err, user) {
        if (err) {
            return handleError(res, err);
        }
        if (!user) {
            return res.send(404);
        }
        return res.json(user[0].app_users);
    });
}

/*----------------------------------------------------------------------------------------------------
 Name: updateCustomerUser
 Description: Update users info by Customer 
 Author: SubinJoshi
------------------------------------------------------------------------------------------------------*/
exports.updateCustomerUser = function(req, res) {

    User.update({
        'app_users._id': mongoose.Types.ObjectId(req.params.userId)
    }, {
        '$set': {
            'app_users.$.firstName': req.body.firstName,
            'app_users.$.lastName': req.body.lastName,
            'app_users.$.email': req.body.email,
            'app_users.$.role': req.body.role,
            'app_users.$.lastName': req.body.lastName,
            'app_users.$.updated_date': new Date(),
            'app_users.$.fullname': req.body.firstName + ' ' + req.body.lastName,
            'app_users.$.designation': req.body.designation,
            'app_users.$.address': req.body.address
        }
    }, function(err, user) {
        if (err) {
            return handleError(res, err);
        }
        if (!user) {
            return res.send(404);
        }
        return res.json(user);
    });
}

/*----------------------------------------------------------------------------------------------------
 Name: getCustomerUsersName
 Description: gets users Name and _id to display in options for add members in projects 
 Author: SubinJoshi
------------------------------------------------------------------------------------------------------*/
exports.getCustomerUsersName = function(req, res) {
    var domain = req.headers.host
    subDomain = domain.split('.');

    User.find({
        'subdomain': subDomain[0]
    }, {
        'app_users._id': true,
        'app_users.firstName': true,
        'app_users.lastName': true

    }).exec(function(err, user) {
        var user = user[0].app_users
        if (err) {
            return handleError(res, err);
        }
        if (!user) {
            return res.send(404);
        }
        var userArray = [];
        /**
         push user full name and user id in array for scope user list to be used in options for add member 
         @subinjoshi 
         **/
        user.forEach(function(error, i) {
            userArray.push({
                "fullname": user[i].firstName+' '+user[i].lastName,
                "user_id": user[i]._id
            });
            if (user.length == (i + 1)) {
                return res.json(userArray);
            }
        })
    })
};

/*----------------------------------------------------------------------------------------------------
 Name: updateLoginUser
 Description: update login profile user 
 Author: RuchiDhami
------------------------------------------------------------------------------------------------------*/
exports.updateLoginUser = function(req, res) {
    var loginUser = req.body;
    User.update({
        '_id': req.user._id,
        "app_users._id": req.user.app_users._id
    }, {
        '$set': {
            'companyName': req.body.companyName,
            'app_users.$.firstName': req.body.firstName,
            'app_users.$.lastName': req.body.lastName,
            'app_users.$.email': req.body.email,
            'app_users.$.designation': req.body.designation,
            'app_users.$.address': req.body.address,
            'app_users.$.proPic': req.body.proPic
        }

    }, function(err, user) {

        return res.json(user);
    });
}


/*----------------------------------------------------------------------------------------------------
 Name: checkEmailForUser
 Description: check if the entered email has already been used 
 Author: RuchiDhami
------------------------------------------------------------------------------------------------------*/
exports.checkEmailForUser = function(req, res) {
    User.findOne({
        'customerId': req.params.customerId,
        'app_users.email': req.body.checkemail
    }, function(err, result) {
        if (err) {
            return err;
        }
        if (result) {
            res.send(true);
        } else {
            res.send(false);
        }

    })
}


/*----------------------------------------------------------------------------------------------------
 Name           : getUserName
 Description    : gets the fullname of sr creator 
 Input Params   : user_id of sr creator
 Output Params  : fullname of corresponding user_id
 Author         : Rikesh Bhansari
 Created        : 2015/09/24
------------------------------------------------------------------------------------------------------*/
exports.getUserName = function(req, res) {
    
    User.aggregate([
        { "$match": { customerId: req.user.customerId } },
        { "$unwind": "$app_users" },
        { "$match": { "app_users._id": mongoose.Types.ObjectId(req.params.creatorId) } },
        { "$project": {'app_users.firstName': 1, 'app_users.lastName': 1, 'app_users.proPic':1, '_id': 0}}
    ],
    function(err,result) {
        return res.send(result[0]);
    });
}

/*----------------------------------------------------------------------------------------------------
 Name: updateOrganization
 Description: update the organization details 
 Author: RuchiDhami
------------------------------------------------------------------------------------------------------*/
exports.updateOrganization = function(req, res) {
    Customer.update({
            '_id':mongoose.Types.ObjectId(req.params.customerId)
        }, {
            '$set': {
                'email': req.body.email,
                'organization_detail': req.body.organization_detail
            }
        }, {
            upsert: true
        },
        function(err, result) {
            console.log(result);
            return res.json(result);
        });
}

/*----------------------------------------------------------------------------------------------------
 Name: getOrganization
 Description: find the organization's information
 Author: RuchiDhami
------------------------------------------------------------------------------------------------------*/

exports.getOrganization = function(req, res) {
    Customer.find({
        '_id': mongoose.Types.ObjectId(req.params.customerId)
    }, {
        'email': true,
        'organization_detail': true
    }, function(err, result) {
        res.send(result[0]);
    });
}


/*----------------------------------------------------------------------------------------------------
 Name: addSRType
 Description: add Sr type in the setting page 
 Author: RuchiDhami
------------------------------------------------------------------------------------------------------*/
exports.addSRType = function(req, res) {
    Customer.update({
        '_id': mongoose.Types.ObjectId(req.params.customerId)
    }, {
        $push: {
            'setting.sr_type': {
                'name': [req.body.name]
            }
        }

    }, function(err, result) {
        return res.json(result);
    })
}

/*----------------------------------------------------------------------------------------------------
 Name: addResolutionType
 Description: add Resolution Type in the customer setting 
 Author: Prasanna Shrestha
------------------------------------------------------------------------------------------------------*/
exports.addResolutionType = function(req, res) {
    Customer.update({
        '_id': mongoose.Types.ObjectId(req.params.customerId)
    }, {
        $push: {
            'setting.resolutionTypes': {
                'name': [req.body.name]
            }
        }

    }, function(err, result) {
        return res.json(result);
    })
}

/*----------------------------------------------------------------------------------------------------
 Name: getResolutionTypes
 Description: get all ResolutionTypes from the database 
 Author: Prasanna Shrestha
------------------------------------------------------------------------------------------------------*/
exports.getResolutionTypes = function(req, res) {
    Customer.find({
            '_id': req.params.customerId

        }, {
            'setting.resolutionTypes': true
        },

        function(err, result) {
            res.send(result[0]);
        })
}

/*----------------------------------------------------------------------------------------------------
 Name: updateResolutionTypeName
 Description: update ResolutionTypeName of customer by customerId and TypeId i.e _id
 Author: Prasanna Shrestha
------------------------------------------------------------------------------------------------------*/
exports.updateResolutionTypeName = function(req, res) {
    Customer.update({
            '_id': mongoose.Types.ObjectId(req.user.customerId),
            'setting.resolutionTypes._id': mongoose.Types.ObjectId(req.params.typeId)
        }, {
            '$set': {
                'setting.resolutionTypes.$.name': req.body.name
            }
        },
        function(err, result) {
            return res.json(result)
        });
}

/*----------------------------------------------------------------------------------------------------
 Name: deleteResolutionType
 Description: delete ResolutionType of customer from the database  
 Author: Prasanna Shrestha
------------------------------------------------------------------------------------------------------*/
exports.deleteResolutionType = function(req, res) {
    Customer.update({}, {
        $pull: {
            'setting.resolutionTypes': {
                _id: req.params.typeId
            }
        }
    }, {
        multi: true
    }, function(err, type) {

        if (err) {
            return handleError(res, err);
        }
        if (!type) {
            return res.send(404);
        }
        return res.json(type);
    });
}

/*----------------------------------------------------------------------------------------------------
 Name: getSrTypeAndStatus
 Description: find added Sr type and Sr status from the database 
 Author: RuchiDhami
------------------------------------------------------------------------------------------------------*/
exports.getSrTypeAndStatus = function(req, res) {
    Customer.find({
            '_id': req.params.customerId

        }, {
            'setting.sr_status': true,
            'setting.sr_type': true
        },

        function(err, result) {
            res.send(result[0]);
        })
}


/*----------------------------------------------------------------------------------------------------
 Name: deleteSRType
 Description: delete Sr type of customer from the database  
 Author: RuchiDhami
------------------------------------------------------------------------------------------------------*/
exports.deleteSrType = function(req, res) {
    Customer.update({}, {
        $pull: {
            'setting.sr_type': {
                _id: req.params.typeId
            }
        }
    }, {
        multi: true
    }, function(err, type) {

        if (err) {
            return handleError(res, err);
        }
        if (!type) {
            return res.send(404);
        }
        return res.json(type);
    });
}


/*----------------------------------------------------------------------------------------------------
 Name: updateSRType
 Description: update Sr type of customer by customerId and srTypeId 
 Author: RuchiDhami
------------------------------------------------------------------------------------------------------*/
exports.updateSrType = function(req, res) {
    Customer.update({
            '_id': mongoose.Types.ObjectId(req.user.customerId),
            'setting.sr_type._id': mongoose.Types.ObjectId(req.params.typeId)
        }, {
            '$set': {
                'setting.sr_type.$.name': req.body.name
            }
        },
        function(err, result) {
            return res.json(result)
        });
}

/*----------------------------------------------------------------------------------------------------
 Name: updateSrStatus
 Description: update Sr status to True/False in setting page of customer by customerId and srStatusId 
 Author: RuchiDhami
------------------------------------------------------------------------------------------------------*/
exports.updateSrStatus = function(req, res) {
    Customer.update({
        '_id': mongoose.Types.ObjectId(req.user.customerId),
        'setting.sr_status._id': mongoose.Types.ObjectId(req.params.srStatusId)
    }, {
        '$set': {
            'setting.sr_status.$.value': req.body.value
        }
    },
    function(err, result) {
        console.log(result);
        return res.json(result)
    });
}

function handleError(res, err) {
    return res.send(500, err);
}
