angular.module('app').controller('mvProfileCtrl', function($scope, mvAuth, mvIdentity, $http,$window,$location, $translate, Notification, $rootScope) {
    $scope.identity = mvIdentity.currentUser;
    $scope.currentUser = mvIdentity;
    $scope.update = function() {
        var newUserData = {
            username: $scope.email,
            firstName: $scope.fname,
            lastName: $scope.lname
        }
       /* if ($scope.password && $scope.password.length > 0) {
            newUserData.password = $scope.password;
        }*/

        mvAuth.updateCurrentUser(newUserData).then(function() {
            Notification.info('Your user account has been updated');
        }, function(reason) {
            mvNotifier.error(reason);
        })
    }



    /*---------------------------------------------------------------------------
    Name: checkPassword
    Description: check the current password of customer's user in the database 
    Author: RuchiDhami
     ----------------------------------------------------------------------------*/

    $scope.checkPassword = function(type, password, id) {

        if (password != null && password != '') {
            var pass = {
                "type": type,
                "password": password,
                "id": id
            }
            $http.post('/checkCurrentPassword', pass).success(function(response) {

            }).error(function(response) {
                $scope.error = 'Password do not match with old password';

            });
            $scope.error = false;
        } else {
            $scope.error = 'Please fill the old password';
        }
    }



    /*---------------------------------------------------------------------------
        Name: changePassword
        Description: changes the password of login customer 
        Author: RuchiDhami
         ----------------------------------------------------------------------------*/

    $scope.changePassword = function(newpassword, id) {
        $scope.submitted = true;
        if ($scope.form1.$valid) {
            var password = {
                password: newpassword,
            }
            $http.put('/edit/' + id, password).success(function(response) {
                Notification.info('your password has been successfully changed');
                $location.path('/setting/user');
            });
        }
    }


    /*---------------------------------------------------------------------------
    Name: clearPassword
    Description: clear confirmNewPassword when edit NewPassword  
    Author: RuchiDhami
     ----------------------------------------------------------------------------*/
    $scope.clearPassword = function() {
        $scope.pass3 = "";

    }
});

/*---------------------------------------------------------------------------
Name: passwordVerify
Description: directive to matches the NewPassword and ConfirmNewPassword
Author: RuchiDhami
----------------------------------------------------------------------------*/

var app = angular.module('app');

app.directive("passwordVerify", function() {
    return {
        require: "ngModel",
        scope: {
            passwordVerify: '='
        },
        link: function(scope, element, attrs, ctrl) {
            scope.$watch(function() {
                var combined;

                if (scope.passwordVerify || ctrl.$viewValue) {
                    combined = scope.passwordVerify + '_' + ctrl.$viewValue;
                }
                return combined;
            }, function(value) {
                if (value) {
                    ctrl.$parsers.unshift(function(viewValue) {
                        var origin = scope.passwordVerify;
                        if (origin !== viewValue) {
                            ctrl.$setValidity("passwordVerify", false);
                            return undefined;
                        } else {
                            ctrl.$setValidity("passwordVerify", true);
                            return viewValue;
                        }
                    });
                }
            });
        }
    };
});
