module.exports = function (Monitor) {
    Monitor.beforeRemote('create', function (context, user, next) {
        var req = context.req;
        req.body.modifiedDate = Date.now();
        req.body.userId = context.req.accessToken.userId;
        next();
    });

    Monitor.beforeRemote('prototype.updateAttributes', function (context, user, next) {
        var req = context.req;
        req.body.modifiedDate = Date.now();
        delete(req.body.userId);
        next();
    });
};
