var mongoose = require('mongoose'),
mongoosastic = require('mongoosastic');

var projectSchema = mongoose.Schema({

   
    srId_counter: {
        type: Number,
        default: 0    
    },
    project_title: {
        type: String,
        es_indexed: true
    },
    project_description: {
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
    project_startDate: {
        type: Date
    },
    project_endDate: {
        type: Date
    },
    project_createdDate: {
        type: Date
    },
    members: [{
        fullname: {
            type: String,
            es_indexed: false
        },
        user_id: {
            type: String,
            es_indexed: false
        },
        group_name: {
            type: String,
            es_indexed: false
        },
        isAdmin: {
            type: Boolean,
            default: false
        }
    }]

});

projectSchema.plugin(mongoosastic);

/** 
for synchronisation of existing users 
@subinjoshi - 25 August 2015
 **/
var Project = mongoose.model('Project', projectSchema),
    stream = Project.synchronize(),
    count = 0;

stream.on('data', function(err, doc) {
    count++;
});
stream.on('close', function() {
    console.log('indexed ' + count + ' documents! Project');
});
stream.on('error', function(err) {
    console.log(err);
});

module.exports = mongoose.model('Project', projectSchema);
