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
            templateUrl: '/partials/templates/main-dashboard.html',
            controller: 'mvMainCtrl'
        })
        .state('projectdetail', {
            url: '/dashboard/projectdetail/:projectId',
            templateUrl: '/partials/templates/service-request-details.html',
            controller: 'projectdetailCtrl'
        })
        .state('projectdetail.srdetail', {
            url: '/sr-detail/:srId',
            templateUrl: '/partials/templates/sr-details.html',
            controller: 'projectdetailCtrl'
        })
        .state('role', {
            url: '/dashboard/role',
            templateUrl: '/partials/people/role.html',
            controller: 'roleCtrl'
        })
        .state('setting', {
            url: '/dashboard/setting',
            templateUrl: '/partials/templates/setting.html',
            controller: 'settingCtrl'
        })
        .state('setting.user', {
            url: '/user',
            templateUrl: '/partials/templates/users.html',
            controller: 'peopleCtrl'
        })
        .state('setting.changepassword', {
            url: '/changepassword',
            templateUrl: '/partials/templates/change-password.html',
            controller: 'mvProfileCtrl'
        })
        .state('setting.createuser', {
            url: '/createuser',
            templateUrl: '/partials/templates/createuser.html',
            controller: 'peopleCtrl',
            resolve: routeRoleChecks.admin
        })
        .state('setting.profile', {
            url: '/profile',
            templateUrl: '/partials/templates/profile.html',
            controller: 'peopleCtrl'
        })
        .state('setting.edituser', {
            url: '/edituser/:userId',
            templateUrl: '/partials/templates/createuser.html',
            controller: 'peopleCtrl',
            resolve: routeRoleChecks.admin
        })
        .state('setting.project', {
            url: '/project',
            templateUrl: '/partials/templates/projects.html',
            controller: 'projectCtrl'
        })
        .state('setting.createproject', {
            url: '/createproject',
            templateUrl: '/partials/templates/create-project.html',
            controller: 'projectCtrl',
            resolve: routeRoleChecks.admin
        })
        .state('setting.editProject', {
            url: '/editproject/:projectId',
            templateUrl: '/partials/templates/edit-project.html',
            controller: 'projectCtrl',
            resolve: routeRoleChecks.admin
        })
        .state('setting.language', {
            url: '/language',
            templateUrl: '/partials/templates/language.html',
            controller: 'languageCtrl',
            resolve: routeRoleChecks.admin
        })
        .state('setting.addlanguage', {
            url: '/add-language',
            templateUrl: '/partials/templates/add-language.html',
            controller: 'languageCtrl',
            resolve: routeRoleChecks.admin
        })
        .state('project', {
            url: '/dashboard/project/:projectId',
            templateUrl: '/partials/templates/project-detail.html',
            controller: 'projectdetailCtrl'
        })
        .state('createsr', {
            url: '/dashboard/project/:projectId/createsr',
            templateUrl: '/partials/templates/create-sr.html',
            controller: 'projectdetailCtrl'
        })
        .state('setting.organization', {
            url: '/organization',
            templateUrl: '/partials/templates/organization.html',
            controller: 'organizationCtrl'
        })
        .state('setting.general', {
            url: '/general',
            templateUrl: '/partials/templates/general.html',
            controller: 'generalCtrl'
        })
        .state('setting.usergroup', {
            url: '/user/group',
            templateUrl: '/partials/templates/user-group.html',
            controller: 'userGroupCtrl'
        });

    $locationProvider.html5Mode(true);
    // confuguration for multilanguage 
    // set default language engilish i.e en
    // load the language values from DB with /api/lang rest call with default language english
    $translateProvider
        .preferredLanguage('en')
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
})

/*-----------------------------------------------------------------------------------------------------
  Name: validfile
  Description: directive to check if a file to be uploaded is of acceptable type or not
  Author: Rikesh Bhansari
  Date: 2015/11/24
-----------------------------------------------------------------------------------------------------*/
angular.module('app').directive('validfile', function validFile() {

    var validTypes = ["image/jpg", "image/jpeg", "image/png", "image/psd", "application/pdf", "text/plain", "application/msword", "application/x-compressed", "application/mspowerpoint", "application/powerpoint", "application/vnd.ms-excel", "application/excel", "text/xml", "application/zip"];
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