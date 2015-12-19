module.exports = {
    "email": {
        "transports": [{
            "type": "smtp",
            "host": "smtp.gmail.com",
            "secure": false,
            "port": 587,
            "tls": {
                "rejectUnauthorized": false
            },
            "auth": {
                "user": process.env.EMAIL,
                "pass": process.env.EMAIL_PASSWORD
            }
        }]
    }
};
