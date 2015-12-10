angular.module('app').controller('mvMainCtrl', function($scope, $http, mvIdentity, $location, mvAuth, $translate, Notification, $rootScope) {

    //var  customerId = mvIdentity.currentUser.customerId;
    $scope.identity = mvIdentity;
    $scope.showProject = false;
    //$http.get('/api/login').then(function(response) {
    if ($scope.identity.isAuthenticated()) {
        $http.get("/api/getProjectListNames/" + $scope.identity.currentUser.customerId).success(function(projectData) {
            if (projectData.length > 0) {
                $scope.showProject = true;
            }
            $scope.projectData = projectData;
            $scope.role = mvIdentity.currentUser.app_users.role;
        });
    }
    //});
    $scope.getTotal = function(projectStatus) {
        var total = 0;
        for (var i = 0; i < projectStatus.length; i++) {

            total += projectStatus[i];
        }
        return total;
    }

    $scope.type = 'Pie';
    // Chart.js Options
    $scope.options = {
        //Boolean - Whether we should show a stroke on each segment
        segmentShowStroke: true,

        //String - The colour of each segment stroke
        segmentStrokeColor: "#fff",

        //Number - The width of each segment stroke
        segmentStrokeWidth: 2,

        //Number - The percentage of the chart that we cut out of the middle
        percentageInnerCutout: 30, // This is 0 for Pie charts

        //Number - Amount of animation steps
        animationSteps: 100,

        //String - Animation easing effect
        animationEasing: "easeOutBounce",

        //Boolean - Whether we animate the rotation of the Doughnut
        animateRotate: false,

        //Boolean - Whether we animate scaling the Doughnut from the centre
        animateScale: false,

        //String - A legend template
        legendTemplate: "<ul class=\"<%=name.toLowerCase()%>-legend\"><% for (var i=0; i<segments.length; i++){%><li><span style=\"background-color:<%=segments[i].fillColor%>\"></span><%if(segments[i].label){%> <%=segments[i].label%>&nbsp &nbsp<%=segments[i].value%><%}%></li><%}%></ul>"
    };

    $http.get("/api/getAllSr").success(function(srData) {
        $scope.srList = srData;
        $scope.projectSrData = true;
    })

    $scope.setSelectedProject = function(projectId) {
        console.log('inside set selected project');
        console.log(projectId);
        //$location.path('/main/'+ projectId);
        // $http.get("/api/getSRlists/"+ projectId).success(function(srData){            
        //      $scope.srList = srData;

        // })
    }

    $scope.setSelectedSr = function(srId) {
        $http.get("/api/getSrDetail/" + srId).success(function(srData) {
            $scope.clickSR = true;
            $scope.selectedId = srData;
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
    $scope.getLabelDetails = function(label) {
        var customerId = mvIdentity.currentUser.customerId;
        console.log("inside get getLabelDetails of projectdetailCtrl: ", label, customerId);
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
        console.log('inside update label description');
        var customerId = mvIdentity.currentUser.customerId;

        mvAuth.updateLabelDescription(editedLabelValue, labelId, countryId, labelCode, labelCountry, customerId).then(function(response) {
            //window.location.reload(true);           
            
        })
    }

});

angular.module('app').controller('settingCtrl', function($scope, $http, mvIdentity, $location, $translate, mvAuth, $rootScope) {
    $scope.identity = mvIdentity;

    $scope.getLabelDetails = function(label) {
        var customerId = mvIdentity.currentUser.customerId;
        console.log(label, customerId);
        mvAuth.getlabelDetails(label, customerId).then(function(response) {
            $scope.data = response;
        });
    }

    $scope.updateLabelDescription = function(editedLabelValue, labelId, countryId, labelCode, labelCountry) {
        console.log('inside update label description');
        var customerId = mvIdentity.currentUser.customerId;

        mvAuth.updateLabelDescription(editedLabelValue, labelId, countryId, labelCode, labelCountry, customerId).then(function(response) {
            //window.location.reload(true);
            
        })
    }
});
