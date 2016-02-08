angular.module('app', ['ngResource', 'ngRoute', 'ui.router', 'ngSanitize', 'ui.select', 'xeditable', 'pascalprecht.translate', 'ngCookies', 'ngAnimate', 'ui.bootstrap', 'mgcrea.ngStrap', 'chart.js','ui-notification', 'ngFileUpload', 'uiSwitch', 'angularjs-dropdown-multiselect']);


angular.module('app').config(function($stateProvider, $urlRouterProvider, $locationProvider, $translateProvider, NotificationProvider) {
    var routeRoleChecks = {
        admin: {
            auth: function(mvAuth) {
                return mvAuth.authorizeCurrentUserForRoute('admin')
            }
        },
        user: {
            auth: function(mvAuth) {
                return mvAuth.authorizeAuthenticatedUserForRoute()
            }
        }
    }
    $urlRouterProvider.otherwise('/dashboard');
   
    $stateProvider

        .state('dashboard', {
            url: '/dashboard',
            templateUrl: '/partials/main-dashboard.html',
            controller: 'mvMainCtrl',
            resolve: {
                checkProject : function(){
                    //alert('hello');
                }
            }
        })
        .state('projectdetail', {
            url: '/dashboard/projectdetail/:projectId',
            templateUrl: '/partials/service-request-details.html',
            controller: 'projectdetailCtrl'
        })
        .state('projectdetail.srdetail', {
            url: '/sr-detail/:srId',
            templateUrl: '/partials/sr-details.html',
            controller: 'projectdetailCtrl'
        })
        .state('project', {
            url: '/dashboard/project/:projectId',
            templateUrl: '/partials/project-detail.html',
            controller: 'projectdetailCtrl',
            resolve: {
                Auth : function(){
                    //alert('hello');
                }
            }
        })
        .state('createsr', {
            url: '/dashboard/project/:projectId/createsr',
            templateUrl: '/partials/create-sr.html',
            controller: 'projectdetailCtrl',
            resolve: {
                Auth : ['$q','$http','$stateParams', 'mvAuth', 'mvIdentity', '$location', function($q, $http, $stateParams, mvAuth, mvIdentity, $location) {
                                       
                    var defer = $q.defer();
                    mvAuth.getUserPermissionInProject($stateParams.projectId,mvIdentity.currentUser.app_users._id).then(function(permissions) {
                        
                        if(mvIdentity.isAuthorized('admin')){
                            //return true;
                            defer.resolve(true);
                        }else if(!isEmpty(permissions.data)){  // check if permissions object is empty or not                          
                            // if user is isAdmin/full_controll permission than user can create new SR
                            // otherwise it will block the url for creating new SR
                            if(permissions.data.isAdmin || permissions.data.permission.full_control){                                
                                //return true;
                                defer.resolve(true);
                            }else{     
                                console.log('/hasNoAccess 1');   
                                defer.resolve(false);       
                                $location.path('/'); 
                            }
                            
                        }else{  // if user's permissions object is empty then it will block this url     
                            defer.resolve(false);                                           
                            $location.path('/'); 
                        }
                        
                        return defer.promise;

                    });
                    
                }]
            }
        })
        .state('role', {
            url: '/dashboard/role',
            templateUrl: '/partials/people/role.html',
            controller: 'roleCtrl'
        })
        .state('setting', {
            url: '/dashboard/setting',
            templateUrl: '/partials/setting.html',
            controller: 'settingCtrl'
        })
        .state('setting.user', {
            url: '/user',
            templateUrl: '/partials/users.html',
            controller: 'peopleCtrl'
        })
        .state('setting.changepassword', {
            url: '/changepassword',
            templateUrl: '/partials/change-password.html',
            controller: 'mvProfileCtrl'
        })
        .state('setting.createuser', {
            url: '/createuser',
            templateUrl: '/partials/createuser.html',
            controller: 'peopleCtrl',
            resolve: routeRoleChecks.admin
        })
        .state('setting.profile', {
            url: '/profile',
            templateUrl: '/partials/profile.html',
            controller: 'peopleCtrl'
        })
        .state('setting.edituser', {
            url: '/edituser/:userId',
            templateUrl: '/partials/createuser.html',
            controller: 'peopleCtrl',
            resolve: routeRoleChecks.admin
        })
        .state('setting.project', {
            url: '/project',
            templateUrl: '/partials/projects.html',
            controller: 'projectCtrl'
        })
        .state('setting.createproject', {
            url: '/createproject',
            templateUrl: '/partials/create-project.html',
            controller: 'projectCtrl',
            resolve: routeRoleChecks.admin
        })
        .state('setting.editProject', {
            url: '/editproject/:projectId',
            templateUrl: '/partials/edit-project.html',
            controller: 'projectCtrl',
            resolve: routeRoleChecks.admin
        })
        .state('setting.language', {
            url: '/language',
            templateUrl: '/partials/language.html',
            controller: 'languageCtrl',
            resolve: routeRoleChecks.admin
        })
        .state('setting.addlanguage', {
            url: '/add-language',
            templateUrl: '/partials/add-language.html',
            controller: 'languageCtrl',
            resolve: routeRoleChecks.admin
        })        
        .state('setting.organization', {
            url: '/organization',
            templateUrl: '/partials/organization.html',
            controller: 'organizationCtrl'
        })
        .state('setting.general', {
            url: '/general',
            templateUrl: '/partials/general.html',
            controller: 'generalCtrl',
            resolve: routeRoleChecks.admin
        })
        .state('setting.usergroup', {
            url: '/user/group',
            templateUrl: '/partials/user-group.html',
            controller: 'userGroupCtrl',
            resolve: routeRoleChecks.admin
        })
        .state('setting.editusergroup', {
            url: '/user/group/edit/:roleId',
            templateUrl: '/partials/user-group-edit.html',
            controller: 'userGroupCtrl',
            resolve: routeRoleChecks.admin
        });

    $locationProvider.html5Mode(true);
    // confuguration for multilanguage 
    // set default language engilish i.e en
    // load the language values from DB with /api/lang rest call with default language english
    $translateProvider
        .preferredLanguage('en')
        .fallbackLanguage('en')
        .useCookieStorage()
        .useUrlLoader('/api/lang/');
    // Enable escaping of HTML
    $translateProvider.useSanitizeValueStrategy(null);
    // configuration for notification module in front end
    NotificationProvider.setOptions({
                delay: 2000,
                startTop: 20,
                startRight: 10,
                verticalSpacing: 20,
                horizontalSpacing: 20,
                positionX: 'center',
                positionY: 'top'
            });
});

angular.module('app').run(function($rootScope, $location, editableOptions) {  
    editableOptions.theme = 'bs3'; // bootstrap3 theme. Can be also 'bs2', 'default'  
    $rootScope.$on('$routeChangeError', function(evt, current, previous, rejection) {
        if (rejection === 'not authorized') {
            $location.path('/');
        }
    })
})

angular.module('app').directive('modal', function () {
    return {
      template: '<div class="modal fade">' + 
          '<div class="modal-dialog">' + 
            '<div class="modal-content">' + 
              '<div class="modal-header">' + 
                '<button type="button" class="close" data-dismiss="modal" aria-hidden="true">&times;</button>' + 
                '<h4 class="modal-title">{{ title }}</h4>' + 
              '</div>' + 
              '<div class="modal-body" ng-transclude></div>' + 
            '</div>' + 
          '</div>' + 
        '</div>',
      restrict: 'E',
      transclude: true,
      replace:true,
      scope:true,
      link: function postLink(scope, element, attrs) {
        scope.title = attrs.title;
        console.log(scope.title);
        scope.$watch(attrs.visible, function(value){
          if(value == true)
            $(element).modal('show');
          else
            $(element).modal('hide');
        });

        $(element).on('shown.bs.modal', function(){
          scope.$apply(function(){
            scope.$parent[attrs.visible] = true;
          });
        });

        $(element).on('hidden.bs.modal', function(){
          scope.$apply(function(){
            scope.$parent[attrs.visible] = false;
          });
        });
      }
    };
  });
/*---------------------------------------------------------------------------------------------------------
    Name: isEmpty
    Description: function to check wheather object is empty or not
    Input params: object
    Author: Prasanna Shrestha
-----------------------------------------------------------------------------------------------------*/
function isEmpty (obj) {
    for (var i in obj) if (obj.hasOwnProperty(i)) return false;
    return true;
};
/*---------------------------------------------------------------------------------------------------------
    Name: permission
    Description: Custom directive to check user permission and roles for edit/create for that particular project
    Input params: projectId and loggedIn user Id
    Author: Prasanna Shrestha
-----------------------------------------------------------------------------------------------------*/
angular.module('app').directive('permission', function(mvIdentity, mvAuth) {
  return {
    restrict: 'A',
    prioriry: 100000,
    scope: false,    
    link: function(scope, elem, attrs) {
       
        var loginUserId = mvIdentity.currentUser.app_users._id;      
        var accessDenied = true;
        //check if User is admin or not, if user is admion then user will have full access
        if(!mvIdentity.isAuthorized('admin')){
            // this will check if user have edit permission or not if user select/goes to any SR
            // watch will check id user select different SR then it will check according to that SR details if user is assign to that SR or not
            // if user is not assign to that SR then user have only read permission which will handle by readOnlyPermission directive
            scope.$watch("selectedId", function(newValue, oldValue) {            
                if(newValue){
                    mvAuth.getUserPermissionInProject(scope.projectId,loginUserId).then(function(permissions) {
                        // check if permissions object is empty or not
                        if(!isEmpty(permissions)){
                            // if user is assign to that SR then user can edit the contents
                            // if user is isAdmin/full_controll/edit permission than user can edit the contents
                            // otherwise it will hide the content/div-element for edit option
                            if(loginUserId==scope.selectedId.assignee || permissions.isAdmin || permissions.permission.full_control || permissions.permission.edit){
                                elem.show();
                            }else{               
                                elem.hide();       
                            }
                        }else{  
                            // if User is not assign to that project or has not permission in that SR then 
                            // content will be hide         
                           if(loginUserId==scope.selectedId.assignee){
                                elem.show();
                            }else{               
                                elem.hide();       
                            }
                        }
                    });   
                }                
            });
            if(scope.selectedId==undefined || scope.selectedId==""){
                // this will check if user have edit permission or not if user select/goes to any Project
                console.log("loginUserId : "+loginUserId);    
                console.log("scope.projectId : "+scope.projectId); 
                mvAuth.getUserPermissionInProject(scope.projectId,loginUserId).then(function(permissions) {               
                    /**
                        @Prajan Shrestha: 
                        replace if/else with somother modular way by functions.
                        research on cyclomatic-complexity

                    **/
                    console.log("loginUserId : "+loginUserId);    
                    console.log("scope.projectId : "+scope.projectId);    
                    console.log(permissions);                
                    if(!isEmpty(permissions)){ 
                        // if user is member of that Project then user can edit the contents of that project like add members/ edit project
                        // if user is isAdmin/full_controll/edit permission than user can edit the contents
                        // otherwise it will hide the content/div element                   
                        if(permissions.isAdmin ){                          
                            accessDenied = false;
                            console.log("permissions.data.isAdmin : accessDenied : "+accessDenied);    
                        }else if(attrs.access=="full_control" || attrs.access=="edit"){
                            if(permissions.permission.full_control || permissions.permission.edit){
                                accessDenied = false;
                                console.log("permissions.full_control edit : accessDenied : "+accessDenied);    
                            }
                        }
                        if(accessDenied){
                            elem.hide();           
                        }else{               
                            elem.show();       
                        }
                    }else{               
                        elem.hide();       
                    }
                    
                });    
            } 
        }else{
            elem.show();
        }   
        
    }
  };
});
/*---------------------------------------------------------------------------------------------------------
    Name: readOnlyPermission
    Description: Custom directive to check user permission and roles for read only access for that particular project
    Input params: projectId and loggedIn user Id
    Author: Prasanna Shrestha
-----------------------------------------------------------------------------------------------------*/
angular.module('app').directive('readOnlyPermission', function(mvIdentity, mvAuth) {
  return {
    restrict: 'A',
    prioriry: 100000,
    scope: false,    
    link: function(scope, elem, attrs, linker) {
        
        var loginUserId = mvIdentity.currentUser.app_users._id;       
        var accessDenied = false;
        //check if User is admin or not, if user is admion then user will have full access
        if(!mvIdentity.isAuthorized('admin')){
            // this will check if user have read permission or not according to user selected SR
            // watch will check id user select different SR then it will check according to that SR details if user is assign to that SR or not
            // if user is not assign to that SR then user have only read permission 
            scope.$watch("selectedId", function(newValue, oldValue) {    
                if(newValue){       
                    mvAuth.getUserPermissionInProject(scope.projectId,loginUserId).then(function(permissions) {                
                        if(!isEmpty(permissions)){
                            if(loginUserId==scope.selectedId.assignee || permissions.isAdmin || permissions.permission.full_control || permissions.permission.edit){
                                
                                elem.hide();
                            }else{
                                elem.show();
                            }
                        }else{
                            if(loginUserId==scope.selectedId.assignee){                                
                                elem.hide();
                            }else{
                                elem.show();
                            }
                        }
                    });
                }
                
            });      
            // this will check if user have read only permission or not according to user selected Project
            if(scope.selectedId==undefined || scope.selectedId==""){     
                mvAuth.getUserPermissionInProject(scope.projectId,loginUserId).then(function(permissions) {     
                    console.log(permissions);                         
                    if(!isEmpty(permissions)){
                        if(permissions.isAdmin || permissions.permission.full_control || permissions.permission.edit){
                            accessDenied = true;                    
                        }                    
                    }
                    if(accessDenied){
                        elem.hide();           
                    }
                }); 
            } 
        }else{
             elem.hide();
        }      
        
    }
  };
});

/*---------------------------------------------------------------------------------------------------------
    Name: strLimit
    Description: Custom Filter to limit the long string to given numbers and followed by '...'
    Input params: limit
    Author: Prasanna Shrestha
-----------------------------------------------------------------------------------------------------*/
angular.module('app').filter('strLimit', ['$filter', function($filter) {
    return function(input, limit) {
        if (!input) return;
        if (input.length <= limit) {
            return input;
        }

        return $filter('limitTo')(input, limit) + ' ...';
    };
}]);

/**----------------------------------------------------------------------------------------------------
    Name: propsFilter
    Description: Angular Custom Filter 
    Author: Prasanna Shrestha
----------------------------------------------------------------------------------------------------**/
angular.module('app').filter('propsFilter', function() {
    return function(items, props) {
        var out = [];

        if (angular.isArray(items)) {
            var keys = Object.keys(props);

            items.forEach(function(item) {
                var itemMatches = false;

                for (var i = 0; i < keys.length; i++) {
                    var prop = keys[i];
                    var text = props[prop].toLowerCase();
                    if (item[prop].toString().toLowerCase().indexOf(text) !== -1) {
                        itemMatches = true;
                        break;
                    }
                }

                if (itemMatches) {
                    out.push(item);
                }
            });
        } else {
            // Let the output be the input untouched
            out = items;
        }

        return out;
    };
});

/**----------------------------------------------------------------------------------------------------
    Name: removeUnderscoreThenUppercase
    Description: Angular Custom Filter to replace underscore by white space and every word start with upperCase
    Author: Prasanna Shrestha
----------------------------------------------------------------------------------------------------**/

angular.module('app').filter('removeUnderscoreThenUppercase', function () {
    return function (text) {
        // replace input text with underscore to white space
        var str = text.replace(/_/g, " ");
        // convert all string to lower case
        var lower = str.toLowerCase();
        // convert all words firstChar to uppercase
        return lower.replace(/(^| )(\w)/g, function(x) {
            return x.toUpperCase();
        });
    };
}).filter('true_false', function() {
    return function(text, length, end) {
        if (text) {
            return 'Yes';
        }
        return 'No';
    }
});

/*-----------------------------------------------------------------------------------------------------
  Name: validfile
  Description: directive to check if a file to be uploaded is of acceptable type or not
  Author: Rikesh Bhansari
  Date: 2015/11/24
-----------------------------------------------------------------------------------------------------*/
angular.module('app').directive('validfile', function validFile() {

    var validTypes = ["image/jpg", "image/jpeg", "image/png", "image/psd", "application/pdf", "application/vnd.openxmlformats-officedocument.wordprocessingml.document", "text/plain", "application/msword", "application/x-compressed", "application/mspowerpoint", "application/powerpoint", "application/vnd.ms-excel", "application/excel", "text/xml", "application/zip"];
    return {
        require: 'ngModel',
        link: function (scope, elem, attrs, ctrl) {
            
            elem.on('change', function () {
                var type = elem[0].files[0].type;
                scope.invalidFile = !(validTypes.indexOf(type) !== -1);
                var valid = scope.invalidFile ? false : true; 
                ctrl.$setValidity('validfile',(validTypes.indexOf(type) !== -1));
                return !valid;
           });
        }
    };
});

/*-----------------------------------------------------------------------------------------------------
  Name: validimage
  Description: directive to check if a file to be uploaded is of image type jpeg
  Author: Rikesh Bhansari
  Date: 2015/11/24
-----------------------------------------------------------------------------------------------------*/
angular.module('app')
.directive('validimage', function validImage() {

    var validTypes = ["image/jpg", "image/jpeg"];
    return {
        require: 'ngModel',
        link: function (scope, elem, attrs, ctrl) {
            
            elem.on('change', function () {
                var type = elem[0].files[0].type;
                scope.invalidImage = !(validTypes.indexOf(type) !== -1);
                var valid = scope.invalidFile ? false : true; 
                ctrl.$setValidity('validimage',(validTypes.indexOf(type) !== -1));
                return !valid;
           });
        }
    };
})

//filter SR based on sr_statuses --Rikesh Bhansari --2015/12/07
.filter('statusFilter', function() {
  return function(input, checkedStatus) {
    input = input || '';
    var out = [];
    if(checkedStatus.length < 1) {
        out = [];
    }
    else {
        for (var i = 0; i < input.length; i++) {
            checkedStatus = checkedStatus.toString();
            if(checkedStatus.indexOf(input[i].sr_status) != -1) {
                out.push(input[i]);
            }
        }
    }
    return out;
  };
})

//filter SR based on assignees --Rikesh Bhansari --2015/12/08
.filter('assigneeFilter', function() {
  return function(input, selectedAssignees) {
    input = input || '';
    var out = [];
    if(selectedAssignees.length < 1) {
        out = [];
    }
    else {
        for (var i = 0; i < input.length; i++) {
            for(var j=0; j<selectedAssignees.length; j++) {
                if(selectedAssignees[j].id == input[i].assignee) {
                    out.push(input[i]);
                    continue;
                }
            }
        }
    }
    return out;
  };
})

//filter for SRs created two days before --Rikesh Bhansari --2015/12/09
.filter('recentFilter', function() {
  return function(input, recentlyCreatedSrOnly) {
    var out = [];
    if(!recentlyCreatedSrOnly) {
        out = input;
    } else {
        for (var i = 0; i < input.length; i++) {
            var createDate = new Date(input[i].sr_createdate);
            var currentDate = new Date();
            if((currentDate - createDate)<2*24*60*60*1000) {
                out.push(input[i]);
            }
        }
    }
    return out;
  };
})

//filter SR based on priority --Rikesh Bhansari --2015/12/09
.filter('priorityFilter', function() {
    return function(input, priorityValue) {
        var out = [];
        if(!priorityValue) {
            out = input;
        } else {
            for (var i = 0; i < input.length; i++) {
                if(input[i].priority == priorityValue.toString()) {
                    out.push(input[i]);
                }
            }
        }
        return out;
    }
})

//filter for date range --Rikesh Bhansari --2015/12/09
.filter('dateFilter', function() {
    return function(input, dateObjForFilter) {
        var inputLength = input.length;
        var out = [];
        if(!dateObjForFilter.filterStartDate && !dateObjForFilter.filterFinishDate) {
            out = input;
        }else if(!!dateObjForFilter.filterStartDate && !!dateObjForFilter.filterFinishDate) {
            filter_start_date = new Date(dateObjForFilter.filterStartDate);
            filter_finish_date = new Date(dateObjForFilter.filterFinishDate);
            for(var i=0; i<inputLength; i++) {
                start_date = new Date(input[i].sr_createdate);
                if(filter_start_date < start_date) {
                    if(filter_finish_date > (start_date-24*60*60*1000)) {
                        out.push(input[i]);
                    }
                }
            }
        }else if(!!dateObjForFilter.filterStartDate) {
            filter_start_date = new Date(dateObjForFilter.filterStartDate);
            for(var i=0; i<inputLength; i++) {
                start_date = new Date(input[i].sr_createdate);
                if(filter_start_date < start_date) {
                    out.push(input[i]);
                }
            }
        }else if(!!dateObjForFilter.filterFinishDate) {
            filter_finish_date = new Date(dateObjForFilter.filterFinishDate);
            for(var i=0; i<inputLength; i++) {
                start_date = new Date(input[i].sr_createdate);
                if(filter_finish_date > (start_date-24*60*60*1000)) {
                    out.push(input[i]);
                }
            }
        }
        return out;
    }
})

//directive for populating the array for filtering sr_statuses --Rikesh Bhansari --2015/12/07
.directive("checkboxGroup", function() {
    return {
        restrict: "A",
        link: function(scope, elem, attrs) {
            // Determine initial checked boxes
            if (scope.checkedStatus.indexOf(scope.s.order) !== -1) {
                elem[0].checked = true;
                scope.s.Selected = true;
            }

            // Update checkedStatus on click
            elem.bind('click', function() {
                var index = scope.checkedStatus.indexOf(scope.s.order);
                // Add if checked
                if (elem[0].checked) {
                    if (index === -1) scope.checkedStatus.push(scope.s.order);
                }
                // Remove if unchecked
                else {
                    if(scope.s.order<6000) {
                        //unchecks the "All Pending SRs" checkbox when any of the incomplete statuses is unchecked
                        $("#incompleteSrs").prop("checked", false);
                    }
                    if (index !== -1) scope.checkedStatus.splice(index, 1);
                }
                // Sort and update DOM display
                scope.$apply(scope.checkedStatus.sort(function(a, b) {
                    return a - b
                }));
            });
        }
    }
});

/*---------------------------------------------------------------------------
Name: passwordVerify
Description: directive to matches the NewPassword and ConfirmNewPassword
Author: RuchiDhami
----------------------------------------------------------------------------*/

angular.module('app').directive("passwordVerify", function() {
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