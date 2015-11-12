/**
 * @TODO add keyword, ping, and port monitor types
 * @todo validate user emails
 * @param min
 * @param max
 * @returns {*}
 */

function getRandomInt(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}
/**
 * @TODO validate interval > 0
 * @param Monitor
 */
module.exports = function (Monitor) {
    Monitor.beforeRemote('create', function (context, user, next) {
        var req = context.req;
        req.body.modifiedDate = Date.now();
        req.body.userId = context.req.accessToken.userId;
        req.body.secondOffset = getRandomInt(0, 19);
        req.body.up = false;
        next();
    });

    Monitor.beforeRemote('prototype.updateAttributes', function (context, user, next) {
        var req = context.req;
        req.body.modifiedDate = Date.now();
        //Do not allow these values to be changed
        delete(req.body.userId);
        delete(req.body.secondOffset);
        delete(req.body.up);
        next();
    });
};
