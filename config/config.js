var path = require('path');
var rootPath = path.normalize(__dirname + '/../');

module.exports = {
    development: {
        db: 'mongodb://localhost/xepst',
        rootPath: rootPath,
        port: process.env.PORT || 3030,
        email_secret: "something secret",
        app_url: "localxepst.com:3030",
        sender_add: "softwarejavra@gmail.com",
        sender_pass: "javra123",
        sr_status: [
            {
                order: 1,
                name: "New",
                code: "NEW",
                value: true
            }, {
                order: 2000,
                name: "Open",
                code: "OPEN",
                value: true
            }, {
                order: 3000,
                name: "Waiting for Info",
                code: "WAITING_FOR_INFO",
                value: true
            }, {
                order: 4000,
                name: "On Hold",
                code: "ON_HOLD",
                value: true
            }, {
                order: 5000,
                name: "In Progress",
                code: "IN_PROGRESS",
                value: true
            }, {
                order: 6000,
                name: "Resolved",
                code: "RESOLVED",
                value: true
            }, {
                order: 7000,
                name: "Verified",
                code: "VERIFIED",
                value: true
            }, {
                order: 8000,
                name: "Completed",
                code: "COMPLETED",
                value: true
            }, {
                order: 9000,
                name: "Closed",
                code: "CLOSED",
                value: true
            }
        ],
        priority : [
            {
                value: "1",
                meaning: "Low"
            }, {
                value: "2",
                meaning: "Medium Low"
            }, {
                value: "3",
                meaning: "Medium"
            }, {
                value: "4",
                meaning: "High"
            }, {
                value: "5",
                meaning: "Urgent"
            }
        ]
    },
    production: {
        db: 'mongodb://localhost/xepst',
        rootPath: rootPath,
        port: process.env.PORT || 3030,
        email_secret: "something secret",
        app_url: "www.saasxepst.com:3030",
        sender_add: "softwarejavra@gmail.com",
        sender_pass: "javra123",
        sr_status: [
            {
                order: 1,
                name: "New",
                code: "NEW",
                value: true
            }, {
                order: 2000,
                name: "Open",
                code: "OPEN",
                value: true
            }, {
                order: 3000,
                name: "Waiting for Info",
                code: "WAITING_FOR_INFO",
                value: true
            }, {
                order: 4000,
                name: "On Hold",
                code: "ON_HOLD",
                value: true
            }, {
                order: 5000,
                name: "In Progress",
                code: "IN_PROGRESS",
                value: true
            }, {
                order: 6000,
                name: "Resolved",
                code: "RESOLVED",
                value: true
            }, {
                order: 7000,
                name: "Verified",
                code: "VERIFIED",
                value: true
            }, {
                order: 8000,
                name: "Completed",
                code: "COMPLETED",
                value: true
            }, {
                order: 9000,
                name: "Closed",
                code: "CLOSED",
                value: true
            }
        ],
        priority : [
            {
                value: "1",
                meaning: "Low"
            }, {
                value: "2",
                meaning: "Medium Low"
            }, {
                value: "3",
                meaning: "Medium"
            }, {
                value: "4",
                meaning: "High"
            }, {
                value: "5",
                meaning: "Urgent"
            }
        ]
    }
}
