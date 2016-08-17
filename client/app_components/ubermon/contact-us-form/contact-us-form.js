angular.module('ubermon').directive('ubermonContactUsForm', function (Contact) {

    function link($scope) {
        $scope.messageSent = false;
        $scope.message = {
            email: '',
            body: ''
        };

        //Send the reset password email
        $scope.sendMessage = function (message) {
            Contact.sendMessageToAdmin(message,
                function () {
                    $scope.messageSent = true;
                },
                function (res) {
                    alert("An error occurred.\n\n"+res.data.error.message)
                }
            );
        };
    }

    // Return the directive configuration
    return {
        link: link,
        restrict: 'E',
        templateUrl: '/app_components/ubermon/contact-us-form/contact-us-form.html'
    }
});
