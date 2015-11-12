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
        request(monitor.url, function (error, response, body) {
            pingData.latency = Date.now() - pingData.date;
            var reason = 'OK (200)';
            pingData.up = true;
            if (error || response.statusCode != 200) {
                pingData.up = false;
                reason = "Unknown";
            }

            /**
             * @todo performance write these in batches more slowly?
             */
            MonitorPing.create(pingData);
            console.log('MonitorPing.create', pingData);

            if (monitor.up != pingData.up) {
                changeMonitorUp(monitor, pingData.up, reason)
            }
        });
    }

    function changeMonitorUp(monitor, newUp, reason) {
        /**
         * @todo performance write these in batches more slowly?
         */
        monitor.up = newUp;
        monitor.save();
        var eventData = {
            monitorId: monitor.id,
            date: Date.now(),
            type: newUp ? 'u' : 'd',
            reason: reason
        };

        console.log('MonitorEvent.create', eventData);
        MonitorEvent.create(eventData)
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

    var second = 0;
    setInterval(function () {
            second++;
            if (second == 60) {
                second = 0;
            }
            pingMonitors(second)
        },
        debug ? 20 : 1000);
}
;
