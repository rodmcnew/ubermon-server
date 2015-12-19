/**
 * @todo add "started" event when monitor starts and ping it imedietly.
 * @TODO ensure owner cannot be changed away to another owner
 * @par min
 * @param max
 * @returns {*}
 */
var request = require('request');
var remoteWhitelist = require(__dirname + '/remoteWhitelist');
var validUrl = require('valid-url');
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
var app = require('../../server/server');

module.exports = function (Monitor) {
    remoteWhitelist(Monitor, ['create', 'updateAttributes', 'deleteById']);

    //Monitor.validatesFormatOf('url', {with: /\w+/, message: 'Invalid URL'});
    Monitor.validatesInclusionOf('type', {
        in: validTypes, message: 'Invalid type'
    });
    Monitor.validatesInclusionOf('interval', {
        in: validIntervals, message: 'Invalid interval'
    });

    Monitor.validate('isAdvanced', function (err) {
        if (isAdvanced(this) && !this.isAdvanced) {
            err();
        }
    }, {message: 'Using advanced features but not marked as advanced'});

    Monitor.validate('isAdvanced', function (err) {
        if (!isAdvanced(this) && this.isAdvanced) {
            err();
        }
    }, {message: 'Marked as advanced but not using advanced features.'});

    Monitor.validate('url', function (err) {
        if (!validUrl.isWebUri(this.url)) {
            err();
        }
    }, {message: 'Invalid URL.'});

    function validateMonitorCount(monitor, addingCount, addingAdvancedCount, cb) {
        getProfile(
            monitor,
            function (profile) {
                Monitor.count(
                    {userId: monitor.userId},
                    function (err, count) {
                        if (err) {
                            console.error(err);
                        }
                        if (count + addingCount > profile.maxMonitors) {
                            cb('Max monitors exceeded.');
                        } else if (monitor.isAdvanced) {
                            Monitor.count(
                                {userId: monitor.userId, isAdvanced: monitor.isAdvanced},
                                function (err, count) {
                                    if (err) {
                                        console.error(err);
                                    }
                                    if (count + addingAdvancedCount > profile.maxAdvancedMonitors) {
                                        cb('Max advanced monitors exceeded.');
                                    }
                                    cb();
                                }
                            );
                        } else {
                            cb();
                        }
                    }
                );
            }
        )
    }

    Monitor.observe('before save', function updateTimestamp(ctx, next) {
        var addingCount;
        var addingAdvancedCount;
        var monitor;
        if (ctx.instance) {
            //Adding new monitor
            addingCount = 1;
            if (ctx.instance.isAdvanced) {
                addingAdvancedCount = 1;
            }
            monitor = ctx.instance;
        } else {
            //Already exists
            addingCount = 0;
            if (!ctx.currentInstance.isAdvanced && ctx.data.isAdvanced) {
                addingAdvancedCount = 1
            } else {
                addingAdvancedCount = 0;
            }
            monitor = ctx.data;
            if (ctx.currentInstance.advanced = ctx.data.advanced) {
                /**
                 * Don't do the db-intensive monitor count check
                 * when the pinger engine saves monitor status
                 */
                next();
                return;
            }
        }
        validateMonitorCount(monitor, addingCount, addingAdvancedCount, function (err) {
            if (err) {
                var res = new Error(err);
                res.statusCode = 400;
                next(res);
            } else {
                next();
            }
        });
    });

    function getProfile(monitor, cb) {
        app.models.Profile.findOne({userId: monitor.userId}, function (err, profile) {
            if (err) {
                console.error(err)
            }
            cb(profile);
        });
    }

    function isAdvanced(monitor) {
        return monitor.interval < 5 || monitor.type != 'h';
    }

    Monitor.beforeRemote('create', function (context, user, next) {
        var body = context.req.body;
        body.modifiedDate = Date.now();
        body.userId = context.req.accessToken.userId;
        var startTime = new Date();
        startTime.setSeconds(startTime.getSeconds() + 2);// Ensure monitor starts in 2 seconds
        body.startSecond = startTime.getSeconds();
        body.startMinute = startTime.getMinutes();
        body.up = null;
        body.isAdvanced = isAdvanced(body);//Could make the client do this instead

        next();
    });

    Monitor.beforeRemote('prototype.updateAttributes', function (context, user, next) {
        var body = context.req.body;
        body.modifiedDate = Date.now();
        //Do not allow these values to be changed
        //@TODO move to 'before save' 'un-modify-able white list' for better security
        delete(body.userId);
        delete(body.startSecond);
        delete(body.startMinute);
        delete(body.up);
        body.isAdvanced = isAdvanced(body);//Could make the client do this instead
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
            http: {verb: 'GET'},
            description: 'List all that are owned by the current user.'
        }
    );

    Monitor.ping = function (monitor, cb) {
        //@TODO use loopback auth and ACL instead of making up remote key like this
        if (monitor.remoteKey != process.env.UBERMON_REMOTE_KEY) {
            cb(null, {'error': 'Invalid key'});
            return;
        }

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
                if (!err.code) {
                    console.error(err);
                }
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
            accepts: [
                {arg: 'monitor', type: 'object', http: {source: 'body'}}
            ],
            returns: {arg: 'pingData', type: 'object'},
            http: {verb: 'POST'},
            description: 'Ping the monitor.'
        }
    );
};
