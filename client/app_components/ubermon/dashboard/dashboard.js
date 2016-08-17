angular.module('ubermon').controller('ubermonDashboard', function ($scope, Monitor, MonitorEvent, MonitorPing, Contact) {
    $scope.monitorTypes = {
        'h': 'HTTP(s)',
        'p': 'Ping',
        'o': 'Port',
        'k': 'Keyword'
    };
    $scope.monitorIntervals = {
        '1': 'Every minute',
        '2': 'Every 2 minutes',
        '5': 'Every 5 minutes',
        '10': 'Every 10 minutes',
        '15': 'Every 15 minutes',
        '20': 'Every 20 minutes',
        '30': 'Every 30 minutes',
        '60': 'Every 60 minutes'
    };

    function handleLBError(res) {
        alert(res.data.error.message);
    }

    function updateCurrentMonitor() {
        if (!$scope.currentMonitor) {
            return;
        }
        MonitorEvent.find(
            {
                filter: {
                    where: {monitorId: $scope.currentMonitor.id},
                    order: 'date DESC',
                    limit: 10
                }
            }, function (res) {
                $scope.currentMonitor.events = res;
            }, handleLBError);
        MonitorPing.find(
            {
                filter: {
                    where: {monitorId: $scope.currentMonitor.id},
                    order: 'date DESC',
                    limit: 20
                }
            }, function (res) {
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
                $scope.currentMonitor.pingChart = pingChart;
                /**
                 * @TODO add chart hover
                 */
            }, handleLBError);
    }

    function updateMonitorList() {
        Monitor.listMine(function (res) {
            $scope.monitors = res.monitors;
            if ($scope.monitors.length && !$scope.currentMonitor) {
                $scope.selectMonitor($scope.monitors[0])
            }
        }, handleLBError);
    }

    function updateContacts() {
        Contact.listMine(function (res) {
            $scope.contacts = res.contacts;
        }, handleLBError);
    }

    function update() {
        updateMonitorList();
        updateCurrentMonitor();
    }

    /**
     * This runs after an update is made and we are in a hurry to show
     * the results.
     */
    function updateSoon() {
        setTimeout(update, 1000);
        setTimeout(update, 2000);
        setTimeout(update, 3000);
        setTimeout(update, 4000);
        setTimeout(update, 5000);
    }

    $scope.popCreateMonitorModal = function () {
        updateContacts();
        $scope.showCreateMonitorModal = true;
        $scope.newMonitor = {type: 'h', interval: '5', url: 'http://', contactIds: []};//h for http;
    };

    $scope.popCreateContactModal = function () {
        $scope.showCreateContactModal = true;
        $scope.newContact = {email: ''};
    };

    $scope.createMonitor = function (data) {
        Monitor.create(
            data,
            function (newMonitor) {
                //data.id = parseInt(newMonitor.id);
                //saveMonitorContacts(data);
                update();
                updateSoon();
                /**
                 * @TODO select the created monitor
                 */
            },
            handleLBError
        );
        $scope.showCreateMonitorModal = false;
    };

    $scope.createContact = function (data) {
        Contact.create(
            data,
            function () {
                updateContacts();
            },
            handleLBError
        );
        $scope.showCreateContactModal = false;
    };

    $scope.deleteMonitor = function (monitor) {
        if (confirm('Delete monitor ' + monitor.name + '?')) {
            Monitor.deleteById(
                {id: monitor.id},
                function () {
                    updateMonitorList();
                },
                handleLBError
            );
        }
    };

    $scope.editMonitor = function (monitor) {
        updateContacts();
        $scope.selectMonitor(monitor);
        $scope.showEditMonitorModal = true;
    };

    $scope.cancelEditMonitor = function () {
        updateMonitorList();
        updateCurrentMonitor();
        $scope.showEditMonitorModal = false;
    };

    $scope.updateMonitor = function (monitor) {
        Monitor.prototype$updateAttributes(
            {id: monitor.id},
            monitor,
            function () {
                //saveMonitorContacts(monitor);
                updateMonitorList();
                updateSoon();
            },
            handleLBError
        )
        ;
        $scope.showEditMonitorModal = false;
    };

    $scope.selectMonitor = function (monitor) {
        $scope.currentMonitor = monitor;
        updateCurrentMonitor();
    };

    updateMonitorList();

    setInterval(update, 10000)
});

