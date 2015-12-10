var mongoose = require('mongoose');

var languageSchema = mongoose.Schema({

    customer_id: {
        type: String
    },

    lang: [{

        country_code: {
            type: String
        },
        country: {
            type: String
        },
        description: {
            type : String
        },

        label: [{

            code: {
                type: String
            },

            value: {
                type: String
            }
        }]

    }]

})

module.exports = mongoose.model('Language', languageSchema);
