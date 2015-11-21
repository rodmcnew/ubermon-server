function whiteListProperties(body, allowedProperties) {
    var safeBody = {};
    for (var i = 0, len = allowedProperties.length; i < len; i++) {
        safeBody[allowedProperties[i]] = body[allowedProperties[i]];
    }
    return safeBody;
}
var remoteWhitelist = require(__dirname + '/remoteWhitelist');
module.exports = function (Profile) {
    remoteWhitelist(Profile, ['findOne']);

    Profile.beforeRemote('create', function (context, user, next) {
        context.req.body.maxSimpleMonitors = 50;
        context.req.body.maxAdvancedMonitors = 5;
        next();
    });
    Profile.beforeRemote('prototype.updateAttributes', function (context, user, next) {
        context.req.body = whiteListProperties(context.req.body, ['email']);
        console.log(context.req.body);
        next();
    });
};
