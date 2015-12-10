angular.module('app').controller('mvSignupCtrl', function($http, $scope, mvUser, $location, mvAuth, $window, $translate, Notification, $rootScope) {
    /*----------------------------------------------------------------------------------------------------
        Name        : signup
        Description :  function for signup process when customer signup 
        Author      : SubinJoshi        
       ------------------------------------------------------------------------------------------------------*/
    $scope.signup = function(isValid) {
        $scope.submitted = true;
        if (isValid) {
            var newUserData = {
                firstName: $scope.fname,
                lastName: $scope.lname,
                email: $scope.email,
                subdomain: $scope.subdomain,
                cname: $scope.cname
            };

            /**
             calls createCustomer function of mvAuth passing newUserData from form
             **/
            mvAuth.createCustomer(newUserData).then(function() {
                /** 
                display success notify message after signup completes using mvnotifier 
                **/
                Notification.info('User account created!! Email has been sent to your email address for verfication. <br> Thank You');
            }, function(reason) {
                mvNotifier.error(reason);
            });
            angular.element('#signup').modal('hide');

            //delay page reload to allow customer to view message. -- Rikesh Bhansari
            setTimeout(function(){location.reload(true)},3000)
        } else {
            Notification.info('User account not created. <br> Please try again.');
        }
    }

    /*----------------------------------------------------------------------------------------------------
        Name        : cancel
        Description :  function for closing the signup form 
        Author      : Rikesh Bhansari        
    ------------------------------------------------------------------------------------------------------*/
    $scope.cancel = function() {
        $scope.submitted = false;
        angular.element('#signup').modal('hide');
    }

    /*----------------------------------------------------------------------------------------------------
        Name        : checkAvailable
        Description : checks if either email or subdomain name is already used 
        Author      : Rikesh Bhansari        
    ------------------------------------------------------------------------------------------------------*/
    $scope.checkAvailable = function(field, checkVal) {
        switch (field) {
            case ("email"):
                $scope.emailUsed = false;
                break;
            case ("subdomain"):
                $scope.subdomainUsed = false;
                break;
        }

        if (checkVal != null) {
            var availableToBeChecked = {
                "field": field,
                "checkVal": checkVal
            };
            console.log(availableToBeChecked.field, availableToBeChecked.checkVal);
            $http.post('/checkavailable', availableToBeChecked).then(function(response) {
                console.log(response);
                if (field == "email") {
                    $scope.emailUsed = response.data;
                }
                if (field == "subdomain") {
                    $scope.subdomainUsed = response.data;
                }
            });
        }
    }

    $scope.subdomain = '';
    /*$scope.$watch('subdomain', function() {
        //$scope.subdomain = $scope.subdomain.replace(/\s+/g, '');
    });*/
})




