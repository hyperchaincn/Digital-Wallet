var app = angular.module('myApp');
app.directive('my-file-input', ['', function() {
    // Runs during compile
    return {
        // name: '',
        // priority: 1,
        // terminal: true,
        // scope: {}, // {} = isolate, true = child, false/undefined = no change
        // controller: function($scope, $element, $attrs, $transclude) {},
        // require: 'ngModel', // Array = multiple requires, ? = optional, ^ = check parent elements
        restrict: 'A', // E = Element, A = Attribute, C = Class, M = Comment
        template: "<input type='file'/>",
        // templateUrl: '',
        // replace: true,
        // transclude: true,
        // compile: function(tElement, tAttrs, function transclude(function(scope, cloneLinkingFn){ return function linking(scope, elm, attrs){}})),
        link: function($scope, iElm, iAttrs, controller) {
            console.log("my-directive here");
            iElm.fileinput({
                language: "zh",
                // uploadUrl: "/file-upload-batch/2",
                allowedFileExtensions: ["jpg", "png", "gif"]
            });
        }
    };
}]);

app.directive('hello', function() {
    return {
        restrict: 'E',
        template: '<div><h2>Hi there fsdaffffffffffffssdasfffffffffffff</h2></div>',
        replace: true
    };
});