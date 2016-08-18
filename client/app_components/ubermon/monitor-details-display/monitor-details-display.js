angular.module('ubermon').directive('ubermonMonitorDetailsDisplay', function (MonitorEvent, MonitorPing) {

    /**
     * The link function for this directive. Runs when directive is loaded
     *
     * @param $scope
     */
    function link($scope) {
        $scope.selectedMonitorPingChart = {};
        $scope.selectedMonitorEvents = {};

        /**
         * Converts a ping list response from the server into the format that the UI likes
         * @TODO add chart hover data
         *
         * @param res Response from ping list rest api
         */
        function formatPingData(res) {
            var pingChart = {
                data: [[]],
                labels: []
            };
            res.forEach(function (ping) {
                pingChart.data[0].unshift(ping.latency);
                var date = new Date(ping.date);
                var minutes = date.getMinutes().toString();
                if (minutes.length == 1) {
                    minutes = '0' + minutes;
                }
                pingChart.labels.unshift(date.getHours() + ':' + minutes);
            });
            //Fix 1 point charts which don't display properly
            if (pingChart.data[0].length == 1) {
                pingChart.data[0].unshift(pingChart.data[0][0]);
                pingChart.labels.unshift(pingChart.labels[0]);
            }
            return pingChart;
        }

        function updateCurrentMonitor() {
            if (!$scope.selectedMonitor) {
                return;
            }
            MonitorEvent.find(
                {
                    filter: {
                        where: {monitorId: $scope.selectedMonitor.id},
                        order: 'date DESC',
                        limit: 10
                    }
                }, function (res) {
                    //If nothing changed, prevent UI jerking by avoiding a re-render
                    if (angular.toJson($scope.selectedMonitorEvents) != angular.toJson(res)) {
                        $scope.selectedMonitorEvents = res;
                    }

                }, $scope.handleServerError);
            MonitorPing.find(
                {
                    filter: {
                        where: {monitorId: $scope.selectedMonitor.id},
                        order: 'date DESC',
                        limit: 20
                    }
                }, function (res) {

                    var pingChart = formatPingData(res);

                    //If nothing changed, prevent UI jerking by avoiding a re-render
                    if (angular.toJson($scope.selectedMonitorPingChart) != angular.toJson(pingChart)) {
                        $scope.selectedMonitorPingChart = pingChart;
                    }
                }, $scope.handleServerError);
        }

        $scope.$watch('selectedMonitor', function (newValue, oldValue, scope) {
            //If nothing changed, prevent UI jerking by avoiding a re-render
            if (angular.toJson(newValue) != angular.toJson(oldValue)) {
                $scope.selectedMonitorPingChart = null;
                $scope.selectedMonitorEvents = null;
            }
            updateCurrentMonitor();
        });

        setInterval(updateCurrentMonitor, 10000);
    }

    // Return the directive configuration
    return {
        link: link,
        restrict: 'E',
        scope: {
            'selectedMonitor': '=',
            'handleServerError': '=',
            'monitorIntervals': '='
        },
        templateUrl: '/app_components/ubermon/monitor-details-display/monitor-details-display.html'
    }
});
