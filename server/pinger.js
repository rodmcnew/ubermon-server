/**
 * @todo delete pings older than 24 hours
 * @todo confirm detected downs from another server
 * @param app
 * @param debug
 */
module.exports.start = function (app, debug) {
    var request = require('request');
    var Monitor = app.models.Monitor;
    var MonitorEvent = app.models.MonitorEvent;
    var MonitorPing = app.models.MonitorPing;

    /**
     * @todo performance hangup after response header and before body is transferred
     * @param monitor
     */
    function pingMonitor(monitor) {
        var pingData = {
            monitorId: monitor.id,
            date: Date.now()
        };
        request(monitor.url, function (err, res, body) {
            pingData.latency = Date.now() - pingData.date;
            if (err) {
                pingData.up = false;
                pingData.reason = err.code;
            } else {
                pingData.up = res.statusCode == 200;
                pingData.reason = 'Returned ' + res.statusCode;
            }

            //if (debug) {
            //    console.log(
            //        'ping',
            //        monitor.url,
            //        pingData.reason,
            //        '(' + pingData.latency + 'ms' + ')'
            //    );
            //}

            ///**
            // * @todo performance write these in batches more slowly?
            // */
            //MonitorPing.create(pingData);

            if (monitor.up !== pingData.up) {
                /**
                 * @todo performance write these in batches more slowly?
                 */
                monitor.up = pingData.up;
                monitor.save();
                var eventData = {
                    monitorId: monitor.id,
                    date: Date.now(),
                    type: pingData.up ? 'u' : 'd',
                    reason: pingData.reason
                };

                //console.log('MonitorEvent.create', eventData);
                MonitorEvent.create(eventData)
            }
        });
    }

    /**
     * @todo performance pull from db in separate spot instead of every second
     * @param intraminuteOffset
     */
    function pingMonitors(intraminuteOffset) {
        Monitor.find(
            {where: {intraminuteOffset: intraminuteOffset, enabled: true}},
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

    var intraminuteOffset = 0;
    var minute = 0;
    setInterval(
        function () {
            intraminuteOffset++;
            if (intraminuteOffset == 20) {
                intraminuteOffset = 0;
                minute++;
            }
            pingMonitors(intraminuteOffset, minute)
        },
        debug ? 300 : 3000 //Debug mode runs 10x faster
    );
};
