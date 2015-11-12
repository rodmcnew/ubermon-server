var dollarPing = angular.module('dollarPing', ['lbServices', 'ngRoute']);

dollarPing.controller('home', function ($scope, User, $location) {
    function handleLBError(res) {
        alert(res.data.error.message);
    }

    function loginAndGoToDashboard(userData) {
        User.login(
            userData,
            function () {
                $location.path('/dashboard');
            },
            handleLBError
        )
    }

    $scope.createUser = function (userData) {
        User.create(
            userData,
            function () {
                loginAndGoToDashboard(userData);

            },
            handleLBError
        );
    }
});

dollarPing.controller('dashboard', function ($scope, Monitor) {
    $scope.newMonitor = {type: 'h', interval: 5};//h for http;

    function handleLBError(res) {
        alert(res.data.error.message);
    }

    $scope.createMonitor = function (monitorData) {
        Monitor.create(
            monitorData,
            function () {
                alert('monitor created!');
            },
            handleLBError
        );
    }
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
