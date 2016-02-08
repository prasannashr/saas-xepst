angular.module('app').factory('mvIdentity', function($http, $window, mvUser,$location) {
    var currentUser;
    //console.log("$window.localStorage.currentUser :: 1",$window.localStorage.currentUser);   
    if ($window.localStorage.currentUser!="null" && $window.localStorage.currentUser!=undefined) {
       
        currentUser = new mvUser();
        currentUser = JSON.parse($window.localStorage.currentUser);
        
    }else{
        $http.get('/api/login').then(function(res) {
            if (res.data) {
                $window.localStorage["currentUser"] = JSON.stringify(res.data);
                currentUser = new mvUser();    
                currentUser = JSON.parse($window.localStorage.currentUser);                
                $window.location.reload();                       
            }
        });
    }
   
    return {
        currentUser: currentUser,
        isAuthenticated: function() {
            return !!this.currentUser;
        },
        isAuthorized: function(role) {
            return !!this.currentUser && this.currentUser.app_users.role === role;
        },
        setLanguageEditOption: function(option) {
            this.currentUser.languageOption=option;
            $window.localStorage.currentUser=JSON.stringify(this.currentUser);  
            console.log("['currentUser'] 1:: ",currentUser);               
            
        },
        setResolutionType: function(option) {
            this.currentUser.resolutionType=option;  
            $window.localStorage.currentUser=JSON.stringify(this.currentUser);  
            console.log("['currentUser'] 1:: ",currentUser);             
            
        },
        setMaxAttachment: function(option) {
            this.currentUser.maxAttachment=parseInt(option);
            $window.localStorage.currentUser=JSON.stringify(this.currentUser);   
            console.log("['currentUser'] 1:: ",currentUser);           
            
        },
        setMaxPriority: function(option) {
            this.currentUser.maxPriority = parseInt(option);
            $window.localStorage.currentUser = JSON.stringify(this.currentUser);

        },
        setUserProfile: function(option) {
            this.currentUser.app_users = option;
            $window.localStorage.currentUser = JSON.stringify(this.currentUser);
        },
        
        setOrganization: function(option) {
            this.currentUser.companyName = option.organization_detail.companyName;
            this.currentUser.logo = option.organization_detail.logoPath;
            this.currentUser.orgLogoImage = option.orgLogoImage;
            $window.localStorage.currentUser = JSON.stringify(this.currentUser);
        }
    }
})
