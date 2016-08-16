module.exports.start = function (app) {
    var MonitorEvent = app.models.MonitorEvent;
    var MonitorPing = app.models.MonitorPing;

    function clean() {
        var yesterday = new Date(new Date().getTime() - (24 * 60 * 60 * 1000));
        MonitorPing.destroyAll({date: {lt: yesterday}}, function (err, a) {
            console.log(a);
            if (err) {
                console.error(err);
            }
        });
        /**
         * @TODO re-enable this after fixing the problem where the UI breaks if all events
         * are delted.
         * Maybe do not event the most recent event?
         */
        //var twoMonthsAgo = new Date(new Date().getTime() - (24 * 60 * 60 * 1000 * 62));
        //MonitorEvent.destroyAll({date: {lt: twoMonthsAgo}}, function (err) {
        //    if (err) {
        //        console.error(err);
        //    }
        //});
    }

    setInterval(
        clean,
        1000 * 60 * 60 //Hourly
    );
};
