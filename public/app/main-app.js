angular.module('app', ['ngResource', 'pascalprecht.translate', 'ui-notification'])

angular.module('app').config(function(NotificationProvider) {

	NotificationProvider.setOptions({
                delay: 2000,
                startTop: 20,
                startRight: 10,
                verticalSpacing: 20,
                horizontalSpacing: 20,
                positionX: 'center',
                positionY: 'top'
    });
    window.localStorage.currentUser = null;
 });