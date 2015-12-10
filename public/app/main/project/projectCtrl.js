/*--------------------------------------------------------------------------
  Copyright Javra Software - www.javra.com
  --------------------------------------------------------------------------
  File        : public/app/main/project/projectCtrl.js
  Description :
  Input param :
  Output param:
  Author      : Subin Joshi
  Created     : 

  Date   Author Version Description
  ------------------------------------------------------------------------
  10/09/2015 v1 subin Creating all required logic                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                          
------------------------------------------------------------------------*/

angular.module('app').controller('projectCtrl', function($scope, $http, mvIdentity, $location, $stateParams, Notification, mvAuth, $rootScope) {

    var customerId = mvIdentity.currentUser.customerId;
    $scope.userNameList = [];
    var id = $stateParams.projectId;

    $scope.dateOptions = {
        formatYear: 'yy',
        startingDay: 1
    };


    $scope.startDate = {
        opened: false
    };
    $scope.endDate = {
        opened: false
    };

    /*----------------------------------------------------------------------------------------------------
       Description:   gets project detail by project ID to be displayed on clicking one project
       Author: SubinJoshi        
    ------------------------------------------------------------------------------------------------------*/
    if (id) {
        $http.get("/api/getProjectDetail/" + id).success(function(data) {

            $scope.projectDetail = data;
            angular.forEach(data.members, function(member) {
                delete member._id;
            });

            mvAuth.getUserList().then(function(userNameData) {
                $scope.editproject = data;
                $scope.userNameList = userNameData.data;
                console.log("UserData : " + $scope.userNameList);
            });

            $scope.projectDetail.project_startDate = new Date(data.project_startDate);
            $scope.projectDetail.project_endDate = new Date(data.project_endDate)
            $scope.projectMembers = data.members;
        })
    }

    /*----------------------------------------------------------------------------------------------------
      Description:   gets customer's user name to display in options for adding members while creating project 
      Author: SubinJoshi        
    ------------------------------------------------------------------------------------------------------*/
    mvAuth.getUserList().then(function(userNameData) {
        $scope.userNameList = userNameData.data;
        //console.log("userNameList : ",userNameData.data);
    });

    /*----------------------------------------------------------------------------------------------------
      Name: addProject
      Description:   function to create/post new project with newproject data from form with customer ID
      Author: SubinJoshi        
    ------------------------------------------------------------------------------------------------------*/
    $scope.addProject = function(newproject) {
        $scope.submitted = true;
        if ($scope.form1.$valid) {
            $http.post("/api/createProject/" + customerId, newproject).success(function(data) {
                Notification.info('New Project has been created successfully');

                window.location.reload(true);
                $location.path("/setting/project");
            })
        }
    }

    /*----------------------------------------------------------------------------------------------------
      Description:    function to get all the projects of customer by customer ID 
      Author: SubinJoshi        
    ------------------------------------------------------------------------------------------------------*/
    $http.get("/api/getProjectList/" + customerId).success(function(projectData) {
        $scope.projectData = projectData;
    })

    /*----------------------------------------------------------------------------------------------------
      Name: deleteProject
      Description:  function to delete project by project ID 
      Author: SubinJoshi        
    ------------------------------------------------------------------------------------------------------*/
    $scope.deleteProject = function(projectId) {
        $http.delete("/api/deleteProject/" + projectId).success(function(data) {
            Notification.info('Project has been Deleted!!');
        })
    }

    /*----------------------------------------------------------------------------------------------------
      Name: editProject
      Description:  function to get project data by project ID on clicking edit project button to display in popup with project data
      Author: SubinJoshi        
    ------------------------------------------------------------------------------------------------------*/
    $scope.editProject = function(project) {
        $scope.editproject = project;
        /*$http.get("/api/getProjectDetail/" + projectId).success(function(data) {
            $scope.editproject = data;
        })*/
    }

    /*----------------------------------------------------------------------------------------------------
      Name: updateProject
      Description:  function to update project detail with eidtproject data by project ID
      Author: SubinJoshi        
    ------------------------------------------------------------------------------------------------------*/
    $scope.updateProject = function(editproject) {
        $scope.submitted = true;
        if ($scope.form.$valid) {
            $http.put("/api/updateProject/" + editproject._id, editproject).success(function(data) {
                Notification.info('Project has been updated successfully');
                $location.path('/setting/project');
            })
        }
    }

    /*----------------------------------------------------------------------------------------------------
      Name: openStartDate
      Description:function to open startDate date picker by clicking button  
      Author: RuchiDhami        
     ------------------------------------------------------------------------------------------------------*/

    $scope.openStartDate = function($event) {
        $scope.startDate.opened = true;
    };
    /*----------------------------------------------------------------------------------------------------
      Name: openEndDate
      Description:  function to open endDate date picker by clicking button
      Author: RuchiDhami        
    ------------------------------------------------------------------------------------------------------*/
    $scope.openEndDate = function($event) {
        $scope.endDate.opened = true;
    };

    /*----------------------------------------------------------------------------------------------------
      Name: disabled
      Description:function to the disabled date which is less than startDate in endDate date picker
      Author: RuchiDhami        
    ------------------------------------------------------------------------------------------------------*/
    $scope.disabled = function(date, mode) {
        return (mode === 'project_startDate' && (date.getDay() === 0 || date.getDay() === 6));
    };
});
