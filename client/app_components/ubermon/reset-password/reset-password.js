angular.module('ubermon').directive('ubermonResetPassword', function (User, $window, $http) {
    function link($scope) {
        function getUrlParameter(param) {
            var sPageURL = $window.location.search.substring(1),
                sURLVariables = sPageURL.split(/[&||?]/),
                res;

            for (var i = 0; i < sURLVariables.length; i += 1) {
                var paramName = sURLVariables[i],
                    sParameterName = (paramName || '').split('=');

                if (sParameterName[0] === param) {
                    res = sParameterName[1];
                }
            }

            return res;
        }

        $scope.fromEmail = (getUrlParameter('fromEmail') == 1);
        $scope.resetEmailSent = false;
        $scope.resetPasswordEmail = '';
        $scope.passwordChanged = false;
        $scope.error = '';

        function handleServerError(res) {
            $scope.error = res.data.error.message;
        }

        //Send the reset password email
        $scope.resetPassword = function (email) {
            $scope.error = '';
            User.resetPassword(
                {email: email},
                function () {
                    $scope.resetEmailSent = true;
                },
                handleServerError
            )
        };

        //Change the password after they came back form the email
        $scope.changePassword = function (password) {
            $http({
                method: 'PUT',
                url: '/api/Users/' + getUrlParameter('userId'),
                data: {password: password},
                headers: {authorization: getUrlParameter('access_token')}
            }).then(function () {
                $scope.passwordChanged = true;
            }, function (response) {
                if (response.error) {
                    handleServerError(response.error.message);
                } else {
                    handleServerError('An error occurred.');
                }
            });
        };
    }

    // Return the directive configuration
    return {
        link: link,
        restrict: 'E',
        templateUrl: '/app_components/ubermon/reset-password/reset-password.html'
    }
});


