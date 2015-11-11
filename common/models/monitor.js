var loopback = require('loopback');

module.exports = function (Monitor) {
    Monitor.observe('before save', function filterProperties(ctx, next) {
        var context = loopback.getCurrentContext();

        /**
         * For posts only, demand that the monitor
         * be owned by current user.
         */
        if (ctx.instance && ctx.instance.userId != context.active.accessToken.userId) {
            var err = new Error("userId must be the logged in user.");
            err.statusCode = 400;
            next(err);
            return;
        }

        /**
         * For puts only, do not allow the userId to
         * be modified.
         */
        if (ctx.data && ctx.data.userId && ctx.data.userId != ctx.currentInstance.userId) {
            var err = new Error("userId cannot be modified");
            err.statusCode = 400;
            next(err);
            return;
        }

        next();
    });
};
