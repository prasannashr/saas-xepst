var express = require('express');
var methodOverride = require('method-override');
var http = require('http');
var path = require('path');
var vhost = require('vhost');
var fs = require('fs');
var async = require("async");
var Language = require('../models/Language');
/*----------------------------------------------------------------------------------------------------
 Name: checkAndCreateLabelInDatabase
 Description: Check multilanguage Labels in html files and create in DB if not found in DB
 
 Author: PrasannaShrestha
------------------------------------------------------------------------------------------------------*/
exports.checkAndCreateLabelInDatabase = function(req, res) {
    var uniqueLabels = [];

    async.series([

        function(callback) {
            getLablesFromHTMLFiles(function(response) {               
                uniqueLabels = response;
                callback();
            })

        },
        function(callback) {
            async.forEach(uniqueLabels, function(label, callbackkk) {

                // Query to check label exist or not in language collection
                Language.find({
                    "lang.label.code": label
                }).exec(function(err, result) {

                    if (result.length >= 1) { // check result length if matched label exist or not
                        //console.log(' : Result found....: ' + label);
                    } else { // if not matched add label in each customer each languages
                        //console.log("Result not found.... : "+label);
                        var languages = {};
                        async.waterfall([
                            function(callback) {
                                // Query to get all customer languages
                                // so that we can add label to all customer's languages
                                Language.aggregate({
                                    "$unwind": "$lang"
                                }, function(err, result2) {
                                    languages = result2;
                                    callback();
                                })
                            },
                            function(callback) {
                                
                                async.forEach(languages, function(result, callbackkk) {
                                    //console.log('New label Added :: Country : ' + result.lang.country + 'Label: ' + label);
                                    // update new label in each languages for every customers
                                    // for example if there are 4 languages in customer it update new label in all 4 languages
                                    var lableValue = label.replace(/_/g, ' ');
                                    Language.update({
                                        'customer_id': result.customer_id,
                                        'lang.country_code': result.lang.country_code
                                    }, {
                                        $push: {
                                            "lang.$.label": {
                                                code: label,
                                                value: lableValue
                                            }
                                        }
                                    }, function(err, language) {

                                    })
                                }, function(err) {
                                    if (err) return callbackkk(err);
                                    callbackkk();
                                });
                            }
                        ], function(err) {

                        });
                    }

                })
            });
        }
    ], function(err) { //This function gets called after the two tasks have called their "task callbacks"
        if (err) return next(err);
        //Here locals will be populated with 'user' and 'posts'
        
    });
}

exports.createLanguageLabelForNewCustomer = function(customerId, res) {
        var uniqueLabels = [];

        async.series([

            function(callback) {
                getLablesFromHTMLFiles(function(response) {

                    uniqueLabels = response;
                    callback();
                })

            },
            function(callback) {
                async.forEach(uniqueLabels, function(label, callbackkk) {

                    //console.log(c+' : CHECK Label: '+label);
                    Language.find({
                        "lang.label.code": label,
                        "customer_id": customerId
                    }).exec(function(err, result) {

                        if (result.length >= 1) {                           
                            //console.log(' : Result found....: ' + label);
                        } else {
                           
                            //console.log(" : Result not found....: " + label + " CustomerId: " + customerId);
                            //var languages = {};
                            async.waterfall([
                                function(callback) {
                                    var languages = ["en", "nl", "de"]
                                    languages.forEach(function(error, i) {
                                           
                                            var lableValue = label.replace(/_/g, ' ');
                                            console.log(i + " : " + languages[i] + ' : Label: ' + label + " Value: " + lableValue);
                                            Language.update({
                                                'customer_id': customerId,
                                                'lang.country_code': languages[i]
                                            }, {
                                                $push: {
                                                    "lang.$.label": {
                                                        code: label,
                                                        value: lableValue
                                                    }
                                                }
                                            }, function(err, language) {
                                                //console.log(i + " = " + language);
                                            })
                                        },
                                        function(err) {
                                            if (err) return callbackkk(err);
                                            callbackkk();
                                        });
                                }
                            ], function(err) {

                            });
                        }

                    })
                });
            }
        ], function(err) { //This function gets called after the two tasks have called their "task callbacks"
            if (err) return next(err);
            //Here locals will be populated with 'user' and 'posts'           
        });
        
}
/*----------------------------------------------------------------------------------------------------
 Name: getLablesFromHTMLFiles
 Description: Check HTML files and returns unique lables metatag in array 
 
 Author: PrasannaShrestha
------------------------------------------------------------------------------------------------------*/
function getLablesFromHTMLFiles(callback) {
    var labels = [];
    // read templates directory files
    fs.readdir(__dirname + '/../../../public/app/templates', function(err, files) {

        files.filter(function(file) {
                //filter .html extension files and return it
                return file.substr(-5) === '.html';
            })
            .forEach(function(file) { // read all the filtered .html files in loop
                var buf = fs.readFileSync(__dirname + '/../../../public/app/templates/' + file, "utf8");
                var m;
                // pattern to search transalted label with in {{ | translate}}
                var re = /\{\{\"(.*?)\" \| translate\}\}/ig;
                //store all matched labels in labels array with above regular expression
                while (m = re.exec(buf)) {
                    labels.push(m[1]);
                }
            });
        //there may be multiple same labels in array so
        //getUniqueLanguageLabelsFromArray() will retrun unique labels only from array
        var uniqueLabels = getUniqueLanguageLabelsFromArray(labels);
        //console.log("uniqueLabels : " + uniqueLabels);
        return callback(uniqueLabels);

    });

}

/*----------------------------------------------------------------------------------------------------
 Name: getUniqueLanguageLabelsFromArray
 Description: Check Labels in array and return Unique labels only
 
 Author: PrasannaShrestha
------------------------------------------------------------------------------------------------------*/
function getUniqueLanguageLabelsFromArray(a) {
    var temp = {};
    for (var i = 0; i < a.length; i++) {
        temp[a[i]] = true;
    }
    var r = [];
    for (var k in temp) {
        r.push(k);
    }
    return r;
}
