// angular.module('myApp', ['ngRoute', 'myApp.controller', 'myApp.service', 'myApp.directive', 'myApp.interceptor'])
var app = angular.module('myApp', ['ngRoute', 'ui.bootstrap', 'ngFileUpload', 'base64', 'ngImgCrop', 'angular-loading-bar']);
app.config(['$routeProvider', '$locationProvider', '$httpProvider', 'cfpLoadingBarProvider', function($routeProvider, $locationProvider, $httpProvider, cfpLoadingBarProvider) {
    $routeProvider
        .when('/', {
            controller: 'WhiteController'
        })
        .when('/user', {
            templateUrl: '/views/user.html',
            controller: 'UserController',
            activetab: 'user'
        })
        .when('/asset/create', {
            templateUrl: '/views/assetCreate.html',
            controller: 'CreateAssetController',
            activetab: 'asset'
        })
        .when('/asset/issue', {
            templateUrl: '/views/assetIssue.html',
            controller: 'IssueAssetController',
            activetab: 'asset'
        })
        .when('/asset/list', {
            templateUrl: '/views/assetList.html',
            controller: 'AssetListController',
            activetab: 'asset'
        })
        .when('/asset/detail', {
            templateUrl: '/views/assetDetail.html',
            controller: 'AssetDetailController',
            activetab: 'asset'
        })
        .when('/transaction/list', {
            templateUrl: '/views/transactionList.html',
            controller: 'TransactionListController',
            activetab: 'transaction'
        })
        .when('/transaction/detail', {
            templateUrl: '/views/transactionDetail.html',
            controller: 'TransactionDetailController',
            activetab: 'transaction'
        })
        .when('/transfer', {
            templateUrl: '/views/transfer.html',
            controller: 'AssetTransferController',
            activetab: 'transaction'
        })
        .when('/test', {
            templateUrl: '/views/test.html',
            activetab: 'asset'
        })
        .when('/dashboard', {
            templateUrl: 'views/user.html',
            controller: 'UserController',
            activetab: 'user'
        })
        .otherwise({
            redirectTo: '/test'
        });
    $locationProvider.html5Mode(true);
    $httpProvider.interceptors.push('authInterceptor');
    cfpLoadingBarProvider.parentSelector = '#loading-bar-container';
    // cfpLoadingBarProvider.includeSpinner = false;
    cfpLoadingBarProvider.spinnerTemplate = '<div><span style="font-size: 16px;"><i class="fa fa-spinner faa-spin animated" ></i> 正在处理中...</span></div>';

}]);