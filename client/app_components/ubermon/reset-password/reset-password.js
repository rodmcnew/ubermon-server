
angular.module('ubermon').controller('ubermonResetPassword', function (User, $scope, $location, $http) {

    var urlParams = $location.search();

    $scope.fromEmail = urlParams['fromEmail'] == 1;
    $scope.resetEmailSent = false;
    $scope.resetPasswordEmail = '';
    $scope.passwordChanged = false;
    $scope.error = '';

    function handleLBError(res) {
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
            handleLBError
        )
    };

    //Change the password after they came back form the email
    $scope.changePassword = function (password) {
        $http({
            method: 'PUT',
            url: '/api/Users/' + urlParams['userId'],
            data: {password: password},
            headers: {authorization: urlParams['access_token']}
        }).then(function () {
            $scope.passwordChanged = true;
        }, function (response) {
            if (response.error) {
                handleLBError(response.error.message);
            } else {
                handleLBError('An error occurred.');
            }
        });
    };
});

