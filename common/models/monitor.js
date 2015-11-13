/**
 * @TODO add keyword, ping, and port monitor types
 * @todo validate user emails
 * @par min
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
        req.body.userId = req.accessToken.userId;
        req.body.intraminuteOffset = getRandomInt(0, 19);
        req.body.up = null;
        req.body.type = 'h';
        next();
    });

    Monitor.beforeRemote('prototype.updateAttributes', function (context, user, next) {
        var req = context.req;
        req.body.modifiedDate = Date.now();
        //Do not allow these values to be changed
        delete(req.body.userId);
        delete(req.body.intraminuteOffset);
        delete(req.body.up);
        delete(req.body.type);
        next();
    });

    Monitor.listMine = function (accessToken, cb) {
        Monitor.find(
            {where: {userId: accessToken.accessToken.userId}},
            function (err, monitors) {
                if (err) {
                    console.error(err);
                }
                cb(null, monitors);
            }
        );
    };

    Monitor.remoteMethod(
        'listMine',
        {
            accepts: {arg: 'accessToken', type: 'object', http: {source: 'req'}},
            returns: {arg: 'monitors', type: 'array'},
            http: {verb: 'GET'}
        }
    );
};
