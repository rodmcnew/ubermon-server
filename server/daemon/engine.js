/**
 * @todo delete pings older than 24 hours in "cleaner.js"
 * @todo confirm detected downs from another server
 * @param app
 * @param debug
 */
var request = require('request');
module.exports.start = function (app) {
    var Monitor = app.models.Monitor;
    var MonitorEvent = app.models.MonitorEvent;
    var MonitorPing = app.models.MonitorPing;
    var minuteConditions = {};
    var validIntervals = [1, 2, 5, 10, 15, 20, 30, 60];

    function handleChange(monitor, pingData) {
        /**
         * @todo performance write these in batches more slowly?
         */
        var ignoreAlert = monitor.up === null;
        monitor.up = pingData.up;
        monitor.save();
        var eventData = {
            monitorId: monitor.id,
            date: Date.now(),
            type: pingData.up ? 'u' : 'd',
            reason: pingData.reason,
            alertSent: ignoreAlert //Don't alert on just-started monitors.
        };

        MonitorEvent.create(eventData, function (err) {
            if (err) {
                console.error(err);
            }
        })
    }

    /**
     * @todo performance hangup after response header and before body is transferred
     */
    function handlePingResponse(monitor, pingData) {
        //Double check downs with remote pinger but do not double check ups
        if (monitor.up !== pingData.up) {
            if (!pingData.up) {
                var reqOptions = {
                    method: 'POST',
                    url: 'http://remote1.ubermon.com/api/Monitors/ping',//@TODO read this from somewhere else
                    json: monitor
                };
                request(reqOptions, function (err, res) {
                    if (err) {
                        console.error(err);
                    }
                    pingData = res.body.pingData;
                    if (!pingData.up) {
                        handleChange(monitor, pingData);
                    }
                });
            } else {
                handleChange(monitor, pingData);
            }
        }

        ///**
        // * @todo performance write these in batches more slowly?
        // */
        MonitorPing.create(pingData);
    }

    function pingMonitor(monitor) {
        //console.log('-------------------pinging ' + monitor.url);
        Monitor.ping(monitor, function (err, pingData) {
            if (err) {
                console.error(err);
            }
            handlePingResponse(monitor, pingData);
        });
    }

    /**
     * Note: This may not work with intervals that 60 is not evenly divisible by.
     *
     * @param startMinute
     * @param startSecond
     */
    function pingMonitors(startMinute, startSecond) {
        var where = {
            enabled: true,
            startSecond: startSecond,
            or: minuteConditions[startMinute]
        };
        Monitor.find(
            {where: where},
            function (err, monitors) {
                if (err) {
                    console.error(err);
                }
                if (!monitors) {
                    return;
                }
                for (var i = 0, len = monitors.length; i < len; i++) {
                    pingMonitor(monitors[i]);
                }
            }
        );
    }

    /**
     * Build the where conditions for each minute and interval.
     *
     * WARNING: Intervals that are not factors of 60 are not supported
     */
    function preCacheWhereConditions() {
        for (var minute = 0; minute < 60; minute++) {
            var intervalCases = [];
            for (var intervalIndex = 0, len = validIntervals.length; intervalIndex < len; intervalIndex++) {
                var interval = validIntervals[intervalIndex];
                if (interval != 1) {
                    var intervalPerHour = 60 / interval;
                    var startMinutes = [];
                    for (var i = 0; i < intervalPerHour; i++) {
                        startMinutes.push((i * interval + minute) % 60);
                    }
                    startMinutes.sort(function sortNumber(a, b) {
                        return a - b;
                    });
                    intervalCases.push({interval: interval, startMinute: {inq: startMinutes}})
                } else {
                    intervalCases.push({interval: 1});
                }
            }
            minuteConditions[minute] = intervalCases;
        }
    }

    preCacheWhereConditions();

    /**
     * @TODO check for skipped seconds and email admin of load issue
     */
    setInterval(
        function () {
            var now = new Date();
            pingMonitors(now.getMinutes(), now.getSeconds())
        },
        1000
    );
}
;
