/**
 * @TODO only allow owner to read
 * @param MonitorPing
 */
var remoteWhitelist = require(__dirname + '/remoteWhitelist');
module.exports = function (MonitorPing) {
    remoteWhitelist(MonitorPing, ['find']);
};
