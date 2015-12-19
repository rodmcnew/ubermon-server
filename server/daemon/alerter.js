/**
 * @todo delete pings older than 24 hours in "cleaner.js"
 * @todo confirm detected downs from another server
 * @param app
 * @param debug
 */
module.exports.start = function (app) {
    var MonitorEvent = app.models.MonitorEvent;
    var Contact = app.models.Contact;
    var Email = app.models.Email;
    var nodemailer = require('nodemailer');

    /**
     *
     * @param event
     */
    function sendAlert(event) {
        var monitor = event.toJSON().monitor;
        var statusWord = monitor.up ? 'up' : 'down';
        event.alertSent = true;
        event.save();
        Contact.find({where: {id: {inq: monitor.contactIds}}}, function (err, contacts) {
            if (err) {
                console.error(err);
            }
            for (var i = 0, len = contacts.length; i < len; i++) {
                Email.send({
                    from: 'Ubermon <' + process.env.FROM_EMAIL + '>',
                    to: contacts[i].email, // list of receivers
                    subject: monitor.name + ' is ' + statusWord + '.', // Subject line
                    html: monitor.name + ' is ' + statusWord + '.<br><br>Login at <a href="http:/www.Ubermon.com">ubermon.com</a> to change your notification settings.',
                    text: monitor.name + ' is ' + statusWord
                }, function (err) {
                    if (err) {
                        console.error(err);
                    }
                });
            }
        });
    }

    function sendAlerts() {
        MonitorEvent.find(
            {where: {alertSent: false}, include: {monitor: 'user'}},
            function (err, events) {
                //console.log(events);
                if (err) {
                    console.error(err);
                }
                if (!events) {
                    return;
                }
                for (var i = 0, len = events.length; i < len; i++) {
                    sendAlert(events[i]);
                }
            }
        );
    }

    setInterval(
        sendAlerts,
        1000
    );
};
