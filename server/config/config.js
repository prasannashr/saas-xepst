var path = require('path');
var rootPath = path.normalize(__dirname + '/../../');

var defaultLanguageData = {
    customer_id: '',
    lang: [
        {
            country_code: "en",
            country: "English",
            label: [{
                code: "PROFILE",
                value: "Profile"
            }, {
                code: "LOGOUT",
                value: "Logout"
            }, {
                code: "CREATED_PROJECT",
                value: "Created Project"
            }, {
                code: "DASHBOARD",
                value: "Dashboard"
            }, {
                code: "USERS",
                value: "Users"
            }, {
                code: "PROJECTS",
                value: "Projects"
            }, {
                code: "SETTINGS",
                value: "Settings"
            }, {
                code: "SEARCH",
                value: "Enter your search term..."
            }, {
                code: "NEW",
                value: "New"
            }, {
                code: "OPEN",
                value: "Open"
            }, {
                code: "WAITING_FOR_INFO",
                value: "Waiting For Info"
            }, {
                code: "ON_HOLD",
                value: "On Hold"
            }, {
                code: "IN_PROGRESS",
                value: "In Progress"
            }, {
                code: "RESOLVED",
                value: "Resolved"
            }, {
                code: "VERIFIED",
                value: "Verified"
            }, {
                code: "COMPLETED",
                value: "Completed"
            },{
                code: "REQUIRED_MESSAGE",
                value: "Required field!"
            },{
                code: "MAX_LENGTH_MESSAGE",
                value: "Title shouldn't be greater than 200 words!"
            },{
                code: "MAX_FILE_SIZE_MESSAGE",
                value: "File too large"
            },{
                code: "FILE_TYPE_ERROR_MESSAGE",
                value: "File type error"
            },{
                code: "UPLOAD_SUCCESS_MESSAGE",
                value: "Upload Successful"
            },{
                code: "FILE_LIMIT_MESSAGE",
                value: "File limit reached"
            },{
                code: "ALREADY_IN_USE_MESSAGE",
                value: "Already in use"
            },{
                code: "PASSWORD_NOT_MATCHED_MESSAGE",
                value: "Password do not match"
            }, {
                code: "INVALID_EMAIL_MESSAGE",
                value: "Invalid Email"
            }, {
                code: "WELCOME",
                value: "Welcome"
            },{
                code: "WELCOME_MESSAGE",
                value: "Welcome to Xepst SaaS! You are going to love this. This is the Dashboard Page. It's empty right now, but as you add items, this page will become more interesting."
            },{
                code: "CREATE_FIRST_PROJECT",
                value: "Create the first project"
            },{
                code: "NO_SERVICE_REQUEST_MESSAGE",
                value: "You don't have any Task yet so just create one! Click the button below to get started"
            },{
                code: "NO_PROJECT",
                value: "No Projects"
            },{
                code: "NO_PROJECT_MESSAGE",
                value: "You don't have any projects yet so just create one! Click the button below to get started. You haven't been assigned to any projects yet!"
            },{
                code: "SET_ADMIN",
                value: "Set Admin"
            },{
                code: "TOTAL_SR",
                value: "Total Created SRs"
            },{
                code: "CREATE_FIRST_SERVICE_REQUEST",
                value: "Create the first Service Request"
            }]
        }, {

            country_code: "nl",
            country: "Dutch",
            label: [{
                code: "PROFILE",
                value: "Profiel"
            }, {
                code: "LOGOUT",
                value: "Uitloggen"
            }, {
                code: "CREATED_PROJECT",
                value: "Gemaakt Projecten"
            }, {
                code: "DASHBOARD",
                value: "Dashboard"
            }, {
                code: "USERS",
                value: "Gebruikers"
            }, {
                code: "PROJECTS",
                value: "Projecten"
            }, {
                code: "SETTINGS",
                value: "Instellingen"
            }, {
                code: "SEARCH",
                value: "Voer uw zoekterm..."
            }, {
                code: "NEW",
                value: "New-nl"
            }, {
                code: "OPEN",
                value: "Open-nl"
            }, {
                code: "WAITING_FOR_INFO",
                value: "Waiting For Info-nl"
            }, {
                code: "ON_HOLD",
                value: "On Hold"
            }, {
                code: "IN_PROGRESS",
                value: "In Progress"
            }, {
                code: "RESOLVED",
                value: "Resolved"
            }, {
                code: "VERIFIED",
                value: "Verified"
            }, {
                code: "COMPLETED",
                value: "Completed"
            },{
                code: "REQUIRED_MESSAGE",
                value: "Verplicht veld!"
            },{
                code: "MAX_LENGTH_MESSAGE",
                value: "Titel mag niet groter zijn dan 200 woorden !"
            },{
                code: "MAX_FILE_SIZE_MESSAGE",
                value: "Bestand te groot"
            },{
                code: "FILE_TYPE_ERROR_MESSAGE",
                value: "Bestandstype error"
            },{
                code: "UPLOAD_SUCCESS_MESSAGE",
                value: "Upload Succesvol"
            },{
                code: "FILE_LIMIT_MESSAGE",
                value: "Limit bestand bereikt"
            },{
                code: "ALREADY_IN_USE_MESSAGE",
                value: "Al in gebruik"
            },{
                code: "PASSWORD_NOT_MATCHED_MESSAGE",
                value: "Wachtwoord komt niet overeen"
            }, {
                code: "INVALID_EMAIL_MESSAGE",
                value: "Ongeldig e-mail"
            }, {
                code: "WELCOME",
                value: "Welkom"
            },{
                code: "WELCOME_MESSAGE",
                value: "Welkom bij Xepst SaaS ! Je gaat dit houden . Dit is de Dashboard pagina . Het is nu leeg , maar zoals u items toe te voegen , zal deze pagina interessanter geworden ."
            },{
                code: "CREATE_FIRST_PROJECT",
                value: "Maak het eerste project"
            },{
                code: "NO_SERVICE_REQUEST_MESSAGE",
                value: "Je hebt nog geen Task dus gewoon een maken ! Klik op de onderstaande knop om te beginnen"
            },{
                code: "NO_PROJECT",
                value: "geen Projecten"
            },{
                code: "NO_PROJECT_MESSAGE",
                value: "Je hebt geen projecten nog dus gewoon een maken ! Klik op de onderstaande knop om te beginnen. U nog niet aan een project toegewezen nog !"
            },{
                code: "SET_ADMIN",
                value: "Stel Admin"
            },{
                code: "TOTAL_SR",
                value: "Totaal Gemaakt SR"
            },{
                code: "CREATE_FIRST_SERVICE_REQUEST",
                value: "Maak de eerste Service Request"
            }]
        }
    ]
};

var sr_status = [
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
];
var priority = [
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
];
module.exports = {
    development: {
        db: 'mongodb://127.0.0.1/xepst',
        rootPath: rootPath,
        port: process.env.PORT || 3034,
        email_secret: "something secret",
        app_url: "localxepst.com:3030",
        sender_add: "softwarejavra@gmail.com",
        sender_pass:"javra123",
        sr_status: sr_status,
        priority : priority,
        defaultLanguageData: defaultLanguageData
    },
    production: {
        db: 'mongodb://localhost/xepst',
        rootPath: rootPath,
        port: process.env.PORT || 8080,
        email_secret: "something secret",
        app_url: "www.xepstsaas.com",
        sender_add: "softwarejavra@gmail.com",
        sender_pass: "javra123",
        sr_status: sr_status,
        priority : priority,
        defaultLanguageData: defaultLanguageData
    }
}

