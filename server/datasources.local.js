module.exports = {
    "db": {
        "name": "db",
        "connector": "memory",
        "file": "db.json"
    },
    "smtp": {
        "name": "smtp",
        "connector": "mail",
        "transports": [{
            "type": "smtp",
            "host": process.env.SMTP_HOST,
            "secure": false,
            "port": 587,
            "tls": {
                "rejectUnauthorized": false
            },
            "auth": {
                "user": process.env.SMTP_USER,
                "pass": process.env.SMTP_PASS
            }
        }]
    }
};
