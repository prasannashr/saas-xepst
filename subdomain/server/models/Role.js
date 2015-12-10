var mongoose = require('mongoose');

var roleSchema = mongoose.Schema({
    customerId: {
        type: String
    },
    group_name: {
        type: String
    },
    description: {
        type: String
    },
    create_date: {
        type: Boolean
    },
    permission: {
        full_control: {
            type: Boolean,
            default: false
        },
        edit: {
            type: Boolean,
            default: false
        },
        read: {
            type: Boolean,
            default: false
        },
        limited_access: {
            type: Boolean,
            default: false
        }
    }   
});

module.exports = mongoose.model('Role', roleSchema);
