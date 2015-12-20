var db = {
    "name": "mydb",
    "connector": "mysql",
    "host": process.env.MYSQL_HOST,
    "database": process.env.MYSQL_DB,
    "username": process.env.MYSQL_USER,
    "password": process.env.MYSQL_PASS,
    "connectionLimit": 5
};

//The remote downtime confirmation server shouldn't be talking to the real DB
if (process.env.IS_REMOTE) {
    db = {
        "name": "db",
        "connector": "memory",
        "file": "db.json"
    }
}

module.exports = {
    "db": db,
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
