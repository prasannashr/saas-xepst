/*------------------------------------------------------------------------------
  Copyright Javra Software - www.javra.com
--------------------------------------------------------------------------------
  File        : public/app/main/people/peopleCtrl.js
  Description :
  Input param :
  Output param:
  Author      : Subin Joshi
  Created     : 

Date   Author Version Description
------------------------------------------------------------------------
10/09/2015 v1 subin Creating all required logic                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                          
------------------------------------------------------------------------*/

angular.module('app').controller('peopleCtrl', function($scope, $http, mvAuth, $location, mvIdentity, $rootScope, $window, $stateParams, $translate, Notification, Upload) {
    $scope.user = {};
    $scope.currentUser = mvIdentity;
    $scope.identity = mvIdentity.currentUser;
    $scope.defaultItem = 10;
    $scope.currentPage = 1;
    $rootScope.totalItem;
    $scope.loginUser = $scope.identity.app_users;
    $scope.invalidImage = false;

    /*---------------------------------------------------------------------------
    Name: sorting
    Description: sorting by firstName, lastName, email, UserType in userlist
    Author: RuchiDhami
     ----------------------------------------------------------------------------*/

    $scope.predicate = 'firstName';
    $scope.reverse = false;
    $scope.order = function(predicate) {
        $scope.reverse = ($scope.predicate === predicate) ? !$scope.reverse : true;
        $scope.predicate = predicate;
    };

    /** 
    user types to be displayed for options 
    **/
    $scope.roleList = [{
        name: 'admin'
    }, {
        name: 'user'
    }];

    /*----------------------------------------------------------------------------------------------------
       Name: addUser
       Description: function to add new customer's user by customer on clicking add user button
       Author: SubinJoshi        
      ------------------------------------------------------------------------------------------------------*/
    $scope.addUser = function(newuser) {
        $scope.submitted = true;
        if ($scope.form.$valid) {

            mvAuth.createCustomerUser(newuser).then(function() {
                /** 
                   display success notify message after new user created using mvnotifier 
                **/
                Notification.info('User account added!!');
                $location.path('/dashboard/setting/user');
            }, function(reason) {
                mvNotifier.error(reason);
            })
        }
    }

    /*---------------------------------------------------------------------------
    Name:totalItems
    Description: calculate the total number of user from the userlist
    Author: RuchiDhami
     ----------------------------------------------------------------------------*/

    $scope.totalItems = function(customerId) {
        $http.post("/api/totalCustomerUsers/" + customerId).success(function(response) {
            $rootScope.totalItem = response[0].totalUser;

        })
    }

    /*---------------------------------------------------------------------------
    Name:pageChanged
    Description: changes the page of userlist by clicking the page number
    Author: RuchiDhami
     ----------------------------------------------------------------------------*/

    $scope.pageChanged = function(currentPage) {
        $scope.currentPage = currentPage;
        $http.post("/api/customerUsers", {
            limit: $scope.defaultItem,
            pageno: currentPage
        }).success(function(response) {
            $scope.user = response[0].app_users;
        });
    }

    /*---------------------------------------------------------------------------
    Name:changedDefaultItem
    Description:changes the limit value dynamically 
    Author: RuchiDhami
     ----------------------------------------------------------------------------*/

    $scope.changedefaultitem = function(changeItem, currentPage) {
        var obj = [];
        $scope.item = 10;
        $scope.currentPage = currentPage;
        changeItem = parseInt(changeItem);
        $scope.defaultItem = changeItem;
        $http.post("/api/customerUsers", {
            limit: changeItem,
            pageno: currentPage

        }).success(function(response) {
            $scope.user = response[0].app_users;
            $rootScope.total = Math.ceil($rootScope.totalItem / $scope.item)
            var number = 0;
            for (var i = 1; i <= $rootScope.total; i++) {
                number += $scope.item;
                obj.push(number);
            }
            $scope.obj = obj;
        })
    }

    /*----------------------------------------------------------------------------------------------------
       Name: deleteUser
       Description: function to delete user from user collection on clicking delete user button 
       Author: SubinJoshi        
      ------------------------------------------------------------------------------------------------------*/
    $scope.deleteUser = function(userId) {
        $scope.deleteuser = userId;

        /**function to ask confirmation before delete user  
        @RuchiDhami
        **/
        $scope.delete = function(deleteUserId) {
            $http.delete("/api/deleteUser/" + deleteUserId).success(function(data) {
                // delete user without reload the whole page
                if ($scope.user.length != 1) {
                    $scope.pageChanged($scope.currentPage)
                } else {

                    $scope.pageChanged($scope.currentPage - 1)
                        // show changes effect on pagination after delete user when user is less than 0
                    $scope.totalItems($scope.identity.customerId);
                }

                Notification.info('User has been deleted successfully!');
                $location.path('/dashboard/setting/user');
            })
        }
    }

    /*----------------------------------------------------------------------------------------------------
       Description: function to get user data by user ID on clicking edit user button to display in popup with user data
       Author: SubinJoshi        
      ------------------------------------------------------------------------------------------------------*/

    $scope.userId = $stateParams.userId;
    if ($scope.userId != undefined) {
        $http.get("/api/getUserDetail/" + $scope.userId).success(function(data) {
            $scope.newuser = data;
            //alert(JSON.stringify($scope.newuser));
            $scope.clickEdit = true;
        })
    }

    /*----------------------------------------------------------------------------------------------------
       Name: editUser
       Description:   function to get user detail by its id to be displayed for edit
       Author: SubinJoshi        
      ------------------------------------------------------------------------------------------------------*/
    $scope.editUser = function(userId) {
        $http.get("/api/getUserDetail/" + $scope.userId).success(function(data) {
            $scope.newuser = data;
            $scope.clickEdit = true;
        })
    }

    /*----------------------------------------------------------------------------------------------------
       Name: updateUser
       Description: function to update user detail with form data by user ID  
       Author: SubinJoshi        
      ------------------------------------------------------------------------------------------------------*/
    $scope.updateUser = function(userId, edituser) {
        $http.put("/api/updateCustomerUser/" + userId, edituser).success(function(data) {
            Notification.info('User has been updated successfully!');
            $location.path('/dashboard/setting/user');
        })
    }

    /*----------------------------------------------------------------------------------------------------
       Name: addNewRole
       Description:  function to add new role with form data in the role collection 
       Author: SubinJoshi        
      ------------------------------------------------------------------------------------------------------*/
    $scope.addNewRole = function(newrole) {
        $http.post("/api/createRole", newrole).success(function(data) {
            Notification.info('Role has been created successfully!');

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
    $scope.updateLabelDescription = function(editedLabelValue, labelId, countryId, labelCode, labelCountry) {
        var customerId = mvIdentity.currentUser.customerId;

        mvAuth.updateLabelDescription(editedLabelValue, labelId, countryId, labelCode, labelCountry, customerId).then(function(response) {
            //window.location.reload(true);
            
        })
    }

    /*------------------------------------------------------------------------------------------------------------
    Name:updtaeProfile
    Description: function to update the loginUser 
    Author: RuchiDhami
     ---------------------------------------------------------------------------------------------------------*/
    $scope.updateProfile = function(editLoginUser) {
        $scope.submitted = true;
        if ($scope.form1.$valid) {
          if(editLoginUser.profilePic) {
              var file = editLoginUser.profilePic;
              file.upload = Upload.upload({
                  url: 'api/upload?userId=' + editLoginUser._id,
                  data: {
                      profilePic: file
                  }
              });

              file.upload.then(function(response) {
                  delete editLoginUser.profilePic;
                  editLoginUser.proPic = response.data.path;
                  profileUpdate(editLoginUser, mvIdentity.currentUser.customerId);
              }, function(response) {
                  if (response.status > 0)
                      $scope.errorMsg = response.status + ': ' + response.data;
              }, function(evt) {
                  file.progress = Math.min(100, parseInt(100.0 * evt.loaded / evt.total));
              });
          } else {
              profileUpdate(editLoginUser, mvIdentity.currentUser.customerId);
          }    
        }
    }

    var profileUpdate = function(editLoginUser, customerId) {
      $http.put("/api/updateLoginUser", editLoginUser)
      .success(function(data) {
        mvIdentity.setUserProfile(editLoginUser);
          Notification.info('User has been updated successfully!');
          window.location.reload(true);
          $location.path('/dashboard/setting/profile');
      })
    }



    /*------------------------------------------------------------------------------------------------------------
    Name:checkEmailOfUser
    Description: function to check either user email has already been used or not  
    Author: RuchiDhami
     ---------------------------------------------------------------------------------------------------------*/
    $scope.checkEmailOfUser = function(customerId, checkemail) {
        if (checkemail != null && checkemail != '') {
            $http.post('/api/checkEmailForUser/' + customerId, {
                'checkemail': checkemail
            }).success(function(response) {
                if (response) {
                    $scope.response = "This email has already been used";
                } else {
                    $scope.response = "";
                }

            })
        } else {
            $scope.response = '';
        }
    }
});

angular.module('app').controller('generalCtrl', function($scope, $http, mvAuth, $location, generalServices, mvIdentity, $rootScope, $window, $stateParams, $translate, Notification, $filter, $timeout) {

    $scope.currentUser = mvIdentity;
    $scope.identity = mvIdentity.currentUser;
    $scope.priorityTitle=[];
    $scope.maxPriority = mvIdentity.currentUser.maxPriority;   
    generalServices.getPriorityList().then(function(response) {
        angular.forEach(response, function(value, key) {
          //console.log(value.meaning);
          $scope.priorityTitle.push(value.meaning);
        });
        //$timeout();
        $scope.srPriority = response;
    });

    //set languageOptionOnOff value true/false from customer setting model
    $scope.languageOptionOnOff = $scope.identity.languageOption;
   

    /*----------------------------------------------------------------------------------------------------
       Name           : changeLanguageEditOption
       Description    : updates the langauge edit popup option true/false for every particular customers
       Input param    : boolean value true/false
       Output param   : update true/false in customer model/collection languageOption
       Author         : Prasanna Shrestha
       created        : 12/10/2015
      ------------------------------------------------------------------------------------------------------*/
    $scope.changeLanguageEditOption = function() {

        //console.log('This is the state of my model ' + $scope.onOff);
        var option = {
            "status": $scope.languageOptionOnOff
        }
        $http.post("/api/updateLanguageEditOption/" + $scope.identity.customerId, option).success(function(data) {
            //Notification.info('Language Edit Option has been updated successfully!');
            //$location.path('/setting/general');
            mvIdentity.setLanguageEditOption($scope.languageOptionOnOff);
        })

    };
    /*----------------------------------------------------------------------------------------------------
       Name           : updatePriorityMeaning
       Description    : This function updates the SR Priorities Meaning 
       Input param    : boolean value true/false
       Output param   : no return value
       Author         : Prasanna Shrestha
       created        : 12/10/2015
      ------------------------------------------------------------------------------------------------------*/
    $scope.updatePriorityMeaning = function(id, value) {

        generalServices.updatePriorityList(id, value);

    };

     //set  resolutionType value true/false from customer setting model
    $scope.resolutionType = $scope.identity.resolutionType;
    /*--------------------------------------------------------------------------------------------------------
       Name           : changeLanguageEditOption
       Description    : updates the langauge edit popup option true/false for every particular customers
       Input param    : boolean value true/false
       Output param   : update true/false in customer model/collection languageOption
       Author         : Prasanna Shrestha
       created        : 12/10/2015
    ------------------------------------------------------------------------------------------------------*/
    $scope.changeResolutionType = function() {

        console.log('This is the state of my model ' + $scope.resolutionType);
        var option = {
            "status": $scope.resolutionType
        }
        $http.put("/api/updateResolutionType/" + $scope.identity.customerId, option).success(function(data) {
            //Notification.info('Language Edit Option has been updated successfully!');
            //$location.path('/setting/general');
            mvIdentity.setResolutionType($scope.resolutionType);
        })

    };
    
     
    /*--------------------------------------------------------------------------------------------------------
       Name           : showMaxAttachmentList
       Description    : this function list all 1 - 10 list in combo option for max attachement updates
       Input param    : array of number 1- 10 i.e $scope.maxAttachmentOptions
       Output param   : 
       Author         : Prasanna Shrestha
       created        : 14/10/2015
    --------------------------------------------------------------------------------------------------------*/
    // set maxAttachmentOptions varabile to set 1-10 combo option for max attachment
    $scope.maxAttachmentOptions = ['1','2','3','4','5','6','7','8','9','10'];

    $scope.showMaxAttachmentList = function() {
        var selected = $filter('filter')(['1','2','3','4','5','6','7','8','9','10'],$scope.identity.maxAttachment);
        return selected[0];
    };

    /*-------------------------------------------------------------------------------------------------------
       Name           : updateMaxAttachment
       Description    : this function update Max Attachment from combo box for that particular customer
       Input param    : maxVal from combo box array of number 1- 10 i.e $scope.maxAttachmentOptions
       Output param   : 
       Author         : Prasanna Shrestha
       created        : 14/10/2015
    --------------------------------------------------------------------------------------------------------*/
    $scope.updateMaxAttachment = function(maxVal) {
      var option = {
            "maxVal": maxVal
      }
      $http.post("/api/updateMaxAttachment/" + $scope.identity.customerId, option).success(function(data) {
          //Notification.info('Language Edit Option has been updated successfully!');
          //$location.path('/setting/general');
          mvIdentity.setMaxAttachment(maxVal);
      })
    };

    // set maxPriorityOptions varabile to set 1-10 combo option for max attachment
    $scope.maxPriorityOptions = ['3','4','5'];
    
    $scope.showMaxPriorityList = function() {
        var selected = $filter('filter')($scope.maxPriorityOptions,$scope.identity.maxPriority);
        return selected[0];
    };

    /*-------------------------------------------------------------------------------------------------------
       Name           : updateMaxPriority
       Description    : this function update Max Priority from combo box for that particular customer's SR
       Input param    : maxVal from combo box array of number 3- 5 i.e $scope.maxPriorityOptions min 3, max 5
       Output param   : 
       Author         : Prasanna Shrestha
       created        : 30/10/2015
    --------------------------------------------------------------------------------------------------------*/
    $scope.updateMaxPriority = function(maxVal) {
      $scope.maxPriority = maxVal;
      var option = {
            "maxVal": maxVal
      }
      $http.post("/api/updateMaxPriority/" + $scope.identity.customerId, option).success(function(data) {
          mvIdentity.setMaxPriority(maxVal);
          $window.location.reload();
      })
    };
    
    /*---------------------------------------------------------------------------------------------------
       Name: addSRType
       Description: function to add the Sr type in the General page 
       Author: RuchiDhami
    -----------------------------------------------------------------------------------------------------*/
    $scope.addSRType = function(newsrtype, customerId) {
        if (newsrtype != null && newsrtype != '') {

            $http.put("/api/addSRType/" + customerId, newsrtype).success(function(response) {
                // to show the added SrType without reloading page 
                $scope.getSrTypeAndStatus(customerId);
                // to make the input field empty after adding Srtype
                $scope.newsrtype.name = '';
                Notification.info('Type has been added successfully!');
                $location.path('/dashboard/setting/general');
            })
        } else {
            $scope.Srtype_error = 'Required field';
          
        }
    }

    /*----------------------------------------------------------------------------------------------------
       Name: addResolutionType
       Description: function to add Resolution Type in customer setting page   
       Author: Prasanna Shrestha
    -----------------------------------------------------------------------------------------------------*/
    $scope.addResolutionType = function(newResolutionType, customerId) {
        if (newResolutionType != null && newResolutionType != '') {

            $http.post("/api/resolutionType/" + customerId, newResolutionType).success(function(response) {
                // to show the added Resolution Type without reloading page 
                $scope.getResolutionType(customerId);
                // to make the input field empty after adding Resolution Type
                $scope.newResolutionType.name = '';
                Notification.info('Resolution Type has been added successfully!');
                $location.path('/dashboard/setting/general');
            })
        } else {
            $scope.resolution_error = 'Required field';
        }
    }

    /*---------------------------------------------------------------------------------------------------
        Name: updateResolutionType
        Description: function to update the Resolution Type in customer setting page   
        Author: Prasanna Shrestha
    -----------------------------------------------------------------------------------------------------*/
    $scope.updateResolutionType = function(typeId, name) {
        $http.put("/api/resolutionType/" + typeId, {
            'name': name
        }).success(function(response) {
            Notification.info('Resolution Type has been updated successfully!');
            $location.path('/dashboard/setting/general');
        })

    }

    /*----------------------------------------------------------------------------------------------------
        Name: getResolutionType
        Description: function to get all Resolution Type from the database 
        Author: Prasanna Shrestha
    -----------------------------------------------------------------------------------------------------*/
    $scope.getResolutionType = function(customerId) {
        $http.get("/api/resolutionType/" + customerId).success(function(result) {
            $scope.resolutionTypes = result.setting.resolutionTypes;           
        })
    }

    /*-----------------------------------------------------------------------------------------------------
        Name: deleteResolutionType
        Description: function to delete Resolution Type from the database  
        Author: Prasanna Shrestha
     -----------------------------------------------------------------------------------------------------*/
    $scope.deleteResolutionType = function(typeId, index) {
        $http.delete("/api/resolutionType/" + typeId).success(function(data) {
            // to show the deleted Srtype by passing the index without reloading page 
            $scope.resolutionTypes.splice(index, 1);
            Notification.info('Resolution Type has been deleted successfully!');
            $location.path('/dashboard/setting/general');
        })
    }

    /*----------------------------------------------------------------------------------------------------
        Name: getSrTypeAndStatus
        Description: function to find the added Sr type from the database and displayed in the general page
        Author: RuchiDhami
    -----------------------------------------------------------------------------------------------------*/
    $scope.getSrTypeAndStatus = function(customerId) {
        $http.get("/api/getSrType/" + customerId).success(function(result) {
            $scope.srType = result.setting.sr_type;
            $scope.srStatus = result.setting.sr_status;
        })
    }
    
    /*----------------------------------------------------------------------------------------------------
        Name: updateSrType
        Description: function to update the added Sr type in the general page 
        Author: RuchiDhami
    -----------------------------------------------------------------------------------------------------*/
    $scope.updateSrType = function(typeId, name) {
        $http.put("/api/updateSrType/" + typeId, {
            'name': name
        }).success(function(response) {
            Notification.info('Type has been updated successfully!');
            $location.path('/dashboard/setting/general');
        })

    }



    /*-----------------------------------------------------------------------------------------------------
        Name: deleteSrType
        Description: function to delete Sr type from the database  
        Author: RuchiDhami
     -----------------------------------------------------------------------------------------------------*/
    $scope.deleteSrType = function(typeId, index) {
        $http.delete("/api/deleteSrType/" + typeId).success(function(data) {
            // to show the deleted Srtype by passing the index without reloading page 
            $scope.srType.splice(index, 1);
            Notification.info('Type has been deleted successfully!');
            $location.path('/dashboard/setting/general');
        })
    }


    /*----------------------------------------------------------------------------------------------------
        Name: updateSrStatus
        Description: function to update Sr Status in database (true/false) by clicking check box  
        Author: Prasanna Shrestha
    -----------------------------------------------------------------------------------------------------*/

    $scope.updateStatus = function(srStatus) {
        console.log(srStatus);
        $http.put("/api/updateSrStatus/" + srStatus._id, {
            'value': srStatus.value
        }).success(function(response) {
            $location.path('/dashboard/setting/general');
        })
    }

    /*---------------------------------------------------------------------------------------------------------
      Name: checkSrStatusUsed
      Description: function to check Sr Status is used or not in any SR or not  
      Author: Prasanna Shrestha
    -----------------------------------------------------------------------------------------------------*/

    $scope.checkSrStatusUsed = function(srStatus) {
        $http.get("/api/checkSrStatusUsed/" + srStatus.order).success(function(response) {
          console.log("Response:: ",response);
          if(response==0){
            $scope.updateStatus(srStatus);            
          }else{
            srStatus.value = true;
            alert("This Status is already in used so you can't uncheck it. Thank you");
          }
          $location.path('/dashboard/setting/general');
        })
    }


});

angular.module('app').controller('userGroupCtrl', function($scope, $http, mvIdentity, Notification) {
    
    /*----------------------------------------------------------------------------------------------------
       Description:  gets all roles list to display 
       Author: SubinJoshi        
      ------------------------------------------------------------------------------------------------------*/
    $http.get("/api/getAllRoles").success(function(data) {
        $scope.userGroups = data;
    })

    /*----------------------------------------------------------------------------------------------------
       Name: editRoleGroup
       Description:  function to get role detail by role ID on clicking edit role button to display in popup with role data
       Author: SubinJoshi        
      ------------------------------------------------------------------------------------------------------*/
    $scope.editRoleGroup = function(roleId) {
        $http.get("/api/getRoleDetail/" + roleId).success(function(data) {
            $scope.newrole = data;
            $scope.clickRole = true;
        })
    }

    /*----------------------------------------------------------------------------------------------------
       Name: updateRole
       Description: function to update role detail with form role data by role ID
       Author: SubinJoshi        
      ------------------------------------------------------------------------------------------------------*/
    $scope.updateRole = function(roleId, editRoleData) {
        $http.put("/api/updateRoleGroup/" + roleId, editRoleData).success(function(data) {
            Notification.info('Role Group has been updated successfully!');
            $location.path('/');
        })
    }

    /*----------------------------------------------------------------------------------------------------
       Name: deleteRoleGroup
       Description: function to delete role by role ID 
       Author: SubinJoshi        
      ------------------------------------------------------------------------------------------------------*/
    $scope.deleteRoleGroup = function(roleId) {
        $http.delete("/api/deleteRoleGroup/" + roleId).success(function(data) {
            Notification.info('Role Group has been deleted successfully!');
            console.log('success delete');
        })
    }

    /*----------------------------------------------------------------------------------------------------
       Name: addUserGroup
       Description: function to add new role
       Author: Prasanna Shrestha        
      ------------------------------------------------------------------------------------------------------*/
    $scope.addUserGroup = function(newrole){   
      $scope.submitted = true;
      if ($scope.form.$valid) {     
        $http.post("/api/createRole", newrole).success(function(data){
            Notification.info('User Group has been created successfully!');            
        })
      }
    }    

});
