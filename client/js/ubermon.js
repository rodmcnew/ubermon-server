/**
 * @TODO split this into multi files and use grunt to combine theem
 */
var ubermon = angular.module('ubermon', ['lbServices', 'chart.js', 'vcRecaptcha']);
var ubermonConfig = {
    recaptchaPubKey: '6LcCeRMTAAAAAJOmu2kbjXyOs07yf28tFt2sn9bF'
};

ubermon.controller('ubermonDashboard', function ($scope, Monitor, MonitorEvent, MonitorPing, Contact) {
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

/**
 * @TODO move the "create user" and "login" forms to directives
 */
ubermon.controller('ubermonHome', function (User, Contact, $scope, $window, vcRecaptchaService, $window) {

    $scope.newUser = {};
    $scope.loginUser = {};
    $scope.emailJustVerified = $window.location.href.indexOf('emailJustVerified') != -1;

    function handleLBError(res) {
        alert(res.data.error.message);
    }

    $scope.loginUser = function (userData) {
        User.login(
            userData,
            function () {
                $window.location.href = '/dashboard';
            },
            handleLBError
        )
    };

    $scope.createUser = function (userData) {

        userData['clientCaptchaRes'] = $scope.captcha.response;

        User.create(
            userData,
            function () {
                $scope.verifyEmailSent = true;
            },
            function (res) {
                // In case of a failed validation you need to reload the captcha
                // because each response can be checked just once
                vcRecaptchaService.reload($scope.widgetId);
                handleLBError(res);
            }
        );
    };
    $scope.captcha = {
        resposne: null,
        widgetId: null,
        key: ubermonConfig.recaptchaPubKey,
        setResponse: function (response) {
            $scope.captcha.response = response;
        },
        setWidgetId: function (widgetId) {
            $scope.captcha.widgetId = widgetId;
        },
        cbExpiration: function () {
            $scope.captcha.response = null;
        }
    };
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
