/*------------------------------------------------------------------------------
  Copyright Javra Software - www.javra.com
--------------------------------------------------------------------------------
  File        : subdomain/server/controllers/languages.js
  Description :
  Input param :
  Output param:
  Author      : Subin Joshi
  Created     : 10/09/2015

Date   Author Version Description
------------------------------------------------------------------------
10/09/2015 v1 subin Creating all required logic                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                          
------------------------------------------------------------------------*/

var Language = require('mongoose').model('Language'),
    mongoose = require('mongoose');
var async = require('async');
var automatelanguagelabel = require('../utilities/automatelanguagelabel.js');



/*----------------------------------------------------------------------------------------------------
 Name: setLanguage
 Description: controller to create/set default languages when customer sign up 
 Author: SubinJoshi
 Date : 1 Sep 2015
------------------------------------------------------------------------------------------------------*/
exports.setLanguage = function(customerId) {

    var defaultLanguageData = {
        customer_id: customerId,
        lang: [{
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
                }]
            },

            {
                country_code: "de",
                country: "German",
                label: [{
                    code: "PROFILE",
                    value: "Profil"
                }, {
                    code: "LOGOUT",
                    value: "Abmelden"
                }, {
                    code: "CREATED_PROJECT",
                    value: "Erstellt Projekt"
                }, {
                    code: "DASHBOARD",
                    value: "Armaturenbrett"
                }, {
                    code: "USERS",
                    value: "Benutzer"
                }, {
                    code: "PROJECTS",
                    value: "Projekte"
                }, {
                    code: "SETTINGS",
                    value: "Einstellungen"
                }, {
                    code: "SEARCH",
                    value: "Geben Sie Ihren Suchbegriff ein..."
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
                }]
            }

        ]
    }

    Language.create(defaultLanguageData, function(err, language) {
        if (err) {
            return handleError(res, err);
        }
        automatelanguagelabel.createLanguageLabelForNewCustomer(customerId);
        return res.json(language);
    });

};

/*----------------------------------------------------------------------------------------------------
 Name: addNewLanguage
 Description: controller to add new languages by customer
 Author: SubinJoshi
 Date : 1 Sep 2015
------------------------------------------------------------------------------------------------------*/
exports.addNewLanguage = function(req, res) {

    Language.findOneAndUpdate({
        'customer_id': req.params.customerId
    }, {
        $push: {
            'lang': req.body
        }
    }, function(err, language) {
        if (err) {
            return handleError(res, err);
        }
        if (!language) {
            return res.send(404);
        }
        return res.json(200, language);
    });

};

/*----------------------------------------------------------------------------------------------------
 Name: getLanguageList
 Description: controller to get languages of customer
 Author: SubinJoshi
 Date : 2 Sep 2015
------------------------------------------------------------------------------------------------------*/
exports.getLanguageList = function(req, res) {

    Language.find({
        'customer_id': req.params.customerId
    }).exec(function(err, language) {
        if (err) {
            return handleError(res, err);
        }
        if (!language) {
            return res.send(404);
        }
        return res.json(language[0].lang);
    })
}

/*----------------------------------------------------------------------------------------------------
 Name: updateLanguage
 Description: controller to update language of customer
 Author: SubinJoshi
 Date : 2 Sep 2015
------------------------------------------------------------------------------------------------------*/
exports.updateLanguage = function(req, res) {
    Language.update({
        'lang._id': mongoose.Types.ObjectId(req.params.languageId)
    }, {
        '$set': {
            'lang.$.country_code': req.body.country,
            'lang.$.description': req.body.description,
            'lang.$.label': req.body.label,
        }
    }, function(err, language) {
        if (err) {
            res.send(err);
        }
        if (!language) {
            return res.send(404);
        }
        return res.json(language);
    });

}

/*----------------------------------------------------------------------------------------------------
 Name: getLanguageDetail
 Description: controller to get language detail of one language
 Author: SubinJoshi
 Date : 2 Sep 2015
------------------------------------------------------------------------------------------------------*/
exports.getLanguageDetail = function(req, res) {

    Language.aggregate({
        '$unwind': '$lang'
    }, {
        '$match': {
            'lang._id': mongoose.Types.ObjectId(req.params.languageId)
        }
    }, function(err, language) {
        // console.log('inside result');
        // console.log(language[0].lang);
        if (err) {
            return handleError(res, err);
        }
        if (!language) {
            return res.send(404);
        }
        return res.json(language[0].lang);
    });
}

/*----------------------------------------------------------------------------------------------------
 Name: deleteLanguage
 Description: controller to delete language from customer's language
 Author: SubinJoshi
 Date : 2 Sep 2015
------------------------------------------------------------------------------------------------------*/
exports.deleteLanguage = function(req, res) {

    Language.update({}, {
        $pull: {
            'lang': {
                _id: req.params.languageId
            }
        }
    }, {
        multi: true
    }, function(err, language) {
        if (err) {
            return handleError(res, err);
        }
        if (!language) {
            return res.send(404);
        }
        return res.json(language);
    });
}

/*----------------------------------------------------------------------------------------------------
 Name: getSelectedLanguageData
 Description: controller to get the values of labels of selected language, returns value of english language if the selected language is not found
 Author: Rikesh Bhansari
 Date : 2 Sep 2015
------------------------------------------------------------------------------------------------------*/
exports.getSelectedLanguageData = function(req, res) {
    var selectedLanguageData = {};
    console.log(req.query);
    Language.aggregate({
        "$unwind": "$lang"
    }, {
        "$match": {
            $and: [{
                'customer_id': req.user.customerId
            }, {
                'lang.country_code': req.query.lang
            }]
        }
    }).exec(function(err, language) {
        var languageData = [];
        if (err) {
            return handleError(res, err);
        }
        if (!language) {
            return res.send(404);
        }
        if (language.length > 0) {
            languageData = language[0].lang.label;
        } else {
            Language.aggregate({
                "$unwind": "$lang"
            }, {
                "$match": {
                    $and: [{
                        'customer_id': req.user.customerId
                    }, {
                        'lang.country_code': 'en'
                    }]
                }
            }).exec(function(err, languageDefault) {
                if (err) {
                    return handleError(res, err);
                }
                if (!language) {
                    return res.send(404);
                }
                console.log(languageDefault);
                languageData = languageDefault[0].lang.label;
            })
        }

        var size = languageData.length;
        for (var i = 0; i < size; i++) {
             
            selectedLanguageData[languageData[i].code] = languageData[i].value;
        }
        return res.json(selectedLanguageData);
    })
}

/*----------------------------------------------------------------------------------------------------
 Name: getCustomerLanguages
 Description: controller to get customer languages 
 Author: SubinJoshi
 Date : 2 Sep 2015
------------------------------------------------------------------------------------------------------*/
exports.getCustomerLanguages = function(req, res) {

    Language.find({
        'customer_id': req.params.customerId
    }, {
        'lang.country_code': true,
        'lang._id': true
    }).exec(function(err, language) {
        if (err) {
            return handleError(res, err);
        }
        return res.json(language[0].lang);
    })
};


/*----------------------------------------------------------------------------------------------------
 Name: getLanguageCode
 Description: Controller for getting dynamic label codes in language 
 Author: SubinJoshi
 Date : 3 Sep 2015
------------------------------------------------------------------------------------------------------*/
exports.getLanguageCode = function(req, res) {
    /** 
    finds label codes matching with customer id and of english language
    @subinjoshi 
    **/
    Language.aggregate({
        "$unwind": "$lang"
    }, {
        "$match": {
            $and: [{
                'customer_id': req.params.customerId
            }, {
                'lang.country_code': 'en'
            }]
        }
    }, {
        $project: {
            'lang.label.code': true,
            'lang.label.value': true
        }
    }).exec(function(err, language) {
        if (err) {
            return handleError(res, err);
        }
        if (!language) {
            return res.send(404);
        }
        return res.json(language[0].lang.label);
    })
}

/*----------------------------------------------------------------------------------------------------
 Name: getLanguageOptions
 Description: for displaying in dropdown options for language selection
 Author: SubinJoshi
 Date : 3 Sep 2015
------------------------------------------------------------------------------------------------------*/
exports.getLanguageOptions = function(req, res) {

    Language.find({
        'customer_id': req.user.customerId
    }, {
        'lang.country_code': true,
        'lang.country': true,
        'lang._id': true
    }).exec(function(err, language) {
        if (err) {
            return handleError(res, err);
        }
        return res.json(language[0].lang);
    })
}

/*----------------------------------------------------------------------------------------------------
 Name: checkCountry
 Description: check for the the already exist country
 Author: RuchiDhami
------------------------------------------------------------------------------------------------------*/

exports.checkCountry = function(req, res) {
    Language.find({
        'customer_id': req.user.customerId,
        'lang.country_code': req.body.country
    }, function(err, result) {
        if (err) {
            res.send(500, err)
        }
        if (result.length > 0) {
            res.send(true);

        } else {
            res.send(false)
        }
    })
};




/*----------------------------------------------------------------------------------------------------
 Name: findLanguageCode
 Description: controller to find language codes values of all languages on clicking code 
 Author: SubinJoshi
 Date : 3 Sep 2015
------------------------------------------------------------------------------------------------------*/
exports.findLanguageCode = function(req, res) {
    /** 
        match and gets all the labels values of all countries clicked on the label
        @subinjoshi
    **/
    Language.aggregate({
        "$match": {
            "customer_id": req.params.customerId
        }
    }, {
        "$unwind": "$lang"
    }, {
        "$unwind": "$lang.label"
    }, {
        "$match": {
            "lang.label.code": req.body.code
        }
    }, {
        "$project": {
            country: "$lang.country",
            countryId: "$lang._id",
            value: "$lang.label.value",
            labelId: "$lang.label._id",
            code: "$lang.label.code"
        }
    }, function(err, result) {
        if (err) {
            return handleError(res, err);
        }
        return res.json(result);
    })
}


/*----------------------------------------------------------------------------------------------------
 Name: updateLabelDescription
 Description: controller to update language code individually on click when displayed 
 Author: SubinJoshi
 Date : 3 Sep 2015
------------------------------------------------------------------------------------------------------*/
exports.updateLabelDescription = function(req, res) {

    Language.aggregate({
        "$match": {
            "customer_id": req.params.customerId
        }
    }, {
        "$unwind": "$lang"
    }, {
        "$match": {
            'lang.country': req.body.labelCountry
        }
    }, {
        "$unwind": "$lang.label"
    }, function(err, result) {

        if (result) {
            result.forEach(function(error, i) {
                if (result[i].lang.label.code == req.body.labelcode) {
                    var query = {};
                    query["lang.$.label." + i + ".value"] = req.body.editLabelData;

                    Language.update({
                        'customer_id': req.params.customerId,
                        'lang.country': req.body.labelCountry
                    }, {
                        $set: query
                    }, function(err, result2) {
                        if (err) {
                            return handleError(res, err);
                        }
                        return res.json(result2);
                    })
                }
            })
        }
    });
}


/*----------------------------------------------------------------------------------------------------
 Name: createLabelCode
 Description: controller to push new language code to all the languages array
 Author: SubinJoshi
 Date : 4th Sep 2015
------------------------------------------------------------------------------------------------------*/

exports.createLabelCode = function(req, res) {
    var code = ["firstname3", "lastname", "office3"];
    code.forEach(function(error, j) {
            Language.find({
                "lang.label.code": code[j]
            }).exec(function(err, result) {

                if (result.length >= 1) {
                    return res.json(result);
                } else {

                    Language.aggregate({

                        "$unwind": "$lang"
                    }, function(err, result) {
                        result.forEach(function(error, i) {
                            Language.update({
                                'customer_id': result[i].customer_id,
                                'lang.country': result[i].lang.country
                            }, {
                                $push: {
                                    "lang.$.label": {
                                        code: code[j],
                                        value: ""
                                    }
                                }
                            }, function(err, language) {
                                if (err) {
                                    return handleError(res, err);
                                }
                            })
                        })
                        if (err) {
                            return handleError(res, err);
                        }
                        return res.json(result);
                    });
                    if (err) {
                        return handleError(res, err);
                    }
                    return res.json('not found label code');
                }
            })
        }) //code for each ends

    res.send('1');
}
