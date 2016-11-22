angular.module('siteApp', ['ngMaterial'], function ($interpolateProvider) {
    'use strict';

    $interpolateProvider.startSymbol('[[');
    $interpolateProvider.endSymbol(']]');
}).controller('siteController', ['$scope', function ($scope) {
    'use strict';

    $scope.repositories = (window.githubInfo || []).sort(function (repo1, repo2) {
        var output = repo2.stargazers_count - repo1.stargazers_count;

        if (!output) {
            output = repo2.forks_count - repo1.forks_count;
        }

        return output;
    });

    $scope.getLanguageColor = function (repository) {
        if (repository && repository.language) {
            return 'github-color-' + repository.language.toLowerCase();
        }

        return '';
    };
}]);
