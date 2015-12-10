var mongoose = require('mongoose'),
    mongoosastic = require('mongoosastic');

var srSchema = mongoose.Schema({

    sr_id: {
        type: String
    },

    project_id: {
        type: String,
        es_indexed: true

    },

    customerId: {
        type: String,
        es_indexed: true
    },
    Customer_Reference: {
        type: String
    },

    planning_start: {
        type: String
    },

    ready_to_test: {
        type: String
    },

    sr_title: {
        type: String,
        es_indexed: true
    },

    sr_description: {
        type: String
    },
    sr_createdate: {
        type: Date
    },

    sr_createdBy: {
        type: String
    },

    assignee: {
        type: String
    },

    sr_type: {
        type: String
    },
    sr_status: {
        type: String
    },

    priority: {
        type: String
    },

    start_date: {
        type: Date
    },

    end_date: {
        type: Date
    },

    billable: {
        type: String
    },

    due: {
        type: String
    },

    estimated_time: {
        type: String
    },

    hours: {
        type: Number
    },
    progress:{
        type: Number
    },
    resolution_type:{
        type: String
    },

    comment: [{
        user_id: {
            type: String,
            es_indexed: false

        },

        username: {
            type: String,
            es_indexed: false
        },

        comment: {
            type: String,
            es_indexed: false

        },

        sr_create_date: {
            type: Date,
            es_indexed: false
        }

    }],

    attachments: [{
        filename: {
            type: String
        },
        uploaded_by: {
            type: String
        },
        path: {
            type: String
        },
        description: {
            type: String
        },
        uploaded_date: {
            type: Date
        }
    }]

});

srSchema.plugin(mongoosastic);

/** 
for synchronisation of existing srs 
 **/
var Sr = mongoose.model('Sr', srSchema),
    stream = Sr.synchronize(),
    count = 0;

stream.on('data', function(err, doc) {
    count++;
});
stream.on('close', function() {
    console.log('indexed ' + count + ' documents! SR');
});
stream.on('error', function(err) {
    console.log(err);
});

module.exports = mongoose.model('Sr', srSchema);
