module.exports = {
    //"db": {
    //    "name": "db",
    //    "connector": "memory",
    //    "file": "db.json"
    //},
    "db": {
        "name": "mydb",
        "connector": "mysql",
        //"database":"ubermon",
        //"host": "127.0.0.1",
        //"username":"root",
        //"password:":""
        "host": process.env.MYSQL_HOST,
        "database":process.env.MYSQL_DB,
        "username":process.env.MYSQL_USER,
        "password:":process.env.MYSQL_PASS
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
