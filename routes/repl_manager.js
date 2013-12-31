var logger = require('log4js').getLogger("repl_manager"),
    net = require('net'),
    repl = require("repl");

var prompt = ">";

// TODO support error in the callback
var createServer = function (port, callback) {
    logger.info("createServer()");

    var client_socket;
    net.createServer(function(server_socket) {
        logger.info("repl server started");

        var repl_server = repl.start({
            prompt: prompt,
            input: server_socket,
            output: server_socket
        });

        repl_server.on('exit', function () {
            server_socket.end();
        });

        callback({socket: client_socket, server: repl_server})
    }).listen(port);

    client_socket = net.connect(port);
};

var getServer = function () {
    logger.info("getServer()");

    var id2server = {};
    var nextPort = 5001;
    return function (id, callback) {
        var server = id2server[id];
        if (server) {
            callback(server);
        } else {
            logger.info('create server on port: ' + nextPort);
            createServer(nextPort++, function(server_connection) {
                id2server[id] = server_connection;
                callback(server_connection);
            });
        }
    };
}();

exports.eval = function (req, res) {
    logger.info("eval()");
    if (!req.body) {
        logger.info("missing request body");
        return;
    }

    var id = req.body.id;
    var js = req.body.js;
    if (id && js) {
        logger.info("id: " + id);
        logger.debug("js: " + js);

        getServer(id, function(server_connection) {
            var socket = server_connection.socket;
            socket.once('data', function (b) {
                var result = 'undefined';
                var out = b.toString().split(prompt);
                for (var i = out.length - 1; i >= 0; i--) {
                    result = out[i].trim().replace(/^(\.\.+\s+)+/, "");
                    if (result.length > 0) {
                        break;
                    }
                }
                logger.debug('result: ' + result);
                res.send(result);
            });
            socket.write(js.trim() + '\n' + '.break\n');
        });
    }
};

exports.autocomplete = function (req, res) {
    logger.info("autocomplete()");
    if (!req.body) {
        logger.info("missing request body");
        return;
    }

    var id = req.body.id;
    var s = req.body.string;
    if (id && s) {
        logger.info("id: " + id);
        logger.debug("s: " + s);

        getServer(id, function(server_connection) {
            var server = server_connection.server;
            var complete = repl.REPLServer.prototype.complete;
            complete.apply(server, [s, function(err, completions) {
                if (err) {
                    throw err;
                }
                //var completions = flatten(completions);
                if (completions.length >= 2) {
                    // The last suggestion is the original token text,
                    // we will use it to filter out auto-completion prefixes.
                    var head = completions[0];
                    var tail = completions[1];

                    var result = head.filter(function(item) {
                        return item.length > 0;
                    }).map(function(item) {
                       if (item.indexOf(tail) === 0) {
                           return item.substring(tail.length);
                       }
                       return item;
                    });
                    res.send(result);
                } else {
                    res.send(completions);
                }
            }]);
        });
    }
};