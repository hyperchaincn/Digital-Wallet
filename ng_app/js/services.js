var app = angular.module('myApp');
app.factory('DetailService', function() {
    var detail = {};
    return {
        getDetail: function() {
            return this.detail;
        },
        setDetail: function(detail) {
            this.detail = detail;
        }
    };
});

app.factory('alertService', function($uibModal) {
    var alertService = {};

    // // 创建一个全局的 alert 数组
    // $rootScope.alerts = [];

    // alertService.add = function(type, msg) {
    //     $rootScope.alerts.push({
    //         'type': type,
    //         'msg': msg,
    //         'close': function() {
    //             alertService.closeAlert(this);
    //         }
    //     });
    // };

    // alertService.closeAlert = function(alert) {
    //     alertService.closeAlertIdx($rootScope.alerts.indexOf(alert));
    // };

    // alertService.closeAlertIdx = function(index) {
    //     $rootScope.alerts.splice(index, 1);
    // };

alertService.open = function(msg) {
    $uibModal.open({
        template: '<div class="modal-header"><h3 class="modal-title">执行结果</h3></div><div class="modal-body"><h4>' + msg + "</h4> </div>",
            size: 'sm'
        });
};
    return alertService;
});