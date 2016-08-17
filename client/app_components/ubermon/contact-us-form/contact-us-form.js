ubermon.directive('ubermonContactUsForm', function (User, $scope, $location, $http) {

    $scope.messageSent = false;
    $scope.message = {
        email: '',
        body: ''
    };

    //Send the reset password email
    $scope.sendMessage = function (message) {
        //$scope.error = '';
        //User.resetPassword(
        //    {email: email},
        //    function () {
        //        $scope.resetEmailSent = true;
        //    },
        //    handleLBError
        //)
        $scope.messageSent = true;
    };

    function link($scope) {
    }

    // Return the directive configuration
    return {
        link: link,
        restrict: 'E',
        templateUrl: '/components/ubermon/contact-us-form/contact-us-form.html'
    }
});
