/*------------------------------------------------------------------------------
  Copyright Javra Software - www.javra.com
--------------------------------------------------------------------------------
  File        : public/app/languages/languageCtrl.js
  Description :
  Input param :
  Output param:
  Author      : Subin Joshi
  Created     : 

Date   Author Version Description
------------------------------------------------------------------------
10/09/2015 v1 subin Creating all required logic                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                          
------------------------------------------------------------------------*/

angular.module('app').controller('languageCtrl', function($scope, $http, mvIdentity, $translate, mvAuth, $location, Notification) {

    var customerId = mvIdentity.currentUser.customerId;
    $scope.identity = mvIdentity.currentUser;
    $scope.currentUser = mvIdentity;

    $http.get("/api/getLanguageList/" + customerId).success(function(data) {
        $scope.languagelist = data;
    })

    $http.get("/api/getLanguageCode/" + customerId).success(function(data) {
        $scope.labelList = data;
    })

    $http.get('app/languages/countriesList.json').success(function(data) {
        $scope.countryList = data;        
    });
    
    /*----------------------------------------------------------------------------------------------------
        Name: addLanguage
        Description:  function to add new languages to customer language database
        Author: SubinJoshi        
    ------------------------------------------------------------------------------------------------------*/
    $scope.addLanguage = function(languageData) {

            if (languageData.description != null && languageData.description != '') {
                var dataObject = {
                    'country_code': languageData.country.code,
                    'country': languageData.country.name,
                    'description': languageData.description,
                    'label': languageData
                }
                $http.post("/api/addNewLanguage/" + customerId, dataObject).success(function(data) {
                    Notification.info('New Language has been addedd successfully!');
                    $location.path('/setting/language');

                })
            } else {
                $scope.error = 'This is required field!';
            }
        }
    /*---------------------------------------------------------------------------------------------------------
        Name: checkCountry
        Description: check the exist country in the database  
        Author: RuchiDhami
    -----------------------------------------------------------------------------------------------------*/
    $scope.checkCountry = function(country) {
        if (country != null && country != '') {
            $http.post('/api/checkCountry', {
                'country': country
            }).success(function(checkCountryresponse) {
                if (checkCountryresponse) {
                    $scope.checkCountryresponse = "This Language has already been used";
                } else {
                    $scope.checkCountryresponse = '';
                }
            })
        } else {
            $scope.checkCountryresponse = "This is required field!";
        }
    }





    /*----------------------------------------------------------------------------------------------------
        Name: editLanguage
        Description:  function to edit languages 
        Author: SubinJoshi        
       ------------------------------------------------------------------------------------------------------*/
    $scope.editLanguage = function(languageId, languageName) {
        $http.get("/api/getLanguageDetail/" + languageId).success(function(data) {
            $scope.languageDetail = data;
            $scope.labelList = data.label
        })
    }

    /*----------------------------------------------------------------------------------------------------
        Name: updateLanguageDetail
        Description:  function to update languages detail
        Author: SubinJoshi        
       ------------------------------------------------------------------------------------------------------*/
    $scope.updateLanguageDetail = function(languageData, label, languageId) {
        $http.put("/api/updateLanguage/" + languageId, languageData).success(function(data) {
            Notification.info('Language has been updated successfully!');
        })
    }

    /*----------------------------------------------------------------------------------------------------
       Name: deleteLanguage
       Description:  function to delete language
       Author: SubinJoshi        
      ------------------------------------------------------------------------------------------------------*/
    $scope.deleteLanguage = function(languageId) {
        $http.delete("/api/deleteLanguage/" + languageId).success(function(data) {
            Notification.info('Language has been deleted successfully!');
        })
    }


    $http.get("/api/getCustomerLanguages/" + customerId).success(function(data) {
        $scope.customerLanguageList = data;
    })

    $scope.selected = 0;
    $scope.getSelectedLanguageCodes = function(languageCode, index) {
        $scope.selected = index;
        console.log('inside get selected language codes');
        console.log(languageCode);

        $http.post("/api/findLanguageCode/" + customerId, {
            code: languageCode
        }).success(function(data) {
            $scope.languageLabelData = data;
        })
    }

    /*----------------------------------------------------------------------------------------------------
     Name           : getLabelDetails
     Description    : gets all the information relating to the translation label
     Input param    : translation label, customerId
     Output param   : calls a factory method passing the same input params
     Author         : Rikesh Bhansari
     created        : 11/09/2015
    ------------------------------------------------------------------------------------------------------*/
    $scope.getLabelDetails = function(label, customerId) {
        console.log("inside get getLabelDetails of projectdetailCtrl: ", label, customerId);
        mvAuth.getlabelDetails(label, customerId).then(function(response) {
            $scope.data = response;
        });
    }

    /*----------------------------------------------------------------------------------------------------
     Name           : updateLabelDescription
     Description    : updates the translation in database when user(superadmin) changes the translations and saves, and reloads the page
     Input param    : the details obtained from getLabelDetails, and updated labelValue(translation)
     Output param   : calls a factory method passing the same input params
     Author         : Rikesh Bhansari
     created        : 11/09/2015
    ------------------------------------------------------------------------------------------------------*/
    $scope.updateLabelDescription = function(editedLabelValue, labelId, countryId, labelCode, labelCountry, reload) {
        console.log('inside update label description');
        var customerId = mvIdentity.currentUser.customerId;

        mvAuth.updateLabelDescription(editedLabelValue, labelId, countryId, labelCode, labelCountry, customerId).then(function(response) {
            
        })
    }

})
