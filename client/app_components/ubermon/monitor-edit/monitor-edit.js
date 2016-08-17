ubermon.directive('ubermonMonitorEdit', function () {

    /**
     * The link function for this directive. Runs when directive is loaded
     *
     * @param $scope
     */
    function link($scope) {
        // toggle selection for a given fruit by name
        $scope.toogleSelectedContact = function toggleSelection(id) {
            var idx = $scope.selectedContacts.indexOf(id);

            // is currently selected
            if (idx > -1) {
                $scope.selectedContacts.splice(idx, 1);
            }

            // is newly selected
            else {
                $scope.selectedContacts.push(id);
            }
        };
    }

    // Return the directive configuration
    return {
        link: link,
        scope: {
            'monitor': '=',
            'monitorTypes': '=',
            'monitorIntervals': '=',
            'contacts': '=',
            'popCreateContactModal': '=',
            'selectedContacts': '='
        },
        templateUrl: '/partial/monitor-edit.html'
    }
});
