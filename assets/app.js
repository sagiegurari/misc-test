angular.module('siteApp', ['ngMaterial'], function ($interpolateProvider) {
        $interpolateProvider.startSymbol('[[');
        $interpolateProvider.endSymbol(']]');
}).controller('siteController', ['$scope', function ($scope) {
        $scope.repositories = window.githubInfo.sort(function (repo1, repo2) {
                return repo1.stargazers_count - repo2.stargazers_count;
        });
}]);
