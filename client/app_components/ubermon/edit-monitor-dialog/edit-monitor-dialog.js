angular.module('ubermon').directive('ubermonEditMonitorDialog', function (Monitor) {

    /**
     * The link function for this directive. Runs when directive is loaded
     *
     * @param $scope
     */
    function link($scope) {
        function capitalizeFirstLetter(string) {
            if (!string || string.length < 1) {
                return string;
            }
            return string.charAt(0).toUpperCase() + string.slice(1);
        }

        $scope.updateMonitor = function (monitor) {
            monitor.name = capitalizeFirstLetter(monitor.name);
            Monitor.prototype$updateAttributes(
                {id: monitor.id},
                monitor,
                function () {
                    //saveMonitorContacts(monitor);
                    $scope.watchForPendingUpdate();
                    $scope.editableMonitor = null;//Hides the dialog
                },
                $scope.handleServerError
            );
        };

        $scope.cancelEditMonitor = function () {
            $scope.editableMonitor = null;//Hides the dialog
        };
    }

    // Return the directive configuration
    return {
        link: link,
        restrict: 'E',
        scope: {
            'editableMonitor': '=',
            'watchForPendingUpdate': '=',
            'monitorIntervals': '=',
            'contacts': '=',
            'handleServerError': '='
        },
        templateUrl: '/app_components/ubermon/edit-monitor-dialog/edit-monitor-dialog.html'
    }
});
