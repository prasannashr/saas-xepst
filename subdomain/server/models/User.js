var mongoose = require('mongoose'),
    mongoosastic = require('mongoosastic'),
    encrypt = require('../utilities/encryption');

var userSchema = mongoose.Schema({

    apikey: {
        type: String
    },
    subdomain: {
        type: String,
        es_indexed: true

    },
    customerId: {
        type: String,
        es_indexed: true
    },
    app_users: [{

        firstName: {
            type: String,
            es_indexed: true

        },
        lastName: {
            type: String,
            es_indexed: true

        },
        designation: {
            type: String
        },
        fullname: {
            type: String,
            es_indexed: true,
            es_type: 'string'
        },
        email: {
            type: String,
            required: '{PATH} is required!'
        },
        address: {
            type: String
        },

        salt: {
            type: String

        },
        hashed_pwd: {
            type: String

        },
        status: {
            type: Boolean,
            default: false
        },
        user_type: {
            type: String
        },
        created_date: {
            type: Date,
            default: new Date()
        },
        updated_date: {
            type: Date

        },
        user_expiry: {
            type: String
        },
        role: {
            type: String
        },

        proPic: {
            type: String
        }

    }]



});
userSchema.methods = {
    authenticate: function(passwordToMatch) {
        return encrypt.hashPwd(this.salt, passwordToMatch) === this.hashed_pwd;
    },
    hasRole: function(role) {
        return this.roles.indexOf(role) > -1;
    }
};

userSchema.plugin(mongoosastic);

/*----------------------------------------------------------------------------------------------------
 Name: searchData
 Description: for synchronisation of existing users 
 Author: SubinJoshi
 Date : 25 August 2015
------------------------------------------------------------------------------------------------------*/

var User = mongoose.model('User', userSchema),
    stream = User.synchronize(),
    count = 0;

stream.on('data', function(err, doc) {
    count++;
});
stream.on('close', function() {
    console.log('indexed ' + count + ' documents! User');
});
stream.on('error', function(err) {
    console.log(err);
});


User.createMapping({
    "mapping": {
        "user": {
            "properties": {
                "subdomain": {
                    "type": "string"
                },
                "properties": {

                    "app_users": {
                        "type": "nested",
                        "include_in_parent": false,
                        //"type" : "object",
                        "properties": {
                            //"firstName"    : { "type" : "string" },
                            "fullname": {
                                "type": "string"
                            }

                        }
                    }
                }
            }
        }
    }
}, function(err, mapping) {
    var stream = User.synchronize(); //to sync
    // do neat things here
});

module.exports = mongoose.model('User', userSchema);
