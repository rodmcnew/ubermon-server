/**
 * @TODO add keyword, ping, and port monitor types
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
        req.body.startSecond = getRandomInt(0, 59);
        next();
    });

    Monitor.beforeRemote('prototype.updateAttributes', function (context, user, next) {
        var req = context.req;
        req.body.modifiedDate = Date.now();
        //Do not allow these values to be changed
        delete(req.body.userId);
        delete(req.body.startSecond);
        delete(req.body.up);
        next();
    });
};
