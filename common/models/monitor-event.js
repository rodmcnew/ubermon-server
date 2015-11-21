/**
 * @TODO only allow owner to read
 * @param MonitorEvent
 */
var remoteWhitelist = require(__dirname + '/remoteWhitelist');
module.exports = function (MonitorEvent) {
    remoteWhitelist(MonitorEvent, ['find']);
};
