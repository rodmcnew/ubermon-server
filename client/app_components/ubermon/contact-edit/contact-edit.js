angular.module('ubermon').directive('ubermonContactEdit', function () {

    /**
     * The link function for this directive. Runs when directive is loaded
     *
     * @param $scope
     */
    function link($scope) {
    }

    // Return the directive configuration
    return {
        link: link,
        restrict: 'E',
        scope: {
            'contact': '='
        },
        templateUrl: 'client/app_components/ubermon/contact-edit/contact-edit.html'
    }
});
