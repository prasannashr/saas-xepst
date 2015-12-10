/*------------------------------------------------------------------------------
  Copyright Javra Software - www.javra.com
--------------------------------------------------------------------------------
  File        : public/app/account/mvAuth.js
  Description :
  Input param :
  Output param:
  Author      : Subin Joshi
  Created     : 

Date   Author Version Description
------------------------------------------------------------------------
10/09/2015 v1 subin Creating all required logic                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                          
------------------------------------------------------------------------*/

angular.module('app').factory('mvAuth', function($http, mvIdentity, $q, mvUser, $window, $translate) {
    
    return {
        /*----------------------------------------------------------------------------------------------------
         Name: authenticateUser
         Description:  authenticate user using email and password and if authenticated store user's info in currentUser session 
         Author: SubinJoshi        
        ------------------------------------------------------------------------------------------------------*/
        authenticateUser: function(email, password) {
            var dfd = $q.defer();
            /** 
            check login with email and password from the form in the database
            **/
            $http.post('/api/login', {
                email: email,
                password: password
            }).then(function(response) {
                if (response.data.success) {
                    var user = new mvUser();
                    // copies properties of response.data.user to user using angular.extend                     
                    angular.extend(user, response.data.user);
                    $http.get('/api/login').then(function(res) {
                        if (res.data) {
                            $window.localStorage["currentUser"] = JSON.stringify(res.data);
                        }
                    });                   
                    dfd.resolve(true);
                } else {
                    dfd.resolve(false);
                }
            });
            return dfd.promise;
        },

        /*----------------------------------------------------------------------------------------------------
         Name: createCustomer
         Description:   create customer on signup form 
         Author: SubinJoshi        
        ------------------------------------------------------------------------------------------------------*/
        createCustomer: function(newUserData) {
            var dfd = $q.defer();
            /** 
            create new customer in customer collection and user in user collection with the new User Data  
            **/
            $http.post('/api/createCustomer', newUserData).then(function(response) {
                if (response.data.success) {
                    dfd.resolve(true);
                } else {
                    dfd.resolve(false);
                }
            });
            return dfd.promise;
        },

        /*----------------------------------------------------------------------------------------------------
         Name: createCustomerUser
         Description: Create customer's users on adding user by customer 
         Author: SubinJoshi        
        ------------------------------------------------------------------------------------------------------*/
        createCustomerUser: function(user) {
            var dfd = $q.defer();
            /** 
            post new added user data from the form and creates new user in the user collection as customer's user 
            **/
            $http.post('/api/users/addUser', user).then(function(response) {
                if (response.data.success) {
                    dfd.resolve(true);
                } else {
                    dfd.resolve(false);
                }
            });
            return dfd.promise;
        },

        /*----------------------------------------------------------------------------------------------------
         Name: updateCurrentUser
         Description:  update current user info 
         Author: SubinJoshi        
        ------------------------------------------------------------------------------------------------------*/
        updateCurrentUser: function(newUpdateUserData) {
            var dfd = $q.defer();
            /**
             copies properties of currentUser to clone using angular.copy 
             **/
            var clone = angular.copy(mvIdentity.currentUser);
            var userId = mvIdentity.currentUser[0].app_users._id;

            /** 
            updates user data from the form in the database by user ID 
            **/
            $http.put('/api/users/' + userId, newUpdateUserData).then(function(response) {
                if (response.data.success) {
                    dfd.resolve(true);
                } else {
                    dfd.resolve(false);
                }
            });
            return dfd.promise;
        },

        /*----------------------------------------------------------------------------------------------------
         Name: logoutUser
         Description:  destroy currentuser session info 
         Author: SubinJoshi        
        ------------------------------------------------------------------------------------------------------*/
        logoutUser: function() {
            var dfd = $q.defer();
            $http.post('/logout', {
                logout: true
            }).then(function() {
                mvIdentity.currentUser = undefined;
                $window.localStorage.currentUser = null;
                dfd.resolve();
            });
            return dfd.promise;
        },

        authorizeCurrentUserForRoute: function(role) {
            if (mvIdentity.isAuthorized(role)) {
                return true;
            } else {
                return $q.reject('not authorized');
            }

        },

        authorizeAuthenticatedUserForRoute: function() {
            if (mvIdentity.isAuthenticated()) {
                return true;
            } else {
                return $q.reject('not authorized');
            }
        },

        /*----------------------------------------------------------------------------------------------------
         Name           : getLabelDetails
         Description    : gets all the information relating to the translation label
         Input param    : translation label, customerId
         Output param   : returns all the translations for a code(label)
         Author         : Rikesh Bhansari
         created        : 11/09/2015
        ------------------------------------------------------------------------------------------------------*/
        getlabelDetails: function(label, customerId) {
            return $http.post('/api/findLanguageCode/'+customerId, {code:label}).then(function(response) {
                console.log(response.data);
                return response.data;   
            });
        },

        /*----------------------------------------------------------------------------------------------------
         Name           : updateLabelDescription
         Description    : updates the translation in database when user(superadmin) changes the translations and saves, and reloads the page
         Input param    : the details obtained from getLabelDetails, and updated labelValue(translation)
         Output param   : returns updated translation
         Author         : Rikesh Bhansari
         created        : 11/09/2015
        ------------------------------------------------------------------------------------------------------*/
        updateLabelDescription: function(editedLabelValue, labelId, countryId, labelCode,labelCountry, customerId) {
            var update = $http.put("/api/updateLabelDescription/" + customerId, {
              editLabelData: editedLabelValue,
              labelId:labelId,
              countryId : countryId,
              labelcode : labelCode,
              labelCountry: labelCountry
            }).success(function(data) {
              // reload the change values in languages
              $translate.refresh();
              return data;
            });
            return update;
        },
        getUserList: function() {
            return $http.get("/api/customerUsers/name").then(function(response) {
                //console.log(response.data);
                return response;   
            });
        },

        updateorganization: function(updateorganization, customerId) {
          $http.put("/api/updateOrganization/" + customerId,updateorganization).then(function(response){
            return response;
          });
        },

        /*----------------------------------------------------------------------------------------------------
         Name           : getUserName
         Description    : gets the fullname of user by using their id as input
         Input param    : userId
         Output param   : fullname and profile picture path of the user with the input param
         Author         : Rikesh Bhansari
         created        : 2015/11/05
        ------------------------------------------------------------------------------------------------------*/
        getUserName: function(userId) {
          var dfd = $q.defer();
          // console.log(userId);
          $http.get('/api/getUserName/' + userId).then(function(response) {
            // console.log(response);
              if (response.data.app_users.firstName) {
                  var user = {};
                  user.name = response.data.app_users.firstName + ' ' + response.data.app_users.lastName;
                  user.proPic = response.data.app_users.proPic;
                  dfd.resolve(user);
              } else {
                console.log('failure');
                  dfd.resolve(false);
              }
          });
          return dfd.promise;
      }
    }
});
