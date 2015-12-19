var request = require('request');

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
            secret: process.env.recaptchaPrivateKey,
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
    app.models.User.beforeRemote('create', function (ctx, user, next) {
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

    app.models.User.afterRemote('create', function (ctx, user, next) {
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
        next();
    });
};
