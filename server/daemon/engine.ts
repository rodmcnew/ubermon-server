/// <reference path="../../typings/tsd.d.ts" />
/// <reference path="../../common/typing/models.d.ts" />
import request = require('request');

class Engine {
    app:any;
    minuteIntervalWhereClauses:any[] = [];
    validIntervals:number[] = [1, 2, 5, 10, 15, 20, 30, 60];

    constructor(app:any) {
        this.app = app;
    }

    pingMonitor = (monitor:IMonitor) => {
        this.app.models.Monitor.ping(monitor, (err, pingData:IMonitorPing) => {
            if (err) {
                console.error(err);
            }
            this.handlePingResponse(monitor, pingData);
        }, true);
    };

    handlePingResponse(monitor:IMonitor, pingData:IMonitorPing) {
        //Double check downs with remote pinger but do not double check ups
        if (monitor.up !== pingData.up) {
            if (!pingData.up) {
                var monitorWithKey = JSON.parse(JSON.stringify(monitor));
                monitorWithKey.remoteKey = process.env.UBERMON_REMOTE_KEY;//@TODO find better way
                var reqOptions = {
                    method: 'POST',
                    url: 'http://remote1.ubermon.com/api/Monitors/ping',//@TODO read this from somewhere else
                    json: monitorWithKey
                };
                request(reqOptions, (err, res, body) => {
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
                        this.handleChange(monitor, pingData);
                    }
                });
            } else {
                this.handleChange(monitor, pingData);
            }
        }

        ///**
        // * @todo performance write these in batches more slowly?
        // */
        this.app.models.MonitorPing.create(pingData);
    }

    handleChange(monitor:IMonitor, pingData:IMonitorPing) {
        /**
         * @todo performance write these in batches more slowly?
         */
        var justStarted = monitor.up === null;
        monitor.up = pingData.up;
        monitor.save();//@TODO stop passing whole monitor back and forth with db
        var eventData = {
            monitorId: monitor.id,
            date: Date.now(),
            type: pingData.up ? 'u' : 'd',
            reason: pingData.reason,
            alertSent: justStarted //Don't alert on just-started monitors.
        };

        this.app.models.MonitorEvent.create(eventData, (err) => {
            if (err) {
                console.error(err);
            }
        })
    }

    pingMonitors(startMinute:number, startSecond:number) {
        //console.log(startMinute, startSecond);
        var where = {
            and: [
                {enabled: true},
                {startSecond: startSecond},
                {or: this.minuteIntervalWhereClauses[startMinute]}
            ]
        };
        this.app.models.Monitor.find(
            {where: where},
            (err, monitors:IMonitor[]) => {
                if (err) {
                    console.error(err);
                }
                if (!monitors) {
                    return;
                }
                for (var i = 0, len = monitors.length; i < len; i++) {
                    this.pingMonitor(monitors[i]);
                }
            }
        );
    }

    /**
     * Build the where conditions for each minute and interval to make querying easier at runtime.
     *
     * WARNING: Intervals that are not factors of 60 are not supported
     */
    preCacheWhereConditions() {
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
                    startMinutes.sort((a, b) => {
                        return a - b;
                    });
                    intervalCases.push({interval: interval, startMinute: {inq: startMinutes}})
                } else {
                    intervalCases.push({interval: 1});
                }
            }
            this.minuteIntervalWhereClauses.push(intervalCases);
        }
    }

    start() {
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
        setInterval(
            () => {
                var now = new Date();
                self.pingMonitors(now.getMinutes(), now.getSeconds())
            },
            1000
        );
    }
}

/**
 * @TODO get this out of here. its not part of the engine class
 * @param app
 */
module.exports.start = (app) => {
    var engine = new Engine(app);
    engine.start();
};

