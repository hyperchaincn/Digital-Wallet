var lar = angular.module('myLoginRegister', ['ngRoute']);

lar.controller('LoginController', function($scope, $http, $location, $window) {
    $scope.login = function() {
        // console.log($.param($scope.loginFormData));
        $http({
            url: '/token',
            method: 'POST',
            data: $scope.loginFormData
        }).then(function(result) {
                    $window.sessionStorage.token = result.data.token;
                    $window.location.href = '/dashboard';
                },function(result) {
                    $scope.loginError = "手机号或者密码错误!";
        })
    };
});

lar.controller('RegisterController', function($scope, $http, $location, $window) {
    $scope.register = function() {
        $http({
            method: 'POST',
            url: '/user',
            data: $scope.registerFormData
        }).then(function(result) {
            alert(JSON.stringify(result.data.data.token))
            $window.sessionStorage.token = result.data.data.token;
            $window.location.href = '/dashboard';
        },function(result) {
            $scope.registerError = result.msg;
        });
    };
});
