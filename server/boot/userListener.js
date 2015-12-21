var request = require('request');
var path = require('path');
/**
 * @TODO listen for email change event and update contact
 * @param app
 */

/**
 * @TODO move this recaptcha stuff to its own module
 * @param req the request form the client
 * @param cb called with 1st arg being true of false for success
 */
function verifyCapcha(req, cb) {
    if (!req.body.clientCaptchaRes) {
        cb(false);
        return;
    }

    var reqOptions = {
        method: 'POST',
        url: 'https://www.google.com/recaptcha/api/siteverify',
        formData: {
            secret: process.env.RECAPTCH_PRIVATE_KEY,
            response: req.body.clientCaptchaRes,
            remoteip: req.connection.remoteAddress
        }
    };
    request(reqOptions, function (err, res) {
        if (err) {
            console.error(err);
        }
        cb(JSON.parse(res.body).success);
    });
}

module.exports = function (app) {
    var User = app.models.User

    User.beforeRemote('create', function (ctx, user, next) {
        verifyCapcha(ctx.req, function (success) {
            if (success) {
                next()
            } else {
                var res = new Error('The captcha was invalid. Please try again.');
                res.statusCode = 400;
                next(res);
            }
        });
    });

    User.afterRemote('create', function (ctx, user, next) {
        app.models.Profile.create(
            {
                "maxMonitors": 50,
                "maxAdvancedMonitors": 0,
                "userId": user.id
            },
            function (err) {
                if (err) {
                    console.error(err);
                }
            }
        );
        app.models.Contact.create(
            {
                "email": user.email,
                "userId": user.id
            },
            function (err) {
                if (err) {
                    console.error(err);
                }
            }
        );

        var options = {
            type: 'email',
            to: user.email,
            from: 'Ubermon <' + process.env.FROM_EMAIL + '>',
            subject: 'Ubermon - Email Verification',
            template: path.resolve(__dirname, '../../server/views/activationEmail.ejs'),
            redirect: '/?emailJustVerified=1',
            user: user,
            host: 'ubermon.com',
            port: 80
        };

        user.verify(options, function (err, response, next) {
            if (err) {
                console.error(err);
            }
        });

        next();
    });

    //send password reset link when requested
    User.on('resetPasswordRequest', function (info) {
        console.log(info);
        var url = 'http://ubermon.com/reset-password/';
        var html = 'Click <a href="' + url + '#?access_token=' +
            info.accessToken.id + '&userId=' + info.user.id + '&fromEmail=1">here</a> to reset your password';

        app.models.Email.send({
            to: info.email,
            from: 'Ubermon <' + process.env.FROM_EMAIL + '>',
            subject: 'Ubermon - Reset Password',
            html: html
        }, function (err) {
            if (err) return console.error(err);
        });
    });
};
