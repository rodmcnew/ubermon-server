var loopbackStaticParams = "$!../client";

//Don't run a client web root remote downtime confirmation server
if (process.env.IS_REMOTE) {
    loopbackStaticParams = "$!../client/remote";
}

module.exports = {
    "files": {
        "loopback#static": {
            "params": loopbackStaticParams
        }
    }
};
