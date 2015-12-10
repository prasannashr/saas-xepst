/*------------------------------------------------------------------------------
  Copyright Javra Software - www.javra.com
--------------------------------------------------------------------------------
  File        : public/app/main/people/roleCtrl.js
  Description :
  Input param :
  Output param:
  Author      : Subin Joshi
  Created     : 

Date   Author Version Description
------------------------------------------------------------------------
10/09/2015 v1 subin Creating all required logic                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                          
------------------------------------------------------------------------*/

angular.module('app').controller('roleCtrl', function($scope, $http, mvNotifier, Notification) {
    
    /*----------------------------------------------------------------------------------------------------
       Description:  gets all roles list to display 
       Author: SubinJoshi        
      ------------------------------------------------------------------------------------------------------*/
    $http.get("/api/getAllRoles").success(function(data) {
        $scope.roleList = data;
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
       Name: addNewRole
       Description: function to add new role
       Author: SubinJoshi        
      ------------------------------------------------------------------------------------------------------*/
    $scope.addNewRole = function(newrole){        
        $http.post("/api/createRole", newrole).success(function(data){
            Notification.info('Role has been created successfully!');
            
        })
    }

});
