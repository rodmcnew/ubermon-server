var ubermon = angular.module('ubermon', ['lbServices', 'chart.js']);

ubermon.controller('ubermonDashboard', function ($scope, Monitor, MonitorEvent, MonitorPing, Contact) {
    $scope.monitorTypes = {
        'h': 'HTTP(s)',
        'p': 'Ping',
        'o': 'Port',
        'k': 'Keyword (advanced)'
    };
    $scope.monitorIntervals = {
        '1': 'Every minute (advanced)',
        '2': 'Every 2 minutes (advanced)',
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

    function updateSoon() {
        setTimeout(update, 3);
        setTimeout(update, 6);
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

ubermon.controller('ubermonHome', function (User, Contact, $scope, $window) {

    function handleLBError(res) {
        alert(res.data.error.message);
    }

    $scope.loginUser = function (userData) {
        User.login(
            userData,
            function () {
                Contact.listMine(function (res) {
                    //Ensure there is a contact with our current email in it.
                    var found = false;
                    angular.forEach(res.contacts, function (contact) {
                        if (contact.email == userData.email) {
                            found = true;
                        }
                    });
                    if (found) {
                        $window.location.href = '/dashboard';
                    } else {
                        Contact.create({email: userData.email}, function () {
                            $window.location.href = '/dashboard';
                        });
                    }
                }, handleLBError);
            },
            handleLBError
        )
    };

    $scope.createUser = function (userData) {
        User.create(
            userData,
            function () {
                $scope.loginUser(userData);

            },
            handleLBError
        );
    }
});

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

ubermon.directive('ubermonContactEdit', function () {

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
