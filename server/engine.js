

module.exports.start = function (app) {

    //var Monitor = require();
    var request = require('request');

    /**
     * @todo performance hangup after response header and before body is transferred
     * @param monitor
     */
    function pingMonitor(monitor) {
        var pingData = {date: Date.now()};
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
            app.models.MonitorPing.create(pingData);
            console.log(pingData);

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
        monitorEvent.create({
            date: Date.now(),
            type: newUp ? 'u' : 'd',
            reason: reason
        })
    }

    /**
     * @todo performance pull from db in separate spot instead of every second
     * @param startSecond
     */
    function pingMonitors(startSecond) {
        console.log(app.models);
        app.models.Monitor.find(
            {where: {startSecond: startSecond, status: ''}},
            function (err, monitors) {
                for (var i = 0, len = monitors.length; i < len; i++) {
                    pingMonitor(monitors[i]);
                }
            }
        );
    }

    var second = 0;
    setTimeout(function () {
        second++;
        pingMonitors(second)
    }, 1);
};
