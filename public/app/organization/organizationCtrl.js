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

angular.module('app').controller('organizationCtrl', function($scope, $http, mvIdentity, $translate, mvAuth, $location, Notification, Upload) {
    var customerId = mvIdentity.currentUser.customerId;
    $scope.identity = mvIdentity.currentUser;
    $scope.currentUser = mvIdentity;
    $scope.invalidImage = false;

    $http.get('app/languages/countries.json').success(function(result) {
        $scope.countrylist = result;

    });

    $http.get('app/organization/industrylist.json').success(function(data) {
        $scope.industrylist = data;

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
                url: 'api/upload',
                data: {
                    logo: file
                }
            });

            file.upload.then(function(response) {
                delete organization.organization_detail.logo;
                organization.organization_detail.logoPath = response.data.path;
                organizationUpdate(organization, customerId);
            }, function(response) {
                if (response.status > 0)
                    $scope.errorMsg = response.status + ': ' + response.data;
            }, function(evt) {
                file.progress = Math.min(100, parseInt(100.0 * evt.loaded / evt.total));
            });
        } else {
            organizationUpdate(organization, customerId);
        }
    }

    var organizationUpdate = function(organization, customerId) {
        mvAuth.updateorganization(organization, customerId);
        mvIdentity.setOrganization(organization);
        Notification.info('Organization has been updated successfully successfully');
        window.location.reload(true);
        $location.path("/dashboard/setting/organization");
    }

    /*---------------------------------------------------------------------------------------------------------
        Name: getOrganization
        Description: function to get the detail of organization 
        Author: RuchiDhami
    -----------------------------------------------------------------------------------------------------*/
    $scope.getOrganization = function(customerId) {
        $http.post("/api/getOrganization/" + customerId).success(function(response) {
            $scope.updateorganization = response;
        });
    }
});
