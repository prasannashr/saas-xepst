angular.module('app').controller('mvProfileCtrl', function($scope, mvAuth, mvIdentity, $http,$window,$location, $translate, Notification, $rootScope, $filter) {
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
            //Notification.info('Your user account has been updated');
        }, function(reason) {
            console.log(reason);
            $scope.errMessage = $filter('translate')('ERROR_MESSAGE');
            Notification.error($scope.errMessage);
        }).catch(function(data, status) {
            console.log(data);
            $scope.errMessage = $filter('translate')('ERROR_MESSAGE');
            Notification.error($scope.errMessage);
        });
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

            }).error(function(data, status) {
                console.log(data);
                $scope.error = $filter('translate')('PASSWORD_NOT_MATCHED_MESSAGE');
                $scope.errMessage = $filter('translate')('PASSWORD_NOT_MATCHED_MESSAGE');
                //Notification.error($scope.errMessage);
            })
            $scope.error = false;
        } else {
            $scope.error = $filter('translate')('PASSWORD_NOT_MATCHED_MESSAGE');
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
                Notification.info($filter('translate')('PASSWORD_CHANGE_SUCCESS_MESSAGE'));
                $location.path('/setting/user');
            }).error(function(data, status) {
                console.log(data);
                $scope.errMessage = $filter('translate')('ERROR_MESSAGE');
                Notification.error($scope.errMessage);
            })
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


