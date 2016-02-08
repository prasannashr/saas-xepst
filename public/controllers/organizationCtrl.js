/*------------------------------------------------------------------------------
  Copyright Javra Software - www.javra.com
--------------------------------------------------------------------------------
  File        : public/app/organization/organizationCtrl.js
  Description :
  Input param :
  Output param:
  Author      : Ruchi Dhami
  Created     : 2015-10-06                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                               
------------------------------------------------------------------------*/

angular.module('app').controller('organizationCtrl', function($scope, $http, mvIdentity, $translate, mvAuth, $location, Notification, Upload, $filter) {
    var customerId = mvIdentity.currentUser.customerId;
    $scope.identity = mvIdentity.currentUser;
    $scope.currentUser = mvIdentity;
    $scope.invalidImage = false;

    $http.get('jsons/countries.json').success(function(result) {
        $scope.countrylist = result;
    }).error(function(data, status) {
        console.log(data);
        $scope.errMessage = $filter('translate')('ERROR_MESSAGE');
        Notification.error($scope.errMessage);
    });

    $http.get('jsons/industrylist.json').success(function(data) {
        $scope.industrylist = data;

    }).error(function(data, status) {
        console.log(data);
        $scope.errMessage = $filter('translate')('ERROR_MESSAGE');
        Notification.error($scope.errMessage);
    });
    /*---------------------------------------------------------------------------------------------------------
        Name: updateOrganization
        Description: function to update the organization information 
        Author: RuchiDhami
    ------------------------------------------------------------------------------------------------------------
        Date        Author          Description
        2015/12/03  Rikesh Bhansari Function added to upload logo
    ------------------------------------------------------------------------------------------------------------*/
    $scope.updateOrganization = function(organization,customerId) {
        if(organization.organization_detail.logo) {
            var file = organization.organization_detail.logo;
            file.upload = Upload.upload({
                url: 'api/uploadLogo',
                data: {
                    logo: file
                }
            });

            file.upload.then(function(response) {
                delete organization.organization_detail.logo;
                organization.organization_detail.logoPath = response.data;
                organizationUpdate(organization, customerId);
            }, function(error) {
                if (error.status > 0)
                    $scope.errorMsg = error.status + ': ' + error.data;
            }, function(evt) {
                file.progress = Math.min(100, parseInt(100.0 * evt.loaded / evt.total));
            });
        } else {
            organizationUpdate(organization, customerId);
        }
    }

    var organizationUpdate = function(organization, customerId) {
        $http.put("/api/updateOrganization/" + customerId, organization).then(function(response){
            if(organization.organization_detail.logoPath!==null && organization.organization_detail.logoPath!==undefined) {
              //http call to get organization logo using id, logoPath
              $http.get("/api/getPictureThumbnail/" + organization.organization_detail.logoPath).success(function(data) {
                  organization.orgLogoImage = data;
                  mvIdentity.setOrganization(organization);
        	Notification.info($filter('translate')('ORGANIZATION_UPDATE_SUCCESS_MESSAGE'));
        	//window.location.reload(true);
        	$location.path("/dashboard/setting/organization");
              });
            } else {
              mvIdentity.setOrganization(organization);         
              Notification.info($filter('translate')('ORGANIZATION_UPDATE_SUCCESS_MESSAGE'));
            }
        });
    }

    /*---------------------------------------------------------------------------------------------------------
        Name: getOrganization
        Description: function to get the detail of organization 
        Author: RuchiDhami
    -----------------------------------------------------------------------------------------------------*/
    $scope.getOrganization = function(customerId) {
        $http.post("/api/getOrganization/" + customerId).success(function(response) {
            $scope.updateorganization = response;
        }).error(function(data, status) {
            console.log(data);
            $scope.errMessage = $filter('translate')('ERROR_MESSAGE');
            Notification.error($scope.errMessage);
        })
    }
});
