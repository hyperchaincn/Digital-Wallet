var app = angular.module('myApp');
app.factory('authInterceptor', function($q, $window, $location, $base64) {
    var interceptor = {
        'request': function(config) {
            config.headers = config.headers || {};
            if ($window.sessionStorage.token) {
                config.headers.Authorization = 'Basic ' + $base64.encode($window.sessionStorage.token + ":");
            }else{
                // $location.url("/login");
                $window.location.href = "/login";
            }
            return config; 
        },
        'response': function(response) {
            response.config.responseTimestamp = new Date().getTime();
            return response || $q.when(response);
        },
        'requestError': function(rejection) {
            return response; 
        },
        'responseError': function(response) {
            if (response.status === 401) {
                // $window.location.href = "/login";
            }
            return response; 
        }
    };
    return interceptor;
});