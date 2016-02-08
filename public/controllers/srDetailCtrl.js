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

angular.module('app').controller('srDetailCtrl', function($scope, $http, $stateParams, mvIdentity, $translate, mvAuth, $location, Notification, $filter) {

		var srId = $stateParams.srId;
        $scope.selectSR = srId;
        $scope.selectedRelatedItems=[]; 
        $http.get("/api/getSrDetail/" + srId).success(function(srData) {
            $scope.attachmentDetails = srData.attachments;
            $scope.selectedId = srData;
            $scope.commentList = srData.comment;
            $scope.showDetails = false;
            sr_createdBy = srData.sr_createdBy;

            if ($scope.selectedId) {
                $scope.srStatus = $scope.selectedId.sr_status;
                console.log("$scope.srStatus :: ",$scope.srStatus);
                $scope.assignee = $scope.selectedId.assignee;
                $scope.resolutionId = $scope.selectedId.resolution_type;
                $http.get("/api/getRelatedStatus/" + $scope.srStatus).success(function(response) {
                    console.log("Response:: ",response);
                    if(response==0){
                        $scope.selectedRelatedItems=[];            
                    }else{
                        $scope.selectedRelatedItems = [];    
                        angular.forEach(response, function(value) {
                            $scope.selected = $filter('filter')($scope.sr_statuses, {
                                _id: value
                            }); 
                            console.log($scope.selected);
                            //alert($scope.selected);
                            $scope.selectedRelatedItems.push($scope.selected[0]);                         
                        }); 
                            
                    }
                }).error(function(data, status) {
                    console.log(data);
                    $scope.errMessage = $filter('translate')('ERROR_MESSAGE');
                    Notification.error($scope.errMessage);
                })

                mvAuth.getUserName(sr_createdBy).then(function(user) {
                    $scope.srCreator = user.name;
                }, function(data, status) {
                    console.log(data);
                    $scope.errMessage = $filter('translate')('ERROR_MESSAGE');
                    Notification.error($scope.errMessage);
                });

                angular.forEach($scope.commentList, function(value) {
                    mvAuth.getUserName(value.user_id).then(function(user) {
                        value.commentBy = user.name;
                        value.commentorPic = user.proPic;
                    }, function(data, status) {
                        console.log(data);
                        $scope.errMessage = $filter('translate')('ERROR_MESSAGE');
                        Notification.error($scope.errMessage);
                    });
                });

                angular.forEach($scope.attachmentDetails, function(value) {
                    mvAuth.getUserName(value.uploaded_by).then(function(user) {
                        value.uploader = user.name;
                    }, function(data, status) {
                        console.log(data);
                        $scope.errMessage = $filter('translate')('ERROR_MESSAGE');
                        Notification.error($scope.errMessage);
                    });
                });
            }
        }).error(function(data, status) {
            console.log(data);
            $scope.errMessage = $filter('translate')('ERROR_MESSAGE');
            Notification.error($scope.errMessage);
        })
    


});