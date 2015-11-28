/**
 * @TODO listen for email change event and update contact
 * @param app
 */
module.exports = function (app) {
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
