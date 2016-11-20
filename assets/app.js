angular.module('siteApp', ['ngMaterial'], function ($interpolateProvider) {
        $interpolateProvider.startSymbol('[[');
        $interpolateProvider.endSymbol(']]');
}).controller('siteController', ['$scope', function ($scope) {
        $scope.repositories = window.githubInfo;
}]);
