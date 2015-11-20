var ubermon = angular.module('ubermon', ['lbServices', 'ngRoute', 'chart.js']);

ubermon.controller('home', function ($scope, User, $location) {

    function handleLBError(res) {
        alert(res.data.error.message);
    }

    $scope.loginUser = function (userData) {
        User.login(
            userData,
            function () {
                $location.path('/dashboard');
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

ubermon.controller('dashboard', function ($scope, Monitor, MonitorEvent, MonitorPing) {
    function prepareForNewMonitor() {
        $scope.newMonitor = {type: 'h', interval: '5', url: 'http://'};//h for http;
    }

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
                    limit: 60 * 24 //@TODO use 24 hours ago instead
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
                    pingChart.label.unshift(pingChart.label[0]);
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

    function update() {
        updateMonitorList();
        updateCurrentMonitor();
    }

    function updateSoon() {
        setTimeout(update, 3);
        setTimeout(update, 6);
    }

    $scope.createMonitor = function (monitorData) {
        Monitor.create(
            monitorData,
            function () {
                updateMonitorList();
                updateSoon();
                /**
                 * @TODO select the created monitor
                 */
            },
            handleLBError
        );
        $scope.showCreateMonitorModal = false;
        prepareForNewMonitor();
    };

    $scope.selectMonitor = function (monitor) {
        $scope.currentMonitor = monitor;
        updateCurrentMonitor();
    };

    updateMonitorList();
    prepareForNewMonitor();

    setInterval(update, 10000)
});

ubermon.config(['$routeProvider', function ($routeProvider) {
    $routeProvider.
        when('/', {
            templateUrl: 'view/home.html',
            controller: 'home'
        }).
        when('/dashboard', {
            templateUrl: 'view/dashboard.html',
            controller: 'dashboard'
        }).
        //when('/privacy', {
        //    templateUrl: 'view/privacy.html'
        //}).
        //when('/terms', {
        //    templateUrl: 'view/terms.html'
        //}).
        //when('/login', {
        //    templateUrl: 'view/login.html'
        //}).
        otherwise({
            redirectTo: '/'
        });
}]);
