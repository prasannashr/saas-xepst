//angular.module('app').value('mvToastr', toastr);

angular.module('app').factory('generalServices', function($http) {
    return {
        notify: function(msg) {
            mvToastr.success(msg);
            // console.log(msg);
        },        
        getPriorityList: function() {   
             	
            return $http.get("/api/priorities").then(function(response) {
                // console.log("getPriorityList => "+response.data);
                return response.data;   
            });
        },        
        updatePriorityList: function(id,value) {        	
            return $http.put("/api/priorities/"+id,{"meaning":value}).then(function(response) {
                // console.log("getPriorityList => "+response.data);
                return response.data;   
            });
        }
    }
})
