angular.module('app').controller('mvNavBarLoginCtrl', function($scope, $http, mvIdentity, mvAuth, $location, $translate, Notification, $rootScope) {

    $scope.identity = mvIdentity;

    /*----------------------------------------------------------------------------------------------------
     Name           : 
     Description    : used to get the available languages for a customer to choose from
     Input param    : customerId
     Output param   : returns an object of language_code ('en') and it's description (English)
     Author         : Rikesh Bhansari
     created        : 11/09/2015
    ------------------------------------------------------------------------------------------------------*/
    if($scope.identity.isAuthenticated()) {
        $scope.countries ={};

        $http.get("/api/getLanguageOptions/").success(function(data) {
            $scope.languageOptions = data;

            //not an actual http call; reads file in app folder
            $http.get("app/languages/countriesList.json").success(function(response) {
                var size = response.length;
                for(var i=0;i<size;i++) {
                    $scope.countries[response[i].code] = response[i].name;
                }
                //set last change language from language dropdown list in $scope.lang
                $scope.lang = $translate.use();
            })
            .error(function(data, status) {
                    console.log(data || "Request failed");
            }); 

        }).error(function(err) {
            console.log("Error");
        });
    }

    /*-------------------------------------------------------------------------------------------------------
        Name: signin
        Description:  function for sign in process when sign in button in clicked
        Author: SubinJoshi        
    ------------------------------------------------------------------------------------------------------*/
    $scope.signin = function(email, password) {
        
        // calls authenticateUser function of mvAuth passing email and password from form        
        mvAuth.authenticateUser(email, password).then(function(success) {
            if (success) {
               Notification.info('You have successfully signed in!');
               window.location.href = '/';
            } else {
               Notification.info('Username/Password combination incorrect');
            }
        });
    }

    /*----------------------------------------------------------------------------------------------------
        Name: signin
        Description:   function for signout process when signout button is clicked 
        Author: SubinJoshi        
    ------------------------------------------------------------------------------------------------------*/
    $scope.signout = function() {
        
        //calls logoutUser function of mvAuth          
        mvAuth.logoutUser().then(function() {
            $scope.email = "";
            $scope.password = "";
            Notification.info('You have successfully signed out!');
            window.location.href = '/login';
        })
    }
    
    /*----------------------------------------------------------------------------------------------------
        Name           : changeLanguage
        Description    : function is called whenever user switches language
        Input param    : language code eg. 'en'
        Output param   : sets new language
        Author         : Rikesh Bhansari
        created        : 11/09/2015
    ------------------------------------------------------------------------------------------------------*/
    $scope.changeLanguage = function() {
        $rootScope.language = $scope.lang;
        $translate.use($scope.lang);
    };

    /*----------------------------------------------------------------------------------------------------
        Name           : getLabelDetails
        Description    : gets all the information relating to the translation label
        Input param    : translation label, customerId
        Output param   : calls a factory method passing the same input params
        Author         : Rikesh Bhansari
        created        : 11/09/2015
    ------------------------------------------------------------------------------------------------------*/
    $scope.getLabelDetails = function(label, customerId){
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
    $scope.updateLabelDescription = function(editedLabelValue, labelId, countryId, labelCode,labelCountry) {
        console.log('inside update label description');
        var customerId = mvIdentity.currentUser.customerId;

        mvAuth.updateLabelDescription(editedLabelValue, labelId, countryId, labelCode,labelCountry, customerId).then(function(response) {
            //window.location.reload(true);            
            
        })
    }

});
