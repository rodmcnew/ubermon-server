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
        Monitor.ping(monitor, function (err, pingData) {
            if (err) {
                console.error(err);
            }
            handlePingResponse(monitor, pingData);
        });
    }

    /**
     * @todo performance pull from db in separate spot instead of every second
     * @param startSecond
     */
    function pingMonitors(startSecond) {
        Monitor.find(
            {where: {startSecond: startSecond, enabled: true}},
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

    var startSecond = 0;
    var minute = 0;
    setInterval(
        function () {
            startSecond++;
            if (startSecond == 60) {
                startSecond = 0;
                minute++;
            }
            pingMonitors(startSecond, minute)
        },
        100
    );
}
;
