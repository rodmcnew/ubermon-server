/**
 * @TODO ensure owner cannot be changed away to another owner
 * @param Contact
 */
var remoteWhitelist = require(__dirname + '/remoteWhitelist');
module.exports = function (Contact) {
    remoteWhitelist(Contact, ['create']);
    // email validation regex
    var emailRegex = /^(([^<>()[\]\\.,;:\s@\"]+(\.[^<>()[\]\\.,;:\s@\"]+)*)|(\".+\"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;

    Contact.validatesFormatOf('email', {with: emailRegex, message: 'Invalid email'});

    Contact.beforeRemote('create', function (context, user, next) {
        var res = new Error('Coming soon: This feature is disabled until we build verification for new contacts.');
        res.statusCode = 400;
        next(res);

        var req = context.req;
        req.body.userId = req.accessToken.userId;
        next();
    });

    Contact.listMine = function (req, cb) {
        Contact.find(
            {where: {userId: req.accessToken.userId}},
            function (err, contacts) {
                if (err) {
                    console.error(err);
                }
                cb(null, contacts);
            }
        );
    };

    Contact.remoteMethod(
        'listMine',
        {
            accepts: {arg: 'req', type: 'object', http: {source: 'req'}},
            returns: {arg: 'contacts', type: 'array'},
            http: {verb: 'GET'},
            description:'List all that are owned by the current user.'
        }
    );
};
