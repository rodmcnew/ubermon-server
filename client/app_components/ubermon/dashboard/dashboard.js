angular.module('ubermon').directive('ubermonDashboard', function (Monitor, Contact) {

    function link($scope) {
        $scope.monitors = [];
        $scope.selectedMonitor = null;
        $scope.monitorTypes = {
            'h': 'HTTP(s)',
            'p': 'Ping',
            'o': 'Port',
            'k': 'Keyword'
        };
        $scope.monitorIntervals = {
            1: 'Every minute',
            2: 'Every 2 minutes',
            5: 'Every 5 minutes',
            10: 'Every 10 minutes',
            15: 'Every 15 minutes',
            20: 'Every 20 minutes',
            30: 'Every 30 minutes',
            60: 'Every 60 minutes'
        };

        /**
         * Refresh monitor list from server
         */
        function updateMonitorList() {
            Monitor.listMine(
                function (res) {

                    var selectedMonitorId = null;

                    if ($scope.selectedMonitor) {
                        selectedMonitorId = $scope.selectedMonitor.id;
                    }

                    //If nothing changed, prevent UI jerking by avoiding a re-render
                    if (angular.toJson($scope.monitors) != angular.toJson(res.monitors)) {
                        $scope.monitors = res.monitors;
                    }

                    //Needed to ensure status display stays up to date on "Selected Monitor" UI area
                    if (selectedMonitorId) {
                        selectMonitorById(selectedMonitorId);
                    }

                    //Try to ensure a monitor is selected
                    if (!$scope.selectedMonitor) {
                        selectAnyMonitor();
                    }
                },
                $scope.handleServerError
            );
        }

        /**
         * Refresh contacts list from server
         */
        function updateContacts() {
            Contact.listMine(function (res) {
                $scope.contacts = res.contacts;
            }, $scope.handleServerError);
        }

        /**
         * Updates all the list and the data for the selected monitor
         */
        function update() {
            updateMonitorList();
        }

        /**
         * Attempts to ensure a monitor is selected. Useful after deletes and other changes.
         */
        function selectAnyMonitor() {
            if ($scope.monitors.length) {
                $scope.selectMonitor($scope.monitors[0]);
            } else {
                $scope.selectMonitor(null);
            }
        }

        /**
         * Select the monitor with the given id
         *
         * @param monitorId
         */
        function selectMonitorById(monitorId) {
            for (var i = 0, len = $scope.monitors.length; i < len; i++) {
                if ($scope.monitors[i].id == monitorId) {
                    $scope.selectMonitor($scope.monitors[i]);
                    return;
                }
            }
            //If something happened where the monitorId doesn't exist, fix things.
            selectAnyMonitor();
        }

        /**
         * This runs after an change is made so we show the results faster.
         */
        $scope.watchForPendingUpdate = function () {
            update();
            setTimeout(update, 1000);
            setTimeout(update, 2000);
            setTimeout(update, 3000);
            setTimeout(update, 4000);
            setTimeout(update, 5000);
        };

        $scope.handleServerError = function (res) {
            if (res.headers.status = 401) {
                window.location.href = '/';
            } else {
                alert(res.data.error.message);
            }
        };

        $scope.popCreateMonitorModal = function () {
            updateContacts();
            $scope.newMonitor = {type: 'h', interval: 5, url: 'http://', contactIds: []};//h for http;
        };

        $scope.deleteMonitor = function (monitor) {
            if (confirm('Delete monitor ' + monitor.name + '?')) {
                Monitor.deleteById(
                    {id: monitor.id},
                    function () {
                        update()
                    },
                    $scope.handleServerError
                );
            }
        };

        $scope.popEditMonitorModal = function (monitor) {
            updateContacts();
            $scope.selectMonitor(monitor);
            $scope.editableMonitor = angular.copy(monitor);
        };

        /**
         * Select the given monitor
         *
         * @param monitor
         */
        $scope.selectMonitor = function (monitor) {
            $scope.selectedMonitor = monitor;
        };

        //$scope.popCreateContactModal = function () {
        //    $scope.showCreateContactModal = true;
        //    $scope.newContact = {email: ''};
        //};

        //$scope.createContact = function (data) {
        //    Contact.create(
        //        data,
        //        function () {
        //            updateContacts();
        //        },
        //        $scope.handleServerError
        //    );
        //    $scope.showCreateContactModal = false;
        //};

        update();

        setInterval(update, 10000)
    }

    // Return the directive configuration
    return {
        link: link,
        restrict: 'E',
        templateUrl: '/app_components/ubermon/dashboard/dashboard.html'
    }
});
