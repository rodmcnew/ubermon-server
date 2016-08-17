console.log(1);
angular.module('ubermon').directive('ubermonContactUsForm', function () {

    function link($scope) {
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
    }

    // Return the directive configuration
    return {
        link: link,
        restrict: 'E',
        templateUrl: '/app_components/ubermon/contact-us-form/contact-us-form.html'
    }
});
