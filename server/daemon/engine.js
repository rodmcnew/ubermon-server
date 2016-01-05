/// <reference path="../../typings/tsd.d.ts" />
/// <reference path="../../common/typing/models.d.ts" />
var request = require('request');
var Engine = (function () {
    function Engine(app) {
        this.minuteIntervalWhereClauses = [];
        this.validIntervals = [1, 2, 5, 10, 15, 20, 30, 60];
        this.app = app;
    }
    Engine.prototype.pingMonitor = function (monitor) {
        var _this = this;
        this.app.models.Monitor.ping(monitor, function (err, pingData) {
            if (err) {
                console.error(err);
            }
            _this.handlePingResponse(monitor, pingData);
        }, true);
    };
    Engine.prototype.handlePingResponse = function (monitor, pingData) {
        var _this = this;
        //Double check downs with remote pinger but do not double check ups
        if (monitor.up !== pingData.up) {
            if (!pingData.up) {
                var monitorWithKey = JSON.parse(JSON.stringify(monitor));
                monitorWithKey.remoteKey = process.env.UBERMON_REMOTE_KEY; //@TODO find better way
                var reqOptions = {
                    method: 'POST',
                    url: 'http://remote1.ubermon.com/api/Monitors/ping',
                    json: monitorWithKey
                };
                request(reqOptions, function (err, res, body) {
                    if (err) {
                        console.error(err);
                        return;
                    }
                    pingData = body.pingData;
                    if (!body.pingData) {
                        console.error('No pingdata found in body:', body);
                        return;
                    }
                    if (!pingData.up) {
                        _this.handleChange(monitor, pingData);
                    }
                });
            }
            else {
                this.handleChange(monitor, pingData);
            }
        }
        ///**
        // * @todo performance write these in batches more slowly?
        // */
        this.app.models.MonitorPing.create(pingData);
    };
    Engine.prototype.handleChange = function (monitor, pingData) {
        /**
         * @todo performance write these in batches more slowly?
         */
        var justStarted = monitor.up === null;
        monitor.up = pingData.up;
        monitor.save(); //@TODO stop passing whole monitor back and forth with db
        var eventData = {
            monitorId: monitor.id,
            date: Date.now(),
            type: pingData.up ? 'u' : 'd',
            reason: pingData.reason,
            alertSent: justStarted //Don't alert on just-started monitors.
        };
        this.app.models.MonitorEvent.create(eventData, function (err) {
            if (err) {
                console.error(err);
            }
        });
    };
    Engine.prototype.pingMonitors = function (startMinute, startSecond) {
        var _this = this;
        //console.log(startMinute, startSecond);
        var where = {
            and: [
                { enabled: true },
                { startSecond: startSecond },
                { or: this.minuteIntervalWhereClauses[startMinute] }
            ]
        };
        this.app.models.Monitor.find({ where: where }, function (err, monitors) {
            if (err) {
                console.error(err);
            }
            if (!monitors) {
                return;
            }
            for (var i = 0, len = monitors.length; i < len; i++) {
                _this.pingMonitor(monitors[i]);
            }
        });
    };
    /**
     * Build the where conditions for each minute and interval to make querying easier at runtime.
     *
     * WARNING: Intervals that are not factors of 60 are not supported
     */
    Engine.prototype.preCacheWhereConditions = function () {
        for (var minute = 0; minute < 60; minute++) {
            var intervalCases = [];
            for (var intervalIndex = 0, len = this.validIntervals.length; intervalIndex < len; intervalIndex++) {
                var interval = this.validIntervals[intervalIndex];
                if (interval != 1) {
                    var intervalPerHour = 60 / interval;
                    var startMinutes = [];
                    for (var i = 0; i < intervalPerHour; i++) {
                        startMinutes.push((i * interval + minute) % 60);
                    }
                    startMinutes.sort(function (a, b) {
                        return a - b;
                    });
                    intervalCases.push({ interval: interval, startMinute: { inq: startMinutes } });
                }
                else {
                    intervalCases.push({ interval: 1 });
                }
            }
            this.minuteIntervalWhereClauses.push(intervalCases);
        }
    };
    Engine.prototype.start = function () {
        /**
         * @todo delete pings older than 24 hours in "cleaner.js"
         * @todo confirm detected downs from another server
         * @param app
         */
        this.preCacheWhereConditions();
        var self = this;
        /**
         * @TODO check for skipped seconds and email admin of load issue
         */
        setInterval(function () {
            var now = new Date();
            self.pingMonitors(now.getMinutes(), now.getSeconds());
        }, 1000);
    };
    return Engine;
})();
/**
 * @TODO get this out of here. its not part of the engine class
 * @param app
 */
module.exports.start = function (app) {
    var engine = new Engine(app);
    engine.start();
};
//# sourceMappingURL=engine.js.map