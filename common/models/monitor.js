/**
 * @todo add "started" event when monitor starts and ping it imedietly.
 * @TODO ensure owner cannot be changed away to another owner
 * @par min
 * @param max
 * @returns {*}
 */
var request = require('request');
/**
 * @TODO validate interval in valid interval array
 * @TODO validate validate type in valid type array
 * @param Monitor
 */
var monitorIntervals = {
    '1': 'Every minute (advanced)',
    '2': 'Every 2 minutes (advanced)',
    '5': 'Every 5 minutes',
    '10': 'Every 10 minutes',
    '15': 'Every 15 minutes',
    '20': 'Every 20 minutes',
    '30': 'Every 30 minutes',
    '60': 'Every 60 minutes'
};
var monitorTypes = {
    'h': 'HTTP(s)',
    'p': 'Ping',
    'o': 'Port',
    'k': 'Keyword (advanced)'
};
var validIntervals = Object.keys(monitorIntervals);
validIntervals = validIntervals.map(function (x) {
    return parseInt(x, 10);
});
var validTypes = Object.keys(monitorTypes);

module.exports = function (Monitor) {
    //Monitor.validatesFormatOf('url', {with: /\w+/, message: 'Invalid URL'});
    Monitor.validatesInclusionOf('type', {
        in: validTypes, message: 'Invalid type'
    });
    Monitor.validatesInclusionOf('interval', {
        in: validIntervals, message: 'Invalid interval'
    });

    Monitor.beforeRemote('create', function (context, user, next) {
        var req = context.req;
        req.body.modifiedDate = Date.now();
        req.body.userId = req.accessToken.userId;
        var startTime = new Date();
        startTime.setSeconds(startTime.getSeconds() + 5);// Ensure monitor starts in 5 seconds
        req.body.startSecond = startTime.getSeconds();
        req.body.startMinute = startTime.getMinutes();
        req.body.up = null;
        next();
    });

    Monitor.beforeRemote('prototype.updateAttributes', function (context, user, next) {
        var req = context.req;
        req.body.modifiedDate = Date.now();
        //Do not allow these values to be changed
        delete(req.body.userId);
        delete(req.body.startSecond);
        delete(req.body.startMinute);
        delete(req.body.up);
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
            cb(null, pingData);
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
