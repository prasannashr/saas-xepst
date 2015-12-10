var mongoose = require('mongoose'),
    encrypt = require('../utilities/encryption');

var customerSchema = mongoose.Schema({
    firstName: {
        type: String,
        required: '{PATH} is required!'
    },
    lastName: {
        type: String,
        required: '{PATH} is required!'
    },    
    email: {
        type: String,
        required: '{PATH} is required!',
        unique: true
    },
    salt: {
        type: String,
        required: '{PATH} is required!'
    },
    hashed_pwd: {
        type: String,
        required: '{PATH} is required!'
    },
    subdomain: {
        type: String,
        unique: true
    },

    apikey: {
        type: String
    },

    status: {
        type: String
    },

    customer_plan: {
        type: String
    },

    user_type: {
        type: String
    },    
    organization_detail: {
        companyName: {
            type: String
        },
        industry: {
            type: String
        },
        website: {
            type: String
        },
        phone_number: {
            type: Number
        },
        logoPath: {
            type: String
        },
        address: {
            street: {

                type: String
            },
            city: {
                type: String
            },
            country: {
                type: String
            }
        }
    },
    setting:{
        languageOption: {
            type: Boolean,
            default: false
        },
        priority:[{
            value: {
                type: Number
            },
            meaning: {
                type: String
            }
        }],
        maxAttachment: {
            type: Number,
            default: 6
        }, 
        maxPriority: {
            type: Number,
            default: 5
        },
        resolutionType:{
            type: Boolean,
            default: false
        },
        resolutionTypes:[{
            name: {
                type: String
            }
        }],
	sr_type: [{
            name: {
                type: String
            }
        }],
        sr_status:[{
            order: {
                type: Number,
            },
            name: {
                type: String,
            },
            code: {
                type: String,
            },
            value: {
                type: Boolean,
                default: true
            }
        }]
        
    }
});
customerSchema.methods = {
    authenticate: function(passwordToMatch) {
        return encrypt.hashPwd(this.salt, passwordToMatch) === this.hashed_pwd;
    },
    hasRole: function(role) {
        return this.roles.indexOf(role) > -1;
    }
};
module.exports = mongoose.model('Customer', customerSchema);
