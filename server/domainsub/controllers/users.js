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
    emailVerification = require('../../domain/config/emailVerification.js'),
    env = process.env.NODE_ENV = process.env.NODE_ENV || 'development',
    config = require('../../config/config.js')[env],
    multilanguage = require('../controllers/languages.js'),
    trycatch = require('trycatch');
var Busboy = require('busboy');
var Grid = require('gridfs-stream');
Grid.mongo = mongoose.mongo;
var conn = mongoose.connection;
var gfs = Grid(conn.db);
var fileHandler = require('../utilities/fileHandler.js');
var fs = require('fs');
var gm = require('gm');

/*---------------------------------------------------------------------------
    Name: uploadProfilePic
    Description: function to upload user's profile picture
    Author: Rikesh Bhansari
----------------------------------------------------------------------------*/
exports.uploadProfilePic = function(req, res) {
    var busboy = new Busboy({ headers : req.headers });
    req.pipe(busboy);
    busboy.on('file', function(fieldname, file, filename, encoding, mimetype) {
        fieldname = "profilePics";
        var userId = req.user.app_users._id;
        fileHandler.uploadFile(fieldname, file, filename, encoding, mimetype, userId, function(err, fileDetails) {
            if(err) {
                return res.send(err);
            }
            if(!fileDetails) {
                return res.send(404);
            }
            if(fileDetails) {
                //fileDetails ==> _id of profilePics.files doc
                res.send(fileDetails);
            }
        });
    });
}

/*---------------------------------------------------------------------------
    Name: uploadLogo
    Description: function to upload organization logo
    Author: Rikesh Bhansari
----------------------------------------------------------------------------*/
exports.uploadLogo = function(req, res) {
    var busboy = new Busboy({ headers : req.headers });
    req.pipe(busboy);
    busboy.on('file', function(fieldname, file, filename, encoding, mimetype) {
        fieldname = "orgLogos";
        var customerId = req.user.customerId;

        fileHandler.uploadFile(fieldname, file, filename, encoding, mimetype, customerId, function(err, fileDetails) {
            if(err) {
                return res.send(err);
            }
            if(!fileDetails) {
                return res.send(404);
            }
            res.send(fileDetails);
        });
    });
}

exports.getUsers = function(req, res) {
    User.find({}).exec(function(err, collection) {
        res.send(collection);
    })
};

exports.dashboard = function(req, res) {
    res.render('../../../public/views/domainsub/dashboard-new');
};
exports.loginPage = function(req, res) {
    res.render('login');
};

/*---------------------------------------------------------------------------
    Name: checkavailable
    Description:checks if email and subdomain are already used or not 
    Author: Rikesh Bhansari
----------------------------------------------------------------------------*/
exports.checkavailable = function(req, res) {
    trycatch(function() {  
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
    }, function(err) {
        console.log(err.stack);
        console.log(err.message);
        return handleError(res, err);
    })
};


/*---------------------------------------------------------------------------
    Name: checkCurrentPassword
    Description:check current customer's password in the database
    Author: RuchiDhami
----------------------------------------------------------------------------*/

exports.checkCurrentPassword = function(req, res, callback) {
    trycatch(function() {   
        var salt = req.user.app_users.salt;
        var password = req.body.password;
        password = encrypt.hashPwd(salt, password);
        User.findOne({
            'app_users.hashed_pwd': password
        }, function(err, result) {
            if (err) {
                return handleError(res, err);
            } else {
                if (!result) {
                    return callback('Password not match with OldPassword')
                }
            }
            res.send(result)
        })
    }, function(err) {
        console.log(err.stack);
        console.log(err.message);
        return handleError(res, err);
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
    trycatch(function() {   
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
                console.log(err.stack);
                console.log(err.message);
                return handleError(res, err);
            }
            res.send(result);
        });
    }, function(err) {
        console.log(err.stack);
        console.log(err.message);
        return handleError(res, err);
    })
}


/*----------------------------------------------------------------------------------------------------
 Name: createCustomer
 Description:  Create customer and user at the same time when customer signs up 
 Author: Subin Joshi
------------------------------------------------------------------------------------------------------*/
exports.createCustomer = function(req, res, next) {
    var customerData = req.body;
    trycatch(function() {   
        customerData.email = customerData.email.toLowerCase();
        customerData.subdomain = customerData.subdomain.toLowerCase();

        
        // creates salt and encrypt password 
       
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
    }, function(err) {
        console.log(err.stack);
        console.log(err.message);
        return handleError(res, err);
    })
};


/*----------------------------------------------------------------------------------------------------
 Name: addUser
 Description: Add/create users by Customer 
 Author: SubinJoshi
------------------------------------------------------------------------------------------------------*/
exports.addUser = function(req, res) {

    var domain = req.headers.host
    subDomain = domain.split('.');
    trycatch(function() {    
        randomPassword = encrypt.generatePassword();
        req.body.email = req.body.email.toLowerCase();
        req.body.salt = encrypt.createSalt();
        req.body.hashed_pwd = encrypt.hashPwd(req.body.salt, randomPassword);
        req.body.fullname = req.body.firstName + ' ' + req.body.lastName;
        
        //finds and update/push user data in subdomain
        
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
    }, function(err) {
        console.log(err.stack);
        console.log(err.message);
        return handleError(res, err);
    })
};

/*----------------------------------------------------------------------------------------------------
 Name: updateUserProfile
 Description: update profile by user 
 Author: SubinJoshi
------------------------------------------------------------------------------------------------------*/
exports.updateUserProfile = function(req, res) {
    var userUpdates = req.body;
    trycatch(function() {      
        
        // finds user by user ID and update user info
        
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
                console.log(err.stack);
                console.log(err.message);
                return handleError(res, err);
            }
            if (!user) {
                return res.send(404);
            }
            return res.json(user);
        });
    }, function(err) {
        console.log(err.stack);
        console.log(err.message);
        return handleError(res, err);
    })
};

/*----------------------------------------------------------------------------------------------------
 Name: updateLanguageEditOption
 Description: update Language Edit Option in popup by admin in true or false
 Author: Prasanna Shrestha
------------------------------------------------------------------------------------------------------*/
exports.updateLanguageEditOption = function(req, res) {
    var userUpdates = req.body;
    trycatch(function() {      
       
        //finds user by user ID and update user info       

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
                console.log(err.stack);
                console.log(err.message);
                return handleError(res, err);
            }
            if (!customer) {
                return res.send(404);
            }
            return res.json(customer);
        });
    }, function(err) {
        console.log(err.stack);
        console.log(err.message);
        return handleError(res, err);
    })
};

/*----------------------------------------------------------------------------------------------------
 Name: updateResolutionType
 Description: update ResolutionType by admin in true/false
 Author: Prasanna Shrestha
------------------------------------------------------------------------------------------------------*/
exports.updateResolutionType = function(req, res) {
    var userUpdates = req.body;
    trycatch(function() {       
        //finds user by user ID and update user info
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
                console.log(err.stack);
                console.log(err.message);
                return handleError(res, err);
            }
            if (!customer) {
                return res.send(404);
            }
            
            return res.json(customer);
        });
    }, function(err) {
        console.log(err.stack);
        console.log(err.message);
        return handleError(res, err);
    })
};

/*----------------------------------------------------------------------------------------------------
 Name: updateMaxAttachment
 Description: update Max file Attachment by admin in 1-10, Max is 10
 Author: Prasanna Shrestha
------------------------------------------------------------------------------------------------------*/
exports.updateMaxAttachment = function(req, res) {
    var userUpdates = req.body;
    trycatch(function() {    
        //finds user by user ID and update user info     
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
    }, function(err) {
        console.log(err.stack);
        console.log(err.message);
        return handleError(res, err);
    })
};

/*----------------------------------------------------------------------------------------------------
 Name: updateMaxPriority
 Description: update Max Priority for SR 
 Author: Prasanna Shrestha
------------------------------------------------------------------------------------------------------*/
exports.updateMaxPriority = function(req, res) {
    var userUpdates = req.body;
    trycatch(function() {
        //finds user by user ID and update user info
        
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
    }, function(err) {
        console.log(err.stack);
        console.log(err.message);
        return handleError(res, err);
    })
};



/*----------------------------------------------------------------------------------------------------
 Name: getCustomerUsers
 Description: gets list of users of customer
 Author: SubinJoshi
------------------------------------------------------------------------------------------------------*/
exports.getCustomerUsers = function(req, res) {
    trycatch(function() {
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
    }, function(err) {
        console.log(err.stack);
        console.log(err.message);
        return handleError(res, err);
    })
};

/*----------------------------------------------------------------------------------------------------
 Name: getSRPriorities
 Description: gets list of SR priority field value and meaning
 Author: Prasanna Shrestha
------------------------------------------------------------------------------------------------------*/
exports.getSRPriorities = function(req, res) {
    trycatch(function() {
        var domain = req.headers.host
        subDomain = domain.split('.');
        // get priority list by customer subdomain name
        Customer.findOne({
            'subdomain': subDomain[0]
        }, function(err, customer) {
            if (err) {
                return handleError(res, err);
            } else {
                if (customer) {
                    //console.log(customer.setting.priority);
                    res.send(customer.setting.priority);
                }
            }
        })
    }, function(err) {
        console.log(err.stack);
        console.log(err.message);
        return handleError(res, err);
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
    trycatch(function() {
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
    }, function(err) {
        console.log(err.stack);
        console.log(err.message);
        return handleError(res, err);
    })

};

/*---------------------------------------------------------------------------------------------------
    Name: getTotalCustomerUsers
    Description:calculate the total number of customer user list
    Author: RuchiDhami
----------------------------------------------------------------------------------------------------*/

exports.getTotalCustomerUsers = function(req, res) {
    trycatch(function() {
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
    }, function(err) {
        console.log(err.stack);
        console.log(err.message);
        return handleError(res, err);
    })
}

/*----------------------------------------------------------------------------------------------------
 Name: deleteCustomerUser
 Description: deletes user from user collection 
 Author: SubinJoshi
------------------------------------------------------------------------------------------------------*/
exports.deleteCustomerUser = function(req, res) {
    
    // pulls user by its User _id from user array    
    trycatch(function() {
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
    }, function(err) {
      console.log(err.stack);
      console.log(err.message);
      return handleError(res, err);
    })

}

/*----------------------------------------------------------------------------------------------------
 Name: getUserDetail
 Description: gets user details  by user ID
 Author: SubinJoshi
------------------------------------------------------------------------------------------------------*/
exports.getUserDetail = function(req, res) {
    
    // unwind array and find user detail by user ID    
    
    trycatch(function() {
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
    }, function(err) {
      console.log(err.stack);
      console.log(err.message);
      return handleError(res, err);
    })
}

/*----------------------------------------------------------------------------------------------------
 Name: updateCustomerUser
 Description: Update users info by Customer 
 Author: SubinJoshi
------------------------------------------------------------------------------------------------------*/
exports.updateCustomerUser = function(req, res) {
    trycatch(function() {
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
    }, function(err) {
      console.log(err.stack);
      console.log(err.message);
      return handleError(res, err);
    })
}

/*----------------------------------------------------------------------------------------------------
 Name: getCustomerUsersName
 Description: gets users Name and _id to display in options for add members in projects 
 Author: SubinJoshi
------------------------------------------------------------------------------------------------------*/
exports.getCustomerUsersName = function(req, res) {
    var domain = req.headers.host
    subDomain = domain.split('.');
    trycatch(function() {
        User.find({
            'subdomain': subDomain[0]
        }, {
            'app_users._id': true,
            'app_users.firstName': true,
            'app_users.lastName': true,
            'app_users.proPic': true

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
    }, function(err) {
      console.log(err.stack);
      console.log(err.message);
      return handleError(res, err);
    })
};

/*----------------------------------------------------------------------------------------------------
 Name: updateLoginUser
 Description: update login profile user 
 Author: RuchiDhami
------------------------------------------------------------------------------------------------------*/
exports.updateLoginUser = function(req, res) {
    var loginUser = req.body;
    trycatch(function() {
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
        }, function(err, updateStat) {
            if(err) {
                console.log(err.stack);
                console.log(err.message);
                return handleError(res, err);
            }
            if(!updateStat) {
                return res.send(500);
            }
            User.findOne({
                _id: req.user._id,
                'app_users._id': req.user.app_users.id
            }, function(err, user) {
                if(err) {
                    console.log(err.stack);
                    console.log(err.message);
                    return handleError(res, err);
                }
                if(!user) {
                    return res.send(404);
                }
                return res.json(user);
            })
        });
    }, function(err) {
      console.log(err.stack);
      console.log(err.message);
      return handleError(res, err);
    })
}


/*----------------------------------------------------------------------------------------------------
 Name: checkEmailForUser
 Description: check if the entered email has already been used 
 Author: RuchiDhami
------------------------------------------------------------------------------------------------------*/
exports.checkEmailForUser = function(req, res) {
    trycatch(function() {
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
    }, function(err) {
      console.log(err.stack);
      console.log(err.message);
      return handleError(res, err);
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
    trycatch(function() {
    
        User.aggregate([
            { "$match": { customerId: req.user.customerId } },
            { "$unwind": "$app_users" },
            { "$match": { "app_users._id": mongoose.Types.ObjectId(req.params.creatorId) } },
            { "$project": {'app_users.firstName': 1, 'app_users.lastName': 1, 'app_users.proPic':1, '_id': 0}}
        ],
        function(err,result) {
	        if(err) {
	            return res.send(err);
	        }
	        if(!result) {
	            return res.send(404);
	        }
	        var userImageId = result[0].app_users.proPic;
	        if(userImageId!==null && userImageId!==undefined) {
                
	            fileHandler.getImageThumbnail(userImageId, function(err, image) {
	                if(err) {
	                    console.log(err,"error getting thumbnail of commentor");
	                    return res.send(err);
	                }
	                if(!image) {
	                    return res.send(404);
	                }
	                result[0].app_users.proPic = image;
	                return res.send(result[0]);
	            });
	        } else {
	            return res.send(result[0]);
	        }
        });
    }, function(err) {
        console.log(err.stack);
        console.log(err.message);
        return handleError(res, err);
    })
}

/*----------------------------------------------------------------------------------------------------
 Name: updateOrganization
 Description: update the organization details 
 Author: RuchiDhami
------------------------------------------------------------------------------------------------------*/
exports.updateOrganization = function(req, res) {
    trycatch(function() {
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
            if(err){
                console.log(err);
                return handleError(res, err);
            }
            
            return res.json(result);
        });
    }, function(err) {
      console.log(err.stack);
      console.log(err.message);
      return handleError(res, err);
    })
}

/*----------------------------------------------------------------------------------------------------
 Name: getOrganization
 Description: find the organization's information
 Author: RuchiDhami
------------------------------------------------------------------------------------------------------*/

exports.getOrganization = function(req, res) {
    trycatch(function() {
        Customer.find({
            '_id': mongoose.Types.ObjectId(req.params.customerId)
        }, {
            'email': true,
            'organization_detail': true
        }, function(err, result) {
            res.send(result[0]);
        });
    }, function(err) {
      console.log(err.stack);
      console.log(err.message);
      return handleError(res, err);
    })
}


/*----------------------------------------------------------------------------------------------------
 Name: addSRType
 Description: add Sr type in the setting page 
 Author: RuchiDhami
------------------------------------------------------------------------------------------------------*/
exports.addSRType = function(req, res) {
    trycatch(function() {
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
    }, function(err) {
      console.log(err.stack);
      console.log(err.message);
      return handleError(res, err);
    })
}

/*----------------------------------------------------------------------------------------------------
 Name: addResolutionType
 Description: add Resolution Type in the customer setting 
 Author: Prasanna Shrestha
------------------------------------------------------------------------------------------------------*/
exports.addResolutionType = function(req, res) {
    trycatch(function() {
        console.log(req.params.customerId);
        console.log(req.params.statusId);
        console.log(req.body.name);
        Customer.update({
            '_id': mongoose.Types.ObjectId(req.params.customerId),
            'setting.sr_status._id' : mongoose.Types.ObjectId(req.params.statusId)
        }, {
            $push: {
                'setting.sr_status.$.subCode': {
                    'name': [req.body.name]
                }
            }

        }, function(err, result) {
            return res.json(result);
        })
    }, function(err) {
      console.log(err.stack);
      console.log(err.message);
      return handleError(res, err);
    })
}

/*----------------------------------------------------------------------------------------------------
 Name: getResolutionTypes
 Description: get all ResolutionTypes from the database 
 Author: Prasanna Shrestha
------------------------------------------------------------------------------------------------------*/
exports.getResolutionTypes = function(req, res) {
    trycatch(function() {
        /*Customer.find({
            '_id': req.params.customerId,
            'setting.sr_status': req.params.customerId

        }, {
            'setting.resolutionTypes': true
        },

        function(err, result) {
            res.send(result[0]);
        })*/
        console.log(req.user.customerId);
        console.log(req.params.statusId);
        Customer.aggregate({
            "$match": {
                "_id": mongoose.Types.ObjectId(req.user.customerId)
            }
        }, {
            "$unwind": "$setting.sr_status"
        }, {
            "$unwind": "$setting.sr_status.subCode"
        }, {
            "$match": {
                'setting.sr_status._id': mongoose.Types.ObjectId(req.params.statusId)
            }
        },{
            "$project":{
                'subCode' : '$setting.sr_status.subCode.name',
                'id' : '$setting.sr_status.subCode._id'
            }
        },
        function(err, result) {
            console.log(result);
            res.send(result);
        })
    }, function(err) {
      console.log(err.stack);
      console.log(err.message);
      return handleError(res, err);
    })
}

/*----------------------------------------------------------------------------------------------------
 Name: updateResolutionTypeName
 Description: update ResolutionTypeName of customer by customerId and TypeId i.e _id
 Author: Prasanna Shrestha
------------------------------------------------------------------------------------------------------*/
exports.updateResolutionTypeName = function(req, res) {

    trycatch(function() {       
        Customer.aggregate({
            "$match": {
                "_id": mongoose.Types.ObjectId(req.user.customerId)
            }
        }, {
            "$unwind": "$setting.sr_status"
        }, {
            "$unwind": "$setting.sr_status.subCode"
        }, {
            "$match": {
                'setting.sr_status._id': mongoose.Types.ObjectId(req.body.selectedStatusId)
            }
        }, function(err, result) {
            if (err) {
                console.log(err.stack);
                console.log(err.message);
                return handleError(res, err);
            }
            if (result) {     
                // fitler result and get the subCode object that need to be update           
                var subCodeUpdateObj = result.filter(function(el) {
                    return req.params.typeId == el.setting.sr_status.subCode._id;
                })[0];                
                var query = {};
                // design a update query with that subCode object index in query
                // result.indexOf(subCodeUpdateObj) will give index for that particular subCode
                query["setting.sr_status.$.subCode." + result.indexOf(subCodeUpdateObj) + ".name"] = req.body.name;
                // and update subCode with new name/value
                Customer.update({
                    '_id': mongoose.Types.ObjectId(req.user.customerId),
                    'setting.sr_status._id' : mongoose.Types.ObjectId(req.body.selectedStatusId)}, 
                { $set: query }, 
                { multi: true },
                function(err, result2) {
                    if (err) {
                        console.log(err.stack);
                        console.log(err.message);
                        return handleError(res, err);
                    }
                    console.log(result2);
                    return res.json(result2);
                })                    
            }
        });

    }, function(err) {
      console.log(err.stack);
      console.log(err.message);
      return handleError(res, err);
    })
}

/*----------------------------------------------------------------------------------------------------
 Name: deleteResolutionType
 Description: delete ResolutionType of customer from the database  
 Author: Prasanna Shrestha
------------------------------------------------------------------------------------------------------*/
exports.deleteResolutionType = function(req, res) {
    trycatch(function() {
        Customer.update({
            "_id": mongoose.Types.ObjectId(req.user.customerId),
            'setting.sr_status._id': mongoose.Types.ObjectId(req.params.statusId)}, 
        {
            $pull: {
                'setting.sr_status.$.subCode': {
                '_id': mongoose.Types.ObjectId(req.params.typeId)
            }}
        }, function(err, type) {

            if (err) {
                return handleError(res, err);
            }
            if (!type) {
                return res.send(404);
            }
            return res.json(type);
        });
    }, function(err) {
      console.log(err.stack);
      console.log(err.message);
      return handleError(res, err);
    })
}

/*----------------------------------------------------------------------------------------------------
 Name: getSrTypeAndStatus
 Description: find added Sr type and Sr status from the database 
 Author: RuchiDhami
------------------------------------------------------------------------------------------------------*/
exports.getSrTypeAndStatus = function(req, res) {
    trycatch(function() {
        Customer.find({
            '_id': req.params.customerId

        }, {
            'setting.sr_status': true,
            'setting.sr_type': true
        },

        function(err, result) {
            res.send(result[0]);
        })
    }, function(err) {
      console.log(err.stack);
      console.log(err.message);
      return handleError(res, err);
    })
}


/*----------------------------------------------------------------------------------------------------
 Name: deleteSRType
 Description: delete Sr type of customer from the database  
 Author: RuchiDhami
------------------------------------------------------------------------------------------------------*/
exports.deleteSrType = function(req, res) {
    trycatch(function() {
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

    }, function(err) {
      console.log(err.stack);
      console.log(err.message);
      return handleError(res, err);
    })
}


/*----------------------------------------------------------------------------------------------------
 Name: updateSRType
 Description: update Sr type of customer by customerId and srTypeId 
 Author: RuchiDhami
------------------------------------------------------------------------------------------------------*/
exports.updateSrType = function(req, res) {
    trycatch(function() {
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
    }, function(err) {
      console.log(err.stack);
      console.log(err.message);
      return handleError(res, err);
    })
}

/*----------------------------------------------------------------------------------------------------
 Name: updateSrStatus
 Description: update Sr status to True/False in setting page of customer by customerId and srStatusId 
 Author: RuchiDhami
------------------------------------------------------------------------------------------------------*/
exports.updateSrStatus = function(req, res) {
    trycatch(function() {
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
    }, function(err) {
      console.log(err.stack);
      console.log(err.message);
      return handleError(res, err);
    })
}

function handleError(res, err) {
    res.status(500).send({status:"error", message: err.message});
}
