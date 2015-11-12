var dollarPing = angular.module('dollarPing', ['lbServices', 'ngRoute']);

dollarPing.controller('home', function ($scope, User, $location) {
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

dollarPing.controller('dashboard', function ($scope, Monitor, MonitorEvent) {
    $scope.newMonitor = {type: 'h', interval: '1', url: 'http://'};//h for http;

    function handleLBError(res) {
        alert(res.data.error.message);
    }

    function updateCurrentMonitor() {
        MonitorEvent.find(
            {
                filter: {
                    where: {monitorId: $scope.currentMonitor.id},
                    order: 'date DESC', //@todo make this work
                    limit: 10
                }
            }, function (res) {
                $scope.events = res;
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

    $scope.createMonitor = function (monitorData) {
        Monitor.create(
            monitorData,
            function () {
                alert('monitor created!');
                updateMonitorList();
            },
            handleLBError
        );
    };

    $scope.selectMonitor = function (monitor) {
        $scope.currentMonitor = monitor;
        updateCurrentMonitor();
    };

    updateMonitorList();

    setInterval(function () {
        updateMonitorList();
        updateCurrentMonitor();
    }, 10000)
});

dollarPing.config(['$routeProvider', function ($routeProvider) {
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
