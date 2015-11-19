/**
 * @TODO add keyword, ping, and port monitor types
 * @todo validate user emails
 * @todo combine monitors for the same URL if 2 users request the same url to lower DDOS chances? (still need more DDOS protection for differ parameters in same url)
 * @todo add "started" event when monitor starts and ping it imedietly.
 * @par min
 * @param max
 * @returns {*}
 */
var request = require('request');
/**
 * @TODO validate interval > 0
 * @param Monitor
 */
module.exports = function (Monitor) {
    Monitor.beforeRemote('create', function (context, user, next) {
        var req = context.req;
        req.body.modifiedDate = Date.now();
        req.body.userId = req.accessToken.userId;
        var startTime = new Date();
        startTime.setSeconds(startTime.getSeconds() + 5);// Ensure monitor starts in 5 seconds
        req.body.startSecond = startTime.getSeconds();
        req.body.up = null;
        req.body.type = 'h';
        next();
    });

    Monitor.beforeRemote('prototype.updateAttributes', function (context, user, next) {
        var req = context.req;
        req.body.modifiedDate = Date.now();
        //Do not allow these values to be changed
        delete(req.body.userId);
        delete(req.body.startSecond);
        delete(req.body.up);
        delete(req.body.type);
        next();
    });

    Monitor.listMine = function (req, cb) {
        Monitor.find(
            {where: {userId: req.accessToken.userId}},
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
            accepts: {arg: 'req', type: 'object', http: {source: 'req'}},
            returns: {arg: 'monitors', type: 'array'},
            http: {verb: 'GET'}
        }
    );

    Monitor.ping = function (monitor, cb) {
        var pingData = {
            monitorId: monitor.id,
            date: Date.now()
        };
        var reqOptions = {
            method: 'HEAD',
            url: monitor.url,
            headers: {
                'User-Agent': 'Ubermon'
            }
        };
        request(reqOptions, function (err, res) {
            if (err) {
                pingData.up = false;
                pingData.reason = err.code;
            } else {
                pingData.up = res.statusCode == 200;
                pingData.reason = 'Returned ' + res.statusCode;
            }

            if (pingData.up) {
                pingData.latency = Date.now() - pingData.date;
            } else {
                pingData.latency = 0;
            }
            cb(pingData);
        });
    };

    /**
     * @TODO add ACL to only allow machines to call this.
     */
    Monitor.remoteMethod(
        'ping',
        {
            accepts: {arg: 'monitor', type: 'object', http: {source: 'body'}},
            returns: {arg: 'pingData', type: 'object'},
            http: {verb: 'POST'}
        }
    );
};
