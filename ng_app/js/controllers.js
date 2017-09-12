var app = angular.module('myApp');

app.controller('WhiteController', function($scope, $http, $window) {
    $http({
        method: 'GET',
        url: '/user'
    }).then(function successCallback(response) {
        if (response.status == 200) {
            $window.location.href = '/dashboard';
        }
    }).then(function errorCallback(response) {});
});

app.controller('DashboardController', function($scope, $route, $window) {
    $scope.$route = $route;
    $scope.account = {
        phone: ''
    };
    $scope.signOut = function($scope) {
        delete $window.sessionStorage.token;
        $window.location.href = '/login';
    };
});

// ------------------------------账户---------------------------------------
app.controller('UserController', function($scope, $http, $route, $uibModal) {
    $scope.$route = $route;
    $http({
        method: 'GET',
        url: '/user'
    }).then(function(result) {
        data = result.data
        $scope.account.phone = data.data.phone;
        $scope.user = {
            account: data.data.phone,
            address: data.data.account_addr,
            time: data.data.create_time
        };
    },function(data, status, headers, config) {});

    $scope.open = function(size) {
        var modalInstance = $uibModal.open({
            templateUrl: 'views/verifyPwd.html',
            controller: 'KeyPwdModalCtrl',
            size: size,
            resolve: {
                title: function() {
                    return '查看密钥';
                },
                httpArgs: function() {
                    return {
                        method: 'POST',
                        url: '/key'
                    };
                }
            }
        });
        modalInstance.result.then(function(key) {
            $scope.user.key = key;
        });
    };

    $scope.changePwd = function() {
        var modalInstance = $uibModal.open({
            templateUrl: 'views/changePwd.html',
            controller: 'changePwdCtrl',
            size: 'md'
        });
    };
});

app.controller('changePwdCtrl', function($scope, $uibModalInstance, $http, $window) {
    $scope.ok = function() {
        console.log($scope.psw);
        if ($scope.psw.new_psw != $scope.repeat_psw) {
            $scope.repeat_error = '重复新密码错误！';
            return;
        } else {
            delete $scope.repeat_error;
        }
        $http({
            method: 'PUT',
            url: '/password',
            data: $scope.psw
        }).then(function(response) {
            if (response.status == 200) {
                $uibModalInstance.close();
                delete $window.sessionStorage.token;
                $window.location.href = '/login';
            } else {
                $scope.error = response.data.msg;
            }
        });
    };

    $scope.close = function() {
        $uibModalInstance.close();
    };
});

app.controller('KeyPwdModalCtrl', function($scope, $uibModalInstance, $http, title, httpArgs) {
    var key = "default";
    $scope.title = title;
    $scope.ok = function() {
        $http(httpArgs).then(function() {
            key = "privbvqVf51x29pE79Sr2HDiasGqnUDQU9zRUWwEbRcdaPZhgFqXDP6Z";
            $uibModalInstance.close(key);
        }, function() {
            key = "privbvqVf51x29pE79Sr2HDiasGqnUDQU9zRUWwEbRcdaPZhgFqXDP6Z";
            $uibModalInstance.close(key);
        });
    };
});

//--------------------------------资产--------------------------------------------------
app.controller('CreateAssetController', function($scope, Upload, $timeout, $http, $uibModal) {
    // $scope.create = function(file) {
    //     console.log(file);
    //     console.log($scope.asset);
    // if (file) {
    //     file.upload = Upload.upload({
    //         url: 'https://angular-file-upload-cors-srv.appspot.com/upload',
    //         data: {
    //             file: file,
    //             asset: $scope.asset
    //         }
    //     });
    //     file.upload.then(function(response) {
    //         $timeout(function() {
    //             file.result = response.data;
    //         });
    //     }, function(response) {
    //         if (response.status > 0)
    //             $scope.errorMsg = response.status + ': ' + response.data;
    //     }, function(evt) {
    //         file.progress = Math.min(100, parseInt(100.0 * evt.loaded / evt.total));
    //     });
    // }
    // };

    // $scope.cropped = false;
    // $scope.logo = false;

    // $scope.selectImg = function(){
    //     console.log($scope.logo);
    //     console.log($scope.cropped);
    //     if($scope.cropped){
    //         $scope.cropped = !$scope.cropped;
    //     }
    // }

    $scope.create = function(dataUrl, name) {
        var modalInstance = $uibModal.open({
            templateUrl: 'views/verifyPwd.html',
            controller: 'DetailModalInstanceCtrl',
            size: 'sm',
            backdrop: 'static',
            resolve: {
                title: function() {
                    return "创建资产";
                },
                httpArgs: function() {
                    return {
                        method: 'POST',
                        url: '/asset',
                        data: $scope.asset
                    };
                },
                url: function() {
                    return '/asset/detail';
                }
            }
        });
    };
});

app.controller('CreateAssetModalInstanceCtrl', function($scope, $http, $uibModalInstance, $location, Upload, data, file, DetailService, $window, $base64) {
    $scope.title = '创建资产';
    $scope.ok = function() {
        data.psw = $scope.psw;
        Upload.http({
                url: '/asset',
                data: {
                    data: data,
                    file: file
                }
            })
            // $http({
            //     method: 'POST',
            //     url: '/asset',
            //     data: data
            // })
            .then(function(response) {
                DetailService.setDetail(response.data.data);
                $uibModalInstance.close();
                $location.url('/asset/detail');
            }, function(response) {
                $scope.error = "密码错误！";
            });
    };
});

app.controller('IssueAssetController', function($scope, $http, $uibModal) {
    $http({
        method: 'GET',
        url: '/asset?type=issue',
    }).then(function(response) {
        $scope.items = response.data.data;
    });

    $scope.changeIssueAsset = function(asset) {
        $scope.issue = {
            asset_addr: asset.asset_addr
        };
    };

    $scope.doIssue = function() {
        var modalInstance = $uibModal.open({
            templateUrl: 'views/verifyPwd.html',
            controller: 'DetailModalInstanceCtrl',
            size: 'sm',
            backdrop: 'static',
            resolve: {
                title: function() {
                    return '发行资产';
                },
                httpArgs: function() {
                    return {
                        method: 'PUT',
                        url: '/asset',
                        data: $scope.issue
                    };
                },
                url: function() {
                    return '/asset/detail';
                }
            }
        });
    };
});

function down(x, y) {
    return (x.create_time < y.create_time) ? 1 : -1;
}

function getDetail($scope, $http, url) {
    $http({
        method: 'GET',
        url: url
    }).then(function(response) {
        var items = response.data.data;
        items.sort(down);
        $scope.totalItems = items.length;
        $scope.perPage = 10;
        $scope.items = items.slice(0, $scope.perPage);
        $scope.pageChanged = function() {
            $scope.items = items.slice(($scope.perPage * ($scope.currentPage - 1)), ($scope.perPage * $scope.currentPage)); //通过当前页数筛选出表格当前显示数据
        };
    });
}

app.controller('AssetListController', function($scope, $http, $location, DetailService) {
    $scope.selectedType = "all";
    getDetail($scope, $http, '/asset');

    $scope.changeType = function(selectedType) {
        if (selectedType == 'in') {
            getDetail($scope, $http, '/asset?type=receive');
        } else if (selectedType == 'issue') {
            getDetail($scope, $http, '/asset?type=issue');
        } else if (selectedType == 'all') {
            getDetail($scope, $http, '/asset');
        }
    };

    $scope.detail = function(asset) {
        DetailService.setDetail(asset);
        $location.url('/asset/detail');
    };
});

app.controller('AssetDetailController', function($scope, DetailService) {
    $scope.asset = DetailService.getDetail();
});

//-----------------------------------交易---------------------------------
app.controller('AssetTransferController', function($scope, $uibModal, $http) {
    $http({
        method: 'GET',
        url: '/asset',
    }).then(function(response) {
        $scope.assets = response.data.data;
    });

    $scope.changeAsset = function(asset) {
        $scope.trx = {
            asset_addr: asset.asset_addr
        };
    };

    $scope.setBalance = function(asset) {
        if (asset) {
            $scope.balance = asset.balance;
        }
    };

    $scope.transfer = function() {
        if ($scope.trx.amount > $scope.balance) {
            $scope.balanceError = '余额不足';
            return;
        } else {
            delete $scope.balanceError;
        }
        var modalInstance = $uibModal.open({
            templateUrl: 'views/verifyPwd.html',
            controller: 'DetailModalInstanceCtrl',
            size: 'sm',
            backdrop: 'static',
            resolve: {
                title: function() {
                    return '转出资产';
                },
                httpArgs: function() {
                    return {
                        method: 'POST',
                        url: '/transaction',
                        data: $scope.trx
                    };
                },
                url: function() {
                    return '/transaction/detail';
                }
            }
        });
    };
});

app.controller('TransactionListController', function($scope, $uibModal, $http, DetailService, $location) {
    $scope.selectedType = "all";
    getDetail($scope, $http, '/transaction');

    $scope.changeType = function(selectedType) {
        if (selectedType == 'all') {
            getDetail($scope, $http, '/transaction');
        } else if (selectedType == 'in') {
            getDetail($scope, $http, 'transaction?type=receive');
        } else if (selectedType == 'out') {
            getDetail($scope, $http, 'transaction?type=transfer');
        } else if (selectedType == 'issue') {
            getDetail($scope, $http, 'transaction?type=issue');
        }
    };

    $scope.detail = function(record) {
        DetailService.setDetail(record);
        $location.url('/transaction/detail');
    };
});

app.controller('TransactionDetailController', function($scope, DetailService) {
    $scope.trx = DetailService.getDetail();
});

app.controller('DetailModalInstanceCtrl', function($scope, $uibModalInstance, $http, title, httpArgs, DetailService, $location, url) {
    $scope.title = title;
    $scope.disappear = false;
    $scope.ok = function() {
        $scope.disappear = true;
        delete $scope.error;
        httpArgs.data.psw = $scope.psw;
        $http(httpArgs).then(function(response) {
            if (response.status == 200) {
                DetailService.setDetail(response.data.data);
                $uibModalInstance.close();
                $location.url(url);
            } else {
                $scope.disappear = false;
                $scope.error = response.data.msg;
            }
        }, function(response) {
            $scope.disappear = false;
            $scope.error = "密码错误！";
        });
    };

    $scope.close = function() {
        $uibModalInstance.close();
    };
});