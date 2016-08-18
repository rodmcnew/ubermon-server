/**
 * @TODO move the "create user" and "login" forms to directives
 */
angular.module('ubermon').controller('ubermonHome', function (User, Contact, $scope, $window, vcRecaptchaService) {

    $scope.newUser = {};
    $scope.loginUser = {};
    $scope.emailJustVerified = $window.location.href.indexOf('emailJustVerified') != -1;
    $scope.error = '';

    function handleServerError(res) {
        $scope.error = res.data.error.message;
    }

    $scope.loginUser = function (userData) {
        $scope.error = '';
        User.login(
            userData,
            function () {
                $window.location.href = '/dashboard';
            },
            handleServerError
        )
    };

    $scope.createUser = function (userData) {

        userData['clientCaptchaRes'] = $scope.captcha.response;

        $scope.error = '';
        User.create(
            userData,
            function () {
                $scope.verifyEmailSent = true;
            },
            function (res) {
                // In case of a failed validation you need to reload the captcha
                // because each response can be checked just once
                vcRecaptchaService.reload($scope.widgetId);
                handleServerError(res);
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
