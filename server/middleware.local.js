var files = {};
//Don't run client file on the remote downtime confirmation server
if (!process.env.IS_REMOTE) {
    files = {
        "loopback#static": {
            "params": "$!../client"
        }
    };
}

module.exports = {
    "files": files
};
