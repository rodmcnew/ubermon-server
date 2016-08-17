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
        scope: {
            'contact': '='
        },
        templateUrl: '/partial/contact-edit.html'
    }
});
